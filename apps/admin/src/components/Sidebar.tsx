import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Menu,
  X,
  Bell,
  Settings,
  Star,
  Wrench,
  LogOut,
} from "lucide-react";
import { ViewType } from "../types";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  newInquiriesCount: number;
  onLogout?: () => void;
}

function SidebarContent({
  currentView,
  onViewChange,
  newInquiriesCount,
  onLogout,
}: SidebarProps) {
  const menuItems = [
    { id: "dashboard" as ViewType, label: "Dashboard", icon: LayoutDashboard },
    {
      id: "contacts" as ViewType,
      label: "Contacts",
      icon: Users,
      badge: newInquiriesCount,
    },
    { id: "projects" as ViewType, label: "Projects", icon: Briefcase },
    { id: "services" as ViewType, label: "Services", icon: Wrench },
    { id: "testimonials" as ViewType, label: "Testimonials", icon: Star },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <motion.div
        className="p-6 border-b border-white/10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <img
          src="/Accian.png"
          alt="ACCIAN Logo"
          className="w-30 h-20 object-contain"
        />
        <p className="text-xs text-white/70">Admin Panel</p>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <motion.button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#1E40AF] shadow-lg"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <motion.span
                  className="ml-auto bg-[#F59E0B] text-white text-xs font-bold px-2 py-1 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <motion.button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Bell size={20} />
          <span className="font-medium">Notifications</span>
        </motion.button>
        <motion.button
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200"
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </motion.button>
        {onLogout && (
          <motion.button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default function Sidebar({
  currentView,
  onViewChange,
  newInquiriesCount,
  onLogout,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Toggle Button */}
      <motion.button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-linear-to-br from-[#0A2540] to-[#1E40AF] text-white rounded-lg shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden lg:block w-64 bg-linear-to-br from-[#0A2540] to-[#1E40AF] h-screen sticky top-0 shadow-2xl"
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <SidebarContent
          currentView={currentView}
          onViewChange={onViewChange}
          newInquiriesCount={newInquiriesCount}
          onLogout={onLogout}
        />
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
            />
            <motion.aside
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-linear-to-br from-[#0A2540] to-[#1E40AF] z-50 shadow-2xl"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{
                duration: 0.3,
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              <SidebarContent
                currentView={currentView}
                onViewChange={onViewChange}
                newInquiriesCount={newInquiriesCount}
                onLogout={onLogout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
