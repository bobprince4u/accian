import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  MoreVertical,
  Briefcase,
} from "lucide-react";
import { Project } from "../types";
import ProjectFormModal from "./ProjectFormModal";

interface ProjectsViewProps {
  projects: Project[];
  onAdd: (project: Omit<Project, "id">) => Promise<void>;
  onUpdate: (id: string, project: Omit<Project, "id">) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

const ProjectSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gray-200 rounded-t-xl"></div>
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export default function ProjectsView({
  projects,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: ProjectsViewProps) {
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const statusColors = {
    Published: "bg-green-100 text-green-700",
    Draft: "bg-gray-100 text-gray-700",
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
            Portfolio Projects
          </h2>
          <p className="text-[#64748B] mt-1">Manage your showcase projects</p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#1E40AF] to-[#14B8A6] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFormModal(true)}
        >
          <Plus size={20} />
          Add New Project
        </motion.button>
      </motion.div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProjectSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-shadow duration-300"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -8 }}
              >
                {/* Project Image */}
                <div className="relative h-48 overflow-hidden bg-linear-to-br from-[#1E40AF]/10 to-[#14B8A6]/10">
                  <motion.img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />

                  {/* Featured Badge */}
                  {project.featured && (
                    <motion.div
                      className="absolute top-3 left-3 flex items-center gap-1 bg-[#F59E0B] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Star size={12} fill="currentColor" />
                      Featured
                    </motion.div>
                  )}

                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[project.status]
                    }`}
                  >
                    {project.status}
                  </div>

                  {/* Overlay Actions */}
                  <motion.div
                    className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                  >
                    <motion.button
                      className="p-2 bg-white rounded-lg hover:bg-[#1E40AF] hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye size={16} />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-white rounded-lg hover:bg-[#14B8A6] hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setEditingProject(project);
                        setShowFormModal(true);
                      }}
                    >
                      <Edit size={16} />
                    </motion.button>
                    <motion.button
                      className="p-2 bg-white rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(project.id)}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </motion.div>
                </div>

                {/* Project Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0A2540] mb-1 group-hover:text-[#1E40AF] transition-colors line-clamp-1">
                        {project.title}
                      </h3>
                      <p className="text-sm text-[#64748B]">{project.client}</p>
                    </div>
                    <div className="relative">
                      <motion.button
                        onClick={() =>
                          setShowMenu(
                            showMenu === project.id ? null : project.id
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        whileHover={{ rotate: 90 }}
                      >
                        <MoreVertical size={18} className="text-[#64748B]" />
                      </motion.button>

                      <AnimatePresence>
                        {showMenu === project.id && (
                          <motion.div
                            className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors">
                              View Details
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors"
                              onClick={() => {
                                setEditingProject(project);
                                setShowFormModal(true);
                              }}
                            >
                              Edit Project
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors text-red-600"
                              onClick={() => onDelete(project.id)}
                            >
                              Delete
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <p className="text-sm text-[#64748B] mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(project.technologies || []).slice(0, 3).map((tech, i) => (
                      <motion.span
                        key={i}
                        className="px-2 py-1 bg-[#F8FAFC] text-[#1E40AF] text-xs font-medium rounded"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                    {(project.technologies || []).length > 3 && (
                      <span className="px-2 py-1 bg-[#F8FAFC] text-[#64748B] text-xs font-medium rounded">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Results */}
                  {(project.results || []).length > 0 && (
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#64748B]">
                          {project.results[0].metric}
                        </span>
                        <span className="font-bold text-[#14B8A6]">
                          {(project.results || [])[0].value}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && projects.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase size={32} className="text-[#64748B]" />
          </div>
          <h3 className="text-xl font-bold text-[#0A2540] mb-2">
            No Projects Yet
          </h3>
          <p className="text-[#64748B] mb-6">
            Start by adding your first portfolio project
          </p>
          <motion.button
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFormModal(true)}
          >
            <Plus size={20} />
            Add Project
          </motion.button>
        </motion.div>
      )}

      <ProjectFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSave={(projectData) => {
          if (editingProject) {
            onUpdate(editingProject.id, projectData);
          } else {
            onAdd(projectData);
          }
          setEditingProject(null);
        }}
      />
    </div>
  );
}
