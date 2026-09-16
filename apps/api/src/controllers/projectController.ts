import { Request, Response, NextFunction } from "express";
import { query } from "../config/database";
import {
  serializeProject,
  serializeProjectSummary,
} from "../utils/serializers";

// ─────────────────────────────────────────────────────────────
// Get All Projects
// GET /api/projects?featured=true&limit=10&page=1
// ─────────────────────────────────────────────────────────────

export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { featured, limit = "10", page = "1" } = req.query;

    const limitNum = parseInt(limit as string, 10);
    const pageNum = parseInt(page as string, 10);
    const offset = (pageNum - 1) * limitNum;

    console.log("📂 Fetching projects:", { featured, limit, page });

    let queryText = `
            SELECT 
                id, title, slug, industry, project_type, description,
                technology_stack, results, image_url, featured, created_at
            FROM projects
            WHERE published = true
        `;

    const queryParams: any[] = [];

    if (featured === "true") {
      queryText += " AND featured = true";
    }

    queryText += ` ORDER BY order_index ASC, created_at DESC LIMIT $1 OFFSET $2`;
    queryParams.push(limitNum, offset);

    const result = await query(queryText, queryParams);

    // Total count
    let countQuery = "SELECT COUNT(*) FROM projects WHERE published = true";
    if (featured === "true") {
      countQuery += " AND featured = true";
    }

    const countResult = await query(countQuery);
    const total = parseInt(countResult.rows[0].count, 10);

    res.json({
      success: true,
      data: result.rows.map(serializeProjectSummary),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("❌ Get projects error:", error);
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// Get Project By Slug
// GET /api/projects/:slug
// ─────────────────────────────────────────────────────────────

export const getProjectBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;

    console.log("📂 Fetching project by slug:", slug);

    const result = await query(
      `SELECT
                p.id, p.title, p.slug, p.industry, p.project_type,
                p.description, p.challenge, p.solution, p.technology_stack,
                p.results, p.image_url, p.featured, p.published,
                p.client_name, p.client_position, p.client_company, p.testimonial,
                p.order_index, p.created_at, p.updated_at
            FROM projects p
            WHERE p.slug = $1 AND p.published = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    res.json({
      success: true,
      data: serializeProject(result.rows[0]),
    });
  } catch (error) {
    console.error("❌ Get project by slug error:", error);
    next(error);
  }
};
