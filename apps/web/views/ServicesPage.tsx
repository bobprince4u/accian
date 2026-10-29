import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { detailedServices, processSteps } from "@/data/ServicesMock";

// Keep existing anchors and enquiry values; prioritise the three core technology services.
const services = [...detailedServices].sort((a, b) => {
  const order = ["it-consulting", "software-development", "data-science-ai", "education-training", "social-care"];
  return order.indexOf(a.id) - order.indexOf(b.id);
});
export default function ServicesPage() {
  return <div className="content-page services-editorial">
    <section className="section-spacing bg-[#0D0D0D] text-white">
      <div className="container-custom">
        <p className="eyebrow text-blue-300">For businesses &amp; organisations</p>
        <h1 className="mt-5">Technology advice.<br />
          <em>Practical delivery.</em>
        </h1>
        <p className="mt-6 max-w-xl text-base text-white/75">IT consulting, bespoke software development and data solutions. Explore the services below, then tell us what you need to achieve.</p>
        <nav aria-label="Services on this page" className="mt-8 flex flex-wrap gap-x-6 gap-y-2">{services.map(s =>
          <a href={`#${s.id}`} key={s.id} className="inline-flex min-h-11 items-center border-b border-white/40 text-sm hover:text-blue-200">{s.id === 'software-development' ? 'Software development' : s.id === 'data-science-ai' ? 'Data solutions' : s.title}</a>)}</nav>
      </div>
    </section>
    {services.map((service, index) =>
      <section key={service.id} id={service.id} className={`section-spacing ${index % 2 === 0 ? 'bg-white' : 'bg-[#F5F3EE]'}`}>
        <div className="container-custom grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div>
            <p className="eyebrow">{String(index + 1).padStart(2, '0')} / {index < 3 ? 'Business technology' : 'Further services'}</p>
            <h2 className="mt-5 text-3xl lg:text-4xl">{service.title}</h2>
            <p className="mt-5 text-base text-[#555555]">{service.overview}</p>
            <Link href={`/contact?service=${service.id === 'it-consulting' ? 'it-consulting-advisory' : service.id}`} className="text-link mt-6">Discuss this service <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div>
            <h3 className="mb-5 text-xs uppercase tracking-widest">How we can help</h3>{service.deliverables.map(item =>
              <div key={item.name} className="border-t border-[#D8D3C9] py-5">
                <h4 className="text-base font-semibold">{item.name}</h4>
                <p className="mt-2 text-sm text-[#555555]">{item.description}</p>
              </div>)}</div>
        </div>
      </section>)}
    <section className="section-spacing bg-[#EDE9E0]">
      <div className="container-custom">
        <p className="eyebrow">Working together</p>
        <h2 className="mt-5 text-3xl lg:text-4xl">Start with the problem.<br />
          <em>Agree the way forward.</em>
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4">{processSteps.map(s =>
          <li key={s.number} className="border-t border-[#BFB9AD] pt-5">
            <span className="eyebrow">{s.number}</span>
            <h3 className="mt-3 text-lg">{s.title}</h3>
            <p className="mt-3 text-sm text-[#555555]">{s.description}</p>
          </li>)}</ol>
        <p className="mt-10 text-sm text-[#555555]">Scope, timing and fees are discussed around your requirements before work is agreed.</p>
        <Link href="/contact" className="btn-primary mt-5">Tell us what you need <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
    <section className="container-custom py-10">
      <p className="text-sm text-[#555555]">Preparing for an MRes, MPhil or PhD? <Link href="/research-support" className="text-link">Explore research support →</Link>
      </p>
    </section>
  </div>;
}
