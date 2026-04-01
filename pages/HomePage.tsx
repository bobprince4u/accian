"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Globe, Clock, Star } from "lucide-react";
import { trustIndicators, stats } from "../data/HomPageData";
import { API_URL } from "../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────
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
interface TestimonialResponse {
  testimonialText: string;
  clientName: string;
  clientPosition?: string;
  rating?: number;
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}) {
  const { ref, visible } = useReveal();
  const t =
    direction === "left"
      ? "translateX(-32px)"
      : direction === "right"
        ? "translateX(32px)"
        : "translateY(32px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : t,
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

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
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className="py-10 px-6 lg:px-10"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.6s ease, transform 0.6s ease",
      }}
    >
      <p className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
        {number}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{label}</p>
      <p className="mt-0.5 text-xs font-light text-white/30">{description}</p>
    </div>
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

const MARQUEE_ITEMS = [
  "Cyber security",
  "Cloud Infrastructure",
  "Digital Transformation",
  "ISO 27001",
  "Penetration Testing",
  "Managed IT",
  "GDPR Compliance",
  "Incident Response",
  "SOC 2",
  "Cyber Essentials",
  "AI Integration",
];

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
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      const data = res.data.data || res.data;
      setServices(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/testimonials`);
      const data = res.data.data || res.data;
      setTestimonials(
        Array.isArray(data)
          ? data.map((t: TestimonialResponse) => ({
              quote: t.testimonialText,
              author: t.clientName,
              position: t.clientPosition || "",
              rating: t.rating || 5,
            }))
          : [],
      );
    } catch {
      setTestimonialsError("Failed to fetch testimonials");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchTestimonials();
  }, []);

  return (
    <main>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden bg-[#F5F3EE]">
        <div className="absolute top-0 right-0 w-150 h-150 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-100 h-100 rounded-full bg-blue-400/8 blur-[80px] pointer-events-none" />
        <div className="relative container mx-auto px-6 lg:px-12 min-h-screen grid lg:grid-cols-2 gap-12 items-center pt-24 pb-16">
          <div>
            <div
              className="inline-flex items-center gap-2 mb-7"
              style={{ animation: "fadeUp 0.6s 0.1s ease both" }}
            >
              <span className="block w-7 h-0.5 bg-blue-600 rounded-full" />
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-600">
                UK Technology &amp; Cyber security
              </span>
            </div>
            <h1
              className="text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.08] tracking-tight text-[#0D0D0D]"
              style={{ animation: "fadeUp 0.7s 0.2s ease both" }}
            >
              Global IT, <span className="text-blue-600">Cyber security</span>{" "}
              &amp; Digital Solutions
            </h1>
            <p
              className="mt-6 text-base lg:text-lg font-light text-gray-500 leading-relaxed max-w-xl"
              style={{ animation: "fadeUp 0.7s 0.35s ease both" }}
            >
              ACCIAN is a UK-registered technology and cyber security company
              delivering secure, scalable, and intelligent digital solutions
              that help businesses grow, automate, and stay protected.
            </p>
            <div
              className="flex flex-col sm:flex-row gap-3 mt-8"
              style={{ animation: "fadeUp 0.7s 0.5s ease both" }}
            >
              <Link
                href="/contact"
                className="inline-block bg-[#0D0D0D] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 text-white text-sm font-semibold px-7 py-3.5 rounded-lg transition-all duration-200"
              >
                Request Consultation →
              </Link>
              <Link
                href="/services"
                className="inline-block border border-gray-300 hover:border-[#0D0D0D] hover:-translate-y-0.5 text-[#0D0D0D] text-sm font-medium px-7 py-3.5 rounded-lg transition-all duration-200 text-center"
              >
                Explore Our Services
              </Link>
            </div>
            <p
              className="mt-7 text-xs font-light text-gray-400"
              style={{ animation: "fadeUp 0.7s 0.65s ease both" }}
            >
              Accian Limited is an independent UK company and is not affiliated
              with Accion or any similarly named organisations.
            </p>
          </div>

          <div
            className="hidden lg:flex flex-col gap-3"
            style={{ animation: "fadeUp 0.9s 0.4s ease both" }}
          >
            <div className="relative overflow-hidden bg-[#0D0D0D] rounded-2xl p-10 hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-600/15 pointer-events-none" />
              <p className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-2">
                Clients protected
              </p>
              <p className="text-7xl font-extrabold text-white tracking-tight leading-none">
                7<span className="text-blue-500">+</span>
              </p>
              <p className="mt-2 text-sm font-light text-white/40">
                Organisations worldwide
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#EDE9E0] rounded-2xl p-7 hover:scale-[1.03] transition-transform duration-300">
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-2">
                  Uptime SLA
                </p>
                <p className="text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
                  92.9<span className="text-2xl">%</span>
                </p>
              </div>
              <div className="bg-blue-600 rounded-2xl p-7 hover:scale-[1.03] transition-transform duration-300">
                <p className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-2">
                  Monitoring
                </p>
                <p className="text-4xl font-extrabold text-white tracking-tight">
                  24/7
                </p>
              </div>
            </div>
            <div className="bg-[#EDE9E0] rounded-2xl px-8 py-5 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-1">
                  Experience
                </p>
                <p className="text-3xl font-extrabold text-[#0D0D0D] tracking-tight">
                  4+ Years
                </p>
              </div>
              <div className="flex gap-1.5">
                {["ISO", "GDPR", "CE"].map((b) => (
                  <span
                    key={b}
                    className="text-[10px] font-bold bg-[#0D0D0D] text-white px-2 py-1 rounded"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────────────────── */}
      <div className="overflow-hidden border-y border-gray-200 bg-[#ECEAE3] py-3.5">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 mr-12 text-[11px] font-semibold tracking-widest uppercase text-[#333]"
            >
              {item}
              <span className="w-1 h-1 rounded-full bg-blue-600 shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ── SERVICES ──────────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
                Core Services
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight">
                Everything your business
                <br />
                needs to <span className="text-blue-600">thrive</span>
              </h2>
            </div>
            <p className="text-sm font-light text-gray-500 leading-relaxed max-w-sm lg:text-right">
              From securing your perimeter to transforming your digital
              operations — end to end.
            </p>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(5)].map((_, i) => (
                <ServiceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchServices}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {services[0] && (
                <Reveal className="lg:col-span-4" delay={0}>
                  <div className="relative overflow-hidden bg-[#0D0D0D] rounded-2xl p-10 h-full hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-600/15 transition-all duration-300 group">
                    <div className="absolute -top-14 -right-14 w-56 h-56 rounded-full bg-blue-600/12 pointer-events-none group-hover:bg-blue-600/20 transition-colors duration-300" />
                    <span className="inline-block text-[10px] font-semibold tracking-widest uppercase bg-blue-600/20 text-blue-300 px-2.5 py-1 rounded mb-4">
                      Featured
                    </span>
                    <h3 className="text-3xl font-bold text-white leading-snug mb-3 max-w-sm">
                      {services[0].title}
                    </h3>
                    <p className="text-sm font-light text-white/55 leading-relaxed max-w-lg">
                      {services[0].description}
                    </p>
                    {services[0].features && (
                      <ul className="mt-5 space-y-2">
                        {services[0].features.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-sm text-white/45"
                          >
                            <span className="text-blue-400 font-bold">→</span>{" "}
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href={services[0].link || "/services"}
                      className="inline-flex items-center gap-1.5 mt-7 text-xs font-semibold text-white border-b border-white/30 pb-0.5 hover:border-white hover:gap-3 transition-all duration-200"
                    >
                      Learn more →
                    </Link>
                  </div>
                </Reveal>
              )}
              {services[1] && (
                <Reveal className="lg:col-span-2" delay={80}>
                  <div className="bg-blue-600 rounded-2xl p-8 h-full hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-300">
                    <span className="inline-block text-[10px] font-semibold tracking-widest uppercase bg-white/15 text-white px-2.5 py-1 rounded mb-4">
                      Cloud
                    </span>
                    <h3 className="text-xl font-semibold text-white leading-snug mb-3">
                      {services[1].title}
                    </h3>
                    <p className="text-sm font-light text-white/60 leading-relaxed">
                      {services[1].description}
                    </p>
                  </div>
                </Reveal>
              )}
              {services.slice(2).map((svc, i) => (
                <Reveal
                  key={svc.id || svc.slug}
                  className="lg:col-span-2"
                  delay={(i + 2) * 80}
                >
                  <div className="bg-[#EDE9E0] border border-[#E0DBD2] rounded-2xl p-8 h-full hover:bg-[#0D0D0D] hover:text-white hover:-translate-y-2 hover:shadow-xl hover:border-transparent group transition-all duration-300">
                    <h3 className="text-lg font-semibold text-[#0D0D0D] group-hover:text-white leading-snug mb-3 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-sm font-light text-gray-500 group-hover:text-white/55 leading-relaxed transition-colors">
                      {svc.description}
                    </p>
                  </div>
                </Reveal>
              ))}
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
      <section className="bg-[#F5F3EE] py-24 px-6 lg:px-12">
        <div className="container mx-auto grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <Reveal direction="left">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
              Our Global Presence
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-5">
              UK-registered.
              <br />
              <span className="text-blue-600">Globally</span> delivered.
            </h2>
            <p className="text-sm font-light text-gray-500 leading-relaxed mb-4">
              ACCIAN operates as a UK-registered company, delivering
              high-quality digital solutions that meet international standards,
              while remaining agile, innovative, and focused on creating
              measurable value for clients.
            </p>
            <p className="text-sm font-light text-gray-500 leading-relaxed mb-6">
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
                    <p className="text-xs font-light text-white/40">
                      UK Registered Company
                    </p>
                  </div>
                </div>
                {[
                  {
                    label: "Threat Detection Rate",
                    val: "99.7%",
                    width: "99.7%",
                  },
                  { label: "Client Retention", val: "96%", width: "96%" },
                ].map((m) => (
                  <div key={m.label} className="mb-4">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-light text-white/50">
                        {m.label}
                      </span>
                      <span className="text-xs font-bold">{m.val}</span>
                    </div>
                    <div className="h-1 bg-white/8 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: m.width }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-5 pt-4 border-t border-white/8">
                  <p className="text-[10px] font-light text-white/25 italic">
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
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
                Why Partner With ACCIAN?
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight">
                Technology partners,
                <br />
                not just <span className="text-blue-600">vendors</span>
              </h2>
            </div>
            <p className="text-sm font-light text-gray-500 leading-relaxed max-w-sm lg:text-right">
              Your trusted technology partner for digital transformation and
              innovation — we become an extension of your team.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {trustIndicators.map((item, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="py-10 px-2 lg:px-6 border-b border-[#D8D3C9] hover:bg-[#E3DED5] hover:pl-8 lg:hover:pl-10 transition-all duration-300 cursor-default group">
                  <p className="text-4xl font-black text-[#CCC8BF] mb-3 leading-none group-hover:text-blue-600/20 transition-colors duration-300">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                      <item.icon
                        size={18}
                        className="text-blue-600 group-hover:text-white transition-colors duration-300"
                      />
                    </div>
                    <h4 className="font-semibold text-[#0D0D0D] text-base leading-snug pt-1">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-sm font-light text-gray-500 leading-relaxed pl-12">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
              What Our Clients Say
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-12">
              Don&apos;t just take our{" "}
              <span className="text-blue-600">word</span> for it
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
              <p className="text-red-500 mb-4">{testimonialsError}</p>
              <button
                onClick={fetchTestimonials}
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
              >
                Retry
              </button>
            </div>
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
                        <p className="text-xs font-light text-white/40">
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
                      <div className="flex gap-0.5 mb-4">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            size={14}
                            className="fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                      <p className="text-sm font-light italic text-gray-500 leading-relaxed mb-5">
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
                          <p className="text-xs font-light text-gray-400">
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
        className="relative overflow-hidden bg-[#0D0D0D] py-24 px-6 lg:px-12"
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-600/6 pointer-events-none" />
        <div className="relative container mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <Reveal direction="left">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-4">
              Get in Touch
            </p>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight mb-5">
              Ready to Transform
              <br />
              Your Business <span className="text-blue-500">Digitally?</span>
            </h2>
            <p className="text-sm font-light text-white/50 leading-relaxed max-w-md mb-8">
              Let&apos;s collaborate to build secure, scalable, and intelligent
              systems that drive your business forward. Our expert team is ready
              to transform your digital vision into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact"
                className="inline-block bg-blue-600 hover:opacity-85 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 text-white text-sm font-semibold px-7 py-3.5 rounded-lg transition-all duration-200 text-center"
              >
                Request Consultation →
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
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-0.5">
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
    </main>
  );
}
