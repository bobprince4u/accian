import { ArrowRight } from "lucide-react";
//import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface ServiceCardProps {
  icon?: ReactNode;
  title: string;
  description: string;
  features: string[];
  link: string;
}

export default function ServiceCard({
  icon,
  title,
  description,
  features,
}: ServiceCardProps) {
  return (
    <article
      className="card group"
      aria-labelledby={`service-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div
        className="w-14 h-14 rounded-lg bg-linear-to-br from-[#1E40AF] to-[#14B8A6] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
        aria-hidden="true"
      >
        {icon}
      </div>

      <h3
        id={`service-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-4 text-[#0A2540]"
      >
        {title}
      </h3>

      <p className="text-[#64748B] mb-6 leading-relaxed">{description}</p>

      <div className="mb-6">
        <p className="text-sm font-semibold text-[#1E293B] mb-3">
          Key Offerings:
        </p>
        <ul className="space-y-2" aria-label={`Key offerings for ${title}`}>
          {(features || []).map((features, index) => (
            <li
              key={index}
              className="text-sm text-[#64748B] flex items-start gap-2"
            >
              <span className="text-[#14B8A6] mt-1" aria-hidden="true">
                •
              </span>
              <span>{features}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/services"
        className="inline-flex items-center gap-2 text-[#1E40AF] font-semibold text-sm group-hover:gap-3 transition-all duration-300"
        aria-label={`Learn more about ${title}`}
      >
        Explore Service
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
