// src/components/CookieBanner.tsx
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) {
      // Wrap in setTimeout to avoid synchronous state update
      setTimeout(() => setVisible(true), 0);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set("cookie_consent", "true", { expires: 365 });
    setVisible(false);
  };

  const declineCookies = () => {
    Cookies.set("cookie_consent", "false", { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1E40AF] text-white p-4 rounded-md shadow-md max-w-lg w-full z-50 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p className="text-sm">
        We use cookies to enhance your experience. By continuing, you agree to
        our Privacy Policy.
      </p>
      <div className="flex gap-2">
        <button
          onClick={declineCookies}
          className="bg-gray-300 text-black px-3 py-1 rounded-md text-sm"
        >
          Decline
        </button>
        <button
          onClick={acceptCookies}
          className="bg-white text-[#1E40AF] px-3 py-1 rounded-md text-sm"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
