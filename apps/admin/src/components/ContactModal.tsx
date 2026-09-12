import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign,
  Clock,
  MessageSquare,
  Globe,
} from "lucide-react";
import { Contact } from "../types";

interface ContactModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: Contact["status"]) => void;
}

interface InfoRowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}

const InfoRow = ({ icon: Icon, label, value }: InfoRowProps) => (
  <motion.div
    className="flex items-start gap-3 p-3 hover:bg-[#F8FAFC] rounded-lg transition-colors"
    whileHover={{ x: 4 }}
  >
    <div className="mt-0.5 p-2 bg-[#1E40AF]/10 rounded-lg">
      <Icon size={16} className="text-[#1E40AF]" />
    </div>
    <div className="flex-1">
      <p className="text-xs font-medium text-[#64748B] mb-1">{label}</p>
      <p className="text-sm text-[#0A2540] font-medium">{value || "-"}</p>
    </div>
  </motion.div>
);

export default function ContactModal({
  contact,
  isOpen,
  onClose,
  onUpdateStatus,
}: ContactModalProps) {
  if (!contact) return null;

  const statusColors: Record<Contact["status"], string> = {
    New: "bg-blue-500",
    Contacted: "bg-yellow-500",
    "In Progress": "bg-purple-500",
    Converted: "bg-green-500",
    Closed: "bg-gray-500",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
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
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="bg-linear-to-r from-[#0A2540] to-[#1E40AF] px-6 py-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <motion.h2
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {contact.fullName}
                    </motion.h2>
                    <motion.div
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <span className="text-sm text-white/80">
                        {contact.email}
                      </span>
                      {contact.company && (
                        <>
                          <span className="text-white/50">•</span>
                          <span className="text-sm text-white/80">
                            {contact.company}
                          </span>
                        </>
                      )}
                    </motion.div>
                  </div>
                  <motion.button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={24} className="text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
                {/* Status Bar */}
                <motion.div
                  className="flex items-center justify-between mb-6 p-4 bg-[#F8FAFC] rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        statusColors[contact.status]
                      } animate-pulse`}
                    ></div>
                    <span className="font-medium text-[#0A2540]">Status</span>
                  </div>
                  <select
                    value={contact.status}
                    onChange={(e) =>
                      onUpdateStatus(
                        contact.id,
                        e.target.value as Contact["status"]
                      )
                    }
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E40AF] focus:border-transparent font-medium text-sm"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </motion.div>

                {/* Contact Information Grid */}
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <InfoRow
                    icon={Mail}
                    label="Email Address"
                    value={contact.email}
                  />
                  <InfoRow
                    icon={Phone}
                    label="Phone Number"
                    value={contact.phone}
                  />
                  <InfoRow
                    icon={Building}
                    label="Company"
                    value={contact.company}
                  />
                  <InfoRow
                    icon={Globe}
                    label="Service Interest"
                    value={contact.service}
                  />
                  <InfoRow
                    icon={DollarSign}
                    label="Budget Range"
                    value={contact.budget}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Project Timeline"
                    value={contact.timeline}
                  />
                  <InfoRow
                    icon={Calendar}
                    label="Inquiry Date"
                    value={new Date(contact.createdAt).toLocaleDateString()}
                  />
                  <InfoRow
                    icon={MessageSquare}
                    label="Source"
                    value={contact.hearAbout}
                  />
                </motion.div>

                {/* Message Section */}
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-sm font-semibold text-[#64748B] mb-3 uppercase tracking-wide">
                    Project Message
                  </h3>
                  <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-100">
                    <p className="text-[#0A2540] leading-relaxed whitespace-pre-wrap">
                      {contact.message}
                    </p>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.a
                    href={`mailto:${contact.email}?subject=Re: Your inquiry about ${contact.service}`}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#1E40AF] text-white rounded-lg font-medium hover:bg-[#1E40AF]/90 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Mail size={18} />
                    Send Email
                  </motion.a>
                  {contact.phone && (
                    <motion.a
                      href={`tel:${contact.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#14B8A6] text-white rounded-lg font-medium hover:bg-[#14B8A6]/90 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Phone size={18} />
                      Call Now
                    </motion.a>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
