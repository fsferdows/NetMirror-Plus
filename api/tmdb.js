// Serverless API endpoint for TMDB API v3 Proxy
// Receives endpoint and query parameters from frontend and fetches from https://api.themoviedb.org/3
// Supports TMDB_READ_ACCESS_TOKEN (Bearer) and TMDB_API_KEY (query param) from process.env

const USER_AGENT = "MovieBox-NetMirror/2.0 (Vercel-Proxy; Node.js)";
const DEFAULT_KEY = "15d2ea6d0dc1d476efbca3eba2b9bbfb";

module.exports = async (req, res) => {
  // CORS & Cache Headers
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.setHeader("Cache-Control", "public, max-age=1800, s-maxage=1800, stale-while-revalidate=86400");
  }

  if (req.method === "OPTIONS") {
    if (typeof res.status === "function") {
      res.status(204);
    } else {
      res.statusCode = 204;
    }
    return typeof res.end === "function" ? res.end() : null;
  }

  try {
    const host = req.headers?.["x-forwarded-host"] || req.headers?.host || "localhost";
    const proto = req.headers?.["x-forwarded-proto"] || "https";
    const fullUrl = new URL(req.url, `${proto}://${host}`);

    // Extract endpoint parameter from query string or URL
    let endpoint = req.query?.endpoint || fullUrl.searchParams.get("endpoint");
    if (!endpoint) {
      // Check path suffix e.g. /api/tmdb/trending/all/week
      const pathname = fullUrl.pathname.replace(/^\/api\/tmdb/, "").replace(/^\/tmdb/, "");
      endpoint = pathname || "/trending/all/week";
    }

    // Ensure endpoint begins with /
    if (!endpoint.startsWith("/")) {
      endpoint = "/" + endpoint;
    }

    // Determine API Key / Read Access Token
    const readToken = process.env.TMDB_READ_ACCESS_TOKEN;
    const apiKey = process.env.TMDB_API_KEY ||
      process.env.VITE_TMDB_API_KEY ||
      process.env.NEXT_PUBLIC_TMDB_API_KEY ||
      DEFAULT_KEY;

    const isBearer = Boolean(readToken || (apiKey && (apiKey.startsWith("ey") || apiKey.length > 40)));
    const activeToken = readToken || apiKey;

    const sep = endpoint.includes("?") ? "&" : "?";
    const targetUrl = isBearer
      ? `https://api.themoviedb.org/3${endpoint}`
      : `https://api.themoviedb.org/3${endpoint}${sep}api_key=${encodeURIComponent(apiKey)}`;

    const headers = {
      "Accept": "application/json",
      "User-Agent": USER_AGENT
    };
    if (isBearer) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }

    const upstream = await fetch(targetUrl, { headers });
    const data = await upstream.json();

    const statusCode = upstream.status || 200;
    if (typeof res.status === "function") {
      res.status(statusCode);
    } else {
      res.statusCode = statusCode;
    }

    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }

    const bodyStr = JSON.stringify(data);
    if (typeof res.send === "function") {
      return res.send(bodyStr);
    } else {
      return res.end(bodyStr);
    }
  } catch (err) {
    console.error("TMDB Proxy Error:", err);
    const errBody = JSON.stringify({
      error: "TMDB proxy failure: " + err.message,
      status: 502
    });
    if (typeof res.status === "function") {
      res.status(502);
    } else {
      res.statusCode = 502;
    }
    if (typeof res.setHeader === "function") {
      res.setHeader("Content-Type", "application/json");
    }
    if (typeof res.send === "function") {
      return res.send(errBody);
    } else {
      return res.end(errBody);
    }
  }
};
