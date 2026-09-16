import { Request, Response, NextFunction } from "express";
import { query } from "../config/database";
import {
  buildUpdate,
  UnknownUpdateFieldError,
  NoUpdateFieldsError,
} from "../utils/sqlUpdate";
import {
  SERVICE_FIELDS,
  SERVICE_ACCEPTED_BUT_NOT_PERSISTED,
  omitFields,
} from "../utils/requestFields";
import { serializeService, serializeServiceSummary } from "../utils/serializers";

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

/**
 * Get all services
 * GET /api/services?published=true
 */
export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

    const result = await query(queryText);

    res.json({
      success: true,
      data: result.rows.map(serializeServiceSummary),
      count: result.rows.length,
    });
  } catch (error) {
    console.error("❌ Get services error:", error);
    next(error);
  }
};

/**
 * Get single service by slug
 * GET /api/services/:slug
 */
export const getServiceBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { slug } = req.params;

    console.log("📂 Fetching service by slug:", slug);

    const result = await query(
      `SELECT 
        id, title, slug, icon, short_description, full_description,
        features, technology_stack, process_steps, ideal_for,
        order_index, published, created_at, updated_at
      FROM services
      WHERE slug = $1 AND published = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: serializeService(result.rows[0]),
    });
  } catch (error) {
    console.error("❌ Get service by slug error:", error);
    next(error);
  }
};

/**
 * Create service (Admin)
 * POST /api/admin/services
 *
 * Returns the created service in full, as the other create endpoints do. It
 * previously returned only `{id, slug}`, and the admin dashboard splices the
 * response straight into its service list — so a newly created service
 * rendered with an undefined title and description until the page reloaded.
 */
export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      icon,
      shortDescription,
      fullDescription,
      features,
      technologyStack,
      processSteps,
      idealFor,
      orderIndex,
    } = req.body;

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

    const result = await query(
      `INSERT INTO services (
        title, slug, icon, short_description, full_description,
        features, technology_stack, process_steps, ideal_for,
        order_index, published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
      RETURNING *`,
      [
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
      ]
    );

    console.log("✅ Service created");

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: serializeService(result.rows[0]),
    });
  } catch (error) {
    console.error("❌ Create service error:", error);
    next(error);
  }
};

/**
 * Update service (Admin)
 * PUT /api/admin/services/:id
 */
export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = omitFields(req.body, SERVICE_ACCEPTED_BUT_NOT_PERSISTED);

    // Column identifiers come only from the allowlist; an arbitrary field name
    // can never reach the SQL text.
    const { setClause, values, nextIndex } = buildUpdate(
      payload,
      SERVICE_FIELDS
    );

    const result = await query(
      `UPDATE services SET ${setClause}, updated_at = $${nextIndex}
       WHERE id = $${nextIndex + 1} RETURNING *`,
      [...values, new Date(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully",
      data: serializeService(result.rows[0]),
    });
  } catch (error) {
    return handleRequestDtoError(error, res, next);
  }
};

/**
 * Delete service (Admin)
 * DELETE /api/admin/services/:id
 */
export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Deleting (unpublishing) service:", id);

    const result = await query(
      "UPDATE services SET published = false WHERE id = $1 RETURNING id",
      [id]
    );

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
  } catch (error) {
    console.error("❌ Delete service error:", error);
    next(error);
  }
};
