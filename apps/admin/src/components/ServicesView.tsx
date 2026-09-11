import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Shield,
  Code,
  Brain,
  Cloud,
  TestTube,
} from "lucide-react";
import { Service } from "../types";
import ServiceFormModal from "./ServiceFormModal";

interface ServicesViewProps {
  services: Service[];
  onAdd: (service: Omit<Service, "id">) => void;
  onUpdate: (id: string, service: Omit<Service, "id">) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const ServiceSkeleton = () => (
  <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-100">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="flex gap-2">
      <div className="h-6 bg-gray-200 rounded w-16"></div>
      <div className="h-6 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

type IconType = typeof Shield;

const iconMap: Record<string, IconType> = {
  Shield,
  Code,
  Brain,
  Cloud,
  TestTube,
};

export default function ServicesView({
  services,
  onAdd,
  onUpdate,
  onDelete,
  loading = false,
}: ServicesViewProps) {
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowFormModal(true);
    setShowMenu(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      onDelete(id);
      setShowMenu(null);
    }
  };

  const handleSave = (serviceData: Omit<Service, "id">) => {
    if (editingService) {
      onUpdate(String(editingService.id), serviceData);
    } else {
      onAdd(serviceData);
    }
    setShowFormModal(false);
    setEditingService(null);
  };

  const handleClose = () => {
    setShowFormModal(false);
    setEditingService(null);
  };

  const getIconComponent = (iconName: string | null) => {
    return iconMap[iconName || "Code"] || Code;
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
            Service Offerings
          </h2>
          <p className="text-[#64748B] mt-1">
            Manage your service catalog and descriptions
          </p>
        </div>
        <motion.button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-[#1E40AF] to-[#14B8A6] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Add Service
        </motion.button>
      </motion.div>

      {/* Services Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ServiceSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {services.map((service, index) => {
              const IconComponent = getIconComponent(service.icon || "Code");
              // const isActive = service.status === "Active";

              return (
                <motion.div
                  key={service.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative group"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  {/* Status Badge */}
                  {/*}  <div
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${
                      isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {service.status}
                  </div> */}
                  {/* Icon & Title */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-linear-to-br from-[#1E40AF]/10 to-[#14B8A6]/10 rounded-lg">
                      <IconComponent size={24} className="text-[#1E40AF]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[#0A2540] mb-1 group-hover:text-[#1E40AF] transition-colors">
                        {service.title}
                      </h3>
                      {/* <p className="text-xs text-[#64748B] uppercase tracking-wide font-medium">
                        {service.category}
                      </p> */}
                    </div>
                  </div>
                  {/* Description */}
                  <p className="text-sm text-[#64748B] mb-4 line-clamp-2">
                    {service.shortDescription}
                  </p>
                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-[#0A2540] mb-2">
                      Key Features:
                    </p>
                    <ul className="space-y-1">
                      {service.features.slice(0, 5).map((feature, i) => (
                        <li
                          key={i}
                          className="text-xs text-[#64748B] flex items-start gap-2"
                        >
                          <span className="text-[#14B8A6] mt-1">•</span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    {service.features.length > 3 && (
                      <p className="text-xs text-[#64748B] mt-1">
                        +{service.features.length - 5} more
                      </p>
                    )}
                  </div>
                  * {/* Pricing */}
                  {/*}
                  {service.pricing && (
                    <div className="mb-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-[#64748B]">Starting from</p>
                      <p className="text-lg font-bold text-[#1E40AF]">
                        {service.pricing}
                      </p>
                    </div>
                  )} */}
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {/* <p className="text-xs text-[#64748B]">
                      Added {new Date(service.createdAt).toLocaleDateString()}
                    </p> */}

                    <div className="relative">
                      <motion.button
                        onClick={() =>
                          setShowMenu(
                            showMenu === String(service.id)
                              ? null
                              : String(service.id)
                          )
                        }
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        whileHover={{ rotate: 90 }}
                      >
                        <MoreVertical size={18} className="text-[#64748B]" />
                      </motion.button>

                      <AnimatePresence>
                        {showMenu === String(service.id) && (
                          <motion.div
                            className="absolute right-0 bottom-full mb-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                          >
                            <button
                              onClick={() => handleEdit(service)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded transition-colors flex items-center gap-2"
                            >
                              <Edit size={14} />
                              Edit Service
                            </button>
                            <button
                              onClick={() => handleDelete(String(service.id!))}
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
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!loading && services.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Code size={32} className="text-[#64748B]" />
          </div>
          <h3 className="text-xl font-bold text-[#0A2540] mb-2">
            No Services Yet
          </h3>
          <p className="text-[#64748B] mb-6">
            Start by adding your first service offering
          </p>
          <motion.button
            onClick={() => setShowFormModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Add Service
          </motion.button>
        </motion.div>
      )}

      {/* Form Modal */}
      <ServiceFormModal
        isOpen={showFormModal}
        onClose={handleClose}
        onSave={handleSave}
        service={editingService}
      />
    </div>
  );
}
