import { Link } from "react-router-dom";
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

  return (
    <footer
      className="bg-[#0A2540] text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Column 1: Company Information */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 text-white">ACCIAN</h3>
            <p className="text-sm text-white/80 mb-4">
              Global Technology & Cybersecurity Solutions
            </p>
            <p className="text-sm text-white/70 leading-relaxed mb-6">
              A multinational technology company with operations in the United
              Kingdom, delivering secure, innovative, and scalable digital
              systems that empower businesses worldwide.
            </p>

            {/* Global Entities */}
            <div
              className="space-y-3 mb-6"
              aria-label="Global office locations"
            >
              <div className="flex items-start gap-2">
                <span
                  className="text-xl"
                  role="img"
                  aria-label="United Kingdom flag"
                >
                  🇬🇧
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    ACCIAN Limited
                  </p>
                  <p className="text-xs text-white/60">United Kingdom</p>
                </div>
              </div>
              {/* <div className="flex items-start gap-2">
                <span className="text-xl" role="img" aria-label="Nigeria flag">
                  🇳🇬
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    ACCIAN Nigeria Limited
                  </p>
                  <p className="text-xs text-white/60">Nigeria</p>
                </div>*
              </div>*/}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <nav aria-label="Footer quick links">
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Go to home page"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="View our services"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/portfolio"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="View our portfolio"
                >
                  Portfolio
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Contact us"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="View privacy policy"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="View terms of service"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 3: Services */}
          <nav aria-label="Footer services links">
            <h4 className="font-semibold mb-4 text-white">Our Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/services#cybersecurity-forensics"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Learn about Cybersecurity and Forensics services"
                >
                  IT Consulting & Advisory
                </a>
              </li>
              <li>
                <a
                  href="/services#ict-digital-solutions"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Learn about ICT and Digital Solutions"
                >
                  Business & Domestic Software Development
                </a>
              </li>
              <li>
                <a
                  href="/services#software-development"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Learn about Software Development"
                >
                  Education & Training
                </a>
              </li>
              <li>
                <a
                  href="/services#ai-automation"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Learn about AI Automation and Chatbots"
                >
                  Social Care & Community Support
                </a>
              </li>
              <li>
                <a
                  href="/services#software-testing"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Learn about Software Testing and QA"
                >
                  Data Science, AI & Predictive Analytics
                </a>
              </li>
            </ul>
          </nav>

          {/* Column 4: Contact Information */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3 text-sm" aria-label="Contact information">
              <li className="flex items-start gap-2">
                <Phone
                  size={16}
                  className="mt-0.5 shrink-0 text-[#14B8A6]"
                  aria-hidden="true"
                />
                <a
                  href="tel:+2348100662390"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Call us at +234 810 066 2390"
                >
                  +44 7749 101623
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail
                  size={16}
                  className="mt-0.5 shrink-0 text-[#14B8A6]"
                  aria-hidden="true"
                />

                <a
                  href="mailto:info@accian.co.uk"
                  className="text-white/70 hover:text-[#14B8A6] transition-colors"
                  aria-label="Email us at info@accian.co.uk"
                >
                  info@accian.co.uk
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock
                  size={16}
                  className="mt-0.5 shrink-0 text-[#14B8A6]"
                  aria-hidden="true"
                />
                <span className="text-white/70">
                  Monday - Friday
                  <br />
                  9:00 AM - 17:00 PM GMT
                </span>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="font-semibold mb-3 text-sm text-white">
                Follow Us
              </h5>
              <div
                className="flex gap-3"
                role="list"
                aria-label="Social media links"
              >
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14B8A6] flex items-center justify-center transition-colors"
                  aria-label="Follow us on LinkedIn"
                  role="listitem"
                >
                  <Linkedin size={16} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14B8A6] flex items-center justify-center transition-colors"
                  aria-label="Follow us on Twitter"
                  role="listitem"
                >
                  <Twitter size={16} aria-hidden="true" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14B8A6] flex items-center justify-center transition-colors"
                  aria-label="Follow us on Facebook"
                  role="listitem"
                >
                  <Facebook size={16} aria-hidden="true" />
                </a>
                <a
                  href="https://www.instagram.com/accianltd/"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#14B8A6] flex items-center justify-center transition-colors"
                  aria-label="Follow us on Instagram"
                  role="listitem"
                >
                  <Instagram size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>© {currentYear} ACCIAN. All Rights Reserved.</p>
            <p>Global Technology & Cybersecurity Company | UK Operations</p>
            <p>
              ACCIAN Limited · Company No. 16910869 · Registered in England &
              Wales
              <br />
              Registered Office: 4 Lidgett Ln, Garforth, Leeds LS25 1EQ
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
