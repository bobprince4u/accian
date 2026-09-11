"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteService = exports.updateService = exports.createService = exports.getServiceBySlug = exports.getAllServices = void 0;
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
/**
 * Get all services
 * GET /api/services?published=true
 */
const getAllServices = async (req, res, next) => {
    try {
        const { published = "true" } = req.query;
        console.log("📂 Fetching services");
        let queryText = `
      SELECT 
        id, title, slug, icon, short_description, 
        features, order_index, published, created_at
      FROM services
    `;
        if (published === "true") {
            queryText += " WHERE published = true";
        }
        queryText += " ORDER BY order_index ASC, created_at ASC";
        const result = await (0, database_1.query)(queryText);
        res.json({
            success: true,
            data: result.rows.map((service) => ({
                id: service.id,
                title: service.title,
                slug: service.slug,
                icon: service.icon,
                shortDescription: service.short_description,
                features: service.features,
                orderIndex: service.order_index,
                published: service.published,
                createdAt: service.created_at,
            })),
            count: result.rows.length,
        });
    }
    catch (error) {
        console.error("❌ Get services error:", error);
        next(error);
    }
};
exports.getAllServices = getAllServices;
/**
 * Get single service by slug
 * GET /api/services/:slug
 */
const getServiceBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;
        console.log("📂 Fetching service by slug:", slug);
        const result = await (0, database_1.query)(`SELECT 
        id, title, slug, icon, short_description, full_description,
        features, technology_stack, process_steps, ideal_for,
        order_index, published, created_at, updated_at
      FROM services
      WHERE slug = $1 AND published = true`, [slug]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }
        const service = result.rows[0];
        res.json({
            success: true,
            data: {
                id: service.id,
                title: service.title,
                slug: service.slug,
                icon: service.icon,
                shortDescription: service.short_description,
                fullDescription: service.full_description,
                features: service.features,
                technologyStack: service.technology_stack,
                processSteps: service.process_steps,
                idealFor: service.ideal_for,
                orderIndex: service.order_index,
                createdAt: service.created_at,
                updatedAt: service.updated_at,
            },
        });
    }
    catch (error) {
        console.error("❌ Get service by slug error:", error);
        next(error);
    }
};
exports.getServiceBySlug = getServiceBySlug;
/**
 * Create service (Admin)
 * POST /api/admin/services
 */
const createService = async (req, res, next) => {
    try {
        const { title, icon, shortDescription, fullDescription, features, technologyStack, processSteps, idealFor, orderIndex, } = req.body;
        console.log("📝 Creating service:", title);
        if (!title || !shortDescription) {
            return res.status(400).json({
                success: false,
                message: "Title and short description are required",
            });
        }
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
        const result = await (0, database_1.query)(`INSERT INTO services (
        title, slug, icon, short_description, full_description,
        features, technology_stack, process_steps, ideal_for,
        order_index, published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING id, slug`, [
            title,
            slug,
            icon || null,
            shortDescription,
            fullDescription || null,
            features || [],
            technologyStack || [],
            processSteps || [],
            idealFor || [],
            orderIndex || 0,
        ]);
        console.log("✅ Service created");
        res.status(201).json({
            success: true,
            message: "Service created successfully",
            data: {
                id: result.rows[0].id,
                slug: result.rows[0].slug,
            },
        });
    }
    catch (error) {
        console.error("❌ Create service error:", error);
        next(error);
    }
};
exports.createService = createService;
/**
 * Update service (Admin)
 * PUT /api/admin/services/:id
 */
const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = (0, requestFields_1.omitFields)(req.body, requestFields_1.SERVICE_ACCEPTED_BUT_NOT_PERSISTED);
        // Column identifiers come only from the allowlist; an arbitrary field name
        // can never reach the SQL text.
        const { setClause, values, nextIndex } = (0, sqlUpdate_1.buildUpdate)(payload, requestFields_1.SERVICE_FIELDS);
        const result = await (0, database_1.query)(`UPDATE services SET ${setClause}, updated_at = $${nextIndex}
       WHERE id = $${nextIndex + 1} RETURNING *`, [...values, new Date(), id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }
        res.json({
            success: true,
            message: "Service updated successfully",
            data: (0, serializers_1.serializeService)(result.rows[0]),
        });
    }
    catch (error) {
        return handleRequestDtoError(error, res, next);
    }
};
exports.updateService = updateService;
/**
 * Delete service (Admin)
 * DELETE /api/admin/services/:id
 */
const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("🗑️ Deleting (unpublishing) service:", id);
        const result = await (0, database_1.query)("UPDATE services SET published = false WHERE id = $1 RETURNING id", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }
        console.log("✅ Service unpublished");
        res.json({
            success: true,
            message: "Service deleted successfully",
        });
    }
    catch (error) {
        console.error("❌ Delete service error:", error);
        next(error);
    }
};
exports.deleteService = deleteService;
