/**
 * NetMirror Plus - Netlify Serverless API Function
 * Provides instant, autonomous API support on Netlify Edge & Serverless
 */

const PLATFORMS = [
  {
    key: "netflix",
    name: "Netflix",
    subtitle: "Originals & Exclusives",
    badge: "2,200+ Titles",
    count_label: "2,271 Titles",
    color: "#E50914",
    bg_gradient: "linear-gradient(135deg, rgba(229,9,20,0.35) 0%, rgba(20,20,20,0.92) 100%)",
  },
  {
    key: "primeVideo",
    name: "Prime Video",
    subtitle: "Amazon Exclusives",
    badge: "900+ Titles",
    count_label: "907 Titles",
    color: "#00A8E1",
    bg_gradient: "linear-gradient(135deg, rgba(0,168,225,0.35) 0%, rgba(14,25,39,0.92) 100%)",
  },
  {
    key: "disney",
    name: "Disney+",
    subtitle: "Marvel, Star Wars & Pixar",
    badge: "210+ Titles",
    count_label: "212 Titles",
    color: "#113CCF",
    bg_gradient: "linear-gradient(135deg, rgba(17,60,207,0.35) 0%, rgba(15,42,47,0.92) 100%)",
  },
  {
    key: "appleTV",
    name: "Apple TV+",
    subtitle: "Award-Winning Originals",
    badge: "260+ Titles",
    count_label: "262 Titles",
    color: "#A2AAAD",
    bg_gradient: "linear-gradient(135deg, rgba(162,170,173,0.25) 0%, rgba(16,17,20,0.92) 100%)",
  },
  {
    key: "hulu",
    name: "Hulu",
    subtitle: "Exclusive Series & Docs",
    badge: "250+ Titles",
    count_label: "259 Titles",
    color: "#1CE783",
    bg_gradient: "linear-gradient(135deg, rgba(28,231,131,0.3) 0%, rgba(14,51,57,0.92) 100%)",
  },
  {
    key: "zee5",
    name: "Zee5",
    subtitle: "Indian Cinema & Blockbusters",
    badge: "240+ Titles",
    count_label: "248 Titles",
    color: "#8230C6",
    bg_gradient: "linear-gradient(135deg, rgba(130,48,198,0.35) 0%, rgba(13,31,54,0.92) 100%)",
  },
  {
    key: "viu",
    name: "Viu",
    subtitle: "Asian Dramas & Shows",
    badge: "220+ Titles",
    count_label: "222 Titles",
    color: "#FAAF00",
    bg_gradient: "linear-gradient(135deg, rgba(250,175,0,0.3) 0%, rgba(60,51,29,0.92) 100%)",
  },
  {
    key: "vivamax",
    name: "Vivamax",
    subtitle: "Filipino Exclusives",
    badge: "100+ Titles",
    count_label: "104 Titles",
    color: "#E85D04",
    bg_gradient: "linear-gradient(135deg, rgba(232,93,4,0.35) 0%, rgba(52,35,16,0.92) 100%)",
  },
  {
    key: "hoichoi",
    name: "Hoichoi",
    subtitle: "Bengali Originals",
    badge: "New",
    count_label: "13 Titles",
    color: "#EF4444",
    bg_gradient: "linear-gradient(135deg, rgba(239,68,68,0.35) 0%, rgba(45,18,18,0.92) 100%)",
  },
];

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)";

function mapItem(item) {
  if (!item || !item.id) return null;
  const idStr = String(item.id);
  const title = (item.title || "Untitled").trim();
  const mediaType = item.media_type === "tv" || item.type === "TV series" ? "series" : "movie";

  let year = "2026";
  if (item.release_date) {
    const raw = String(item.release_date);
    if (raw.length === 10 && /^\d+$/.test(raw)) {
      const ts = parseInt(raw, 10);
      year = String(new Date(ts * 1000).getFullYear());
    } else if (raw.length >= 4) {
      year = raw.slice(0, 4);
    }
  }

  let posterUrl = item.backdrop_path || item.poster_path || item.cover || null;
  if (posterUrl && !posterUrl.startsWith("http")) {
    posterUrl = "https://image.tmdb.org/t/p/w500" + posterUrl;
  }

  return {
    id: { provider: "moviebox", value: idStr },
    title,
    media_type: mediaType,
    year,
    poster_url: posterUrl,
    season_count: null,
  };
}

