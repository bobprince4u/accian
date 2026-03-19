"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowRight, ChevronDown } from "lucide-react";
import {
  detailedServices,
  industries,
  comparisonData,
  processSteps,
  faqs,
} from "../data/ServicesMock";

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
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
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Image with pulse skeleton ────────────────────────────────────────────────
function ServiceImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full h-[420px] rounded-2xl overflow-hidden">
      {/* Pulse skeleton shown until image loads */}
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse">
          <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-[shimmer_1.5s_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
      />
      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`border rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ${
        open
          ? "border-blue-600/40 bg-white shadow-sm shadow-blue-600/5"
          : "border-[#D8D3C9] bg-white hover:border-blue-600/20"
      }`}
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between px-6 py-5 gap-4">
        <h4 className="font-semibold text-[#0D0D0D] text-sm leading-snug">
          {question}
        </h4>
        <ChevronDown
          size={18}
          className={`text-blue-600 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </div>
      <div
        style={{
          maxHeight: open ? "400px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <div className="px-6 pb-6 border-t border-gray-100">
          <p className="text-sm font-light text-gray-500 leading-relaxed pt-4">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Info checklist ───────────────────────────────────────────────────────────
function InfoChecklist({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-[#F5F3EE] border border-[#E8E4DC] rounded-xl p-5">
      <p className="text-xs font-semibold tracking-widest uppercase text-[#0D0D0D] mb-3">
        {title}
      </p>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="flex items-start gap-2 text-sm font-light text-gray-500"
          >
            <CheckCircle2 size={14} className="text-blue-600 mt-0.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [activeService, setActiveService] = useState(0);

  return (
    <main className="bg-[#F5F3EE]">
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden bg-[#0D0D0D] pb-16">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/images/hero-poster.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-transparent" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />

        <div className="relative container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="block w-7 h-0.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">
                What We Offer
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl xl:text-7xl font-extrabold text-white tracking-tight leading-[1.06] mb-5">
              Comprehensive IT
              <br />
              <span className="text-blue-500">Solutions</span> for Modern
              <br />
              Businesses
            </h1>
            <p className="text-sm lg:text-base font-light text-white/50 leading-relaxed max-w-xl">
              End-to-end technology solutions across the UK and worldwide that
              drive growth, enhance security, and optimise operations.
            </p>
          </div>

          {/* Service quick-nav pills */}
          <div className="flex flex-wrap gap-2 mt-10">
            {detailedServices.map((svc, i) => (
              <a
                key={svc.id}
                href={`#${svc.id}`}
                onClick={() => setActiveService(i)}
                className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                  activeService === i
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white/8 border-white/15 text-white/60 hover:text-white hover:border-white/30"
                }`}
              >
                {svc.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── DETAILED SERVICES ─────────────────────────────────────────────── */}
      {detailedServices.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`py-24 px-6 lg:px-12 ${index % 2 === 0 ? "bg-[#F5F3EE]" : "bg-[#EDE9E0]"}`}
        >
          <div className="container mx-auto">
            {/* Section number + title bar */}
            <Reveal className="flex items-center gap-4 mb-14">
              <span className="text-6xl font-black text-[#0D0D0D]/8 leading-none select-none">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 h-px bg-[#D8D3C9]" />
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-600">
                {service.title}
              </span>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-start">
              {/* Text side */}
              <Reveal
                delay={80}
                className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}
              >
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center mb-6 hover:scale-110 transition-transform duration-300">
                  {React.createElement(service.icon, {
                    className: "text-white",
                    size: 28,
                  })}
                </div>

                <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-5">
                  {service.title}
                </h2>
                <p className="text-sm font-light text-gray-500 leading-relaxed mb-8">
                  {service.overview}
                </p>

                {/* Deliverables */}
                <p className="text-xs font-semibold tracking-widest uppercase text-[#0D0D0D] mb-4">
                  What We Deliver
                </p>
                <div className="space-y-3 mb-8">
                  {service.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-transparent hover:border-blue-600/15 hover:bg-white transition-all duration-200"
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5">
                        {React.createElement(item.icon, {
                          className: "text-blue-600",
                          size: 18,
                        })}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0D0D0D] text-sm mb-0.5">
                          {item.name}
                        </p>
                        <p className="text-sm font-light text-gray-500 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-[#0D0D0D] hover:bg-blue-600 text-white text-sm font-semibold px-6 py-3.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/20"
                >
                  Discuss Your Project
                  <ArrowRight size={16} />
                </Link>
              </Reveal>

              {/* Visual side */}
              <Reveal
                delay={160}
                className={index % 2 === 0 ? "order-2" : "order-2 lg:order-1"}
              >
                {/* Image with pulse skeleton */}
                <div className="mb-4 hover:scale-[1.01] transition-transform duration-500 shadow-xl rounded-2xl">
                  <ServiceImage src={service.image} alt={service.title} />
                </div>

                {/* Info cards with staggered animation */}
                <div className="space-y-3">
                  {"techStack" in service && service.techStack && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-600/20 hover:shadow-sm transition-all duration-200">
                      <p className="text-xs font-semibold tracking-widest uppercase text-[#0D0D0D] mb-3">
                        Technology Stack
                      </p>
                      <div className="space-y-1.5">
                        {Object.entries(service.techStack).map(
                          ([key, values]) => (
                            <div key={key} className="text-sm">
                              <span className="font-semibold text-[#0D0D0D]">
                                {key}:{" "}
                              </span>
                              <span className="font-light text-gray-500">
                                {Array.isArray(values)
                                  ? values.join(", ")
                                  : values != null
                                    ? String(values)
                                    : ""}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                  {"aiCapabilities" in service &&
                    Array.isArray(service.aiCapabilities) && (
                      <InfoChecklist
                        title="AI Capabilities"
                        items={service.aiCapabilities as string[]}
                      />
                    )}
                  {"testingTypes" in service &&
                    Array.isArray(service.testingTypes) && (
                      <InfoChecklist
                        title="Testing Types"
                        items={service.testingTypes as string[]}
                      />
                    )}
                  {"keyBenefits" in service && service.keyBenefits && (
                    <InfoChecklist
                      title="Key Benefits"
                      items={service.keyBenefits as string[]}
                    />
                  )}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* ── INDUSTRIES ────────────────────────────────────────────────────── */}
      <section className="bg-[#0D0D0D] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
                Industries
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                Industries We <span className="text-blue-500">Serve</span>
              </h2>
            </div>
            <p className="text-sm font-light text-white/45 leading-relaxed max-w-sm lg:text-right">
              Specialised solutions tailored to the unique needs of your
              industry.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry, index) => (
              <Reveal key={index} delay={index * 60}>
                <div className="bg-white/4 border border-white/8 hover:border-blue-600/50 hover:bg-white/8 rounded-2xl p-7 transition-all duration-300 group cursor-default hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-600/10">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300 inline-block">
                    {industry.icon}
                  </div>
                  <h4 className="font-semibold text-white text-base mb-2 group-hover:text-blue-400 transition-colors duration-200">
                    {industry.name}
                  </h4>
                  <p className="text-sm font-light text-white/45 leading-relaxed">
                    {industry.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ──────────────────────────────────────────────── */}
      <section className="bg-[#EDE9E0] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
              Comparison
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-3">
              Choose the Right Service
              <br />
              <span className="text-blue-600">for Your Needs</span>
            </h2>
            <p className="text-sm font-light text-gray-500 max-w-xl">
              A quick overview to help you identify the best solution.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="overflow-x-auto rounded-2xl border border-[#D8D3C9] shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0D0D0D] text-white">
                    {[
                      "Service",
                      "Best For",
                      "Timeline",
                      "Investment Level",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 font-semibold text-xs tracking-widest uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-t border-[#D8D3C9] transition-colors duration-150 hover:bg-blue-600/5 ${
                        index % 2 === 0 ? "bg-white" : "bg-[#EDE9E0]"
                      }`}
                    >
                      <td className="px-6 py-4 font-semibold text-[#0D0D0D]">
                        {row.service}
                      </td>
                      <td className="px-6 py-4 font-light text-gray-500">
                        {row.bestFor}
                      </td>
                      <td className="px-6 py-4 font-light text-gray-500">
                        {row.timeline}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block text-xs font-semibold bg-blue-600/10 text-blue-700 px-3 py-1 rounded-full">
                          {row.investment}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW WE WORK — horizontal timeline ─────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Our Process
              </p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight">
                How We Work <span className="text-blue-600">With You</span>
              </h2>
            </div>
            <p className="text-sm font-light text-gray-500 leading-relaxed max-w-sm lg:text-right">
              Our proven process ensures successful delivery and exceptional
              results.
            </p>
          </Reveal>

          {/* Timeline */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-[#D8D3C9]" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, index) => (
                <Reveal key={index} delay={index * 100}>
                  <div className="group relative">
                    {/* Step indicator */}
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-[#D8D3C9] group-hover:border-blue-600 group-hover:bg-blue-600 flex items-center justify-center mb-6 transition-all duration-300 shadow-sm">
                      <span className="text-xl font-black text-[#0D0D0D]/20 group-hover:text-white transition-colors duration-300">
                        {step.number}
                      </span>
                    </div>

                    <h4 className="font-semibold text-[#0D0D0D] text-base mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {step.title}
                    </h4>
                    <p className="text-sm font-light text-gray-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQs ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#EDE9E0] py-24 px-6 lg:px-12">
        <div className="container mx-auto grid lg:grid-cols-5 gap-16 items-start">
          {/* Left sticky label */}
          <Reveal className="lg:col-span-2 lg:sticky lg:top-28">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
              FAQs
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-[#0D0D0D] leading-tight mb-4">
              Common
              <br />
              Questions
              <br />
              <span className="text-blue-600">Answered</span>
            </h2>
            <p className="text-sm font-light text-gray-500 leading-relaxed">
              Can&apos;t find what you&apos;re looking for? Reach out directly.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-blue-600 hover:gap-3 transition-all duration-200"
            >
              Ask us directly <ArrowRight size={15} />
            </Link>
          </Reveal>

          {/* Right accordion */}
          <div className="lg:col-span-3 space-y-3">
            {faqs.map((faq, index) => (
              <Reveal key={index} delay={index * 60}>
                <FaqItem question={faq.question} answer={faq.answer} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] py-28 px-6 lg:px-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-600/10 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-600/6 pointer-events-none" />

        <div className="relative container mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-4">
              Get Started
            </p>
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-white leading-tight mb-5">
              Let&apos;s Discuss Your
              <br />
              <span className="text-blue-500">Technology Needs</span>
            </h2>
            <p className="text-sm font-light text-white/50 leading-relaxed max-w-xl mx-auto mb-10">
              Our expert team is ready to help you identify the right solutions
              for your business challenges. Schedule a complimentary
              consultation to explore how we can drive your digital success.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-blue-600 hover:opacity-85 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/30 text-white text-sm font-semibold px-8 py-4 rounded-lg transition-all duration-200"
            >
              Request Free Consultation
              <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
