@AGENTS.md

# The Margin Co: agency site + page CMS + blog CMS

Marketing site for **The Margin Co** (IG @join_margin, "The room where growth gets decided."): a performance marketing agency offering Meta Ads, Facebook Ads and website development. Layout structure is modelled on advitz.com; visual identity is Margin's electric yellow on white (light theme) or black/charcoal (dark theme).

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS v4 · Supabase (Postgres + Auth) · zod 4 · TipTap 3 (admin editor) · sanitize-html · lucide-react.

## Commands

```bash
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
npm test           # vitest unit tests (tests/unit); DB checks live in tests/e2e/security.mjs (needs Docker)
npm run verify     # lint + typecheck + test + build (what CI runs)
npm run build      # must pass with AND without Supabase env vars
npx supabase start # local Supabase (needs Docker running for this macOS user)
npx supabase db reset  # re-apply migrations + seed.sql locally
```

## Architecture & conventions

- **Next 16 specifics:** session refresh lives in `proxy.ts` (not `middleware.ts`); `params`/`searchParams`/`cookies()` are async; use the global `PageProps<"/route">` / `LayoutProps` helpers; `error.tsx` receives `retry` (not `reset`). Check `node_modules/next/dist/docs/` before using unfamiliar APIs.
- **Design tokens** are in `app/globals.css` (`@theme`) and come in two palettes, picked by `THEME` in `lib/site.ts` (rendered as `data-theme` on `<html>`): **light** (white + yellow, black type; current) and **dark** (black/charcoal + yellow). Tokens: `ink` (page bg), `ink-2` (alt sections), `charcoal` (cards), `line` (borders), `accent` (yellow fills), `on-accent` (text on yellow), `gold` (accent-coloured *text*: darker in light mode for contrast), `fg` (headings), `muted` (body). Utilities: `card`, `bg-grid`, `shadow-card`, `shadow-float`, `shadow-glow`, `text-highlight` (headline highlight: yellow text on dark, yellow marker on light), `animate-marquee`, `animate-pulse-dot`; `dark:` follows `data-theme`. Never hard-code `text-white`/`bg-black`-style colours; use `fg`/`ink` tokens (`bg-fg/5` for hover washes). There is no `tailwind.config.ts`.
- **All page copy is CMS content** (see *Page CMS* below). Defaults live in code (`lib/cms/defaults/*.ts`, `lib/cms/pages/*.ts`) and the database only stores overrides, so the site renders fully with no Supabase at all. `lib/site.ts` keeps only structural constants (`SITE_URL`, service slugs/icons, nav links).
- **Components:** `components/ui` (Button/ButtonLink, Badge, Container/Section, SectionHeading, Highlight, FormField), `components/layout` (Navbar with services dropdown + mobile drawer, Footer, Logo), `components/home`, `components/services` (ServiceCard, `ServiceLanding` template shared by all three service pages, RoasCalculator, PerformanceScorecard), `components/blog`, `components/contact`, `components/admin`.
- `cn()` is a plain join with no tailwind-merge. Don't pass classes that conflict with a component's base classes (e.g. `hidden` onto `ButtonLink`); wrap the component in an element instead.
- **Two Supabase clients:**
  - `lib/supabase/public.ts`: cookie-free anon client for public reads and lead inserts. It keeps `/blog` static/ISR.
  - `lib/supabase/server.ts`: `@supabase/ssr` cookie client for auth and admin writes.
