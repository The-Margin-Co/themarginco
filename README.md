# The Margin Co: website

Production website for **The Margin Co**, a performance marketing agency (Meta Ads, Facebook Ads and website development).
Live at **https://themarginco.agency**.

It is a marketing site with a built-in content portal: staff can edit every page, publish blog posts and case studies,
upload video testimonials and read contact-form leads, without touching code.

| | |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| **Styling** | Tailwind CSS v4 (design tokens in `app/globals.css`) |
| **Backend** | Supabase: Postgres, Auth, Storage (RLS does all access control; only the anon key is used) |
| **Editor** | TipTap 3 (blog and case-study body), inline on-page editor for page copy |
| **Validation** | zod 4, shared by forms and server actions |
| **Hosting** | Vercel |

## What's in it

- **Public site:** Home, About, Contact, three service pages, Blog, Case Studies, video testimonials, ROAS calculator and performance scorecard.
- **Content portal** (`/admin`): pages and site settings, blog, case studies, video testimonials, leads inbox, SEO tools, team and roles (Admin / SEO editor).
- **Edit on the live page:** signed-in staff can click any text or image, save a draft and publish, with revision history and restore.
- **SEO:** per-page titles, descriptions, canonical, hreflang, Open Graph, JSON-LD, a styled `sitemap.xml`, and `robots.txt`, all editable from the portal.
- **Security:** CSP and security headers, RLS on every table, rate-limited contact form, signed share-image URLs, sanitized rich text. Details in [CLAUDE.md](./CLAUDE.md#security-model).

## Getting started

Requirements: Node 22+, and a Supabase project (or Docker for a local one).

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev                  # http://localhost:3000
```

The site renders fully without Supabase (it falls back to the built-in default content), so you can work on the UI with no `.env.local`.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | for CMS/blog/leads | Supabase Project URL (`https://` in production) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | for CMS/blog/leads | Supabase **anon** key |
| `NEXT_PUBLIC_SITE_URL` | **production** | Public origin (`https://themarginco.agency`); the production build fails without it |
| `OG_SIGNING_SECRET` | production | Random 32+ characters (`openssl rand -base64 32`); signs `/og` share images |

Never add the Supabase `service_role` key anywhere. `NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` / `npm start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen` + `tsc --noEmit` |
| `npm test` | Unit tests (Vitest) |
| `npm run verify` | Lint + typecheck + tests + build (what CI runs) |
| `npm run supabase:setup` | One-time cloud setup: login, link, push migrations, sanity checks |

Database policy checks live in `tests/e2e/` and need Docker; see [tests/e2e/README.md](./tests/e2e/README.md).

## Project structure

```
app/            Routes: public pages, /admin portal, /api handlers, sitemap.xml, robots, /og
components/     ui, layout, home, services, blog, case-studies, contact, admin, cms (inline editor)
lib/            Data helpers, validation, media rules, SEO engine, CMS registry/schemas/loaders, Supabase clients
supabase/       migrations/ (source of truth for the database), seed.sql (local sample data only)
docs/           Client guide for the content portal (PDF + HTML source)
tests/          unit/ (Vitest) and e2e/ (database security checks)
```

Architecture, the CMS design, the database schema and the roadmap are documented in [CLAUDE.md](./CLAUDE.md).

## Deploying (Vercel + Supabase)

Use the client's **own** Supabase project. Never run `db reset` or `seed.sql` against it: the seed contains sample content.

1. **Supabase project:** Settings → API: copy the Project URL and the anon key.
2. **Schema:** apply the migrations (this never seeds or resets anything):
   ```bash
   npm run supabase:setup      # first time: login, link, push, verify
   npx supabase db push        # afterwards, whenever a new migration is added
   ```
3. **Auth settings** (Supabase dashboard → Authentication):
   - Turn **off** "Allow new users to sign up".
   - Keep **Confirm email** on and configure custom SMTP.
   - Minimum password length 12+, enable **MFA (TOTP)** for staff, set the Site URL and Redirect URLs to the production domain.
4. **First admin:** Authentication → Users → *Add user* (auto-confirm), then in the SQL editor:
   ```sql
   insert into public.admins (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com';
   ```
   More staff can be added later from `/admin/team` (their login account must exist first).
5. **Storage:** confirm the `media` (5 MB, images) and `videos` (50 MB, MP4/WebM) buckets exist.
6. **Vercel:** import the GitHub repo and set the four variables above for Production **and** Preview.
   - Vercel's free Hobby plan cannot deploy a **private repository owned by a GitHub organization**. Keep the repo under a personal account, or use a paid Vercel plan.
   - Commit author emails must match a GitHub account with access (use your `…@users.noreply.github.com` address).
7. **Vercel Firewall:** add rate-limit rules for `/admin/login`. (The contact form is also limited in the database: 3 per email, 5 per visitor and 60 site-wide per hour.)
8. **After deploying:** check the response headers (securityheaders.com), confirm `/sitemap.xml` and `/robots.txt` use the production domain, submit the sitemap in Google Search Console, send a test enquiry and mark it handled in `/admin/leads`.

### Testimonial videos
Videos are stored in the `videos` bucket and uploaded straight from the browser (Vercel can't accept large request bodies). Export as **MP4 (H.264/AAC)**, about 720p, up to 50 MB. To shrink a file:
```bash
ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 128k out.mp4
```
Supabase does no transcoding; if the library grows beyond roughly six clips, move to Cloudflare Stream or Bunny.

## Working on the code

- Branch from `main`, open a pull request, and let CI (`.github/workflows/ci.yml`: lint, typecheck, tests, build without any Supabase env) pass before merging. Merging to `main` deploys to production.
- The build must pass **with and without** Supabase env vars.
- Database changes go in a new file under `supabase/migrations/` (never edit an applied one), then regenerate types: `npx supabase gen types typescript --local --schema public > lib/database.types.ts`.
- Page copy is CMS content: defaults live in `lib/cms/`, and the database only stores overrides.

## For the content team

Non-technical guide to the portal (editing pages, blog, case studies, videos, leads): [docs/Margin-Co-Website-Portal-Guide.pdf](./docs/Margin-Co-Website-Portal-Guide.pdf).
Sign in at `/admin/login`.

## Ownership

Proprietary. Built for The Margin Co; all rights reserved.
