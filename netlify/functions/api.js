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

const LANGUAGES = [
  { key: "hindi", name: "Hindi (Bollywood)", flag: "🇮🇳", badge: "BOLLYWOOD", color: "#EAB308", subtitle: "Hindi Cinema & Web Series" },
  { key: "japanese", name: "Japanese (Anime)", flag: "🇯🇵", badge: "ANIME", color: "#EC4899", subtitle: "Anime Series & Films" },
  { key: "korean", name: "Korean (K-Drama)", flag: "🇰🇷", badge: "K-DRAMA", color: "#F43F5E", subtitle: "K-Drama Hits & Cinema" },
  { key: "english", name: "English (Hollywood)", flag: "🇺🇸", badge: "HOLLYWOOD", color: "#06B6D4", subtitle: "Global Blockbusters" },
  { key: "spanish", name: "Spanish (Español)", flag: "🇪🇸", badge: "ESPAÑOL", color: "#F59E0B", subtitle: "Spanish & Latin Cinema" },
  { key: "french", name: "French (Français)", flag: "🇫🇷", badge: "FRANÇAIS", color: "#3B82F6", subtitle: "French Cinema & Series" },
  { key: "tamil_telugu", name: "Tamil & Telugu", flag: "🇮🇳", badge: "SOUTH CINEMA", color: "#F97316", subtitle: "Tollywood & Kollywood" },
  { key: "bengali", name: "Bengali (বাংলা)", flag: "🇧🇩", badge: "বাংলা", color: "#10B981", subtitle: "Tollywood & Bangla Hits" },
  { key: "german", name: "German (Deutsch)", flag: "🇩🇪", badge: "DEUTSCH", color: "#6366F1", subtitle: "Dark, 1899 & Cinema" },
  { key: "italian", name: "Italian (Italiano)", flag: "🇮🇹", badge: "ITALIANO", color: "#14B8A6", subtitle: "Cinema Italiano" },
  { key: "arabic", name: "Arabic (العربية)", flag: "🇸🇦", badge: "العربية", color: "#84CC16", subtitle: "Arab Cinema & Dramas" },
  { key: "turkish", name: "Turkish (Türkçe)", flag: "🇹🇷", badge: "TÜRKÇE", color: "#E11D48", subtitle: "Historical Epics & Dramas" },
  { key: "chinese", name: "Chinese (中文)", flag: "🇨🇳", badge: "C-DRAMA", color: "#D97706", subtitle: "C-Drama & Martial Arts" },
  { key: "russian", name: "Russian (Русский)", flag: "🇷🇺", badge: "РУССКИЙ", color: "#8B5CF6", subtitle: "Cinema & Sci-Fi" },
  { key: "tagalog", name: "Filipino (Tagalog)", flag: "🇵🇭", badge: "PINOY", color: "#EA580C", subtitle: "Vivamax & Pinoy Hits" },
  { key: "portuguese", name: "Portuguese", flag: "🇵🇹", badge: "PORTUGUÊS", color: "#059669", subtitle: "Brazilian & Portuguese" },
];

const LANGUAGE_SEEDS = {
  hindi: [
    "Mirzapur", "Jawan", "Pathaan", "3 Idiots", "Dangal", "Stree 2", "Animal", "Sacred Games",
    "Brahmastra", "Sholay", "Kabir Singh", "PK", "Bajrangi Bhaijaan", "Gangs of Wasseypur",
    "Panchayat", "Farzi", "The Family Man", "Lagaan", "Taare Zameen Par", "Chhichhore"
  ],
  japanese: [
    "Demon Slayer: Kimetsu no Yaiba", "Attack on Titan", "Jujutsu Kaisen", "One Piece",
    "Spirited Away", "Death Note", "Naruto Shippuden", "Bleach", "Your Name", "Chainsaw Man",
    "Solo Leveling", "Tokyo Ghoul", "Hunter x Hunter", "My Hero Academia", "Princess Mononoke",
    "Fullmetal Alchemist: Brotherhood", "Suzume", "Dragon Ball Z"
  ],
  korean: [
    "Squid Game", "All of Us Are Dead", "Crash Landing on You", "The Glory", "Parasite",
    "Train to Busan", "Sweet Home", "Vincenzo", "Business Proposal", "Guardian: The Lonely and Great God",
    "Happiness", "Extraordinary Attorney Woo", "Kingdom", "Queen of Tears", "Descendants of the Sun",
    "Itaewon Class", "Signal", "My Demon", "Hellbound"
  ],
  spanish: [
    "Money Heist", "Berlin", "Elite", "Society of the Snow", "Pan's Labyrinth", "The Platform",
    "Narcos", "Wild Tales", "Roma", "Cable Girls", "Vis a Vis", "Through My Window",
    "The Invisible Guest", "The Secret in Their Eyes", "Amores Perros"
  ],
  french: [
    "Lupin", "Anatomy of a Fall", "Amelie", "La Haine", "Portrait of a Lady on Fire",
    "The Intouchables", "Call My Agent!", "Athena", "Black Spot", "La Mante", "Oxygen",
    "A Prophet", "Blue Is the Warmest Color", "The Artist", "Les Miserables"
  ],
  tamil_telugu: [
    "RRR", "Baahubali: The Beginning", "Baahubali 2: The Conclusion", "Pushpa: The Rise",
    "Pushpa 2: The Rule", "K.G.F: Chapter 2", "Kantara", "Leo", "Jailer", "Salaar",
    "Devara: Part 1", "Kalki 2898 AD", "Vikram", "Ponniyin Selvan", "Master", "The Greatest of All Time"
  ],
  bengali: [
    "Detective Byomkesh Bakshy!", "Pather Panchali", "Asur", "Feluda", "Gumnaami",
    "Chander Pahar", "Sharey Showlo", "Ballabhpurer Roopkotha", "Mahananda", "Aparajito",
    "Professor Shonku", "Taqdeer", "Karagar", "Kishore Kumar Junior", "Dracula Sir"
  ],
  german: [
    "Dark", "1899", "All Quiet on the Western Front", "Babylon Berlin", "The Lives of Others",
    "Run Lola Run", "Biohackers", "Kleo", "How to Sell Drugs Online (Fast)", "Dogs of Berlin",
    "Blood & Gold", "Das Boot", "Good Bye Lenin!", "The Empress"
  ],
  italian: [
    "Cinema Paradiso", "Life is Beautiful", "Suburra: Blood on Rome", "Gomorrah",
    "The Great Beauty", "The Hand of God", "The Leopard", "Devils", "My Brilliant Friend",
    "Baby", "The Two Popes", "The Eight Mountains", "Rose Island"
  ],
  arabic: [
    "AlRawabi School for Girls", "Fauda", "Capernaum", "The Message", "Paranormal",
    "Six Windows in the Desert", "Finding Ola", "The Exchange", "Crashing Eid", "The Platform",
    "Rattle the Cage", "Omar"
  ],
  turkish: [
    "Resurrection: Ertugrul", "Kurulus: Osman", "Miracle in Cell No. 7", "The Protector",
    "The Club", "Shahmaran", "Winter Sleep", "The Gift", "Midnight at the Pera Palace",
    "As the Crow Flies", "Another Self", "Thank You, Next"
  ],
  chinese: [
    "The Untamed", "Word of Honor", "Crouching Tiger, Hidden Dragon", "Farewell My Concubine",
    "Hero", "Ip Man", "The Wandering Earth", "Hidden Love", "Love Between Fairy and Devil",
    "Till the End of the Moon", "House of Flying Daggers", "Kung Fu Hustle"
  ],
  russian: [
    "Major Grom: Plague Doctor", "To the Lake", "Leviathan", "Loveless", "Stalker",
    "Solaris", "Better Than Us", "Hardcore Henry", "Silver Spoon", "Sputnik",
    "The Silver Skates", "T-34"
  ],
  tagalog: [
    "Scorpio Nights", "Silip", "Virgin Forest", "Island of Desire", "Selina's Gold",
    "Relyevo", "Pabuya", "Balahibong Pusa", "Bata, Bata... Pa'no Ka Ginawa?", "Metro Manila",
    "Birdshot", "Goyo: The Boy General", "Heneral Luna"
  ],
  portuguese: [
    "City of God", "Elite Squad", "Invisible City", "3%", "Sintonia",
    "Bacurau", "Central Station", "Brotherhood", "Good Morning, Verônica", "Aquarius",
    "The Mechanism", "Glória"
  ],
  english: [
    "Avatar", "Avengers: Endgame", "Oppenheimer", "Interstellar", "The Dark Knight",
    "Inception", "Titanic", "Gladiator", "The Matrix", "Top Gun: Maverick",
    "Dune: Part Two", "Stranger Things", "Breaking Bad", "Game of Thrones", "Succession"
  ]
};

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

