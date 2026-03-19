"use client";

import { ArrowRight, Code } from "lucide-react";
import * as Icons from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  link: string;
  slug: string;
  icon?: string;
}

export default function ServiceCard({
  title,
  description,
  features,
  //slug,
  icon,
}: ServiceCardProps) {
  const IconComponent =
    icon && icon in Icons
      ? (Icons[icon as keyof typeof Icons] as React.ElementType)
      : Code;

  return (
    <article
      className="card group"
      aria-labelledby={`service-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <div
        className="w-14 h-14 rounded-lg bg-blue-600
                   flex items-center justify-center mb-6
                   group-hover:scale-110 transition-transform duration-300"
        aria-hidden="true"
      >
        <IconComponent className="w-6 h-6 text-white" />
      </div>

      <h3
        id={`service-${title.replace(/\s+/g, "-").toLowerCase()}`}
        className="mb-4 text-[#0D0D0D]"
      >
        {title}
      </h3>

      <p className="text-gray-500 mb-6 leading-relaxed font-light">
        {description}
      </p>

      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#0D0D0D] mb-3">
          Key Offerings
        </p>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li
              key={index}
              className="text-sm text-gray-500 font-light flex items-start gap-2"
            >
              <span className="text-blue-600 mt-1 font-bold">→</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/services"
        className="inline-flex items-center gap-2 text-blue-600
                   font-semibold text-sm group-hover:gap-3
                   transition-all duration-300"
      >
        Explore Service
        <ArrowRight size={16} />
      </Link>
    </article>
  );
}
