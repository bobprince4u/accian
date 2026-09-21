import express, { Router } from "express";

import { submitPreConsultation } from "../controllers/preConsultationController";
import { parsePreConsultationUpload } from "../middleware/preConsultationUpload";
import { preConsultationForm } from "../middleware/rateLimiter";

/**
 * @route   POST /api/pre-consultation
 * @desc    Submit the PhD Research Pathway pre-consultation form
 * @access  Public
 *
 * Middleware order matters here. The rate limiter runs BEFORE the multipart
 * parser so that a client over its allowance is turned away without this
 * process buffering up to 20MB of their upload into memory first.
 */

const router: Router = express.Router();

router.post("/", preConsultationForm, parsePreConsultationUpload, submitPreConsultation);

export default router;
