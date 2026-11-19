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
  let endpoint = '/api/trending';
  let title = '🔥 Trending Now';

  switch (filter) {
    case 'movies':
      endpoint = '/api/movies?page=1';
      title = '🎬 Popular Movies';
      break;
    case 'series':
      endpoint = '/api/series?page=1';
      title = '📺 Popular TV Series';
      break;
    case 'sports':
      endpoint = '/api/sports';
      title = '⚽ 24/7 Live Sports Channels';
      break;
    case 'dubbed':
      endpoint = '/api/movies?language=dubbed';
      title = '🎧 Dual Audio & Dubbed';
      break;
    case 'trending':
    default:
      endpoint = '/api/trending';
      title = '🔥 Trending Now';
      break;
  }

  el.sectionTitle.textContent = title;

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`);
    if (!res.ok) throw new Error('Failed to load items');
    const data = await res.json();
    const items = data.items || data.channels || [];
    renderItems(items, filter === 'sports');
  } catch (err) {
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
    const items = data.items || [];
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
    const poster = item.poster_url || item.logo || `${BASE_URL}/favicon.ico`;
    const rating = item.rating ? `⭐ ${Number(item.rating).toFixed(1)}` : '⭐ 8.0';
    const year = item.year || (isSports ? 'LIVE' : '4K');
    const type = isSports ? 'SPORTS' : (item.media_type === 'series' ? 'SERIES' : 'MOVIE');

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
