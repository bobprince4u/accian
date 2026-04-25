"use client";

// ─────────────────────────────────────────────────────────────
// Accian — Internal Quote Builder
// Drop into:  app/internal/quote-builder/page.tsx
// This page is password-protected (client-side).
// For stronger protection add Netlify Basic Auth on /internal/*
// ─────────────────────────────────────────────────────────────

import { useState, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  description: string;
  bullets: string[];
  minPrice: number;
  maxPrice: number;
}

interface QuoteState {
  clientName: string;
  clientEmail: string;
  refNumber: string;
  date: string;
  validDays: string;
  notes: string;
  selected: Record<string, boolean>;
  customMin: Record<string, string>;
  customMax: Record<string, string>;
}

// ── Services Catalogue ────────────────────────────────────────

const SERVICES: Service[] = [
  {
    id: "profiling",
    name: "Research Profiling & Topic Identification",
    description: "Initial discovery and research area mapping",
    bullets: [
      "Review of EOI form and CV",
      "Identification of 2–4 viable research areas",
      "Alignment with current UK research trends",
    ],
    minPrice: 80,
    maxPrice: 150,
  },
  {
    id: "matching",
    name: "Supervisor Matching (UK Universities)",
    description: "Targeted academic matching across UK institutions",
    bullets: [
      "Identification of suitable universities",
      "Matching with 3–6 potential supervisors",
      "Fit justification and suitability notes",
    ],
    minPrice: 120,
    maxPrice: 250,
  },
  {
    id: "proposal",
    name: "Research Proposal Development",
    description: "Full end-to-end proposal writing and refinement",
    bullets: [
      "Refinement and sharpening of research topic",
      "Full research proposal drafting",
      "Review, revision and final polish",
    ],
    minPrice: 250,
    maxPrice: 600,
  },
  {
    id: "application",
    name: "Application Strategy Support",
    description: "Optional — positioning and outreach support",
    bullets: [
      "Personal statement guidance",
      "Email templates for supervisor outreach",
      "Application positioning and strategy",
    ],
    minPrice: 80,
    maxPrice: 180,
  },
];

const PACKAGES: { name: string; ids: string[]; label: string }[] = [
  {
    name: "Basic Package",
    ids: ["profiling", "matching"],
    label: "Services 1 + 2",
  },
  {
    name: "Standard Package",
    ids: ["profiling", "matching", "proposal"],
    label: "Services 1 + 2 + 3",
  },
  {
    name: "Full Support Package",
    ids: ["profiling", "matching", "proposal", "application"],
    label: "All Services",
  },
];

const INTERNAL_PASSWORD = "accian2025"; // change this to whatever you want

// ── Helpers ───────────────────────────────────────────────────

