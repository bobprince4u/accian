"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTestimonial = exports.updateTestimonial = exports.createTestimonial = exports.getTestimonialById = exports.getAllTestimonials = void 0;
const database_1 = require("../config/database");
const sqlUpdate_1 = require("../utils/sqlUpdate");
const requestFields_1 = require("../utils/requestFields");
const serializers_1 = require("../utils/serializers");
/** Translate request-DTO failures into 400s; anything else is a real error. */
const handleRequestDtoError = (error, res, next) => {
    if (error instanceof sqlUpdate_1.UnknownUpdateFieldError) {
        res.status(400).json({
            success: false,
            message: "Unknown field(s) in request body",
            fields: error.fields,
        });
        return;
    }
    if (error instanceof sqlUpdate_1.NoUpdateFieldsError) {
        res.status(400).json({ success: false, message: "No fields to update" });
        return;
    }
    next(error);
};
const validateRating = (value) => {
    if (value === undefined || value === null || value === "")
        return null;
    const rating = Number(value);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
        return "Rating must be between 1 and 5";
    }
    return null;
};
const getAllTestimonials = async (req, res, next) => {
    try {
        const { featured, limit = "10", page = "1", } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        console.log("📂 Fetching testimonials:", { featured, limit, page });
        let queryText = `
            SELECT 
                t.id, t.client_name, t.client_position, t.client_company,
                t.testimonial_text, t.rating, t.featured, t.image_url,
                t.created_at, t.project_id,
                p.title as project_title, p.slug as project_slug
            FROM testimonials t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.published = true
        `;
        const queryParams = [];
        if (featured === "true") {
            queryText += " AND t.featured = true";
        }
        queryText += ` ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`;
        queryParams.push(parseInt(limit), offset);
        const result = await (0, database_1.query)(queryText, queryParams);
        let countQuery = "SELECT COUNT(*) FROM testimonials WHERE published = true";
        if (featured === "true") {
            countQuery += " AND featured = true";
        }
        const countResult = await (0, database_1.query)(countQuery);
        const total = parseInt(countResult.rows[0].count);
        res.json({
            success: true,
            data: result.rows.map((testimonial) => ({
                id: testimonial.id,
                clientName: testimonial.client_name,
                clientPosition: testimonial.client_position,
                clientCompany: testimonial.client_company,
                testimonialText: testimonial.testimonial_text,
                rating: testimonial.rating,
                featured: testimonial.featured,
                imageUrl: testimonial.image_url,
                project: testimonial.project_id
                    ? {
                        id: testimonial.project_id,
                        title: testimonial.project_title,
                        slug: testimonial.project_slug,
                    }
                    : null,
                createdAt: testimonial.created_at,
            })),
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        console.error("❌ Get testimonials error:", error);
        next(error);
    }
};
exports.getAllTestimonials = getAllTestimonials;
const getTestimonialById = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("📂 Fetching testimonial by ID:", id);
        const result = await (0, database_1.query)(`
            SELECT 
                t.id, t.client_name, t.client_position, t.client_company,
                t.testimonial_text, t.rating, t.featured, t.image_url,
                t.created_at, t.project_id,
                p.title as project_title, p.slug as project_slug
            FROM testimonials t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = $1 AND t.published = true
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }
        const testimonial = result.rows[0];
        res.json({
            success: true,
            data: {
                id: testimonial.id,
                clientName: testimonial.client_name,
                clientPosition: testimonial.client_position,
                clientCompany: testimonial.client_company,
                testimonialText: testimonial.testimonial_text,
                rating: testimonial.rating,
                featured: testimonial.featured,
                imageUrl: testimonial.image_url,
                project: testimonial.project_id
                    ? {
                        id: testimonial.project_id,
                        title: testimonial.project_title,
                        slug: testimonial.project_slug,
                    }
                    : null,
                createdAt: testimonial.created_at,
            },
        });
    }
    catch (error) {
        console.error("❌ Get testimonial by ID error:", error);
        next(error);
    }
};
exports.getTestimonialById = getTestimonialById;
/**
 * Create testimonial (Admin)
 * POST /api/admin/testimonials
 *
 * The admin form submits `{name, position, company, message, ...}` but this
 * handler only destructured `{clientName, testimonialText, ...}`, so every
 * valid submission failed the required-field check and returned 400. Both
 * vocabularies are now accepted through one allowlist, which is the same one
 * `updateTestimonial` uses.
 */
const createTestimonial = async (req, res, next) => {
    try {
        const payload = (0, requestFields_1.omitFields)(req.body, requestFields_1.TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED);
        const name = (0, requestFields_1.readField)(payload, "name", "clientName");
        const message = (0, requestFields_1.readField)(payload, "message", "testimonialText");
        if (!name || !message) {
            return res.status(400).json({
                success: false,
                message: "Client name and testimonial text are required",
            });
        }
        const ratingError = validateRating((0, requestFields_1.readField)(payload, "rating") ?? undefined);
        if (ratingError) {
            return res.status(400).json({ success: false, message: ratingError });
        }
        if (payload.published === undefined) {
            payload.published = true;
        }
        const { columns, values } = (0, sqlUpdate_1.buildInsert)(payload, requestFields_1.TESTIMONIAL_FIELDS);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
        const result = await (0, database_1.query)(`INSERT INTO testimonials (${columns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`, values);
        res.status(201).json({
            success: true,
            message: "Testimonial created successfully",
            data: (0, serializers_1.serializeTestimonial)(result.rows[0]),
        });
    }
    catch (error) {
        return handleRequestDtoError(error, res, next);
    }
};
exports.createTestimonial = createTestimonial;
/**
 * Update testimonial (Admin)
 * PUT /api/admin/testimonials/:id
 *
 * Previously built the SET clause from `Object.keys(req.body)`, so a caller
 * controlled the column identifiers in the SQL text.
 */
const updateTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = (0, requestFields_1.omitFields)(req.body, requestFields_1.TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED);
        const ratingError = validateRating(payload.rating);
        if (ratingError) {
            return res.status(400).json({ success: false, message: ratingError });
        }
        const { setClause, values, nextIndex } = (0, sqlUpdate_1.buildUpdate)(payload, requestFields_1.TESTIMONIAL_FIELDS);
        const result = await (0, database_1.query)(`UPDATE testimonials SET ${setClause}
       WHERE id = $${nextIndex} RETURNING *`, [...values, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }
        res.json({
            success: true,
            message: "Testimonial updated successfully",
            data: (0, serializers_1.serializeTestimonial)(result.rows[0]),
        });
    }
    catch (error) {
        return handleRequestDtoError(error, res, next);
    }
};
exports.updateTestimonial = updateTestimonial;
const deleteTestimonial = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("🗑️ Deleting (unpublishing) testimonial:", id);
        const result = await (0, database_1.query)("UPDATE testimonials SET published = false WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Testimonial not found",
            });
        }
        console.log("✅ Testimonial unpublished");
        res.json({
            success: true,
            message: "Testimonial deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Delete testimonial error:", error);
        next(error);
    }
};
exports.deleteTestimonial = deleteTestimonial;
