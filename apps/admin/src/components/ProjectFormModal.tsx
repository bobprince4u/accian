import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Plus, Trash2, Save } from "lucide-react";
import { Project } from "../types";

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, "id">) => void;
  project?: Project | null;
}

export default function ProjectFormModal({
  isOpen,
  onClose,
  onSave,
  project,
}: ProjectFormModalProps) {
  const [formData, setFormData] = useState({
    title: project?.title || "",
    client: project?.client || "",
    category: project?.category || "",
    industry: project?.industry || "",
    description: project?.description || "",
    challenge: project?.challenge || "",
    solution: project?.solution || "",
    image: project?.image || "",
    status: project?.status || ("Draft" as "Published" | "Draft"),
    featured: project?.featured || false,
    technologies: project?.technologies || ([] as string[]),
    results: project?.results || ([] as { metric: string; value: string }[]),
    completedDate:
      project?.completedDate || new Date().toISOString().split("T")[0],
  });

  const [currentTech, setCurrentTech] = useState("");
  const [currentResult, setCurrentResult] = useState({ metric: "", value: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const addTechnology = () => {
    if (currentTech.trim()) {
      setFormData((prev) => ({
        ...prev,
        technologies: [...prev.technologies, currentTech.trim()],
      }));
      setCurrentTech("");
    }
  };

  const removeTechnology = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((_, i) => i !== index),
    }));
  };

  const addResult = () => {
    if (currentResult.metric.trim() && currentResult.value.trim()) {
      setFormData((prev) => ({
        ...prev,
        results: [...prev.results, currentResult],
      }));
      setCurrentResult({ metric: "", value: "" });
    }
  };

  const removeResult = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      results: prev.results.filter((_, i) => i !== index),
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden pointer-events-auto"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-linear-to-r from-[#0A2540] to-[#1E40AF] px-6 py-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {project ? "Edit Project" : "Add New Project"}
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
                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Project Title *
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
                        placeholder="AI-Powered Customer Support Automation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Client *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.client}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            client: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="MTN Nigeria"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Industry *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.industry}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            industry: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="Telecommunications"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="Software Development">
                          Software Development
                        </option>
                        <option value="AI Automation">AI Automation</option>
                        <option value="Cybersecurity">Cybersecurity</option>
                        <option value="Cloud Solutions">Cloud Solutions</option>
                        <option value="Software Testing">
                          Software Testing
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Completion Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.completedDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            completedDate: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Project Image URL *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          required
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
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Project Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      placeholder="Brief overview of the project..."
                    />
                  </div>

                  {/* The Challenge */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      The Challenge
                    </label>
                    <textarea
                      value={formData.challenge}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          challenge: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      placeholder="What was the client's main challenge?"
                    />
                  </div>

                  {/* Our Solution */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Our Solution
                    </label>
                    <textarea
                      value={formData.solution}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          solution: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      placeholder="How did you solve the challenge?"
                    />
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
                          e.key === "Enter" &&
                          (e.preventDefault(), addTechnology())
                        }
                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="e.g., Python, React, TensorFlow"
                      />
                      <motion.button
                        type="button"
                        onClick={addTechnology}
                        className="px-4 py-2 bg-[#1E40AF] text-white rounded-lg hover:bg-[#1E40AF]/90 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.technologies.map((tech, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1 bg-[#F8FAFC] border border-[#1E40AF]/20 rounded-lg"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <span className="text-sm font-medium text-[#1E40AF]">
                            {tech}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeTechnology(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Measurable Results */}
                  <div>
                    <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                      Measurable Results
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                      <input
                        type="text"
                        value={currentResult.metric}
                        onChange={(e) =>
                          setCurrentResult((prev) => ({
                            ...prev,
                            metric: e.target.value,
                          }))
                        }
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                        placeholder="Metric (e.g., Customer Support Tickets)"
                      />
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentResult.value}
                          onChange={(e) =>
                            setCurrentResult((prev) => ({
                              ...prev,
                              value: e.target.value,
                            }))
                          }
                          className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                          placeholder="Value (e.g., 70% reduction)"
                        />
                        <motion.button
                          type="button"
                          onClick={addResult}
                          className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#14B8A6]/90 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus size={18} />
                        </motion.button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {formData.results.map((result, index) => (
                        <motion.div
                          key={index}
                          className="flex items-center justify-between p-3 bg-[#F8FAFC] border border-gray-200 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <div>
                            <span className="text-sm text-[#64748B]">
                              {result.metric}:{" "}
                            </span>
                            <span className="text-sm font-bold text-[#14B8A6]">
                              {result.value}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeResult(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Status & Featured */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0A2540] mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            status: e.target.value as "Published" | "Draft",
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>

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
                          Mark as Featured Project
                        </span>
                      </label>
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
                    {project ? "Update Project" : "Save Project"}
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
