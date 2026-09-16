/**
 * Service contract.
 *
 * Two shapes exist because the API genuinely returns two. The list endpoint
 * selects a subset of columns for a lighter payload; the detail endpoint
 * returns everything. Modelling one shape would mean either inventing fields
 * the list endpoint does not send, or dropping fields the detail endpoint
 * does -- both would misdescribe the API.
 */

/**
 * A service as `GET /api/services` returns it.
 *
 * The public list deliberately omits the long-form fields.
 */
export interface ServiceSummary {
  id: number;
  title: string;
  slug: string;
  icon: string | null;
  /** Card-length copy. The database column is `short_description`. */
  shortDescription: string;
  features: string[];
  orderIndex: number;
  published: boolean;
  createdAt: string;
}

/**
 * A service as `GET /api/services/:slug` and the admin endpoints return it.
 *
 * `shortDescription` is the canonical name for the card-length copy. The
 * audit recorded a `description` vs `shortDescription` mismatch: the API has
 * always sent `shortDescription`, and the consumer that expected
 * `description` was the web home page, which now reads the canonical name.
 * No alias is published.
 */
export interface Service extends ServiceSummary {
  fullDescription: string | null;
  technologyStack: string[];
  processSteps: string[];
  idealFor: string[];
  updatedAt: string | null;
}

/** Body accepted when creating or updating a service through the admin API. */
export interface ServiceInput {
  title: string;
  slug?: string;
  icon?: string | null;
  shortDescription?: string;
  fullDescription?: string | null;
  features?: string[];
  technologyStack?: string[];
  processSteps?: string[];
  idealFor?: string[];
  orderIndex?: number;
  published?: boolean;
}
