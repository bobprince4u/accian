"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) {
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
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
      <div className="bg-[#0D0D0D] border border-white/10 text-white rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-1">
            Cookie Notice
          </p>
          <p className="text-sm font-light text-white/60 leading-relaxed">
            We use cookies to enhance your experience. By continuing, you agree
            to our{" "}
            <a
              href="/privacy-policy"
              className="text-white underline underline-offset-2 hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={declineCookies}
            className="bg-white/8 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="bg-blue-600 hover:opacity-85 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-opacity duration-200"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
