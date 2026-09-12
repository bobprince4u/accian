import type { LucideIcon } from "lucide-react";

interface Deliverable {
  icon: LucideIcon;
  name: string;
  description: string;
}

interface TechStack {
  [key: string]: string | string[];
}

export interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  image: string;
  overview: string;
  deliverables: Deliverable[];
  techStack?: TechStack;
  aiCapabilities?: string[];
  testingTypes?: string[];
  keyBenefits?: string[];
}