- **Data helpers** are in `lib/posts.ts`. They return `[]`/`null` when env vars are missing and throw on query errors, so ISR keeps serving the last good page.
- **Validation:** zod schemas in `lib/validation.ts` are shared by client forms (instant feedback) and server actions (authoritative). The `FormState<Field>` type is used by every form.
- **Caching:** `/` revalidates every 300s, `/blog` and `/blog/[slug]` every 60s. The post actions (`app/admin/blog/actions.ts`) call `revalidatePath` for `/`, `/blog`, the sitemap, and the old and new post URLs. `/admin/*` is `force-dynamic`.
- **Blog CMS** (modelled on carworkshop-web's blog editor):
  - Pages: `/admin/blog` (list with status tabs and search), `/admin/blog/new`, `/admin/blog/[id]`. SEO editors see the list and an SEO-only view of each post (`PostSeoEditor` → `updatePostSeo` → `update_post_seo()`); new/delete are admin-only.
  - Shell: `components/admin/AdminShell` + role-aware `AdminNav`. `SiteChrome` hides the marketing header/footer on `/admin`.
  - Editor: `PostEditor` holds `RichTextEditor` (TipTap), `FeaturedImageField` and `PostSeoSection` (the same `PageSeoFields` + `SchemaBlocks` used for pages; meta title/description/keywords live on the post row, everything else in `posts.seo` jsonb).
  - Content is stored as **HTML**. `RICH_CONTENT_CLASS` (`lib/rich-content.ts`) styles both the editor and the public page, so what you see while editing is what gets published.
  - Drafts use `draftPostSchema` (title and slug required); publishing uses `publishPostSchema`.
- **Uploads:** `POST /api/admin/media` checks for an admin session and the request origin, then sniffs the image's bytes (JPG/PNG/WebP/GIF/AVIF, max 5 MB). It uploads to the public `media` bucket **with the admin's session**; storage RLS allows admin writes only. The featured image must be a URL from this bucket (`isMediaUrl`).
- **Leads inbox** (`/admin/leads`, admin-only — not shown to SEO editors): a plain list of contact-form submissions with a `handled` boolean (`components/admin/LeadHandledToggle`, optimistic toggle via `useTransition`) and delete (`DeletePostButton` reused as-is). No edit form, no detail page, no status pipeline beyond the one flag. Server actions in `app/admin/leads/actions.ts`.
- **Video testimonials** (`/admin/video-testimonials`, admin-only, no SEO surface at all): a small hand-curated `video_testimonials` table (name/role/company, `video_url`, poster image + alt, `sort_order`, status). Rendered on the homepage right after "Growth Architecture" (`components/home/VideoTestimonials.tsx`, live-fetched like `CaseStudies`) via `VideoEmbed.tsx` — click-to-play: only the poster `<Image>` loads until clicked, then a native `<video preload="none">` mounts, so visitors who never press play download no video bytes. **Videos are self-hosted in the `videos` Storage bucket** (public, 50 MB, mp4/webm; posters stay in `media`). Uploads bypass Vercel's ~4.5 MB body limit: the editor's `VideoUploadField` calls `POST /api/admin/video/upload-url` (admin + origin check, server-chosen path, `createSignedUploadUrl`), PUTs the file straight to Supabase (`lib/upload-video.ts`), then `POST /api/admin/video/finalize` range-reads the first bytes, runs `sniffVideoType` and deletes the object if it isn't really a video. `video_url` must be a URL in the videos bucket (`isVideoUrl` + a table check); replaced/deleted videos and posters are removed from Storage best-effort. "Use a frame as the poster" captures a frame client-side.
- **Case studies CMS** (a growing library, cloned from the blog stack — same table shape, same draft/publish/role split):
  - Pages: `/admin/case-studies` (list), `/admin/case-studies/new`, `/admin/case-studies/[id]`. SEO editors see the list and an SEO-only view (`CaseStudySeoEditor` → `updateCaseStudySeo` → `update_case_study_seo()`); new/delete are admin-only.
  - Editor: `CaseStudyEditor` holds `RichTextEditor`, `FeaturedImageField`, a **Metrics repeater** (`CaseStudyMetricsField`, up to 6 `{value,label,detail?}` rows shown as badges on the card, home teaser and detail page) and `CaseStudySeoSection`. `industry`/`channels` text fields replace the blog's `category` enum.
  - Public routes `/case-studies` and `/case-studies/[slug]` (`app/case-studies/`) mirror `/blog`; JSON-LD uses `Article` (schema.org has no "case study" type) instead of `BlogPosting`.
  - The homepage "Case studies" section (`components/home/CaseStudies.tsx`) **live-fetches** the 3 most recent published case studies (`getRecentCaseStudies`, mirroring `LatestPosts`) — it no longer holds hand-authored CMS content, only the heading + button label (`lib/cms/pages/home.ts`).
  - A chrome-only `case-studies` CMS doc (`lib/cms/pages/case-studies.ts`, registered in `lib/cms/registry.ts`) holds the index hero/empty-state/CTA and the detail page's static labels — exactly like the `blog` doc holds article-page chrome without the posts themselves.
- **Page CMS:**
  - `lib/cms/fields.ts`: zod field builders carrying UI metadata via `.meta()` (`field.text/textarea/url/image/icon/toggle/number/list/group`, `field.section` = hideable, `field.block` = always shown). One schema drives validation, the admin form (`SchemaForm`) and the inline editor.
  - `lib/cms/registry.ts`: the single map of documents: every page (`home`, `about`, `contact`, `services/*`, `blog`) plus `site` (brand, contact, nav, footer, stats, CTA band). Path, label, schema, defaults, default SEO, auto JSON-LD types and FAQ path per page. Add a page here and everything else (loader, admin list, sitemap, revalidation) picks it up.
  - `lib/cms/load.ts`: `getPage(slug)` / `getSite()` merge the DB row over defaults (`deepMerge`: objects merge, arrays replace) and parse with `parseWithFallback` (an invalid section falls back to its defaults instead of breaking the page). Visitors read `pages` with the cookie-free client, so pages stay static. In edit mode the drafts are read instead.
  - Storage: `pages` (live content + SEO, no direct writes), `page_content_drafts` (admins), `page_seo_drafts` (admins + SEO editors), `page_revisions`. Only `publish_page(slug, parts)` copies draft → live (+ revision); `restore_page_revision(id)` loads a revision back into the draft.
  - Admin: `/admin/pages` (list with SEO score/draft badges), `/admin/pages/[...slug]` (`DocEditor`: Content / SEO / Schema / History tabs), `/admin/settings` (site content), `/admin/seo` (site audit + site-wide SEO + robots rules), `/admin/team`. Server actions in `app/admin/cms/actions.ts`.
- **Inline editor (edit on the live site):**
  - Entry: the "Edit this page" pill (`EditPill`, shown only when a Supabase auth cookie exists) or the admin's "Edit on site" button POST to `/api/admin/edit-mode`, which checks the staff session and turns on Next **Draft Mode**. Exit = same endpoint with `mode=exit`. Visitors never get the cookie, so their pages stay static.
  - `getEditState()` (Draft Mode + verified staff session, cached per request) decides what `EditableText` / `EditableImage` / `EditableSection` (`components/cms/Editable.tsx`) render: plain HTML for visitors and SEO editors, client editors (`InlineText` contentEditable plain text, `InlineImage`, `InlineSection` with section panel + show/hide) for admins.
  - `EditModeProvider` (mounted by the root layout only in edit mode) keeps unsaved edits as field patches (`components/cms/edit/store.ts`), renders the edit dock (Save draft · Publish · Discard · SEO score/drawer · Exit) and the section/SEO drawers. `saveInlineDraft` applies the patches on top of the current draft and re-validates the whole document.
  - New content: wrap each section in `EditableSection bind={…}` and every string in `EditableText`, with a `Bind` (`{doc, path}`) that matches the schema path.
- **Testimonials carousel:** `components/home/Testimonials.tsx` (the text-quote section, still `field.list` of `{quote, role, company}` in `lib/cms/pages/home.ts` — no data-model change) wraps its server-rendered cards in `TestimonialsCarousel.tsx`, a client component that only manages scroll position (CSS `snap-x snap-mandatory` + prev/next buttons calling `scrollBy`). No carousel library — matches the codebase's existing CSS-first bias (`PlatformMarquee`'s pure-CSS marquee). The cards themselves stay server components so `EditableText` keeps working inline.
- **SEO engine:** `lib/seo/metadata.ts` (`buildMetadata`: absolute titles, canonical, hreflang `en` + `x-default`, robots, OG/Twitter always with an image, falling back to `/og`), `lib/seo/jsonld.ts` + `PageJsonLd` (Organization, WebSite, WebPage, BreadcrumbList, Service, FAQPage from visible FAQs, BlogPosting, plus validated custom blocks), `lib/seo/audit.ts` (0–100 score shared by the admin list, SEO tab and edit dock). `app/robots.ts` and `app/sitemap.ts` are DB-driven: `/admin` and `/api` are always disallowed; the "discourage search engines" switch (automatic on Vercel previews) serves `Disallow: /`; noindex pages and `sitemap.include = false` pages drop out of the sitemap.
- `lib/database.types.ts` is generated: `npx supabase gen types typescript --local --schema public > lib/database.types.ts`. Handy aliases live in `lib/types.ts`.

