/**
 * Testimonial contract.
 *
 * This is the type that resolves the sharpest drift the audit found. The same
 * resource was served under two different names depending on the endpoint:
 *
 *   public  GET /api/testimonials -> clientName, testimonialText, imageUrl
 *   admin   GET /api/admin/...    -> name,       message,         image
 *
 * The first set is database column naming in disguise (`client_name`,
 * `testimonial_text`, `image_url`). A client should not have to know that, so
 * the second set is canonical and both endpoints now return it.
 */

/** The project a testimonial refers to, when it refers to one. */
export interface TestimonialProject {
  id: number;
  title?: string;
  slug?: string;
}

export interface Testimonial {
  id: string;
  /** Person quoted. Database column: `client_name`. */
  name: string;
  /** Their role. Database column: `client_position`. */
  position: string;
  /** Their employer. Database column: `client_company`. */
  company: string;
  /** The quote itself. Database column: `testimonial_text`. */
  message: string;
  rating: number;
  featured: boolean;
  /** Database column: `image_url`. */
  image: string | null;
  createdAt: string;
  project: TestimonialProject | null;
}

/** Body accepted when creating or updating a testimonial. */
export interface TestimonialInput {
  name: string;
  position?: string;
  company?: string;
  message: string;
  rating?: number;
  featured?: boolean;
  image?: string | null;
  projectId?: number | null;
  published?: boolean;
}
