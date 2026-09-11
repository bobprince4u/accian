"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestimonials = exports.getServices = exports.deleteProject = exports.getProjects = exports.updateProject = exports.createProject = exports.getDashboardStats = exports.deleteContact = exports.updateContactStatus = exports.getContactById = exports.getContacts = exports.logout = exports.login = exports.refreshToken = exports.createAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const token_1 = require("../utils/token");
const contactStatus_1 = require("../utils/contactStatus");
const serializers_1 = require("../utils/serializers");
const sqlUpdate_1 = require("../utils/sqlUpdate");
const requestFields_1 = require("../utils/requestFields");
/**
 * Translate the request-DTO errors into the API's error envelope. Anything
 * else is a genuine failure and is passed to the error handler.
 */
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
// ========================
// Admin Signup / Create Account
// ========================
const createAdmin = async (req, res, next) => {
    try {
        const { email, password, fullName, username } = req.body;
        if (!email || !password || !fullName || !username) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        // BLOCK SIGNUP IF ADMIN ALREADY EXISTS
        const adminCount = await (0, database_1.query)("SELECT COUNT(*) FROM admin_users");
        if (Number(adminCount.rows[0].count) > 0) {
            return res.status(403).json({
                success: false,
                message: "Admin signup is disabled",
            });
        }
        // Check for duplicates
        const existingUser = await (0, database_1.query)("SELECT id FROM admin_users WHERE email = $1 OR username = $2", [email, username]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Admin user already exists",
            });
        }
        // Hash password
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // The role is assigned by the server, never taken from the request body:
        // this is the bootstrap account and it is always an admin.
        const result = await (0, database_1.query)(`INSERT INTO admin_users
       (email, password_hash, full_name, role, username, active, created_at)
       VALUES ($1, $2, $3, $4, $5, true, NOW())
       RETURNING id, email, full_name, role, username`, [email, passwordHash, fullName, "admin", username]);
        return res.status(201).json({
            success: true,
            message: "Admin account created successfully",
            data: result.rows[0],
        });
    }
    catch (error) {
        console.error(" Create admin error:", error);
        next(error);
    }
};
exports.createAdmin = createAdmin;
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
const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken: presentedToken } = req.body ?? {};
        if (!presentedToken) {
            return res
                .status(401)
                .json({ success: false, message: "Missing refresh token" });
        }
        // Must be present, unrevoked, and unexpired according to the database.
        const stored = await (0, database_1.query)(`SELECT * FROM refresh_tokens
       WHERE token = $1 AND revoked = false AND expires_at > NOW()`, [presentedToken]);
        if (!stored.rows.length) {
            return res
                .status(401)
                .json({ success: false, message: "Invalid refresh token" });
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(presentedToken, process.env.JWT_REFRESH_SECRET);
        }
        catch {
            // Signature failed or the token is past its own expiry: revoke the row
            // so a token that can never succeed does not linger as valid-looking.
            await (0, database_1.query)("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
                presentedToken,
            ]);
            return res
                .status(401)
                .json({ success: false, message: "Invalid refresh token" });
        }
        const userResult = await (0, database_1.query)("SELECT id, email, role FROM admin_users WHERE id = $1 AND active = true", [decoded.id]);
        if (userResult.rows.length === 0) {
            return res
                .status(403)
                .json({ success: false, message: "User not found or inactive" });
        }
        const user = userResult.rows[0];
        const newAccessToken = (0, token_1.generateAccessToken)({
            id: user.id.toString(),
            email: user.email,
            role: user.role,
        });
        // Rotation: the presented token is spent.
        const newRefreshToken = (0, token_1.generateRefreshToken)({ id: user.id.toString() });
        await (0, database_1.query)("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
            presentedToken,
        ]);
        await (0, database_1.query)(`INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`, [user.id, newRefreshToken]);
        return res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    }
    catch (error) {
        console.error("❌ Refresh token error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.refreshToken = refreshToken;
// ========================
// Admin Login
// ========================
const login = async (req, res, next) => {
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
        const result = await (0, database_1.query)("SELECT * FROM admin_users WHERE email = $1 AND active = true", [normalizedEmail]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        const user = result.rows[0];
        const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
            });
        }
        // Update last login timestamp
        await (0, database_1.query)("UPDATE admin_users SET last_login = NOW() WHERE id = $1", [
            user.id,
        ]);
        // Create user payload that matches TokenPayload interface
        const tokenPayload = {
            id: user.id.toString(),
            email: user.email,
            role: user.role,
        };
        // User payload - complete (includes fullName for frontend)
        const userPayload = {
            id: user.id.toString(),
            email: user.email,
            fullName: user.full_name,
            role: user.role,
        };
        // Generate tokens
        const accessToken = (0, token_1.generateAccessToken)(tokenPayload); // short-lived token
        const refreshToken = (0, token_1.generateRefreshToken)({ id: user.id }); // long-lived token
        // Store refresh token in DB
        await (0, database_1.query)(`INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '7 days')`, [user.id, refreshToken]);
        return res.json({
            success: true,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
                user: userPayload,
            },
        });
    }
    catch (error) {
        console.error("❌ Login error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.login = login;
/**
 * POST /api/admin/logout
 *
 * Revokes the presented refresh token so it cannot be exchanged again. The
 * access token is a short-lived bearer token and cannot be recalled; it
 * expires on its own within 15 minutes. That residual window is inherent to
 * stateless JWTs and is documented rather than papered over.
 */
const logout = async (req, res, next) => {
    try {
        const { refreshToken: presentedToken } = req.body ?? {};
        if (!presentedToken) {
            return res
                .status(400)
                .json({ success: false, message: "Missing refresh token" });
        }
        await (0, database_1.query)("UPDATE refresh_tokens SET revoked = true WHERE token = $1", [
            presentedToken,
        ]);
        // Always 200: logging out an already-revoked token is not an error, and
        // reporting whether the token existed would leak information.
        return res.json({ success: true, message: "Logged out successfully" });
    }
    catch (error) {
        console.error("❌ Logout error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.logout = logout;
/// ========================
// Get All Contacts
// ========================
const getContacts = async (_req, res, next) => {
    try {
        const result = await (0, database_1.query)("SELECT * FROM contacts ORDER BY created_at DESC");
        // Database rows never leave this function: the DTO is the API contract.
        const contacts = result.rows.map(serializers_1.serializeContact);
        res.status(200).json({
            success: true,
            data: contacts,
            count: contacts.length,
        });
    }
    catch (error) {
        console.error("❌ Get all contacts error:", error);
        next(error);
    }
};
exports.getContacts = getContacts;
// ========================
// Get Contact by ID
// ========================
const getContactById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Contact ID is required",
            });
        }
        const result = await (0, database_1.query)("SELECT * FROM contacts WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact not found",
            });
        }
        res.status(200).json({
            success: true,
            data: (0, serializers_1.serializeContact)(result.rows[0]),
        });
    }
    catch (error) {
        console.error("❌ Get contact by ID error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.getContactById = getContactById;
// ========================
// Update Contact Status
// ========================
const updateContactStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Single shared mapping — the same one the read path uses, so a status
        // written here can never be read back as something else.
        const dbStatus = (0, contactStatus_1.toDbContactStatus)(status);
        if (!dbStatus) {
            return res.status(400).json({
                success: false,
                message: "Invalid status value",
                allowed: contactStatus_1.CONTACT_STATUSES,
            });
        }
        const result = await (0, database_1.query)("UPDATE contacts SET status = $1, updated_at = $2 WHERE id = $3 RETURNING *", [dbStatus, new Date(), id]);
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Contact not found" });
        }
        return res.json({
            success: true,
            message: "Status updated successfully",
            data: (0, serializers_1.serializeContact)(result.rows[0]),
        });
    }
    catch (error) {
        console.error("❌ Update status error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.updateContactStatus = updateContactStatus;
// ========================
// Delete Contact
// ========================
const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)("DELETE FROM contacts WHERE id = $1 RETURNING id", [id]);
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
    }
    catch (error) {
        console.error("❌ Delete contact error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.deleteContact = deleteContact;
// ========================
// Dashboard Stats
// ========================
const getDashboardStats = async (_req, res, next) => {
    try {
        const [contacts, publishedProjects, newContacts, converted, recent] = await Promise.all([
            (0, database_1.query)("SELECT COUNT(*) as total FROM contacts"),
            (0, database_1.query)("SELECT COUNT(*) as total FROM projects WHERE published = true"),
            (0, database_1.query)("SELECT COUNT(*) as total FROM contacts WHERE status = $1", [
                "new",
            ]),
            (0, database_1.query)("SELECT COUNT(*) as total FROM contacts WHERE status = $1", [
                "converted",
            ]),
            (0, database_1.query)("SELECT * FROM contacts ORDER BY created_at DESC LIMIT 5"),
        ]);
        const totalContacts = parseInt(contacts.rows[0].total, 10);
        const newInquiries = parseInt(newContacts.rows[0].total, 10);
        const convertedContacts = parseInt(converted.rows[0].total, 10);
        // "Active" means published, which is what the projects table actually
        // records (`published BOOLEAN`). There is no project `status` column.
        const activeProjects = parseInt(publishedProjects.rows[0].total, 10);
        const conversionRate = totalContacts === 0
            ? 0
            : Math.round((convertedContacts / totalContacts) * 1000) / 10;
        return res.json({
            success: true,
            data: {
                totalContacts,
                newInquiries,
                activeProjects,
                conversionRate,
                recentContacts: recent.rows.map(serializers_1.serializeContact),
                // Retained so any existing consumer of the previous shape keeps
                // working; they are aliases of the fields above.
                totalProjects: activeProjects,
                newContacts: newInquiries,
            },
        });
    }
    catch (error) {
        console.error("❌ Dashboard stats error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
// ========================
// Projects
// ========================
const slugify = (value) => value
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
const createProject = async (req, res, next) => {
    try {
        const payload = (0, requestFields_1.omitFields)(req.body, requestFields_1.PROJECT_ACCEPTED_BUT_NOT_PERSISTED);
        const title = (0, requestFields_1.readField)(payload, "title");
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
        const { columns, values } = (0, sqlUpdate_1.buildInsert)(payload, requestFields_1.PROJECT_FIELDS);
        const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
        const result = await (0, database_1.query)(`INSERT INTO projects (${columns.join(", ")})
       VALUES (${placeholders})
       RETURNING *`, values);
        return res.status(201).json({
            success: true,
            message: "Project created",
            data: (0, serializers_1.serializeProject)(result.rows[0]),
        });
    }
    catch (error) {
        return handleRequestDtoError(error, res, next);
    }
};
exports.createProject = createProject;
/**
 * Update Project
 *
 * Previously built the SET clause from `Object.keys(req.body)`, which let a
 * caller choose the column identifiers in the SQL text. Column names now come
 * only from the hard-coded allowlist.
 */
const updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const payload = (0, requestFields_1.omitFields)(req.body, requestFields_1.PROJECT_ACCEPTED_BUT_NOT_PERSISTED);
        const { setClause, values, nextIndex } = (0, sqlUpdate_1.buildUpdate)(payload, requestFields_1.PROJECT_FIELDS);
        const result = await (0, database_1.query)(`UPDATE projects SET ${setClause}, updated_at = $${nextIndex}
       WHERE id = $${nextIndex + 1} RETURNING *`, [...values, new Date(), id]);
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found",
            });
        }
        return res.json({
            success: true,
            message: "Project updated",
            data: (0, serializers_1.serializeProject)(result.rows[0]),
        });
    }
    catch (error) {
        return handleRequestDtoError(error, res, next);
    }
};
exports.updateProject = updateProject;
// ========================
// GET ALL Projects (Admin)
// ========================
/**
 * The admin list previously filtered on `published = true`, which hid every
 * draft from the only UI that can edit or publish one. Admins see all rows;
 * the public endpoints still filter.
 */
