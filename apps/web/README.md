# ACCIAN Limited — Frontend

![ACCIAN Logo](public/Accian.png)

A modern, responsive web application for ACCIAN Limited, showcasing IT consulting, cybersecurity, software development, education & training, and social care services.

## Live Demo

**Production:** [https://accian.co.uk](https://accian.co.uk)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

ACCIAN's frontend is a modern, performant web platform built with **Next.js 16** and **TypeScript**. Migrated from a Vite + React SPA, the application now uses the Next.js App Router for file-based routing, server components, and built-in font optimisation.

### Key Sections

- **Public Website** — Services, global presence, testimonials, and company information
- **Contact System** — Client inquiry submission with validation, rate limiting, and email notifications
- **Services Page** — Detailed service descriptions, industry coverage, process steps, and FAQs

---

## Features

- ** Modern UI/UX** — Redesigned editorial aesthetic with Poppins typography and a warm cream/ink palette
- ** Scroll Animations** — Intersection Observer-based reveal animations with staggered delays throughout
- ** Animated Cards** — Hover lift, colour transitions, and shadow effects on all interactive cards
- ** Fully Responsive** — Optimised for desktop, tablet, and mobile devices
- ** Fast Performance** — Next.js App Router with self-hosted Google Fonts (zero layout shift)
- ** Accessibility** — WCAG 2.1 compliant with proper ARIA labels and roles
- ** SEO Optimised** — `<Metadata>` API in `layout.tsx` for title, description, and structured data
- ** Contact Form** — Full validation, country code selector, rate limiting, and cookie persistence
- ** Image Skeletons** — Pulse + shimmer loading states on service images
- ** Security Headers** — CSP, HSTS, X-Frame-Options, and Permissions-Policy via `next.config.ts`
- ** Marquee Ticker** — Animated service keyword strip between hero and services sections
- ** Cookie Banner** — GDPR-compliant cookie consent with `js-cookie` persistence

---

## 🛠 Tech Stack

### Core

| Technology | Version | Purpose                             |
| ---------- | ------- | ----------------------------------- |
| Next.js    | 16      | App Router, SSR, file-based routing |
| React      | 19      | UI library                          |
| TypeScript | 5.9     | Type safety                         |

### Styling

| Technology                 | Purpose                  |
| -------------------------- | ------------------------ |
| Tailwind CSS v4            | Utility-first styling    |
| `@tailwindcss/postcss`     | PostCSS integration      |
| Poppins (next/font/google) | Self-hosted display font |

### Libraries

| Library         | Purpose             |
| --------------- | ------------------- |
| Axios           | API requests        |
| Lucide React    | Icon library        |
| React Hot Toast | Toast notifications |
| js-cookie       | Cookie management   |

---

## 🚦 Getting Started

### Prerequisites

- Node.js v18 or higher
- npm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/accian-frontend.git
   cd accian-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create environment file**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:2025
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   - **Public Site:** `http://localhost:3000`

---

## Project Structure

```
accian/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout (Navigation, Footer, Poppins font)
│   ├── globals.css             # Global styles, Tailwind, custom components
│   ├── page.tsx                # / — Home page
│   ├── services/
│   │   └── page.tsx            # /services
│   ├── contact/
│   │   └── page.tsx            # /contact
│   └── privacy-policy/
│       └── page.tsx            # /privacy-policy
│
├── components/                 # Shared components
│   ├── Navigation.tsx          # Sticky nav with active route detection
│   ├── Footer.tsx              # Site footer
│   ├── CookieBanner.tsx        # GDPR cookie consent banner
│   ├── ServiceCard.tsx         # Service card with dynamic Lucide icon
│   ├── LazyImage.tsx           # Lazy-loaded image component
│   └── Skeletons.tsx           # Pulse skeleton components
│
├── data/                       # Static data
│   ├── HomPageData.ts          # trustIndicators, stats, MARQUEE_ITEMS
│   └── ServicesMock.ts         # detailedServices, industries, comparisonData, processSteps, faqs
│
├── config/
│   └── api.ts                  # NEXT_PUBLIC_API_URL export
│
├── lib/
│   └── utils.ts                # cn() Tailwind class merge utility
│
├── types/                      # Shared TypeScript interfaces
│   └── index.ts
│
├── public/                     # Static assets (served at /)
│   ├── Accian.png              # Logo
│   ├── images/
│   │   └── hero-poster.jpg
│   └── videos/
│       └── hero.mp4
│
├── next.config.ts              # Security headers, Next.js config
├── postcss.config.mjs          # Tailwind PostCSS plugin
├── tsconfig.json               # TypeScript config
├── netlify.toml                # Netlify deployment config
├── .env.local                  # Local environment variables (not committed)
├── .env.example                # Environment variable template
└── package.json
```

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api.accian.co.uk
```

> **Note:** In Next.js, environment variables exposed to the browser **must** be prefixed with `NEXT_PUBLIC_`. Variables without this prefix are server-only.

---

## Available Scripts

```bash
npm run dev        # Start development server (webpack, no Turbopack)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

---

## Deployment

### Netlify

This project is deployed on Netlify using the official Next.js plugin.

1. **Install the Netlify Next.js plugin**

   ```bash
   npm install -D @netlify/plugin-nextjs
   ```

2. **Ensure `netlify.toml` exists at the project root**

   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Set environment variables in Netlify dashboard**

   Go to **Site Settings → Environment Variables** and add:

   ```
   NEXT_PUBLIC_API_URL = https://api.accian.co.uk
   ```

4. **Push to GitHub — Netlify auto-deploys on every push**

   ```bash
   git add .
   git commit -m "your message"
   git push origin master
   ```

---

## Migration Notes (Vite → Next.js)

| Before (Vite + React)      | After (Next.js)                  |
| -------------------------- | -------------------------------- |
| `react-router-dom`         | `next/link` + file-based routing |
| `import.meta.env.VITE_*`   | `process.env.NEXT_PUBLIC_*`      |
| `src/main.tsx` entry point | `app/layout.tsx`                 |
| `BrowserRouter / Routes`   | `app/` directory structure       |
| `vite.config.ts`           | `next.config.ts`                 |
| Google Fonts via `@import` | `next/font/google` (self-hosted) |
| `dist/` build output       | `.next/` build output            |
| Publish directory: `dist`  | Publish directory: `.next`       |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use TypeScript for all components
- Keep page files to default exports only (Fast Refresh compliance)
- Move constants and data to `data/` or `lib/` — never export them from page files
- Add `"use client"` to any component using `useState`, `useEffect`, or browser APIs
- Follow the existing Tailwind class naming patterns

---

## License

This project is proprietary and confidential. Unauthorised copying, distribution, or use is strictly prohibited.

Copyright © 2025 ACCIAN Limited. All rights reserved.

---

## 📞 Contact

**ACCIAN Limited**

- Website: [https://accian.co.uk](https://accian.co.uk)
- Email: info@accian.co.uk
- Phone: +44 7749 101623

---

_Built with ❤️ by ACCIAN Limited_
