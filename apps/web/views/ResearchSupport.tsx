"use client";

import { useState, useEffect, useRef, ReactNode, RefObject } from "react";

// ─────────────────────────────────────────────
// Accian — Research Support Page
// Drop this file into:  app/research-support/page.tsx
// (Pages Router: pages/research-support.tsx)
// Put the .docx in:     public/Accian_EOI_Form.docx
// ─────────────────────────────────────────────

// ── Types ────────────────────────────────────

interface Step {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
}

interface Service {
  label: string;
  desc: string;
}

interface Faq {
  q: string;
  a: string;
}

type AnimDir = "left" | "right" | "bottom";

// ── Hook: fires once when element scrolls into view ──

function useInView(
  options: IntersectionObserverInit = {},
): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState<boolean>(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, ...options },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, inView];
}

// ── Data ─────────────────────────────────────

const steps: Step[] = [
  {
    number: "01",
    title: "Download the Form",
    description:
      "Click the button below to download the Expression of Interest form to your device.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Complete All Sections",
    description:
      "Fill in every section honestly. There are no wrong answers — we use your responses to understand your background and goals.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Send It Back",
    description:
      "Email your completed form to info@accian.co.uk. We respond within 48–72 hours with a tailored proposal and quote.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
        />
      </svg>
    ),
  },
];

const services: Service[] = [
  {
    label: "Research Topic Identification",
    desc: "We match you to a viable, fundable area of inquiry.",
  },
  {
    label: "Supervisor Matching",
    desc: "We identify academics aligned with your research interests.",
  },
  {
    label: "Proposal Development",
    desc: "Full end-to-end drafting of your research proposal.",
  },
  {
    label: "Application Guidance",
    desc: "Support through university submission requirements.",
  },
  {
    label: "Idea Refinement",
    desc: "We sharpen a rough idea into a coherent research question.",
  },
];

const faqs: Faq[] = [
  {
    q: "Who is this service for?",
    a: "Anyone applying to a UK MRes, MSc by Research, or PhD programme who needs expert help shaping their research focus and proposal.",
  },
  {
    q: "How much does it cost?",
    a: "Fees are tailored to the level of support required. You will receive a clear quote after we review your EOI form — no hidden charges.",
  },
  {
    q: "Do I need a research idea already?",
    a: "Not at all. Many of our clients come to us with just a general interest area. Part of our service is helping you discover and define a strong research direction.",
  },
  {
    q: "How long does the process take?",
    a: "It depends on the scope of support, but most clients have a complete proposal ready within 2–4 weeks of engaging with us.",
  },
  {
    q: "Is my information kept confidential?",
    a: "Absolutely. All information you share is treated in strict confidence and used solely for the purpose of supporting your application.",
  },
];

// ── Helpers ───────────────────────────────────

function getAnimClass(dir: AnimDir, triggered: boolean): string {
  if (!triggered) return "card-hidden";
  if (dir === "left") return "card-animate-left";
  if (dir === "right") return "card-animate-right";
  return "card-animate-bottom";
}

function getStepDir(index: number): AnimDir {
  if (index === 0) return "left";
  if (index === 2) return "right";
  return "bottom";
}

// ── Component ────────────────────────────────