async function resolveImdbId(title, yearHint) {
  if (!title) return null;
  const clean = title.replace(/\[.*?\]|\(.*?\)|S\d+(-S\d+)?/gi, "").trim();
  const term = clean.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (!term) return null;

  try {
    const firstChar = term[0] || "a";
    const url = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${term}.json`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const json = await res.json();
    const list = json.d || [];
    if (yearHint) {
      const y = parseInt(yearHint, 10);
      for (const item of list) {
        if (item.y && Math.abs(item.y - y) <= 1 && item.id) return item.id;
      }
    }
    return list[0]?.id || null;
  } catch {
    return null;
  }
}

async function handlePlatforms() {
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(PLATFORMS),
  };
}

async function handlePlatformContent(params) {
  const rawName = (params.name || "netflix").toLowerCase().replace(/[\s-]/g, "");
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageIdx = page - 1;

  let url;
  let displayName;
  let platformKey = rawName;

  switch (rawName) {
    case "netflix":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=netflix`;
      displayName = "Netflix Originals";
      break;
    case "prime":
    case "primevideo":
    case "amazon":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=primeVideo`;
      displayName = "Prime Video Exclusives";
      platformKey = "primeVideo";
      break;
    case "disney":
    case "hotstar":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=disney`;
      displayName = "Disney+ Hotstar";
      break;
    case "apple":
    case "appletv":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=appleTV`;
      displayName = "Apple TV+ Originals";
      platformKey = "appleTV";
      break;
    case "hulu":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=hulu`;
      displayName = "Hulu Exclusives";
      break;
    case "zee5":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=zee5`;
      displayName = "Zee5 Exclusives";
      break;
    case "viu":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=viu`;
      displayName = "Viu Asian Dramas";
      break;
    case "vivamax":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=vivamax`;
      displayName = "Vivamax Filipino";
      break;
    case "hoichoi":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=hoichoi`;
      displayName = "Hoichoi Bengali";
      break;
    // Studio Universes
    case "marvel":
      url = `https://api2.imdb3.shop/api/tranding?id=42&items_per_page=18&page=${pageIdx}`;
      displayName = "Marvel Cinematic Universe";
      break;
    case "dc":
      url = `https://api2.imdb3.shop/api/tranding?id=58&items_per_page=18&page=${pageIdx}`;
      displayName = "DC Studios Universe";
      break;
    case "anime":
      url = `https://api2.imdb3.shop/api/tranding?id=30&items_per_page=18&page=${pageIdx}`;
      displayName = "Anime [English Dubbed]";
      break;
    case "kdrama":
      url = `https://api2.imdb3.shop/api/tranding?id=18&items_per_page=18&page=${pageIdx}`;
      displayName = "Korean K-Drama";
      break;
    case "bollywood":
      url = `https://api2.imdb3.shop/api/tranding?id=14&items_per_page=18&page=${pageIdx}`;
      displayName = "Bollywood Blockbusters";
      break;
    case "hollywood":
      url = `https://api2.imdb3.shop/api/tranding?id=13&items_per_page=18&page=${pageIdx}`;
      displayName = "Hollywood Hits";
      break;
    case "boxoffice":
      url = `https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=${pageIdx}`;
      displayName = "Top All-Time Box Office";
      break;
    default:
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=${rawName}`;
      displayName = `${params.name} Titles`;
  }

  if (params.media_type === "movie") url += "&type=1";
  else if (params.media_type === "tv" || params.media_type === "series") url += "&type=2";

  if (params.sort_by === "rating") url += "&sort_by=rating";
  else if (params.sort_by === "date") url += "&sort_by=date";

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to fetch platform items" }),
    };
  }

  const json = await res.json();
  const totalResults = json.pager?.total_results || json.total_results || (json.results?.length || 0);
  const totalPages = json.pager?.total_pages || json.total_pages || 1;
  const items = (json.results || []).map(mapItem).filter(Boolean);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      platform: platformKey,
      display_name: displayName,
      page,
      total_pages: totalPages,
      total_results: totalResults,
      items,
    }),
  };
}

async function handleBrowse() {
  const [netRes, priRes, disRes, treRes] = await Promise.all([
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=netflix", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=primeVideo", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=disney", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=0", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
  ]);

  const netflix = (netRes.results || []).map(mapItem).filter(Boolean).slice(0, 12);
  const prime = (priRes.results || []).map(mapItem).filter(Boolean).slice(0, 12);
  const disney = (disRes.results || []).map(mapItem).filter(Boolean).slice(0, 12);
  const trending = (treRes.results || []).map(mapItem).filter(Boolean);

  const heroSlides = trending.slice(0, 6);
  const hero = heroSlides[0] || netflix[0] || null;

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      hero,
      hero_slides: heroSlides,
      trending,
      netflix,
      prime,
      disney,
      movies: netflix,
      series: prime,
    }),
  };
}

async function handleSearch(params) {
  const q = (params.q || "").trim();
  if (!q) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify([]),
    };
  }

  const url = `https://api2.imdb4.shop/suggest.php?q=${encodeURIComponent(q.toLowerCase())}&p=24`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify([]),
    };
  }

  const json = await res.json();
  const items = (json.results || []).map(mapItem).filter(Boolean);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(items),
  };
}

