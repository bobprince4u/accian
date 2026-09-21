"use client";

/**
 * Research Support — the page that leads into the pre-consultation form.
 *
 * Rewritten in two respects.
 *
 *  - It used to carry its own design system: a Google Fonts `@import`, a
 *    navy-and-gold palette and roughly 180 lines of scoped CSS that matched no
 *    other page on the site. It now uses the cream / ink / blue palette,
 *    Poppins and Tailwind utilities the rest of `apps/web` uses, so the page
 *    reads as part of the site rather than as a visitor to it.
 *
 *  - The journey it described was "download a .docx, fill it in, email it
 *    back". That flow is replaced by `/pre-consultation`, so every call to
 *    action points there. Nothing on this page downloads a form or opens a
 *    mail client.
 *
 * The support areas, the document list and the file rules are read from the
 * same constants the form renders and the API validates against, so this page
 * cannot promise something the form would refuse.
 */

import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ClipboardList,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Lightbulb,
  Lock,
  MessageSquare,
  PenLine,
  Search,
  Send,
  Target,
  Upload,
  UserSearch,
} from "lucide-react";
import { PRE_CONSULTATION_DOCUMENTS, SUPPORT_AREAS } from "@accian/types";

import { ACCEPT_HINT } from "@/lib/preConsultation/files";

// ── Types ────────────────────────────────────────────────────────────────────

/** Any lucide icon, without importing the library's own type name. */
type IconComponent = ComponentType<{ size?: number; className?: string }>;

interface Phase {
  number: string;
  title: string;
  description: string;
  icon: IconComponent;
}

interface Step {
  number: string;
  title: string;
  description: string;
  icon: IconComponent;
}

interface Faq {
  question: string;
  answer: string;
}

// ── Scroll reveal ────────────────────────────────────────────────────────────

function useReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

/**
 * Fades content up as it scrolls into view.
 *
 * The `motion-reduce:` utilities come after the unprefixed ones in Tailwind's
 * output, so someone who has asked their system for reduced motion sees the
 * content at rest immediately rather than a shorter animation.
 */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ── Content ──────────────────────────────────────────────────────────────────

/** The four phases named in the Research Pathway package, in order. */
const phases: Phase[] = [
  {
    number: "01",
    title: "Topic identification",
    description:
      "We start from what genuinely interests you and narrow it to a question that is specific, original and answerable — one a supervisor will want to take on.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Supervisor matching",
    description:
      "We identify academics whose current work sits alongside your direction, and tell you what each of them is likely to be looking for.",
    icon: UserSearch,
  },
  {
    number: "03",
    title: "Proposal development",
    description:
      "Aims, research questions, methodology, contribution and timeline — drafted with you until the argument holds together on the page.",
    icon: PenLine,
  },
  {
    number: "04",
    title: "Application guidance",
    description:
      "Institution requirements, deadlines, supporting documents, and what to expect if you are invited to interview.",
    icon: GraduationCap,
  },
];

/** What actually happens once you decide to start. */
const steps: Step[] = [
  {
    number: "01",
    title: "Complete the form online",
    description:
      "Thirteen short sections covering your background, interests and intentions. Move back and forward freely — nothing you have typed is lost, and you see everything again on a review screen before you submit.",
    icon: ClipboardList,
  },
  {
    number: "02",
    title: "Attach your documents",
    description: `Your CV, plus any transcripts, certificates, draft proposal or English test result you already have. ${ACCEPT_HINT}.`,
    icon: Upload,
  },
  {
    number: "03",
    title: "We read it and reply",
    description:
      "Your submission reaches our consultants directly, and you get a reference number straight away. We come back within 48–72 hours with a tailored proposal and quote.",
    icon: Send,
  },
];

/**
 * A line of detail per support area.
 *
 * Keyed by the option values in `SUPPORT_AREAS` so this page lists exactly
 * what section 9 of the form offers. An area added to the contract without a
 * line here still renders, with its label alone.
 */
