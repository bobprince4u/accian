import Link from "next/link";
import { ArrowRight, Code } from "lucide-react";
import { iconMap } from "@/lib/ServiceIcons";

interface ServiceCardProps {
  title: string;
  description: string;
  features: string[];
  link: string;
  slug: string;
  icon?: string;
}

export default function ServiceCard({ title, description, features, link, slug }: ServiceCardProps) {
  const Icon = iconMap[slug] || Code;
  return (
    <article className="flex h-full flex-col rounded-xl border border-[#D8D3C9] bg-white p-6 sm:p-7">
      <Icon size={24} className="mb-5 text-[#1B4FFF]" aria-hidden="true" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-3 text-sm text-[#555555]">{description}</p>
      {features.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[#555555]">
        {features.slice(0, 3).map((feature) => <li key={feature} className="flex gap-2"><span aria-hidden="true" className="text-[#1B4FFF]">✓</span>{feature}</li>)}
      </ul>}
      <Link href={link} className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-[#1B4FFF]">
        View service <span className="sr-only">: {title}</span><ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