## Security model

- The app uses **only the anon key**; there is no service-role key anywhere. RLS and table grants do all gatekeeping.
- `posts` / `case_studies`: visitors can SELECT only published rows. Admins can SELECT all rows and INSERT/UPDATE/DELETE; SEO editors can SELECT all rows (including drafts) but change SEO fields only, via `update_post_seo()` / `update_case_study_seo()`. Check constraints let drafts be incomplete but enforce the content rules when `status = 'published'`.
- `storage.objects` (bucket `media`): public read through public URLs. Admins can SELECT/INSERT/UPDATE/DELETE. The bucket itself limits uploads to 5 MB and image MIME types (no SVG).
- `leads`: anyone can INSERT (inserts never chain `.select()`), only admins can SELECT/UPDATE/DELETE. `/admin/leads` is gated by `getAdminSession()` (not `getStaffSession()`), so SEO editors don't see the nav item or the data — for authenticated non-admins, RLS silently filters rows to zero rather than erroring (the grant is table-wide; only the policy narrows it).
- `video_testimonials`: visitors SELECT only `status = 'published'` rows; admins have full CRUD; no SEO-editor policy at all (there's no meta/SEO surface on this table). `/admin/video-testimonials` is admin-only, same `getAdminSession()` pattern as leads.
- `admins` is the staff allowlist with a `role`: **`admin`** (everything) or **`seo_editor`** (SEO only). RLS is on with no policies; it's managed through the admin-only `list_staff` / `add_staff` / `set_staff_role` / `remove_staff` functions (you can't remove or demote yourself). `staff_role()`, `is_admin()` (role = admin) and `can_edit_seo()` (either role) are `security definer`.
- **SEO editors are restricted by the database, not just the UI:** they can read/write `page_seo_drafts`, publish only the `seo` part, read all posts and change post SEO only via `update_post_seo()`. They can't write content drafts, publish content, restore content revisions, edit/delete posts, upload media or manage the team (35 API tests in the scratchpad `cms-rls.mjs` prove each of these).
- Auth is enforced in three places: `proxy.ts` redirects signed-out users, `getStaffSession()` / `getAdminSession()` (`lib/auth.ts`) re-check in the page **and** in every server action / route handler, and RLS is the final guard. `safeAdminPath()` blocks open redirects via `?next=`; the edit-mode endpoint only redirects to same-site public paths and rejects cross-site posts.
- CMS writes are zod-validated against the document schema on the server; inline patches may only target paths that exist in the schema. JSON-LD blocks must parse as JSON objects (≤20 KB, ≤20 blocks) and are `<`-escaped on output.
- Post HTML is sanitized with `sanitize-html` (`lib/sanitize.ts`) **on save and again on render**. It uses a tag, attribute and style allowlist, turns `h1` into `h2`, removes scripts, iframes and event handlers, allows only https or media-bucket images, and adds `rel="noopener noreferrer"` to external links. JSON-LD output escapes `<`.
- `next.config.ts` sets `images.dangerouslyAllowLocalIP` only when the Supabase URL is loopback, i.e. local dev. It also sets `poweredByHeader: false` and security headers on every route: CSP (`default-src 'self'`, Supabase origin allowed for img/media/connect, `frame-ancestors 'none'`, `object-src 'none'`; `script-src` keeps `'unsafe-inline'` because a nonce would force every page dynamic and defeat static/ISR), HSTS, `nosniff`, `X-Frame-Options: DENY`, Referrer/Permissions/COOP policies. Blog HTML images are limited to our own media bucket (`lib/sanitize.ts`) so the CSP holds.
- **Lead spam:** anon has no INSERT on `leads`; the contact action calls the `submit_lead()` security-definer RPC, which allows 3 submissions per email and 60 per hour site-wide (error code `P0001`). The honeypot stays. Add Vercel Firewall rate limits on `/admin/login` and the contact route.
- **`/og`** only renders titles signed with `OG_SIGNING_SECRET` (`lib/seo/og-sign.ts`), and responds with a year-long immutable cache header. Unsigned requests get 404 when a secret is configured (local dev without a secret stays open).
- **Production env guard:** with `VERCEL_ENV=production`, the build fails if `NEXT_PUBLIC_SITE_URL` is missing (falls back to `VERCEL_PROJECT_PRODUCTION_URL`) or if the Supabase env is missing / not https. Local and preview builds still work without any env.
- **Origin checks:** every route handler uses `isSameOrigin()` from `lib/http.ts` (malformed `Origin` is a 403, not a 500; a missing Origin requires `Sec-Fetch-Site: same-origin`). Login returns one generic message for "wrong password" and "no CMS access".
- `pages.published_by` (a staff user id) is not readable by anon/authenticated: the table has a column-level `select` grant, so always select explicit columns from `pages`.