const supportDetail: Record<string, { icon: IconComponent; description: string }> =
  {
    "topic-identification": {
      icon: Search,
      description:
        "You know the field but not the question. We narrow it to something viable and fundable.",
    },
    "idea-refinement": {
      icon: Lightbulb,
      description:
        "You have an idea already. We sharpen it into a research question that can be defended.",
    },
    "supervisor-matching": {
      icon: UserSearch,
      description:
        "We find the academics whose work your project actually belongs next to.",
    },
    "proposal-development": {
      icon: FileText,
      description:
        "End-to-end drafting, from aims and methodology through to your timeline.",
    },
    "application-guidance": {
      icon: Target,
      description:
        "Support through each institution's submission requirements and deadlines.",
    },
    "interview-preparation": {
      icon: MessageSquare,
      description:
        "The questions panels ask, and how to answer them about your own work.",
    },
  };

/**
 * Why each document helps, for the slots whose contract entry has no `help`
 * text of its own. The contract's wording wins wherever it exists.
 */
const documentNotes: Record<string, string> = {
  cv: "Your academic and professional history. The one document we cannot begin without.",
  transcripts:
    "Module-level results, where you have them. Useful when a grade needs context.",
  certificates: "Award certificates for degrees you have already completed.",
  proposal: "Anything you have drafted already, however rough.",
  personalStatement: "A statement written for another application is fine.",
};

const faqs: Faq[] = [
  {
    question: "Who is this service for?",
    answer:
      "Anyone applying to a UK MRes, MSc by Research, MPhil or PhD programme who needs expert help shaping their research focus, finding the right supervisor, and writing a proposal that stands up to scrutiny.",
  },
  {
    question: "Do I need a research idea already?",
    answer:
      "Not at all. Many of the people we work with arrive with nothing more than a general interest area. Identifying and defining a strong research direction is part of the service, not a prerequisite for it.",
  },
  {
    question: "Do I have to answer every question on the form?",
    answer:
      "No. Only your name, email address, CV and the declaration are required. Everything else is optional — a blank tells us something too, and we would rather you left a question than guessed at it.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Fees are tailored to the level of support you need. You will receive a clear quote once we have read your pre-consultation form — no hidden charges, and no obligation to go ahead.",
  },
  {
    question: "How long does the process take?",
    answer:
      "It depends on the scope of support, but most clients have a complete proposal ready within two to four weeks of engaging with us.",
  },
  {
    question: "What if I have to stop partway through the form?",
    answer:
      "You can move between sections as much as you like without losing anything. Your answers stay in your own browser until you press submit, though, so if you close the tab before then you will need to start again — it is worth setting aside an uninterrupted run at it.",
  },
  {
    question: "Is my information kept confidential?",
    answer:
      "Yes. Your form and documents go straight to our consultants over an encrypted connection and are used solely to prepare for your consultation. Nothing you send is published on this site or shared outside the team.",
  },
];

// ── FAQ item ─────────────────────────────────────────────────────────────────

