# ACCIAN animation restoration report

Date: 6 October 2026. Scope: public frontend only. No commit, push, merge, rebase, reset, deployment, or Git-history rewrite was performed.

## History and reason for the reduction

Compared UX commit `bf012368cc38a25d63b62183eee8b45d5896e4bf` with its parent `02401c24`. Read the old HomePage, ServicesPage, ResearchSupport, ContactPage, PrivacyPolicy, Navigation, Footer, ServiceCard, LazyImage and ProgressIndicator implementations, their diffs, and the UX audit/report.

The UX audit explicitly identifies repeated scroll-reveal logic hiding content before JavaScript/observation as a problem. That work intentionally introduced visible defaults, reduced motion, native disclosures, readable controls, real footer destinations, responsive progress and video safeguards. The replacement shared Reveal, however, discarded its `delay` and `direction` props and used a 220ms, 6px mount-only movement. Thus the old one-shot fades, directional movements and card stagger disappeared even though many wrapper locations and delay arguments remained. Footer/navigation and service-card rewrites also dropped some CSS hover/color interactions.

The detailed, evidence-based inventory is in [animation-restoration-audit.md](animation-restoration-audit.md). The original historical reveal implementation is not copied wholesale because its server-rendered `opacity: 0` made content dependent on JavaScript.

## Before / UX version / restored implementation

| Area | Historical implementation | UX baseline | Restored result |
|---|---|---|---|
| Home sections/statistics/about/research CTA | 32px up/left/right, 700ms observer fade, per-item delay | 6px mount-only movement; direction/delay ignored | One-shot fade/up or directional reveal; 16px up / 24px horizontal; 420ms; delay capped at 240ms |
| Homepage services | Individual staggered wrappers and restrained hover movement | Static new service grid | Staggered wrappers around current cards; 3px elevation, icon scale 1.08 and arrow movement |
| Testimonials | Staggered cards, existing hover and actual data | Wrapper present but ineffective | Existing card delays work again; quote/name/rating data untouched |
| Services | 32px up, 700ms fade; image load opacity transition | Flattened reveals and native lazy image/fallback | Restored section/visual/card stagger and finite 300ms load fade, current native loading retained |
| Research Support | 24px up fade, 700ms, reduced-motion classes | Flattened shared reveals | Existing phase, service, document, feature, FAQ and CTA wrappers animate again |
| Contact | 28px directional reveal, 650ms; conditional group fade and success scale | Directional reveals removed; conditional animations retained | Directional wrappers restored; conditional/hero delays capped; persistent server-reference success retained |
| Privacy | Directional 28px fade, 650ms; increasing section delays | Flattened reveals | Minimal 180ms fade, no movement/stagger; hero brief fade; decorative blue divider fully visible without width animation |
| Navigation | Color transitions; mobile conditional render without enter/exit | Accessible hidden menu and dismissal behavior | Colors restored; requested 180ms enter / 120ms exit added, closed/exiting contents inert |
| Footer | Color/social background transitions, no reveal | Corrected destinations, omitted transitions | Color and restrained social-icon interactions; no invented footer reveal |
| Pre-consultation | No historical step/success entrance; colored progress stops | Responsive select/strip and immediate state changes | Minimal step/review fade using shared Reveal without animation-driven remounts; 200ms transform-based progress transition |
| Projects | No populated project section in previous homepage | API-backed cards with truthful loading/error/empty states | Minimal shared section/card reveals; no new project or image data |
| FAQ, shared buttons | Old FAQ height transition/chevron and shared button colors | Native details/chevron and accessible controls | Native disclosure retained with short content fade; shared hover lift/press; focus/disabled behavior retained |

Services/Research Support hero entrances, mobile menu enter/exit, pre-consultation step/review/progress transitions, project reveals, FAQ fade and shared button lift/press are small, explicitly identified enhancements requested in the task and consistent with the historical language. No historical evidence supports route/page transitions, animated navigation item stagger, header scroll effects, footer scroll reveal or rating animation, so those were not invented. Existing video improvements and static trust content remain intact.

## Shared animation system and visibility

`components/Reveal.tsx` is the single public reveal primitive. Server rendering produces ordinary visible content with no hidden class/style. If JavaScript fails, IntersectionObserver is missing, or the native animation API is missing, content remains visible. A one-shot observer starts a finite native Web Animation only when the element enters the viewport, then disconnects. The animation has backwards fill only during its finite delay; after completion the element returns to its normal visible style. Unmount, focused descendants and a change in motion preference cancel the animation. Tall sections use an intersection threshold of zero so they are not gated by an unattainable percentage of visibility.

`replayKey` allows a minimal pre-consultation content fade when the step/review changes. It changes only the animation effect, not React keys, form values, validation, file objects, field IDs, submission or focus logic. No route transition intercepts links or anchors.

Hero/conditional entrances use existing finite CSS patterns, shorter durations and bounded delays. Legal content uses minimal fades and a static full-width divider. The mobile menu uses native finite animations with cancellation for rapid toggles and preference changes; `hidden`, `inert`, `aria-hidden`, Escape focus restoration, outside dismissal, route dismissal and the 1024px breakpoint remain in place.

## Reduced motion, mobile and performance

Reduced-motion CSS disables animations/transitions and smooth scrolling. Shared reveals and menu animations check the preference before starting and cancel on preference changes. Hover translate/scale utilities are disabled selectively; structural translations (such as centered cookie preferences) and functional progress `scaleX` remain correct. Images skip their finite load fade under reduced motion. Existing video preference/data/visibility safeguards, poster and pause control are unchanged.

