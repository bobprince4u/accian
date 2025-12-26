import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import {
  //Download,
  Phone,
  Mail,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
} from "lucide-react";
import { API_URL } from "../config/api";

export default function ContactPage() {
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
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit form");
      }

      // Show success toast
      toast.success("Message sent successfully! We'll get back to you soon.", {
        duration: 5000,
        position: "top-center",
      });

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
      toast.error("Oops! Something went wrong. Please try again later.", {
        duration: 5000,
        position: "top-center",
      });
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Toaster />
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
                          IT Consulting & Advisory
                        </option>
                        <option value="cybersecurity">
                          Business & Domestic Software Development
                        </option>
                        <option value="software-testing">
                          Education & Training
                        </option>
                        <option value="ai-automation">
                          Social Care & Community Support
                        </option>
                        <option value="cloud-solutions">
                          Data Science, AI & Predictive Analytics
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
                        <option value="">Select budget range</option>"
                        {/*<option value="under-500k"></option>
                        <option value="500k-2m"></option>
                        <option value="2m-5m"></option>
                        <option value="5m-10m"></option>
                        <option value="above-10m"></option> */}
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
                      <p className="text-[#64748B] mb-1"> +44 7749 101623</p>
                      <p className="text-sm text-[#64748B]">
                        Available: Monday - Friday, 9:00 AM - 17:00 PM GMT
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                      <Mail className="text-[#1E40AF]" size={24} />
                    </div>
                    {/* <div>
                      <h5 className="mb-1 text-[#1E293B]">Email</h5>
                      <p className="text-[#64748B] mb-1">
                      
                      </p>
                      <p className="text-sm text-[#64748B]">
                        Response Time: Within 24 business hours
                      </p>
                    </div> */}
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#1E40AF]/10 flex items-center justify-center shrink-0">
                      <Clock className="text-[#1E40AF]" size={24} />
                    </div>
                    <div>
                      <h5 className="mb-1 text-[#1E293B]">Business Hours</h5>
                      <p className="text-[#64748B]">
                        Monday - Friday: 9:00 AM - 17:00 PM GMT
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
                      <h5 className="mb-1 text-[#1E293B]">Our Office</h5>
                      <p className="text-[#64748B] mb-1">🇬🇧 United Kingdom</p>
                      {/* <p className="text-[#64748B]">🇳🇬 Nigeria</p> */}
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
                  Fill the Form
                </button>
              </div>

              {/* <div className="card">
                <h4 className="mb-4">Download Company Profile</h4>
                <p className="text-[#64748B] mb-4">
                  Get our comprehensive company brochure with detailed
                  information about our services, team, and success stories.
                </p>
                <button className="btn-secondary inline-flex items-center gap-2">
                  <Download size={18} />
                  Download PDF
                </button>
              </div> */}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
