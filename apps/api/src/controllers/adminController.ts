import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database";
import { generateRefreshToken, generateAccessToken } from "../utils/token";
import {
  toApiContactStatus,
  toDbContactStatus,
  CONTACT_STATUSES,
} from "../utils/contactStatus";
import {
  serializeAdminUser,
  serializeContact,
  serializeProject,
  serializeService,
  serializeTestimonial,
} from "../utils/serializers";
import {
  buildUpdate,
  buildInsert,
  UnknownUpdateFieldError,
  NoUpdateFieldsError,
} from "../utils/sqlUpdate";
import {
  PROJECT_FIELDS,
  PROJECT_ACCEPTED_BUT_NOT_PERSISTED,
  omitFields,
  readField,
} from "../utils/requestFields";

/**
 * Translate the request-DTO errors into the API's error envelope. Anything
 * else is a genuine failure and is passed to the error handler.
 */
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

// ========================
// Types
// ========================
interface UserPayload {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

// ========================
// Admin Signup / Create Account
// ========================
export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, fullName, username } = req.body;

    if (!email || !password || !fullName || !username) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // BLOCK SIGNUP IF ADMIN ALREADY EXISTS
    const adminCount = await query("SELECT COUNT(*) FROM admin_users");

    if (Number(adminCount.rows[0].count) > 0) {
      return res.status(403).json({
        success: false,
        message: "Admin signup is disabled",
      });
    }

    // Check for duplicates
    const existingUser = await query(
      "SELECT id FROM admin_users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Admin user already exists",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // The role is assigned by the server, never taken from the request body:
    // this is the bootstrap account and it is always an admin.
    const result = await query(
      `INSERT INTO admin_users
       (email, password_hash, full_name, role, username, active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING id, email, full_name, role, username`,
      [email, passwordHash, fullName, "admin", username]
    );

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: serializeAdminUser(result.rows[0]),
    });
  } catch (error) {
    console.error(" Create admin error:", error);
    next(error as Error);
  }
};
// ========================
// Refresh Token
// ========================

