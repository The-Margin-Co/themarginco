// Database-level checks for the RLS/security model. Needs a LOCAL Supabase with all migrations applied:
//   npx supabase start && npx supabase db reset
//   eval "$(npx supabase status -o env | grep -E '^(API_URL|ANON_KEY|SERVICE_ROLE_KEY)=' | sed 's/^/export /')"
//   node tests/e2e/security.mjs
// The service-role key is used ONLY here, to create throwaway test users. The app never has it.
import { randomBytes } from "node:crypto";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createClient } = require("@supabase/supabase-js");
const { API_URL, ANON_KEY, SERVICE_ROLE_KEY } = process.env;
if (!API_URL || !ANON_KEY || !SERVICE_ROLE_KEY) throw new Error("Missing API_URL / ANON_KEY / SERVICE_ROLE_KEY");
if (!/127\.0\.0\.1|localhost/.test(API_URL)) throw new Error("Refusing to run against a non-local database.");

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(API_URL, SERVICE_ROLE_KEY, opts);
let pass = 0, fail = 0;
const check = (name, ok, detail = "") => {
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

async function signedIn(email, role) {
  const password = randomBytes(12).toString("base64url");
  const { data: list } = await service.auth.admin.listUsers();
  let user = list.users.find((u) => u.email === email);
  if (user) await service.auth.admin.updateUserById(user.id, { password });
  else user = (await service.auth.admin.createUser({ email, password, email_confirm: true })).data.user;
  if (role) await service.from("admins").upsert({ user_id: user.id, role });
  else await service.from("admins").delete().eq("user_id", user.id);
  const db = createClient(API_URL, ANON_KEY, opts);
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return db;
}

const anon = createClient(API_URL, ANON_KEY, opts);
const admin = await signedIn("e2e-admin@example.test", "admin");
const seo = await signedIn("e2e-seo@example.test", "seo_editor");
const viewer = await signedIn("e2e-viewer@example.test", null);

// --- Leads: submissions only through the rate-limited function ------------------------------
const email = `e2e-${Date.now()}@example.test`;
const lead = { p_name: "E2E Lead", p_email: email, p_service: "meta-ads", p_message: "Automated security test lead." };
{
  const direct = await anon.from("leads").insert({ name: "x y", email, service: "meta-ads", message: "direct insert attempt" });
  check("anon can NOT insert into leads directly", !!direct.error, direct.error?.code);
  const viaAuthed = await viewer.from("leads").insert({ name: "x y", email, service: "meta-ads", message: "direct insert attempt" });
  check("signed-in non-staff can NOT insert directly either", !!viaAuthed.error, viaAuthed.error?.code);

  for (let i = 1; i <= 3; i++) {
    const ok = await anon.rpc("submit_lead", lead);
    check(`submit_lead #${i} for one email succeeds`, !ok.error, ok.error?.message);
  }
  const fourth = await anon.rpc("submit_lead", lead);
  check("4th submission from the same email within an hour is rejected", fourth.error?.code === "P0001", fourth.error?.code);
  const bad = await anon.rpc("submit_lead", { ...lead, p_email: `other-${email}`, p_service: "hacking" });
  check("invalid service is still rejected by the table constraints", !!bad.error);

  const read = await anon.from("leads").select("*");
  check("anon can not read leads", !!read.error);
  const seoRead = await seo.from("leads").select("*");
  check("SEO editor sees zero leads", !seoRead.error && seoRead.data.length === 0);
  const adminRead = await admin.from("leads").select("email").eq("email", email);
  check("admin sees the submitted leads", !adminRead.error && adminRead.data.length === 3);
  await admin.from("leads").delete().eq("email", email);
}

// --- pages: world-readable content, but not the staff user id -------------------------------
{
  const all = await anon.from("pages").select("*");
  check("anon can NOT select every column of pages (published_by is hidden)", !!all.error, all.error?.code);
  const cols = await anon.from("pages").select("slug, content, seo, content_published_at, seo_published_at");
  check("anon can still read the published columns", !cols.error, cols.error?.message);
}

// --- videos bucket: admin-only writes, signed upload URLs need an admin ---------------------
{
  const buckets = await service.storage.getBucket("videos");
  check("videos bucket exists, is public, 50 MB, mp4/webm only",
    buckets.data?.public === true && buckets.data?.file_size_limit === 52428800 &&
      JSON.stringify(buckets.data?.allowed_mime_types?.sort()) === JSON.stringify(["video/mp4", "video/webm"]));

  const mp4 = new Blob([Uint8Array.from([0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 0, 0])], { type: "video/mp4" });
  const path = `testimonials/e2e/${Date.now()}.mp4`;

  const anonUrl = await anon.storage.from("videos").createSignedUploadUrl(path);
  check("anon can NOT get a signed upload URL", !!anonUrl.error);
  const viewerUrl = await viewer.storage.from("videos").createSignedUploadUrl(path);
  check("non-staff can NOT get a signed upload URL", !!viewerUrl.error);
  const seoUrl = await seo.storage.from("videos").createSignedUploadUrl(path);
  check("SEO editor can NOT get a signed upload URL", !!seoUrl.error);

  const adminUrl = await admin.storage.from("videos").createSignedUploadUrl(path);
  check("admin gets a signed upload URL", !adminUrl.error && !!adminUrl.data?.token, adminUrl.error?.message);
  if (adminUrl.data) {
    const up = await anon.storage.from("videos").uploadToSignedUrl(path, adminUrl.data.token, mp4, { contentType: "video/mp4" });
    check("the token holder can upload (even through the anon client)", !up.error, up.error?.message);
    const wrongType = await admin.storage.from("videos").upload(`testimonials/e2e/${Date.now()}.txt`, new Blob(["hi"], { type: "text/plain" }), { contentType: "text/plain" });
    check("a non-video content type is refused by the bucket", !!wrongType.error);
    const pub = await fetch(`${API_URL}/storage/v1/object/public/videos/${path}`, { headers: { Range: "bytes=0-15" } });
    check("the uploaded video is publicly readable with Range support", pub.status === 206 || pub.status === 200, String(pub.status));
    const del = await viewer.storage.from("videos").remove([path]);
    check("non-staff can NOT delete videos", (del.data?.length ?? 0) === 0);
    await admin.storage.from("videos").remove([path]);
  }
}

// --- video_testimonials: only self-hosted video URLs -----------------------------------------
{
  const row = {
    name: "E2E Client",
    video_url: "https://www.youtube.com/watch?v=abc",
    poster_image: `${API_URL}/storage/v1/object/public/media/blog/p.jpg`,
    poster_image_alt: "E2E poster",
  };
  const yt = await admin.from("video_testimonials").insert({ ...row, status: "draft" });
  check("a YouTube URL is rejected by the table constraint", !!yt.error, yt.error?.code);
  const own = await admin
    .from("video_testimonials")
    .insert({ ...row, video_url: `${API_URL}/storage/v1/object/public/videos/testimonials/a.mp4`, status: "draft" })
    .select("id")
    .single();
  check("a self-hosted video URL is accepted", !own.error, own.error?.message);
  if (own.data) await admin.from("video_testimonials").delete().eq("id", own.data.id);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