function extractYear(rawDate) {
  if (!rawDate) return "2026";
  const raw = String(rawDate).trim();
  if (raw.length === 10 && /^\d+$/.test(raw)) {
    const ts = parseInt(raw, 10);
    return String(new Date(ts * 1000).getFullYear());
  }
  const m = raw.match(/\b(19\d{2}|20\d{2})\b/);
  if (m) return m[1];
  return raw.length >= 4 ? raw.slice(0, 4) : "2026";
}

function buildDefaultSeasons(seasonCount = 1, epPerSeason = 10) {
  const seasons = [];
  for (let s = 1; s <= seasonCount; s++) {
    const episodes = [];
    for (let ep = 1; ep <= epPerSeason; ep++) {
      episodes.push({
        season: s,
        number: ep,
        episode_number: ep,
        title: `Episode ${ep}`,
        duration: "45 min",
      });
    }
    seasons.push({ number: s, season_number: s, episodes });
  }
  return seasons;
}

async function fetchTvMazeSeasons(imdbId) {
  if (!imdbId || !imdbId.startsWith("tt")) return null;
  try {
    const showRes = await fetch(`https://api.tvmaze.com/lookup/shows?imdb=${encodeURIComponent(imdbId)}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(2500),
    });
    if (!showRes.ok) return null;
    const show = await showRes.json();
    if (!show || !show.id) return null;

    const epRes = await fetch(`https://api.tvmaze.com/shows/${show.id}/episodes`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(2500),
    });
    if (!epRes.ok) return null;
    const rawEps = await epRes.json();
    if (!Array.isArray(rawEps) || rawEps.length === 0) return null;

    const bySeason = new Map();
    for (const ep of rawEps) {
      if (!ep || typeof ep.season !== "number" || ep.season <= 0) continue;
      const sNum = ep.season;
      const epNum = (typeof ep.number === "number" && ep.number > 0) ? ep.number : ((bySeason.get(sNum)?.length || 0) + 1);
      if (!bySeason.has(sNum)) bySeason.set(sNum, []);
      bySeason.get(sNum).push({
        season: sNum,
        number: epNum,
        episode_number: epNum,
        title: ep.name || `Episode ${epNum}`,
        overview: ep.summary ? ep.summary.replace(/<[^>]+>/g, "").trim() : null,
        duration: ep.runtime ? `${ep.runtime} min` : "45 min",
        poster_url: ep.image?.medium || ep.image?.original || null,
      });
    }

    const seasons = Array.from(bySeason.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([sNum, episodes]) => ({
        number: sNum,
        season_number: sNum,
        episodes,
      }));

    if (seasons.length === 0) return null;
    return { seasons, show };
  } catch {
    return null;
  }
}

