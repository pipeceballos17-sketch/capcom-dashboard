// /api/pending — proxies BOTH engines' pending gates. Tokens stay server-side.
// Env vars (set in Vercel): A_URL, A_TOKEN, B_URL, B_TOKEN

export const config = { runtime: "edge" };

async function fetchPending(url, token) {
  try {
    const r = await fetch(`${url}/v1/capcom/pending`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: "{}",
    });
    if (!r.ok) return { ok: false, status: r.status, items: [] };
    const data = await r.json();
    return { ok: true, items: Array.isArray(data) ? data : [] };
  } catch (e) {
    return { ok: false, error: String(e), items: [] };
  }
}

export default async function handler() {
  const [a, b] = await Promise.all([
    fetchPending(process.env.A_URL, process.env.A_TOKEN),
    fetchPending(process.env.B_URL, process.env.B_TOKEN),
  ]);
  return new Response(JSON.stringify({ a, b }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
