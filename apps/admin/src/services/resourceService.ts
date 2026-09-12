/**
 * Every admin resource call, in one place.
 *
 * These replace 15 hand-written `axios` calls that each hardcoded the
 * production API host and pasted in an `Authorization` header. Paths are
 * unchanged — only the base URL and the auth header moved into `apiClient`.
 */

import { apiClient } from "./apiClient";
import type { Contact, Project, Service, Testimonial } from "../types";

/** The API envelope is `{ success, data, count }`. */
const unwrapList = <T>(payload: unknown): T[] => {
  const data = (payload as { data?: unknown })?.data;
  return Array.isArray(data) ? (data as T[]) : [];
};

const unwrapItem = <T>(payload: unknown): T =>
  (payload as { data: T })?.data;

// ── Contacts ──────────────────────────────────────────────────

export const fetchContacts = async (): Promise<Contact[]> =>
  unwrapList<Contact>((await apiClient.get("/contacts")).data);

export const updateContactStatus = async (
  id: string,
  status: Contact["status"]
): Promise<void> => {
  await apiClient.patch(`/contacts/${id}`, { status });
};

// ── Projects ──────────────────────────────────────────────────

export const fetchProjects = async (): Promise<Project[]> =>
  unwrapList<Project>((await apiClient.get("/projects")).data);

export const createProject = async (
  project: Omit<Project, "id">
): Promise<Project> =>
  unwrapItem<Project>((await apiClient.post("/projects", project)).data);

export const updateProject = async (
  id: string,
  project: Omit<Project, "id">
): Promise<Project> =>
  unwrapItem<Project>((await apiClient.put(`/projects/${id}`, project)).data);

export const deleteProject = async (id: string): Promise<void> => {
  await apiClient.delete(`/projects/${id}`);
};

// ── Services ──────────────────────────────────────────────────

export const fetchServices = async (): Promise<Service[]> =>
  unwrapList<Service>((await apiClient.get("/services")).data);

export const createService = async (
  service: Omit<Service, "id">
): Promise<Service> =>
  unwrapItem<Service>((await apiClient.post("/services", service)).data);

export const updateService = async (
  id: string,
  service: Omit<Service, "id">
): Promise<Service> =>
  unwrapItem<Service>((await apiClient.put(`/services/${id}`, service)).data);

export const deleteService = async (id: string): Promise<void> => {
  await apiClient.delete(`/services/${id}`);
};

// ── Testimonials ──────────────────────────────────────────────

export const fetchTestimonials = async (): Promise<Testimonial[]> =>
  unwrapList<Testimonial>((await apiClient.get("/testimonials")).data);

export const createTestimonial = async (
  testimonial: Omit<Testimonial, "id">
): Promise<Testimonial> =>
  unwrapItem<Testimonial>(
    (await apiClient.post("/testimonials", testimonial)).data
  );

export const updateTestimonial = async (
  id: string,
  testimonial: Omit<Testimonial, "id">
): Promise<Testimonial> =>
  unwrapItem<Testimonial>(
    (await apiClient.put(`/testimonials/${id}`, testimonial)).data
  );

export const deleteTestimonial = async (id: string): Promise<void> => {
  await apiClient.delete(`/testimonials/${id}`);
};
