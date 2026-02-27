// Vercel serverless function — exchanges Slack OAuth code for user token
// Env vars required: SLACK_CLIENT_ID, SLACK_CLIENT_SECRET

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  const clientId     = process.env.SLACK_CLIENT_ID;
  const clientSecret = process.env.SLACK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Slack credentials not configured" });
  }

  try {
    const resp = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     clientId,
        client_secret: clientSecret,
        code:          code,
        redirect_uri:  `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}/api/slack-callback`
      })
    });

    const data = await resp.json();

    if (!data.ok) {
      // Redirect back with error
      const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
      return res.redirect(302, `${origin}/#slack_error=${encodeURIComponent(data.error)}`);
    }

    // User token is in data.authed_user.access_token
    const userToken = data.authed_user?.access_token;
    const userId    = data.authed_user?.id;

    if (!userToken) {
      const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
      return res.redirect(302, `${origin}/#slack_error=no_user_token`);
    }

    // Redirect back to app with token in hash fragment (never in query string)
    const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
    return res.redirect(302, `${origin}/#slack_token=${userToken}&slack_user_id=${userId}`);

  } catch (err) {
    const origin = `${req.headers["x-forwarded-proto"] || "https"}://${req.headers.host}`;
    return res.redirect(302, `${origin}/#slack_error=${encodeURIComponent(err.message)}`);
  }
}
