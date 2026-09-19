"use client";

import { useEffect } from "react";

// Last-resort boundary for failures in the root layout itself (where app/error.tsx can't render).
// It replaces the whole document, so it carries its own <html>/<body> and can't use the theme tokens.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#0a0a0a",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <main>
          <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem" }}>Something went wrong</h1>
          <p style={{ margin: "0 0 1.5rem", color: "#52525b" }}>We hit an unexpected problem. Please try again.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: "#facc15",
              color: "#0a0a0a",
              border: 0,
              borderRadius: 999,
              padding: "0.75rem 1.5rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
