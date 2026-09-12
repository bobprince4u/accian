import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
  delay?: number;
  loading?: boolean;
}

const SkeletonLoader = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
    <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-20"></div>
  </div>
);

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color,
  delay = 0,
  loading = false,
}: StatCardProps) {
  const colorClasses: Record<
    string,
    { bg: string; icon: string; trend: string }
  > = {
    blue: {
      bg: "from-[#1E40AF] to-[#3B82F6]",
      icon: "bg-[#1E40AF]/10 text-[#1E40AF]",
      trend: "bg-[#1E40AF]/10 text-[#1E40AF]",
    },
    teal: {
      bg: "from-[#14B8A6] to-[#10B981]",
      icon: "bg-[#14B8A6]/10 text-[#14B8A6]",
      trend: "bg-[#14B8A6]/10 text-[#14B8A6]",
    },
    gold: {
      bg: "from-[#F59E0B] to-[#FBBF24]",
      icon: "bg-[#F59E0B]/10 text-[#F59E0B]",
      trend: "bg-[#F59E0B]/10 text-[#F59E0B]",
    },
    purple: {
      bg: "from-[#8B5CF6] to-[#A78BFA]",
      icon: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
      trend: "bg-[#8B5CF6]/10 text-[#8B5CF6]",
    },
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
    >
      {/* Gradient Background Effect */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${colors.bg} opacity-5 rounded-full -mr-16 -mt-16`}
      ></div>

      <div className="relative">
        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-[#64748B]">{title}</p>
              <motion.div
                className={`p-2 rounded-lg ${colors.icon}`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Icon size={20} />
              </motion.div>
            </div>

            <motion.h3
              className="text-3xl font-bold text-[#0A2540] mb-2"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: delay + 0.2,
                type: "spring",
                stiffness: 200,
              }}
            >
              {value}
            </motion.h3>

            {trend && (
              <motion.div
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  trend.isPositive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: delay + 0.3 }}
              >
                {trend.isPositive ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                <span>{Math.abs(trend.value)}%</span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
