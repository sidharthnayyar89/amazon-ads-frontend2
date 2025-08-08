export async function GET(req: Request) {
  const backend = 'https://amazons-ads-backend.onrender.com';
  const { search } = new URL(req.url); // keep ?limit=... params
  const upstream = `${backend}/api/sp/keywords${search}`;

  const res = await fetch(upstream, { cache: 'no-store' });

  // Pass through the body & status; default content-type to JSON if missing
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') || 'application/json' }
  });
}
