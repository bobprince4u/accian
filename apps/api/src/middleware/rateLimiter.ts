import rateLimit, { RateLimitRequestHandler } from "express-rate-limit";

//General API Rate Limiter
export const general: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Contact Form Specific Rate Limiter
export const contactForm: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message:
      "Too many contact form submissions from this IP, please try again after an hour.",
  },
  skipSuccessfulRequests: false,
});

/**
 * Pre-consultation form limiter.
 *
 * Stricter than the contact form, and over a longer window. A submission
 * carries up to 20MB of attachments and triggers an outbound email with those
 * attachments, so the cost of a repeat is borne by this server and by the mail
 * provider's quota rather than by a database row.
 *
 * Three per hour is generous for a form that takes twenty minutes to fill in,
 * and still leaves room for a genuine applicant who hits send twice because
 * their connection dropped.
 */
export const preConsultationForm: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message:
      "You have submitted this form several times already. Please wait an hour before trying again, or email info@accian.co.uk.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  // A rejected submission (a bad file, a missing field) must not consume the
  // allowance: an applicant correcting a validation error is not abusing the
  // endpoint, and locking them out mid-form would be the worst moment to do it.
  skipFailedRequests: true,
});

// Admin Panel Specific Rate Limiter
export const adminLogin: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message:
      "Too many admin panel requests from this IP, please try again after 15 minutes.",
  },
  skipSuccessfulRequests: true,
});

export const adminSignup: RateLimitRequestHandler = rateLimit({
  windowMs: 30 * 30 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message:
      "Too many admin signup attempts from this IP, please try again after an hour.",
  },
  skipSuccessfulRequests: true,
});