function mapItem(item) {
  if (!item || !item.id) return null;
  const idStr = String(item.id);
  const rawTitle = (item.title || "Untitled").trim();
  const title = cleanTitle(rawTitle);
  const isTitleSeries = /\bS\d+(-S\d+)?\b/i.test(rawTitle) || /\bSeason\s*\d+\b/i.test(rawTitle);
  const mediaType = (item.media_type === "tv" || item.media_type === "series" || item.type === "TV series" || item.type === "tv" || isTitleSeries) ? "series" : "movie";

  const year = extractYear(item.release_date);

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

async function resolveImdbId(title, yearHint, preferSeries = false) {
  if (!title) return null;
  const clean = title
    .replace(/\[.*?\]|\(.*?\)|\bSeason\s*\d+(?:\s*-\s*\d+)?|\bS\d+(?:-S?\d+)?\b/gi, "")
    .trim();
  const cleanNorm = clean.toLowerCase().replace(/[^a-z0-9]/g, "");
  const term = clean.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (!term) return null;

  try {
    const firstChar = term[0] || "a";
    const url = `https://v3.sg.media-imdb.com/suggestion/${firstChar}/${term}.json`;
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return null;
    const json = await res.json();
    const list = (json.d || []).filter(x => x && typeof x.id === "string" && x.id.startsWith("tt"));
    if (list.length === 0) return null;

    const yearNum = yearHint ? parseInt(yearHint, 10) : 0;
    const currentYear = new Date().getFullYear();

    let bestId = list[0].id;
    let bestScore = -1e9;

    for (const item of list) {
      let score = 0;
      const qid = item.qid || "";
      const isTv = qid === "tvSeries" || qid === "tvMiniSeries";
      const isMov = qid === "movie" || qid === "tvMovie";

      if (preferSeries ? isTv : isMov) score += 100;
      else if (preferSeries ? isMov : isTv) score -= 40;

      const itemNorm = (item.l || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      if (itemNorm === cleanNorm) score += 80;
      else if (itemNorm.includes(cleanNorm) || cleanNorm.includes(itemNorm)) score += 20;

      const iy = parseInt(item.y || 0, 10);
      if (iy > currentYear) {
        score -= 150;
      } else if (yearNum > 0 && iy > 0) {
        if (iy === yearNum) {
          score += 60;
        } else if (!preferSeries) {
          score += Math.abs(iy - yearNum) <= 1 ? 45 : -Math.min(30, Math.abs(iy - yearNum));
        } else if (iy <= yearNum) {
          score += Math.max(10, 40 - Math.min(30, yearNum - iy));
        } else {
          score -= 50;
        }
      }

      const rk = parseInt(item.rank || 0, 10);
      if (rk > 0) score += Math.max(0, 20 - Math.log10(rk) * 4);

      if (score > bestScore) {
        bestScore = score;
        bestId = item.id;
      }
    }
    return bestId;
  } catch {
    return null;
  }
}

async function resolveCinemetaMeta(imdbId, preferSeries = false) {
  if (!imdbId || !imdbId.startsWith("tt")) return null;
  const order = preferSeries ? ["series", "movie"] : ["movie", "series"];
  let fallback = null;
  for (const kind of order) {
    try {
      const res = await fetch(`https://v3-cinemeta.strem.io/meta/${kind}/${imdbId}.json`, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(2200),
      });
      if (!res.ok) continue;
      const json = await res.json();
      const meta = json?.meta;
      if (!meta) continue;
      const tmdbId = meta.moviedb_id ? String(meta.moviedb_id) : null;
      const videos = Array.isArray(meta.videos) ? meta.videos : [];
      const parsed = {
        tmdbId,
        isSeries: meta.type === "series" || videos.length > 0,
        videos,
        name: meta.name || null,
      };
      if (tmdbId || videos.length > 0) {
        return parsed;
      }
      if (!fallback) fallback = parsed;
    } catch {}
  }
  return fallback;
}

function buildSeasonsFromVideos(videos) {
  if (!Array.isArray(videos) || videos.length === 0) return [];
  const bySeason = new Map();
  for (const v of videos) {
    const sNum = parseInt(v?.season || 0, 10);
    const eNum = parseInt(v?.episode || v?.number || 0, 10);
    if (sNum <= 0 || eNum <= 0) continue;
    if (!bySeason.has(sNum)) bySeason.set(sNum, []);
    bySeason.get(sNum).push({
      id: `${sNum}-${eNum}`,
      number: eNum,
      episode_number: eNum,
      title: v.title || v.name || `Episode ${eNum}`,
      air_date: v.released ? String(v.released).slice(0, 10) : null,
      duration: null,
    });
  }
  return Array.from(bySeason.keys())
    .sort((a, b) => a - b)
    .map(sNum => ({
      number: sNum,
      season_number: sNum,
      episodes: bySeason.get(sNum).sort((a, b) => a.number - b.number),
    }));
}

function buildEmbedUrls({ imdbId, tmdbId, title, id, isSeries, season, episode }) {
  const s = season > 0 ? season : 1;
  const ep = episode > 0 ? episode : 1;
  const embedUrls = [];

  if (imdbId) {
    embedUrls.push({
      name: "2Embed Cloud (HD)",
      url: isSeries
        ? `https://www.2embed.cc/embedtv/${imdbId}&s=${s}&e=${ep}`
        : `https://www.2embed.cc/embed/${imdbId}`,
    });
  }

  if (imdbId || tmdbId) {
    const vidsrcId = imdbId || tmdbId;
    embedUrls.push({
      name: "VidSrc.to (HD)",
      url: isSeries
        ? `https://vidsrc.to/embed/tv/${vidsrcId}/${s}/${ep}`
        : `https://vidsrc.to/embed/movie/${vidsrcId}`,
    });
  }

  if (tmdbId) {
    embedUrls.push({
      name: "VidLink Cloud (4K)",
      url: isSeries
        ? `https://vidlink.pro/tv/${tmdbId}/${s}/${ep}`
        : `https://vidlink.pro/movie/${tmdbId}`,
    });
    embedUrls.push({
      name: "AutoEmbed Server (Fast)",
      url: isSeries
        ? `https://player.autoembed.me/embed/tv/${tmdbId}/${s}/${ep}/`
        : `https://player.autoembed.me/embed/movie/${tmdbId}/`,
    });
  } else if (imdbId) {
    embedUrls.push({
      name: "AutoEmbed Server (Fast)",
      url: isSeries
        ? `https://autoembed.me/tv/imdb/${imdbId}-${s}-${ep}`
        : `https://autoembed.me/movie/imdb/${imdbId}`,
    });
  }

  if (imdbId) {
    embedUrls.push({
      name: "SmashyStream (Cinema)",
      url: isSeries
        ? `https://embed.smashystream.com/playere.php?imdb=${imdbId}&season=${s}&episode=${ep}`
        : `https://embed.smashystream.com/playere.php?imdb=${imdbId}`,
    });
    embedUrls.push({
      name: "VidSrc Cloud (Backup)",
      url: isSeries
        ? `https://vidsrc.pm/embed/tv/${imdbId}/${s}/${ep}`
        : `https://vidsrc.pm/embed/movie/${imdbId}`,
    });
  } else if (!tmdbId) {
    const cleanTitleStr = encodeURIComponent(
      (title || id || "").replace(/\[.*?\]|\(.*?\)|S\d+(-S\d+)?/gi, "").trim()
    );
    embedUrls.push({
      name: "AutoEmbed Server (Fast)",
      url: isSeries
        ? `https://autoembed.me/tv?title=${cleanTitleStr}&season=${s}&episode=${ep}`
        : `https://autoembed.me/movie?title=${cleanTitleStr}`,
    });
    embedUrls.push({
      name: "VidSrc Cloud (Backup)",
      url: isSeries
        ? `https://vidsrc.pm/embed/tv?title=${cleanTitleStr}&season=${s}&episode=${ep}`
        : `https://vidsrc.pm/embed/movie?title=${cleanTitleStr}`,
    });
  }

  return embedUrls;
}

let sportsCache = null;
let sportsCacheTime = 0;

function resolveChannelName(name) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("cricket") || lower.includes("willow")) {
    if (lower.includes("willow")) return "Willow Cricket HD US";
    if (lower.includes("astro")) return "ASTRO CRICKET HD";
    if (lower.includes("fox")) return "FOX Sports 501 Cricket HD AU";
    return "Sky Sports Cricket FHD UK";
  }
  if (lower.includes("premier league") || lower.includes("premier")) {
    if (lower.includes("canal")) return "Canal+ Premier League HD FR";
    return "Sky Sports Premier League FHD UK";
  }
  if (lower.includes("football") || lower.includes("soccer") || lower.includes("bundesliga")) {
    if (lower.includes("tnt")) return "TNT Sports 1 FHD UK";
    if (lower.includes("bein")) return "beIN Sports HD US";
    if (lower.includes("bundesliga")) return "Sky Sport Bundesliga 5 FHD DE";
    return "Sky Sports Football FHD UK";
  }
  if (lower.includes("tnt")) return "TNT Sports 1 FHD UK";
  if (lower.includes("bein")) return "beIN Sports HD US";
  if (lower.includes("espn")) return "ESPN HD US";
  if (lower.includes("fox")) return "Fox Sports 1 FHD US";
  if (lower.includes("f1") || lower.includes("formula")) return "Sky Sports F1 FHD UK";
  if (lower.includes("tennis")) return "Sky Sports Tennis FHD UK";
  if (lower.includes("golf")) return "Sky Sports Golf FHD UK";
  return name || "Sky Sports Cricket FHD UK";
}

