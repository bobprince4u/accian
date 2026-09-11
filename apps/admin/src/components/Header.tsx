import { motion } from "framer-motion";
import { Search, Bell, User, ChevronDown } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <motion.header
      className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30 shadow-sm"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-2xl font-bold text-[#0A2540]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-sm text-[#64748B] mt-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <motion.div
            className="hidden md:flex items-center gap-2 bg-[#F8FAFC] px-4 py-2 rounded-lg border border-gray-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
          >
            <Search size={18} className="text-[#64748B]" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-48"
            />
          </motion.div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 hover:bg-[#F8FAFC] rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} className="text-[#64748B]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#F59E0B] rounded-full"></span>
          </motion.button>

          {/* User Profile */}
          <motion.button
            className="flex items-center gap-2 hover:bg-[#F8FAFC] px-3 py-2 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 bg-linear-to-br from-[#1E40AF] to-[#14B8A6] rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <span className="hidden md:block text-sm font-medium text-[#0A2540]">
              Admin
            </span>
            <ChevronDown size={16} className="hidden md:block text-[#64748B]" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
