import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { SignupForm } from "../components/SignupForm";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import { getAccessToken } from "../services/apiClient";

export default function LoginPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [showSignup, setShowSignup] = useState(false);
  const [allowSignup, setAllowSignup] = useState(true); // controls Sign Up button visibility

  useEffect(() => {
    const token = getAccessToken();
    const accountCreated = localStorage.getItem("adminAccountCreated");

    if (token) {
      navigate("/AdminDashboard");
      return;
    }

    // Defer state update to avoid cascading render warning
    if (accountCreated) {
      setTimeout(() => {
        setAllowSignup(false); // hide Sign Up button permanently
      }, 0);
    }

    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSignupSuccess = () => {
    // Mark that an admin account has been created
    localStorage.setItem("adminAccountCreated", "true");
    setShowSignup(false);
    setAllowSignup(false); // permanently hide Sign Up button
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <motion.div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <AnimatePresence mode="wait">
            {showSignup ? (
              <SignupForm
                key="signup"
                onSuccess={handleSignupSuccess}
                onBackToLogin={() => setShowSignup(false)}
              />
            ) : (
              <LoginForm
                key="login"
                onSuccess={() => navigate("/AdminDashboard")}
                onSignupClick={() => setShowSignup(true)}
                allowSignup={allowSignup} // pass the flag to LoginForm
              />
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
