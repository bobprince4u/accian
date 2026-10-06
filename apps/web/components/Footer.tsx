import Link from "next/link";
import { Instagram, Mail, Phone } from "lucide-react";
import { detailedServices } from "@/data/ServicesMock";

const linkClass = "inline-flex min-h-11 items-center text-sm text-white/75 hover:text-white underline-offset-4 hover:underline";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080808] text-white">
      <div className="container-custom py-12 sm:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow mb-3 text-blue-400">ACCIAN Limited</p>
            <p className="max-w-sm text-sm text-white/75">UK technology consulting, software development and research support.</p>
            <p className="mt-4 text-sm text-white/75">Company No. 16910869<br />Registered in England &amp; Wales</p>
            <a href="https://www.instagram.com/accianltd/" className={`${linkClass} mt-3 gap-2`}>
              <Instagram size={18} aria-hidden="true" /> Instagram
            </a>
          </div>
          <nav aria-label="Footer company and research">
            <h2 className="mb-3 text-sm font-semibold">Company &amp; research</h2>
            <ul>
              {[["/", "Home"], ["/#about", "About ACCIAN"], ["/#projects", "Projects"], ["/research-support", "Research Support"], ["/pre-consultation", "Start pre-consultation"]].map(([href, label]) => (
                <li key={href}><Link href={href} className={linkClass}>{label}</Link></li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Footer services">
            <h2 className="mb-3 text-sm font-semibold">Services</h2>
            <ul>
              {detailedServices.map((service) => (
                <li key={service.id}><Link href={`/services#${service.id}`} className={linkClass}>{service.title}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="mb-3 text-sm font-semibold">Contact &amp; legal</h2>
            <a href="mailto:info@accian.co.uk" className={`${linkClass} gap-2 break-all`}><Mail size={16} className="shrink-0" aria-hidden="true" />info@accian.co.uk</a>
            <a href="tel:+447749101623" className={`${linkClass} gap-2`}><Phone size={16} aria-hidden="true" />+44 7749 101623</a>
            <p className="mt-2 text-sm text-white/75">Monday–Friday<br />9:00 AM–5:00 PM GMT</p>
            <ul className="mt-3">
              <li><Link href="/contact" className={linkClass}>Contact ACCIAN</Link></li>
              <li><Link href="/privacy-policy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/internal/quote-builder" className={linkClass}>Staff quote builder</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/70 lg:flex-row">
          <p>© {new Date().getFullYear()} ACCIAN Limited. All rights reserved.</p>
          <address className="not-italic">Registered office: 4 Lidgett Ln, Garforth, Leeds LS25 1EQ</address>
        </div>
      </div>
    </footer>
  );
}
