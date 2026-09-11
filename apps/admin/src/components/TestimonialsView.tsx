import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Star, MoreVertical } from "lucide-react";
import { Testimonial } from "../types";
import TestimonialFormModal from "./TestimonialFormModal";

interface TestimonialsViewProps {
  testimonials: Testimonial[];
  onAdd: (testimonial: Omit<Testimonial, "id">) => void;
  onUpdate: (id: string, testimonial: Omit<Testimonial, "id">) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const TestimonialSkeleton = () => (
  <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-100">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
  </div>
);

export default function TestimonialsView({
  testimonials,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: TestimonialsViewProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowFormModal(true);
    setShowMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      onDelete(id);
      setShowMenu(null);
    }
  };

  const handleSave = (testimonialData: Omit<Testimonial, "id">) => {
    if (editingTestimonial) {
      onUpdate(editingTestimonial.id, testimonialData);
    } else {
      onAdd(testimonialData);
    }
    setShowFormModal(false);
    setEditingTestimonial(null);
  };

  const handleClose = () => {
    setShowFormModal(false);
    setEditingTestimonial(null);
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "text-[#F59E0B] fill-current" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h2 className="text-2xl font-bold text-[#0A2540]">
            Client Testimonials
          </h2>
          <p className="text-[#64748B] mt-1">
            Manage customer reviews and feedback
          </p>
        </div>
        <motion.button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#1E40AF] to-[#14B8A6] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Add Testimonial
        </motion.button>
      </motion.div>

      {/* Testimonials Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <TestimonialSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {/* Featured Badge */}
                {testimonial.featured && (
                  <motion.div
                    className="absolute top-4 right-4 flex items-center gap-1 bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-bold"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Star size={12} fill="currentColor" />
                    Featured
                  </motion.div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-linear-to-br from-[#1E40AF] to-[#14B8A6] flex items-center justify-center text-white text-xl font-bold shrink-0">
                      {testimonial.image ? (
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        testimonial.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A2540]">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-[#64748B]">
                        {testimonial.position}
                      </p>
                      <p className="text-sm text-[#64748B]">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="relative">
                    <motion.button
                      onClick={() =>
                        setShowMenu(
                          showMenu === testimonial.id ? null : testimonial.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      whileHover={{ rotate: 90 }}
                    >
                      <MoreVertical size={18} className="text-[#64748B]" />
                    </motion.button>

                    <AnimatePresence>
                      {showMenu === testimonial.id && (
                        <motion.div
                          className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <button
                            onClick={() => handleEdit(testimonial)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors text-red-600 flex items-center gap-2"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {renderStars(testimonial.rating)}
                  <span className="ml-2 text-sm font-medium text-[#64748B]">
                    {testimonial.rating}.0
                  </span>
                </div>

                {/* Message */}
                <p className="text-[#64748B] leading-relaxed mb-4 italic">
                  "{testimonial.message}"
                </p>

                {/* Date */}
                <p className="text-xs text-[#64748B]">
                  Added {new Date(testimonial.createdAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && testimonials.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={32} className="text-[#64748B]" />
          </div>
          <h3 className="text-xl font-bold text-[#0A2540] mb-2">
            No Testimonials Yet
          </h3>
          <p className="text-[#64748B] mb-6">
            Start by adding your first client testimonial
          </p>
          <motion.button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Add Testimonial
          </motion.button>
        </motion.div>
      )}

      {/* Form Modal */}
      <TestimonialFormModal
        isOpen={showFormModal}
        onClose={handleClose}
        onSave={handleSave}
        testimonial={editingTestimonial}
      />
    </div>
  );
}
