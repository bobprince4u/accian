import { useEffect, useState } from "react";
import axios from "axios";
//import { LazyImage } from "../components/LazyImage";
import ServiceCard from "../components/ServiceCard";

import { trustIndicators, stats } from "../data/HomPageData";
import { Globe, Clock, Star } from "lucide-react";
import { API_URL } from "../config/api";

interface Service {
  id?: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  features?: string[];
  link?: string;
}

interface Testimonial {
  id?: string;
  quote: string;
  author: string;
  position: string;
  rating?: number;
}

interface TestimonialResponse {
  testimonialText: string;
  clientName: string;
  clientPosition?: string;
  rating?: number;
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  const [testimonialsError, setTestimonialsError] = useState<string | null>(
    null
  );

  //fetch services data from API
  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/services`);
      const data = res.data.data || res.data;
      setServices(Array.isArray(data) ? data : []); // Adjust based on API response structure
    } catch {
      setError("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  //fetch testimonials data from API
  const fetchTestimonials = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/testimonials`);
      const data = res.data.data || res.data;

      // Map backend keys to frontend keys
      const mappedTestimonials = Array.isArray(data)
        ? data.map((t: TestimonialResponse) => ({
            quote: t.testimonialText,
            author: t.clientName,
            position: t.clientPosition || "",
            rating: t.rating || 5, // optional default
          }))
        : [];

      setTestimonials(mappedTestimonials);
    } catch {
      setTestimonialsError("Failed to fetch testimonials");
    } finally {
      setTestimonialsLoading(false);
    }
  };

  // useEffect that calls it
  useEffect(() => {
    fetchServices();
    fetchTestimonials();
  }, []);

  if (loading) {
    return <p className="text-center">Loading services...</p>;
  }
  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative text-white overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Motion background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />

        {/* Content */}
        <div className="relative container-custom section-spacing">
          <div className="max-w-4xl">
            <h1 id="hero-heading" className="mb-6 text-white">
              Global IT, Cybersecurity & Digital Innovation for Modern
              Businesses
            </h1>

            <p className="text-xl mb-8 text-white/90 leading-relaxed">
              ACCIAN is a UK-registered technology and cybersecurity company
              delivering secure, scalable, and intelligent digital solutions
              that help businesses grow, automate, and stay protected.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4"
              role="group"
              aria-label="Call to action buttons"
            >
              <a
                href="#contact"
                className="btn-primary inline-block text-center"
                aria-label="Request a consultation"
              >
                Request a Consultation
              </a>

              <a
                href="/services"
                className="btn-secondary inline-block text-center"
                aria-label="Explore our services"
              >
                Explore Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Snapshot */}
      <section
        className="section-spacing bg-white"
        aria-labelledby="global-presence-heading"
      >
        <div className="container-custom">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 id="global-presence-heading" className="mb-4">
                Our Global Presence
              </h2>
              <p className="text-lg text-[#64748B] leading-relaxed max-w-3xl mx-auto">
                ACCIAN operates as a UK-registered company, delivering
                high-quality digital solutions that meet international
                standards, while remaining agile, innovative, and focused on
                creating measurable value for clients.
              </p>
            </div>

            <div
            //className="grid grid-cols-1 lg:grid-cols-2 gap-12"
            //role="list"
            //aria-label="Global office locations"
            >
              {/* UK Entity */}
              <article
                className="flex flex-col items-center text-center m-auto"
                role="listitem"
              >
                {/* Globe */}
                <div className="mb-4" aria-hidden="true">
                  <div className="w-16 h-16 rounded-full bg-[#1E40AF]/10 flex items-center justify-center mx-auto">
                    <Globe className="text-[#1E40AF]" size={32} />
                  </div>
                </div>

                {/* Content */}
                <div>
                  <div className="mb-4">
                    <h3 className="text-2xl mb-1">ACCIAN</h3>
                    <p className="text-[#64748B]">United (UK)</p>
                  </div>

                  <ul
                    className="space-y-3 text-[#64748B] flex flex-col items-center"
                    aria-label="UK operations highlights"
                  >
                    <li className="flex items-start gap-2">
                      <span className="text-[#14B8A6]" aria-hidden="true">
                        •
                      </span>
                      <span>International operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14B8A6]" aria-hidden="true">
                        •
                      </span>
                      <span>Enterprise delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14B8A6]" aria-hidden="true">
                        •
                      </span>
                      <span>EU & Americas client services</span>
                    </li>
                  </ul>
                </div>
              </article>

              {/* Nigeria Entity 
              <article className="flex gap-6" role="listitem">
                <div className="shrink-0" aria-hidden="true">
                  <div className="w-16 h-16 rounded-full bg-[#14B8A6]/10 flex items-center justify-center">
                    <Network className="text-[#14B8A6]" size={32} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <h3 className="text-2xl mb-1">ACCIAN</h3>
                    <p className="text-[#64748B]">Nigeria Limited</p>
                  </div>
                  <ul
                    className="space-y-3 text-[#64748B]"
                    aria-label="Nigeria operations highlights"
                  >
                    <li className="flex items-start gap-2">
                      <span className="text-[#14B8A6] mt-1" aria-hidden="true">
                        •
                      </span>
                      <span>Regional operations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14B8A6] mt-1" aria-hidden="true">
                        •
                      </span>
                      <span>EZ & African client services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#14B8A6] mt-1" aria-hidden="true">
                        •
                      </span>
                      <span>Outsource & services delivery</span>
                    </li>
                  </ul>
                </div>
              </article> */}
            </div>

            <div className="text-center mt-12 pt-12 border-t border-gray-200">
              <p className="text-lg text-[#1E293B]">
                We combine technical excellence with strategic thinking to
                provide comprehensive digital solutions that drive measurable
                business outcomes. Our approach is mission-driven,
                results-focused, and security-conscious.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services */}
      <section className="section-spacing bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Our Core Services</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Comprehensive IT solutions designed to drive growth, enhance
              security, and optimize operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 3).map((service, index) => (
              <ServiceCard
                key={index}
                {...service}
                features={service.features || []}
                link={service.link || "#"}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-4xl mx-auto">
            {services.slice(3).map((service, index) => (
              <ServiceCard
                key={index}
                {...service}
                features={service.features || []}
                link={service.link || "#"}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose ACCIAN */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Why Partner With ACCIAN?</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Your trusted technology partner for digital transformation and
              innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center">
                    <indicator.icon className="text-[#1E40AF]" size={24} />
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-[#0A2540]">{indicator.title}</h4>
                  <p className="text-[#64748B]">{indicator.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="section-spacing bg-linear-to-br from-[#0A2540] to-[#1E40AF] text-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-white">Our Impact in Numbers</h2>
            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              Measurable results that demonstrate our commitment to excellence
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold mb-2 text-[#14B8A6]">
                  {stat.number}
                </div>
                <div className="font-semibold mb-1 text-white">
                  {stat.label}
                </div>
                <p className="text-sm text-white/70">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">What Our Clients Say</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied clients
            </p>
          </div>

          {testimonialsLoading ? (
            <p className="text-center">Loading testimonials...</p>
          ) : testimonialsError ? (
            <p className="text-center text-red-500">{testimonialsError}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="card">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={18}
                        className="fill-[#F59E0B] text-[#F59E0B]"
                      />
                    ))}
                  </div>
                  <p className="text-[#64748B] mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-[#1E293B]">
                      {testimonial.author}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section id="contact" className="section-spacing bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6">Ready to Elevate Your Business Digitally?</h2>
            <p className="text-lg text-[#64748B] mb-8 leading-relaxed">
              Let's collaborate to build secure, scalable, and intelligent
              systems that drive your business forward. Our expert team is ready
              to transform your digital vision into reality.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a href="/contact" className="btn-primary inline-block">
                Schedule a Consultation
              </a>
              <a href="/services" className="btn-secondary inline-block">
                View Our Services
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-full bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                  <Clock className="text-[#1E40AF]" size={20} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1E293B]">
                    Business Hours
                  </p>
                  <p className="text-sm text-[#64748B]">Mon-Fri, 9AM-5PM WAT</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-full bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                  <svg
                    className="text-[#1E40AF]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1E293B]">Phone</p>
                  <p className="text-sm text-[#64748B]">+44 7749 101623</p>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-10 h-10 rounded-full bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                  <svg
                    className="text-[#1E40AF]"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#1E293B]">Email</p>
                  <p className="text-sm text-[#64748B]"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
