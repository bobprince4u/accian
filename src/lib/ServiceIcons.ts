import { Lightbulb, Code, GraduationCap, Heart, Brain } from "lucide-react";

import type { LucideIcon } from "lucide-react";

export const serviceIconBySlug: Record<string, LucideIcon> = {
  "it-consulting": Lightbulb,
  "web-development": Code,
  "education-training": GraduationCap,
  "social-care": Heart,
  "data-science-ai": Brain,
};
