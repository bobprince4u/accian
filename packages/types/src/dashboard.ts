/**
 * Dashboard contract.
 *
 * `GET /api/admin/dashboard/stats`. "Active" means published, which is what
 * the projects table actually records -- there is no project `status` column.
 */

import type { Contact } from "./contact.js";

export interface DashboardStats {
  totalContacts: number;
  newInquiries: number;
  /** Published projects. */
  activeProjects: number;
  /** Percentage, one decimal place. `0` when there are no contacts. */
  conversionRate: number;
  recentContacts: Contact[];

  /**
   * @deprecated Alias of `activeProjects`, retained so an existing consumer of
   * the older shape keeps working. Read `activeProjects` in new code.
   */
  totalProjects?: number;

  /**
   * @deprecated Alias of `newInquiries`. Read `newInquiries` in new code.
   */
  newContacts?: number;
}
