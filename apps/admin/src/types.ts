export interface Contact {
  id: string;
  fullName: string;
  email: string;
  company: string;
  phone: string;
  service: string;
  budget: string;
  timeline: string;
  message: string;
  hearAbout: string;
  status: "New" | "Contacted" | "In Progress" | "Converted" | "Closed";
  createdAt: string;
  lastUpdated: string;
}

export interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  image: string;
  status: "Published" | "Draft";
  featured: boolean;
  technologies: string[];
  completedDate: string;
  results: {
    metric: string;
    value: string;
  }[];
  industry?: string;
  challenge?: string;
  solution?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  message: string;
  rating: number;
  image?: string;
  createdAt: string;
  featured: boolean;
}

export interface Service {
  id?: number;
  title: string;
  slug: string;
  icon: string | null;
  shortDescription: string;
  fullDescription?: string | null;
  features: string[];
  technologyStack: string[];
  processSteps: string[];
  idealFor: string[];
  orderIndex: number;
  published: boolean;
}

export interface DashboardStats {
  totalContacts: number;
  newInquiries: number;
  activeProjects: number;
  conversionRate: number;
}

export type ViewType =
  | "dashboard"
  | "contacts"
  | "projects"
  | "testimonials"
  | "services";