function FaqItem({ id, question, answer }: { id: string } & Faq) {
  const [open, setOpen] = useState(false);
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div
      className={`rounded-2xl bg-white border transition-colors duration-300 ${
        open
          ? "border-[#1B4FFF]/40 shadow-sm"
          : "border-[#D8D3C9] hover:border-[#1B4FFF]/25"
      }`}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((previous) => !previous)}
          className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE9E0]"
        >
          <span className="text-sm font-semibold leading-snug text-[#0D0D0D]">
            {question}
          </span>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className={`shrink-0 text-[#1B4FFF] transition-transform duration-300 motion-reduce:transition-none ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </h3>

      {/*
        A 0fr → 1fr grid row animates to the answer's natural height, so a long
        answer is never clipped the way a guessed `max-height` clips it.
      */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        aria-hidden={!open}
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
        className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
      >
        <div className="overflow-hidden">
          <p className="mx-6 mb-6 border-t border-[#E8E4DC] pt-4 text-sm font-light leading-relaxed text-gray-500">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ResearchSupportPage() {
  return (
    <main className="bg-[#F5F3EE]">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] py-24 lg:py-32 px-6 lg:px-12">
        <div className="pointer-events-none absolute -top-32 right-0 h-125 w-125 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-blue-600/8 blur-[100px]" />

        <div className="relative container mx-auto">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2">
              <span className="block h-0.5 w-7 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                PhD Research Pathway
              </span>
            </div>

            <h1 className="mb-6 text-4xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.06] tracking-tight text-white">
              Your research journey,
              <br />
              <span className="text-blue-500">expertly guided.</span>
            </h1>

            <p className="mb-10 max-w-xl text-sm lg:text-base font-light leading-relaxed text-white/55">
              Struggling to settle on a research topic, find the right
              supervisor, or write a proposal that holds up? Accian pairs you
              with consultants who take you from a rough interest to a
              submitted application.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/pre-consultation"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl hover:shadow-blue-600/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                Start your pre-consultation
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-8 py-4 text-sm font-medium text-white transition-colors duration-200 hover:border-white/40"
              >
                Ask a question first
              </Link>
            </div>
          </div>

          {/* Assurances */}
          <ul className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:max-w-4xl">
            {[
              {
                icon: Lock,
                text: "Confidential, and used only to prepare for your consultation",
              },
              { icon: Clock, text: "A response within 48–72 hours" },
              {
                icon: BadgeCheck,
                text: "A clear quote before anything is agreed",
              },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/4 p-4"
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-blue-400"
                />
                <span className="text-xs font-light leading-relaxed text-white/60">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── THE PATHWAY ──────────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="mb-16 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3">The Pathway</p>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#0D0D0D]">
                Four phases, <span className="text-[#1B4FFF]">one route</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-gray-500 lg:text-right">
              Join at whichever phase you need. Most people start at the first
              and stay to the last.
            </p>
          </Reveal>

          <div className="relative">
            {/* Connecting rule behind the phase markers on wide screens. */}
            <div
              aria-hidden="true"
              className="absolute left-0 right-0 top-8 hidden h-px bg-[#D8D3C9] lg:block"
            />

            <ol className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {phases.map((phase, index) => {
                const Icon = phase.icon;
                return (
                  <li key={phase.number}>
                    <Reveal delay={index * 90} className="group">
                      <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#D8D3C9] bg-white shadow-sm transition-all duration-300 group-hover:border-[#1B4FFF] group-hover:bg-[#1B4FFF] motion-reduce:transition-none">
                        <Icon
                          size={24}
                          aria-hidden="true"
                          className="text-[#1B4FFF] transition-colors duration-300 group-hover:text-white motion-reduce:transition-none"
                        />
                      </div>

                      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Phase {phase.number}
                      </p>
                      <h3 className="mb-2 text-base font-semibold text-[#0D0D0D] transition-colors duration-200 group-hover:text-[#1B4FFF] motion-reduce:transition-none">
                        {phase.title}
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-gray-500">
                        {phase.description}
                      </p>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="bg-[#EDE9E0] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="mb-14 max-w-2xl">
            <p className="eyebrow mb-3">Getting Started</p>
            <h2 className="mb-4 text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#0D0D0D]">
              Three steps, <span className="text-[#1B4FFF]">no paperwork</span>
            </h2>
            <p className="text-sm font-light leading-relaxed text-gray-500">
              There is no form to download and nothing to email. Everything
              happens in your browser, and your documents travel with your
              answers.
            </p>
          </Reveal>

          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li key={step.number}>
                  <Reveal delay={index * 110} className="h-full">
                    <div className="group h-full rounded-2xl border border-[#E0DBD2] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#1B4FFF]/30 hover:shadow-xl hover:shadow-[#1B4FFF]/8 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1B4FFF]/10">
                          <Icon
                            size={22}
                            aria-hidden="true"
                            className="text-[#1B4FFF]"
                          />
                        </div>
                        <span
                          aria-hidden="true"
                          className="select-none text-4xl font-black leading-none text-[#0D0D0D]/8"
                        >
                          {step.number}
                        </span>
                      </div>

                      <h3 className="mb-3 text-base font-semibold text-[#0D0D0D]">
                        {step.title}
                      </h3>
                      <p className="text-sm font-light leading-relaxed text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>

          <Reveal delay={220} className="mt-10">
            <Link
              href="/pre-consultation"
              className="inline-flex items-center gap-2 rounded-lg bg-[#0D0D0D] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1B4FFF] hover:shadow-lg hover:shadow-[#1B4FFF]/20 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Open the pre-consultation form
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE HELP WITH ────────────────────────────────────────────── */}
      <section className="bg-[#F5F3EE] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="mb-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow mb-3">Our Support</p>
              <h2 className="text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#0D0D0D]">
                What we help <span className="text-[#1B4FFF]">with</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-gray-500 lg:text-right">
              These are the same options you will be asked to tick on the form,
              so tell us there which of them you want.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SUPPORT_AREAS.map((area, index) => {
              const detail = supportDetail[area.value];
              const Icon = detail?.icon ?? Compass;
              return (
                <Reveal key={area.value} delay={index * 60} className="h-full">
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-[#E8E4DC] bg-white p-6 transition-all duration-200 hover:border-[#1B4FFF]/30 hover:shadow-sm motion-reduce:transition-none">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B4FFF]/10">
                      <Icon
                        size={18}
                        aria-hidden="true"
                        className="text-[#1B4FFF]"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="mb-1.5 text-sm font-semibold text-[#0D0D0D]">
                        {area.label}
                      </h3>
                      {detail && (
                        <p className="text-sm font-light leading-relaxed text-gray-500">
                          {detail.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DOCUMENTS TO HAVE READY ──────────────────────────────────────── */}
      <section className="bg-[#0D0D0D] py-24 px-6 lg:px-12">
        <div className="container mx-auto">
          <Reveal className="mb-14 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-500">
              Before You Begin
            </p>
            <h2 className="mb-4 text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-white">
              What to have <span className="text-blue-500">to hand</span>
            </h2>
            <p className="text-sm font-light leading-relaxed text-white/50">
              Only your CV is required. Everything else helps us prepare, but
              nothing is held up waiting for it — send what you have.{" "}
              {ACCEPT_HINT}.
            </p>
          </Reveal>

          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PRE_CONSULTATION_DOCUMENTS.map((slot, index) => (
              <li key={slot.field}>
                <Reveal delay={index * 60} className="h-full">
                  <div className="h-full rounded-2xl border border-white/8 bg-white/4 p-6 transition-colors duration-300 hover:border-blue-600/50 hover:bg-white/8 motion-reduce:transition-none">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <FileText
                        size={18}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-blue-400"
                      />
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                          slot.required
                            ? "bg-blue-600 text-white"
                            : "border border-white/15 text-white/45"
                        }`}
                      >
                        {slot.required ? "Required" : "Optional"}
                      </span>
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold text-white">
                      {slot.label}
                    </h3>
                    <p className="text-sm font-light leading-relaxed text-white/45">
                      {slot.help ?? documentNotes[slot.field]}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── FAQs ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#EDE9E0] py-24 px-6 lg:px-12">
        <div className="container mx-auto grid items-start gap-16 lg:grid-cols-5">
          <Reveal className="lg:col-span-2 lg:sticky lg:top-28">
            <p className="eyebrow mb-3">FAQs</p>
            <h2 className="mb-4 text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-[#0D0D0D]">
              Questions,
              <br />
              <span className="text-[#1B4FFF]">answered</span>
            </h2>
            <p className="text-sm font-light leading-relaxed text-gray-500">
              If something here is not covered, ask us before you fill anything
              in.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1B4FFF] transition-all duration-200 hover:gap-3 motion-reduce:transition-none"
            >
              Ask us directly <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </Reveal>

          <div className="space-y-3 lg:col-span-3">
            {faqs.map((faq, index) => (
              <Reveal key={faq.question} delay={index * 50}>
                <FaqItem
                  id={`rs-faq-${index}`}
                  question={faq.question}
                  answer={faq.answer}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] py-28 px-6 lg:px-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-600/10" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-600/6" />

        <div className="relative container mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-500">
              Get Started
            </p>
            <h2 className="mb-5 text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight text-white">
              Tell us where you are
              <br />
              <span className="text-blue-500">in the process</span>
            </h2>
            <p className="mx-auto mb-10 max-w-xl text-sm font-light leading-relaxed text-white/50">
              The pre-consultation form is how we get to know your background
              and ambitions before we speak. Complete it at your own pace, and
              we will come back to you within 48–72 hours.
            </p>
            <Link
              href="/pre-consultation"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 hover:shadow-xl hover:shadow-blue-600/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              Start your pre-consultation
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <p className="mt-5 text-xs font-light text-white/35">
              You will need your CV to hand.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
