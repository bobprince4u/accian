"use client";

import { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import Cookies from "js-cookie";
import { Phone, Mail, Clock, MapPin, Send, CheckCircle2 } from "lucide-react";
import { API_URL } from "../config/api";

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

// ─── Country codes ────────────────────────────────────────────────────────────
const countryCodes = [
  {
    code: "+1",
    country: "United States",
    flag: "🇺🇸",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+1", country: "Canada", flag: "🇨🇦", minLength: 10, maxLength: 10 },
  { code: "+7", country: "Russia", flag: "🇷🇺", minLength: 10, maxLength: 10 },
  { code: "+20", country: "Egypt", flag: "🇪🇬", minLength: 10, maxLength: 10 },
  {
    code: "+27",
    country: "South Africa",
    flag: "🇿🇦",
    minLength: 9,
    maxLength: 9,
  },
  { code: "+30", country: "Greece", flag: "🇬🇷", minLength: 10, maxLength: 10 },
  {
    code: "+31",
    country: "Netherlands",
    flag: "🇳🇱",
    minLength: 9,
    maxLength: 9,
  },
  { code: "+32", country: "Belgium", flag: "🇧🇪", minLength: 9, maxLength: 9 },
  { code: "+33", country: "France", flag: "🇫🇷", minLength: 9, maxLength: 9 },
  { code: "+34", country: "Spain", flag: "🇪🇸", minLength: 9, maxLength: 9 },
  { code: "+36", country: "Hungary", flag: "🇭🇺", minLength: 9, maxLength: 9 },
  { code: "+39", country: "Italy", flag: "🇮🇹", minLength: 9, maxLength: 10 },
  { code: "+40", country: "Romania", flag: "🇷🇴", minLength: 9, maxLength: 9 },
  {
    code: "+41",
    country: "Switzerland",
    flag: "🇨🇭",
    minLength: 9,
    maxLength: 9,
  },
  { code: "+43", country: "Austria", flag: "🇦🇹", minLength: 10, maxLength: 11 },
  {
    code: "+44",
    country: "United Kingdom",
    flag: "🇬🇧",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+45", country: "Denmark", flag: "🇩🇰", minLength: 8, maxLength: 8 },
  { code: "+46", country: "Sweden", flag: "🇸🇪", minLength: 9, maxLength: 9 },
  { code: "+47", country: "Norway", flag: "🇳🇴", minLength: 8, maxLength: 8 },
  { code: "+48", country: "Poland", flag: "🇵🇱", minLength: 9, maxLength: 9 },
  { code: "+49", country: "Germany", flag: "🇩🇪", minLength: 10, maxLength: 11 },
  { code: "+51", country: "Peru", flag: "🇵🇪", minLength: 9, maxLength: 9 },
  { code: "+52", country: "Mexico", flag: "🇲🇽", minLength: 10, maxLength: 10 },
  {
    code: "+54",
    country: "Argentina",
    flag: "🇦🇷",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+55", country: "Brazil", flag: "🇧🇷", minLength: 11, maxLength: 11 },
  { code: "+56", country: "Chile", flag: "🇨🇱", minLength: 9, maxLength: 9 },
  {
    code: "+57",
    country: "Colombia",
    flag: "🇨🇴",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+60", country: "Malaysia", flag: "🇲🇾", minLength: 9, maxLength: 10 },
  { code: "+61", country: "Australia", flag: "🇦🇺", minLength: 9, maxLength: 9 },
  {
    code: "+62",
    country: "Indonesia",
    flag: "🇮🇩",
    minLength: 10,
    maxLength: 11,
  },
  {
    code: "+63",
    country: "Philippines",
    flag: "🇵🇭",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+65", country: "Singapore", flag: "🇸🇬", minLength: 8, maxLength: 8 },
  { code: "+66", country: "Thailand", flag: "🇹🇭", minLength: 9, maxLength: 9 },
  { code: "+81", country: "Japan", flag: "🇯🇵", minLength: 10, maxLength: 10 },
  {
    code: "+82",
    country: "South Korea",
    flag: "🇰🇷",
    minLength: 9,
    maxLength: 10,
  },
  { code: "+86", country: "China", flag: "🇨🇳", minLength: 11, maxLength: 11 },
  { code: "+90", country: "Turkey", flag: "🇹🇷", minLength: 10, maxLength: 10 },
  { code: "+91", country: "India", flag: "🇮🇳", minLength: 10, maxLength: 10 },
  {
    code: "+92",
    country: "Pakistan",
    flag: "🇵🇰",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰", minLength: 9, maxLength: 9 },
  { code: "+98", country: "Iran", flag: "🇮🇷", minLength: 10, maxLength: 10 },
  { code: "+212", country: "Morocco", flag: "🇲🇦", minLength: 9, maxLength: 9 },
  { code: "+213", country: "Algeria", flag: "🇩🇿", minLength: 9, maxLength: 9 },
  { code: "+216", country: "Tunisia", flag: "🇹🇳", minLength: 8, maxLength: 8 },
  { code: "+221", country: "Senegal", flag: "🇸🇳", minLength: 9, maxLength: 9 },
  { code: "+233", country: "Ghana", flag: "🇬🇭", minLength: 9, maxLength: 9 },
  {
    code: "+234",
    country: "Nigeria",
    flag: "🇳🇬",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹", minLength: 9, maxLength: 9 },
  { code: "+254", country: "Kenya", flag: "🇰🇪", minLength: 9, maxLength: 9 },
  { code: "+255", country: "Tanzania", flag: "🇹🇿", minLength: 9, maxLength: 9 },
  { code: "+256", country: "Uganda", flag: "🇺🇬", minLength: 9, maxLength: 9 },
  { code: "+260", country: "Zambia", flag: "🇿🇲", minLength: 9, maxLength: 9 },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼", minLength: 9, maxLength: 9 },
  { code: "+351", country: "Portugal", flag: "🇵🇹", minLength: 9, maxLength: 9 },
  { code: "+353", country: "Ireland", flag: "🇮🇪", minLength: 9, maxLength: 9 },
  { code: "+358", country: "Finland", flag: "🇫🇮", minLength: 9, maxLength: 10 },
  { code: "+380", country: "Ukraine", flag: "🇺🇦", minLength: 9, maxLength: 9 },
  {
    code: "+420",
    country: "Czech Republic",
    flag: "🇨🇿",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "+852",
    country: "Hong Kong",
    flag: "🇭🇰",
    minLength: 8,
    maxLength: 8,
  },
  {
    code: "+880",
    country: "Bangladesh",
    flag: "🇧🇩",
    minLength: 10,
    maxLength: 10,
  },
  { code: "+960", country: "Maldives", flag: "🇲🇻", minLength: 7, maxLength: 7 },
  { code: "+961", country: "Lebanon", flag: "🇱🇧", minLength: 8, maxLength: 8 },
  {
    code: "+966",
    country: "Saudi Arabia",
    flag: "🇸🇦",
    minLength: 9,
    maxLength: 9,
  },
  { code: "+971", country: "UAE", flag: "🇦🇪", minLength: 9, maxLength: 9 },
  { code: "+972", country: "Israel", flag: "🇮🇱", minLength: 9, maxLength: 9 },
  { code: "+974", country: "Qatar", flag: "🇶🇦", minLength: 8, maxLength: 8 },
  { code: "+977", country: "Nepal", flag: "🇳🇵", minLength: 10, maxLength: 10 },
  {
    code: "+992",
    country: "Tajikistan",
    flag: "🇹🇯",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "+994",
    country: "Azerbaijan",
    flag: "🇦🇿",
    minLength: 9,
    maxLength: 9,
  },
  {
    code: "+998",
    country: "Uzbekistan",
    flag: "🇺🇿",
    minLength: 9,
    maxLength: 9,
  },
];

const inputCls =
  "w-full bg-[#F5F3EE] border border-[#D8D3C9] rounded-lg px-4 py-3 text-sm font-light text-[#0D0D0D] placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all duration-200";

const labelCls =
  "block text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-2";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    countryCode: "+44",
    serviceInterest: "",
    projectBudget: "",
    projectTimeline: "",
    message: "",
    howHeard: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");

  useEffect(() => {
    if (Cookies.get("cookie_consent") === "true") {
      const saved = Cookies.get("contact_form");
      if (saved) setFormData(JSON.parse(saved));
    }
  }, []);

  const validatePhone = (phone: string, countryCode: string): boolean => {
    const country = countryCodes.find((c) => c.code === countryCode);
    if (!country) return true;
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 0) {
      setPhoneError("");
      return true;
    }
    if (digits.length < country.minLength) {
      setPhoneError(
        `Phone must be ${country.minLength} digits for ${country.country}`,
      );
      return false;
    }
    if (digits.length > country.maxLength) {
      setPhoneError(
        `Phone must not exceed ${country.maxLength} digits for ${country.country}`,
      );
      return false;
    }
    setPhoneError("");
    return true;
  };

  const checkRateLimit = (): boolean => {
    const s: number[] = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]",
    );
    if (s.filter((t) => t > Date.now() - 3600000).length >= 3) {
      setRateLimitError(
        "Too many submissions. Please wait an hour and try again.",
      );
      return false;
    }
    return true;
  };

  const recordSubmission = () => {
    const s: number[] = JSON.parse(
      localStorage.getItem("formSubmissions") || "[]",
    );
    s.push(Date.now());
    localStorage.setItem("formSubmissions", JSON.stringify(s));
  };

  const generateToken = (): string =>
    Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);
    if (Cookies.get("cookie_consent") === "true")
      Cookies.set("contact_form", JSON.stringify(updated), { expires: 7 });
    if (name === "phone" || name === "countryCode")
      validatePhone(
        name === "phone" ? value : formData.phone,
        name === "countryCode" ? value : formData.countryCode,
      );
  };

  const sanitize = (s: string) => {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkRateLimit()) return;
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.serviceInterest ||
      !formData.message
    ) {
      setRateLimitError("Please fill in all required fields.");
      return;
    }
    if (formData.phone && !validatePhone(formData.phone, formData.countryCode))
      return;
    setSubmitting(true);
    setRateLimitError("");
    try {
      const securityToken = generateToken();
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Security-Token": securityToken,
        },
        body: JSON.stringify({
          fullName: sanitize(formData.fullName),
          email: sanitize(formData.email),
          companyName: sanitize(formData.companyName),
          phone: formData.phone
            ? `${formData.countryCode}${formData.phone.replace(/\D/g, "")}`
            : "",
          serviceInterest: sanitize(formData.serviceInterest),
          projectBudget: sanitize(formData.projectBudget),
          projectTimeline: sanitize(formData.projectTimeline),
          message: sanitize(formData.message),
          howHeard: sanitize(formData.howHeard),
          securityToken,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      toast.success("Message sent! We'll get back to you soon.", {
        duration: 5000,
        position: "top-center",
      });
      recordSubmission();
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          fullName: "",
          email: "",
          companyName: "",
          phone: "",
          countryCode: "+44",
          serviceInterest: "",
          projectBudget: "",
          projectTimeline: "",
          message: "",
          howHeard: "",
        });
        Cookies.remove("contact_form");
        setSubmitting(false);
      }, 3000);
    } catch {
      toast.error("Oops! Something went wrong. Please try again.", {
        duration: 5000,
        position: "top-center",
      });
      setRateLimitError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-[#F5F3EE]">
      <Toaster />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0D0D0D] py-28 px-6 lg:px-12 text-center">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-600/12 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-600/8 blur-[70px] pointer-events-none" />

        <div className="relative container mx-auto max-w-3xl">
          <div
            className="inline-flex items-center gap-2 mb-6"
            style={{ animation: "fadeUp 0.6s 0.1s ease both" }}
          >
            <span className="block w-7 h-0.5 bg-blue-500 rounded-full" />
            <span className="text-xs font-semibold tracking-widest uppercase text-blue-400">
              Contact Us
            </span>
            <span className="block w-7 h-0.5 bg-blue-500 rounded-full" />
          </div>
          <h1
            className="text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5"
            style={{ animation: "fadeUp 0.7s 0.2s ease both" }}
          >
            Let&apos;s Start Your
            <br />
            <span className="text-blue-500">Digital Transformation</span>
          </h1>
          <p
            className="text-sm lg:text-base font-light text-white/50 leading-relaxed max-w-xl mx-auto"
            style={{ animation: "fadeUp 0.7s 0.35s ease both" }}
          >
            Ready to discuss your project? Our expert team is here to provide
            tailored solutions for your business needs. Get in touch for a
            complimentary consultation.
          </p>
        </div>
      </section>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 lg:px-12">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* ── FORM ──────────────────────────────────────────────────────── */}
          <Reveal className="lg:col-span-3" direction="left">
            <div className="bg-white border border-[#E8E4DC] rounded-2xl p-8 lg:p-10 hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
                Get in Touch
              </p>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#0D0D0D] mb-7">
                Send Us a Message
              </h2>

              {rateLimitError && (
                <div
                  className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 text-sm text-red-700"
                  style={{ animation: "scaleIn 0.3s ease both" }}
                >
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {rateLimitError}
                </div>
              )}

              {formSubmitted ? (
                <div
                  className="flex flex-col items-center justify-center py-16 text-center"
                  role="alert"
                  aria-live="polite"
                  style={{ animation: "scaleIn 0.5s ease both" }}
                >
                  <div
                    className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4"
                    style={{ animation: "scaleIn 0.5s 0.1s ease both" }}
                  >
                    <CheckCircle2 size={32} className="text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0D0D0D] mb-2">
                    Thank You!
                  </h3>
                  <p className="text-sm font-light text-gray-500">
                    We&apos;ve received your message and will get back to you
                    within 48 hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  aria-label="Contact form"
                >
                  {/* Row 1 */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    style={{ animation: "fadeUp 0.5s 0.1s ease both" }}
                  >
                    <div>
                      <label htmlFor="fullName" className={labelCls}>
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        maxLength={100}
                        required
                        aria-required="true"
                        placeholder="Jane Smith"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className={labelCls}>
                        Business Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        maxLength={100}
                        required
                        aria-required="true"
                        placeholder="jane@company.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    style={{ animation: "fadeUp 0.5s 0.18s ease both" }}
                  >
                    <div>
                      <label htmlFor="companyName" className={labelCls}>
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="Your Company Ltd"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="bg-[#F5F3EE] border border-[#D8D3C9] rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all duration-200"
                        >
                          {countryCodes.map((c, i) => (
                            <option key={i} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="7749101623"
                          className={`flex-1 bg-[#F5F3EE] border ${phoneError ? "border-red-400 ring-2 ring-red-400/10" : "border-[#D8D3C9]"} rounded-lg px-4 py-3 text-sm font-light focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all duration-200`}
                        />
                      </div>
                      {phoneError && (
                        <p
                          className="mt-1.5 text-xs text-red-500"
                          style={{ animation: "fadeUp 0.3s ease both" }}
                        >
                          {phoneError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    style={{ animation: "fadeUp 0.5s 0.26s ease both" }}
                  >
                    <div>
                      <label htmlFor="serviceInterest" className={labelCls}>
                        Service Interest <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="serviceInterest"
                        name="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        className={inputCls}
                      >
                        <option value="">Select a service</option>
                        <option value="it-consulting-advisory">
                          IT Consulting & Advisory
                        </option>
                        <option value="software-development">
                          Business & Domestic Software Development
                        </option>
                        <option value="education-training">
                          Education & Training
                        </option>
                        <option value="social-care">
                          Social Care & Community Support
                        </option>
                        <option value="data-science-ai">
                          Data Science, AI & Predictive Analytics
                        </option>
                        <option value="multiple">Multiple Services</option>
                        <option value="not-sure">Not Sure Yet</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="projectBudget" className={labelCls}>
                        Project Budget
                      </label>
                      <select
                        id="projectBudget"
                        name="projectBudget"
                        value={formData.projectBudget}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="">Select budget range</option>
                        <option value="prefer-discuss">
                          Prefer to Discuss
                        </option>
                      </select>
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-5"
                    style={{ animation: "fadeUp 0.5s 0.34s ease both" }}
                  >
                    <div>
                      <label htmlFor="projectTimeline" className={labelCls}>
                        Project Timeline
                      </label>
                      <select
                        id="projectTimeline"
                        name="projectTimeline"
                        value={formData.projectTimeline}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="">Select timeline</option>
                        <option value="urgent">Urgent (Within 1 month)</option>
                        <option value="short-term">
                          Short-term (1–3 months)
                        </option>
                        <option value="medium-term">
                          Medium-term (3–6 months)
                        </option>
                        <option value="long-term">Long-term (6+ months)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="howHeard" className={labelCls}>
                        How did you hear about us?
                      </label>
                      <select
                        id="howHeard"
                        name="howHeard"
                        value={formData.howHeard}
                        onChange={handleChange}
                        className={inputCls}
                      >
                        <option value="">Select an option</option>
                        <option value="google">Google Search</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="referral">Referral</option>
                        <option value="social-media">Social Media</option>
                        <option value="event">Event / Conference</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div style={{ animation: "fadeUp 0.5s 0.42s ease both" }}>
                    <label htmlFor="message" className={labelCls}>
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      maxLength={1000}
                      required
                      aria-required="true"
                      rows={5}
                      placeholder="Tell us about your project, challenges, or questions..."
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  {/* Privacy */}
                  <p
                    className="text-xs font-light text-gray-400 leading-relaxed"
                    style={{ animation: "fadeUp 0.5s 0.5s ease both" }}
                  >
                    By submitting this form, you agree to our Privacy Policy. We
                    respect your privacy and will never share your information
                    with third parties.
                  </p>

                  {/* Submit */}
                  <div style={{ animation: "fadeUp 0.5s 0.55s ease both" }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-[#0D0D0D] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white text-sm font-semibold px-6 py-4 rounded-xl transition-all duration-200"
                      aria-label="Submit contact form"
                    >
                      <Send
                        size={16}
                        className={submitting ? "animate-pulse" : ""}
                        aria-hidden="true"
                      />
                      {submitting ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </Reveal>

          {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Contact details card */}
            <Reveal direction="right" delay={100}>
              <div className="bg-white border border-[#E8E4DC] rounded-2xl p-7 hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300">
                <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2">
                  Reach Us Directly
                </p>
                <h3 className="text-lg font-bold text-[#0D0D0D] mb-6">
                  Contact Information
                </h3>

                <div className="space-y-5">
                  {[
                    {
                      icon: Phone,
                      label: "Phone",
                      primary: "+44 7749 101623",
                      secondary: "Mon–Fri, 9AM–5PM GMT",
                    },
                    {
                      icon: Mail,
                      label: "Email",
                      primary: "info@accian.co.uk",
                      secondary: "Response within 24 business hours",
                    },
                    {
                      icon: Clock,
                      label: "Business Hours",
                      primary: "Mon–Fri: 9:00 AM – 5:00 PM GMT",
                      secondary: "Emergency support 24/7 for existing clients",
                      extra: ["Saturday: By Appointment", "Sunday: Closed"],
                    },
                    {
                      icon: MapPin,
                      label: "Location",
                      primary: "🇬🇧 United Kingdom",
                      secondary: "Serving clients worldwide",
                    },
                  ].map(
                    ({ icon: Icon, label, primary, secondary, extra }, i) => (
                      <div
                        key={label}
                        className="flex items-start gap-3.5 group"
                        style={{
                          animation: `fadeUp 0.5s ${0.1 + i * 0.08}s ease both`,
                        }}
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                          <Icon
                            size={18}
                            className="text-blue-600 group-hover:text-white transition-colors duration-300"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-0.5">
                            {label}
                          </p>
                          <p className="text-sm font-light text-gray-600">
                            {primary}
                          </p>
                          {extra?.map((e) => (
                            <p
                              key={e}
                              className="text-sm font-light text-gray-500"
                            >
                              {e}
                            </p>
                          ))}
                          <p className="text-xs font-light text-gray-400 mt-0.5">
                            {secondary}
                          </p>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </Reveal>

            {/* CTA card */}
            <Reveal direction="right" delay={200}>
              <div className="relative overflow-hidden bg-[#0D0D0D] rounded-2xl p-7 hover:shadow-2xl hover:shadow-black/30 transition-shadow duration-300 group">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-600/15 pointer-events-none group-hover:bg-blue-600/25 transition-colors duration-300" />
                <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-blue-600/8 pointer-events-none" />
                <div className="relative">
                  <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-2">
                    Free Consultation
                  </p>
                  <h4 className="text-lg font-bold text-white mb-3 leading-snug">
                    Ready to Get Started?
                  </h4>
                  <p className="text-sm font-light text-white/50 leading-relaxed">
                    Schedule a free consultation call to discuss your project
                    requirements and explore how we can help — just fill in the
                    form.
                  </p>
                  <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Typically responds within 24 hours
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
