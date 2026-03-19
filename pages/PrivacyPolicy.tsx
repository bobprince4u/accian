"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Eye,
  Lock,
  Cookie,
  Building2,
  Mail,
} from "lucide-react";

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
      ? "translateX(-28px)"
      : direction === "right"
        ? "translateX(28px)"
        : "translateY(28px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate(0)" : t,
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const sections = [
  {
    icon: Eye,
    title: "Information We Collect",
    body: "We may collect personal information such as your name, email address, phone number (if provided), and any message you submit via our contact forms.",
    highlight: "Name, email, phone number, messages",
  },
  {
    icon: Shield,
    title: "How We Use Your Information",
    body: "Your information is used only to respond to enquiries, provide requested services, communicate with you, and comply with legal obligations.",
    highlight: "Never sold or shared with third parties",
  },
  {
    icon: Lock,
    title: "Data Protection Rights",
    body: "You have the right to request access to, correction of, or deletion of your personal data. You may also object to or restrict processing in certain circumstances.",
    highlight: "Access, correct, or delete your data",
  },
  {
    icon: Cookie,
    title: "Cookies",
    body: "Our website may use cookies to improve functionality and user experience. You can manage cookie preferences through your browser settings.",
    highlight: "Managed via browser settings",
  },
  {
    icon: Building2,
    title: "Company Identity",
    body: "Accian Limited is an independent UK company and is not affiliated with Accion or any similarly named organizations.",
    highlight: "Company No. 16910869 · England & Wales",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PrivacyPolicy() {
  return (
    <main className="bg-[#F5F3EE] min-h-screen">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes barGrow { from { width:0%; } to { width:100%; } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] min-h-[55vh] flex items-end pb-16">
        {/* Orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-blue-600/12 blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-blue-600/8 blur-[80px] pointer-events-none" />

        <div className="relative container mx-auto px-6 lg:px-12">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 mb-6"
              style={{ animation: "fadeUp 0.6s 0.1s ease both" }}
            >
              <span className="block w-7 h-0.5 bg-blue-500 rounded-full" />
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">
                Legal
              </span>
            </div>

            <h1
              className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.04] mb-5"
              style={{ animation: "fadeUp 0.7s 0.2s ease both" }}
            >
              Privacy
              <br />
              <span className="text-blue-500">Policy</span>
            </h1>

            <p
              className="text-sm font-light text-white/40 mb-8"
              style={{ animation: "fadeUp 0.6s 0.35s ease both" }}
            >
              Last updated: 15 December 2025
            </p>

            {/* Quick-jump nav */}
            <div
              className="flex flex-wrap gap-2"
              style={{ animation: "fadeUp 0.6s 0.45s ease both" }}
            >
              {sections.map((s) => (
                <a
                  key={s.title}
                  href={`#${s.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-xs font-medium bg-white/8 border border-white/10 hover:bg-blue-600 hover:border-blue-600 text-white/60 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200"
                >
                  {s.title}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BLUE RULE ─────────────────────────────────────────────────────── */}
      <div
        className="h-1 bg-blue-600"
        style={{ animation: "barGrow 1s 0.5s ease both", width: "0%" }}
      />

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* ── LEFT — sticky summary ──────────────────────────────────── */}
            <Reveal direction="left" className="lg:sticky lg:top-28">
              <div className="bg-[#0D0D0D] rounded-2xl p-7 text-white">
                <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">
                  Summary
                </p>
                <h2 className="text-xl font-bold leading-snug mb-5">
                  We protect your data.
                  <br />
                  Full stop.
                </h2>
                <div className="space-y-4">
                  {[
                    "We collect only what we need",
                    "We never sell your data",
                    "You control your information",
                    "We comply with UK GDPR",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      </div>
                      <p className="text-sm font-light text-white/60">{item}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-7 pt-6 border-t border-white/8">
                  <p className="text-xs font-light text-white/30 mb-3">
                    Questions?
                  </p>
                  <a
                    href="mailto:info@accian.co.uk"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Mail size={14} />
                    info@accian.co.uk
                  </a>
                </div>
              </div>

              {/* Intro card below summary */}
              <div className="bg-white border border-[#E8E4DC] rounded-2xl p-6 mt-4">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#0D0D0D] mb-3">
                  About ACCIAN
                </p>
                <p className="text-sm font-light text-gray-500 leading-relaxed mb-2">
                  ACCIAN Limited is committed to protecting and respecting your
                  privacy. This policy explains how we collect, use, and protect
                  personal data.
                </p>
                <p className="text-xs font-medium text-[#0D0D0D]">
                  Company No. 16910869 · Registered in England &amp; Wales
                </p>
              </div>
            </Reveal>

            {/* ── RIGHT — policy sections ────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {sections.map((s, i) => (
                <Reveal key={i} delay={i * 80}>
                  <div
                    id={s.title.toLowerCase().replace(/\s+/g, "-")}
                    className="bg-white border border-[#E8E4DC] rounded-2xl p-8 group hover:border-blue-600/25 hover:shadow-lg hover:shadow-blue-600/5 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-start gap-5">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl bg-blue-600/8 border border-blue-600/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:scale-110 transition-all duration-300">
                        <s.icon
                          size={20}
                          className="text-blue-600 group-hover:text-white transition-colors duration-300"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h2 className="text-base font-semibold text-[#0D0D0D]">
                            {s.title}
                          </h2>
                          <span className="text-2xl font-black text-[#0D0D0D]/6 leading-none shrink-0 select-none">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>

                        <p className="text-sm font-light text-gray-500 leading-relaxed mb-4">
                          {s.body}
                        </p>

                        {/* Highlight pill */}
                        <div className="inline-flex items-center gap-1.5 bg-[#F5F3EE] border border-[#E8E4DC] rounded-full px-3 py-1">
                          <div className="w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                          <span className="text-xs font-medium text-gray-500">
                            {s.highlight}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}

              {/* Contact section */}
              <Reveal delay={sections.length * 80}>
                <div className="relative overflow-hidden bg-[#0D0D0D] rounded-2xl p-8 group hover:shadow-2xl hover:shadow-black/30 transition-shadow duration-300">
                  <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-600/15 pointer-events-none group-hover:bg-blue-600/25 transition-colors duration-300" />
                  <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-blue-600/6 pointer-events-none" />

                  <div className="relative flex items-start gap-5">
                    <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 transition-colors duration-300">
                      <Mail
                        size={20}
                        className="text-blue-400 group-hover:text-white transition-colors duration-300"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h2 className="text-base font-semibold text-white">
                          Contact
                        </h2>
                        <span className="text-2xl font-black text-white/6 leading-none shrink-0 select-none">
                          {String(sections.length + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <p className="text-sm font-light text-white/50 leading-relaxed mb-4">
                        If you have questions about this Privacy Policy, please
                        contact us at any time.
                      </p>

                      <a
                        href="mailto:info@accian.co.uk"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 hover:gap-3 transition-all duration-200"
                      >
                        info@accian.co.uk
                        <ArrowRight size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Back to site */}
              <Reveal delay={sections.length * 80 + 80}>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs font-light text-gray-400">
                    This policy is reviewed regularly and updated as needed.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:gap-2.5 transition-all duration-200"
                  >
                    Back to home <ArrowRight size={13} />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
