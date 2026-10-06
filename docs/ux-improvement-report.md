# ACCIAN public website UX improvement report

Date: 6 October 2026. Baseline: `02401c24`. Changes are local and uncommitted.
The six existing public routes and existing cream/ink/blue design are retained.
No API, database, authentication, email, dependency or deployment files changed.

## 1–3. Audit, major problems and implemented improvements

The before-change audit and prioritised plan are in [ux-audit-and-plan.md](ux-audit-and-plan.md).
The homepage hid its service proposition behind a large marketing hero; the
research application route was difficult to find; navigation crowded tablet
widths; footer links included placeholders; repeated reveals hid content;
FAQ controls lacked keyboard semantics; forms offered inconsistent recovery.

| Problem | Change | User benefit |
|---|---|---|
| Homepage did not quickly explain the offering | Concrete technology/research headline, audience pathways and restrained CTAs | Choose a relevant service without interpreting slogans |
| Research page and form felt disconnected | Prominent existing pre-consultation route throughout navigation, research page and footer | Reach the application directly |
| Service cards lacked useful context | Description, actual features, detail anchors, audience context and contextual enquiry links | Understand what to ask about and retain service selection |
| Comparison contained placeholder investment values | Scope guidance and relevant next actions; mobile comparison cards | Compare services without misleading pricing |
| Trust presentation mixed decorative numbers with evidence | Company facts replace decorative security graph and hero metrics; ratings use stored values; existing projects API integrated | Read real evidence and see truthful empty states |
| Navigation crowded tablet widths and menu was hard to dismiss | Desktop at 1024px, clear active states, Escape/outside/navigation closing and focus restoration | Predictable navigation across screen sizes |
| Footer had dead links and an unnamed staff link | Real service/company/research/legal links, email/phone actions and named staff quote builder | Find useful destinations without dead ends |
| Contact confirmation disappeared and reference was lost | Persistent confirmation and existing server reference; explicit reset action | Retain proof of the enquiry |
| Contact failures and stored drafts could disrupt completion | Safe parsing, consent-based drafts, field-linked errors, preserved inputs and safe recovery messages | Fix mistakes without losing an enquiry |
| Research form progress was cramped | Named step status, progress bar, mobile section selector and reachable review step | Understand and navigate seven sections plus review |
| Attachment errors arrived late; excess files disappeared silently | Existing file validation runs immediately; explicit count feedback; accessible removal controls | Correct uploads before submission |
| Editing/navigation remained possible while submitting | Pending fieldset and navigation disabled; duplicate submit guard | Keep answers consistent with the submitted request |
| Content relied on repeated reveal hooks | Shared visible-by-default restrained reveal and native FAQ disclosures | Read content immediately and use FAQs by keyboard |
| Low contrast, missing skip link and nested main landmarks | Stronger text contrast, one main landmark, skip link, visible focus and reduced motion | Easier reading and assistive navigation |

## 4. Pages changed

- `/`: value proposition, audience pathways, services, about/company evidence,
  research CTA, actual testimonial ratings, project summaries and data states.
- `/services`: purpose, quick navigation, audience context, service enquiry
  preselection, comparison, native FAQs and optional background media.
- `/research-support`: concise heading, connected application pathway,
  document/process expectations and native FAQs; existing business process retained.
- `/pre-consultation`: shorter readiness information, progress/navigation,
  upload feedback, pending protection, safe failures and privacy guidance.
- `/contact`: required/optional cues, accessible validation, draft safety,
  service preselection, direct contact links and stable success reference.
- `/privacy-policy`: layout, readable text, mobile cards and accessible jump links;
  existing legal substance and update date retained.

About and Projects are homepage sections with real anchors. No duplicate routes
were added. The protected internal quote builder remains available and protected.

## 5. Shared components changed

Navigation, Footer, CookieBanner, LazyImage, ServiceCard, ProgressIndicator,
FileUpload, TextField, TextareaField, RadioGroup, CheckboxGroup, ReviewSection,
SubmissionSuccess and global styles. Added shared Reveal and native FaqItem,
optional BackgroundVideo, existing-API ProjectHighlights, and a tested contact
submission/validation helper. No new UI framework or project dependency.

## 6–10. Mobile, accessibility, performance, SEO and forms

Mobile: compact typography/spacing; navigation remains mobile through tablet;
responsive service comparison; compact research progress selector; controls
and key links generally 44px; cards/footer wrap; fields use 16px text to avoid
mobile focus zoom. Nine requested widths are covered by browser verification.

Accessibility: semantic disclosures, labelled navigation, one main/h1 per public
route, skip link, visible focus, named current steps, required/optional cues,
inline errors associated with inputs, focused error summary, focusable grouped
fields, native disabled states and reduced-motion handling. Automated axe checks
supplement keyboard and visual review; they do not establish complete WCAG compliance.