function extractStreamUrl(html) {
  if (!html) return null;
  // Method 1: Check for direct m3u8 in html
  const directMatch = html.match(/https:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*/);
  if (directMatch && directMatch[0]) {
    return directMatch[0];
  }

  // Method 2: Obfuscated base64 chunks
  const lines = html.split("\n").filter(l => l.includes("var ") && (l.includes("nLax") || l.includes("atob") || (l.includes("(") && l.includes("+"))));
  for (const line of lines) {
    const quotes = line.match(/'([^']+)'/g);
    if (!quotes || quotes.length < 5) continue;
    let decoded = "";
    for (const q of quotes) {
      let s = q.slice(1, -1).replace(/-/g, "+").replace(/_/g, "/");
      while (s.length % 4) s += "=";
      try {
        decoded += Buffer.from(s, "base64").toString("utf8");
      } catch {}
    }
    if (decoded.startsWith("https://") && (decoded.includes(".m3u8") || decoded.includes("/playlist"))) {
      return decoded;
    }
  }
  return null;
}

function generateCleanPlayerHtml(channelName, streamUrl) {
  const urlStr = streamUrl || "";
  const lower = (channelName || "").toLowerCase();
  const isCricket = lower.includes("cricket") || lower.includes("willow");
  const isFootball = lower.includes("premier") || lower.includes("football") || lower.includes("soccer") || lower.includes("bundesliga");

  let pillsHtml = "";
  if (isCricket) {
    pillsHtml = `<div class="alt-pills">
      <span class="alt-label">Switch Live Server:</span>
      <a href="/api/sports-stream?name=Sky%20Sports%20Cricket%20FHD%20UK" class="alt-btn active">🏏 Sky Cricket</a>
      <a href="/api/sports-stream?name=Willow%20Cricket%20HD%20US" class="alt-btn">🏏 Willow HD</a>
      <a href="/api/sports-stream?name=ASTRO%20CRICKET%20HD" class="alt-btn">🏏 Astro Cricket</a>
      <a href="/api/sports-stream?name=FOX%20Sports%20501%20Cricket%20HD%20AU" class="alt-btn">🏏 Fox 501</a>
    </div>`;
  } else if (isFootball) {
    pillsHtml = `<div class="alt-pills">
      <span class="alt-label">Switch Live Server:</span>
      <a href="/api/sports-stream?name=Sky%20Sports%20Premier%20League%20FHD%20UK" class="alt-btn active">⚽ Premier League</a>
      <a href="/api/sports-stream?name=Sky%20Sports%20Football%20FHD%20UK" class="alt-btn">⚽ Sky Football</a>
      <a href="/api/sports-stream?name=TNT%20Sports%201%20FHD%20UK" class="alt-btn">⚽ TNT Sports 1</a>
      <a href="/api/sports-stream?name=Canal%2B%20Premier%20League%20HD%20FR" class="alt-btn">⚽ Canal+ PL</a>
    </div>`;
  } else {
    pillsHtml = `<div class="alt-pills">
      <span class="alt-label">Switch Live Server:</span>
      <a href="/api/sports-stream?name=Sky%20Sports%20Main%20Event%20FHD%20UK" class="alt-btn active">🔴 Main Event</a>
      <a href="/api/sports-stream?name=ESPN%20HD%20US" class="alt-btn">🔴 ESPN HD</a>
      <a href="/api/sports-stream?name=TNT%20Sports%201%20FHD%20UK" class="alt-btn">🔴 TNT Sports</a>
      <a href="/api/sports-stream?name=Sky%20Sports%20Cricket%20FHD%20UK" class="alt-btn">🏏 Cricket HD</a>
    </div>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${channelName} - NetMirror Live Sports</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; height: 100%; background: #000;
      overflow: hidden; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #playerContainer {
      position: relative; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center; background: #000;
    }
    video {
      width: 100%; height: 100%; object-fit: contain; background: #000;
    }
    .live-top-bar {
      position: absolute; top: 12px; left: 14px; right: 14px;
      display: flex; align-items: center; justify-content: space-between;
      pointer-events: none; z-index: 30; gap: 8px; flex-wrap: wrap;
    }
    .live-pill {
      display: inline-flex; align-items: center; gap: 7px;
      background: rgba(14, 20, 36, 0.92); backdrop-filter: blur(10px);
      padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 12px; font-weight: 700; color: #fff;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.7);
      pointer-events: auto;
    }
    .live-dot {
      width: 8px; height: 8px; background: #ff2a2a; border-radius: 50%;
      box-shadow: 0 0 10px #ff2a2a; animation: pulse 1.4s infinite;
    }
    @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.8); } 100% { opacity: 1; transform: scale(1); } }

    .alt-pills {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      pointer-events: auto;
    }
    .alt-label {
      font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;
      display: none;
    }
    @media (min-width: 600px) {
      .alt-label { display: inline-block; }
    }
    .alt-btn {
      display: inline-flex; align-items: center;
      background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #e2e8f0; font-size: 11.5px; font-weight: 600;
      padding: 5px 11px; border-radius: 16px; text-decoration: none;
      transition: all 0.2s ease;
    }
    .alt-btn:hover, .alt-btn.active {
      background: #e50914; border-color: #ff3344; color: #fff;
      box-shadow: 0 0 12px rgba(229, 9, 20, 0.5);
    }

    .status-overlay {
      position: absolute; inset: 0;
      background: rgba(6, 10, 18, 0.95);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      color: #fff; z-index: 20; text-align: center; padding: 24px 16px;
      transition: opacity 0.3s ease;
    }
    .status-overlay.hidden { opacity: 0; pointer-events: none; }
    .spinner {
      width: 46px; height: 46px; border: 3.5px solid rgba(229, 9, 20, 0.2);
      border-top-color: #e50914; border-radius: 50%;
      animation: spin 0.8s linear infinite; margin-bottom: 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .status-title { font-size: 18px; font-weight: 700; margin-bottom: 8px; color: #fff; }
    .status-desc { font-size: 13.5px; color: #94a3b8; max-width: 420px; line-height: 1.5; margin-bottom: 20px; }
    .action-row {
      display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
    }
    .reload-btn {
      background: #e50914; color: #fff; border: none;
      font-size: 13px; font-weight: 700; padding: 10px 24px; border-radius: 20px;
      cursor: pointer; box-shadow: 0 4px 16px rgba(229, 9, 20, 0.5);
      transition: background 0.2s;
    }
    .reload-btn:hover { background: #b80710; }

    @media (max-width: 600px) {
      .live-top-bar { top: 8px; left: 8px; right: 8px; }
      .live-pill { font-size: 11px; padding: 4px 10px; }
      .alt-btn { font-size: 10.5px; padding: 4px 8px; }
      .status-title { font-size: 16px; }
      .status-desc { font-size: 12.5px; }
    }
  </style>
</head>
<body>
  <div id="playerContainer">
    <div class="live-top-bar">
      <div class="live-pill">
        <span class="live-dot"></span>
        <span>LIVE • ${channelName}</span>
      </div>
      ${pillsHtml}
    </div>

    <div class="status-overlay" id="statusOverlay">
      <div class="spinner" id="spinner"></div>
      <div class="status-title" id="statusTitle">Connecting Live Broadcast...</div>
      <div class="status-desc" id="statusDesc">Establishing direct HD sports feed</div>
      <div class="action-row" id="actionRow" style="display:none;">
        <button class="reload-btn" onclick="location.reload()">🔄 Retry Feed</button>
      </div>
    </div>

    <video id="videoPlayer" controls autoplay playsinline preload="auto"></video>
  </div>

  <script>
    const streamUrl = "${urlStr}";
    const channelName = "${channelName}";
    const video = document.getElementById('videoPlayer');
    const overlay = document.getElementById('statusOverlay');
    const spinner = document.getElementById('spinner');
    const statusTitle = document.getElementById('statusTitle');
    const statusDesc = document.getElementById('statusDesc');
    const actionRow = document.getElementById('actionRow');

    function showError(msg, sub) {
      if (overlay) {
        overlay.classList.remove('hidden');
        if (spinner) spinner.style.display = 'none';
        if (statusTitle) statusTitle.textContent = msg || 'Broadcast Unavailable';
        if (statusDesc) statusDesc.textContent = sub || 'This stream is syncing. Switch to another live server above.';
        if (actionRow) actionRow.style.display = 'flex';
      }
      try {
        window.parent.postMessage({ type: 'stream_error', channel: channelName }, '*');
      } catch (e) {}
    }

    function hideOverlay() {
      if (overlay) overlay.classList.add('hidden');
      try {
        window.parent.postMessage({ type: 'stream_playing', channel: channelName }, '*');
      } catch (e) {}
    }

    if (!streamUrl || streamUrl === 'null' || streamUrl.length < 10) {
      showError('🔴 Live Broadcast Reconnecting', 'This match channel is preparing its live feed. Switch to an active server above to watch instantly.');
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 30,
        manifestLoadingMaxRetry: 6,
        manifestLoadingRetryDelay: 1000,
        levelLoadingMaxRetry: 5,
        fragLoadingMaxRetry: 6
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(function() {
          video.muted = true;
          video.play();
        });
        setTimeout(hideOverlay, 400);
      });

      let retryCount = 0;
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              retryCount++;
              if (retryCount <= 5) {
                setTimeout(function() { hls.startLoad(); }, 1200);
              } else {
                showError('Broadcast Syncing', 'Network feed reconnecting. Please retry or choose another server above.');
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              showError('Reconnecting Stream...', 'Attempting to resume broadcast.');
              setTimeout(function() { hls.startLoad(); }, 2000);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', function() {
        video.play().catch(function() {
          video.muted = true;
          video.play();
        });
        hideOverlay();
      });
      video.onerror = function() {
        showError('Stream Reconnecting', 'Unable to play stream on this device. Switch server above.');
      };
    }

    video.addEventListener('playing', hideOverlay);
  </script>
</body>
</html>`;
}

async function handleSportsStream(params) {
  const rawName = params.name || params.channel || "Sky Sports Cricket FHD UK";
  const channelName = resolveChannelName(rawName);
  const targetUrl = `https://cdnlivetv.tv/api/v1/channels/player/?name=${encodeURIComponent(channelName)}&code=&user=cdnlivetv&plan=free`;

  let streamUrl = null;
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": USER_AGENT,
        "Referer": "https://cdnlivetv.tv/"
      }
    });

    if (res.ok) {
      const html = await res.text();
      streamUrl = extractStreamUrl(html);
    }
  } catch (err) {}

  // If extraction failed, try fallback to primary online channel for this sport
  if (!streamUrl) {
    const lower = channelName.toLowerCase();
    const fallbackChannel = (lower.includes("cricket") || lower.includes("willow"))
      ? "Willow Cricket HD US"
      : ((lower.includes("premier") || lower.includes("football"))
        ? "Sky Sports Premier League FHD UK"
        : "Sky Sports Main Event FHD UK");

    if (fallbackChannel !== channelName) {
      try {
        const fbUrl = `https://cdnlivetv.tv/api/v1/channels/player/?name=${encodeURIComponent(fallbackChannel)}&code=&user=cdnlivetv&plan=free`;
        const fbRes = await fetch(fbUrl, {
          headers: { "User-Agent": USER_AGENT, "Referer": "https://cdnlivetv.tv/" }
        });
        if (fbRes.ok) {
          const fbHtml = await fbRes.text();
          streamUrl = extractStreamUrl(fbHtml);
        }
      } catch (e) {}
    }
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    },
    body: generateCleanPlayerHtml(channelName, streamUrl)
  };
}

