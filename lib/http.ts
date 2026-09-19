/**
 * CSRF guard for route handlers (Server Actions get one from Next; route handlers don't).
 * A request is accepted when its Origin matches the host it was sent to. Requests without an
 * Origin header (some same-site navigations, curl) must at least be marked same-origin by the
 * browser through Sec-Fetch-Site. A malformed Origin (e.g. the literal "null" sent from a
 * sandboxed iframe) is rejected instead of throwing.
 */
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    const site = request.headers.get("sec-fetch-site");
    return site === null || site === "same-origin" || site === "none";
  }
  try {
    const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function jsonError(error: string, status: number) {
  return Response.json({ error }, { status });
}
