// Vercel serverless proxy for Slack API calls
// Needed because Slack's Web API doesn't support CORS from browsers

export default async function handler(req, res) {
  // Allow POST only
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { method, params } = req.body || {};
  const token = req.headers["x-slack-token"];

  if (!method || !token) {
    return res.status(400).json({ error: "Missing method or token" });
  }

  // Whitelist allowed Slack methods
  const ALLOWED = [
    "users.list",
    "conversations.list",
    "conversations.history",
  ];
  if (!ALLOWED.includes(method)) {
    return res.status(403).json({ error: `Method ${method} not allowed` });
  }

  try {
    const url = new URL(`https://slack.com/api/${method}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const resp = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Forward rate-limit headers
    if (resp.status === 429) {
      const retryAfter = resp.headers.get("Retry-After") || "5";
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({ ok: false, error: "rate_limited", retry_after: parseInt(retryAfter) });
    }

    const data = await resp.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
