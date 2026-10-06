# ACCIAN public website — UX audit and implementation plan

Date: 6 October 2026. Baseline: clean `master` at `02401c24`.
Scope: public web only; existing cream/ink/blue design, routes, data contracts,
backend, authentication, deployment, and dependencies retained.

## Current experience

Six public routes: `/`, `/services`, `/research-support`, `/pre-consultation`,
`/contact`, `/privacy-policy`. About/company content is on the homepage. There
are no separate About, Projects, or Case Studies routes. The protected quote
builder is `/internal/quote-builder`; its authentication boundary remains intact.

Homepage reads services/testimonials from the API; Services uses existing static
detailed content. Research Support uses shared support/document definitions.
Pre-consultation has seven grouped steps plus review, multipart uploads, validation,
focus/error summaries, and in-memory answers. Contact posts the existing JSON
contract and uses optional consent-based cookie drafts and browser submission
tracking. API/email/database behavior is outside this change.

## Highest-impact findings

| Problem | Planned change | Visitor benefit |
|---|---|---|
| Full-screen homepage hero emphasises numeric claims over service selection | Concise value statement; technology/research pathways | Understand the company and choose a relevant next step |
| Research form is absent from primary navigation/footer | Connect research and pre-consultation using actual routes | Find the form without searching |
| Desktop navigation starts at 768px and crowds tablet widths | Wider breakpoint; keyboard/Escape/outside-close mobile menu | Readable links and predictable mobile interaction |
| Footer has placeholder social/legal links and missing service targets | Real links only; repair anchors; named internal tool link | Avoid dead ends |
| Multiple nested main landmarks; no skip link | One main landmark and skip navigation | Faster keyboard/screen-reader navigation |
| Repeated scroll-reveal logic hides content initially | Shared restrained reveal with visible default and reduced motion | Content remains readable without animation/JavaScript |
| Services FAQ is a clickable div with clipped max-height | Shared native disclosure | Keyboard access and answers of any length |
| Small low-contrast text and inconsistent controls | Shared focus, type/spacing, touch-target and form styles | Readability and reliable interaction |
| Homepage retry never clears its previous error | Reset request states; useful empty/loading/error states | Recover from temporary failures |
| Testimonials display five stars regardless of stored rating | Render only the actual rating | Accurate evidence |
| No public project presentation in current homepage | Existing project API summaries in a homepage section | See real work when available, without invented examples |
| Contact confirmation disappears in three seconds; reference discarded | Persistent confirmation with server reference and next action | Know what happened and retain the reference |
| Contact storage parsing can crash; failures are generic | Guard storage; safe failure guidance and preserved inputs | Recover without losing the enquiry |
| Contact field requirements/privacy and direct contact options unclear | Required/optional cues, linked privacy, phone/email actions | Confident form completion |
| Form progress needs horizontal scrolling and lacks current-step context | Compact mobile status and reachable-step selection | Know where you are and return to previous answers |
| Uploads silently truncate excess files; errors wait until navigation | Immediate existing file validation and explicit count feedback | Fix attachments before submission |
| Submission allows navigation/editing while sending | Disable form navigation during pending request | Avoid mismatched confirmation and duplicate actions |
| Duplicate/incomplete page metadata; sitemap uses inconsistent host | Page-specific metadata/canonicals and consistent sitemap | Clear search/link previews |
| Decorative services video points to missing poster and downloads early | Correct poster, defer video; respect motion/data preferences | Faster, calmer first view |

## Implementation sequence

1. Shared reveal/disclosures, focus/reduced motion, field/control styles and page shell.
2. Navigation/footer and real internal links.
3. Homepage clarity, research pathway, real data states and evidence.
4. Services/research purpose, comparisons, anchors, process and next actions.
5. Contact/pre-consultation validation, progress, uploads and stable confirmation.
6. Responsive, accessibility, metadata, loading/error and media verification.

## Verification

Run web/admin/API tests, TypeScript checks, lint, production web/API builds and
architecture guards. Verify all public routes at 320, 360, 375, 390, 430, 768,
1024, 1280 and 1440px with a local browser; keyboard navigation/menu/FAQ; mock API
loading/empty/failure/retry; form validation/upload/review and controlled mocked
success. Browser POST requests must be intercepted, never sent to production.
Use screenshots and accessibility checks; record any real remaining limitation.
Existing claims/statistics, regional coverage, response-time promises and legal
copy require owner confirmation; do not invent or strengthen them. The services
static/API split remains a documented content-maintenance concern.