/**
 * POST /api/admin/refresh
 *
 * Exchanges a valid refresh token for a new access token. The refresh token
 * is checked against the database (not just cryptographically) so that a
 * revoked or expired one cannot be used, and it is rotated on every use: the
 * presented token is revoked and a new one issued, so a stolen token is
 * usable at most once before the legitimate client's next refresh invalidates
 * it.
 *
 * This route is deliberately mounted before `authenticateToken`: the whole
 * point is to be callable once the access token has expired.
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: presentedToken } = req.body ?? {};

    if (!presentedToken) {
      return res
        .status(401)
        .json({ success: false, message: "Missing refresh token" });
    }

    // Must be present, unrevoked, and unexpired according to the database.
    const stored = await query(
      `SELECT * FROM refresh_tokens
       WHERE token = $1 AND revoked = false AND expires_at > NOW()`,
      [presentedToken]
    );

    if (!stored.rows.length) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    let decoded: { id?: string | number };

    try {
      decoded = jwt.verify(
        presentedToken,
        process.env.JWT_REFRESH_SECRET as string
      ) as { id?: string | number };
    } catch {
      // Signature failed or the token is past its own expiry: revoke the row
      // so a token that can never succeed does not linger as valid-looking.
      await query("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
        presentedToken,
      ]);
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const userResult = await query(
      "SELECT id, email, role FROM admin_users WHERE id = $1 AND active = true",
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: "User not found or inactive" });
    }

    const user = userResult.rows[0];

    const newAccessToken = generateAccessToken({
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    });

    // Rotation: the presented token is spent.
    const newRefreshToken = generateRefreshToken({ id: user.id.toString() });

    await query("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
      presentedToken,
    ]);

    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, newRefreshToken]
    );

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error: unknown) {
    console.error(
      "❌ Refresh token error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

// ========================
// Admin Login
// ========================
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // This check is important if the body is empty or missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const result = await query(
      "SELECT * FROM admin_users WHERE email = $1 AND active = true",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update last login timestamp
    await query("UPDATE admin_users SET last_login = NOW() WHERE id = $1", [
      user.id,
    ]);

    // Create user payload that matches TokenPayload interface
    const tokenPayload = {
      id: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    // User payload - complete (includes fullName for frontend)
    const userPayload: UserPayload = {
      id: user.id.toString(),
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    // Generate tokens
    const accessToken = generateAccessToken(tokenPayload); // short-lived token
    const refreshToken = generateRefreshToken({ id: user.id }); // long-lived token

    // Store refresh token in DB
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
      [user.id, refreshToken]
    );

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user: userPayload,
      },
    });
  } catch (error: unknown) {
    console.error(
      "❌ Login error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

/**
 * POST /api/admin/logout
 *
 * Revokes the presented refresh token so it cannot be exchanged again. The
 * access token is a short-lived bearer token and cannot be recalled; it
 * expires on its own within 15 minutes. That residual window is inherent to
 * stateless JWTs and is documented rather than papered over.
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { refreshToken: presentedToken } = req.body ?? {};

    if (!presentedToken) {
      return res
        .status(400)
        .json({ success: false, message: "Missing refresh token" });
    }

    await query("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
      presentedToken,
    ]);

    // Always 200: logging out an already-revoked token is not an error, and
    // reporting whether the token existed would leak information.
    return res.json({ success: true, message: "Logged out successfully" });
  } catch (error: unknown) {
    console.error(
      "❌ Logout error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

/// ========================
// Get All Contacts
// ========================
export const getContacts = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      "SELECT * FROM contacts ORDER BY created_at DESC"
    );

    // Database rows never leave this function: the DTO is the API contract.
    const contacts = result.rows.map(serializeContact);

    res.status(200).json({
      success: true,
      data: contacts,
      count: contacts.length,
    });
  } catch (error: unknown) {
    console.error("❌ Get all contacts error:", error);
    next(error as Error);
  }
};

// ========================
// Get Contact by ID
// ========================
export const getContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Contact ID is required",
      });
    }

    const result = await query("SELECT * FROM contacts WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    res.status(200).json({
      success: true,
      data: serializeContact(result.rows[0]),
    });
  } catch (error: unknown) {
    console.error(
      "❌ Get contact by ID error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

// ========================
// Update Contact Status
// ========================
export const updateContactStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Single shared mapping — the same one the read path uses, so a status
    // written here can never be read back as something else.
    const dbStatus = toDbContactStatus(status);

    if (!dbStatus) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        allowed: CONTACT_STATUSES,
      });
    }

    const result = await query(
      "UPDATE contacts SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *",
      [dbStatus, new Date(), id]
    );

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Contact not found" });
    }

    return res.json({
      success: true,
      message: "Status updated successfully",
      data: serializeContact(result.rows[0]),
    });
  } catch (error: unknown) {
    console.error(
      "❌ Update status error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

// ========================
// Delete Contact
// ========================
export const deleteContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM contacts WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contact not found",
      });
    }

    return res.json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error: unknown) {
    console.error(
      "❌ Delete contact error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

// ========================
// Dashboard Stats
// ========================
export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [contacts, publishedProjects, newContacts, converted, recent] =
      await Promise.all([
        query("SELECT COUNT(*) as total FROM contacts"),
        query("SELECT COUNT(*) as total FROM projects WHERE published = true"),
        query("SELECT COUNT(*) as total FROM contacts WHERE status = $1", [
          "new",
        ]),
        query("SELECT COUNT(*) as total FROM contacts WHERE status = $1", [
          "converted",
        ]),
        query("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5"),
      ]);

    const totalContacts = parseInt(contacts.rows[0].total as string, 10);
    const newInquiries = parseInt(newContacts.rows[0].total as string, 10);
    const convertedContacts = parseInt(converted.rows[0].total as string, 10);

    // "Active" means published, which is what the projects table actually
    // records (`published BOOLEAN`). There is no project `status` column.
    const activeProjects = parseInt(
      publishedProjects.rows[0].total as string,
      10
    );

    const conversionRate =
      totalContacts === 0
        ? 0
        : Math.round((convertedContacts / totalContacts) * 1000) / 10;

    return res.json({
      success: true,
      data: {
        totalContacts,
        newInquiries,
        activeProjects,
        conversionRate,
        recentContacts: recent.rows.map(serializeContact),

        // Retained so any existing consumer of the previous shape keeps
        // working; they are aliases of the fields above.
        totalProjects: activeProjects,
        newContacts: newInquiries,
      },
    });
  } catch (error: unknown) {
    console.error(
      "❌ Dashboard stats error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

// ========================
// Projects
// ========================

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Create Project
 *
 * Uses the same allowlist as `updateProject`, so the two paths accept exactly
 * the same fields and write exactly the same columns. Anything outside the
 * allowlist is rejected with 400 rather than silently discarded.
 */
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = omitFields(req.body, PROJECT_ACCEPTED_BUT_NOT_PERSISTED);

    const title = readField(payload, "title");
    if (typeof title !== "string" || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "title is required",
      });
    }

    if (payload.slug === undefined) {
      payload.slug = slugify(title);
    }

    // Preserve the previous default: a project created without an explicit
    // status/published flag is published.
    if (payload.status === undefined && payload.published === undefined) {
      payload.published = true;
    }

    const { columns, values } = buildInsert(payload, PROJECT_FIELDS);

    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await query(
      `INSERT INTO projects (${columns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`,
      values
    );

    return res.status(201).json({
      success: true,
      message: "Project created",
      data: serializeProject(result.rows[0]),
    });
  } catch (error: unknown) {
    return handleRequestDtoError(error, res, next);
  }
};