## Database

The source of truth is `supabase/migrations/`: `20260913000000_init.sql` (tables, RLS), `20260913010000_blog_cms.sql` (post SEO/image/status columns, admin update/delete, `media` bucket), `20260914000000_pages_cms.sql` (roles, page tables, publish/restore, `posts.seo`, `update_post_seo`, team functions), `20260915000000_case_studies_cms.sql` (`case_studies` table, `update_case_study_seo`), `20260916000000_leads_inbox.sql` (`leads.handled`, admin update/delete policies — `leads` had neither before) and `20260917000000_video_testimonials_cms.sql` (`video_testimonials` table, no SEO surface), `20260918000000_videos_bucket.sql` (`videos` bucket + admin-only policies, `video_url` must live in that bucket) and `20260918010000_lead_rate_limit.sql` (`submit_lead()` RPC, anon INSERT on `leads` removed, column-level grant on `pages`). Sample HTML posts and case studies are in `supabase/seed.sql`.

| Table | Columns |
| --- | --- |
| `posts` | id uuid pk, title, slug (unique, `^[a-z0-9]+(-[a-z0-9]+)*$`), excerpt (≤300), content (sanitized HTML), category, status (`draft`/`published`), published_at, meta_title (≤70), meta_description (≤170), meta_keywords, featured_image (media URL), featured_image_alt, seo jsonb (canonical, robots, OG, hreflang, sitemap, schemas), created_at, updated_at (trigger) |
| `case_studies` | same shape as `posts`, with `industry` (free text) instead of `category`, an optional `channels` text field, and `metrics` jsonb (array of `{value,label,detail?}`, ≤6, app-validated) |
| `pages` | slug pk, content jsonb, content_published_at, seo jsonb, seo_published_at, published_by, updated_at (live; written only by `publish_page`) |
| `page_content_drafts` / `page_seo_drafts` | slug pk, content / seo jsonb, updated_by, updated_at |
| `page_revisions` | id uuid pk, slug, part (`content`/`seo`), data jsonb, published_by, created_at |
| `leads` | id uuid pk, name, email, service (`meta-ads` · `facebook-ads` · `website-development` · `not-sure`), message, handled boolean, created_at |
| `video_testimonials` | id uuid pk, name, role, company, video_url, poster_image, poster_image_alt, status (`draft`/`published`), published_at, sort_order int, created_at, updated_at (trigger) |
| `admins` | user_id → auth.users, role (`admin`/`seo_editor`), created_at |

