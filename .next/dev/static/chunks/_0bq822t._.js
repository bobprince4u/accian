(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/config/api.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "API_URL",
    ()=>API_URL
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const API_URL = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || "http://localhost:2025";
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/pages/ContactPage.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ContactPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-hot-toast/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/api.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
// ─── Scroll reveal ────────────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
    _s();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [visible, setVisible] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useReveal.useEffect": ()=>{
            const obs = new IntersectionObserver({
                "useReveal.useEffect": ([e])=>{
                    if (e.isIntersecting) {
                        setVisible(true);
                        obs.disconnect();
                    }
                }
            }["useReveal.useEffect"], {
                threshold
            });
            if (ref.current) obs.observe(ref.current);
            return ({
                "useReveal.useEffect": ()=>obs.disconnect()
            })["useReveal.useEffect"];
        }
    }["useReveal.useEffect"], [
        threshold
    ]);
    return {
        ref,
        visible
    };
}
_s(useReveal, "F7BtIAxVh3vOWU1Jr24RYsj9CHc=");
function Reveal({ children, delay = 0, className = "", direction = "up" }) {
    _s1();
    const { ref, visible } = useReveal();
    const t = direction === "left" ? "translateX(-28px)" : direction === "right" ? "translateX(28px)" : "translateY(28px)";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: className,
        style: {
            opacity: visible ? 1 : 0,
            transform: visible ? "translate(0)" : t,
            transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/pages/ContactPage.tsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
_s1(Reveal, "M2uV/+i61alUo/hG/g9vVK6yajw=", false, function() {
    return [
        useReveal
    ];
});
_c = Reveal;
// ─── Country codes ────────────────────────────────────────────────────────────
const countryCodes = [
    {
        code: "+1",
        country: "United States",
        flag: "🇺🇸",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+1",
        country: "Canada",
        flag: "🇨🇦",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+7",
        country: "Russia",
        flag: "🇷🇺",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+20",
        country: "Egypt",
        flag: "🇪🇬",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+27",
        country: "South Africa",
        flag: "🇿🇦",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+30",
        country: "Greece",
        flag: "🇬🇷",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+31",
        country: "Netherlands",
        flag: "🇳🇱",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+32",
        country: "Belgium",
        flag: "🇧🇪",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+33",
        country: "France",
        flag: "🇫🇷",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+34",
        country: "Spain",
        flag: "🇪🇸",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+36",
        country: "Hungary",
        flag: "🇭🇺",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+39",
        country: "Italy",
        flag: "🇮🇹",
        minLength: 9,
        maxLength: 10
    },
    {
        code: "+40",
        country: "Romania",
        flag: "🇷🇴",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+41",
        country: "Switzerland",
        flag: "🇨🇭",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+43",
        country: "Austria",
        flag: "🇦🇹",
        minLength: 10,
        maxLength: 11
    },
    {
        code: "+44",
        country: "United Kingdom",
        flag: "🇬🇧",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+45",
        country: "Denmark",
        flag: "🇩🇰",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+46",
        country: "Sweden",
        flag: "🇸🇪",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+47",
        country: "Norway",
        flag: "🇳🇴",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+48",
        country: "Poland",
        flag: "🇵🇱",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+49",
        country: "Germany",
        flag: "🇩🇪",
        minLength: 10,
        maxLength: 11
    },
    {
        code: "+51",
        country: "Peru",
        flag: "🇵🇪",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+52",
        country: "Mexico",
        flag: "🇲🇽",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+54",
        country: "Argentina",
        flag: "🇦🇷",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+55",
        country: "Brazil",
        flag: "🇧🇷",
        minLength: 11,
        maxLength: 11
    },
    {
        code: "+56",
        country: "Chile",
        flag: "🇨🇱",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+57",
        country: "Colombia",
        flag: "🇨🇴",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+60",
        country: "Malaysia",
        flag: "🇲🇾",
        minLength: 9,
        maxLength: 10
    },
    {
        code: "+61",
        country: "Australia",
        flag: "🇦🇺",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+62",
        country: "Indonesia",
        flag: "🇮🇩",
        minLength: 10,
        maxLength: 11
    },
    {
        code: "+63",
        country: "Philippines",
        flag: "🇵🇭",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+65",
        country: "Singapore",
        flag: "🇸🇬",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+66",
        country: "Thailand",
        flag: "🇹🇭",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+81",
        country: "Japan",
        flag: "🇯🇵",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+82",
        country: "South Korea",
        flag: "🇰🇷",
        minLength: 9,
        maxLength: 10
    },
    {
        code: "+86",
        country: "China",
        flag: "🇨🇳",
        minLength: 11,
        maxLength: 11
    },
    {
        code: "+90",
        country: "Turkey",
        flag: "🇹🇷",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+91",
        country: "India",
        flag: "🇮🇳",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+92",
        country: "Pakistan",
        flag: "🇵🇰",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+94",
        country: "Sri Lanka",
        flag: "🇱🇰",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+98",
        country: "Iran",
        flag: "🇮🇷",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+212",
        country: "Morocco",
        flag: "🇲🇦",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+213",
        country: "Algeria",
        flag: "🇩🇿",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+216",
        country: "Tunisia",
        flag: "🇹🇳",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+221",
        country: "Senegal",
        flag: "🇸🇳",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+233",
        country: "Ghana",
        flag: "🇬🇭",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+234",
        country: "Nigeria",
        flag: "🇳🇬",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+251",
        country: "Ethiopia",
        flag: "🇪🇹",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+254",
        country: "Kenya",
        flag: "🇰🇪",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+255",
        country: "Tanzania",
        flag: "🇹🇿",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+256",
        country: "Uganda",
        flag: "🇺🇬",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+260",
        country: "Zambia",
        flag: "🇿🇲",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+263",
        country: "Zimbabwe",
        flag: "🇿🇼",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+351",
        country: "Portugal",
        flag: "🇵🇹",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+353",
        country: "Ireland",
        flag: "🇮🇪",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+358",
        country: "Finland",
        flag: "🇫🇮",
        minLength: 9,
        maxLength: 10
    },
    {
        code: "+380",
        country: "Ukraine",
        flag: "🇺🇦",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+420",
        country: "Czech Republic",
        flag: "🇨🇿",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+852",
        country: "Hong Kong",
        flag: "🇭🇰",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+880",
        country: "Bangladesh",
        flag: "🇧🇩",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+960",
        country: "Maldives",
        flag: "🇲🇻",
        minLength: 7,
        maxLength: 7
    },
    {
        code: "+961",
        country: "Lebanon",
        flag: "🇱🇧",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+966",
        country: "Saudi Arabia",
        flag: "🇸🇦",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+971",
        country: "UAE",
        flag: "🇦🇪",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+972",
        country: "Israel",
        flag: "🇮🇱",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+974",
        country: "Qatar",
        flag: "🇶🇦",
        minLength: 8,
        maxLength: 8
    },
    {
        code: "+977",
        country: "Nepal",
        flag: "🇳🇵",
        minLength: 10,
        maxLength: 10
    },
    {
        code: "+992",
        country: "Tajikistan",
        flag: "🇹🇯",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+994",
        country: "Azerbaijan",
        flag: "🇦🇿",
        minLength: 9,
        maxLength: 9
    },
    {
        code: "+998",
        country: "Uzbekistan",
        flag: "🇺🇿",
        minLength: 9,
        maxLength: 9
    }
];
const inputCls = "w-full bg-[#F5F3EE] border border-[#D8D3C9] rounded-lg px-4 py-3 text-sm font-light text-[#0D0D0D] placeholder:text-gray-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all duration-200";
const labelCls = "block text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-2";
function ContactPage() {
    _s2();
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        fullName: "",
        email: "",
        companyName: "",
        phone: "",
        countryCode: "+44",
        serviceInterest: "",
        projectBudget: "",
        projectTimeline: "",
        message: "",
        howHeard: ""
    });
    const [formSubmitted, setFormSubmitted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [submitting, setSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [phoneError, setPhoneError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [rateLimitError, setRateLimitError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ContactPage.useEffect": ()=>{
            if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("cookie_consent") === "true") {
                const saved = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("contact_form");
                if (saved) setFormData(JSON.parse(saved));
            }
        }
    }["ContactPage.useEffect"], []);
    const validatePhone = (phone, countryCode)=>{
        const country = countryCodes.find((c)=>c.code === countryCode);
        if (!country) return true;
        const digits = phone.replace(/\D/g, "");
        if (digits.length === 0) {
            setPhoneError("");
            return true;
        }
        if (digits.length < country.minLength) {
            setPhoneError(`Phone must be ${country.minLength} digits for ${country.country}`);
            return false;
        }
        if (digits.length > country.maxLength) {
            setPhoneError(`Phone must not exceed ${country.maxLength} digits for ${country.country}`);
            return false;
        }
        setPhoneError("");
        return true;
    };
    const checkRateLimit = ()=>{
        const s = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        if (s.filter((t)=>t > Date.now() - 3600000).length >= 3) {
            setRateLimitError("Too many submissions. Please wait an hour and try again.");
            return false;
        }
        return true;
    };
    const recordSubmission = ()=>{
        const s = JSON.parse(localStorage.getItem("formSubmissions") || "[]");
        s.push(Date.now());
        localStorage.setItem("formSubmissions", JSON.stringify(s));
    };
    const generateToken = ()=>Array.from(crypto.getRandomValues(new Uint8Array(32))).map((b)=>b.toString(16).padStart(2, "0")).join("");
    const handleChange = (e)=>{
        const { name, value } = e.target;
        const updated = {
            ...formData,
            [name]: value
        };
        setFormData(updated);
        if (__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("cookie_consent") === "true") __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set("contact_form", JSON.stringify(updated), {
            expires: 7
        });
        if (name === "phone" || name === "countryCode") validatePhone(name === "phone" ? value : formData.phone, name === "countryCode" ? value : formData.countryCode);
    };
    const sanitize = (s)=>{
        const d = document.createElement("div");
        d.textContent = s;
        return d.innerHTML;
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!checkRateLimit()) return;
        if (!formData.fullName || !formData.email || !formData.serviceInterest || !formData.message) {
            setRateLimitError("Please fill in all required fields.");
            return;
        }
        if (formData.phone && !validatePhone(formData.phone, formData.countryCode)) return;
        setSubmitting(true);
        setRateLimitError("");
        try {
            const securityToken = generateToken();
            const response = await fetch(`${__TURBOPACK__imported__module__$5b$project$5d2f$config$2f$api$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["API_URL"]}/api/contact`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Security-Token": securityToken
                },
                body: JSON.stringify({
                    fullName: sanitize(formData.fullName),
                    email: sanitize(formData.email),
                    companyName: sanitize(formData.companyName),
                    phone: formData.phone ? `${formData.countryCode}${formData.phone.replace(/\D/g, "")}` : "",
                    serviceInterest: sanitize(formData.serviceInterest),
                    projectBudget: sanitize(formData.projectBudget),
                    projectTimeline: sanitize(formData.projectTimeline),
                    message: sanitize(formData.message),
                    howHeard: sanitize(formData.howHeard),
                    securityToken,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent
                })
            });
            if (!response.ok) throw new Error("Failed");
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].success("Message sent! We'll get back to you soon.", {
                duration: 5000,
                position: "top-center"
            });
            recordSubmission();
            setFormSubmitted(true);
            setTimeout(()=>{
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
                    howHeard: ""
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove("contact_form");
                setSubmitting(false);
            }, 3000);
        } catch  {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].error("Oops! Something went wrong. Please try again.", {
                duration: 5000,
                position: "top-center"
            });
            setRateLimitError("Something went wrong. Please try again.");
            setSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "bg-[#F5F3EE]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$hot$2d$toast$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Toaster"], {}, void 0, false, {
                fileName: "[project]/pages/ContactPage.tsx",
                lineNumber: 432,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.92); } to { opacity:1; transform:scale(1); } }
      `
            }, void 0, false, {
                fileName: "[project]/pages/ContactPage.tsx",
                lineNumber: 434,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "relative overflow-hidden bg-[#0D0D0D] py-28 px-6 lg:px-12 text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-600/12 blur-[80px] pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/pages/ContactPage.tsx",
                        lineNumber: 442,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-600/8 blur-[70px] pointer-events-none"
                    }, void 0, false, {
                        fileName: "[project]/pages/ContactPage.tsx",
                        lineNumber: 443,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative container mx-auto max-w-3xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "inline-flex items-center gap-2 mb-6",
                                style: {
                                    animation: "fadeUp 0.6s 0.1s ease both"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block w-7 h-0.5 bg-blue-500 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 450,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold tracking-widest uppercase text-blue-400",
                                        children: "Contact Us"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 451,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block w-7 h-0.5 bg-blue-500 rounded-full"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 454,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/ContactPage.tsx",
                                lineNumber: 446,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-4xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-5",
                                style: {
                                    animation: "fadeUp 0.7s 0.2s ease both"
                                },
                                children: [
                                    "Let's Start Your",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 461,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-500",
                                        children: "Digital Transformation"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 462,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/ContactPage.tsx",
                                lineNumber: 456,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm lg:text-base font-light text-white/50 leading-relaxed max-w-xl mx-auto",
                                style: {
                                    animation: "fadeUp 0.7s 0.35s ease both"
                                },
                                children: "Ready to discuss your project? Our expert team is here to provide tailored solutions for your business needs. Get in touch for a complimentary consultation."
                            }, void 0, false, {
                                fileName: "[project]/pages/ContactPage.tsx",
                                lineNumber: 464,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/pages/ContactPage.tsx",
                        lineNumber: 445,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/pages/ContactPage.tsx",
                lineNumber: 441,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                className: "py-20 px-6 lg:px-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 items-start",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Reveal, {
                            className: "lg:col-span-3",
                            direction: "left",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white border border-[#E8E4DC] rounded-2xl p-8 lg:p-10 hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2",
                                        children: "Get in Touch"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 481,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl lg:text-3xl font-bold tracking-tight text-[#0D0D0D] mb-7",
                                        children: "Send Us a Message"
                                    }, void 0, false, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 484,
                                        columnNumber: 15
                                    }, this),
                                    rateLimitError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3.5 text-sm text-red-700",
                                        style: {
                                            animation: "scaleIn 0.3s ease both"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "mt-0.5 shrink-0",
                                                children: "⚠"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 493,
                                                columnNumber: 19
                                            }, this),
                                            rateLimitError
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 489,
                                        columnNumber: 17
                                    }, this),
                                    formSubmitted ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col items-center justify-center py-16 text-center",
                                        role: "alert",
                                        "aria-live": "polite",
                                        style: {
                                            animation: "scaleIn 0.5s ease both"
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4",
                                                style: {
                                                    animation: "scaleIn 0.5s 0.1s ease both"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                    size: 32,
                                                    className: "text-green-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/pages/ContactPage.tsx",
                                                    lineNumber: 509,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 505,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-bold text-[#0D0D0D] mb-2",
                                                children: "Thank You!"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 511,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-light text-gray-500",
                                                children: "We've received your message and will get back to you within 48 hours."
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 514,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 499,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                        onSubmit: handleSubmit,
                                        className: "space-y-5",
                                        "aria-label": "Contact form",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-5",
                                                style: {
                                                    animation: "fadeUp 0.5s 0.1s ease both"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "fullName",
                                                                className: labelCls,
                                                                children: [
                                                                    "Full Name ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-500",
                                                                        children: "*"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 532,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 531,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                id: "fullName",
                                                                name: "fullName",
                                                                value: formData.fullName,
                                                                onChange: handleChange,
                                                                maxLength: 100,
                                                                required: true,
                                                                "aria-required": "true",
                                                                placeholder: "Jane Smith",
                                                                className: inputCls
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 534,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 530,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "email",
                                                                className: labelCls,
                                                                children: [
                                                                    "Business Email ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-500",
                                                                        children: "*"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 549,
                                                                        columnNumber: 40
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 548,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "email",
                                                                id: "email",
                                                                name: "email",
                                                                value: formData.email,
                                                                onChange: handleChange,
                                                                maxLength: 100,
                                                                required: true,
                                                                "aria-required": "true",
                                                                placeholder: "jane@company.com",
                                                                className: inputCls
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 551,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 547,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 526,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-5",
                                                style: {
                                                    animation: "fadeUp 0.5s 0.18s ease both"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "companyName",
                                                                className: labelCls,
                                                                children: "Company Name"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 572,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "text",
                                                                id: "companyName",
                                                                name: "companyName",
                                                                value: formData.companyName,
                                                                onChange: handleChange,
                                                                maxLength: 100,
                                                                placeholder: "Your Company Ltd",
                                                                className: inputCls
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 575,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 571,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: labelCls,
                                                                children: "Phone Number"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 587,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                        name: "countryCode",
                                                                        value: formData.countryCode,
                                                                        onChange: handleChange,
                                                                        className: "bg-[#F5F3EE] border border-[#D8D3C9] rounded-lg px-2 py-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all duration-200",
                                                                        children: countryCodes.map((c, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                value: c.code,
                                                                                children: [
                                                                                    c.flag,
                                                                                    " ",
                                                                                    c.code
                                                                                ]
                                                                            }, i, true, {
                                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                                lineNumber: 596,
                                                                                columnNumber: 29
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 589,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "tel",
                                                                        name: "phone",
                                                                        value: formData.phone,
                                                                        onChange: handleChange,
                                                                        placeholder: "7749101623",
                                                                        className: `flex-1 bg-[#F5F3EE] border ${phoneError ? "border-red-400 ring-2 ring-red-400/10" : "border-[#D8D3C9]"} rounded-lg px-4 py-3 text-sm font-light focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all duration-200`
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 601,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 588,
                                                                columnNumber: 23
                                                            }, this),
                                                            phoneError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "mt-1.5 text-xs text-red-500",
                                                                style: {
                                                                    animation: "fadeUp 0.3s ease both"
                                                                },
                                                                children: phoneError
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 611,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 586,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 567,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-5",
                                                style: {
                                                    animation: "fadeUp 0.5s 0.26s ease both"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "serviceInterest",
                                                                className: labelCls,
                                                                children: [
                                                                    "Service Interest ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-red-500",
                                                                        children: "*"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 628,
                                                                        columnNumber: 42
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 627,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: "serviceInterest",
                                                                name: "serviceInterest",
                                                                value: formData.serviceInterest,
                                                                onChange: handleChange,
                                                                required: true,
                                                                "aria-required": "true",
                                                                className: inputCls,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: "Select a service"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 639,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "it-consulting-advisory",
                                                                        children: "IT Consulting & Advisory"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 640,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "software-development",
                                                                        children: "Business & Domestic Software Development"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 643,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "education-training",
                                                                        children: "Education & Training"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 646,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "social-care",
                                                                        children: "Social Care & Community Support"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 649,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "data-science-ai",
                                                                        children: "Data Science, AI & Predictive Analytics"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 652,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "multiple",
                                                                        children: "Multiple Services"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 655,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "not-sure",
                                                                        children: "Not Sure Yet"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 656,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 630,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 626,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "projectBudget",
                                                                className: labelCls,
                                                                children: "Project Budget"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 660,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: "projectBudget",
                                                                name: "projectBudget",
                                                                value: formData.projectBudget,
                                                                onChange: handleChange,
                                                                className: inputCls,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: "Select budget range"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 670,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "prefer-discuss",
                                                                        children: "Prefer to Discuss"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 671,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 663,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 659,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 622,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 gap-5",
                                                style: {
                                                    animation: "fadeUp 0.5s 0.34s ease both"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "projectTimeline",
                                                                className: labelCls,
                                                                children: "Project Timeline"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 684,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: "projectTimeline",
                                                                name: "projectTimeline",
                                                                value: formData.projectTimeline,
                                                                onChange: handleChange,
                                                                className: inputCls,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: "Select timeline"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 694,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "urgent",
                                                                        children: "Urgent (Within 1 month)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 695,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "short-term",
                                                                        children: "Short-term (1–3 months)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 696,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "medium-term",
                                                                        children: "Medium-term (3–6 months)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 699,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "long-term",
                                                                        children: "Long-term (6+ months)"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 702,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "flexible",
                                                                        children: "Flexible"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 703,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 687,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 683,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "howHeard",
                                                                className: labelCls,
                                                                children: "How did you hear about us?"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 707,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                id: "howHeard",
                                                                name: "howHeard",
                                                                value: formData.howHeard,
                                                                onChange: handleChange,
                                                                className: inputCls,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "",
                                                                        children: "Select an option"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 717,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "google",
                                                                        children: "Google Search"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 718,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "linkedin",
                                                                        children: "LinkedIn"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 719,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "referral",
                                                                        children: "Referral"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 720,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "social-media",
                                                                        children: "Social Media"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 721,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "event",
                                                                        children: "Event / Conference"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 722,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        value: "other",
                                                                        children: "Other"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 723,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 710,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 706,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 679,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    animation: "fadeUp 0.5s 0.42s ease both"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        htmlFor: "message",
                                                        className: labelCls,
                                                        children: [
                                                            "Message ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-red-500",
                                                                children: "*"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 731,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 730,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                        id: "message",
                                                        name: "message",
                                                        value: formData.message,
                                                        onChange: handleChange,
                                                        maxLength: 1000,
                                                        required: true,
                                                        "aria-required": "true",
                                                        rows: 5,
                                                        placeholder: "Tell us about your project, challenges, or questions...",
                                                        className: `${inputCls} resize-none`
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 733,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 729,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-light text-gray-400 leading-relaxed",
                                                style: {
                                                    animation: "fadeUp 0.5s 0.5s ease both"
                                                },
                                                children: "By submitting this form, you agree to our Privacy Policy. We respect your privacy and will never share your information with third parties."
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 748,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                style: {
                                                    animation: "fadeUp 0.5s 0.55s ease both"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "submit",
                                                    disabled: submitting,
                                                    className: "w-full inline-flex items-center justify-center gap-2.5 bg-[#0D0D0D] hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-white text-sm font-semibold px-6 py-4 rounded-xl transition-all duration-200",
                                                    "aria-label": "Submit contact form",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                            size: 16,
                                                            className: submitting ? "animate-pulse" : "",
                                                            "aria-hidden": "true"
                                                        }, void 0, false, {
                                                            fileName: "[project]/pages/ContactPage.tsx",
                                                            lineNumber: 765,
                                                            columnNumber: 23
                                                        }, this),
                                                        submitting ? "Sending…" : "Send Message"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/pages/ContactPage.tsx",
                                                    lineNumber: 759,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 758,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 520,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/pages/ContactPage.tsx",
                                lineNumber: 480,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/pages/ContactPage.tsx",
                            lineNumber: 479,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "lg:col-span-2 flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Reveal, {
                                    direction: "right",
                                    delay: 100,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white border border-[#E8E4DC] rounded-2xl p-7 hover:shadow-xl hover:shadow-black/5 transition-shadow duration-300",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-semibold tracking-widest uppercase text-blue-600 mb-2",
                                                children: "Reach Us Directly"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 783,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-bold text-[#0D0D0D] mb-6",
                                                children: "Contact Information"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 786,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-5",
                                                children: [
                                                    {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"],
                                                        label: "Phone",
                                                        primary: "+44 7749 101623",
                                                        secondary: "Mon–Fri, 9AM–5PM GMT"
                                                    },
                                                    {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"],
                                                        label: "Email",
                                                        primary: "info@accian.co.uk",
                                                        secondary: "Response within 24 business hours"
                                                    },
                                                    {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
                                                        label: "Business Hours",
                                                        primary: "Mon–Fri: 9:00 AM – 5:00 PM GMT",
                                                        secondary: "Emergency support 24/7 for existing clients",
                                                        extra: [
                                                            "Saturday: By Appointment",
                                                            "Sunday: Closed"
                                                        ]
                                                    },
                                                    {
                                                        icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
                                                        label: "Location",
                                                        primary: "🇬🇧 United Kingdom",
                                                        secondary: "Serving clients worldwide"
                                                    }
                                                ].map(({ icon: Icon, label, primary, secondary, extra }, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-start gap-3.5 group",
                                                        style: {
                                                            animation: `fadeUp 0.5s ${0.1 + i * 0.08}s ease both`
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                    size: 18,
                                                                    className: "text-blue-600 group-hover:text-white transition-colors duration-300"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/pages/ContactPage.tsx",
                                                                    lineNumber: 827,
                                                                    columnNumber: 27
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 826,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs font-semibold tracking-wide uppercase text-[#0D0D0D] mb-0.5",
                                                                        children: label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 833,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-light text-gray-600",
                                                                        children: primary
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 836,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    extra?.map((e)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-sm font-light text-gray-500",
                                                                            children: e
                                                                        }, e, false, {
                                                                            fileName: "[project]/pages/ContactPage.tsx",
                                                                            lineNumber: 840,
                                                                            columnNumber: 29
                                                                        }, this)),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs font-light text-gray-400 mt-0.5",
                                                                        children: secondary
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                                        lineNumber: 847,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 832,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, label, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 819,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 790,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 782,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/pages/ContactPage.tsx",
                                    lineNumber: 781,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Reveal, {
                                    direction: "right",
                                    delay: 200,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative overflow-hidden bg-[#0D0D0D] rounded-2xl p-7 hover:shadow-2xl hover:shadow-black/30 transition-shadow duration-300 group",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute -top-8 -right-8 w-32 h-32 rounded-full bg-blue-600/15 pointer-events-none group-hover:bg-blue-600/25 transition-colors duration-300"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 861,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-blue-600/8 pointer-events-none"
                                            }, void 0, false, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 862,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-semibold tracking-widest uppercase text-blue-400 mb-2",
                                                        children: "Free Consultation"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 864,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                        className: "text-lg font-bold text-white mb-3 leading-snug",
                                                        children: "Ready to Get Started?"
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 867,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-light text-white/50 leading-relaxed",
                                                        children: "Schedule a free consultation call to discuss your project requirements and explore how we can help — just fill in the form."
                                                    }, void 0, false, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 870,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "mt-5 flex items-center gap-2 text-xs font-semibold text-blue-400",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"
                                                            }, void 0, false, {
                                                                fileName: "[project]/pages/ContactPage.tsx",
                                                                lineNumber: 876,
                                                                columnNumber: 21
                                                            }, this),
                                                            "Typically responds within 24 hours"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/pages/ContactPage.tsx",
                                                        lineNumber: 875,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/pages/ContactPage.tsx",
                                                lineNumber: 863,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/pages/ContactPage.tsx",
                                        lineNumber: 860,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/pages/ContactPage.tsx",
                                    lineNumber: 859,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/pages/ContactPage.tsx",
                            lineNumber: 779,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/pages/ContactPage.tsx",
                    lineNumber: 477,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/pages/ContactPage.tsx",
                lineNumber: 476,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/pages/ContactPage.tsx",
        lineNumber: 431,
        columnNumber: 5
    }, this);
}
_s2(ContactPage, "NhlJ5pD4vJ65xv8mtyPSypGY3Lk=");
_c1 = ContactPage;
var _c, _c1;
__turbopack_context__.k.register(_c, "Reveal");
__turbopack_context__.k.register(_c1, "ContactPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0bq822t._.js.map