import { motion } from "framer-motion";
import { Users, Mail, Briefcase, TrendingUp, Clock, Eye } from "lucide-react";
import StatCard from "./StatCard";
import { Contact, DashboardStats } from "../types";

interface DashboardViewProps {
  stats: DashboardStats;
  recentContacts: Contact[];
  onViewContact: (contact: Contact) => void;
  loading?: boolean;
}

export default function DashboardView({
  stats,
  recentContacts,
  onViewContact,
  loading = false,
}: DashboardViewProps) {
  const statusColors: Record<Contact["status"], string> = {
    New: "bg-blue-100 text-blue-700",
    Contacted: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-purple-100 text-purple-700",
    Converted: "bg-green-100 text-green-700",
    Closed: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={Users}
          color="blue"
          trend={{ value: 12, isPositive: true }}
          delay={0}
          loading={loading}
        />
        <StatCard
          title="New Inquiries"
          value={stats.newInquiries}
          icon={Mail}
          color="teal"
          trend={{ value: 8, isPositive: true }}
          delay={0.1}
          loading={loading}
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={Briefcase}
          color="purple"
          trend={{ value: 5, isPositive: true }}
          delay={0.2}
          loading={loading}
        />
        <StatCard
          title="Conversion Rate"
          value={`${stats.conversionRate}%`}
          icon={TrendingUp}
          color="gold"
          trend={{ value: 3, isPositive: true }}
          delay={0.3}
          loading={loading}
        />
      </div>

      {/* Performance Metrics */}
      <motion.div
        className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <h3 className="text-lg font-bold text-[#0A2540] mb-6">
          Performance Metrics
        </h3>
        <div className="space-y-4">
          {[
            {
              label: "Response Time",
              value: 85,
              color: "bg-[#1E40AF]",
              target: "< 2 hours",
            },
            {
              label: "Client Satisfaction",
              value: 92,
              color: "bg-[#14B8A6]",
              target: "90%+",
            },
            {
              label: "Project Completion",
              value: 78,
              color: "bg-[#F59E0B]",
              target: "80%+",
            },
            {
              label: "Lead Quality",
              value: 88,
              color: "bg-[#8B5CF6]",
              target: "85%+",
            },
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-[#0A2540]">
                  {metric.label}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#64748B]">
                    {metric.target}
                  </span>
                  <span className="text-sm font-bold text-[#0A2540]">
                    {metric.value}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className={`absolute top-0 left-0 h-full ${metric.color} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{
                    duration: 1,
                    delay: 0.6 + index * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Contacts */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#0A2540]">
                Recent Contacts
              </h3>
              <p className="text-sm text-[#64748B] mt-1">
                Latest inquiries from potential clients
              </p>
            </div>
            <motion.button
              className="text-sm font-medium text-[#1E40AF] hover:underline"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            recentContacts.slice(0, 5).map((contact, index) => (
              <motion.div
                key={contact.id}
                className="p-6 hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                onClick={() => onViewContact(contact)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#1E40AF] to-[#14B8A6] flex items-center justify-center text-white font-bold">
                      {contact.fullName?.charAt(0) || "-"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#0A2540] group-hover:text-[#1E40AF] transition-colors">
                        {contact.fullName || "-"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-[#64748B]">
                          {contact.email || "-"}
                        </p>
                        <span className="text-[#64748B]">•</span>
                        <p className="text-sm text-[#64748B]">
                          {contact.service || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[contact.status]
                      }`}
                    >
                      {contact.status}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-[#64748B]">
                      <Clock size={14} />
                      <span>
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.2 }}
                    >
                      <Eye size={18} className="text-[#1E40AF]" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