On narrow screens directional reveals become a 16px vertical entrance to avoid extending the page horizontally. Hover enhancements run only for fine hover pointers, with a focus-within arrow equivalent and touch press behavior on shared buttons. All information/links remain present without hover. The responsive form select, progress strip, current-step status and stable image aspect ratios remain intact.

No public animation dependency was added. Framer Motion remains confined to the existing admin app. New motion uses transform/opacity rather than width/height/spacing; progress uses scaleX. No new scroll handler, parallax, looping visual effect, autoplay behavior, image source, API request or data transformation was introduced. Observers and native animation handles are cleaned up.

One frontend verification fix disables speculative prefetch on the protected staff footer link. Its unconfigured local authentication gate correctly returned 503, and the old automatic prefetch caused console resource errors while browsing public routes. Its destination and server authentication are unchanged.

## Verification results

| Check | Exact result |
|---|---|
| `npm test` / web | PASS — 3 Node test-file subtests, 0 failures |
| `npm test` / admin | PASS — 2 Node test-file subtests, 0 failures |
| `npm test` / API | PASS — 180 tests across 38 suites, 0 failures/skips |
| `npm run lint:web` | PASS |
| `npm run lint:admin` | PASS |
| `npm run build:web` | PASS — Next.js production build and TypeScript, all routes generated |
| `npm run build:admin` | PASS — TypeScript and Vite production build |
| `npm run build:api` | PASS — API TypeScript build |
| `npm run guards` | PASS — all 11 architecture/security-header guards |
| Production browser route matrix | PASS — 72 cases: 6 routes × 6 widths × 2 motion preferences |
| JavaScript-disabled visibility | PASS — all 6 routes; shared reveal content remains visible |
| Horizontal overflow | PASS — none in all 72 cases |
| Stuck invisible reveals / unfinished reveals | PASS — none in all 72 cases; completion checked with a timeout |
| Reduced motion | PASS — all 36 reduced-motion cases: no native reveal/menu animation, video paused |
| Unexpected console errors / uncaught page errors in route matrix | 0 / 0 |
| Broken images in route matrix | 0 |
| Form flow checks | PASS — 192 checks: 16 checks × 6 widths × 2 motion preferences |
| Form payload / server-reference checks | PASS — 48 intercepted POSTs; JSON/security-token and multipart/PDF payload verified; simulated failure then server-reference success for both forms in all 12 contexts |
| Service hover and live reduced-motion switch | PASS — 1 focused check |
| Additional browser checks | PASS — 13 checks: all 6 routes retain one main/h1 and zero measured reveal-induced layout shifts; missing observer/animation API fallbacks; populated project fixture; route/outside/resize menu dismissal; live reduced-motion menu cancellation |
| Shared button focus/pressed states | PASS — 4 cases: 390/1440px × both motion preferences, including touch-capable context |
| Unexpected console errors / uncaught page errors during form flows | 0 / 0; 24 expected 503 resource errors from deliberately injected submission failures |
| Total browser checks | PASS — 288 checks: 72 route cases + 6 no-JS cases + 192 form checks + 1 hover/preference check + 13 additional checks + 4 button cases |
| `git diff --check` | PASS |

Build configuration: `NEXT_PUBLIC_API_URL=https://api.accian.co.uk`, matching the existing CSP. All browser API requests are intercepted locally. The initial sandboxed build could not fetch the existing Google font; the network-enabled production build passed. An initial unconfigured build correctly rejected the missing required API URL; no environment validation or CSP was relaxed. The final build and lint were rerun after the final frontend changes.

Browser harness timing checks were corrected to wait for actual reveal/menu completion rather than assuming a fixed frame scheduling delay. The contact button test uses its existing accessible name, `Submit contact form`, and the review-file assertion accounts for the existing filename-plus-size display. A supplemental mock was corrected to return service data only for the service endpoint, rather than supplying an invalid testimonial shape. These harness corrections did not change application behavior. Successful cases were retained when continuing the unchanged production build; the final evidence covers all 72 distinct combinations. The final hover/pressed-state selector refinement was verified separately in the final production build with four focused button cases; no form logic changed. JavaScript-disabled checks and the supplemental checks also passed on that final build.

Machine-readable results are saved in [animation-validation-results.json](animation-validation-results.json). Reproducible local scripts, build/lint logs, and 13 screenshots are in `/tmp/accian-animation-checks/`. The screenshots cover all six routes at 390px and 1440px, plus the services preview after resizing to 1024px. The mobile homepage/services/pre-consultation and desktop pre-consultation screenshots were visually inspected; the full route matrix additionally checks completed motion and dimensions programmatically.

## Evidence and practical limits

Browser API responses use clearly identified local test fixtures; projects are empty in the route matrix. Form POSTs are intercepted locally, including simulated failure and server-reference success. No email or live submission is sent. Testing a production build locally does not certify live API availability, email-provider delivery, deployment or physical-device/screen-reader behavior.

Historical behavior was compared from actual source/diffs. Screenshots verify the restored production output; historical versions were not deployed or substituted for the current UX content. Browser-control plugin documentation was read, but its required callable control tool was absent, so local Playwright with an isolated headless Chrome was used.

## Final outcome

PASS. Historical animations were investigated, the original reveal/stagger/hover language was restored with visible defaults, reduced motion and newer UX behavior preserved, and production builds, tests, lint and targeted browser regressions passed. The final diff contains only public web frontend files and these documentation/evidence artifacts; no API, database, authentication, email, validation, upload-limit, metadata, sitemap, route, dependency or deployment files were changed.