async function handleSports(params) {
  const now = Date.now();
  if (sportsCache && (now - sportsCacheTime < 60000)) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, s-maxage=120"
      },
      body: JSON.stringify(sportsCache),
    };
  }

  try {
    const [eventsRes, channelsRes] = await Promise.all([
      fetch("https://api.cdnlivetv.tv/api/v1/events/sports/?user=cdnlivetv&plan=free", {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(6000)
      }).then(r => r.json()).catch(() => null),
      fetch("https://api.cdnlivetv.tv/api/v1/channels/?user=cdnlivetv&plan=free", {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(6000)
      }).then(r => r.json()).catch(() => null)
    ]);

    const rawEvents = eventsRes?.["cdn-live-tv"] || {};
    const sportsCategories = Object.keys(rawEvents).filter(k => !k.startsWith("total_") && Array.isArray(rawEvents[k]));

    const matches = [];
    for (const sport of sportsCategories) {
      for (const ev of (rawEvents[sport] || [])) {
        if (!ev.event) continue;
        const hasChannels = ev.channels && ev.channels.length > 0;
        matches.push({
          id: ev.gameID || Math.random().toString(36).slice(2),
          sport,
          event: ev.event,
          home_team: ev.homeTeam || ev.event.split(" vs ")[0] || "Home",
          away_team: ev.awayTeam || ev.event.split(" vs ")[1] || "Away",
          home_logo: ev.homeTeamIMG || "",
          away_logo: ev.awayTeamIMG || "",
          tournament: ev.tournament || sport,
          country: ev.country || "",
          country_flag: ev.countryIMG || "",
          start: ev.start || "",
          time: ev.time || "",
          status: ev.status === "LIVE" ? "live" : (ev.status === "FT" ? "ended" : "upcoming"),
          has_stream: hasChannels,
          channels: (ev.channels || []).map((ch, idx) => {
            const chName = ch.channel_name || `Server ${idx + 1}`;
            return {
              id: ch.id || String(idx),
              name: chName,
              url: `/api/sports-stream?name=${encodeURIComponent(chName)}`
            };
          })
        });
      }
    }

    // Prioritize live matches, then events with active stream channels
    matches.sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      if (a.has_stream && !b.has_stream) return -1;
      if (b.has_stream && !a.has_stream) return 1;
      return 0;
    });

    const rawChannels = channelsRes?.channels || [];
    const sportsTvChannels = rawChannels
      .filter(c => /sport|espn|tnt|bein|sky|fox|dazn|nba|nfl|mlb|nhl|cricket|tennis|golf|wwe|willow|astro|football|soccer|premier|laliga|serie|bundesliga/i.test(c.name))
      .map(c => ({
        name: c.name,
        url: `/api/sports-stream?name=${encodeURIComponent(c.name)}`,
        status: c.status || "online"
      }));

    // Prioritize Cricket and Football channels to the very front
    sportsTvChannels.sort((a, b) => {
      const isCricketA = /cricket|willow/i.test(a.name);
      const isCricketB = /cricket|willow/i.test(b.name);
      if (isCricketA && !isCricketB) return -1;
      if (isCricketB && !isCricketA) return 1;

      const isFootballA = /premier league|football|soccer|bundesliga|golazo/i.test(a.name);
      const isFootballB = /premier league|football|soccer|bundesliga|golazo/i.test(b.name);
      if (isFootballA && !isFootballB) return -1;
      if (isFootballB && !isFootballA) return 1;

      const isMajorA = /tnt|bein|sky|espn/i.test(a.name);
      const isMajorB = /tnt|bein|sky|espn/i.test(b.name);
      if (isMajorA && !isMajorB) return -1;
      if (isMajorB && !isMajorA) return 1;

      return 0;
    });

    const result = {
      total_matches: matches.length,
      live_count: matches.filter(m => m.status === "live" || m.has_stream).length,
      categories: sportsCategories,
      matches,
      channels: sportsTvChannels
    };

    sportsCache = result;
    sportsCacheTime = now;

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=60, s-maxage=120"
      },
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: err.message }),
    };
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
  const rawName = (params.name || "netflix").toLowerCase().replace(/[\s-]/g, "_");
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageIdx = page - 1;

  // Delegate multi-language queries to dedicated language handler
  const languageAliases = [
    "hindi", "japanese", "korean", "spanish", "french", "tamil", "telugu", "tamil_telugu",
    "bengali", "german", "italian", "arabic", "turkish", "chinese", "russian", "tagalog",
    "filipino", "portuguese"
  ];
  if (languageAliases.includes(rawName)) {
    return handleLanguageContent({ ...params, lang: rawName });
  }

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

