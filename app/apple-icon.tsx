import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS home-screen icon: the signature Margin mark (warm-yellow tile with bold black M).
export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg width="180" height="180" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="7" fill="#FFDB61" />
        <g fill="#111111" transform="translate(5.527, 25.000) scale(0.012278, -0.012278)">
          <path d="M145 0V1466H588L854 466L1117 1466H1561V0H1286V1154L995 0H710L420 1154V0Z" />
        </g>
      </svg>
    ),
    size,
  );
}