const getProjects = async (_req, res, next) => {
    try {
        const result = await (0, database_1.query)("SELECT * FROM projects ORDER BY updated_at DESC NULLS LAST, created_at DESC");
        const projects = result.rows.map(serializers_1.serializeProject);
        return res.json({
            success: true,
            data: projects,
            count: projects.length,
        });
    }
    catch (error) {
        console.error("❌ Get all projects error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.getProjects = getProjects;
// ========================
// Delete (Unpublish) Project
// ========================
const deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)("UPDATE projects SET published = false WHERE id = $1 RETURNING id", [id]);
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
    }
    catch (error) {
        console.error("❌ Delete project error:", error instanceof Error ? error.message : String(error));
        next(error);
    }
};
exports.deleteProject = deleteProject;
/**
 * Get all services (Admin)
 * GET /api/admin/services
 */
const getServices = async (req, res, next) => {
    try {
        const result = await (0, database_1.query)("SELECT * FROM services ORDER BY order_index ASC, created_at ASC");
        const services = result.rows.map(serializers_1.serializeService);
        res.json({
            success: true,
            data: services,
            count: services.length,
        });
    }
    catch (error) {
        console.error("❌ Get services error:", error);
        next(error);
    }
};
exports.getServices = getServices;
/**
 * Get all testimonials (Admin)
 * GET /api/admin/testimonials
 */
const getTestimonials = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 20;
        const offset = (pageNum - 1) * limitNum;
        const result = await (0, database_1.query)(`SELECT t.*, p.title as project_title, p.slug as project_slug
       FROM testimonials t
       LEFT JOIN projects p ON t.project_id = p.id
       ORDER BY t.created_at DESC
       LIMIT $1 OFFSET $2`, [limitNum, offset]);
        const testimonials = result.rows.map(serializers_1.serializeTestimonial);
        // Get total count
        const countResult = await (0, database_1.query)("SELECT COUNT(*) FROM testimonials");
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
    }
    catch (error) {
        console.error("❌ Get testimonials error:", error);
        next(error);
    }
};
exports.getTestimonials = getTestimonials;