async function handleLanguages() {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600"
    },
    body: JSON.stringify(LANGUAGES),
  };
}

const languageCache = {};
const languageCacheTime = {};

async function handleLanguageContent(params) {
  const rawLang = (params.lang || params.name || "hindi").toLowerCase().replace(/[\s-]/g, "_");
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const pageIdx = page - 1;

  // Normalize aliases
  let langKey = rawLang;
  if (langKey === "bollywood") langKey = "hindi";
  if (langKey === "anime") langKey = "japanese";
  if (langKey === "kdrama") langKey = "korean";
  if (langKey === "hollywood" || langKey === "boxoffice") langKey = "english";
  if (langKey === "tamil" || langKey === "telugu") langKey = "tamil_telugu";
  if (langKey === "filipino") langKey = "tagalog";

  const langInfo = LANGUAGES.find(l => l.key === langKey) || {
    key: langKey,
    name: `${langKey.toUpperCase()} Cinema`,
    flag: "🌍",
    color: "#3b82f6"
  };

  const cacheKey = `${langKey}_p${page}`;
  if (languageCache[cacheKey] && (Date.now() - (languageCacheTime[cacheKey] || 0) < 15 * 60 * 1000)) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=120, s-maxage=300"
      },
      body: JSON.stringify(languageCache[cacheKey]),
    };
  }

  // 1. Check if language has an upstream platform channel or trending ID
  let upstreamUrl = null;
  if (langKey === "hindi") upstreamUrl = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=zee5&items_per_page=30`;
  else if (langKey === "japanese") upstreamUrl = `https://api2.imdb3.shop/api/tranding?id=30&items_per_page=18&page=${pageIdx}`;
  else if (langKey === "korean") upstreamUrl = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=viu&items_per_page=30`;
  else if (langKey === "english") upstreamUrl = `https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=${pageIdx}`;
  else if (langKey === "bengali") upstreamUrl = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=hoichoi&items_per_page=30`;
  else if (langKey === "tagalog") upstreamUrl = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=vivamax&items_per_page=30`;
  else if (langKey === "tamil_telugu") upstreamUrl = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=zee5&items_per_page=30`;
  else upstreamUrl = `https://api2.imdb3.shop/api/movies/list/filter?page=${pageIdx}&platform=netflix&items_per_page=30`;

  const fetchPromises = [];
  if (upstreamUrl) {
    fetchPromises.push(
      fetch(upstreamUrl, { headers: { "User-Agent": USER_AGENT } })
        .then(r => r.json())
        .then(j => (j.results || []).map(mapItem).filter(Boolean))
        .catch(() => [])
    );
  }

  // 2. Resolve curated seed movies for this language
  const seeds = LANGUAGE_SEEDS[langKey] || [];
  const startIdx = pageIdx * 10;
  const pageSeeds = seeds.slice(startIdx, startIdx + 12);

  for (const seed of pageSeeds) {
    fetchPromises.push(
      fetch(`https://api2.imdb4.shop/suggest.php?q=${encodeURIComponent(seed.toLowerCase())}&p=1`, { headers: { "User-Agent": USER_AGENT } })
        .then(r => r.json())
        .then(j => (j.results || []).map(mapItem).filter(Boolean))
        .catch(() => [])
    );
  }

  const results = await Promise.all(fetchPromises);
  const seen = new Set();
  const items = [];

  for (const list of results) {
    for (const item of list) {
      if (!item || !item.id || !item.title) continue;
      const canon = getCanonical(item.title);
      if (!canon || seen.has(canon)) continue;
      seen.add(canon);
      items.push(item);
    }
  }

  const payload = {
    platform: langKey,
    language: langKey,
    display_name: langInfo.name,
    flag: langInfo.flag,
    color: langInfo.color,
    page,
    total_pages: Math.max(5, Math.ceil((seeds.length + 30) / 12)),
    total_results: (seeds.length + 50),
    items,
  };

  languageCache[cacheKey] = payload;
  languageCacheTime[cacheKey] = Date.now();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=120, s-maxage=300"
    },
    body: JSON.stringify(payload),
  };
}

let browseCache = null;
let browseCacheTime = 0;
const BROWSE_CACHE_TTL = 15 * 60 * 1000; // 15 minutes in-memory cache

async function handleBrowse() {
  if (browseCache && (Date.now() - browseCacheTime < BROWSE_CACHE_TTL)) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=1800"
      },
      body: JSON.stringify(browseCache),
    };
  }

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

  browseCache = {
    hero,
    hero_slides: heroSlides,
    trending,
    netflix,
    prime,
    disney,
    movies,
    series,
  };
  browseCacheTime = Date.now();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=1800"
    },
    body: JSON.stringify(browseCache),
  };
}

