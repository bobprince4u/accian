import React from "react";
import { LazyImage } from "../components/LazyImage";
import { CheckCircle2, ArrowRight } from "lucide-react";
import {
  detailedServices,
  industries,
  comparisonData,
  processSteps,
  faqs,
} from "../data/ServicesMock";

export default function ServicesPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative gradient-hero text-white">
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-white">
              Comprehensive IT Solutions for Modern Businesses
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              From cybersecurity and forensics to data science and business
              intelligence, we deliver end-to-end technology solutions across
              the UK, Nigeria, and worldwide that drive growth, enhance
              security, and optimize operations.
            </p>
          </div>
        </div>
      </section>

      {/* Detailed Service Descriptions */}
      {detailedServices.map((service, index) => (
        <section
          key={service.id}
          id={service.id}
          className={`section-spacing ${
            index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"
          }`}
        >
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div
                className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}
              >
                <div className="w-16 h-16 rounded-xl bg-linear-to-br from-[#1E40AF] to-[#14B8A6] flex items-center justify-center mb-6">
                  {React.createElement(service.icon, {
                    className: "text-white",
                    size: 32,
                  })}
                </div>
                <h2 className="mb-6">{service.title}</h2>
                <p className="text-lg text-[#64748B] mb-8 leading-relaxed">
                  {service.overview}
                </p>

                {/* Deliverables */}
                <div className="mb-8">
                  <h4 className="mb-4 text-[#0A2540]">What We Deliver</h4>
                  <div className="space-y-4">
                    {service.deliverables.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0 mt-1">
                          {React.createElement(item.icon, {
                            className: "text-[#1E40AF]",
                            size: 20,
                          })}
                        </div>
                        <div>
                          <h5 className="mb-1 text-[#1E293B]">{item.name}</h5>
                          <p className="text-[#64748B]">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href="/portfolio#contact"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  Discuss Your Project
                  <ArrowRight size={18} />
                </a>
              </div>

              <div
                className={index % 2 === 0 ? "order-2" : "order-2 lg:order-1"}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl mb-8">
                  <LazyImage
                    src={service.image}
                    alt={service.title}
                    className="w-full h-[500px] object-cover"
                  />
                </div>

                {/* Additional Info Cards */}
                <div className="space-y-4">
                  {"techStack" in service && service.techStack && (
                    <div className="card p-6">
                      <h5 className="mb-3 text-[#0A2540]">Technology Stack</h5>
                      <div className="space-y-2">
                        {Object.entries(service.techStack).map(
                          ([key, values]) => (
                            <div key={key}>
                              <span className="font-semibold text-[#1E293B] text-sm">
                                {key}:{" "}
                              </span>
                              <span className="text-[#64748B] text-sm">
                                {Array.isArray(values)
                                  ? values.join(", ")
                                  : values != null
                                  ? String(values)
                                  : ""}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {"aiCapabilities" in service &&
                    Array.isArray(service.aiCapabilities) && (
                      <div className="card p-6">
                        <h5 className="mb-3 text-[#0A2540]">AI Capabilities</h5>
                        <ul className="space-y-2">
                          {service.aiCapabilities.map(
                            (capability: string, idx: number) => (
                              <li
                                key={idx}
                                className="text-sm text-[#64748B] flex items-start gap-2"
                              >
                                <CheckCircle2
                                  size={16}
                                  className="text-[#14B8A6] mt-0.5 shrink-0"
                                />
                                <span>{String(capability)}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {"testingTypes" in service &&
                    Array.isArray(service.testingTypes) && (
                      <div className="card p-6">
                        <h5 className="mb-3 text-[#0A2540]">Testing Types</h5>
                        <ul className="space-y-2">
                          {(service.testingTypes as string[]).map(
                            (type: string, idx: number) => (
                              <li
                                key={idx}
                                className="text-sm text-[#64748B] flex items-start gap-2"
                              >
                                <CheckCircle2
                                  size={16}
                                  className="text-[#14B8A6] mt-0.5 shrink-0"
                                />
                                <span>{String(type)}</span>
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {"keyBenefits" in service && service.keyBenefits && (
                    <div className="card p-6">
                      <h5 className="mb-3 text-[#0A2540]">Key Benefits</h5>
                      <ul className="space-y-2">
                        {service.keyBenefits.map((benefit, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-[#64748B] flex items-start gap-2"
                          >
                            <CheckCircle2
                              size={16}
                              className="text-[#14B8A6] mt-0.5 shrink-0"
                            />
                            <span>{String(benefit)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Industries We Serve */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Industries We Serve</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Specialized solutions tailored to the unique needs of your
              industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="card">
                <div className="text-5xl mb-4">{industry.icon}</div>
                <h4 className="mb-3 text-[#0A2540]">{industry.name}</h4>
                <p className="text-[#64748B]">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Comparison Table */}
      <section className="section-spacing bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="mb-4">Choose the Right Service for Your Needs</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Quick comparison to help you identify the best solution for your
              requirements
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0A2540] text-white">
                  <th className="text-left p-4">Service</th>
                  <th className="text-left p-4">Best For</th>
                  <th className="text-left p-4">Timeline</th>
                  <th className="text-left p-4">Investment Level</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-[#F8FAFC]"}
                  >
                    <td className="p-4 font-semibold text-[#1E293B]">
                      {row.service}
                    </td>
                    <td className="p-4 text-[#64748B]">{row.bestFor}</td>
                    <td className="p-4 text-[#64748B]">{row.timeline}</td>
                    <td className="p-4 text-[#64748B]">{row.investment}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">How We Work With You</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Our proven process ensures successful project delivery and
              exceptional results
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <div key={index} className="relative">
                <div className="card h-full">
                  <div className="text-5xl font-bold text-[#1E40AF]/20 mb-4">
                    {step.number}
                  </div>
                  <h4 className="mb-3 text-[#0A2540]">{step.title}</h4>
                  <p className="text-[#64748B]">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-spacing bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Common Questions About Our Services</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Find answers to frequently asked questions
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h4 className="mb-3 text-[#0A2540]">{faq.question}</h4>
                <p className="text-[#64748B] leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-spacing bg-linear-to-br from-[#0A2540] to-[#1E40AF] text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6 text-white">
              Let's Discuss Your Technology Needs
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Our expert team is ready to help you identify the right solutions
              for your business challenges. Schedule a complimentary
              consultation to explore how we can drive your digital success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/portfolio#contact"
                className="bg-white text-[#1E40AF] px-7 py-3 rounded-md font-semibold uppercase text-sm tracking-wider transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 inline-block"
              >
                Request Free Consultation
              </a>
              <a
                href="/portfolio"
                className="bg-transparent border-2 border-white text-white px-7 py-3 rounded-md font-semibold uppercase text-sm tracking-wider transition-all duration-300 hover:bg-white hover:text-[#1E40AF] hover:-translate-y-0.5 inline-block"
              >
                View Our Portfolio
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
