"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import ServiceCard from "@/components/ServiceCard";
import ProjectHighlights from "@/components/ProjectHighlights";
import axios from "axios";
import { Globe, Clock, Star } from "lucide-react";
import type {
  ServiceSummary,
  Testimonial as ApiTestimonial,
} from "@accian/types";
import { trustIndicators, stats } from "../data/HomPageData";
import { API_URL } from "../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * View models, not API shapes.
 *
 * These describe what the cards on this page render. The API shapes they are
 * built from come from `@accian/types` and are mapped explicitly below, so a
 * change to the contract surfaces here as a type error rather than as an
 * empty paragraph at runtime.
 */
interface Service {
  id?: string;
  slug: string;
  title: string;
  description: string;
  icon?: string;
  features?: string[];
  link?: string;
}
interface Testimonial {
  quote: string;
  author: string;
  position: string;
  rating?: number;
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
// ─── Animated stat cell ───────────────────────────────────────────────────────
function AnimatedStat({
  number,
  label,
  description,
}: {
  number: string;
  label: string;
  description: string;
}) {
  return (
    <Reveal className="px-4 py-7 sm:px-6 lg:px-10">
      <p className="text-3xl font-bold text-white">{number}</p>
      <p className="mt-2 text-sm font-semibold text-white">{label}</p>
      <p className="mt-1 text-xs text-white/75">{description}</p>
    </Reveal>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────
const ServiceCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 animate-pulse">
    <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
    <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
  </div>
);

const TestimonialSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 animate-pulse">
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
      ))}
    </div>
    <div className="space-y-2 mb-6">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-4 bg-gray-200 rounded w-5/6" />
    </div>
    <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-2/3" />
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(
    null,
  );

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      const data = res.data.data || res.data;
      if (!Array.isArray(data)) throw new Error("Unexpected services response");
      setServices(
        Array.isArray(data)
          ? data.map((s: ServiceSummary) => ({
              id: String(s.id),
              slug: s.slug,
              title: s.title,
              description: s.shortDescription ?? "",
              icon: s.icon ?? undefined,
              features: s.features,
            }))
          : [],
      );
    } catch {
      setError("We couldn’t load our services. Please try again, or explore the services overview.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    setTestimonialsError(null);
    try {
      const res = await axios.get(`${API_URL}/api/testimonials`);
      const data = res.data.data || res.data;
      if (!Array.isArray(data)) throw new Error("Unexpected testimonials response");
      setTestimonials(
        Array.isArray(data)
          ? data.map((t: ApiTestimonial) => ({
              quote: t.message,
              author: t.name,
              position: t.position || "",
              rating: t.rating ?? undefined,
            }))
          : [],
      );
    } catch {
      setTestimonialsError("We couldn’t load client feedback. Please try again.");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchTestimonials();
  }, []);

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#F5F3EE]">
        <div className="absolute top-0 right-0 w-150 h-150 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full bg-blue-400/8 blur-[80px] pointer-events-none" />
        <div className="relative container mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-10 items-center py-12 sm:py-16 lg:py-20">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-7"
              style={{ animation: "fadeUp 0.42s 0s ease" }}
            >
              <span className="block w-7 h-0.5 bg-blue-600 rounded-full" />
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-700">
                UK consulting &amp; technology
              </span>
            </div>
            <h1
              className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#0D0D0D]"
              style={{ animation: "fadeUp 0.42s 0.06s ease" }}
            >
              Technology consulting &amp; <span className="text-blue-700">research support</span>
            </h1>
            <p
              className="mt-6 text-base lg:text-lg font-light text-gray-600 leading-relaxed max-w-xl"
              style={{ animation: "fadeUp 0.42s 0.12s ease" }}
            >
              Practical IT advice, software development and data solutions for
              businesses. Research guidance for applicants preparing for an
              MRes, MPhil or PhD. Based in the UK, working internationally.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-3 mt-8"
              style={{ animation: "fadeUp 0.42s 0.18s ease" }}
            >
              <Link
                href="/contact"
                className="inline-block bg-[#0D0D0D] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 text-white text-sm font-semibold px-7 py-3.5 rounded-lg transition-all duration-200"
              >
                Contact ACCIAN →
              </Link>
              <Link
                href="/services"
                className="inline-block border border-gray-300 hover:border-[#0D0D0D] hover:-translate-y-0.5 text-[#0D0D0D] text-sm font-medium px-7 py-3.5 rounded-lg transition-all duration-200 text-center"
              >
                Explore services
              </Link>
            </div>
            <p
              className="mt-7 text-xs font-light text-gray-600"
              style={{ animation: "fadeUp 0.42s 0.24s ease" }}
            >
              Accian Limited is an independent UK company and is not affiliated
              with Accion or any similarly named organisations.
            </p>
          </div>

          <aside className="space-y-4" aria-label="Choose your pathway">
            <div className="rounded-2xl bg-[#0D0D0D] p-6 text-white sm:p-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">For businesses &amp; organisations</p>
              <h2 className="text-2xl font-semibold">Plan, build or improve your technology</h2>
              <p className="mt-3 text-sm text-white/80">Explore IT consulting, software, training, social care and data services.</p>
              <Link href="/services" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-white underline underline-offset-4">Explore technology services →</Link>
            </div>
            <div className="rounded-2xl border border-[#D8D3C9] bg-white p-6 sm:p-8">
              <p className="eyebrow mb-3">For research applicants</p>
              <h2 className="text-2xl font-semibold">Shape your research application</h2>
              <p className="mt-3 text-sm text-[#555555]">Get support with your topic, supervisor search, proposal and application.</p>
              <Link href="/research-support" className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[#1B4FFF] underline underline-offset-4">Explore research support →</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-14 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-2">
                Core Services
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0D0D0D] leading-tight">
                Practical services for your needs
              </h2>
            </div>
            <p className="text-sm font-light text-gray-600 leading-relaxed max-w-sm lg:text-right">
              Explore what each service includes, then tell us what you need help with.
            </p>
          </Reveal>

          {loading ? (
            <div role="status" aria-label="Loading services" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[#555555] mb-4" role="status">{error}</p>
              <button
                onClick={fetchServices}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Try again
              </button>
            </div>
          ) : services.length === 0 ? (
            <p className="text-sm text-[#555555]">No services are currently listed. <Link href="/services" className="text-[#1B4FFF] underline">View our service overview</Link> or <Link href="/contact" className="text-[#1B4FFF] underline">contact ACCIAN</Link>.</p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => {
                const anchors: Record<string, string> = { "it-consulting-advisory": "it-consulting", "it-consulting": "it-consulting", "software-development": "software-development", "education-training": "education-training", "social-care": "social-care", "social-care-community-support": "social-care", "data-science-ai": "data-science-ai" };
                return <Reveal key={service.id || service.slug} delay={index * 80} className="h-full"><ServiceCard {...service} features={service.features || []} link={anchors[service.slug] ? `/services#${anchors[service.slug]}` : "/services"} /></Reveal>;
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#0D0D0D] border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {stats.map((stat, i) => (
              <AnimatedStat key={i} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL PRESENCE ───────────────────────────────────────────────── */}
      <section id="about" className="bg-[#F5F3EE] py-14 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal direction="left">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-3">
              Our Global Presence
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-5">
              UK-registered.
              <br />
              <span className="text-blue-700">Globally</span> delivered.
            </h2>
            <p className="text-sm font-light text-gray-600 leading-relaxed mb-4">
              ACCIAN operates as a UK-registered company, delivering
              high-quality digital solutions that meet international standards,
              while remaining agile, innovative, and focused on creating
              measurable value for clients.
            </p>
            <p className="text-sm font-light text-gray-600 leading-relaxed mb-6">
              We combine technical excellence with strategic thinking to provide
              comprehensive digital solutions that drive measurable business
              outcomes. Our approach is mission-driven, results-focused, and
              security-conscious.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "International Operations",
                "Enterprise Delivery",
                "Worldwide Client Services",
              ].map((t) => (
                <span
                  key={t}
                  className="text-xs font-medium bg-[#EDE9E0] border border-[#D8D3C9] text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-600/30 hover:bg-blue-600/5 transition-colors duration-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <div className="relative">
              <p className="absolute -top-4 -right-2 text-[10rem] font-black text-[#E8E4DA] leading-none pointer-events-none select-none tracking-tighter">
                UK
              </p>
              <div className="relative z-10 bg-[#0D0D0D] rounded-2xl p-8 text-white hover:shadow-2xl hover:shadow-black/40 transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                    <Globe size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-base">ACCIAN Limited</p>
                    <p className="text-xs font-light text-white/75">
                      UK Registered Company
                    </p>
                  </div>
                </div>
                <dl className="space-y-4 text-sm">
                  <div><dt className="text-white/75">Company number</dt><dd className="mt-1 font-semibold">16910869</dd></div>
                  <div><dt className="text-white/75">Registered office</dt><dd className="mt-1">4 Lidgett Ln, Garforth, Leeds LS25 1EQ</dd></div>
                  <div><dt className="text-white/75">Enquiries</dt><dd><a href="mailto:info@accian.co.uk" className="inline-flex min-h-11 items-center underline underline-offset-4">info@accian.co.uk</a></dd></div>
                </dl>
                <div className="mt-5 pt-4 border-t border-white/8">
                  <p className="text-[10px] font-light text-white/75 italic">
                    Not affiliated with Accion or any similarly named
                    organisations
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── WHY ACCIAN ────────────────────────────────────────────────────── */}
      <section className="bg-[#EDE9E0] py-0">
        <div className="container mx-auto px-6 lg:px-12">
          <Reveal className="py-16 border-b border-[#D8D3C9] flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-2">
                Why Partner With ACCIAN?
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0D0D0D] leading-tight">
                Technology partners,
                <br />
                not just <span className="text-blue-700">vendors</span>
              </h2>
            </div>
            <p className="text-sm font-light text-gray-600 leading-relaxed max-w-sm lg:text-right">
              Your trusted technology partner for digital transformation and
              innovation — we become an extension of your team.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {trustIndicators.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="py-10 px-2 lg:px-6 border-b border-[#D8D3C9] hover:bg-[#E3DED5] hover:pl-8 lg:hover:pl-10 transition-all duration-300 cursor-default group">
                  <p className="text-4xl font-black text-gray-600 mb-3 leading-none group-hover:text-blue-700 transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                      <item.icon
                        size={18}
                        className="text-blue-700 group-hover:text-white transition-colors duration-300"
                      />
                    </div>
                    <h3 className="font-semibold text-[#0D0D0D] text-base leading-snug pt-1">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm font-light text-gray-600 leading-relaxed pl-12">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:px-6 sm:py-20 lg:px-12">
        <div className="container mx-auto flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl"><p className="eyebrow mb-3">Research support</p><h2 className="text-3xl font-bold lg:text-4xl">Preparing a research application?</h2><p className="mt-4 text-sm text-[#555555]">Start with your academic background and interests. Our pre-consultation form helps the team understand where you need support before your consultation.</p></div>
          <Link href="/pre-consultation" className="btn-primary shrink-0">Start pre-consultation →</Link>
        </div>
      </section>
      <ProjectHighlights />

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-14 sm:py-20 px-4 sm:px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-700 mb-2">
              What Our Clients Say
            </p>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-12">
              Don&apos;t just take our{" "}
              <span className="text-blue-700">word</span> for it
            </h2>
          </Reveal>

          {testimonialsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <TestimonialSkeleton key={i} />
              ))}
            </div>
          ) : testimonialsError ? (
            <div className="text-center py-12">
              <p className="text-[#555555] mb-4" role="status">{testimonialsError}</p>
              <button
                onClick={fetchTestimonials}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Try again
              </button>
            </div>
          ) : testimonials.length === 0 ? (
            <p className="text-sm text-[#555555]">No client feedback is currently published.</p>
          ) : (
            <>
              {testimonials[0] && (
                <Reveal delay={80}>
                  <div className="relative overflow-hidden bg-[#0D0D0D] rounded-2xl p-10 lg:p-14 mb-4 hover:shadow-2xl hover:shadow-black/30 transition-shadow duration-300 group">
                    <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-blue-600/8 pointer-events-none group-hover:bg-blue-600/15 transition-colors duration-300" />
                    <p className="text-xl lg:text-2xl font-light italic text-white/90 leading-relaxed max-w-3xl mb-8">
                      &ldquo;{testimonials[0].quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shrink-0">
                        {testimonials[0].author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {testimonials[0].author}
                        </p>
                        <p className="text-xs font-light text-white/75">
                          {testimonials[0].position}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testimonials.slice(1).map((t, i) => (
                  <Reveal key={i} delay={i * 100 + 120}>
                    <div className="bg-[#EDE9E0] border border-[#E0DBD2] rounded-2xl p-7 hover:border-blue-600/25 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300">
                      <div className="flex gap-0.5 mb-4" role={t.rating ? "img" : undefined} aria-label={t.rating ? `${t.rating} out of 5 stars` : undefined}>
                        {Array.from({ length: Math.max(0, Math.min(5, Math.round(t.rating ?? 0))) }).map((_, j) => (
                          <Star
                            key={j}
                            size={14}
                            className="fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                      <p className="text-sm font-light italic text-gray-600 leading-relaxed mb-5">
                        &ldquo;{t.quote}&rdquo;
                      </p>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#0D0D0D] flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {t.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-[#0D0D0D] text-sm">
                            {t.author}
                          </p>
                          <p className="text-xs font-light text-gray-600">
                            {t.position}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        id="contact"
        className="relative overflow-hidden bg-[#0D0D0D] py-14 sm:py-20 px-4 sm:px-6 lg:px-12"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-600/6 pointer-events-none" />
        <div className="relative container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-4">
              Get in Touch
            </p>
            <h2 className="text-3xl lg:text-4xl xl:text-6xl font-bold tracking-tight text-white leading-tight mb-5">
              Tell us what you need help with
            </h2>
            <p className="text-sm font-light text-white/75 leading-relaxed max-w-md mb-8">
              Share your goals, current challenges and any deadlines. We’ll help you identify the relevant service and the next step.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:opacity-85 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 text-white text-sm font-semibold px-7 py-3.5 rounded-lg transition-all duration-200 text-center"
              >
                Contact ACCIAN →
              </Link>
              <Link
                href="/services"
                className="inline-block border border-white/15 hover:border-white/40 hover:-translate-y-0.5 text-white text-sm font-medium px-7 py-3.5 rounded-lg transition-all duration-200 text-center"
              >
                View Our Services
              </Link>
            </div>
          </Reveal>

          <Reveal direction="right" delay={150}>
            <div className="flex flex-col gap-3">
              {[
                {
                  icon: <Clock size={18} className="text-blue-400" />,
                  label: "Business Hours",
                  val: "Mon–Fri, 9AM–5PM GMT",
                },
                {
                  icon: (
                    <svg
                      className="text-blue-400 w-4.5 h-4.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.19 11.8 19.79 19.79 0 0 1 1.12 3.18 2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  ),
                  label: "Phone",
                  val: "+44 7749 101623",
                },
                {
                  icon: (
                    <svg
                      className="text-blue-400 w-4.5 h-4.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: "Email",
                  val: "info@accian.co.uk",
                },
              ].map((c, i) => (
                <div
                  key={c.label}
                  className="flex items-center gap-4 bg-white/4 border border-white/8 hover:border-blue-600/40 hover:bg-white/8 hover:-translate-y-0.5 rounded-xl px-5 py-4 transition-all duration-200"
                  style={{ transitionDelay: `${i * 60}ms` }}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/75 mb-0.5">
                      {c.label}
                    </p>
                    <p className="text-sm text-white">{c.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
