// moviehub.stream - Chrome Extension Popup Controller

const BASE_URL = 'https://moviehub.stream';
const CACHE_STORAGE_KEY = 'mb_browse_cache';

const el = {
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  navChips: document.querySelectorAll('.nav-chip'),
  sectionTitle: document.getElementById('sectionTitle'),
  resultCount: document.getElementById('resultCount'),
  itemsList: document.getElementById('itemsList'),
};

let currentFilter = 'trending';
let searchDebounceTimer = null;
let cachedBrowseData = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  // Attempt to load from storage first for instant rendering
  await loadCachedDataFromStorage();
  loadCatalog('trending');
});

async function loadCachedDataFromStorage() {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const stored = await chrome.storage.local.get([CACHE_STORAGE_KEY]);
      if (stored && stored[CACHE_STORAGE_KEY]) {
        cachedBrowseData = stored[CACHE_STORAGE_KEY];
      }
    } else {
      const local = localStorage.getItem(CACHE_STORAGE_KEY);
      if (local) cachedBrowseData = JSON.parse(local);
    }
  } catch (_) {}
}

async function saveCachedDataToStorage(data) {
  if (!data) return;
  try {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [CACHE_STORAGE_KEY]: data });
    }
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function setupEventListeners() {
  // Search Input
  el.searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query.length > 0) {
      el.clearSearchBtn.classList.remove('hidden');
    } else {
      el.clearSearchBtn.classList.add('hidden');
    }

    clearTimeout(searchDebounceTimer);
    if (query.length >= 2) {
      searchDebounceTimer = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else if (query.length === 0) {
      loadCatalog(currentFilter);
    }
  });

  // Clear Search
  el.clearSearchBtn.addEventListener('click', () => {
    el.searchInput.value = '';
    el.clearSearchBtn.classList.add('hidden');
    el.searchInput.focus();
    loadCatalog(currentFilter);
  });

  // Quick Nav Filters
  el.navChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      el.navChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;
      currentFilter = filter;
      el.searchInput.value = '';
      el.clearSearchBtn.classList.add('hidden');
      loadCatalog(filter);
    });
  });
}

