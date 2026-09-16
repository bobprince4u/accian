import { Request, Response, NextFunction } from "express";
import { query } from "../config/database";
import {
  buildUpdate,
  buildInsert,
  UnknownUpdateFieldError,
  NoUpdateFieldsError,
} from "../utils/sqlUpdate";
import {
  TESTIMONIAL_FIELDS,
  TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED,
  omitFields,
  readField,
} from "../utils/requestFields";
import { serializeTestimonial } from "../utils/serializers";

/** Translate request-DTO failures into 400s; anything else is a real error. */
const handleRequestDtoError = (
  error: unknown,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof UnknownUpdateFieldError) {
    res.status(400).json({
      success: false,
      message: "Unknown field(s) in request body",
      fields: error.fields,
    });
    return;
  }
  if (error instanceof NoUpdateFieldsError) {
    res.status(400).json({ success: false, message: "No fields to update" });
    return;
  }
  next(error as Error);
};

const validateRating = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") return null;
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return "Rating must be between 1 and 5";
  }
  return null;
};

export const getAllTestimonials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      featured,
      limit = "10",
      page = "1",
    } = req.query as Record<string, string>;
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

    const queryParams: (string | number | boolean)[] = [];

    if (featured === "true") {
      queryText += " AND t.featured = true";
    }

    queryText += ` ORDER BY t.created_at DESC LIMIT $1 OFFSET $2`;
    queryParams.push(parseInt(limit), offset);

    const result = await query(queryText, queryParams);

    let countQuery = "SELECT COUNT(*) FROM testimonials WHERE published = true";
    if (featured === "true") {
      countQuery += " AND featured = true";
    }
    const countResult = await query(countQuery);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows.map(serializeTestimonial),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("❌ Get testimonials error:", error);
    next(error);
  }
};

export const getTestimonialById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    console.log("📂 Fetching testimonial by ID:", id);

    const result = await query(
      `
            SELECT 
                t.id, t.client_name, t.client_position, t.client_company,
                t.testimonial_text, t.rating, t.featured, t.image_url,
                t.created_at, t.project_id,
                p.title as project_title, p.slug as project_slug
            FROM testimonials t
            LEFT JOIN projects p ON t.project_id = p.id
            WHERE t.id = $1 AND t.published = true
        `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({
      success: true,
      data: serializeTestimonial(result.rows[0]),
    });
  } catch (error) {
    console.error("❌ Get testimonial by ID error:", error);
    next(error);
  }
};

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
export const createTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = omitFields(
      req.body,
      TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED
    );

    const name = readField(payload, "name", "clientName");
    const message = readField(payload, "message", "testimonialText");

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: "Client name and testimonial text are required",
      });
    }

    const ratingError = validateRating(
      readField(payload, "rating") ?? undefined
    );
    if (ratingError) {
      return res.status(400).json({ success: false, message: ratingError });
    }

    if (payload.published === undefined) {
      payload.published = true;
    }

    const { columns, values } = buildInsert(payload, TESTIMONIAL_FIELDS);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await query(
      `INSERT INTO testimonials (${columns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    res.status(201).json({
      success: true,
      message: "Testimonial created successfully",
      data: serializeTestimonial(result.rows[0]),
    });
  } catch (error) {
    return handleRequestDtoError(error, res, next);
  }
};

/**
 * Update testimonial (Admin)
 * PUT /api/admin/testimonials/:id
 *
 * Previously built the SET clause from `Object.keys(req.body)`, so a caller
 * controlled the column identifiers in the SQL text.
 */
export const updateTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = omitFields(
      req.body,
      TESTIMONIAL_ACCEPTED_BUT_NOT_PERSISTED
    );

    const ratingError = validateRating(payload.rating);
    if (ratingError) {
      return res.status(400).json({ success: false, message: ratingError });
    }

    const { setClause, values, nextIndex } = buildUpdate(
      payload,
      TESTIMONIAL_FIELDS
    );

    const result = await query(
      `UPDATE testimonials SET ${setClause}
       WHERE id = $${nextIndex} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.json({
      success: true,
      message: "Testimonial updated successfully",
      data: serializeTestimonial(result.rows[0]),
    });
  } catch (error) {
    return handleRequestDtoError(error, res, next);
  }
};

export const deleteTestimonial = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Deleting (unpublishing) testimonial:", id);

    const result = await query(
      "UPDATE testimonials SET published = false WHERE id = $1 RETURNING id",
      [id]
    );

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
  } catch (error) {
    console.error("❌ Delete testimonial error:", error);
    next(error);
  }
};
