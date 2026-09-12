import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Save, Upload } from "lucide-react";
import { Testimonial } from "../types";

interface TestimonialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testimonial: Omit<Testimonial, "id">) => void; // ← Changed this line
  testimonial?: Testimonial | null;
}

export default function TestimonialFormModal({
  isOpen,
  onClose,
  onSave,
  testimonial,
}: TestimonialFormModalProps) {
  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    position: testimonial?.position || "",
    company: testimonial?.company || "",
    message: testimonial?.message || "",
    rating: testimonial?.rating || 5,
    image: testimonial?.image || "",
    featured: testimonial?.featured || false,
    createdAt: testimonial?.createdAt || new Date().toISOString(),
  });

  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the data directly without transformation
    onSave({
      name: formData.name,
      position: formData.position,
      company: formData.company,
      message: formData.message,
      rating: formData.rating,
      featured: formData.featured,
      image: formData.image,
      createdAt: formData.createdAt,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-linear-to-r from-[#0A2540] to-[#1E40AF] px-6 py-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {testimonial ? "Edit Testimonial" : "Add New Testimonial"}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X size={24} className="text-white" />
                </motion.button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="p-6 overflow-y-auto max-h-[calc(90vh-100px)] custom-scrollbar"
              >
                <div className="space-y-6">
                  {/* Client Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Position *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.position}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            position: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="CEO"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="Tech Solutions Ltd"
                      />
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Profile Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.image}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            image: e.target.value,
                          }))
                        }
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="https://..."
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#14B8A6]/90 transition-colors"
                      >
                        <Upload size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-[#64748B] mt-1">
                      Optional: Leave blank to use initials
                    </p>
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Rating *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <motion.button
                          key={rating}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, rating }))
                          }
                          onMouseEnter={() => setHoveredRating(rating)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Star
                            size={32}
                            className={
                              rating <= (hoveredRating || formData.rating)
                                ? "text-[#F59E0B] fill-current"
                                : "text-gray-300"
                            }
                          />
                        </motion.button>
                      ))}
                      <span className="ml-3 text-lg font-bold text-[#0A2540]">
                        {formData.rating}.0
                      </span>
                    </div>
                  </div>

                  {/* Testimonial Message */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Testimonial Message *
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          message: e.target.value,
                        }))
                      }
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      placeholder="Share your experience working with ACCIAN..."
                    />
                    <p className="text-xs text-[#64748B] mt-1">
                      {formData.message.length} characters
                    </p>
                  </div>

                  {/* Featured */}
                  <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            featured: e.target.checked,
                          }))
                        }
                        className="w-5 h-5 text-[#1E40AF] border-gray-300 rounded focus:ring-[#1E40AF]"
                      />
                      <span className="text-sm font-semibold text-[#0A2540]">
                        Mark as Featured Testimonial
                      </span>
                    </label>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-[#64748B] rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2 bg-linear-to-r from-[#1E40AF] to-[#14B8A6] text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Save size={18} />
                    {testimonial ? "Update Testimonial" : "Save Testimonial"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
