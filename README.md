# ACCIAN UK Limited - Frontend

![ACCIAN Logo](public/Accian.png)

A modern, responsive web application for ACCIAN UK Limited, showcasing IT consulting, software development, education & training, and social care services.

## 🚀 Live Demo

**Production:** [https://accian.co.uk](https://accian.co.uk)  
**Admin Panel:** [https://accian.co.uk/admin](https://accian.co.uk/admin)

## 📋 Table of Contents

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

## 🎯 Overview

ACCIAN's frontend application is a modern, performant web platform built with React and TypeScript. The application provides information about our services, allows clients to submit inquiries, showcases our expertise in technology consulting and software development, and includes a secure admin dashboard for managing business operations.

### Key Sections

- **Public Website** - Showcasing services, testimonials, and company information
- **Contact System** - Client inquiry submission with email notifications
- **Admin Dashboard** - Secure portal for managing contacts, content, and analytics

## ✨ Features

- **🎨 Modern UI/UX Design** - Clean, professional interface with smooth animations
- **📱 Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **⚡ Fast Performance** - Optimized loading with lazy loading and code splitting
- **♿ Accessibility** - WCAG 2.1 compliant with proper ARIA labels
- **🔍 SEO Optimized** - Meta tags and structured data for better search visibility
- **📧 Contact Form** - Easy-to-use form with validation and email notifications
- **🎭 Lazy Loading** - Images and components load on demand for better performance
- **🌐 Multi-page Navigation** - Smooth client-side routing with React Router
- **💼 Services Showcase** - Dynamic display of company services
- **⭐ Testimonials** - Client feedback and success stories
- **🔐 Admin Dashboard** - Secure admin panel for managing content and inquiries
- **📊 Analytics Dashboard** - View statistics and monitor business metrics
- **✉️ Contact Management** - Review and manage client inquiries
- **🔒 Authentication** - JWT-based secure login system

## 🛠 Tech Stack

### Core Technologies

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend tooling
- **React Router DOM** - Client-side routing

### Styling & UI

- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Modern icon library

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

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
   cp .env.example .env
   ```

4. **Configure environment variables**

   ```env
   VITE_API_URL=http://localhost:2025
   ```

5. **Start development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   - **Public Site:** `http://localhost:5173`
   - **Admin Panel:** `http://localhost:5173/admin`

### Admin Access

For admin dashboard access, you'll need credentials from the backend. Default login route:

- URL: `/admin/login`
- Credentials are managed through the backend API

## 📁 Project Structure

```
accian-frontend/
├── public/                 # Static assets
│   ├── Accian.png         # Company logo
│   └── ...
├── src/
│   ├── components/        # Reusable components
│   │   ├── Navigation.tsx
│   │   ├── Footer.tsx
│   │   ├── LazyImage.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── ServicesPage.tsx
│   │   ├── ContactPage.tsx
│   │   ├── admin/        # Admin panel pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Contacts.tsx
│   │   │   └── ...
│   │   └── ...
│   ├── config/           # Configuration files
│   │   └── api.ts        # API configuration
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables (not committed)
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.js    # Tailwind config
└── README.md            # This file
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=https://api.accian.co.uk

# Optional: Analytics (if implemented)
# VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

> **Note:** All environment variables must be prefixed with `VITE_` to be accessible in the application.

## 📜 Available Scripts

### Development

```bash
npm run dev          # Start development server
```

### Production

```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🚀 Deployment

### Netlify (Recommended)

1. **Push code to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**

   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your repository

3. **Configure build settings**

   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set environment variables**

   - Go to Site settings → Environment variables
   - Add `VITE_API_URL` with your API URL

5. **Deploy**
   - Netlify will automatically build and deploy
   - Your site will be live at `https://your-site.netlify.app`

### Manual Deployment

```bash
# Build the project
npm run build

# The dist/ folder contains the production build
# Upload contents to your web server
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Use TypeScript for all new components
- Write meaningful commit messages
- Add comments for complex logic
- Ensure accessibility standards are met

## 📝 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

Copyright © 2025 ACCIAN Uk Limited. All rights reserved.

## 📞 Contact

**ACCIAN Nigeria Limited**

- Website: [https://accian.co.uk](https://accian.co.uk)
- Email: admin@acciannginfo.com
- Phone: +44 7749 101623

## 🙏 Acknowledgments

- Design inspiration from modern web standards
- Built with modern web technologies
- Optimized for performance and accessibility

---

**Built with ❤️ by ACCIAN UK Limited**