Performance: Services, Research Support and Privacy Policy no longer require
page-wide client reveal/FAQ hooks. Icon lookup uses a finite map. Content is
visible before JavaScript; lazy images reserve dimensions and have a useful
failure fallback. Services media uses the correct existing poster, deferred
preload, pause control and reduced-motion/data-saving handling. User pause is
preserved across visibility changes. No measured Core Web Vitals claim is made.

SEO: page-specific metadata, canonical URLs, Open Graph on key public pages,
metadata base and consistent non-www sitemap. Research application remains
noindex and outside the sitemap; internal paths are excluded in robots.

Forms: existing endpoints, security fields, JSON/multipart formats, business
fields, upload limits and backend behavior retained. Contact keeps existing
acceptance of short/international names. Required fields have inline guidance;
optional fields remain optional. Successful responses require an actual reference.
Proxy/provider failures never appear verbatim. Research answers/files remain in
memory after recoverable failures, with explicit advice to keep the tab open.
Contact failure guidance advises emailing before a potentially duplicate resend.
Browser submissions use intercepted fixtures, never production writes or emails.

## 11–12. Validation

- Web tests: 81 passed; admin: 19 passed; API: 189 passed. Total 289, zero failures/skips.
- TypeScript: web, admin and API no-emit checks passed.
- ESLint: web and admin passed.
- Production API build passed; architecture guards: all 11 passed.
- Initial browser matrix: six public routes × nine widths (54 cases), all HTTP 200,
  no horizontal page overflow or broken images; one main and h1 per route;
  no uncaught page errors. Initial axe found contrast issues, subsequently corrected.
- Browser interaction checks verify menu dismissal/focus, keyboard FAQs,
  service preselection, required-field feedback, safe failures, persistent contact
  success, immediate upload errors, attachment retention, declaration/review,
  disabled pending controls and reference confirmation.

Final production web build passed with Next.js 16.2.0/Turbopack. The first
sandboxed attempt failed to download the existing Google font; the authorised
network-enabled rerun passed without changing font or build configuration.

Final production browser matrix: all 54 cases passed at 320, 360, 375, 390, 430,
768, 1024, 1280 and 1440px. No page overflow, uncaught page errors or console
errors. Every route has one main landmark and h1. Axe WCAG 2 A/AA and 2.1 AA
checks reported zero violations on all six routes at 390/1440px, plus the
research review and 320px cookie-preference states. These are automated results,
not a WCAG compliance certification.

All 200 rendered internal link instances resolve to actual routes and anchors;
the staff route is an intentional protected destination. Sixteen production-build
interaction checks and six focused checks passed. Every research section plus
review fits 320px. Tests cover cookie decline, skip-link focus, reduced-motion
video/reveals, malformed draft recovery, and mobile section selection.
All six images (logo plus five service images) loaded after scrolling at both
390px and 1440px. Lazy images were checked after entering the viewport, rather
than relying only on initial viewport screenshots.
Four browser form POSTs were mocked locally (two per form); none reached the API.

Browser evidence and screenshots are available in `/tmp/accian-ux-tools/`:
`production-browser-results.json`, `interactions-results.json`,
`extras-results.json`, `media-results.json` and `screenshots/`.
The reproducible local test scripts are in the same directory; temporary browser
dependencies were installed there without changing repository dependencies.

## 13. Remaining issues and practical limits

- Existing statistics, credentials, regional coverage, response-time promises and
  privacy/legal statements require company owner confirmation. No new claims were
  introduced. Some existing lower-page metrics and trust text remain.
- Homepage service summaries use API content while Services uses existing static
  detail content. Publishing changes can drift; this change preserves the architecture.
- Published project fixtures were empty. The section truthfully states that no
  projects are published rather than inventing case studies.
- Research answers/files do not persist after closing or refreshing the tab;
  the UI explains this. Durable draft storage would require a separate privacy design.
- Contact API declares express-validator rules but its controller does not consume
  validationResult; the backend validation gap is outside this frontend scope.
- Production email delivery, external social-account ownership, hosting, analytics
  conversion rates and physical-device/assistive-technology coverage were not certified.
- Automated accessibility checks cannot replace user testing or a complete human audit.

## 14. Recommended next work

1. Have the company owner substantiate existing numeric claims, credentials,
   response times and legal/privacy wording.
2. Publish approved real projects/outcomes and keep service details aligned with
   the admin-published summaries.
3. Review the contact controller validation gap as a separate backend change.
4. Conduct moderated mobile research-application testing and screen-reader testing
   on actual devices; measure production field drop-off and Core Web Vitals before
   deciding on further changes.
5. Consider explicit private research drafts only if applicants need to return later,
   after agreeing storage, retention and consent requirements.

No commit, push, merge, rebase, reset or deployment was performed.
