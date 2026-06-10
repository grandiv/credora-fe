import { NextRequest, NextResponse } from "next/server";

/**
 * Same-origin proxy to the Credora backend.
 * The browser calls `/api/credora/...` (no CORS); this route forwards to the
 * real backend at CREDORA_API. Keeps the backend base URL server-side and
 * works identically in local dev and on Vercel.
 */
const BACKEND =
  process.env.CREDORA_API ??
  process.env.NEXT_PUBLIC_CREDORA_API ??
  "http://localhost:8787";

async function forward(req: NextRequest, path: string[]) {
  const target = `${BACKEND}/api/${path.join("/")}${req.nextUrl.search}`;
  const init: RequestInit = {
    method: req.method,
    headers: { "content-type": "application/json" },
    // pass body for POST
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await req.text(),
    cache: "no-store",
  };
  try {
    const res = await fetch(target, init);
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "backend_unreachable", detail: String(err) },
      { status: 502 },
    );
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return forward(req, path);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return forward(req, path);
}
