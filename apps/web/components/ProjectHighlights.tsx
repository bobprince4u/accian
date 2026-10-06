"use client";

import { useEffect, useState } from "react";
import type { ProjectSummary } from "@accian/types";
import Link from "next/link";
import Reveal from "./Reveal";
import { API_URL } from "@/config/api";

/** Existing public project summaries, without inventing a case-study route. */
export default function ProjectHighlights() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`${API_URL}/api/projects`);
      if (!response.ok) throw new Error("Projects unavailable");
      const payload = await response.json();
      if (!Array.isArray(payload.data)) throw new Error("Unexpected projects response");
      setProjects(payload.data.filter((p: ProjectSummary) => typeof p.title === "string" && typeof p.description === "string"));
    } catch { setError(true); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return (
    <section id="projects" className="bg-[#EDE9E0] px-4 py-14 sm:px-6 sm:py-20 lg:px-12" aria-labelledby="projects-heading">
      <div className="container mx-auto">
        <Reveal><p className="eyebrow mb-3">Our work</p>
        <h2 id="projects-heading" className="text-3xl font-bold lg:text-4xl">Projects &amp; outcomes</h2></Reveal>
        {loading ? <p role="status" className="mt-6 text-sm text-[#555555]">Loading projects…</p>
          : error ? <div className="mt-6" role="status"><p className="text-sm text-[#555555]">We couldn’t load our projects. You can try again or ask us about relevant work.</p><button type="button" onClick={() => void load()} className="btn-secondary mt-4">Retry projects</button></div>
          : projects.length === 0 ? <p className="mt-5 max-w-2xl text-sm text-[#555555]">No projects are currently published. <Link href="/contact" className="font-medium text-[#1B4FFF] underline underline-offset-4">Ask us about work relevant to your needs</Link>.</p>
          : <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{projects.slice(0, 6).map((project, index) => <Reveal key={project.id} delay={index * 60}><article className="rounded-xl border border-[#D8D3C9] bg-white p-6">
            <p className="mb-3 text-xs font-semibold text-[#555555]">{project.industry || project.category}</p>
            <h3 className="text-lg font-semibold">{project.title}</h3>
            <p className="mt-3 text-sm text-[#555555]">{project.description}</p>
            {Array.isArray(project.results) && project.results.length > 0 && <dl className="mt-5 space-y-2 border-t border-[#E8E4DC] pt-4">{project.results.map((result, index) => <div key={index} className="flex flex-wrap justify-between gap-2 text-sm"><dt className="text-[#555555]">{result.metric}</dt><dd className="font-semibold">{result.value}</dd></div>)}</dl>}
          </article></Reveal>)}</div>}
      </div>
    </section>
  );
}