async function handleSuggest(params) {
  const q = (params.q || "").trim();
  if (!q) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify([]),
    };
  }

  const url = `https://api2.imdb4.shop/suggest.php?q=${encodeURIComponent(q.toLowerCase())}&p=8`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify([]),
    };
  }

  const json = await res.json();
  const suggestions = (json.results || []).map(i => i.title).filter(Boolean);

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(suggestions),
  };
}

async function handleDetails(id) {
  for (const mtype of ["movie", "tv"]) {
    const url = `https://api2.imdb3.shop/api/${mtype}/${id}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const json = await res.json();
        const first = json.results?.[0];
        if (first) {
          const isSeries = mtype === "tv";
          const title = (first.title || "Untitled").trim();
          let year = "2026";
          if (first.release_date) {
            const raw = String(first.release_date);
            if (raw.length === 10 && /^\d+$/.test(raw)) {
              year = String(new Date(parseInt(raw, 10) * 1000).getFullYear());
            } else if (raw.length >= 4) {
              year = raw.slice(0, 4);
            }
          }

          let posterUrl = first.backdrop_path || first.poster_path || null;
          if (posterUrl && !posterUrl.startsWith("http")) {
            posterUrl = "https://image.tmdb.org/t/p/w500" + posterUrl;
          }

          // Build season & episode list if series
          const seasons = [];
          if (isSeries && first.season) {
            const sCount = parseInt(first.season, 10) || 1;
            for (let s = 1; s <= sCount; s++) {
              const episodes = [];
              const epCount = 10;
              for (let ep = 1; ep <= epCount; ep++) {
                episodes.push({
                  episode_number: ep,
                  title: `Episode ${ep}`,
                  duration: null,
                });
              }
              seasons.push({ season_number: s, episodes });
            }
          }

          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({
              id: { provider: "moviebox", value: id },
              title,
              media_type: isSeries ? "series" : "movie",
              year,
              description: first.dis ? first.dis.replace(/^"|"$/g, "") : "Stream directly in browser.",
              tagline: null,
              imdb_rating: first.vote_average ? String(first.vote_average) : "8.5",
              director: first.director || null,
              stars: first.star || null,
              prints: null,
              audios: null,
              poster_url: posterUrl,
              duration: first.duration ? `${first.duration} min` : (isSeries ? "45 min/ep" : "118 min"),
              genres: first.genre || [],
              seasons,
              dubs: [],
            }),
          };
        }
      }
    } catch {}
  }

  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: "Details not found" }),
  };
}

async function handleStreams(id, params) {
  let title = params.title || "";
  let yearHint = null;
  let isSeries = false;

  // Fetch title if not provided
  for (const mtype of ["movie", "tv"]) {
    try {
      const res = await fetch(`https://api2.imdb3.shop/api/${mtype}/${id}`, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const json = await res.json();
        const first = json.results?.[0];
        if (first) {
          title = first.title;
          isSeries = mtype === "tv" || !!params.season;
          if (first.release_date) {
            const raw = String(first.release_date);
            yearHint = raw.length === 10 ? String(new Date(parseInt(raw, 10) * 1000).getFullYear()) : raw.slice(0, 4);
          }
          break;
        }
      }
    } catch {}
  }

  const season = parseInt(params.season || "1", 10);
  const episode = parseInt(params.episode || "1", 10);

  const imdbId = await resolveImdbId(title, yearHint);
  const embedUrls = [];

  if (imdbId) {
    if (isSeries) {
      embedUrls.push({ name: "VidSrc Cloud (Fast)", url: `https://vidsrc.pm/embed/tv/${imdbId}/${season}/${episode}` });
      embedUrls.push({ name: "VidSrc Pro (HD)", url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}` });
      embedUrls.push({ name: "MultiEmbed VIP", url: `https://multiembed.mov/?video_id=${imdbId}&s=${season}&e=${episode}` });
      embedUrls.push({ name: "2Embed Cinema", url: `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}` });
      embedUrls.push({ name: "VidLink Stream", url: `https://vidlink.pro/tv/${imdbId}/${season}/${episode}` });
    } else {
      embedUrls.push({ name: "VidSrc Cloud (Fast)", url: `https://vidsrc.pm/embed/movie/${imdbId}` });
      embedUrls.push({ name: "VidSrc Pro (HD)", url: `https://vidsrc.to/embed/movie/${imdbId}` });
      embedUrls.push({ name: "MultiEmbed VIP", url: `https://multiembed.mov/?video_id=${imdbId}` });
      embedUrls.push({ name: "2Embed Cinema", url: `https://www.2embed.cc/embed/${imdbId}` });
      embedUrls.push({ name: "VidLink Stream", url: `https://vidlink.pro/movie/${imdbId}` });
    }
  } else {
    const cleanTitle = encodeURIComponent(title.replace(/\[.*?\]|\(.*?\)/g, "").trim());
    if (isSeries) {
      embedUrls.push({ name: "VidSrc Cloud (Fast)", url: `https://vidsrc.pm/embed/tv?title=${cleanTitle}&season=${season}&episode=${episode}` });
      embedUrls.push({ name: "MultiEmbed VIP", url: `https://multiembed.mov/?video_id=${cleanTitle}&s=${season}&e=${episode}` });
    } else {
      embedUrls.push({ name: "VidSrc Cloud (Fast)", url: `https://vidsrc.pm/embed/movie?title=${cleanTitle}` });
      embedUrls.push({ name: "MultiEmbed VIP", url: `https://multiembed.mov/?video_id=${cleanTitle}` });
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({
      releases: [],
      streams: [],
      default_stream_url: null,
      resource_id: null,
      embed_urls: embedUrls,
    }),
  };
}

exports.handler = async (event) => {
  const path = event.path || "";
  const params = event.queryStringParameters || {};

  // Strip prefixes
  const cleanPath = path
    .replace(/^\/\.netlify\/functions\/api/, "")
    .replace(/^\/api/, "")
    .replace(/\/+$/, "") || "/";

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      },
      body: "",
    };
  }

  if (cleanPath === "/platforms") {
    return handlePlatforms();
  }
  if (cleanPath === "/platform") {
    return handlePlatformContent(params);
  }
  if (cleanPath === "/browse" || cleanPath === "/homepage") {
    return handleBrowse();
  }
  if (cleanPath === "/search") {
    return handleSearch(params);
  }
  if (cleanPath === "/suggest") {
    return handleSuggest(params);
  }
  if (cleanPath.startsWith("/details/")) {
    const id = cleanPath.replace("/details/", "");
    return handleDetails(id);
  }
  if (cleanPath.startsWith("/streams/")) {
    const id = cleanPath.replace("/streams/", "");
    return handleStreams(id, params);
  }

  return {
    statusCode: 404,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ error: `Not found: ${cleanPath}` }),
  };
};