async function handleHomepage(params) {
  const tab = String(params.tab || "2");
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);
  const apiPage = page - 1;
  const urls = [];
  if (tab === "1") {
    urls.push(`https://api2.imdb3.shop/api/movies/list/filter?page=${apiPage}&type=1&items_per_page=30`);
  } else if (tab === "3") {
    urls.push(`https://api2.imdb3.shop/api/movies/list/filter?page=${apiPage}&type=2&items_per_page=30`);
  } else {
    urls.push(`https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=${apiPage * 2}`);
    urls.push(`https://api2.imdb3.shop/api/tranding?id=44&items_per_page=18&page=${apiPage * 2 + 1}`);
  }

  let items = [];
  try {
    const pages = await Promise.all(
      urls.map(u => fetch(u, { headers: { "User-Agent": USER_AGENT } }).then(r => (r.ok ? r.json() : {})).catch(() => ({})))
    );
    const seen = new Set();
    for (const json of pages) {
      for (const raw of json.results || []) {
        if (!raw || !raw.id || !raw.title) continue;
        const canon = getCanonical(raw.title);
        if (!canon || seen.has(canon)) continue;
        seen.add(canon);
        const mapped = mapItem(raw);
        if (mapped) items.push(mapped);
      }
    }
  } catch {}

  if (items.length === 0 && browseCache) {
    items = tab === "1" ? (browseCache.movies || []) : tab === "3" ? (browseCache.series || []) : (browseCache.trending || []);
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=180, s-maxage=600"
    },
    body: JSON.stringify({ tab, page, items }),
  };
}

