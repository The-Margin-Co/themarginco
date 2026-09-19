import { ImageResponse } from "next/og";
import { siteDefaults } from "@/lib/cms/pages/site";
import { verifyOgTitle } from "@/lib/seo/og-sign";

// Branded 1200×630 share card used whenever a page has no custom OG image.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") || siteDefaults.brand.name).replace(/\s+/g, " ").trim().slice(0, 110);

  // Only titles we signed: rendering is CPU-heavy, and an open endpoint would also let anyone
  // put their own words on a branded card served from this domain.
  if (!verifyOgTitle(title, searchParams.get("s"))) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "radial-gradient(circle at 85% 0%, rgba(250,204,21,0.22), transparent 55%), #09090b",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#FACC15" />
            <g transform="translate(0 -1.7)" fill="none" stroke="#09090b" strokeWidth="2.6" strokeLinejoin="round">
              <path d="M3.1 10.3H10.5M6.8 10.3V21" />
              <path d="M13.6 21V10.5l2.4 5 2.4-5V21" />
              <path d="M28.9 10.3H25a2.2 2.2 0 0 0-2.2 2.2v5a2.2 2.2 0 0 0 2.2 2.2h3.9" />
              <rect x="3.1" y="24" width="25.8" height="2.4" rx="1.2" fill="#09090b" stroke="none" />
            </g>
          </svg>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 30, fontWeight: 800 }}>{siteDefaults.brand.name}</span>
            <span style={{ fontSize: 18, color: "#a1a1aa", letterSpacing: 4, textTransform: "uppercase" }}>
              Performance Marketing
            </span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: title.length > 60 ? 58 : 70, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, color: "#d4d4d8" }}>
          <div style={{ width: 56, height: 6, borderRadius: 3, background: "#FACC15" }} />
          {siteDefaults.brand.tagline}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Signed URLs are stable per title, so let the CDN serve repeats instead of re-rendering.
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
