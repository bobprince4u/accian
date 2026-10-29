"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ServiceSummary, Testimonial as ApiTestimonial } from "@accian/types";
import ProjectHighlights from "@/components/ProjectHighlights";
import { API_URL } from "@/config/api";

interface Service { id?: string; slug: string; title: string; description: string; icon?: string; features?: string[]; }
interface Testimonial { quote: string; author: string; position: string; rating?: number; }
const anchors: Record<string, string> = { "it-consulting-advisory": "it-consulting", "it-consulting": "it-consulting", "software-development": "software-development", "education-training": "education-training", "social-care": "social-care", "social-care-community-support": "social-care", "data-science-ai": "data-science-ai" };
const businessLinks = [
  { number: "01", title: "IT consulting & technical advice", text: "Make informed decisions about your systems, infrastructure and technology priorities.", href: "it-consulting" },
  { number: "02", title: "Bespoke software development", text: "Web applications, business systems and integrations built around your needs.", href: "software-development" },
  { number: "03", title: "Data solutions", text: "Data science, modelling and analytics to support business decisions.", href: "data-science-ai" },
];
export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(
    null,
  );

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      const data = res.data.data || res.data;
      if (!Array.isArray(data)) throw new Error("Unexpected services response");
      setServices(
        Array.isArray(data)
          ? data.map((s: ServiceSummary) => ({
            id: String(s.id),
            slug: s.slug,
            title: s.title,
            description: s.shortDescription ?? "",
            icon: s.icon ?? undefined,
            features: s.features,
          }))
          : [],
      );
    } catch {
      setError("We couldn’t load our services. Please try again, or explore the services overview.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    setTestimonialsLoading(true);
    setTestimonialsError(null);
    try {
      const res = await axios.get(`${API_URL}/api/testimonials`);
      const data = res.data.data || res.data;
      if (!Array.isArray(data)) throw new Error("Unexpected testimonials response");
      setTestimonials(
        Array.isArray(data)
          ? data.map((t: ApiTestimonial) => ({
            quote: t.message,
            author: t.name,
            position: t.position || "",
            rating: t.rating ?? undefined,
          }))
          : [],
      );
    } catch {
      setTestimonialsError("We couldn’t load client feedback. Please try again.");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchTestimonials();
  }, []);

  return (
    <div className="editorial-home">
      <section className="home-hero container-custom" aria-labelledby="home-title">
        <div className="hero-topline">
          <p className="eyebrow">Independent thinking. Practical expertise.</p>
          <span>UK based / International outlook</span>
        </div>
        <div className="hero-composition">
          <div className="hero-copy">
            <h1 id="home-title">Technology consulting <span className="hero-amp">&amp;</span>
              <br />
              <em>research support.</em>
            </h1>
            <p className="hero-intro">Practical IT advice, software development and data solutions for businesses. Research guidance for applicants preparing for an MRes, MPhil or PhD.</p>
            <a href="#pathways" className="text-link">Find the right support <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>
          <aside className="hero-index" aria-label="Our two areas of expertise">
            <p className="index-label">Two areas of expertise.<br />One considered approach.</p>
            <Link href="/services">
              <span className="index-number">01 / Business</span>
              <strong>Technology that works<br />for your organisation.</strong>
              <ArrowUpRight aria-hidden="true" size={23} />
            </Link>
            <Link href="/research-support">
              <span className="index-number">02 / Research</span>
              <strong>A clearer direction for<br />your research application.</strong>
              <ArrowUpRight aria-hidden="true" size={23} />
            </Link>
            <p className="index-foot">ACCIAN Limited · United Kingdom</p>
          </aside>
        </div>
        <div className="hero-caption">
          <span>Advice with a clear purpose.</span>
          <span>For organisations. For enquiring minds.</span>
        </div>
      </section>

      <section id="pathways" className="business-section section-spacing">
        <div className="container-custom pathway-layout">
          <div className="section-intro">
            <p className="eyebrow">01 / For businesses</p>
            <h2>Good technology{" "}<br />starts with the{" "}<br />
              <em>right questions.</em>
            </h2>
            <p>Whether you need technical advice, a bespoke application or a better way to use your data, start with the challenge you want to solve.</p>
            <Link href="/contact" className="btn-primary">Discuss your technology needs <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
          <div className="business-list">{businessLinks.map(item => <Link key={item.number} href={`/services#${item.href}`} className="business-row">
            <span className="row-number">{item.number}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
            <ArrowUpRight size={23} aria-hidden="true" />
          </Link>)}<Link href="/services" className="text-link">Explore all services <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="research-feature section-spacing">
        <div className="container-custom research-layout">
          <div className="research-heading">
            <p className="eyebrow">02 / For prospective researchers</p>
            <h2>Your research begins<br />with <em>a question.</em>
            </h2>
            <p>Preparing for an MRes, MPhil or PhD? Get guidance on your topic, supervisor search, proposal and application, with support suited to your starting point.</p>
            <Link href="/research-support" className="text-link">Explore research support <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="research-notes">
            <p className="index-label">From an initial interest to an informed application</p>
            <ol>{["Identify and refine your research topic", "Find potential supervisors", "Develop your own research proposal", "Prepare your application"].map((text, i) =>
              <li key={text}>
                <span>0{i + 1}</span>{text}</li>)}</ol>
            <p className="research-boundary">Guidance for your own work. Admissions decisions and degree awards remain with universities.</p>
            <Link href="/pre-consultation" className="btn-secondary">Start your pre-consultation <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="about-editorial section-spacing">
        <div className="container-custom about-layout">
          <div>
            <p className="eyebrow">About ACCIAN</p>
            <h2>Based in the UK.<br />
              <em>Working internationally.</em>
            </h2>
          </div>
          <div>
            <p className="about-lead">ACCIAN is an independent consulting and technology business supporting organisations and prospective postgraduate researchers.</p>
            <p>Our technology services focus on practical business needs. Our research support helps applicants think through their ideas and prepare for the next stage of their academic journey.</p>
            <dl className="company-facts">
              <div>
                <dt>Registered company</dt>
                <dd>ACCIAN Limited</dd>
              </div>
              <div>
                <dt>Company number</dt>
                <dd>16910869</dd>
              </div>
              <div>
                <dt>Registered office</dt>
                <dd>4 Lidgett Ln, Garforth, Leeds LS25 1EQ</dd>
              </div>
            </dl>
            <p className="affiliation-note">Independent of Accion and similarly named organisations.</p>
          </div>
        </div>
      </section>

      <section className="service-directory section-spacing">
        <div className="container-custom">
          <div className="directory-heading">
            <div>
              <p className="eyebrow">Service directory</p>
              <h2>Explore our expertise.</h2>
            </div>
            <p>Our current services, published by the ACCIAN team.</p>
          </div>
          {loading ? <p role="status">Loading services…</p> : error ? <div role="status">
            <p>{error}</p>
            <button onClick={fetchServices} className="btn-secondary mt-4">Retry services</button>
          </div> : services.length === 0 ? <p>No services are currently published. <Link href="/services" className="text-link">Read our services overview →</Link>
          </p> : <div className="directory-list">{services.map(service =>
            <article key={service.id || service.slug}>
              <h3>
                <Link href={anchors[service.slug] ? `/services#${anchors[service.slug]}` : "/services"}>{service.title}<ArrowUpRight size={20} aria-hidden="true" />
                </Link>
              </h3>
              <p>{service.description}</p>
            </article>)}</div>}
        </div>
      </section>
      <ProjectHighlights />
      <section className="feedback-section section-spacing">
        <div className="container-custom">
          <p className="eyebrow">Client perspectives</p>{testimonialsLoading ? <p role="status" className="mt-5">Loading client feedback…</p> : testimonialsError ? <div role="status" className="mt-5">
            <p>{testimonialsError}</p>
            <button onClick={fetchTestimonials} className="btn-secondary mt-4">Retry feedback</button>
          </div> : testimonials.length > 0 ? <div className="feedback-list">{testimonials.slice(0, 3).map((t, i) =>
            <figure key={i}>
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>{t.author}{t.position && <span> / {t.position}</span>}</figcaption>
            </figure>)}</div> : <p className="mt-5">Client feedback will appear here when published.</p>}</div>
      </section>
      <section className="closing-section section-spacing">
        <div className="container-custom">
          <p className="eyebrow">Let’s start with your question</p>
          <div className="closing-layout">
            <h2>What are you<br />
              <em>working towards?</em>
            </h2>
            <div>
              <Link href="/contact" className="closing-link">I need technology support <ArrowUpRight aria-hidden="true" />
              </Link>
              <Link href="/pre-consultation" className="closing-link">I’m preparing for research <ArrowUpRight aria-hidden="true" />
              </Link>
              <a href="mailto:info@accian.co.uk" className="closing-email">Or email info@accian.co.uk</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