async function resolveMultiLanguageTerms(rawQuery) {
  const q = (rawQuery || "").trim();
  if (!q) return [];
  const terms = [q];
  const normalized = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  if (normalized && normalized.toLowerCase() !== q.toLowerCase()) {
    terms.push(normalized);
  }
  const hasNonAscii = /[^\u0000-\u007F]/.test(q);
  if (hasNonAscii) {
    try {
      const transUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(q)}`;
      const res = await fetch(transUrl, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const json = await res.json();
        const translated = (json[0] || []).map(p => p[0]).join("").trim();
        if (translated && !terms.map(t => t.toLowerCase()).includes(translated.toLowerCase())) {
          terms.push(translated);
        }
      }
    } catch (_) {}
  }
  return terms;
}

async function searchIMDb(query) {
  const norm = (query || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const clean = norm.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  if (!clean) return [];
  const first = clean[0] || "a";
  const url = `https://v3.sg.media-imdb.com/suggestion/${first}/${clean}.json`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.d || [])
      .filter(item => item && item.id && (item.qid === "movie" || item.qid === "tvSeries" || item.qid === "tvMiniSeries" || item.q === "feature" || item.qid === "tvMovie"))
      .map(item => ({
        id: { provider: "moviebox", value: item.id },
        title: cleanTitle(item.l || "Untitled"),
        media_type: (item.qid === "tvSeries" || item.qid === "tvMiniSeries") ? "series" : "movie",
        year: String(item.y || "2026"),
        poster_url: item.i?.imageUrl || null,
        season_count: null,
      }));
  } catch {
    return [];
  }
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

  const terms = await resolveMultiLanguageTerms(q);
  const searchPromises = [];

  for (const term of terms) {
    searchPromises.push(searchIMDb(term));
    searchPromises.push(
      fetch(`https://api2.imdb4.shop/suggest.php?q=${encodeURIComponent(term.toLowerCase())}&p=24`, { headers: { "User-Agent": USER_AGENT } })
        .then(r => r.json())
        .then(j => (j.results || []).map(mapItem).filter(Boolean))
        .catch(() => [])
    );
  }

  const resultsLists = await Promise.all(searchPromises);
  const seen = new Set();
  const items = [];

  // Priority: Interleave & deduplicate matches
  for (const list of resultsLists) {
    for (const item of list) {
      if (!item || !item.id || !item.title) continue;
      const canon = getCanonical(item.title);
      if (!canon || seen.has(canon)) continue;
      seen.add(canon);
      items.push(item);
    }
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

  const terms = await resolveMultiLanguageTerms(q);
  const searchPromises = [];

  for (const term of terms) {
    searchPromises.push(searchIMDb(term));
    searchPromises.push(
      fetch(`https://api2.imdb4.shop/suggest.php?q=${encodeURIComponent(term.toLowerCase())}&p=12`, { headers: { "User-Agent": USER_AGENT } })
        .then(r => r.json())
        .catch(() => ({}))
    );
  }

  const results = await Promise.all(searchPromises);
  const seen = new Set();
  const suggestions = [];

  for (let i = 0; i < results.length; i += 2) {
    const imdbItems = results[i] || [];
    const shopJson = results[i + 1] || {};

    for (const item of imdbItems) {
      const canon = getCanonical(item.title);
      if (!canon || seen.has(canon)) continue;
      seen.add(canon);
      suggestions.push(item.title);
      if (suggestions.length >= 10) break;
    }

    for (const raw of (shopJson.results || [])) {
      if (!raw || !raw.title) continue;
      const canon = getCanonical(raw.title);
      if (!canon || seen.has(canon)) continue;
      seen.add(canon);
      suggestions.push(cleanTitle(raw.title));
      if (suggestions.length >= 14) break;
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(suggestions),
  };
}

async function handleDetails(id, params = {}) {
  // 1. If ID is an IMDb ID (starts with "tt")
  if (id.startsWith("tt")) {
    try {
      const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/t/${id}.json`;
      const [imdbRes, tvMazeData] = await Promise.all([
        fetch(imdbUrl, { headers: { "User-Agent": USER_AGENT } }).catch(() => null),
        fetchTvMazeSeasons(id),
      ]);

      let item = null;
      if (imdbRes && imdbRes.ok) {
        const json = await imdbRes.json();
        item = (json.d || []).find(x => x.id === id) || (json.d || [])[0] || null;
      }

      if (item || tvMazeData) {
        const qid = item?.qid || "";
        const isMiniSeries = qid === "tvMiniSeries" || /mini/i.test(item?.q || "");
        const isSeries = Boolean(tvMazeData) || qid === "tvSeries" || qid === "tvMiniSeries" || params.type === "tv" || /series/i.test(item?.q || "");
        const title = cleanTitle(item?.l || tvMazeData?.show?.name || params.title || "Untitled");
        const year = item?.y ? String(item.y) : extractYear(tvMazeData?.show?.premiered);
        const posterUrl = item?.i?.imageUrl || tvMazeData?.show?.image?.original || tvMazeData?.show?.image?.medium || null;
        const stars = item?.s || null;
        const rating = tvMazeData?.show?.rating?.average ? String(tvMazeData.show.rating.average) : "8.6";
        const desc = tvMazeData?.show?.summary
          ? tvMazeData.show.summary.replace(/<[^>]+>/g, "").trim()
          : `Stream ${title} (${year}) in high definition with multi-audio and subtitles.`;
        const genres = (tvMazeData?.show?.genres && tvMazeData.show.genres.length > 0)
          ? tvMazeData.show.genres
          : (isSeries ? ["TV Series", "Drama"] : ["Movie", "Cinema"]);

        let seasons = [];
        if (isSeries) {
          if (tvMazeData && tvMazeData.seasons && tvMazeData.seasons.length > 0) {
            seasons = tvMazeData.seasons;
          } else {
            const cmMeta = await resolveCinemetaMeta(id, true);
            const cmSeasons = cmMeta ? buildSeasonsFromVideos(cmMeta.videos) : [];
            seasons = cmSeasons.length > 0 ? cmSeasons : buildDefaultSeasons(isMiniSeries ? 1 : 3, 10);
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
            description: desc,
            tagline: null,
            imdb_rating: rating,
            director: null,
            stars,
            prints: null,
            audios: null,
            poster_url: posterUrl,
            duration: isSeries ? "45 min/ep" : "118 min",
            genres,
            seasons,
            dubs: [],
          }),
        };
      }
    } catch {}
  }

  // 2. Moviebox numeric ID lookup
  const preferredTypes = (params.type === "tv" || /\bS\d+/i.test(params.title || "")) ? ["tv", "movie"] : ["movie", "tv"];
  for (const mtype of preferredTypes) {
    const url = `https://api2.imdb3.shop/api/${mtype}/${id}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
      if (res.ok) {
        const json = await res.json();
        const first = json.results?.[0];
        if (first && first.title) {
          const validSeasonEntries = Array.isArray(first.season)
            ? first.season.filter(s => (parseInt(s.se || s.season || 0, 10) > 0) && (parseInt(s.ep || s.episodes || 0, 10) > 0))
            : [];
          const hasValidSeasons = validSeasonEntries.length > 0;
          const isSeries = first.media_type === "tv"
            || first.media_type === "series"
            || hasValidSeasons
            || (params.type === "tv" && /\bS\d+/i.test(first.title || ""));
          const title = (first.title || "Untitled").trim();
          const year = extractYear(first.release_date);

          let posterUrl = first.backdrop_path || first.poster_path || null;
          if (posterUrl && !posterUrl.startsWith("http")) {
            posterUrl = "https://image.tmdb.org/t/p/w500" + posterUrl;
          }

          // Build season & episode list if series
          let seasons = [];
          if (isSeries) {
            if (validSeasonEntries.length > 0) {
              validSeasonEntries.forEach((sObj, idx) => {
                const sNum = parseInt(sObj.se || sObj.season || (idx + 1), 10) || (idx + 1);
                const epTotal = parseInt(sObj.ep || sObj.episodes || 10, 10) || 10;
                const episodes = [];
                for (let ep = 1; ep <= epTotal; ep++) {
                  episodes.push({
                    season: sNum,
                    number: ep,
                    episode_number: ep,
                    title: `Episode ${ep}`,
                    duration: null,
                  });
                }
                seasons.push({ number: sNum, season_number: sNum, episodes });
              });
              seasons.sort((a, b) => a.number - b.number);
            } else {
              const sCount = Math.max(1, parseInt(first.season, 10) || 1);
              seasons = buildDefaultSeasons(sCount, 10);
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

  // 3. Fallback: If numeric ID was not found in imdb3.shop, resolve via title hint or search
  if (params.title) {
    const clean = params.title.replace(/\[.*?\]|\(.*?\)|\bS\d+(-S\d+)?\b/gi, "").trim();
    const imdbItems = await searchIMDb(clean);
    if (imdbItems.length > 0) {
      const preferSeries = params.type === "tv" || /\bS\d+/i.test(params.title || "");
      const top = (preferSeries ? imdbItems.find(x => x.media_type === "series") : null) || imdbItems[0];
      const isSeries = top.media_type === "series" || preferSeries;
      let seasons = [];
      if (isSeries) {
        const tvMazeData = await fetchTvMazeSeasons(top.id.value);
        if (tvMazeData && tvMazeData.seasons && tvMazeData.seasons.length > 0) {
          seasons = tvMazeData.seasons;
        } else {
          const cmMeta = await resolveCinemetaMeta(top.id.value, true);
          const cmSeasons = cmMeta ? buildSeasonsFromVideos(cmMeta.videos) : [];
          seasons = cmSeasons.length > 0 ? cmSeasons : buildDefaultSeasons(1, 10);
        }
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({
          id: { provider: "moviebox", value: top.id.value },
          title: top.title,
          media_type: isSeries ? "series" : "movie",
          year: top.year,
          description: `Stream ${top.title} in high definition with multi-audio and subtitles.`,
          tagline: null,
          imdb_rating: "8.5",
          director: null,
          stars: null,
          prints: null,
          audios: null,
          poster_url: top.poster_url,
          duration: isSeries ? "45 min/ep" : "118 min",
          genres: ["Cinema"],
          seasons,
          dubs: [],
        }),
      };
    }
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
  const reqSeason = parseInt(params.season || "0", 10) || 0;
  const reqEpisode = parseInt(params.episode || "0", 10) || 0;
  let isSeries = params.type === "tv" || reqSeason > 0 || reqEpisode > 0 || /\bS\d+/i.test(title);

  let imdbId = id.startsWith("tt") ? id : null;
  let tmdbId = null;

  if (!imdbId) {
    // Fetch title, real media_type, and TMDB ID (tm_id) from Moviebox
    const checkTypes = isSeries ? ["tv", "movie"] : ["movie", "tv"];
    for (const mtype of checkTypes) {
      try {
        const res = await fetch(`https://api2.imdb3.shop/api/${mtype}/${id}`, { headers: { "User-Agent": USER_AGENT } });
        if (res.ok) {
          const json = await res.json();
          const first = json.results?.[0];
          if (first && first.title) {
            title = first.title;
            const hasValidSeasons = Array.isArray(first.season) && first.season.some(s => (parseInt(s.se || s.season || 0, 10) > 0) && (parseInt(s.ep || s.episodes || 0, 10) > 0));
            if (first.media_type === "tv" || first.media_type === "series" || hasValidSeasons) {
              isSeries = true;
            }
            if (first.tm_id) {
              tmdbId = String(first.tm_id).trim() || null;
            }
            if (first.release_date) {
              yearHint = extractYear(first.release_date);
            }
            break;
          }
        }
      } catch {}
    }
    imdbId = await resolveImdbId(title, yearHint, isSeries);
  }

  if (imdbId) {
    const cmMeta = await resolveCinemetaMeta(imdbId, isSeries);
    if (cmMeta) {
      if (cmMeta.tmdbId) tmdbId = cmMeta.tmdbId;
      if (!isSeries && cmMeta.isSeries) isSeries = true;
    }
  }

  const season = reqSeason > 0 ? reqSeason : 1;
  const episode = reqEpisode > 0 ? reqEpisode : 1;
  const isSeriesMode = isSeries || reqSeason > 0 || reqEpisode > 0;
  const embedUrls = buildEmbedUrls({ imdbId, tmdbId, title, id, isSeries: isSeriesMode, season, episode });

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
  if (cleanPath === "/languages") {
    return handleLanguages();
  }
  if (cleanPath === "/language") {
    return handleLanguageContent(params);
  }
  if (cleanPath === "/sports" || cleanPath === "/live-sports") {
    return handleSports(params);
  }
  if (cleanPath === "/sports-stream" || cleanPath === "/sports-player") {
    return handleSportsStream(params);
  }
  if (cleanPath === "/browse") {
    return handleBrowse();
  }
  if (cleanPath === "/homepage") {
    return handleHomepage(params);
  }
  if (cleanPath === "/search") {
    return handleSearch(params);
  }
  if (cleanPath === "/suggest") {
    return handleSuggest(params);
  }
  if (cleanPath.startsWith("/details/")) {
    const id = cleanPath.replace("/details/", "");
    return handleDetails(id, params);
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