function getFilterTitle(filter) {
  switch (filter) {
    case 'movies':
      return '🎬 Popular Movies';
    case 'series':
      return '📺 Popular TV Series';
    case 'sports':
      return '⚽ 24/7 Live Sports Broadcasts';
    case 'dubbed':
      return '🎧 Dual Audio & Dubbed';
    case 'trending':
    default:
      return '🔥 Trending Now';
  }
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function loadCatalog(filter) {
  el.sectionTitle.textContent = getFilterTitle(filter);

  // If we already have cached data for non-sports, render immediately
  if (filter !== 'sports' && cachedBrowseData) {
    renderFilteredBrowse(filter);
  } else {
    showLoader();
  }

  try {
    if (filter === 'sports') {
      const res = await fetchWithTimeout(`${BASE_URL}/api/sports`, 7000);
      if (!res.ok) throw new Error('Failed to load sports');
      const data = await res.json();
      const matches = data.matches || [];
      const items = matches.map((m) => ({
        id: m.id,
        title: `${m.teams?.home?.name || m.title || 'Match'} vs ${m.teams?.away?.name || ''}`,
        name: m.title || `${m.teams?.home?.name || 'Match'} vs ${m.teams?.away?.name || ''}`,
        poster_url: m.poster_url || m.teams?.home?.badge || `${BASE_URL}/favicon.ico`,
        rating: m.status === 'LIVE' ? '🔴 LIVE' : 'UPCOMING',
        year: m.league || 'Sports',
        media_type: 'sports',
      }));
      renderItems(items, true);
      return;
    }

    // Fetch fresh browse catalog
    const res = await fetchWithTimeout(`${BASE_URL}/api/browse`, 8000);
    if (!res.ok) throw new Error(`Catalog HTTP ${res.status}`);
    const data = await res.json();
    cachedBrowseData = data;
    saveCachedDataToStorage(data);

    renderFilteredBrowse(filter);
  } catch (err) {
    console.error('Catalog load error:', err);
    // If we have rendered from cache already, don't show full error
    if (!cachedBrowseData || (filter === 'sports' && el.itemsList.children.length === 0)) {
      showError('Could not load data. Check internet connection.');
    }
  }
}

function renderFilteredBrowse(filter) {
  if (!cachedBrowseData) return;
  let items = [];
  if (filter === 'movies') {
    items = cachedBrowseData.movies || [];
  } else if (filter === 'series') {
    items = cachedBrowseData.series || [];
  } else if (filter === 'dubbed') {
    items = (cachedBrowseData.movies || []).slice(0, 15);
  } else {
    // trending
    items = cachedBrowseData.trending || cachedBrowseData.hero_slides || [];
  }
  renderItems(items, false);
}

async function performSearch(query) {
  showLoader();
  el.sectionTitle.textContent = `Search results for "${query}"`;

  try {
    const res = await fetchWithTimeout(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`, 8000);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    const items = Array.isArray(data) ? data : (data.items || data.results || []);
    renderItems(items, false);
  } catch (err) {
    showError('No results found. Try another search.');
  }
}

function renderItems(items, isSports = false) {
  el.itemsList.innerHTML = '';
  el.resultCount.textContent = items.length > 0 ? `${items.length} titles` : '';

  if (items.length === 0) {
    el.itemsList.innerHTML = `
      <div class="loader-wrap">
        <span>No titles found. Try searching for another movie or series.</span>
      </div>
    `;
    return;
  }

  items.slice(0, 25).forEach((item) => {
    const card = document.createElement('div');
    card.className = 'media-card';

    const title = item.title || item.name || 'Untitled';
    const poster = item.poster_url || item.poster || item.logo || `${BASE_URL}/favicon.ico`;
    const rating = item.rating ? (String(item.rating).includes('LIVE') ? item.rating : `⭐ ${Number(item.rating).toFixed(1)}`) : '⭐ 8.2';
    const year = item.year || (isSports ? 'LIVE' : '4K');
    const type = isSports ? 'SPORTS' : (item.media_type === 'series' || item.type === 'tv' ? 'SERIES' : 'MOVIE');

    card.innerHTML = `
      <img class="media-poster" src="${poster}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${BASE_URL}/favicon.ico'" />
      <div class="media-info">
        <div class="media-title" title="${escapeHtml(title)}">${escapeHtml(title)}</div>
        <div class="media-meta">
          <span class="badge-tag">${type}</span>
          <span>${year}</span>
          <span class="badge-rating">${rating}</span>
        </div>
      </div>
      <button class="watch-btn" type="button">
        ▶ Watch
      </button>
    `;

    card.addEventListener('click', () => {
      openMedia(item, isSports);
    });

    el.itemsList.appendChild(card);
  });
}

function openMedia(item, isSports) {
  let targetUrl = BASE_URL;
  if (isSports) {
    const channelId = encodeURIComponent(item.id || item.channel_id || item.name || '');
    const channelTitle = encodeURIComponent(item.name || 'Live Sports');
    targetUrl = `${BASE_URL}/?sports=${channelId}&title=${channelTitle}`;
  } else {
    let idVal = '';
    if (item.id && typeof item.id === 'object' && item.id.value) {
      idVal = item.id.value;
    } else if (item.id && typeof item.id === 'string') {
      idVal = item.id;
    } else if (item.imdb_id) {
      idVal = item.imdb_id;
    } else if (item.value) {
      idVal = item.value;
    }
    const titleVal = encodeURIComponent(item.title || '');
    targetUrl = `${BASE_URL}/?watch=${encodeURIComponent(idVal)}&title=${titleVal}`;
  }

  chrome.tabs.create({ url: targetUrl });
}

function showLoader() {
  el.itemsList.innerHTML = `
    <div class="loader-wrap">
      <div class="spinner"></div>
      <span>Loading 4K catalog...</span>
    </div>
  `;
}

function showError(msg) {
  el.itemsList.innerHTML = `
    <div class="loader-wrap" style="flex-direction: column; gap: 8px;">
      <span style="color: #f87171;">${escapeHtml(msg)}</span>
      <button id="extensionRetryBtn" class="watch-btn" style="padding: 6px 14px; background: #e50914; font-size: 12px; margin-top: 4px;">
        🔄 Try Again
      </button>
    </div>
  `;
  const retryBtn = document.getElementById('extensionRetryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      loadCatalog(currentFilter);
    });
  }
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
