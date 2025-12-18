import { useState } from "react";
import { LazyImage } from "./LazyImage";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    // { name: "Portfolio", path: "/portfolio" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav
      className="bg-white shadow-sm sticky top-0 z-50"
      aria-label="Main navigation"
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center"
            aria-label="ACCIAN home page"
          >
            <LazyImage
              src="/Accian.png"
              alt="ACCIAN Logo"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div
            className="hidden md:flex items-center space-x-8"
            role="navigation"
            aria-label="Desktop navigation menu"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-[#1E40AF]"
                    : "text-[#64748B] hover:text-[#1E40AF]"
                }`}
                aria-current={isActive(link.path) ? "page" : undefined}
                aria-label={`Navigate to ${link.name} page`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="/contact"
              className="btn-primary"
              aria-label="Request consultation"
            >
              Request Consultation
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-[#64748B] hover:text-[#1E40AF] hover:bg-[#F8FAFC]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            id="mobile-menu"
            className="md:hidden py-4 space-y-4"
            role="navigation"
            aria-label="Mobile navigation menu"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`block py-2 transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-[#1E40AF]"
                    : "text-[#64748B] hover:text-[#1E40AF]"
                }`}
                onClick={() => setIsMenuOpen(false)}
                aria-current={isActive(link.path) ? "page" : undefined}
                aria-label={`Navigate to ${link.name} page`}
              >
                {link.name}
              </Link>
            ))}
            <a
              href="/contact"
              className="btn-primary inline-block"
              aria-label="Request consultation"
              onClick={() => setIsMenuOpen(false)}
            >
              Request Consultation
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
