# ACCIAN website redesign review

## Audit and scope

The public site is Next.js 16 / React 19 / Tailwind 4 in `apps/web`, independently deployed to Netlify. Admin (Vite) and API (Express/PostgreSQL) remain separate applications. The public API URL is supplied through `NEXT_PUBLIC_API_URL`, required in production. Existing security headers, middleware and Netlify settings are preserved.

No `AGENTS.md` was found in the repository tree. UI/UX Pro Max guidance was generated and reviewed; the project-specific decisions and the raw recommendations are in [the design direction](design-system/accian/MASTER.md).

The existing logo is a black ACCIAN wordmark with a blue/violet angular mark. Existing cream, ink and blue provide a usable identity. The old presentation overused rounded cards, icon tiles, decorative glow, heavy headings, repeated grids and static performance claims without source evidence. Homepage metadata and research metadata also described inconsistent business scopes.

Existing functionality worth keeping:

- API-fed service summaries, project summaries and testimonials.
- Static detailed services and deep links, including the existing training and social care services.
- Business enquiry submission, validation, service query prefilling, draft-cookie preference and response handling.
- Seven research-information steps plus review, shared support/document contracts, document rules and upload submission.
- Accessible mobile navigation behaviour, skip link, reduced-motion support, legal route and staff-area gate.

## Design decisions

Keep the existing logo and palette; use regular Georgia headings, restrained italic emphasis and Arial body text. Both are system fonts. Remove the Google font download dependency. Use an editorial grid, small numbered labels, rules and deliberate changes in section composition. Avoid introducing stock imagery or generated graphics that imply a team, project or capability the source material does not establish.

The homepage introduces two audiences immediately. Business visitors can explore consulting, software and data or enquire. Research applicants can understand the application guidance and enter the existing pre-consultation flow. About remains a real homepage section rather than a new thin route. Services retain their existing anchors and enquiry values, with core technology services ordered first. The service detail page now uses readable service lists instead of repeated image/card layouts, generic industry grids and unsupported timeline comparisons.

Static homepage metrics are removed. Published testimonials and projects still come from their original endpoints. Research wording makes clear that applicants develop their own proposals and universities control admission and awards. The research timeline no longer claims a typical outcome without supporting evidence.

Shared styling covers the homepage, business services, research support, contact, pre-consultation and privacy pages. The backend, API contracts, dependencies, deployment configuration and internal tools were not rewritten.

## Verification

- `npm run lint:web`: passed.
- `npm run test:web`: passed all 3 existing test files, covering contact, pre-consultation and the internal-area boundary.
- `NEXT_PUBLIC_API_URL=https://api.accian.co.uk npm run build:web`: production build and TypeScript passed. The sandbox initially prevented Turbopack from opening a local compiler port; the unrestricted rerun succeeded.
- `npm run guards`: all repository architecture and security-header guards passed.
- `git diff --check`: passed.
- Headless Chrome inspected all six public routes at 375, 768, 1024 and 1440px. No page-level horizontal overflow, missing main landmarks or broken local anchors were found. Each route has one H1.
- Mobile menu opening, Escape dismissal and focus return passed.
- Empty business enquiry validation exposed four invalid required fields. No enquiry was sent.
- The software-development service query selected the correct enquiry option.
- No uncaught browser runtime exceptions were observed in the checked routes.
- Emulated reduced-motion preference matched and the document used `scroll-behavior: auto`.
- Desktop and mobile screenshots were reviewed. Mobile heading spacing, footer contact layout, form corner radii and content alignment were refined following inspection.

## Practical limits

The local preview could not load live services, projects or testimonials. Loading/error/retry states were checked, and the static service pathways remain usable. Successful live API responses and real enquiry/upload delivery were not exercised. This does not establish whether the cause was localhost CORS policy, connectivity or the live API; deployment should be smoke-tested against the configured API origin.

Company registration details and contact information are retained from the repository rather than newly certified against an external registry. No new client, qualification, partnership or performance claims were added. No deployment was performed.