/**
 * Update Project
 *
 * Previously built the SET clause from `Object.keys(req.body)`, which let a
 * caller choose the column identifiers in the SQL text. Column names now come
 * only from the hard-coded allowlist.
 */
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const payload = omitFields(req.body, PROJECT_ACCEPTED_BUT_NOT_PERSISTED);

    const { setClause, values, nextIndex } = buildUpdate(
      payload,
      PROJECT_FIELDS
    );

    const result = await query(
      `UPDATE projects SET ${setClause}, updated_at = $${nextIndex}
       WHERE id = $${nextIndex + 1} RETURNING *`,
      [...values, new Date(), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      message: "Project updated",
      data: serializeProject(result.rows[0]),
    });
  } catch (error: unknown) {
    return handleRequestDtoError(error, res, next);
  }
};

// ========================
// GET ALL Projects (Admin)
// ========================

/**
 * The admin list previously filtered on `published = true`, which hid every
 * draft from the only UI that can edit or publish one. Admins see all rows;
 * the public endpoints still filter.
 */
export const getProjects = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      "SELECT * FROM projects ORDER BY updated_at DESC NULLS LAST, created_at DESC"
    );

    const projects = result.rows.map(serializeProject);

    return res.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error: unknown) {
    console.error(
      "❌ Get all projects error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

// ========================
// Delete (Unpublish) Project
// ========================
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const result = await query(
      "UPDATE projects SET published = false WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.json({
      success: true,
      message: "Project unpublished",
    });
  } catch (error: unknown) {
    console.error(
      "❌ Delete project error:",
      error instanceof Error ? error.message : String(error)
    );
    next(error as Error);
  }
};

/**
 * Get all services (Admin)
 * GET /api/admin/services
 */
export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await query(
      "SELECT * FROM services ORDER BY order_index ASC, created_at ASC"
    );

    const services = result.rows.map(serializeService);

    res.json({
      success: true,
      data: services,
      count: services.length,
    });
  } catch (error: any) {
    console.error("❌ Get services error:", error);
    next(error);
  }
};

/**
 * Get all testimonials (Admin)
 * GET /api/admin/testimonials
 */
export const getTestimonials = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20 } = req.query as {
      page?: string;
      limit?: string;
    };
    const pageNum = parseInt(page as unknown as string) || 1;
    const limitNum = parseInt(limit as unknown as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    const result = await query(
      `SELECT t.*, p.title as project_title, p.slug as project_slug
       FROM testimonials t
       LEFT JOIN projects p ON t.project_id = p.id
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limitNum, offset]
    );

    const testimonials = result.rows.map(serializeTestimonial);

    // Get total count
    const countResult = await query("SELECT COUNT(*) FROM testimonials");
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: testimonials,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error("❌ Get testimonials error:", error);
    next(error);
  }
};
