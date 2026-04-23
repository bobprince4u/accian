module.exports = [
"[project]/pages/ResearchSupport.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ResearchSupportPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
// ── Hook: fires once when element scrolls into view ──
function useInView(options = {}) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [inView, setInView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry])=>{
            if (entry.isIntersecting) {
                setInView(true);
                obs.disconnect();
            }
        }, {
            threshold: 0.15,
            ...options
        });
        obs.observe(el);
        return ()=>obs.disconnect();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    return [
        ref,
        inView
    ];
}
// ── Data ─────────────────────────────────────
const steps = [
    {
        number: "01",
        title: "Download the Form",
        description: "Click the button below to download the Expression of Interest form to your device.",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.5,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
            }, void 0, false, {
                fileName: "[project]/pages/ResearchSupport.tsx",
                lineNumber: 77,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/pages/ResearchSupport.tsx",
            lineNumber: 71,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        number: "02",
        title: "Complete All Sections",
        description: "Fill in every section honestly. There are no wrong answers — we use your responses to understand your background and goals.",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.5,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            }, void 0, false, {
                fileName: "[project]/pages/ResearchSupport.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/pages/ResearchSupport.tsx",
            lineNumber: 91,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    },
    {
        number: "03",
        title: "Send It Back",
        description: "Email your completed form to info@accian.co.uk. We respond within 48–72 hours with a tailored proposal and quote.",
        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.5,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                d: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            }, void 0, false, {
                fileName: "[project]/pages/ResearchSupport.tsx",
                lineNumber: 117,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        }, void 0, false, {
            fileName: "[project]/pages/ResearchSupport.tsx",
            lineNumber: 111,
            columnNumber: 7
        }, ("TURBOPACK compile-time value", void 0))
    }
];
const services = [
    {
        label: "Research Topic Identification",
        desc: "We match you to a viable, fundable area of inquiry."
    },
    {
        label: "Supervisor Matching",
        desc: "We identify academics aligned with your research interests."
    },
    {
        label: "Proposal Development",
        desc: "Full end-to-end drafting of your research proposal."
    },
    {
        label: "Application Guidance",
        desc: "Support through university submission requirements."
    },
    {
        label: "Idea Refinement",
        desc: "We sharpen a rough idea into a coherent research question."
    }
];
const faqs = [
    {
        q: "Who is this service for?",
        a: "Anyone applying to a UK MRes, MSc by Research, or PhD programme who needs expert help shaping their research focus and proposal."
    },
    {
        q: "How much does it cost?",
        a: "Fees are tailored to the level of support required. You will receive a clear quote after we review your EOI form — no hidden charges."
    },
    {
        q: "Do I need a research idea already?",
        a: "Not at all. Many of our clients come to us with just a general interest area. Part of our service is helping you discover and define a strong research direction."
    },
    {
        q: "How long does the process take?",
        a: "It depends on the scope of support, but most clients have a complete proposal ready within 2–4 weeks of engaging with us."
    },
    {
        q: "Is my information kept confidential?",
        a: "Absolutely. All information you share is treated in strict confidence and used solely for the purpose of supporting your application."
    }
];
// ── Helpers ───────────────────────────────────
function getAnimClass(dir, triggered) {
    if (!triggered) return "card-hidden";
    if (dir === "left") return "card-animate-left";
    if (dir === "right") return "card-animate-right";
    return "card-animate-bottom";
}
function getStepDir(index) {
    if (index === 0) return "left";
    if (index === 2) return "right";
    return "bottom";
}
function ResearchSupportPage() {
    const [openFaq, setOpenFaq] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [stepsRef, stepsInView] = useInView();
    const [servicesRef, servicesInView] = useInView();
    const toggleFaq = (index)=>{
        setOpenFaq((prev)=>prev === index ? null : index);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
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
      `
            }, void 0, false, {
                fileName: "[project]/pages/ResearchSupport.tsx",
                lineNumber: 201,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rs-page",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rs-hero",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rs-hero-inner",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rs-hero-tag",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {}, void 0, false, {
                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                            lineNumber: 383,
                                            columnNumber: 15
                                        }, this),
                                        "Research Consultancy"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 382,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    children: [
                                        "Your research journey,",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                            lineNumber: 388,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                            children: "expertly guided."
                                        }, void 0, false, {
                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                            lineNumber: 389,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 386,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Struggling to find a research topic or write a compelling proposal? Accian's Research Support Service pairs you with expert consultants who help you identify your area, match with the right supervisor, and produce a proposal that stands out."
                                }, void 0, false, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 391,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                    href: "/Accian_EOI_Form.docx",
                                    download: "Accian_EOI_Form.docx",
                                    className: "rs-hero-cta",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                            viewBox: "0 0 24 24",
                                            fill: "none",
                                            stroke: "currentColor",
                                            strokeWidth: 2,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                strokeLinecap: "round",
                                                strokeLinejoin: "round",
                                                d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 408,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                            lineNumber: 402,
                                            columnNumber: 15
                                        }, this),
                                        "Download Expression of Interest Form"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 397,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/ResearchSupport.tsx",
                            lineNumber: 381,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/ResearchSupport.tsx",
                        lineNumber: 380,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rs-section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rs-section-label",
                                children: "The Process"
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 421,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "rs-section-heading",
                                children: "Three simple steps"
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 422,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rs-steps",
                                ref: stepsRef,
                                children: steps.map((s, i)=>{
                                    const dir = getStepDir(i);
                                    const animClass = getAnimClass(dir, stepsInView);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `rs-step ${animClass}`,
                                        style: {
                                            animationDelay: stepsInView ? `${i * 130}ms` : "0ms"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "rs-step-num",
                                                children: s.number
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 435,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rs-step-icon",
                                                children: s.icon
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 436,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                children: s.title
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 437,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: s.description
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 438,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, s.number, true, {
                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                        lineNumber: 428,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 423,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/ResearchSupport.tsx",
                        lineNumber: 420,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rs-divider"
                    }, void 0, false, {
                        fileName: "[project]/pages/ResearchSupport.tsx",
                        lineNumber: 445,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rs-section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rs-section-label",
                                children: "Our Services"
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 449,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "rs-section-heading",
                                children: "What we help with"
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 450,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rs-services",
                                ref: servicesRef,
                                children: services.map((s, i)=>{
                                    const dir = i % 2 === 0 ? "left" : "right";
                                    const animClass = getAnimClass(dir, servicesInView);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `rs-service ${animClass}`,
                                        style: {
                                            animationDelay: servicesInView ? `${i * 100}ms` : "0ms"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rs-service-dot"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 463,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        children: s.label
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                                        lineNumber: 465,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: s.desc
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                                        lineNumber: 466,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 464,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, s.label, true, {
                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                        lineNumber: 456,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 451,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/ResearchSupport.tsx",
                        lineNumber: 448,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rs-cta-band",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rs-cta-band-inner",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    children: "Ready to get started?"
                                }, void 0, false, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 477,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "Download the form, complete it at your own pace, and email it back. We will review your submission and send you a personalised quote within 48–72 hours."
                                }, void 0, false, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 478,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rs-cta-band-buttons",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "/Accian_EOI_Form.docx",
                                            download: "Accian_EOI_Form.docx",
                                            className: "rs-btn-primary",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: 2,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                                        lineNumber: 495,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                                    lineNumber: 489,
                                                    columnNumber: 17
                                                }, this),
                                                "Download EOI Form"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                            lineNumber: 484,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                            href: "mailto:research@accian.co.uk",
                                            className: "rs-btn-outline",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                    viewBox: "0 0 24 24",
                                                    fill: "none",
                                                    stroke: "currentColor",
                                                    strokeWidth: 2,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                        strokeLinecap: "round",
                                                        strokeLinejoin: "round",
                                                        d: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                                        lineNumber: 510,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                                    lineNumber: 504,
                                                    columnNumber: 17
                                                }, this),
                                                "Email Us Directly"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                            lineNumber: 503,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/pages/ResearchSupport.tsx",
                                    lineNumber: 483,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/ResearchSupport.tsx",
                            lineNumber: 476,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/pages/ResearchSupport.tsx",
                        lineNumber: 475,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "rs-section",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rs-section-label",
                                children: "Questions"
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 524,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "rs-section-heading",
                                style: {
                                    textAlign: "center"
                                },
                                children: "Frequently asked questions"
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 525,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rs-faqs",
                                children: faqs.map((faq, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rs-faq",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                className: "rs-faq-q",
                                                onClick: ()=>toggleFaq(i),
                                                children: [
                                                    faq.q,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: `rs-faq-icon${openFaq === i ? " open" : ""}`,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                            viewBox: "0 0 24 24",
                                                            fill: "none",
                                                            stroke: "currentColor",
                                                            strokeWidth: 2.5,
                                                            width: 18,
                                                            height: 18,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                strokeLinecap: "round",
                                                                strokeLinejoin: "round",
                                                                d: "M12 4.5v15m7.5-7.5h-15"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                                lineNumber: 544,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/ResearchSupport.tsx",
                                                            lineNumber: 536,
                                                            columnNumber: 21
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                                        lineNumber: 533,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 531,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `rs-faq-a${openFaq === i ? " open" : ""}`,
                                                children: faq.a
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ResearchSupport.tsx",
                                                lineNumber: 552,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/pages/ResearchSupport.tsx",
                                        lineNumber: 530,
                                        columnNumber: 15
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/pages/ResearchSupport.tsx",
                                lineNumber: 528,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/ResearchSupport.tsx",
                        lineNumber: 523,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/ResearchSupport.tsx",
                lineNumber: 378,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=pages_ResearchSupport_tsx_0zkyad1._.js.map