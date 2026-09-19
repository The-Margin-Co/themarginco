# The Margin Co

Agency website with a page CMS, blog, case studies, video testimonials and a leads inbox: Next.js 16, Tailwind CSS v4 and Supabase.

```bash
npm install
cp .env.example .env.local   # add your Supabase URL + anon key
npm run dev
npm run verify               # lint + typecheck + unit tests + production build
```

Architecture, the database schema, the security model and the roadmap live in [CLAUDE.md](./CLAUDE.md).

## Deploying to production (Vercel + Supabase)

Use the client's **own** Supabase project. Only the Project URL and the **anon** key are ever used by this app: never paste the `service_role` key anywhere.

1. **Create the Supabase project.** Settings → API: copy the *Project URL* and the *anon public* key.
2. **Push the schema (not the seed):**
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   Never run `db reset` or `seed.sql` against the cloud project: the seed contains fake posts and case studies.
3. **Auth settings (Supabase dashboard → Authentication):**
   - Turn **off** "Allow new users to sign up". With sign-ups open, anyone could register an email an admin later adds as staff.
   - Keep **Confirm email** on and configure a custom SMTP sender (the default mailer is heavily rate-limited).
   - Password minimum length 12+, enable **MFA (TOTP)** for staff, optionally CAPTCHA (Cloudflare Turnstile), and set a session time-box (e.g. 8 h) and inactivity timeout (e.g. 1 h).
   - Set the Site URL and Redirect URLs to the production domain.
4. **Create the first admin:** Authentication → Users → *Add user* (auto-confirm), then in the SQL editor:
   ```sql
   insert into public.admins (user_id, role)
   select id, 'admin' from auth.users where email = 'you@example.com';
   ```
   More staff can be added from `/admin/team`.
5. **Storage:** confirm the `media` (5 MB, images) and `videos` (50 MB, MP4/WebM) buckets exist. In Storage settings the global upload limit must be at least 50 MB (the free-plan maximum).
6. **Vercel:** push the code to GitHub, import the repo, and set these for Production **and** Preview:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL (must be `https://`) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain` (the production build fails without it) |
   | `OG_SIGNING_SECRET` | random 32+ chars (`openssl rand -base64 32`) |

   `NEXT_PUBLIC_*` values are inlined at build time: redeploy after changing them.
7. **Vercel Firewall:** add rate-limit rules for `/admin/login` and the contact form. (The database already limits lead submissions to 3 per email and 60 per hour site-wide.)
8. **Content:** sign in and replace the placeholders: contact email, Calendly link, Instagram handle, metrics and testimonials (Admin → Site settings / Pages), then publish. Upload the testimonial videos under Admin → Video testimonials.

### Testimonial videos
Videos are stored in the `videos` bucket and uploaded straight from the browser (Vercel can't accept large request bodies). Export as **MP4 (H.264/AAC)**, about 720p and roughly 15–25 MB per minute, up to 50 MB. To shrink a file:
```bash
ffmpeg -i in.mp4 -vf scale=-2:720 -c:v libx264 -crf 26 -preset slow -movflags +faststart -c:a aac -b:a 128k out.mp4
```
Supabase does no transcoding or adaptive streaming; if the library grows beyond roughly six clips, move to Cloudflare Stream or Bunny.

### After deploying
Check the response headers (securityheaders.com), confirm `/sitemap.xml` and `/robots.txt` use the production domain, submit a test lead and mark it handled in `/admin/leads`, and run Lighthouse.
