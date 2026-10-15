// Vercel Routing Middleware (formerly "Edge Middleware"): HTTP Basic Auth gate.
// Runs before every request, so the page and all files are protected.
//
// Credentials come from Vercel Environment Variables (never commit them):
//   BASIC_AUTH_USER      the username
//   BASIC_AUTH_PASSWORD  the password
import { next } from '@vercel/functions';

const REALM = 'Outlet performance dashboard';
const encoder = new TextEncoder();

// Hash both values first so the comparison always covers the same number of
// bytes, then compare without stopping at the first difference.
async function safeEqual(a, b) {
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function parseBasicAuth(header) {
  if (!header) return null;
  const [scheme, encoded] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'basic' || !encoded) return null;
  try {
    const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const i = decoded.indexOf(':');
    if (i < 0) return null;
    return { user: decoded.slice(0, i), pass: decoded.slice(i + 1) };
  } catch {
    return null;
  }
}

function challenge() {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}

export default async function middleware(request) {
  const expectedUser = process.env.BASIC_AUTH_USER;
  const expectedPass = process.env.BASIC_AUTH_PASSWORD;

  // Fail closed: if the variables are missing, nobody gets in.
  if (!expectedUser || !expectedPass) {
    return new Response(
      'Basic auth is not configured. Set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in the Vercel project settings.',
      { status: 503, headers: { 'Cache-Control': 'no-store', 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const creds = parseBasicAuth(request.headers.get('authorization'));
  if (!creds) return challenge();

  // Evaluate both checks (no short-circuit) so timing doesn't reveal which was wrong.
  const [userOk, passOk] = await Promise.all([
    safeEqual(creds.user, expectedUser),
    safeEqual(creds.pass, expectedPass),
  ]);
  if (!(userOk && passOk)) return challenge();

  return next();
}
