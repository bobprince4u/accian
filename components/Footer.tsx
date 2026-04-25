import Link from "next/link";
import {
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Mail,
  Phone,
  Clock,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const linkCls =
    "text-white/50 hover:text-white transition-colors duration-200 text-sm font-light";
  const iconCls =
    "w-8 h-8 rounded-full bg-white/8 border border-white/10 hover:bg-blue-600 hover:border-blue-600 flex items-center justify-center transition-all duration-200";

  return (
    <footer
      className="bg-[#080808] border-t border-white/8 text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Column 1 — Company */}
          <div className="lg:col-span-2">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-500 mb-3">
              UK Technology &amp; Cybersecurity
            </p>
            <h3 className="text-2xl font-extrabold text-white tracking-tight mb-3">
              ACCIAN
            </h3>
            <p className="text-sm font-light text-white/50 leading-relaxed mb-6 max-w-xs">
              A UK-registered technology company delivering secure, innovative,
              and scalable digital systems that empower businesses worldwide.
            </p>

            <div
              className="space-y-3 mb-6"
              aria-label="Global office locations"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center shrink-0">
                  <span
                    className="text-base"
                    role="img"
                    aria-label="United Kingdom flag"
                  >
                    🇬🇧
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    ACCIAN Limited
                  </p>
                  <p className="text-xs font-light text-white/40">
                    United Kingdom
                  </p>
                </div>
              </div>
            </div>

            {/* Social */}
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-3">
                Follow Us
              </p>
              <div
                className="flex gap-2"
                role="list"
                aria-label="Social media links"
              >
                {[
                  { href: "#", icon: Linkedin, label: "LinkedIn" },
                  { href: "#", icon: Twitter, label: "Twitter" },
                  { href: "#", icon: Facebook, label: "Facebook" },
                  {
                    href: "https://www.instagram.com/accianltd/",
                    icon: Instagram,
                    label: "Instagram",
                  },
                ].map(({ href, icon: Icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    className={iconCls}
                    aria-label={`Follow us on ${label}`}
                    role="listitem"
                  >
                    <Icon size={15} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <nav aria-label="Footer quick links">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">
              Quick Links
            </p>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Home" },
                { href: "/services", label: "Services" },
                { href: "/contact", label: "Contact" },
                { href: "/privacy-policy", label: "Privacy Policy" },
                { href: "#", label: "Terms of Service" },
              ].map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className={linkCls} aria-label={label}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 3 — Services */}
          <nav aria-label="Footer services links">
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">
              Our Services
            </p>
            <ul className="space-y-2.5">
              {[
                {
                  href: "/services#it-consulting",
                  label: "IT Consulting & Advisory",
                },
                {
                  href: "/services#software-development",
                  label: "Software Development",
                },
                {
                  href: "/services#education-training",
                  label: "Education & Training",
                },
                {
                  href: "/services#social-care",
                  label: "Social Care & Support",
                },
                {
                  href: "/services#data-science-ai",
                  label: "Data Science & AI",
                },
              ].map(({ href, label }) => (
                <li key={label}>
                  <a href={href} className={linkCls}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Column 4 — Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/30 mb-4">
              Contact Us
            </p>
            <ul className="space-y-4" aria-label="Contact information">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone
                    size={14}
                    className="text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <a
                  href="tel:+447749101623"
                  className={linkCls}
                  aria-label="Call us"
                >
                  +44 7749 101623
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail
                    size={14}
                    className="text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <a
                  href="mailto:info@accian.co.uk"
                  className={linkCls}
                  aria-label="Email us"
                >
                  info@accian.co.uk
                </a>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock
                    size={14}
                    className="text-blue-400"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-sm font-light text-white/50 leading-relaxed">
                  Monday – Friday
                  <br />
                  9:00 AM – 5:00 PM GMT
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="container-custom py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-light text-white/25">
            <p>
              <Link
                href="/internal/quote-builder"
                className="cursor-default hover:text-white/40 transition-colors duration-300"
                tabIndex={-1}
                aria-hidden="true"
              >
                ©
              </Link>{" "}
              {currentYear} ACCIAN. All Rights Reserved.
            </p>
            <p>Global Technology &amp; Cybersecurity Company · UK Operations</p>
            <p className="text-center md:text-right">
              ACCIAN Limited · Company No. 16910869 · Registered in England
              &amp; Wales
              <br />
              Registered Office: 4 Lidgett Ln, Garforth, Leeds LS25 1EQ
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
