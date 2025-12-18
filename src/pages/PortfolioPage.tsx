import { useState } from "react";
import {
  Download,
  Building2,
  ShoppingCart,
  Shield,
  GraduationCap,
  Package,
  Briefcase,
  Star,
  Mail,
  Phone,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
} from "lucide-react";
import { LazyImage } from "../components/LazyImage";

export default function PortfolioPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    serviceInterest: "",
    projectBudget: "",
    projectTimeline: "",
    message: "",
    howHeard: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:2025/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      setFormSubmitted(true);

      setTimeout(() => {
        setFormSubmitted(false);
        setFormData({
          fullName: "",
          email: "",
          companyName: "",
          phone: "",
          serviceInterest: "",
          projectBudget: "",
          projectTimeline: "",
          message: "",
          howHeard: "",
        });
        setSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error("Failed to submit form:", error);
      alert("Oops! Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  const caseStudies = [
    {
      title: "Enterprise Task Management System",
      industry: "Technology & SaaS",
      type: "Custom Software Development",
      image:
        "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kZXxlbnwxfHx8fDE3NjQ1MTU5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      challenge:
        "A growing tech company needed a comprehensive task management solution to coordinate multiple project teams across different locations.",
      solution:
        "We developed a cloud-based task management platform with real-time collaboration, automated workflows, and comprehensive reporting capabilities.",
      tech: ["React", "Node.js", "PostgreSQL", "AWS", "WebSocket"],
      results: [
        "75% improvement in project delivery time",
        "90% increase in team collaboration",
        "60% reduction in task tracking errors",
        "Seamless integration with existing tools",
      ],
    },
    {
      title: "E-Commerce Platform Solution",
      industry: "Retail & E-Commerce",
      type: "Full-Stack Web Development",
      image:
        "https://images.unsplash.com/photo-1531498860502-7c67cf02f657?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2Z0d2FyZSUyMGRldmVsb3BtZW50JTIwY29kZXxlbnwxfHx8fDE3NjQ1MTU5NzZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      challenge:
        "A retail business wanted to expand online but lacked the technical infrastructure to support secure, scalable e-commerce operations.",
      solution:
        "We built a complete e-commerce platform with inventory management, secure payment processing, and customer relationship management.",
      tech: ["Next.js", "MongoDB", "Stripe", "Cloudflare", "AWS S3"],
      results: [
        "300% increase in online sales within 6 months",
        "5,000+ products managed efficiently",
        "99.9% uptime reliability",
        "Integrated multi-channel payment system",
      ],
    },
    {
      title: "Security Assessment & Penetration Testing Framework",
      industry: "Financial Services",
      type: "Cybersecurity Audit",
      image:
        "https://images.unsplash.com/photo-1760199789455-49098afd02f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnNlY3VyaXR5JTIwZGlnaXRhbHxlbnwxfHx8fDE3NjQ1MTQyMTJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
      challenge:
        "A financial institution required comprehensive security testing to meet regulatory compliance and protect customer data.",
      solution:
        "We conducted thorough vulnerability assessments, penetration testing, and developed a comprehensive security framework with ongoing monitoring.",
      tech: ["OWASP", "Metasploit", "Burp Suite", "Nessus", "Custom Scripts"],
      results: [
        "Identified and resolved 47 critical vulnerabilities",
        "Achieved ISO 27001 compliance certification",
        "Implemented 24/7 threat monitoring",
        "Zero security incidents post-implementation",
      ],
    },
    {
      title: "AI-Powered Customer Support Automation",
      industry: "Telecommunications",
      type: "AI Chatbot Development",
      image:
        "https://images.unsplash.com/photo-1618758992242-2d4bc63a1be7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpZmljaWFsJTIwaW50ZWxsaWdlbmNlJTIwQUl8ZW58MXx8fHwxNzY0NTAxMjQxfDA&ixlib=rb-4.1.0&q=80&w=1080",
      challenge:
        "A telecom company was overwhelmed with customer inquiries and needed an intelligent solution to handle common support requests.",
      solution:
        "We developed an AI-powered chatbot with natural language processing that handles customer queries, provides instant responses, and seamlessly escalates complex issues.",
      tech: ["Python", "TensorFlow", "React", "REST API", "Azure AI"],
      results: [
        "70% reduction in customer support tickets",
        "24/7 automated customer service",
        "92% customer satisfaction rating",
        "50% decrease in response time",
      ],
    },
  ];

  const additionalProjects = [
    {
      title: "Inventory Management Solution",
      description:
        "Real-time inventory tracking system for manufacturing operations.",
      tech: "React, Python, PostgreSQL",
      impact: "Reduced inventory errors by 85%",
    },
    {
      title: "Mobile Banking Application",
      description: "Secure mobile banking app with biometric authentication.",
      tech: "React Native, Node.js, MongoDB",
      impact: "100K+ active users in first year",
    },
    {
      title: "HR Management Platform",
      description:
        "Comprehensive HR system for employee management and payroll.",
      tech: "Vue.js, Laravel, MySQL",
      impact: "Streamlined HR processes by 65%",
    },
    {
      title: "Learning Management System",
      description:
        "Online education platform with video streaming and assessments.",
      tech: "Next.js, Express, AWS",
      impact: "10,000+ students enrolled",
    },
    {
      title: "Business Intelligence Dashboard",
      description:
        "Custom analytics platform providing real-time business insights.",
      tech: "React, Python, Tableau",
      impact: "Data-driven decisions reduced costs by 25%",
    },
    {
      title: "Supply Chain Management System",
      description:
        "End-to-end supply chain tracking and optimization platform.",
      tech: "Angular, .NET, SQL Server",
      impact: "40% improvement in delivery times",
    },
  ];

  const industries = [
    {
      icon: Building2,
      name: "Financial Services & Banking",
      description:
        "Secure, compliant solutions for banking, fintech, and financial institutions.",
    },
    {
      icon: ShoppingCart,
      name: "Retail & E-Commerce",
      description:
        "Scalable platforms for online and offline retail businesses.",
    },
    {
      icon: GraduationCap,
      name: "Education & Training",
      description:
        "Learning management systems and educational technology solutions.",
    },
    {
      icon: Package,
      name: "Manufacturing & Logistics",
      description:
        "Supply chain, inventory, and operations management systems.",
    },
    {
      icon: Briefcase,
      name: "Professional Services",
      description:
        "Business management tools for consulting, legal, and accounting firms.",
    },
    {
      icon: Shield,
      name: "Government & Public Sector",
      description:
        "Secure, accessible digital solutions for government agencies.",
    },
  ];

  const testimonials = [
    {
      quote:
        "ACCIAN's technical expertise and professionalism are unmatched. They delivered our complex enterprise system on time and within budget, exceeding all our expectations.",
      author: "Adebayo Johnson",
      position: "CTO, TechVenture Nigeria",
    },
    {
      quote:
        "The cybersecurity audit conducted by ACCIAN was thorough and eye-opening. Their recommendations significantly strengthened our security posture and helped us achieve compliance certification.",
      author: "Chioma Okafor",
      position: "IT Director, Financial Solutions Ltd",
    },
    {
      quote:
        "Working with ACCIAN on our AI chatbot project was seamless. They took the time to understand our needs and delivered a solution that has transformed our customer service operations.",
      author: "Ibrahim Musa",
      position: "Operations Manager, CustomerFirst Services",
    },
    {
      quote:
        "From initial consultation to final deployment, ACCIAN demonstrated exceptional technical knowledge and project management skills. Our e-commerce platform has been flawless.",
      author: "Ngozi Eze",
      position: "CEO, Retail Innovations Nigeria",
    },
    {
      quote:
        "ACCIAN doesn't just build software—they solve business problems. Their strategic approach and technical execution helped us streamline operations and grow revenue.",
      author: "Oluwaseun Adeyemi",
      position: "Managing Director, Enterprise Solutions Group",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative gradient-hero text-white">
        <div className="container-custom py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-white">Our Work Speaks For Itself</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Explore our portfolio of successful projects across software
              development, cybersecurity, AI automation, and digital
              transformation. Delivered globally from our UK and Nigeria
              offices, each case study demonstrates our commitment to
              excellence.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Case Studies */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Featured Case Studies</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Deep dive into our most impactful projects and the measurable
              results we delivered
            </p>
          </div>

          <div className="space-y-20">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div
                  className={index % 2 === 0 ? "order-1" : "order-1 lg:order-2"}
                >
                  <div className="rounded-2xl overflow-hidden shadow-2xl">
                    <LazyImage
                      src={study.image}
                      alt={study.title}
                      className="w-full h-[400px] object-cover"
                    />
                  </div>
                </div>

                <div
                  className={index % 2 === 0 ? "order-2" : "order-2 lg:order-1"}
                >
                  <div className="inline-block px-4 py-2 bg-[#1E40AF]/10 text-[#1E40AF] rounded-full text-sm font-semibold mb-4">
                    {study.type}
                  </div>
                  <h3 className="mb-4">{study.title}</h3>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="font-semibold text-[#1E293B] mb-2">
                        Industry:
                      </p>
                      <p className="text-[#64748B]">{study.industry}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#1E293B] mb-2">
                        The Challenge:
                      </p>
                      <p className="text-[#64748B] leading-relaxed">
                        {study.challenge}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#1E293B] mb-2">
                        Our Solution:
                      </p>
                      <p className="text-[#64748B] leading-relaxed">
                        {study.solution}
                      </p>
                    </div>

                    <div>
                      <p className="font-semibold text-[#1E293B] mb-2">
                        Technology Stack:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {study.tech.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-[#F8FAFC] text-[#64748B] rounded-md text-sm"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold text-[#1E293B] mb-3">
                        Measurable Results:
                      </p>
                      <ul className="space-y-2">
                        {study.results.map((result, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-[#64748B]"
                          >
                            <CheckCircle2
                              size={20}
                              className="text-[#14B8A6] mt-0.5 shrink-0"
                            />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button className="btn-secondary inline-flex items-center gap-2">
                    <Download size={18} />
                    Download Full Case Study
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Projects Grid */}
      <section className="section-spacing bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">More Projects</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              A selection of additional successful projects across various
              industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalProjects.map((project, index) => (
              <div key={index} className="card">
                <h4 className="mb-3 text-[#0A2540]">{project.title}</h4>
                <p className="text-[#64748B] mb-4">{project.description}</p>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-[#1E293B] mb-1">
                    Tech Stack:
                  </p>
                  <p className="text-sm text-[#64748B]">{project.tech}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-semibold text-[#14B8A6]">
                    {project.impact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="section-spacing bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">Trusted Across Multiple Sectors</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              We deliver specialized solutions for diverse industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry, index) => (
              <div key={index} className="card">
                <div className="w-14 h-14 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center mb-4">
                  <industry.icon className="text-[#1E40AF]" size={28} />
                </div>
                <h4 className="mb-3 text-[#0A2540]">{industry.name}</h4>
                <p className="text-[#64748B]">{industry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="section-spacing bg-[#F8FAFC]">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="mb-4">What Our Clients Say About Us</h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Real feedback from real clients who have experienced the ACCIAN
              difference
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial, index) => (
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 max-w-5xl mx-auto">
            {testimonials.slice(3).map((testimonial, index) => (
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
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="section-spacing bg-white"
        aria-labelledby="contact-heading"
      >
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 id="contact-heading" className="mb-4">
              Let's Start Your Digital Transformation
            </h2>
            <p className="text-lg text-[#64748B] max-w-3xl mx-auto">
              Ready to discuss your project? Our expert team is here to answer
              your questions and provide tailored solutions for your business
              needs. Get in touch today for a complimentary consultation.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="card">
                <h3 className="mb-6">Send Us a Message</h3>

                {formSubmitted ? (
                  <div
                    className="flex flex-col items-center justify-center py-12"
                    role="alert"
                    aria-live="polite"
                  >
                    <div
                      className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4"
                      aria-hidden="true"
                    >
                      <CheckCircle2 size={32} className="text-[#10B981]" />
                    </div>
                    <h4 className="mb-2 text-[#10B981]">Thank You!</h4>
                    <p className="text-[#64748B] text-center">
                      We've received your message and will get back to you
                      within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                    aria-label="Contact form"
                  >
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Full Name{" "}
                        <span className="text-red-500" aria-label="required">
                          *
                        </span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="Full Name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Business Email{" "}
                        <span className="text-red-500" aria-label="required">
                          *
                        </span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="john@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="companyName"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="Your Company"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="+234 XXX XXX XXXX"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="serviceInterest"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Service Interest{" "}
                        <span className="text-red-500" aria-label="required">
                          *
                        </span>
                      </label>
                      <select
                        id="serviceInterest"
                        name="serviceInterest"
                        value={formData.serviceInterest}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      >
                        <option value="">Select a service</option>
                        <option value="software-development">
                          Software Development
                        </option>
                        <option value="cybersecurity">
                          Cybersecurity & Compliance
                        </option>
                        <option value="software-testing">
                          Software Testing & QA
                        </option>
                        <option value="ai-automation">
                          AI Automation & Chatbots
                        </option>
                        <option value="cloud-solutions">
                          Cloud Solutions & Infrastructure
                        </option>
                        <option value="it-consulting">
                          IT Strategy & Consulting
                        </option>
                        <option value="multiple">Multiple Services</option>
                        <option value="not-sure">Not Sure Yet</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="projectBudget"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Project Budget Range
                      </label>
                      <select
                        id="projectBudget"
                        name="projectBudget"
                        value={formData.projectBudget}
                        onChange={handleChange}
                        aria-label="Select project budget range"
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      >
                        <option value="">Select budget range</option>
                        <option value="under-500k">Under ₦500,000</option>
                        <option value="500k-2m">₦500,000 - ₦2,000,000</option>
                        <option value="2m-5m">₦2,000,000 - ₦5,000,000</option>
                        <option value="5m-10m">₦5,000,000 - ₦10,000,000</option>
                        <option value="above-10m">Above ₦10,000,000</option>
                        <option value="prefer-discuss">
                          Prefer to Discuss
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="projectTimeline"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Project Timeline
                      </label>
                      <select
                        id="projectTimeline"
                        name="projectTimeline"
                        value={formData.projectTimeline}
                        onChange={handleChange}
                        aria-label="Select project timeline"
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      >
                        <option value="">Select timeline</option>
                        <option value="urgent">Urgent (Within 1 month)</option>
                        <option value="short-term">
                          Short-term (1-3 months)
                        </option>
                        <option value="medium-term">
                          Medium-term (3-6 months)
                        </option>
                        <option value="long-term">Long-term (6+ months)</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        Message{" "}
                        <span className="text-red-500" aria-label="required">
                          *
                        </span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        aria-required="true"
                        rows={5}
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent resize-none"
                        placeholder="Tell us about your project, challenges, or questions..."
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="howHeard"
                        className="block text-sm font-semibold text-[#1E293B] mb-2"
                      >
                        How did you hear about us?
                      </label>
                      <select
                        id="howHeard"
                        name="howHeard"
                        value={formData.howHeard}
                        onChange={handleChange}
                        aria-label="Select how you heard about us"
                        className="w-full px-4 py-3 border border-[#64748B]/30 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      >
                        <option value="">Select an option</option>
                        <option value="google">Google Search</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="referral">Referral</option>
                        <option value="social-media">Social Media</option>
                        <option value="event">Event/Conference</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <p className="text-xs text-[#64748B]" role="note">
                      By submitting this form, you agree to our Privacy Policy.
                      We respect your privacy and will never share your
                      information with third parties.
                    </p>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2"
                      aria-label="Submit contact form"
                    >
                      <Send size={18} aria-hidden="true" />
                      {submitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="mb-6">Direct Contact Information</h3>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                      <Phone className="text-[#1E40AF]" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 text-[#1E293B]">Phone</h5>
                      <p className="text-[#64748B] mb-1">+234 810 066 2390</p>
                      <p className="text-sm text-[#64748B]">
                        Available: Monday - Friday, 9:00 AM - 5:00 PM WAT
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                      <Mail className="text-[#1E40AF]" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 text-[#1E293B]">Email</h5>
                      <p className="text-[#64748B] mb-1">
                        admin@acciannginfo.com
                      </p>
                      <p className="text-sm text-[#64748B]">
                        Response Time: Within 24 business hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                      <Clock className="text-[#1E40AF]" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 text-[#1E293B]">Business Hours</h5>
                      <p className="text-[#64748B]">
                        Monday - Friday: 9:00 AM - 5:00 PM WAT
                      </p>
                      <p className="text-[#64748B]">Saturday: By Appointment</p>
                      <p className="text-[#64748B]">Sunday: Closed</p>
                      <p className="text-sm text-[#64748B] mt-2">
                        Emergency Support: Available 24/7 for existing clients
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                      <MapPin className="text-[#1E40AF]" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 text-[#1E293B]">Global Offices</h5>
                      <p className="text-[#64748B] mb-1">🇬🇧 United Kingdom</p>
                      <p className="text-[#64748B]">🇳🇬 Nigeria</p>
                      <p className="text-sm text-[#64748B] mt-2">
                        Serving clients worldwide
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-linear-to-br from-[#0A2540] to-[#1E40AF] text-white">
                <h4 className="mb-4 text-white">Ready to Get Started?</h4>
                <p className="text-white/90 mb-6">
                  Schedule a free consultation call to discuss your project
                  requirements and explore how we can help.
                </p>
                <button className="bg-white text-[#1E40AF] px-6 py-3 rounded-md font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 w-full">
                  Schedule a Call
                </button>
              </div>

              <div className="card">
                <h4 className="mb-4">Download Company Profile</h4>
                <p className="text-[#64748B] mb-4">
                  Get our comprehensive company brochure with detailed
                  information about our services, team, and success stories.
                </p>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <Download size={18} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-spacing bg-linear-to-br from-[#0A2540] to-[#1E40AF] text-white">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="mb-6 text-white">
              Your Digital Success Starts Here
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Don't let technology challenges hold your business back. Partner
              with ACCIAN to leverage enterprise-grade solutions that drive
              growth, enhance security, and optimize operations across the UK,
              Nigeria, and worldwide.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-[#14B8A6]">
                  50+
                </div>
                <p className="text-sm text-white/80">Successful Projects</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-[#14B8A6]">
                  98%
                </div>
                <p className="text-sm text-white/80">Client Satisfaction</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-[#14B8A6]">
                  24/7
                </div>
                <p className="text-sm text-white/80">Technical Support</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-[#14B8A6]">7+</div>
                <p className="text-sm text-white/80">
                  Years Combined Expertise
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="bg-white text-[#1E40AF] px-7 py-3 rounded-md font-semibold uppercase text-sm tracking-wider transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 inline-block"
              >
                Request Free Consultation
              </a>
              <a
                href="tel:+2348100662390"
                className="bg-transparent border-2 border-white text-white px-7 py-3 rounded-md font-semibold uppercase text-sm tracking-wider transition-all duration-300 hover:bg-white hover:text-[#1E40AF] hover:-translate-y-0.5 inline-block"
              >
                Call Us Now: +234 810 066 2390
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