export default function ResearchSupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [stepsRef, stepsInView] = useInView();
  const [servicesRef, servicesInView] = useInView();

  const toggleFaq = (index: number): void => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --navy:   #0F2744;
          --navy2:  #1B3A5C;
          --gold:   #C8A951;
          --gold2:  #E2C97E;
          --cream:  #F8F4EE;
          --white:  #FFFFFF;
          --text:   #1A1A2E;
          --muted:  #64748B;
          --border: #D8E4F0;
          --card:   #F0F5FA;
        }

        .rs-page { font-family: 'DM Sans', sans-serif; color: var(--text); background: var(--white); }

        /* ── HERO ── */
        .rs-hero {
          background: var(--navy);
          padding: 100px 0 80px;
          position: relative;
          overflow: hidden;
        }
        .rs-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 80% 50%, rgba(200,169,81,0.12), transparent),
                      radial-gradient(ellipse 40% 60% at 10% 90%, rgba(255,255,255,0.04), transparent);
        }
        .rs-hero-inner { position: relative; max-width: 860px; margin: 0 auto; padding: 0 32px; }
        .rs-hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(200,169,81,0.15); border: 1px solid rgba(200,169,81,0.35);
          border-radius: 999px; padding: 6px 16px; margin-bottom: 28px;
          font-size: 12px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold2);
        }
        .rs-hero-tag span { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); display: block; }
        .rs-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 5vw, 58px); font-weight: 700; line-height: 1.15;
          color: var(--white); margin: 0 0 20px;
        }
        .rs-hero h1 em { font-style: italic; color: var(--gold2); }
        .rs-hero p {
          font-size: 18px; line-height: 1.7; color: rgba(255,255,255,0.72); max-width: 600px; margin: 0 0 40px;
        }
        .rs-hero-cta {
          display: inline-flex; align-items: center; gap: 12px;
          background: var(--gold); color: var(--navy); padding: 16px 32px;
          border-radius: 6px; font-weight: 600; font-size: 15px;
          text-decoration: none; transition: all 0.2s;
          border: none; cursor: pointer;
        }
        .rs-hero-cta:hover { background: var(--gold2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(200,169,81,0.35); }
        .rs-hero-cta svg { width: 18px; height: 18px; }

        /* ── SECTIONS ── */
        .rs-section { max-width: 1060px; margin: 0 auto; padding: 80px 32px; }
        .rs-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--gold); margin-bottom: 12px;
        }
        .rs-section-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 40px); font-weight: 700; color: var(--navy); margin: 0 0 48px; line-height: 1.2;
        }

        /* ── ANIMATIONS ── */
        @keyframes slideFromLeft {
          from { opacity: 0; transform: translateX(-80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromRight {
          from { opacity: 0; transform: translateX(80px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideFromBottom {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .card-hidden          { opacity: 0; transform: translateX(-60px); }
        .card-animate-left    { animation: slideFromLeft   0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .card-animate-right   { animation: slideFromRight  0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .card-animate-bottom  { animation: slideFromBottom 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

        /* ── STEPS ── */
        .rs-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 28px; }
        .rs-step {
          background: var(--card); border: 1px solid var(--border);
          border-radius: 12px; padding: 36px 28px; position: relative; overflow: hidden;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .rs-step:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(15,39,68,0.1); }
        .rs-step-num {
          font-family: 'Playfair Display', serif;
          font-size: 52px; font-weight: 700; color: rgba(200,169,81,0.18);
          line-height: 1; margin-bottom: 16px; display: block;
        }
        .rs-step-icon { width: 44px; height: 44px; color: var(--gold); margin-bottom: 16px; }
        .rs-step h3 { font-size: 17px; font-weight: 600; color: var(--navy); margin: 0 0 10px; }
        .rs-step p  { font-size: 14px; color: var(--muted); line-height: 1.65; margin: 0; }

        /* ── DIVIDER ── */
        .rs-divider { width: 100%; height: 1px; background: var(--border); margin: 0; }

        /* ── SERVICES ── */
        .rs-services { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .rs-service {
          display: flex; gap: 16px; padding: 24px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--white);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rs-service:hover { border-color: var(--gold); box-shadow: 0 4px 20px rgba(200,169,81,0.12); }
        .rs-service-dot {
          width: 10px; height: 10px; border-radius: 50%; background: var(--gold);
          flex-shrink: 0; margin-top: 6px;
        }
        .rs-service h4 { font-size: 15px; font-weight: 600; color: var(--navy); margin: 0 0 6px; }
        .rs-service p  { font-size: 13px; color: var(--muted); margin: 0; line-height: 1.6; }

        /* ── CTA BAND ── */
        .rs-cta-band { background: var(--navy); padding: 72px 32px; text-align: center; }
        .rs-cta-band-inner { max-width: 640px; margin: 0 auto; }
        .rs-cta-band h2 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 38px); color: var(--white); margin: 0 0 16px; font-weight: 700;
        }
        .rs-cta-band p { font-size: 16px; color: rgba(255,255,255,0.65); margin: 0 0 36px; line-height: 1.7; }
        .rs-cta-band-buttons { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .rs-btn-primary {
          background: var(--gold); color: var(--navy); padding: 14px 28px;
          border-radius: 6px; font-weight: 600; font-size: 15px; text-decoration: none;
          transition: all 0.2s; display: inline-flex; align-items: center; gap: 10px;
        }
        .rs-btn-primary:hover { background: var(--gold2); transform: translateY(-2px); }
        .rs-btn-outline {
          background: transparent; color: var(--white); padding: 14px 28px;
          border-radius: 6px; font-weight: 500; font-size: 15px; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.3); transition: all 0.2s;
          display: inline-flex; align-items: center; gap: 10px;
        }
        .rs-btn-outline:hover { border-color: var(--gold); color: var(--gold2); }
        .rs-btn-primary svg, .rs-btn-outline svg { width: 16px; height: 16px; }

        /* ── FAQ ── */
        .rs-faqs { max-width: 720px; margin: 0 auto; }
        .rs-faq  { border-bottom: 1px solid var(--border); padding: 22px 0; }
        .rs-faq-q {
          display: flex; justify-content: space-between; align-items: center;
          cursor: pointer; font-size: 16px; font-weight: 500; color: var(--navy);
          background: none; border: none; width: 100%; text-align: left; padding: 0; gap: 16px;
        }
        .rs-faq-q:hover { color: var(--gold); }
        .rs-faq-icon {
          width: 22px; height: 22px; flex-shrink: 0; color: var(--gold);
          transition: transform 0.25s; display: flex; align-items: center; justify-content: center;
        }
        .rs-faq-icon.open { transform: rotate(45deg); }
        .rs-faq-a {
          font-size: 14px; color: var(--muted); line-height: 1.75;
          max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.3s;
          padding-top: 0;
        }
        .rs-faq-a.open { max-height: 200px; padding-top: 14px; }

        /* ── FOOTER NOTE ── */
        .rs-footnote {
          background: var(--cream); padding: 40px 32px; text-align: center;
          font-size: 13px; color: var(--muted); border-top: 1px solid var(--border);
        }
        .rs-footnote a { color: var(--navy); font-weight: 600; text-decoration: none; }
        .rs-footnote a:hover { color: var(--gold); }
      `}</style>

      <div className="rs-page">
        {/* ── HERO ── */}
        <section className="rs-hero">
          <div className="rs-hero-inner">
            <div className="rs-hero-tag">
              <span />
              Research Consultancy
            </div>
            <h1>
              Your research journey,
              <br />
              <em>expertly guided.</em>
            </h1>
            <p>
              Struggling to find a research topic or write a compelling
              proposal? Accian&apos;s Research Support Service pairs you with
              expert consultants who help you identify your area, match with the
              right supervisor, and produce a proposal that stands out.
            </p>
            <a
              href="/Accian_EOI_Form.docx"
              download="Accian_EOI_Form.docx"
              className="rs-hero-cta"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
              Download Expression of Interest Form
            </a>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="rs-section">
          <div className="rs-section-label">The Process</div>
          <h2 className="rs-section-heading">Three simple steps</h2>
          <div className="rs-steps" ref={stepsRef}>
            {steps.map((s: Step, i: number) => {
              const dir: AnimDir = getStepDir(i);
              const animClass: string = getAnimClass(dir, stepsInView);
              return (
                <div
                  key={s.number}
                  className={`rs-step ${animClass}`}
                  style={{
                    animationDelay: stepsInView ? `${i * 130}ms` : "0ms",
                  }}
                >
                  <span className="rs-step-num">{s.number}</span>
                  <div className="rs-step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="rs-divider" />

        {/* ── WHAT WE OFFER ── */}
        <section className="rs-section">
          <div className="rs-section-label">Our Services</div>
          <h2 className="rs-section-heading">What we help with</h2>
          <div className="rs-services" ref={servicesRef}>
            {services.map((s: Service, i: number) => {
              const dir: AnimDir = i % 2 === 0 ? "left" : "right";
              const animClass: string = getAnimClass(dir, servicesInView);
              return (
                <div
                  key={s.label}
                  className={`rs-service ${animClass}`}
                  style={{
                    animationDelay: servicesInView ? `${i * 100}ms` : "0ms",
                  }}
                >
                  <div className="rs-service-dot" />
                  <div>
                    <h4>{s.label}</h4>
                    <p>{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA BAND ── */}
        <div className="rs-cta-band">
          <div className="rs-cta-band-inner">
            <h2>Ready to get started?</h2>
            <p>
              Download the form, complete it at your own pace, and email it
              back. We will review your submission and send you a personalised
              quote within 48–72 hours.
            </p>
            <div className="rs-cta-band-buttons">
              <a
                href="/Accian_EOI_Form.docx"
                download="Accian_EOI_Form.docx"
                className="rs-btn-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                  />
                </svg>
                Download EOI Form
              </a>
              <a href="mailto:info@accian.co.uk" className="rs-btn-outline">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                  />
                </svg>
                Email Us Directly
              </a>
            </div>
          </div>
        </div>

        {/* ── FAQ ── */}
        <section className="rs-section">
          <div className="rs-section-label">Questions</div>
          <h2 className="rs-section-heading" style={{ textAlign: "center" }}>
            Frequently asked questions
          </h2>
          <div className="rs-faqs">
            {faqs.map((faq: Faq, i: number) => (
              <div className="rs-faq" key={i}>
                <button className="rs-faq-q" onClick={() => toggleFaq(i)}>
                  {faq.q}
                  <span
                    className={`rs-faq-icon${openFaq === i ? " open" : ""}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      width={18}
                      height={18}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </span>
                </button>
                <div className={`rs-faq-a${openFaq === i ? " open" : ""}`}>
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
