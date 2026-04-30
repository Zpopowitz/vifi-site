// Decap CMS OAuth proxy — callback endpoint.
//
// GitHub redirects the editor here with ?code=... after they approve
// the OAuth app. We exchange the code for an access token (server-
// side, using the OAuth app's client secret), then post the token
// back to the Decap admin window via window.opener.postMessage().

export default async function handler(req, res) {
  const code = req.query.code;
  if (!code) {
    res.status(400).send("Missing 'code' query param");
    return;
  }

  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send("OAuth app credentials are not configured in Vercel env vars");
    return;
  }

  let token;
  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });
    const data = await tokenRes.json();
    if (data.error || !data.access_token) {
      res.status(500).send(`GitHub OAuth exchange failed: ${data.error_description || data.error || "unknown"}`);
      return;
    }
    token = data.access_token;
  } catch (err) {
    res.status(500).send(`Token exchange request failed: ${err.message}`);
    return;
  }

  // Hand the token back to Decap via postMessage.
  // Decap listens for 'authorization:github:success:{...}'.
  const payload = JSON.stringify({ token, provider: "github" });
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>OAuth complete</title></head>
<body>
<script>
  (function () {
    function send(msg) {
      window.opener && window.opener.postMessage(msg, "*");
    }
    window.addEventListener("message", function (e) {
      if (e.data === "authorizing:github") {
        send("authorization:github:success:${payload.replace(/"/g, '\\"')}");
      }
    });
    // Initial nudge in case Decap is already listening.
    send("authorization:github:success:${payload.replace(/"/g, '\\"')}");
    setTimeout(function () { window.close(); }, 800);
  })();
</script>
<p>Authentication complete. You can close this window.</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}
