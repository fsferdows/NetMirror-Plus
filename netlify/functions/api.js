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

function cleanTitle(title) {
  if (!title) return "";
  return title
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCanonical(title) {
  if (!title) return "";
  return title
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\[.*?\]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\bS\d+(-S\d+)?\b/gi, "")
    .replace(/\bSeason\s*\d+\b/gi, "")
    .replace(/\b(Hindi|English|Tamil|Telugu|Kannada|Malayalam|Bengali|Dubbed|Multi|Dual\s*Audio)\b/gi, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function mapItem(item) {
  if (!item || !item.id) return null;
  const idStr = String(item.id);
  const rawTitle = (item.title || "Untitled").trim();
  const title = cleanTitle(rawTitle);
  const mediaType = item.media_type === "tv" || item.type === "TV series" || item.type === "tv" ? "series" : "movie";

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

function getPlatformUrl(platformKey, pageIdx, params) {
  let url;
  switch (platformKey) {
    case "netflix":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=netflix&items_per_page=30`;
      break;
    case "primevideo":
    case "prime":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=primeVideo&items_per_page=30`;
      break;
    case "disney":
    case "hotstar":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=disney&items_per_page=30`;
      break;
    case "appletv":
    case "apple":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=appleTV&items_per_page=30`;
      break;
    case "hulu":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=hulu&items_per_page=30`;
      break;
    case "zee5":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=zee5&items_per_page=30`;
      break;
    case "viu":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=viu&items_per_page=30`;
      break;
    case "vivamax":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=vivamax&items_per_page=30`;
      break;
    case "hoichoi":
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=hoichoi&items_per_page=30`;
      break;
    // Studio Universes
    case "marvel":
      url = `https://api2.imdb3.shop/api/tranding?id=42&items_per_page=18&page=${pageIdx}`;
      break;
    case "dc":
      url = `https://api2.imdb3.shop/api/tranding?id=58&items_per_page=18&page=${pageIdx}`;
      break;
    case "anime":
      url = `https://api2.imdb3.shop/api/tranding?id=30&items_per_page=18&page=${pageIdx}`;
      break;
    case "kdrama":
      url = `https://api2.imdb3.shop/api/tranding?id=18&items_per_page=18&page=${pageIdx}`;
      break;
    case "bollywood":
      url = `https://api2.imdb3.shop/api/tranding?id=14&items_per_page=18&page=${pageIdx}`;
      break;
    case "hollywood":
      url = `https://api2.imdb3.shop/api/tranding?id=13&items_per_page=18&page=${pageIdx}`;
      break;
    case "boxoffice":
      url = `https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=${pageIdx}`;
      break;
    default:
      url = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=${platformKey}&items_per_page=30`;
  }

  if (params && params.media_type === "movie") url += "&type=1";
  else if (params && (params.media_type === "tv" || params.media_type === "series")) url += "&type=2";

  if (params && params.sort_by === "rating") url += "&sort_by=rating";
  else if (params && params.sort_by === "date") url += "&sort_by=date";

  return url;
}

async function handlePlatformContent(params) {
  const rawName = (params.name || "netflix").toLowerCase().replace(/[\s-]/g, "");
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageIdx = page - 1;

  let displayName;
  let platformKey = rawName;

  switch (rawName) {
    case "netflix":
      displayName = "Netflix Originals";
      break;
    case "prime":
    case "primevideo":
    case "amazon":
      displayName = "Prime Video Exclusives";
      platformKey = "primeVideo";
      break;
    case "disney":
    case "hotstar":
      displayName = "Disney+ Hotstar";
      break;
    case "apple":
    case "appletv":
      displayName = "Apple TV+ Originals";
      platformKey = "appleTV";
      break;
    case "hulu":
      displayName = "Hulu Exclusives";
      break;
    case "zee5":
      displayName = "Zee5 Exclusives";
      break;
    case "viu":
      displayName = "Viu Asian Dramas";
      break;
    case "vivamax":
      displayName = "Vivamax Filipino";
      break;
    case "hoichoi":
      displayName = "Hoichoi Bengali";
      break;
    case "marvel":
      displayName = "Marvel Cinematic Universe";
      break;
    case "dc":
      displayName = "DC Studios Universe";
      break;
    case "anime":
      displayName = "Anime [English Dubbed]";
      break;
    case "kdrama":
      displayName = "Korean K-Drama";
      break;
    case "bollywood":
      displayName = "Bollywood Blockbusters";
      break;
    case "hollywood":
      displayName = "Hollywood Hits";
      break;
    case "boxoffice":
      displayName = "Top All-Time Box Office";
      break;
    default:
      displayName = `${params.name} Titles`;
  }

  const isUniverse = ["marvel", "dc", "anime", "kdrama", "bollywood", "hollywood", "boxoffice"].includes(platformKey);
  const upstreamPages = isUniverse
    ? [pageIdx * 2, pageIdx * 2 + 1]
    : [pageIdx * 3, pageIdx * 3 + 1, pageIdx * 3 + 2];

  const pageJsons = await Promise.all(
    upstreamPages.map(async (p) => {
      const url = getPlatformUrl(platformKey, p, params);
      try {
        const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
        if (!res.ok) return null;
        return await res.json();
      } catch {
        return null;
      }
    })
  );

  const validJsons = pageJsons.filter(Boolean);
  if (validJsons.length === 0) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Failed to fetch platform items" }),
    };
  }

  const first = validJsons[0];
  const rawTotal = first.pager?.total_results || first.total_results || 300;
  const totalResults = isUniverse ? rawTotal : Math.max(30, Math.floor(rawTotal * 0.45));
  const totalPages = Math.max(1, Math.ceil(totalResults / 30));

  const rawResults = validJsons.flatMap((j) => j.results || []);
  const seenCanonical = new Set();
  const items = [];

  for (const raw of rawResults) {
    if (!raw || !raw.id || !raw.title) continue;
    const canon = getCanonical(raw.title);
    if (!canon || seenCanonical.has(canon)) continue;
    seenCanonical.add(canon);
    const mapped = mapItem(raw);
    if (mapped) {
      items.push(mapped);
      if (items.length >= 30) break;
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
    },
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
  const [
    tre0, tre1,
    net0, net1,
    pri0, pri1,
    dis0, dis1,
    mov0, mov1,
    ser0, ser1
  ] = await Promise.all([
    fetch("https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=0", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=1", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=netflix&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=1&platform=netflix&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=primeVideo&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=1&platform=primeVideo&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&platform=disney&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=1&platform=disney&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&type=1&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=1&type=1&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=0&type=2&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
    fetch("https://api2.imdb3.shop/api/movies/list/filter?page=1&type=2&items_per_page=30", { headers: { "User-Agent": USER_AGENT } }).then(r => r.json()).catch(() => ({})),
  ]);

  const globalSeen = new Set();

  function pickUnique(rawLists, maxCount = 14) {
    const list = [];
    const flattened = rawLists.flatMap(r => r?.results || []);
    for (const raw of flattened) {
      if (!raw || !raw.id || !raw.title) continue;
      const canon = getCanonical(raw.title);
      if (!canon || globalSeen.has(canon)) continue;
      globalSeen.add(canon);
      const mapped = mapItem(raw);
      if (mapped) {
        list.push(mapped);
        if (list.length >= maxCount) break;
      }
    }
    return list;
  }

  // 1. Hero Slides: 5 distinct blockbusters
  const heroSlides = pickUnique([tre0, tre1], 5);
  const hero = heroSlides[0] || null;

  // 2. Trending Now: next 14 trending blockbusters (zero duplicate with hero!)
  const trending = pickUnique([tre0, tre1], 14);

  // 3. Netflix Originals: 14 unique titles (zero duplicate with above, no language dub repeats!)
  const netflix = pickUnique([net0, net1], 14);

  // 4. Prime Video Exclusives: 14 unique titles
  const prime = pickUnique([pri0, pri1], 14);

  // 5. Disney+ Hotstar: 14 unique titles
  const disney = pickUnique([dis0, dis1], 14);

  // 6. Popular Movies: 14 real movie titles from type=1 (NOT netflix duplicate!)
  const movies = pickUnique([mov0, mov1], 14);

  // 7. TV Series: 14 real series titles from type=2 (NOT prime duplicate!)
  const series = pickUnique([ser0, ser1], 14);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=120, s-maxage=300, stale-while-revalidate=600"
    },
    body: JSON.stringify({
      hero,
      hero_slides: heroSlides,
      trending,
      netflix,
      prime,
      disney,
      movies,
      series,
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
  const seen = new Set();
  const items = [];
  for (const raw of (json.results || [])) {
    if (!raw || !raw.id || !raw.title) continue;
    const canon = getCanonical(raw.title);
    if (!canon || seen.has(canon)) continue;
    seen.add(canon);
    const mapped = mapItem(raw);
    if (mapped) items.push(mapped);
  }

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

  const url = `https://api2.imdb4.shop/suggest.php?q=${encodeURIComponent(q.toLowerCase())}&p=12`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify([]),
    };
  }

  const json = await res.json();
  const seen = new Set();
  const suggestions = [];
  for (const raw of (json.results || [])) {
    if (!raw || !raw.title) continue;
    const canon = getCanonical(raw.title);
    if (!canon || seen.has(canon)) continue;
    seen.add(canon);
    suggestions.push(cleanTitle(raw.title));
  }

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