function generateRef(): string {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `ACC-${y}${m}-${rand}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function formatPrice(min: number, max: number): string {
  return `£${min.toLocaleString()} – £${max.toLocaleString()}`;
}

// ── Component ─────────────────────────────────────────────────

export default function QuoteBuilderPage() {
  // Auth
  const [authed, setAuthed] = useState<boolean>(false);
  const [pwInput, setPwInput] = useState<string>("");
  const [pwError, setPwError] = useState<boolean>(false);

  // Quote state
  const [quote, setQuote] = useState<QuoteState>({
    clientName: "",
    clientEmail: "",
    refNumber: generateRef(),
    date: today(),
    validDays: "14",
    notes: "",
    selected: {
      profiling: true,
      matching: true,
      proposal: true,
      application: false,
    },
    customMin: {},
    customMax: {},
  });

  const [preview, setPreview] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // ── Auth ──
  const handleLogin = () => {
    if (pwInput === INTERNAL_PASSWORD) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  };

  // ── Derived values ──
  const selectedServices = SERVICES.filter((s) => quote.selected[s.id]);

  const getMin = (s: Service): number =>
    quote.customMin[s.id] ? parseInt(quote.customMin[s.id]) : s.minPrice;

  const getMax = (s: Service): number =>
    quote.customMax[s.id] ? parseInt(quote.customMax[s.id]) : s.maxPrice;

  const totalMin = selectedServices.reduce((acc, s) => acc + getMin(s), 0);
  const totalMax = selectedServices.reduce((acc, s) => acc + getMax(s), 0);

  // ── Helpers ──
  const toggleService = (id: string) => {
    setQuote((q) => ({
      ...q,
      selected: { ...q.selected, [id]: !q.selected[id] },
    }));
  };

  const applyPackage = (ids: string[]) => {
    const next: Record<string, boolean> = {};
    SERVICES.forEach((s) => {
      next[s.id] = ids.includes(s.id);
    });
    setQuote((q) => ({ ...q, selected: next }));
  };

  const set = (field: keyof QuoteState, value: string) => {
    setQuote((q) => ({ ...q, [field]: value }));
  };

  const setCustom = (
    type: "customMin" | "customMax",
    id: string,
    val: string,
  ) => {
    setQuote((q) => ({ ...q, [type]: { ...q[type], [id]: val } }));
  };

  // ── Email template ──
  const emailBody = `Dear ${quote.clientName || "[Client Name]"},

Thank you for submitting your Expression of Interest to Accian Research Consultancy.

We have reviewed your details and are pleased to present your personalised quote (Ref: ${quote.refNumber}).

SERVICES INCLUDED
${selectedServices.map((s) => `• ${s.name}: ${formatPrice(getMin(s), getMax(s))}`).join("\n")}

TOTAL ESTIMATE: ${formatPrice(totalMin, totalMax)}

This quote is valid for ${quote.validDays} days from ${new Date(quote.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.

${quote.notes ? `ADDITIONAL NOTES\n${quote.notes}\n\n` : ""}To proceed, simply reply to this email confirming which package you would like, and we will send you next steps and payment details.

We look forward to supporting your research journey.

Kind regards,
Accian Research Consultancy
research@accian.co.uk`;

  const copyEmail = () => {
    navigator.clipboard.writeText(emailBody);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2500);
  };

  const openMailto = () => {
    const subject = encodeURIComponent(
      `Accian Research Quote – Ref ${quote.refNumber}`,
    );
    const body = encodeURIComponent(emailBody);
    window.open(`mailto:${quote.clientEmail}?subject=${subject}&body=${body}`);
  };

  const printQuote = () => window.print();

  // ── Login screen ──
  if (!authed) {
    return (
      <div className="qb-lock">
        <style>{`
          .qb-lock {
            min-height: 100vh; display: flex; align-items: center; justify-content: center;
            background: #0F2744; font-family: 'DM Sans', sans-serif;
          }
          .qb-lock-card {
            background: white; border-radius: 12px; padding: 48px 40px; width: 100%; max-width: 380px;
            box-shadow: 0 24px 60px rgba(0,0,0,0.3); text-align: center;
          }
          .qb-lock-logo { font-size: 24px; font-weight: 700; color: #0F2744; margin-bottom: 4px; }
          .qb-lock-sub  { font-size: 13px; color: #64748B; margin-bottom: 32px; }
          .qb-lock-label { display: block; text-align: left; font-size: 13px; font-weight: 600; color: #0F2744; margin-bottom: 6px; }
          .qb-lock-input {
            width: 100%; padding: 12px 14px; border: 1.5px solid #D8E4F0; border-radius: 6px;
            font-size: 15px; outline: none; box-sizing: border-box;
          }
          .qb-lock-input:focus { border-color: #C8A951; }
          .qb-lock-btn {
            width: 100%; margin-top: 20px; padding: 13px; background: #C8A951; color: #0F2744;
            border: none; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer;
          }
          .qb-lock-btn:hover { background: #E2C97E; }
          .qb-lock-err { color: #dc2626; font-size: 13px; margin-top: 10px; }
        `}</style>
        <div className="qb-lock-card">
          <div className="qb-lock-logo">ACCIAN</div>
          <div className="qb-lock-sub">Internal Quote Builder — Staff Only</div>
          <label className="qb-lock-label">Password</label>
          <input
            className="qb-lock-input"
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Enter staff password"
          />
          <button className="qb-lock-btn" onClick={handleLogin}>
            Enter
          </button>
          {pwError && (
            <div className="qb-lock-err">Incorrect password. Try again.</div>
          )}
        </div>
      </div>
    );
  }

  // ── Main builder ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }
        .qb-page { font-family: 'DM Sans', sans-serif; background: #F0F5FA; min-height: 100vh; color: #1A1A2E; }

        /* ── TOPBAR ── */
        .qb-bar {
          background: #0F2744; padding: 0 32px; height: 56px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 50;
        }
        .qb-bar-title { color: #C8A951; font-weight: 700; font-size: 15px; letter-spacing: 0.05em; }
        .qb-bar-tag { color: rgba(255,255,255,0.45); font-size: 12px; }

        /* ── LAYOUT ── */
        .qb-layout { display: grid; grid-template-columns: 1fr 420px; gap: 24px; max-width: 1200px; margin: 0 auto; padding: 28px 24px; }
        @media (max-width: 900px) { .qb-layout { grid-template-columns: 1fr; } }

        /* ── PANELS ── */
        .qb-panel { background: white; border-radius: 12px; padding: 28px; border: 1px solid #D8E4F0; }
        .qb-panel-title { font-size: 13px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #C8A951; margin-bottom: 20px; }

        /* ── FORM FIELDS ── */
        .qb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .qb-field { display: flex; flex-direction: column; gap: 5px; }
        .qb-field label { font-size: 12px; font-weight: 600; color: #0F2744; }
        .qb-field input, .qb-field textarea {
          padding: 9px 12px; border: 1.5px solid #D8E4F0; border-radius: 6px;
          font-size: 14px; font-family: inherit; outline: none; color: #1A1A2E;
        }
        .qb-field input:focus, .qb-field textarea:focus { border-color: #C8A951; }
        .qb-field textarea { resize: vertical; min-height: 72px; }

        /* ── PACKAGES ── */
        .qb-packages { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
        .qb-pkg {
          padding: 7px 14px; border-radius: 999px; font-size: 12px; font-weight: 600;
          border: 1.5px solid #D8E4F0; background: white; color: #64748B; cursor: pointer;
          transition: all 0.15s;
        }
        .qb-pkg:hover { border-color: #C8A951; color: #0F2744; }

        /* ── SERVICE CARDS ── */
        .qb-service {
          border: 1.5px solid #D8E4F0; border-radius: 10px; padding: 16px 18px;
          margin-bottom: 12px; transition: border-color 0.15s, background 0.15s; cursor: pointer;
        }
        .qb-service.active { border-color: #C8A951; background: #FFFDF5; }
        .qb-service-top { display: flex; align-items: flex-start; gap: 12px; }
        .qb-checkbox {
          width: 18px; height: 18px; border-radius: 4px; border: 2px solid #D8E4F0;
          flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center;
          background: white; transition: all 0.15s;
        }
        .qb-checkbox.checked { background: #C8A951; border-color: #C8A951; }
        .qb-checkbox.checked::after { content: "✓"; color: white; font-size: 11px; font-weight: 700; }
        .qb-service-name { font-size: 14px; font-weight: 600; color: #0F2744; margin-bottom: 2px; }
        .qb-service-desc { font-size: 12px; color: #64748B; }
        .qb-price-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 12px; }
        .qb-price-input { display: flex; flex-direction: column; gap: 3px; }
        .qb-price-input label { font-size: 11px; color: #64748B; font-weight: 500; }
        .qb-price-input input {
          padding: 7px 10px; border: 1.5px solid #D8E4F0; border-radius: 6px;
          font-size: 13px; outline: none; font-family: inherit;
        }
        .qb-price-input input:focus { border-color: #C8A951; }

        /* ── TOTAL ── */
        .qb-total {
          margin-top: 16px; padding: 16px 18px; background: #0F2744;
          border-radius: 10px; display: flex; justify-content: space-between; align-items: center;
        }
        .qb-total-label { color: rgba(255,255,255,0.7); font-size: 13px; font-weight: 500; }
        .qb-total-amount { color: #C8A951; font-size: 20px; font-weight: 700; }

        /* ── ACTIONS ── */
        .qb-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
        .qb-btn {
          padding: 12px 20px; border-radius: 7px; font-size: 14px; font-weight: 600;
          cursor: pointer; border: none; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.15s; font-family: inherit;
        }
        .qb-btn-primary { background: #C8A951; color: #0F2744; }
        .qb-btn-primary:hover { background: #E2C97E; }
        .qb-btn-outline { background: white; color: #0F2744; border: 1.5px solid #D8E4F0; }
        .qb-btn-outline:hover { border-color: #C8A951; }
        .qb-btn-navy { background: #0F2744; color: white; }
        .qb-btn-navy:hover { background: #1B3A5C; }

        /* ── EMAIL PREVIEW ── */
        .qb-email-box {
          background: #F8FAFC; border: 1.5px solid #D8E4F0; border-radius: 8px;
          padding: 16px; font-size: 13px; line-height: 1.7; color: #1A1A2E;
          white-space: pre-wrap; font-family: 'Courier New', monospace; max-height: 320px; overflow-y: auto;
          margin-top: 14px;
        }

        /* ── PRINT / QUOTE PREVIEW ── */
        @media print {
          .qb-bar, .qb-layout > div:first-child, .qb-actions, .qb-btn { display: none !important; }
          .qb-panel { box-shadow: none; border: none; }
          body { background: white; }
        }

        .qb-preview-quote {
          border: 1px solid #D8E4F0; border-radius: 10px; padding: 28px;
          margin-top: 14px; background: white;
        }
        .qb-preview-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .qb-preview-brand { font-size: 22px; font-weight: 700; color: #0F2744; }
        .qb-preview-meta { text-align: right; font-size: 12px; color: #64748B; line-height: 1.8; }
        .qb-preview-divider { border: none; border-top: 2px solid #C8A951; margin: 16px 0; }
        .qb-preview-to { font-size: 14px; margin-bottom: 20px; color: #1A1A2E; }
        .qb-preview-service { border-bottom: 1px solid #F0F5FA; padding: 14px 0; }
        .qb-preview-sname { font-size: 14px; font-weight: 600; color: #0F2744; }
        .qb-preview-sbullet { font-size: 12px; color: #64748B; margin: 4px 0 0 12px; }
        .qb-preview-sprice { font-size: 14px; font-weight: 600; color: #C8A951; margin-top: 6px; }
        .qb-preview-total-row {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 20px; padding: 16px; background: #0F2744; border-radius: 8px;
        }
        .qb-preview-total-label { color: rgba(255,255,255,0.8); font-size: 14px; }
        .qb-preview-total-amt { color: #C8A951; font-size: 20px; font-weight: 700; }
        .qb-preview-validity { font-size: 12px; color: #64748B; margin-top: 12px; text-align: right; }
        .qb-preview-notes { margin-top: 16px; font-size: 13px; color: #64748B; font-style: italic; }
      `}</style>

      <div className="qb-page">
        <div className="qb-bar">
          <span className="qb-bar-title">ACCIAN — Quote Builder</span>
          <span className="qb-bar-tag">Internal Use Only</span>
        </div>

        <div className="qb-layout">
          {/* ── LEFT: Builder ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Client Details */}
            <div className="qb-panel">
              <div className="qb-panel-title">Client Details</div>
              <div className="qb-grid2" style={{ marginBottom: "14px" }}>
                <div className="qb-field">
                  <label>Client Full Name *</label>
                  <input
                    placeholder="e.g. Aisha Okonkwo"
                    value={quote.clientName}
                    onChange={(e) => set("clientName", e.target.value)}
                  />
                </div>
                <div className="qb-field">
                  <label>Client Email *</label>
                  <input
                    placeholder="client@email.com"
                    value={quote.clientEmail}
                    onChange={(e) => set("clientEmail", e.target.value)}
                  />
                </div>
                <div className="qb-field">
                  <label>Quote Reference</label>
                  <input
                    value={quote.refNumber}
                    onChange={(e) => set("refNumber", e.target.value)}
                  />
                </div>
                <div className="qb-field">
                  <label>Quote Date</label>
                  <input
                    type="date"
                    value={quote.date}
                    onChange={(e) => set("date", e.target.value)}
                  />
                </div>
                <div className="qb-field">
                  <label>Valid for (days)</label>
                  <input
                    type="number"
                    value={quote.validDays}
                    onChange={(e) => set("validDays", e.target.value)}
                  />
                </div>
              </div>
              <div className="qb-field">
                <label>Additional Notes (optional)</label>
                <textarea
                  placeholder="Any bespoke notes to include in the quote or email..."
                  value={quote.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
            </div>

            {/* Services */}
            <div className="qb-panel">
              <div className="qb-panel-title">Select Services</div>

              {/* Quick package buttons */}
              <div className="qb-packages">
                {PACKAGES.map((pkg) => (
                  <button
                    key={pkg.name}
                    className="qb-pkg"
                    onClick={() => applyPackage(pkg.ids)}
                  >
                    {pkg.name}
                  </button>
                ))}
              </div>

              {SERVICES.map((s) => (
                <div
                  key={s.id}
                  className={`qb-service${quote.selected[s.id] ? " active" : ""}`}
                  onClick={() => toggleService(s.id)}
                >
                  <div className="qb-service-top">
                    <div
                      className={`qb-checkbox${quote.selected[s.id] ? " checked" : ""}`}
                    />
                    <div>
                      <div className="qb-service-name">{s.name}</div>
                      <div className="qb-service-desc">{s.description}</div>
                    </div>
                    <div
                      style={{
                        marginLeft: "auto",
                        color: "#C8A951",
                        fontWeight: 700,
                        fontSize: 13,
                        flexShrink: 0,
                      }}
                    >
                      {formatPrice(getMin(s), getMax(s))}
                    </div>
                  </div>

                  {quote.selected[s.id] && (
                    <div onClick={(e) => e.stopPropagation()}>
                      <div className="qb-price-row">
                        <div className="qb-price-input">
                          <label>Min price (£)</label>
                          <input
                            type="number"
                            placeholder={String(s.minPrice)}
                            value={quote.customMin[s.id] ?? ""}
                            onChange={(e) =>
                              setCustom("customMin", s.id, e.target.value)
                            }
                          />
                        </div>
                        <div className="qb-price-input">
                          <label>Max price (£)</label>
                          <input
                            type="number"
                            placeholder={String(s.maxPrice)}
                            value={quote.customMax[s.id] ?? ""}
                            onChange={(e) =>
                              setCustom("customMax", s.id, e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="qb-total">
                <span className="qb-total-label">Total Estimate</span>
                <span className="qb-total-amount">
                  {formatPrice(totalMin, totalMax)}
                </span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Preview + Actions ── */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {/* Actions */}
            <div className="qb-panel">
              <div className="qb-panel-title">Send & Export</div>
              <div className="qb-actions">
                <button
                  className="qb-btn qb-btn-primary"
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? "Hide" : "Preview"} Quote Document
                </button>
                <button className="qb-btn qb-btn-navy" onClick={openMailto}>
                  ✉ Open in Email Client
                </button>
                <button className="qb-btn qb-btn-outline" onClick={copyEmail}>
                  {emailCopied ? "✓ Copied!" : "Copy Email to Clipboard"}
                </button>
                <button className="qb-btn qb-btn-outline" onClick={printQuote}>
                  🖨 Print / Save as PDF
                </button>
              </div>
            </div>

            {/* Quote Preview */}
            {preview && (
              <div className="qb-panel" ref={printRef}>
                <div className="qb-panel-title">Quote Document Preview</div>
                <div className="qb-preview-quote">
                  <div className="qb-preview-header">
                    <div>
                      <div className="qb-preview-brand">ACCIAN</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>
                        Research Consultancy Services
                      </div>
                    </div>
                    <div className="qb-preview-meta">
                      <div>
                        <strong>Ref:</strong> {quote.refNumber}
                      </div>
                      <div>
                        <strong>Date:</strong>{" "}
                        {new Date(quote.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </div>
                      <div>
                        <strong>Valid for:</strong> {quote.validDays} days
                      </div>
                    </div>
                  </div>

                  <hr className="qb-preview-divider" />

                  <div className="qb-preview-to">
                    <strong>Prepared for:</strong> {quote.clientName || "—"}
                    <br />
                    <span style={{ color: "#64748B", fontSize: 13 }}>
                      {quote.clientEmail || ""}
                    </span>
                  </div>

                  {selectedServices.map((s) => (
                    <div key={s.id} className="qb-preview-service">
                      <div className="qb-preview-sname">{s.name}</div>
                      {s.bullets.map((b, i) => (
                        <div key={i} className="qb-preview-sbullet">
                          · {b}
                        </div>
                      ))}
                      <div className="qb-preview-sprice">
                        {formatPrice(getMin(s), getMax(s))}
                      </div>
                    </div>
                  ))}

                  <div className="qb-preview-total-row">
                    <span className="qb-preview-total-label">
                      Total Estimate
                    </span>
                    <span className="qb-preview-total-amt">
                      {formatPrice(totalMin, totalMax)}
                    </span>
                  </div>

                  {quote.notes && (
                    <div className="qb-preview-notes">Note: {quote.notes}</div>
                  )}

                  <div className="qb-preview-validity">
                    This quote is valid for {quote.validDays} days. To proceed,
                    reply to research@accian.co.uk
                  </div>
                </div>
              </div>
            )}

            {/* Email Template */}
            <div className="qb-panel">
              <div className="qb-panel-title">Email Template</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>
                Auto-generated from your selections above
              </div>
              <div className="qb-email-box">{emailBody}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
