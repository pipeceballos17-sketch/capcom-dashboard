// /api/action — proxies propose / approve / register to the right engine.
// Body: { side: "a"|"b", op: "propose"|"approve"|"register", payload: {...} }
// Tokens stay server-side (env: A_URL, A_TOKEN, B_URL, B_TOKEN).

export const config = { runtime: "edge" };

const OP_PATH = {
  propose: "/v1/capcom/propose",
  approve: "/v1/capcom/approve",
  register: "/v1/capcom/peers",
  compose: "/v1/capcom/compose",
};

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400 });
  }
  const { side, op, payload } = body;
  const path = OP_PATH[op];
  if (!path || (side !== "a" && side !== "b")) {
    return new Response(JSON.stringify({ error: "bad side or op" }), { status: 400 });
  }
  const url = side === "a" ? process.env.A_URL : process.env.B_URL;
  const token = side === "a" ? process.env.A_TOKEN : process.env.B_TOKEN;

  try {
    const r = await fetch(`${url}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload ?? {}),
    });
    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 502 });
  }
}
