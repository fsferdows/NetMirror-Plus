// Vercel Serverless Function entry point for MovieBox / NetMirror Plus API
const { handler: netlifyHandler } = require("../netlify/functions/api");
const tmdbHandler = require("./tmdb");

module.exports = async (req, res) => {
  try {
    const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost";
    const proto = req.headers["x-forwarded-proto"] || "https";
    const fullUrl = new URL(req.url, `${proto}://${host}`);

    if (fullUrl.pathname === "/api/tmdb" || fullUrl.pathname.startsWith("/api/tmdb/") || fullUrl.pathname === "/tmdb" || fullUrl.pathname.startsWith("/tmdb/")) {
      return tmdbHandler(req, res);
    }

    // Parse query params into simple key-value dictionary
    const queryStringParameters = {};
    for (const [key, value] of fullUrl.searchParams.entries()) {
      queryStringParameters[key] = value;
    }
    if (req.query && typeof req.query === "object") {
      for (const [key, value] of Object.entries(req.query)) {
        if (key !== "path" && key !== "route" && !(key in queryStringParameters)) {
          queryStringParameters[key] = value;
        }
      }
    }

    const event = {
      path: fullUrl.pathname,
      httpMethod: req.method || "GET",
      headers: req.headers || {},
      queryStringParameters,
      body: typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}),
    };

    const result = await netlifyHandler(event);

    if (result.headers) {
      for (const [key, val] of Object.entries(result.headers)) {
        res.setHeader(key, val);
      }
    }

    const statusCode = result.statusCode || 200;
    if (typeof res.status === "function") {
      res.status(statusCode);
    } else {
      res.statusCode = statusCode;
    }

    if (result.isBase64Encoded) {
      const buf = Buffer.from(result.body, "base64");
      if (typeof res.send === "function") {
        res.send(buf);
      } else {
        res.end(buf);
      }
    } else {
      if (typeof res.send === "function") {
        res.send(result.body);
      } else {
        res.end(result.body);
      }
    }
  } catch (err) {
    console.error("Vercel API error:", err);
    const errBody = JSON.stringify({ error: "Internal Server Error", message: err.message });
    if (typeof res.status === "function") {
      res.status(500);
    } else {
      res.statusCode = 500;
    }
    res.setHeader("Content-Type", "application/json");
    if (typeof res.send === "function") {
      res.send(errBody);
    } else {
      res.end(errBody);
    }
  }
};
