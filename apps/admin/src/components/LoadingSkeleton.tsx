import { motion } from "framer-motion";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Skeleton */}
        <div className="text-center mb-8">
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-16 w-32 bg-slate-200 rounded-lg mx-auto mb-4"
          />
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.1,
            }}
            className="h-6 w-48 bg-slate-200 rounded mx-auto"
          />
        </div>

        {/* Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title Skeleton */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
            className="h-8 w-40 bg-slate-200 rounded mb-8"
          />

          {/* Email Field Skeleton */}
          <div className="mb-6">
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
              }}
              className="h-4 w-16 bg-slate-200 rounded mb-2"
            />
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.4,
              }}
              className="h-12 w-full bg-slate-200 rounded-lg"
            />
          </div>

          {/* Password Field Skeleton */}
          <div className="mb-6">
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="h-4 w-20 bg-slate-200 rounded mb-2"
            />
            <motion.div
              animate={{
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
              className="h-12 w-full bg-slate-200 rounded-lg"
            />
          </div>

          {/* Remember Me Skeleton */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.7,
            }}
            className="h-5 w-32 bg-slate-200 rounded mb-6"
          />

          {/* Button Skeleton */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.8,
            }}
            className="h-12 w-full bg-slate-200 rounded-lg mb-4"
          />

          {/* Link Skeleton */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.9,
            }}
            className="h-4 w-36 bg-slate-200 rounded mx-auto"
          />
        </div>

        {/* Footer Skeleton */}
        <motion.div
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="h-4 w-56 bg-slate-200 rounded mx-auto mt-6"
        />
      </div>
    </div>
  );
}
