// MovieBox Plus - Chrome Extension Popup Controller

const BASE_URL = 'https://netmirror-plus.vercel.app';

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
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadCatalog('trending');
});

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

async function loadCatalog(filter) {
  showLoader();
  let title = '🔥 Trending Now';

  switch (filter) {
    case 'movies':
      title = '🎬 Popular Movies';
      break;
    case 'series':
      title = '📺 Popular TV Series';
      break;
    case 'sports':
      title = '⚽ 24/7 Live Sports Broadcasts';
      break;
    case 'dubbed':
      title = '🎧 Dual Audio & Dubbed';
      break;
    case 'trending':
    default:
      title = '🔥 Trending Now';
      break;
  }

  el.sectionTitle.textContent = title;

  try {
    if (filter === 'sports') {
      const res = await fetch(`${BASE_URL}/api/sports`);
      if (!res.ok) throw new Error('Failed to load sports');
      const data = await res.json();
      const matches = data.matches || [];
      const items = matches.map(m => ({
        id: m.id,
        title: `${m.teams?.home?.name || m.title || 'Match'} vs ${m.teams?.away?.name || ''}`,
        name: m.title || `${m.teams?.home?.name || 'Match'} vs ${m.teams?.away?.name || ''}`,
        poster_url: m.poster_url || m.teams?.home?.badge || `${BASE_URL}/favicon.ico`,
        rating: m.status === 'LIVE' ? '🔴 LIVE' : 'UPCOMING',
        year: m.league || 'Sports',
        media_type: 'sports'
      }));
      renderItems(items, true);
      return;
    }

    if (!cachedBrowseData) {
      const res = await fetch(`${BASE_URL}/api/browse`);
      if (!res.ok) throw new Error('Failed to load catalog');
      cachedBrowseData = await res.json();
    }

    let items = [];
    if (filter === 'movies') {
      items = cachedBrowseData.movies || [];
    } else if (filter === 'series') {
      items = cachedBrowseData.series || [];
    } else if (filter === 'dubbed') {
      items = (cachedBrowseData.movies || []).slice(0, 10);
    } else {
      // trending
      items = cachedBrowseData.trending || cachedBrowseData.hero_slides || [];
    }

    renderItems(items, false);
  } catch (err) {
    console.error('Catalog load error:', err);
    showError('Could not load data. Check internet connection.');
  }
}

async function performSearch(query) {
  showLoader();
  el.sectionTitle.textContent = `Search results for "${query}"`;

  try {
    const res = await fetch(`${BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
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

  items.slice(0, 20).forEach((item) => {
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
    const idVal = item.id && item.id.value ? item.id.value : (item.id || '');
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
    <div class="loader-wrap">
      <span style="color: #f87171;">${escapeHtml(msg)}</span>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
