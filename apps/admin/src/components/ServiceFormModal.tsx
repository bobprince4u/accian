import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Save } from "lucide-react";
import { Service } from "../types";

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => void;
  service?: Service | null;
}

export default function ServiceFormModal({
  isOpen,
  onClose,
  onSave,
  service,
}: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    title: service?.title || "",
    icon: service?.icon || "Code",

    shortDescription: service?.shortDescription || "",
    fullDescription: service?.fullDescription || "",

    features: service?.features || [],

    technologyStack: service?.technologyStack || [],
    processSteps: service?.processSteps || [],
    idealFor: service?.idealFor || [],

    orderIndex: service?.orderIndex || 0,
    published: service?.published ?? true,
  });

  const [currentFeature, setCurrentFeature] = useState("");
  const [currentTech, setCurrentTech] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Service = {
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/\s+/g, "-"),
      icon: formData.icon,
      shortDescription:
        formData.shortDescription || formData.fullDescription.slice(0, 150),
      fullDescription: formData.fullDescription,
      features: formData.features,
      technologyStack: formData.technologyStack,
      processSteps: formData.processSteps,
      idealFor: formData.idealFor,
      orderIndex: formData.orderIndex,
      published: formData.published,
    };

    onSave(payload);
    onClose();
  };
  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()],
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addTech = () => {
    if (currentTech.trim()) {
      setFormData((prev) => ({
        ...prev,
        technologyStack: [...prev.technologyStack, currentTech.trim()],
      }));
      setCurrentTech("");
    }
  };

  const removeTech = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologyStack: prev.technologyStack.filter((_, i) => i !== index),
    }));
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden pointer-events-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-linear-to-r from-[#0A2540] to-[#1E40AF] px-6 py-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {service ? "Edit Service" : "Add New Service"}
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
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Service Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="Cybersecurity & Threat Intelligence"
                      />
                    </div>
                  </div>
                  {/* Technology Stack */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Technology Stack
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentTech}
                        onChange={(e) => setCurrentTech(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addTech())
                        }
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="e.g., Python, TensorFlow"
                      />
                      <motion.button
                        type="button"
                        onClick={addTech}
                        className="px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E40AF]/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                    <div className="space-y-2">
                      {formData.technologyStack.map((tech, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-sm text-[#0A2540]">{tech}</span>
                          <button
                            type="button"
                            onClick={() => removeTech(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Service Description *
                    </label>
                    <textarea
                      required
                      value={formData.fullDescription}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fullDescription: e.target.value,
                        }))
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      placeholder="Comprehensive description of the service..."
                    />
                  </div>

                  {/* Features */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Key Features
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), addFeature())
                        }
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="e.g., 24/7 Security Monitoring"
                      />
                      <motion.button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E40AF]/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <span className="text-sm text-[#0A2540]">
                            {feature}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
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
                    {service ? "Update Service" : "Save Service"}
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