## Setup

**Local (Docker):**
1. Run `npx supabase start`, then copy the API URL and anon key into `.env.local` (see `.env.example`).
2. Run `npx supabase db reset` to apply the migrations and seed.
3. Create a user in Studio (http://127.0.0.1:54323) → Authentication, then run:
   `insert into public.admins (user_id, role) select id, 'admin' from auth.users where email = 'you@example.com';`
   More staff can then be added from `/admin/team`.

**Cloud:**
1. Create the Supabase project.
2. Run **all eight** migrations in order (`supabase db push`, or paste each into the SQL editor), then `seed.sql` (optional). Use the client's **own** project, never a shared one.
3. Add an admin user under Authentication → Users, then run the `insert into public.admins …` statement above.
4. **Turn off public sign-ups** (Authentication → Sign In / Providers).
5. Set the three env vars in Vercel and deploy.

## Roadmap

- [x] **M0 Scaffold + theme**: Next 16, Tailwind v4 tokens, fonts, icon
- [x] **M1 Layout + UI kit**: floating nav, services dropdown, mobile drawer (Esc, focus, scroll lock, closes on navigate), footer, UI primitives
- [x] **M2 Marketing pages**: home, three service pages (ROAS calculator / scorecard), about, contact, 404, error
- [x] **M3 DB migration + RLS**: applied on local Supabase (Postgres 17). 16 API tests passed through GoTrue + PostgREST (anon / viewer / admin), plus 19 SQL-level policy tests
- [x] **M4 Blog read path**: posts load live from Supabase; `[slug]` prerenders at build with 60s ISR; canonical, OG and JSON-LD verified
- [x] **M5 Contact → leads**: browser submit writes to `leads`; validation, honeypot, preselected `?service=` and success/error states all verified
- [x] **M6 Admin auth + blog CMS**: TipTap editor, SEO panel, featured image upload, draft/publish, list/edit/delete. 27 API tests passed (drafts hidden, publish constraints, update/delete, storage upload rules) and the sanitizer was verified end to end.
- [x] **M7 Page CMS**: every public page and section editable (registry + field schemas, drafts → publish, revisions + restore), admin Pages/Settings/SEO/Team, roles (admin / SEO editor) enforced in RLS. 35 role/RLS API tests pass
- [x] **M8 SEO engine**: per-page meta title/description/keywords, canonical, robots, OG/Twitter with branded `/og` fallback, hreflang `en` + `x-default`, `<html lang>`, auto + custom JSON-LD (FAQPage from visible FAQs), DB-driven robots.txt + sitemap, SEO audit score. Head-tag audit passes on every route
- [x] **M9 Inline editor**: Draft Mode edit endpoint, contentEditable text, image replace + alt, section panel (lists, icons, links, show/hide), SEO drawer, edit dock. 16 HTTP checks pass (visitor static, admin editable, SEO editor SEO-only, redirects safe)
- [x] **M10 Case studies**: `case_studies` table (mirrors `posts` + a `metrics` jsonb column), `/admin/case-studies` CRUD, public `/case-studies` + `/case-studies/[slug]`, `update_case_study_seo()`, homepage teaser converted to live-fetch, nav/footer link, sitemap entries, inline-editor routing. 17 RLS/CRUD tests + 3 inline-editor checks + head-tag checks on both new routes all pass
- [x] **M11 Leads inbox**: `leads.handled` column + admin update/delete RLS policies (previously leads could only ever be inserted or read), `/admin/leads` list with handled toggle and delete, admin-only (hidden from SEO editors at both the nav and the RLS layer). 13 RLS tests pass
- [x] **M12 Video testimonials + testimonials carousel**: `video_testimonials` table (admin-only, no SEO surface), `/admin/video-testimonials` CRUD, a homepage section right after "Growth Architecture" with click-to-play video cards (poster loads by default, iframe only mounts on click), and the existing text-testimonials grid converted to a CSS scroll-snap carousel (no new dependency). 12 RLS tests pass; homepage stays static/ISR (`revalidate = 300`, confirmed in the build's route table)
- [x] **M13 Production hardening**: security headers + CSP, signed `/og`, rate-limited `submit_lead()`, self-hosted videos in Supabase Storage (signed direct upload + server-side byte verification), production env guard, shared origin check, generic login error, graceful DB failure on list pages, `global-error.tsx`, carousel/focus a11y, apple icon + manifest, CI workflow, 24 unit tests. All 8 migrations verified on an in-memory Postgres; **not yet run on real Supabase (Docker was down)**
- [ ] **M13b Manual browser pass** (needs someone signed in): inline edit → save draft → visitor still sees live → publish → restore a revision; add an FAQ in the section panel; hide a section; replace an image; blog write → upload → publish; case study write → publish → confirm it appears on the homepage and `/case-studies`; submit the contact form → confirm it appears in `/admin/leads` → mark handled → delete; add/publish a video testimonial → confirm it appears on the homepage; SEO editor flow; mobile layout (incl. carousel touch-swipe)
- [ ] **M14 Deploy the migrations**: `npx supabase link` then `npx supabase db push` (all 8, never `db reset`/seed) on the cloud project, turn OFF public sign-ups, create the first admin, set the Vercel env vars (see README)
- [ ] **M15 a11y/perf pass**: Lighthouse run
- [ ] **M16 Launch checklist**
  - [ ] Replace the 3 **placeholder** case studies and 2 placeholder video testimonials (`supabase/seed.sql`) and the home/service hero metrics and text testimonials with verified data/real videos. Case studies and video testimonials are edited from `/admin/case-studies` and `/admin/video-testimonials`; the rest through the CMS or `lib/cms/defaults/*.ts`
  - [ ] Set the contact email under Admin → Site settings (default is `hello@yourdomain.com`)
  - [ ] Confirm the Calendly URL and the "$5k/month" minimum-budget FAQ answer
  - [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain
  - [ ] Disable public sign-ups in Supabase Auth
  - [ ] Swap in the official logo if it should differ from the generated "M" mark

### Backlog
- Media library page (browse/reuse uploads, clean up orphaned images)
- Scheduled publishing and autosave for drafts
- New-lead notifications (Supabase database webhook → Resend/Slack)
- Cloudflare Turnstile on the contact form (the DB rate limit is in place; this adds bot filtering)
- Error monitoring (Sentry)
- Redirects manager (apply in `proxy.ts`)
- More languages (the hreflang UI is ready)
- Rich-text (bold/links) fields for page copy; drag-and-drop section ordering
- Analytics (GA4 / Meta Pixel + CAPI) with consent banner
