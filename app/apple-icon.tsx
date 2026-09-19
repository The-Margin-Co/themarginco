import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon: the TMC monogram (same paths as app/icon.svg and the navbar logo).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32">
        <rect width="32" height="32" fill="#FACC15" />
        <g transform="translate(0 -1.7)" fill="none" stroke="#09090B" strokeWidth="2.6" strokeLinejoin="round">
          <path d="M3.1 10.3H10.5M6.8 10.3V21" />
          <path d="M13.6 21V10.5l2.4 5 2.4-5V21" />
          <path d="M28.9 10.3H25a2.2 2.2 0 0 0-2.2 2.2v5a2.2 2.2 0 0 0 2.2 2.2h3.9" />
          <rect x="3.1" y="24" width="25.8" height="2.4" rx="1.2" fill="#09090B" stroke="none" />
        </g>
      </svg>
    ),
    size,
  );
}
