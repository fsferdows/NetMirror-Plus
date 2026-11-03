/**
 * NetMirror / MovieBox Web - Client Application
 * Premium Cinema UI/UX & Native In-Browser Video Player
 */

(function () {
  'use strict';

  // State Management
  const state = {
    heroItem: null,
    heroSlides: [],
    heroCurrentIndex: 0,
    heroAutoRotateTimer: null,
    currentDetails: null,
    currentStreams: [],
    currentQuality: 'Auto',
    currentSubtitles: [],
    activeSubtitleTrack: null,
    currentSeason: 1,
    currentEpisode: 1,
    currentStreamIndex: 0,
    embedUrls: [],
    isEmbedMode: false,
    currentNav: 'home',
    activeFilter: 'all',
    gridItems: [],
    gridPage: 1,
    currentQuery: '',
    currentOtt: '',
    // Platform View State
    currentPlatformKey: '',
    currentPlatformName: '',
    currentPlatformColor: '#e50914',
    platformPage: 1,
    platformTotalPages: 1,
    platformType: 'all',
    platformSort: 'date',
    platformItems: [],
    isPlatformLoading: false,
    // Sports Streaming State
    sportsMatches: [],
    sportsChannels: [],
    sportsCategories: [],
    sportsActiveCat: 'all',
    sportsActiveStatus: 'all',
    sportsSearchQuery: '',
    isSportsLoading: false,
    history: JSON.parse(localStorage.getItem('netmirror_history') || '[]'),
    favorites: JSON.parse(localStorage.getItem('netmirror_favorites') || '[]'),
    isPlaying: false,
    controlsTimeout: null,
    nextEpCountdownInterval: null,
  };

  // DOM Elements Cache
  const el = {
    navbar: document.getElementById('navbar'),
    logoBtn: document.getElementById('logoBtn'),
    navLinks: document.querySelectorAll('.nav-link[data-nav]'),
    ottDropdownBtn: document.getElementById('ottDropdownBtn'),
    ottDropdownMenu: document.getElementById('ottDropdownMenu'),
    searchInput: document.getElementById('searchInput'),
    searchWrapper: document.getElementById('searchWrapper'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    suggestionsPopover: document.getElementById('suggestionsPopover'),
    shortcutsBtn: document.getElementById('shortcutsBtn'),

    // Hero
    heroSection: document.getElementById('heroSection'),
    heroBackdrop: document.getElementById('heroBackdrop'),
    heroMediaType: document.getElementById('heroMediaType'),
    heroRating: document.getElementById('heroRating'),
    heroYear: document.getElementById('heroYear'),
    heroTitle: document.getElementById('heroTitle'),
    heroSynopsis: document.getElementById('heroSynopsis'),
    heroPlayBtn: document.getElementById('heroPlayBtn'),
    heroDetailsBtn: document.getElementById('heroDetailsBtn'),
    heroFavBtn: document.getElementById('heroFavBtn'),
    heroPrevBtn: document.getElementById('heroPrevBtn'),
    heroNextBtn: document.getElementById('heroNextBtn'),
    heroIndicators: document.getElementById('heroIndicators'),
    heroSearchInput: document.getElementById('heroSearchInput'),
    heroSearchSubmitBtn: document.getElementById('heroSearchSubmitBtn'),
    quickTags: document.getElementById('quickTags'),

    // Views
    railsView: document.getElementById('railsView'),
    gridView: document.getElementById('gridView'),
    gridTitle: document.getElementById('gridTitle'),
    gridSubtitle: document.getElementById('gridSubtitle'),
    gridFilters: document.getElementById('gridFilters'),
    mediaGrid: document.getElementById('mediaGrid'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),

    // Dedicated Platform View
    platformView: document.getElementById('platformView'),
    platformHeroHeader: document.getElementById('platformHeroHeader'),
    platformHeroGlow: document.getElementById('platformHeroGlow'),
    platformBackBtn: document.getElementById('platformBackBtn'),
    platformBrandBadge: document.getElementById('platformBrandBadge'),
    platformTitle: document.getElementById('platformTitle'),
    platformDescription: document.getElementById('platformDescription'),
    platformTotalCount: document.getElementById('platformTotalCount'),
    platformTypeFilters: document.getElementById('platformTypeFilters'),
    platformSortSelect: document.getElementById('platformSortSelect'),
    platformGrid: document.getElementById('platformGrid'),
    platformLoadMoreBtn: document.getElementById('platformLoadMoreBtn'),

    // Dedicated Live Sports View & Components
    sportsView: document.getElementById('sportsView'),
    sportsHeroHeader: document.querySelector('.sports-hero-header'),
    sportsBackBtn: document.getElementById('sportsBackBtn'),
    sportsSearchInput: document.getElementById('sportsSearchInput'),
    sportsLiveCount: document.getElementById('sportsLiveCount'),
    sportsCategoryFilters: document.getElementById('sportsCategoryFilters'),
    sportsStatusTabs: document.getElementById('sportsStatusTabs'),
    sportsRefreshBtn: document.getElementById('sportsRefreshBtn'),
    sportsMatchesGrid: document.getElementById('sportsMatchesGrid'),
    sportsChannelsGrid: document.getElementById('sportsChannelsGrid'),
    sportsMatchesCount: document.getElementById('sportsMatchesCount'),
    sportsChannelsCount: document.getElementById('sportsChannelsCount'),
    sportsSpotlightSection: document.getElementById('sportsSpotlightSection'),
    sportsSpotlightCarousel: document.getElementById('sportsSpotlightCarousel'),
    homeViewAllSportsBtn: document.getElementById('homeViewAllSportsBtn'),

    // Carousels
    continueWatchingSection: document.getElementById('continueWatchingSection'),
    continueWatchingList: document.getElementById('continueWatchingList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    trendingCarousel: document.getElementById('trendingCarousel'),
    netflixCarousel: document.getElementById('netflixCarousel'),
    primeCarousel: document.getElementById('primeCarousel'),
    disneyCarousel: document.getElementById('disneyCarousel'),
    moviesCarousel: document.getElementById('moviesCarousel'),
    seriesCarousel: document.getElementById('seriesCarousel'),

    // Details Modal
    detailsModal: document.getElementById('detailsModal'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalHeroBg: document.getElementById('modalHeroBg'),
    modalPoster: document.getElementById('modalPoster'),
    modalMediaType: document.getElementById('modalMediaType'),
    modalRating: document.getElementById('modalRating'),
    modalYear: document.getElementById('modalYear'),
    modalDuration: document.getElementById('modalDuration'),
    modalTitle: document.getElementById('modalTitle'),
    modalTagline: document.getElementById('modalTagline'),
    modalGenres: document.getElementById('modalGenres'),
    modalPlayBtn: document.getElementById('modalPlayBtn'),
    modalFavBtn: document.getElementById('modalFavBtn'),
    modalOverview: document.getElementById('modalOverview'),
    modalDirector: document.getElementById('modalDirector'),
    directorRow: document.getElementById('directorRow'),
    modalStars: document.getElementById('modalStars'),
    starsRow: document.getElementById('starsRow'),
    modalDubsSection: document.getElementById('modalDubsSection'),
    modalDubsList: document.getElementById('modalDubsList'),
    modalSeriesSection: document.getElementById('modalSeriesSection'),
    seasonSelect: document.getElementById('seasonSelect'),
    episodeSearchInput: document.getElementById('episodeSearchInput'),
    episodesGrid: document.getElementById('episodesGrid'),

    // Player
    playerOverlay: document.getElementById('playerOverlay'),
    playerContainer: document.getElementById('playerContainer'),
    videoElement: document.getElementById('videoElement'),
    playerHeader: document.getElementById('playerHeader'),
    playerControls: document.getElementById('playerControls'),
    playerBackBtn: document.getElementById('playerBackBtn'),
    playerMediaTitle: document.getElementById('playerMediaTitle'),
    playerMediaSubtitle: document.getElementById('playerMediaSubtitle'),
    playerSpinner: document.getElementById('playerSpinner'),
    spinnerText: document.getElementById('spinnerText'),
    playerCenterIcon: document.getElementById('playerCenterIcon'),
    progressBarContainer: document.getElementById('progressBarContainer'),
    progressTrack: document.querySelector('.progress-track'),
    progressBuffer: document.getElementById('progressBuffer'),
    progressPlayed: document.getElementById('progressPlayed'),
    progressHandle: document.getElementById('progressHandle'),
    progressHoverTime: document.getElementById('progressHoverTime'),
    playPauseBtn: document.getElementById('playPauseBtn'),
    playIcon: document.getElementById('playIcon'),
    pauseIcon: document.getElementById('pauseIcon'),
    rewindBtn: document.getElementById('rewindBtn'),
    forwardBtn: document.getElementById('forwardBtn'),
    volumeBtn: document.getElementById('volumeBtn'),
    volumeHighIcon: document.getElementById('volumeHighIcon'),
    volumeMutedIcon: document.getElementById('volumeMutedIcon'),
    volumeSlider: document.getElementById('volumeSlider'),
    currentTime: document.getElementById('currentTime'),
    durationTime: document.getElementById('durationTime'),
    embedPlayerIframe: document.getElementById('embedPlayerIframe'),
    serverMenuWrapper: document.getElementById('serverMenuWrapper'),
    serverMenuBtn: document.getElementById('serverMenuBtn'),
    currentServerLabel: document.getElementById('currentServerLabel'),
    serverMenu: document.getElementById('serverMenu'),
    qualityMenuBtn: document.getElementById('qualityMenuBtn'),
    currentQualityLabel: document.getElementById('currentQualityLabel'),
    qualityMenu: document.getElementById('qualityMenu'),
    audioDubMenuWrapper: document.getElementById('audioDubMenuWrapper'),
    audioDubMenuBtn: document.getElementById('audioDubMenuBtn'),
    audioDubMenu: document.getElementById('audioDubMenu'),
    subtitlesMenuBtn: document.getElementById('subtitlesMenuBtn'),
    subtitlesMenu: document.getElementById('subtitlesMenu'),
    speedMenuBtn: document.getElementById('speedMenuBtn'),
    currentSpeedLabel: document.getElementById('currentSpeedLabel'),
    speedMenu: document.getElementById('speedMenu'),
    pipBtn: document.getElementById('pipBtn'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    fullscreenOpenIcon: document.getElementById('fullscreenOpenIcon'),
    fullscreenExitIcon: document.getElementById('fullscreenExitIcon'),
    nextEpisodeControlBtn: document.getElementById('nextEpisodeControlBtn'),
    nextEpPrompt: document.getElementById('nextEpPrompt'),
    nextEpTitle: document.getElementById('nextEpTitle'),
    nextEpCountdown: document.getElementById('nextEpCountdown'),
    playNextNowBtn: document.getElementById('playNextNowBtn'),
    cancelNextBtn: document.getElementById('cancelNextBtn'),

    // Shortcuts & Toasts
    shortcutsModal: document.getElementById('shortcutsModal'),
    shortcutsCloseBtn: document.getElementById('shortcutsCloseBtn'),
    toastContainer: document.getElementById('toastContainer'),
  };

  // Toast Helper
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    el.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Format seconds to HH:MM:SS or MM:SS
  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    const s = Math.floor(seconds);
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }

  // Fallback poster image generator
  function fallbackPoster(title) {
    const cleanTitle = (title || 'Movie').slice(0, 16);
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="300" height="450" fill="%23141b2b"/><text x="50%" y="45%" fill="%23e50914" font-size="28" font-family="sans-serif" font-weight="bold" text-anchor="middle">NETMIRROR</text><text x="50%" y="55%" fill="%23a0aab8" font-size="14" font-family="sans-serif" text-anchor="middle">${encodeURIComponent(cleanTitle)}</text></svg>`;
  }

  // ==========================================================================
  // TITLE CLEANING & DEDUPLICATION HELPERS
  // ==========================================================================
  function cleanDisplayTitle(title) {
    if (!title) return '';
    return title
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getCanonicalKey(item) {
    if (!item) return '';
    const title = item.title || '';
    return title
      .replace(/&amp;/g, '&')
      .replace(/&#039;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\bS\d+(-S\d+)?\b/gi, '')
      .replace(/\bSeason\s*\d+\b/gi, '')
      .replace(/\b(Hindi|English|Tamil|Telugu|Kannada|Malayalam|Bengali|Dubbed|Multi|Dual\s*Audio)\b/gi, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  }

  // ==========================================================================
  // INITIALIZATION & DATA FETCHING
  // ==========================================================================
  async function init() {
    setupEventListeners();
    renderContinueWatching();
    await fetchBrowseData();
    fetchSportsData().catch(() => {});
  }

  async function fetchBrowseData() {
    try {
      const res = await fetch('/api/browse?_t=' + Date.now());
      if (!res.ok) throw new Error('Failed to load browse data');
      const data = await res.json();

      const globalSeen = new Set();
      function filterUnique(list, max = 14) {
        const out = [];
        for (const item of (list || [])) {
          if (!item || !item.id) continue;
          const k = getCanonicalKey(item);
          if (k && globalSeen.has(k)) continue;
          if (k) globalSeen.add(k);
          out.push(item);
          if (out.length >= max) break;
        }
        return out;
      }

      // Multi-slide Hero Setup
      const heroSlides = filterUnique(data.hero_slides || [], 5);
      if (heroSlides.length) {
        state.heroSlides = heroSlides;
        state.heroCurrentIndex = 0;
        setHero(state.heroSlides[0]);
        renderHeroIndicators();
        startHeroAutoRotate();
      } else if (data.hero) {
        setHero(data.hero);
      }

      // Rails with global deduplication across sections
      const trending = filterUnique(data.trending || [], 14);
      const netflix = filterUnique(data.netflix || [], 14);
      const prime = filterUnique(data.prime || [], 14);
      const disney = filterUnique(data.disney || [], 14);
      const movies = filterUnique(data.movies || [], 14);
      const series = filterUnique(data.series || [], 14);

      if (trending.length && el.trendingCarousel) renderCarousel(el.trendingCarousel, trending);
      if (netflix.length && el.netflixCarousel) renderCarousel(el.netflixCarousel, netflix);
      if (prime.length && el.primeCarousel) renderCarousel(el.primeCarousel, prime);
      if (disney.length && el.disneyCarousel) renderCarousel(el.disneyCarousel, disney);
      if (movies.length && el.moviesCarousel) renderCarousel(el.moviesCarousel, movies);
      if (series.length && el.seriesCarousel) renderCarousel(el.seriesCarousel, series);
    } catch (err) {
      console.error(err);
      showToast('Error connecting to MovieBox service. Retrying...');
    }
  }

  function setHero(item) {
    if (!item) return;
    state.heroItem = item;
    const title = cleanDisplayTitle(item.title);
    const poster = item.poster_url || fallbackPoster(title);
    
    // Smooth transition
    el.heroBackdrop.style.opacity = '0.3';
    setTimeout(() => {
      el.heroBackdrop.style.backgroundImage = `url('${poster}')`;
      el.heroBackdrop.style.opacity = '1';
    }, 150);

    el.heroTitle.textContent = title;
    el.heroYear.textContent = item.year || '2026';
    el.heroMediaType.textContent = item.media_type === 'series' ? 'TV SERIES' : 'MOVIE';
    el.heroRating.textContent = '⭐ 8.7';
    el.heroSynopsis.textContent =
      `Stream ${title} directly in your browser in high definition with multi-audio and subtitles.`;

    updateHeroFavBtn();
  }

  function renderHeroIndicators() {
    if (!el.heroIndicators) return;
    el.heroIndicators.innerHTML = '';
    state.heroSlides.forEach((slide, idx) => {
      const dot = document.createElement('div');
      dot.className = `indicator-dot ${idx === state.heroCurrentIndex ? 'active' : ''}`;
      dot.setAttribute('title', slide.title);
      dot.onclick = () => {
        state.heroCurrentIndex = idx;
        setHero(state.heroSlides[idx]);
        updateHeroIndicators();
        resetHeroAutoRotate();
      };
      el.heroIndicators.appendChild(dot);
    });
  }

  function updateHeroIndicators() {
    if (!el.heroIndicators) return;
    const dots = el.heroIndicators.querySelectorAll('.indicator-dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === state.heroCurrentIndex);
    });
  }

  function nextHeroSlide() {
    if (!state.heroSlides || !state.heroSlides.length) return;
    state.heroCurrentIndex = (state.heroCurrentIndex + 1) % state.heroSlides.length;
    setHero(state.heroSlides[state.heroCurrentIndex]);
    updateHeroIndicators();
  }

  function prevHeroSlide() {
    if (!state.heroSlides || !state.heroSlides.length) return;
    state.heroCurrentIndex = (state.heroCurrentIndex - 1 + state.heroSlides.length) % state.heroSlides.length;
    setHero(state.heroSlides[state.heroCurrentIndex]);
    updateHeroIndicators();
  }

  function startHeroAutoRotate() {
    if (state.heroAutoRotateTimer) clearInterval(state.heroAutoRotateTimer);
    state.heroAutoRotateTimer = setInterval(() => {
      if (state.currentNav === 'home' && el.playerOverlay.classList.contains('hidden') && el.detailsModal.classList.contains('hidden')) {
        nextHeroSlide();
      }
    }, 8000);
  }

  function resetHeroAutoRotate() {
    startHeroAutoRotate();
  }

  function updateHeroFavBtn() {
    if (!state.heroItem) return;
    const isFav = state.favorites.some((f) => f.id.value === state.heroItem.id.value);
    el.heroFavBtn.classList.toggle('fav-active', isFav);
  }

  // ==========================================================================
  // CAROUSEL & CARDS RENDERING
  // ==========================================================================
  function renderCarousel(container, items) {
    if (!container) return;
    container.innerHTML = '';
    const seen = new Set();
    let index = 0;
    (items || []).forEach((item) => {
      if (!item || !item.id) return;
      const key = getCanonicalKey(item);
      if (key && seen.has(key)) return;
      if (key) seen.add(key);
      const card = createMovieCard(item, index++);
      container.appendChild(card);
    });
  }

  function createMovieCard(item, index = 0) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const displayTitle = cleanDisplayTitle(item.title);
    const poster = item.poster_url || fallbackPoster(displayTitle);
    const mediaTypeLabel = item.media_type === 'series' ? 'SERIES' : 'MOVIE';
    const year = item.year || '';

    // Check if item is in continue watching history
    const historyItem = state.history.find((h) => h.id.value === item.id.value);
    const progressPercent = historyItem && historyItem.duration > 0
      ? Math.min(100, Math.floor((historyItem.currentTime / historyItem.duration) * 100))
      : 0;

    card.innerHTML = `
      <div class="poster-wrap">
        <img class="poster-img" src="${poster}" alt="${displayTitle}" loading="lazy" onerror="this.src='${fallbackPoster(displayTitle)}'" />
        <span class="card-badge-type">${mediaTypeLabel}</span>
        <span class="card-badge-rating">⭐ 8.${(index % 4) + 5}</span>
        <div class="card-play-overlay">
          <div class="card-play-icon">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
        ${progressPercent > 0 ? `<div class="card-progress-bar"><div class="card-progress-fill" style="width: ${progressPercent}%;"></div></div>` : ''}
      </div>
      <div class="card-info">
        <span class="card-title" title="${displayTitle}">${displayTitle}</span>
        <div class="card-meta">
          <span>${year}</span>
          <span>${mediaTypeLabel}</span>
        </div>
      </div>
    `;

    // Click behavior
    card.addEventListener('click', (e) => {
      const playBtn = card.querySelector('.card-play-icon');
      if (playBtn && (e.target === playBtn || playBtn.contains(e.target))) {
        e.stopPropagation();
        openPlayerDirect(item);
      } else {
        openDetailsModal(item.id.value, item.id.provider, item.title);
      }
    });

    return card;
  }

  function renderContinueWatching() {
    if (!state.history || state.history.length === 0) {
      el.continueWatchingSection.classList.add('hidden');
      return;
    }
    el.continueWatchingSection.classList.remove('hidden');
    el.continueWatchingList.innerHTML = '';

    state.history.slice(0, 12).forEach((item) => {
      const card = createMovieCard(item);
      el.continueWatchingList.appendChild(card);
    });
  }

  // ==========================================================================
  // MEDIA DETAILS MODAL
  // ==========================================================================
  async function openDetailsModal(id, provider = 'moviebox', titleHint = '') {
    el.detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Show skeletons/loading state
    el.modalTitle.textContent = titleHint || 'Loading...';
    el.modalOverview.textContent = 'Fetching metadata and stream mirrors...';
    el.modalHeroBg.style.backgroundImage = 'none';
    el.modalPoster.src = '';
    el.modalGenres.innerHTML = '';
    el.modalSeriesSection.classList.add('hidden');
    el.modalDubsSection.classList.add('hidden');

    try {
      const titleParam = titleHint ? `&title=${encodeURIComponent(titleHint)}` : '';
      const res = await fetch(`/api/details/${id}?provider=${provider}${titleParam}`);
      if (!res.ok) throw new Error('Details not found');
      const details = await res.json();
      state.currentDetails = details;

      const displayTitle = cleanDisplayTitle(details.title);
      const poster = details.poster_url || fallbackPoster(displayTitle);
      el.modalPoster.src = poster;
      el.modalHeroBg.style.backgroundImage = `url('${poster}')`;
      el.modalTitle.textContent = displayTitle;
      el.modalTagline.textContent = details.tagline || '';
      el.modalYear.textContent = details.year || '2025';
      el.modalDuration.textContent = details.duration || 'Full Feature';
      el.modalMediaType.textContent = details.media_type === 'series' ? 'TV SERIES' : 'MOVIE';
      el.modalRating.textContent = `⭐ ${details.imdb_rating || '8.5'}`;
      el.modalOverview.textContent = details.description || 'No detailed overview available.';

      // Genres
      el.modalGenres.innerHTML = '';
      if (details.genres && details.genres.length) {
        details.genres.forEach((g) => {
          const span = document.createElement('span');
          span.className = 'genre-tag';
          span.textContent = g;
          el.modalGenres.appendChild(span);
        });
      }

      // Credits
      if (details.director) {
        el.modalDirector.textContent = details.director;
        el.directorRow.classList.remove('hidden');
      } else {
        el.directorRow.classList.add('hidden');
      }

      if (details.stars) {
        el.modalStars.textContent = details.stars;
        el.starsRow.classList.remove('hidden');
      } else {
        el.starsRow.classList.add('hidden');
      }

      // Audio Dubs
      if (details.dubs && details.dubs.length > 1) {
        el.modalDubsSection.classList.remove('hidden');
        el.modalDubsList.innerHTML = '';
        details.dubs.forEach((dub, idx) => {
          const btn = document.createElement('button');
          btn.className = `dub-btn ${idx === 0 ? 'active' : ''}`;
          btn.textContent = dub.label || dub.language;
          btn.addEventListener('click', () => {
            el.modalDubsList.querySelectorAll('.dub-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            openDetailsModal(dub.subject_id, provider);
          });
          el.modalDubsList.appendChild(btn);
        });
      }

      // TV Series Episodes
      const isSeries = details.media_type === 'series' || (details.seasons && details.seasons.length > 0);
      if (isSeries && details.seasons && details.seasons.length > 0) {
        state.currentSeason = details.seasons[0].number || 1;
        state.currentEpisode = 1;
        el.modalSeriesSection.classList.remove('hidden');
        populateSeasonSelector(details.seasons);
      } else {
        state.currentSeason = 0;
        state.currentEpisode = 0;
        el.modalSeriesSection.classList.add('hidden');
      }

      // Favorite Button State
      const isFav = state.favorites.some((f) => f.id.value === details.id.value);
      el.modalFavBtn.classList.toggle('fav-active', isFav);
      el.modalFavBtn.textContent = isFav ? '✓ In My List' : 'Add to List';

      // Play Button Handler
      el.modalPlayBtn.onclick = () => {
        closeDetailsModal();
        const s = isSeries ? (state.currentSeason || 1) : 0;
        const e = isSeries ? (state.currentEpisode || 1) : 0;
        startPlayback(details, s, e);
      };

    } catch (err) {
      console.error(err);
      el.modalOverview.textContent = 'Error loading media details. Please try again.';
      showToast('Could not load details');
    }
  }

  function populateSeasonSelector(seasons) {
    el.seasonSelect.innerHTML = '';
    seasons.forEach((season) => {
      const opt = document.createElement('option');
      opt.value = season.number;
      opt.textContent = `Season ${season.number} (${season.episodes.length} Episodes)`;
      el.seasonSelect.appendChild(opt);
    });

    state.currentSeason = seasons[0].number;
    renderEpisodes(seasons[0].episodes);

    el.seasonSelect.onchange = (e) => {
      const sNum = parseInt(e.target.value, 10);
      state.currentSeason = sNum;
      const found = seasons.find((s) => s.number === sNum);
      if (found) {
        renderEpisodes(found.episodes);
      }
    };

    el.episodeSearchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      const currentSeasonData = seasons.find((s) => s.number === state.currentSeason);
      if (currentSeasonData) {
        const filtered = currentSeasonData.episodes.filter(
          (ep) => (ep.title && ep.title.toLowerCase().includes(q)) || String(ep.number).includes(q)
        );
        renderEpisodes(filtered);
      }
    };
  }

  function renderEpisodes(episodes) {
    el.episodesGrid.innerHTML = '';
    if (!episodes || episodes.length === 0) {
      el.episodesGrid.innerHTML = '<p style="color:var(--text-muted);padding:12px;">No episodes found for this season.</p>';
      return;
    }

    episodes.forEach((ep) => {
      const epCard = document.createElement('div');
      epCard.className = 'episode-card';
      const poster = state.currentDetails.poster_url || fallbackPoster(state.currentDetails.title);
      const epTitle = ep.title || `Episode ${ep.number}`;
      const epOverview = ep.overview || `Watch Season ${state.currentSeason} Episode ${ep.number}.`;

      epCard.innerHTML = `
        <div class="ep-num">${String(ep.number).padStart(2, '0')}</div>
        <div class="ep-thumb-wrap">
          <img src="${poster}" alt="${epTitle}" class="ep-thumb" />
          <div class="ep-play-icon">
            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </div>
        </div>
        <div class="ep-info">
          <h4 class="ep-title">${epTitle}</h4>
          <p class="ep-overview">${epOverview}</p>
        </div>
      `;

      epCard.addEventListener('click', () => {
        closeDetailsModal();
        state.currentEpisode = ep.number;
        startPlayback(state.currentDetails, state.currentSeason, ep.number);
      });

      el.episodesGrid.appendChild(epCard);
    });
  }

  function closeDetailsModal() {
    el.detailsModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  }

  function openPlayerDirect(item) {
    const isSeries = item.media_type === 'series';
    const s = isSeries ? 1 : 0;
    const e = isSeries ? 1 : 0;
    startPlayback(item, s, e);
  }

  // ==========================================================================
  // IN-BROWSER VIDEO PLAYER
  // ==========================================================================
  async function startPlayback(media, season = 0, episode = 0) {
    el.playerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    el.playerSpinner.classList.remove('hidden');
    el.spinnerText.textContent = 'Resolving video streams...';

    // Set Header Info
    el.playerMediaTitle.textContent = media.title;
    const isSeries = media.media_type === 'series' || season > 0 || episode > 0;
    if (isSeries && season > 0) {
      el.playerMediaSubtitle.textContent = `Season ${season} • Episode ${episode}`;
      el.nextEpisodeControlBtn.classList.remove('hidden');
    } else {
      el.playerMediaSubtitle.textContent = media.year || 'Movie';
      el.nextEpisodeControlBtn.classList.add('hidden');
    }

    state.currentSeason = season;
    state.currentEpisode = episode;
    state.isEmbedMode = false;
    state.currentStreamIndex = 0;
    if (el.embedPlayerIframe) {
      el.embedPlayerIframe.classList.add('hidden');
      el.embedPlayerIframe.src = '';
    }
    el.videoElement.classList.remove('hidden');

    try {
      const titleParam = encodeURIComponent(media.title || '');
      const providerParam = media.id && media.id.provider ? `&provider=${media.id.provider}` : '';
      const res = await fetch(`/api/streams/${media.id.value}?season=${season}&episode=${episode}&title=${titleParam}${providerParam}`);
      if (!res.ok) throw new Error('No streams found');
      const data = await res.json();

      state.currentStreams = data.streams || [];
      state.embedUrls = data.embed_urls || [];

      // Check Saved Timestamp
      const historyItem = state.history.find(
        (h) => h.id.value === media.id.value && h.season === season && h.episode === episode
      );
      const resumeTime = historyItem ? historyItem.currentTime : 0;

      // Populate Server Menu
      populateServerMenu(state.currentStreams, state.embedUrls);

      if (state.currentStreams.length > 0) {
        const defaultStream = state.currentStreams[0];
        state.currentQuality = defaultStream.quality;
        el.currentQualityLabel.textContent = defaultStream.quality;
        if (el.currentServerLabel) {
          el.currentServerLabel.textContent = defaultStream.server || 'Server 1';
        }

        // Populate Quality Menu
        populateQualityMenu(state.currentStreams);

        // Load Subtitles
        if (data.resource_id) {
          loadSubtitles(media.id.value, data.resource_id, season, episode);
        }

        // Play video
        playStreamUrl(defaultStream.proxy_url, resumeTime);
      } else if (state.embedUrls.length > 0) {
        // Fallback directly to universal embed player
        playEmbedUrl(state.embedUrls[0].url, state.embedUrls[0].name);
      } else {
        throw new Error('No playable stream mirrors available');
      }

      // Record to history
      saveToHistory(media, season, episode);

    } catch (err) {
      console.error(err);
      if (state.embedUrls && state.embedUrls.length > 0) {
        showToast('Direct stream unavailable, falling back to Cloud Player...');
        playEmbedUrl(state.embedUrls[0].url, state.embedUrls[0].name);
      } else {
        el.spinnerText.textContent = 'Playback error: ' + err.message;
        showToast('Could not load stream: ' + err.message);
      }
    }
  }

  function playStreamUrl(url, seekTime = 0) {
    const video = el.videoElement;
    video.src = url;
    video.load();

    const onCanPlay = () => {
      el.playerSpinner.classList.add('hidden');
      if (seekTime > 5 && seekTime < video.duration - 10) {
        video.currentTime = seekTime;
        showToast(`Resumed from ${formatTime(seekTime)}`);
      }
      video.play().catch(() => {
        // Autoplay policy fallback
        el.playIcon.classList.remove('hidden');
        el.pauseIcon.classList.add('hidden');
      });
      video.removeEventListener('canplay', onCanPlay);
    };

    video.addEventListener('canplay', onCanPlay);

    video.onerror = () => {
      console.warn('Video element reported error for:', video.src);
      const nextIdx = state.currentStreamIndex + 1;
      if (nextIdx < state.currentStreams.length) {
        state.currentStreamIndex = nextIdx;
        const nextStream = state.currentStreams[nextIdx];
        showToast(`Stream issue. Auto-switching to ${nextStream.server}...`);
        switchStream(nextStream, video.currentTime || 0);
      } else if (state.embedUrls && state.embedUrls.length > 0 && !state.isEmbedMode) {
        showToast('Direct streams unavailable. Switching to Universal Cloud Player...');
        playEmbedUrl(state.embedUrls[0].url, state.embedUrls[0].name);
      } else {
        el.spinnerText.textContent = 'Playback error: Stream could not be played.';
        el.playerSpinner.classList.remove('hidden');
      }
    };
  }

  function playEmbedUrl(url, serverName = 'Embed Player') {
    state.isEmbedMode = true;
    el.videoElement.pause();
    el.videoElement.classList.add('hidden');
    if (el.playerControls) {
      el.playerControls.classList.add('hidden');
    }
    if (el.embedPlayerIframe) {
      el.embedPlayerIframe.src = url;
      el.embedPlayerIframe.classList.remove('hidden');
    }
    el.playerSpinner.classList.add('hidden');
    if (el.currentServerLabel) {
      el.currentServerLabel.textContent = serverName;
    }
    showToast(`Streaming via ${serverName}`);
    populateServerMenu(state.currentStreams, state.embedUrls);
  }

  function populateServerMenu(streams, embeds) {
    if (!el.serverMenu) return;
    el.serverMenu.innerHTML = '';

    // Direct streams
    if (streams && streams.length > 0) {
      const directHeader = document.createElement('div');
      directHeader.style.cssText = 'padding:4px 8px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;';
      directHeader.textContent = 'Direct High-Speed CDN';
      el.serverMenu.appendChild(directHeader);

      streams.forEach((stream, idx) => {
        const btn = document.createElement('button');
        btn.className = `menu-item ${idx === state.currentStreamIndex && !state.isEmbedMode ? 'active' : ''}`;
        btn.textContent = `⚡ ${stream.server || 'Direct CDN'} (${stream.quality})`;
        btn.addEventListener('click', () => {
          state.currentStreamIndex = idx;
          state.isEmbedMode = false;
          if (el.embedPlayerIframe) {
            el.embedPlayerIframe.classList.add('hidden');
            el.embedPlayerIframe.src = '';
          }
          el.videoElement.classList.remove('hidden');
          if (el.playerControls) {
            el.playerControls.classList.remove('hidden');
          }
          switchStream(stream, el.videoElement.currentTime || 0);
          el.serverMenu.classList.add('hidden');
          populateServerMenu(state.currentStreams, state.embedUrls);
        });
        el.serverMenu.appendChild(btn);
      });
    }

    // Embed sources
    if (embeds && embeds.length > 0) {
      if (streams && streams.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'menu-divider';
        el.serverMenu.appendChild(divider);
      }

      const cloudHeader = document.createElement('div');
      cloudHeader.style.cssText = 'padding:4px 8px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;';
      cloudHeader.textContent = 'Universal Cloud Mirrors';
      el.serverMenu.appendChild(cloudHeader);

      embeds.forEach((emb) => {
        const btn = document.createElement('button');
        const isActive = state.isEmbedMode && el.embedPlayerIframe && el.embedPlayerIframe.src === emb.url;
        btn.className = `menu-item ${isActive ? 'active' : ''}`;
        btn.textContent = `🌐 ${emb.name}`;
        btn.addEventListener('click', () => {
          playEmbedUrl(emb.url, emb.name);
          el.serverMenu.classList.add('hidden');
        });
        el.serverMenu.appendChild(btn);
      });
    }
  }

  function switchStream(stream, seekTime = 0) {
    state.isEmbedMode = false;
    if (el.embedPlayerIframe) {
      el.embedPlayerIframe.classList.add('hidden');
      el.embedPlayerIframe.src = '';
    }
    el.videoElement.classList.remove('hidden');
    if (el.playerControls) {
      el.playerControls.classList.remove('hidden');
    }

    const video = el.videoElement;
    state.currentQuality = stream.quality;
    el.currentQualityLabel.textContent = stream.quality;
    if (el.currentServerLabel) {
      el.currentServerLabel.textContent = stream.server || 'Direct';
    }

    el.playerSpinner.classList.remove('hidden');
    el.spinnerText.textContent = `Connecting to ${stream.server || 'stream'}...`;

    playStreamUrl(stream.proxy_url, seekTime);
  }

  function populateQualityMenu(streams) {
    el.qualityMenu.innerHTML = '';
    streams.forEach((stream) => {
      const btn = document.createElement('button');
      btn.className = `menu-item ${stream.quality === state.currentQuality ? 'active' : ''}`;
      btn.textContent = `${stream.quality} ${stream.codec ? `(${stream.codec})` : ''}`;
      btn.addEventListener('click', () => {
        switchQuality(stream);
      });
      el.qualityMenu.appendChild(btn);
    });
  }

  function switchQuality(stream) {
    const video = el.videoElement;
    const currentTime = video.currentTime;
    const isPlaying = !video.paused;

    state.currentQuality = stream.quality;
    el.currentQualityLabel.textContent = stream.quality;
    el.qualityMenu.querySelectorAll('.menu-item').forEach((b) => b.classList.remove('active'));

    el.playerSpinner.classList.remove('hidden');
    el.spinnerText.textContent = `Switching to ${stream.quality}...`;

    video.src = stream.proxy_url;
    video.load();

    const onCanPlay = () => {
      el.playerSpinner.classList.add('hidden');
      video.currentTime = currentTime;
      if (isPlaying) video.play();
      showToast(`Switched resolution to ${stream.quality}`);
      video.removeEventListener('canplay', onCanPlay);
    };

    video.addEventListener('canplay', onCanPlay);
    el.qualityMenu.classList.add('hidden');
  }

  async function loadSubtitles(id, resourceId, season = 0, episode = 0) {
    try {
      const res = await fetch(`/api/subtitles/${id}/${resourceId}?season=${season}&episode=${episode}`);
      if (!res.ok) return;
      const subs = await res.json();
      state.currentSubtitles = subs;

      populateSubtitlesMenu(subs);
    } catch (err) {
      console.warn('Subtitles error:', err);
    }
  }

  function populateSubtitlesMenu(subs) {
    el.subtitlesMenu.innerHTML = '';

    // "Off" option
    const offBtn = document.createElement('button');
    offBtn.className = 'menu-item active';
    offBtn.textContent = 'Off';
    offBtn.onclick = () => {
      disableSubtitles();
      el.subtitlesMenu.querySelectorAll('.menu-item').forEach((b) => b.classList.remove('active'));
      offBtn.classList.add('active');
      el.subtitlesMenu.classList.add('hidden');
    };
    el.subtitlesMenu.appendChild(offBtn);

    // Subtitle tracks
    subs.forEach((sub) => {
      const btn = document.createElement('button');
      btn.className = 'menu-item';
      btn.textContent = sub.name;
      btn.onclick = () => {
        enableSubtitleTrack(sub);
        el.subtitlesMenu.querySelectorAll('.menu-item').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        el.subtitlesMenu.classList.add('hidden');
      };
      el.subtitlesMenu.appendChild(btn);
    });
  }

  function enableSubtitleTrack(sub) {
    const video = el.videoElement;
    // Remove existing tracks
    Array.from(video.querySelectorAll('track')).forEach((t) => t.remove());

    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.label = sub.name;
    track.srclang = 'en';
    track.src = sub.vtt_url;
    track.default = true;

    video.appendChild(track);
    track.track.mode = 'showing';
    showToast(`Subtitles: ${sub.name}`);
  }

  function disableSubtitles() {
    const video = el.videoElement;
    Array.from(video.textTracks).forEach((t) => (t.mode = 'disabled'));
    Array.from(video.querySelectorAll('track')).forEach((t) => t.remove());
    showToast('Subtitles disabled');
  }

  function closePlayer() {
    const video = el.videoElement;
    video.pause();
    video.src = '';
    if (el.embedPlayerIframe) {
      el.embedPlayerIframe.src = '';
      el.embedPlayerIframe.classList.add('hidden');
    }
    el.videoElement.classList.remove('hidden');
    state.isEmbedMode = false;
    el.playerOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
    renderContinueWatching();
  }

  function saveToHistory(media, season, episode) {
    const video = el.videoElement;
    const historyItem = {
      id: media.id,
      title: media.title,
      poster_url: media.poster_url,
      media_type: media.media_type,
      year: media.year,
      season,
      episode,
      currentTime: video.currentTime || 0,
      duration: video.duration || 0,
      timestamp: Date.now(),
    };

    // Filter out existing and unshift
    state.history = state.history.filter(
      (h) => !(h.id.value === media.id.value && h.season === season && h.episode === episode)
    );
    state.history.unshift(historyItem);
    if (state.history.length > 30) state.history.pop();
    localStorage.setItem('netmirror_history', JSON.stringify(state.history));
  }

  // Periodic history timestamp saving while playing
  setInterval(() => {
    const video = el.videoElement;
    if (!el.playerOverlay.classList.contains('hidden') && !video.paused && video.duration > 0) {
      if (state.history.length > 0) {
        state.history[0].currentTime = video.currentTime;
        state.history[0].duration = video.duration;
        state.history[0].timestamp = Date.now();
        localStorage.setItem('netmirror_history', JSON.stringify(state.history));
      }

      // Check next episode prompt at 92%
      if (state.currentDetails && state.currentDetails.media_type === 'series') {
        const percent = (video.currentTime / video.duration) * 100;
        if (percent > 92 && el.nextEpPrompt.classList.contains('hidden')) {
          triggerNextEpisodePrompt();
        }
      }
    }
  }, 3000);

  function triggerNextEpisodePrompt() {
    const nextEpNum = state.currentEpisode + 1;
    el.nextEpTitle.textContent = `Season ${state.currentSeason} • Episode ${nextEpNum}`;
    el.nextEpPrompt.classList.remove('hidden');

    let count = 10;
    el.nextEpCountdown.textContent = `Playing in ${count}s...`;
    clearInterval(state.nextEpCountdownInterval);

    state.nextEpCountdownInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(state.nextEpCountdownInterval);
        el.nextEpPrompt.classList.add('hidden');
        playNextEpisode();
      } else {
        el.nextEpCountdown.textContent = `Playing in ${count}s...`;
      }
    }, 1000);
  }

  function playNextEpisode() {
    state.currentEpisode += 1;
    startPlayback(state.currentDetails, state.currentSeason, state.currentEpisode);
  }

  // ==========================================================================
  // SEARCH & AUTOCOMPLETE
  // ==========================================================================
  let debounceTimeout = null;

  function handleSearchInput(e) {
    const q = e.target.value.trim();
    if (q.length > 0) {
      el.clearSearchBtn.classList.remove('hidden');
    } else {
      el.clearSearchBtn.classList.add('hidden');
      el.suggestionsPopover.classList.add('hidden');
      return;
    }

    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetchSuggestions(q);
    }, 250);
  }

  async function fetchSuggestions(query) {
    try {
      const [suggestRes, searchRes] = await Promise.all([
        fetch(`/api/suggest?q=${encodeURIComponent(query)}`).then((r) => r.json()),
        fetch(`/api/search?q=${encodeURIComponent(query)}&page=1`).then((r) => r.json()),
      ]);

      renderSuggestions(query, suggestRes, searchRes);
    } catch (err) {
      console.warn('Suggest error:', err);
    }
  }

  function renderSuggestions(query, suggestions, searchResults) {
    el.suggestionsPopover.innerHTML = '';
    const seen = new Set();
    const items = [];
    for (const item of (searchResults || [])) {
      if (!item || !item.id) continue;
      const k = getCanonicalKey(item);
      if (k && seen.has(k)) continue;
      if (k) seen.add(k);
      items.push(item);
      if (items.length >= 6) break;
    }

    if (items.length === 0 && (!suggestions || suggestions.length === 0)) {
      el.suggestionsPopover.classList.add('hidden');
      return;
    }

    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'suggestion-item';
      const title = cleanDisplayTitle(item.title);
      const poster = item.poster_url || fallbackPoster(title);
      div.innerHTML = `
        <img class="suggestion-poster" src="${poster}" alt="" onerror="this.src='${fallbackPoster(title)}'"/>
        <div style="flex:1;min-width:0;">
          <div class="suggestion-title">${title}</div>
          <div class="suggestion-meta">${item.year || ''} • ${item.media_type === 'series' ? 'Series' : 'Movie'}</div>
        </div>
      `;
      div.onclick = () => {
        el.suggestionsPopover.classList.add('hidden');
        openDetailsModal(item.id.value, item.id.provider, item.title);
      };
      el.suggestionsPopover.appendChild(div);
    });

    // Option to view all results
    const viewAllDiv = document.createElement('div');
    viewAllDiv.className = 'suggestion-item';
    viewAllDiv.style.justifyContent = 'center';
    viewAllDiv.style.color = 'var(--red)';
    viewAllDiv.style.fontWeight = '700';
    viewAllDiv.textContent = `Search all results for "${query}" →`;
    viewAllDiv.onclick = () => {
      el.suggestionsPopover.classList.add('hidden');
      executeSearch(query);
    };
    el.suggestionsPopover.appendChild(viewAllDiv);

    el.suggestionsPopover.classList.remove('hidden');
  }

  async function executeSearch(query) {
    state.currentQuery = query;
    state.gridPage = 1;
    switchView('grid');
    el.gridTitle.textContent = `Results for "${query}"`;
    el.gridSubtitle.textContent = 'Searching MovieBox catalog...';
    el.mediaGrid.innerHTML = '<div style="color:var(--text-muted);padding:40px;">Searching...</div>';

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=1`);
      if (!res.ok) throw new Error('Search failed');
      const items = await res.json();
      state.gridItems = items;
      renderGridItems(items);
      el.gridSubtitle.textContent = `Found ${items.length} titles`;
    } catch (err) {
      console.error(err);
      el.gridSubtitle.textContent = 'Error executing search.';
    }
  }

  // ==========================================================================
  // NAVIGATION & VIEWS
  // ==========================================================================
  function switchView(viewName) {
    if (viewName === 'rails') {
      el.railsView.classList.remove('hidden');
      el.heroSection.classList.remove('hidden');
      el.gridView.classList.add('hidden');
      if (el.platformView) el.platformView.classList.add('hidden');
      if (el.sportsView) el.sportsView.classList.add('hidden');
    } else if (viewName === 'platform') {
      el.railsView.classList.add('hidden');
      el.heroSection.classList.add('hidden');
      el.gridView.classList.add('hidden');
      if (el.platformView) el.platformView.classList.remove('hidden');
      if (el.sportsView) el.sportsView.classList.add('hidden');
    } else if (viewName === 'sports') {
      el.railsView.classList.add('hidden');
      el.heroSection.classList.add('hidden');
      el.gridView.classList.add('hidden');
      if (el.platformView) el.platformView.classList.add('hidden');
      if (el.sportsView) el.sportsView.classList.remove('hidden');
    } else {
      el.railsView.classList.add('hidden');
      el.heroSection.classList.add('hidden');
      el.gridView.classList.remove('hidden');
      if (el.platformView) el.platformView.classList.add('hidden');
      if (el.sportsView) el.sportsView.classList.add('hidden');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================================
  // PLATFORM SHOWCASE LOGIC
  // ==========================================================================
  const PLATFORM_METADATA = {
    netflix: { name: 'Netflix Originals', badge: 'NETFLIX', color: '#e50914', desc: 'Browse over 2,200+ exclusive Netflix movies, high-budget award winning series, and documentaries.' },
    primeVideo: { name: 'Prime Video Exclusives', badge: 'PRIME VIDEO', color: '#00a8e1', desc: 'Stream Amazon Prime Video originals, global blockbusters, action epics, and award-winning TV series.' },
    disney: { name: 'Disney+ Hotstar', badge: 'DISNEY+', color: '#3b82f6', desc: 'The home of Marvel Studios, Star Wars, Pixar, Disney Animation, and Hotstar Specials.' },
    appleTV: { name: 'Apple TV+ Originals', badge: 'APPLE TV+', color: '#a3a3a3', desc: 'Award-winning Apple Original series, compelling dramas, groundbreaking documentaries, and cinema.' },
    hulu: { name: 'Hulu Exclusives', badge: 'HULU', color: '#1ce783', desc: 'Stream top trending Hulu series, critically acclaimed dramas, hit comedies, and original documentaries.' },
    zee5: { name: 'Zee5 Exclusives', badge: 'ZEE5', color: '#a855f7', desc: 'Top Indian cinema, regional blockbusters, Hindi originals, thriller series, and premier Bollywood releases.' },
    viu: { name: 'Viu Asian Dramas', badge: 'VIU', color: '#f59e0b', desc: 'The leading platform for Asian entertainment: Korean dramas, Japanese anime, Hong Kong action, and Thai romance.' },
    vivamax: { name: 'Vivamax Filipino', badge: 'VIVAMAX', color: '#f97316', desc: 'Philippines premier streaming platform featuring Filipino cinema, exclusive romance, drama, and thrillers.' },
    hoichoi: { name: 'Hoichoi Bengali', badge: 'HOICHOI', color: '#ef4444', desc: 'The premier platform for Bengali digital entertainment: original thriller series, detective hits, and films.' },
    marvel: { name: 'Marvel Cinematic Universe', badge: 'MARVEL', color: '#ed1d24', desc: 'All MCU superhero films, Disney+ Phase 4-5 series, and Marvel multiverse releases.' },
    dc: { name: 'DC Studios Universe', badge: 'DC STUDIOS', color: '#0476f2', desc: 'DC universe superheroes: Batman, Superman, Justice League, and animated blockbusters.' },
    anime: { name: 'Anime [English Dubbed]', badge: 'ANIME DUB', color: '#ec4899', desc: 'Popular anime series with English dubbing: One Piece, Jujutsu Kaisen, Demon Slayer, Naruto, and more.' },
    kdrama: { name: 'Korean K-Drama', badge: 'K-DRAMA', color: '#f43f5e', desc: 'Binge the most captivating Korean romantic dramas, mystery thrillers, and revenge sagas.' },
    bollywood: { name: 'Bollywood Blockbusters', badge: 'BOLLYWOOD', color: '#eab308', desc: 'Massive Hindi cinema blockbusters, music, romantic classics, and star-studded releases.' },
    hollywood: { name: 'Hollywood Hits', badge: 'HOLLYWOOD', color: '#06b6d4', desc: 'Worldwide box office hits, theatrical releases, Hollywood action blockbusters, and classics.' },
    boxoffice: { name: 'Top All-Time Box Office', badge: 'BOX OFFICE', color: '#10b981', desc: 'Highest grossing cinema movies of all time: Avatar, Avengers, Titanic, Star Wars, and more.' },
  };

  async function openPlatformView(platformKey, titleHint, brandColor) {
    state.currentPlatformKey = platformKey;
    state.platformPage = 1;
    state.platformItems = [];
    state.platformType = 'all';

    const meta = PLATFORM_METADATA[platformKey] || {
      name: titleHint || `${platformKey.toUpperCase()} Titles`,
      badge: platformKey.toUpperCase(),
      color: brandColor || '#e50914',
      desc: `Explore the complete catalog of movies and series from ${titleHint || platformKey}.`,
    };

    state.currentPlatformName = meta.name;
    state.currentPlatformColor = meta.color;

    // Apply header info
    if (el.platformBrandBadge) {
      el.platformBrandBadge.textContent = meta.badge;
      el.platformBrandBadge.style.color = meta.color;
    }
    if (el.platformTitle) el.platformTitle.textContent = meta.name;
    if (el.platformDescription) el.platformDescription.textContent = meta.desc;
    if (el.platformHeroGlow) {
      el.platformHeroGlow.style.background = `radial-gradient(circle, ${meta.color}55 0%, transparent 70%)`;
    }
    if (el.platformTotalCount) el.platformTotalCount.textContent = 'Loading titles...';

    // Reset filter active states
    if (el.platformTypeFilters) {
      const chips = el.platformTypeFilters.querySelectorAll('.filter-chip');
      chips.forEach((c) => c.classList.toggle('active', c.dataset.type === 'all'));
    }
    if (el.platformSortSelect) {
      el.platformSortSelect.value = state.platformSort || 'date';
    }

    switchView('platform');
    if (el.platformGrid) {
      el.platformGrid.innerHTML = '<div style="color:var(--text-muted);padding:40px;text-align:center;width:100%;">Loading platform content...</div>';
    }

    await fetchPlatformData(false);
  }

  async function fetchPlatformData(append = false) {
    if (state.isPlatformLoading) return;
    state.isPlatformLoading = true;

    if (append && el.platformLoadMoreBtn) {
      el.platformLoadMoreBtn.disabled = true;
      el.platformLoadMoreBtn.textContent = 'Loading...';
    }

    try {
      let url = `/api/platform?name=${encodeURIComponent(state.currentPlatformKey)}&page=${state.platformPage}`;
      if (state.platformType && state.platformType !== 'all') {
        url += `&media_type=${encodeURIComponent(state.platformType)}`;
      }
      if (state.platformSort) {
        url += `&sort_by=${encodeURIComponent(state.platformSort)}`;
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Platform API error: ${res.status}`);
      const data = await res.json();

      state.platformTotalPages = data.total_pages || 1;
      const countFormatted = data.total_results ? data.total_results.toLocaleString() : data.items.length;
      if (el.platformTotalCount) el.platformTotalCount.textContent = `${countFormatted} Titles Available`;

      if (data.display_name && !append && el.platformTitle) {
        el.platformTitle.textContent = data.display_name;
      }

      const rawIncoming = (data.items || []);
      const seen = new Set((append ? state.platformItems : []).map(getCanonicalKey));
      const uniqueIncoming = [];
      for (const item of rawIncoming) {
        if (!item || !item.id) continue;
        const k = getCanonicalKey(item);
        if (k && seen.has(k)) continue;
        if (k) seen.add(k);
        uniqueIncoming.push(item);
      }

      if (append) {
        state.platformItems.push(...uniqueIncoming);
      } else {
        state.platformItems = uniqueIncoming;
        if (el.platformGrid) el.platformGrid.innerHTML = '';
      }

      if (!state.platformItems || state.platformItems.length === 0) {
        if (el.platformGrid) {
          el.platformGrid.innerHTML = '<div style="color:var(--text-muted);padding:40px;text-align:center;width:100%;">No titles found for this filter.</div>';
        }
        if (el.platformLoadMoreBtn) el.platformLoadMoreBtn.classList.add('hidden');
      } else {
        if (!append && el.platformGrid) el.platformGrid.innerHTML = '';
        uniqueIncoming.forEach((item, index) => {
          const card = createMovieCard(item, (append ? state.platformItems.length - uniqueIncoming.length : 0) + index);
          if (el.platformGrid) el.platformGrid.appendChild(card);
        });

        // Show/hide load more button
        if (el.platformLoadMoreBtn) {
          if (state.platformPage < state.platformTotalPages) {
            el.platformLoadMoreBtn.classList.remove('hidden');
            el.platformLoadMoreBtn.disabled = false;
            el.platformLoadMoreBtn.textContent = `Load More Titles (Page ${state.platformPage + 1} of ${state.platformTotalPages})`;
          } else {
            el.platformLoadMoreBtn.classList.add('hidden');
          }
        }
      }
    } catch (err) {
      console.error(err);
      if (!append && el.platformGrid) {
        el.platformGrid.innerHTML = `<div style="color:var(--red);padding:40px;text-align:center;width:100%;">Failed to load platform catalog: ${err.message}</div>`;
      }
      showToast('Error loading platform content');
    } finally {
      state.isPlatformLoading = false;
    }
  }

  // ==========================================================================
  // LIVE SPORTS STREAMING LOGIC
  // ==========================================================================
  function getSportEmoji(sport) {
    if (!sport) return '🏆';
    const s = sport.toLowerCase();
    if (s.includes('soccer') || s.includes('football')) return '⚽';
    if (s.includes('nba') || s.includes('basketball')) return '🏀';
    if (s.includes('nfl') || s.includes('american football')) return '🏈';
    if (s.includes('motorsport') || s.includes('f1') || s.includes('formula')) return '🏎️';
    if (s.includes('combat') || s.includes('ufc') || s.includes('mma') || s.includes('boxing') || s.includes('wwe')) return '🥊';
    if (s.includes('cricket')) return '🏏';
    if (s.includes('tennis')) return '🎾';
    if (s.includes('golf')) return '⛳';
    if (s.includes('hockey') || s.includes('nhl')) return '🏒';
    if (s.includes('baseball') || s.includes('mlb')) return '⚾';
    if (s.includes('darts')) return '🎯';
    if (s.includes('rugby')) return '🏉';
    if (s.includes('cycling')) return '🚴';
    if (s.includes('volleyball')) return '🏐';
    return '🏆';
  }

  function openSportsView() {
    state.currentNav = 'sports';
    el.navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === 'sports');
    });
    switchView('sports');
    if (!state.sportsMatches || state.sportsMatches.length === 0) {
      fetchSportsData(true);
    } else {
      renderSportsMatches();
      renderSportsChannels();
    }
  }

  async function fetchSportsData(showSpinner = false) {
    if (state.isSportsLoading) return;
    state.isSportsLoading = true;
    if (showSpinner && el.sportsMatchesGrid) {
      el.sportsMatchesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div class="spinner" style="width: 36px; height: 36px; border-width: 3px; margin: 0 auto 16px;"></div>
          <div style="font-size: 15px; font-weight: 600; color: #fff;">Connecting to Live Sports Radar...</div>
          <div style="font-size: 13px; margin-top: 6px;">Fetching 900+ real-time fixtures and live channels</div>
        </div>
      `;
    }

    try {
      const res = await fetch(`/api/sports?_t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.sportsMatches = data.matches || [];
      state.sportsChannels = data.channels || [];
      state.sportsCategories = data.categories || [];

      // Update counters
      const liveMatches = state.sportsMatches.filter((m) => m.has_stream || m.status === 'LIVE').length;
      if (el.sportsLiveCount) {
        el.sportsLiveCount.textContent = `${liveMatches || state.sportsMatches.length} Live/Streaming • ${state.sportsChannels.length} Channels`;
      }
      if (el.sportsChannelsCount) {
        el.sportsChannelsCount.textContent = `${state.sportsChannels.length} Networks Live`;
      }

      renderSportsSpotlight();
      renderSportsMatches();
      renderSportsChannels();
    } catch (err) {
      console.error('Sports data fetch error:', err);
      if (el.sportsMatchesGrid && (!state.sportsMatches || state.sportsMatches.length === 0)) {
        el.sportsMatchesGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--red);">
            Failed to load live sports data: ${err.message}.
            <div style="margin-top: 12px;">
              <button class="btn btn-secondary btn-sm" onclick="fetchSportsData(true)">Retry</button>
            </div>
          </div>
        `;
      }
      showToast('Error updating sports fixtures');
    } finally {
      state.isSportsLoading = false;
    }
  }

  function renderSportsSpotlight() {
    if (!el.sportsSpotlightCarousel || !el.sportsSpotlightSection) return;
    el.sportsSpotlightSection.classList.remove('hidden');
    el.sportsSpotlightCarousel.innerHTML = '';

    // 1. Featured Premier 24/7 Live Broadcast Channels (Cricket, Football, F1)
    const featuredNetworks = (state.sportsChannels || []).filter((c) =>
      /cricket|willow|premier league|sky sports football|tnt sports 1|f1/i.test(c.name)
    ).slice(0, 4);

    featuredNetworks.forEach((ch) => {
      const isCricket = /cricket|willow/i.test(ch.name);
      const isFootball = /premier|football/i.test(ch.name);
      const isF1 = /f1/i.test(ch.name);
      const sportName = isCricket ? 'Cricket' : isFootball ? 'Football' : isF1 ? 'Formula 1' : 'Live Sports';
      const emoji = isCricket ? '🏏' : isFootball ? '⚽' : isF1 ? '🏎️' : '📺';

      const card = document.createElement('div');
      card.className = 'sports-spotlight-card featured-network-spotlight';
      card.innerHTML = `
        <div class="spotlight-card-top">
          <span class="spotlight-sport-tag">${emoji} ${sportName}</span>
          <span class="spotlight-live-badge"><span class="live-dot-pulse"></span> LIVE NOW</span>
        </div>
        <div class="spotlight-tournament">${isCricket ? 'International Cricket HD' : isFootball ? 'Premier League / European Football' : 'Formula 1 World Championship'}</div>
        <div class="spotlight-event-name" title="${ch.name}">${ch.name}</div>
        <div style="font-size:12px;color:var(--text-muted);margin:8px 0;line-height:1.4;">24/7 non-stop live match coverage, tournaments, and studio analysis in Full HD.</div>
        <button class="spotlight-watch-btn">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>Watch Live Stream</span>
        </button>
      `;

      card.addEventListener('click', () => {
        openSportsPlayer(ch.name, `🔴 24/7 Live Broadcast • ${sportName}`, [{ name: ch.name, url: ch.url }], 0);
      });

      el.sportsSpotlightCarousel.appendChild(card);
    });

    // 2. Active Match Fixtures with live streams
    const matchesWithStreams = state.sportsMatches.filter((m) => m.has_stream && m.channels && m.channels.length > 0);
    const spotlightMatches = matchesWithStreams.length > 0 ? matchesWithStreams.slice(0, 8) : state.sportsMatches.slice(0, 6);

    spotlightMatches.forEach((match) => {
      const card = document.createElement('div');
      card.className = 'sports-spotlight-card';
      const emoji = getSportEmoji(match.sport);
      const isLive = match.has_stream || match.status === 'LIVE';
      const statusBadge = isLive
        ? `<span class="spotlight-live-badge"><span class="live-dot-pulse"></span> LIVE NOW</span>`
        : `<span class="spotlight-upcoming-badge">⏳ ${match.time || 'Today'}</span>`;

      const homeLogo = match.home_logo || 'https://cdnlivetv.tv/api/v1/team/logo.png';
      const awayLogo = match.away_logo || 'https://cdnlivetv.tv/api/v1/team/logo.png';
      const hasTeams = Boolean(match.home_team && match.away_team);

      card.innerHTML = `
        <div class="spotlight-card-top">
          <span class="spotlight-sport-tag">${emoji} ${match.sport || 'Sports'}</span>
          ${statusBadge}
        </div>
        <div class="spotlight-tournament">${match.tournament || match.country || 'Live Match'}</div>
        <div class="spotlight-event-name" title="${match.event}">${match.event}</div>
        ${
          hasTeams
            ? `
          <div class="spotlight-teams-row">
            <div class="spotlight-team">
              <img src="${homeLogo}" alt="" onerror="this.src='https://cdnlivetv.tv/api/v1/team/logo.png'"/>
              <span>${match.home_team}</span>
            </div>
            <span class="spotlight-vs">VS</span>
            <div class="spotlight-team">
              <img src="${awayLogo}" alt="" onerror="this.src='https://cdnlivetv.tv/api/v1/team/logo.png'"/>
              <span>${match.away_team}</span>
            </div>
          </div>
          `
            : ''
        }
        <button class="spotlight-watch-btn">
          <svg viewBox="0 0 24 24" style="width:14px;height:14px;fill:currentColor;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          <span>${isLive ? 'Watch Live Stream' : 'Tune In'}</span>
        </button>
      `;

      card.addEventListener('click', () => {
        if (match.channels && match.channels.length > 0) {
          openSportsPlayer(match.event, `🔴 LIVE • ${match.tournament || match.sport}`, match.channels, 0);
        } else if (state.sportsChannels && state.sportsChannels.length > 0) {
          const ch = state.sportsChannels[0];
          openSportsPlayer(ch.name, `24/7 Live Broadcast • ${match.event}`, [{ name: ch.name, url: ch.url }], 0);
        } else {
          showToast('Live stream server will connect when match kicks off');
        }
      });

      el.sportsSpotlightCarousel.appendChild(card);
    });
  }

  function renderSportsMatches() {
    if (!el.sportsMatchesGrid) return;
    el.sportsMatchesGrid.innerHTML = '';

    const cat = state.sportsActiveCat;
    const status = state.sportsActiveStatus;
    const query = (state.sportsSearchQuery || '').toLowerCase().trim();

    // Dedicated Live Cricket Hub when user selects Cricket
    if (cat === 'Cricket') {
      const cricketChannels = (state.sportsChannels || []).filter((c) => /cricket|willow/i.test(c.name));
      const hubCard = document.createElement('div');
      hubCard.className = 'cricket-hub-banner';
      hubCard.innerHTML = `
        <div class="cricket-hub-header">
          <div>
            <span class="cricket-badge"><span class="live-dot-pulse"></span> 24/7 LIVE CRICKET BROADCAST HUB</span>
            <h2 class="cricket-hub-title">Stream Every Cricket Match Live in HD</h2>
            <p class="cricket-hub-desc">Watch international Test series, ODIs, T20 World Cups, IPL, BBL, and bilateral tours live across all major cricket broadcast networks with zero subscription.</p>
          </div>
        </div>
        <div class="cricket-hub-cards-grid">
          <div class="cricket-channel-action-card" data-channel="Sky Sports Cricket FHD UK">
            <div class="c-card-top">
              <span class="c-card-badge">LIVE 24/7</span>
              <span class="c-card-sport">🏏 ICC & International</span>
            </div>
            <div class="c-card-title">Sky Sports Cricket HD</div>
            <div class="c-card-sub">International Tests, T20s, The Ashes, County Cricket & Series</div>
            <button class="c-card-watch-btn">🔴 Stream Sky Cricket ›</button>
          </div>

          <div class="cricket-channel-action-card" data-channel="Willow Cricket HD US">
            <div class="c-card-top">
              <span class="c-card-badge">LIVE 24/7</span>
              <span class="c-card-sport">🏏 IPL & Global Leagues</span>
            </div>
            <div class="c-card-title">Willow Cricket HD</div>
            <div class="c-card-sub">Indian Premier League, Asia Cup, Major League Cricket & Tours</div>
            <button class="c-card-watch-btn">🔴 Stream Willow Cricket ›</button>
          </div>

          <div class="cricket-channel-action-card" data-channel="FOX Sports 501 Cricket HD AU">
            <div class="c-card-top">
              <span class="c-card-badge">LIVE 24/7</span>
              <span class="c-card-sport">🏏 Australia & BBL</span>
            </div>
            <div class="c-card-title">Fox Cricket 501 HD</div>
            <div class="c-card-sub">Big Bash League (BBL), Australia Home Internationals & Shield</div>
            <button class="c-card-watch-btn">🔴 Stream Fox Cricket ›</button>
          </div>

          <div class="cricket-channel-action-card" data-channel="ASTRO CRICKET HD">
            <div class="c-card-top">
              <span class="c-card-badge">LIVE 24/7</span>
              <span class="c-card-sport">🏏 World Cricket</span>
            </div>
            <div class="c-card-title">Astro Cricket HD</div>
            <div class="c-card-sub">Global T20 tournaments, ICC Trophy qualifiers & bilateral cups</div>
            <button class="c-card-watch-btn">🔴 Stream Astro Cricket ›</button>
          </div>
        </div>
      `;

      hubCard.querySelectorAll('.cricket-channel-action-card').forEach((card) => {
        card.addEventListener('click', () => {
          const chName = card.dataset.channel;
          const found = cricketChannels.find((c) => c.name === chName) || { name: chName, url: `/api/sports-stream?name=${encodeURIComponent(chName)}` };
          openSportsPlayer(found.name, '🔴 LIVE 24/7 Cricket Network', [found], 0);
        });
      });

      el.sportsMatchesGrid.appendChild(hubCard);
      if (el.sportsMatchesCount) {
        el.sportsMatchesCount.textContent = '4 Cricket Networks Live';
      }
      return;
    }

    let filtered = state.sportsMatches.filter((m) => {
      // Category filter
      if (cat !== 'all') {
        const sp = (m.sport || '').toLowerCase();
        if (cat === 'Soccer' && !sp.includes('soccer') && !sp.includes('football')) return false;
        else if (cat === 'NBA' && !sp.includes('nba') && !sp.includes('basketball') && !sp.includes('ncaa')) return false;
        else if (cat === 'NFL' && !sp.includes('nfl') && !sp.includes('american football')) return false;
        else if (cat === 'Motorsport' && !sp.includes('motor') && !sp.includes('f1') && !sp.includes('formula')) return false;
        else if (cat === 'combat' && !sp.includes('ufc') && !sp.includes('mma') && !sp.includes('boxing') && !sp.includes('wwe')) return false;
        else if (cat === 'Tennis' && !sp.includes('tennis')) return false;
        else if (cat === 'Golf' && !sp.includes('golf')) return false;
        else if (cat === 'channels') return false;
        else if (cat !== 'Soccer' && cat !== 'NBA' && cat !== 'NFL' && cat !== 'Motorsport' && cat !== 'combat' && cat !== 'Tennis' && cat !== 'Golf') {
          if (!sp.includes(cat.toLowerCase())) return false;
        }
      }

      // Status filter
      if (status === 'live') {
        if (!m.has_stream && m.status !== 'LIVE') return false;
      } else if (status === 'upcoming') {
        if (m.status === 'LIVE') return false;
      }

      // Search query filter
      if (query) {
        const text = `${m.event || ''} ${m.home_team || ''} ${m.away_team || ''} ${m.tournament || ''} ${m.sport || ''} ${m.country || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }

      return true;
    });

    // Sort matches with active streams to the front
    filtered.sort((a, b) => {
      const aStreams = a.channels && a.channels.length > 0 ? 1 : 0;
      const bStreams = b.channels && b.channels.length > 0 ? 1 : 0;
      if (bStreams !== aStreams) return bStreams - aStreams;
      return (a.time || '').localeCompare(b.time || '');
    });

    if (el.sportsMatchesCount) {
      el.sportsMatchesCount.textContent = `${filtered.length} Fixtures`;
    }

    if (filtered.length === 0) {
      el.sportsMatchesGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 12px;">🏟️</div>
          <div style="font-size: 16px; font-weight: 600; color: #fff;">No fixtures matching your filter</div>
          <div style="font-size: 13px; margin-top: 6px;">Try switching to "All Sports" or tuning into 24/7 TV channels below.</div>
        </div>
      `;
      return;
    }

    // Limit rendered matches for optimal DOM performance
    const renderLimit = 120;
    const toRender = filtered.slice(0, renderLimit);

    toRender.forEach((m) => {
      const card = document.createElement('div');
      card.className = 'sports-match-card';
      const emoji = getSportEmoji(m.sport);
      const isLive = m.has_stream || m.status === 'LIVE';
      const hasTeams = Boolean(m.home_team && m.away_team);

      const flagHtml = m.country_flag
        ? `<img src="${m.country_flag}" class="match-country-flag" alt="" onerror="this.style.display='none'"/>`
        : '';

      const serverCount = m.channels ? m.channels.length : 0;

      card.innerHTML = `
        <div class="match-card-header">
          <div class="match-tournament-info">
            ${flagHtml}
            <span class="match-sport-badge">${emoji} ${m.sport || 'Sport'}</span>
            <span class="match-tournament-name" title="${m.tournament || m.country}">${m.tournament || m.country || ''}</span>
          </div>
          <span class="match-status-badge ${isLive ? 'status-live' : 'status-upcoming'}">
            ${isLive ? '<span class="live-dot-pulse"></span> LIVE' : `⏳ ${m.time || 'Upcoming'}`}
          </span>
        </div>

        <div class="match-card-body">
          ${
            hasTeams
              ? `
            <div class="match-teams-layout">
              <div class="match-team match-home-team">
                <img src="${m.home_logo || 'https://cdnlivetv.tv/api/v1/team/logo.png'}" class="match-team-logo" alt="${m.home_team}" onerror="this.src='https://cdnlivetv.tv/api/v1/team/logo.png'"/>
                <span class="match-team-name">${m.home_team}</span>
              </div>
              <div class="match-vs-divider">
                <span class="match-vs-text">VS</span>
                <span class="match-time-text">${m.time || ''}</span>
              </div>
              <div class="match-team match-away-team">
                <img src="${m.away_logo || 'https://cdnlivetv.tv/api/v1/team/logo.png'}" class="match-team-logo" alt="${m.away_team}" onerror="this.src='https://cdnlivetv.tv/api/v1/team/logo.png'"/>
                <span class="match-team-name">${m.away_team}</span>
              </div>
            </div>
            `
              : `
            <div class="match-single-event">
              <div class="match-single-title">${m.event}</div>
              <div class="match-single-meta">${m.start || m.time || ''} • ${m.country || m.tournament || ''}</div>
            </div>
            `
          }
        </div>

        <div class="match-card-footer">
          <div class="match-servers-list">
            ${
              serverCount > 0
                ? m.channels
                    .slice(0, 3)
                    .map((ch, idx) => `<button class="server-stream-btn" data-sidx="${idx}">⚡ Server ${idx + 1}</button>`)
                    .join('')
                : `<span style="font-size:11px;color:var(--text-muted);">Broadcast feed ready</span>`
            }
          </div>
          <button class="match-play-btn">
            <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <span>${serverCount > 0 ? `Watch (${serverCount})` : 'Watch Live'}</span>
          </button>
        </div>
      `;

      // Click on Server stream button
      card.querySelectorAll('.server-stream-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const sidx = parseInt(btn.dataset.sidx || '0', 10);
          if (m.channels && m.channels[sidx]) {
            openSportsPlayer(m.event, `🔴 LIVE • ${m.tournament || m.sport}`, m.channels, sidx);
          }
        });
      });

      // Click on Card or Watch button
      card.addEventListener('click', () => {
        if (m.channels && m.channels.length > 0) {
          openSportsPlayer(m.event, `🔴 LIVE • ${m.tournament || m.sport}`, m.channels, 0);
        } else if (state.sportsChannels && state.sportsChannels.length > 0) {
          const ch = state.sportsChannels[0];
          openSportsPlayer(ch.name, `24/7 Live Sports Broadcast • ${m.event}`, [{ name: ch.name, url: ch.url }], 0);
        } else {
          showToast('Stream will go live when match starts');
        }
      });

      el.sportsMatchesGrid.appendChild(card);
    });
  }

  function renderSportsChannels() {
    if (!el.sportsChannelsGrid) return;
    el.sportsChannelsGrid.innerHTML = '';

    if (!state.sportsChannels || state.sportsChannels.length === 0) {
      el.sportsChannelsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: var(--text-muted);">
          Loading 24/7 live sports channels...
        </div>
      `;
      return;
    }

    const cat = state.sportsActiveCat;
    let list = state.sportsChannels;
    if (cat === 'Cricket') {
      list = state.sportsChannels.filter((c) => /cricket|willow/i.test(c.name));
    } else if (cat === 'Soccer') {
      list = state.sportsChannels.filter((c) => /football|soccer|premier|bundesliga|golazo|laliga|serie|bein|tnt/i.test(c.name));
    } else if (cat === 'Motorsport') {
      list = state.sportsChannels.filter((c) => /motor|f1|formula|racing/i.test(c.name));
    } else if (cat === 'combat') {
      list = state.sportsChannels.filter((c) => /action|arena|wwe|ufc|boxing|fight/i.test(c.name));
    } else if (cat === 'Tennis') {
      list = state.sportsChannels.filter((c) => /tennis/i.test(c.name));
    } else if (cat === 'Golf') {
      list = state.sportsChannels.filter((c) => /golf/i.test(c.name));
    } else if (cat === 'NBA') {
      list = state.sportsChannels.filter((c) => /nba|basketball|espn/i.test(c.name));
    }

    if (list.length === 0) {
      list = state.sportsChannels;
    }

    list.forEach((ch) => {
      const card = document.createElement('div');
      card.className = 'sports-channel-card';
      const isCricket = /cricket|willow/i.test(ch.name);
      const isFoot = /football|soccer|premier|bundesliga/i.test(ch.name);
      const icon = isCricket ? '🏏' : isFoot ? '⚽' : '📺';

      card.innerHTML = `
        <div class="channel-info-left">
          <div class="channel-icon-badge">${icon}</div>
          <div style="min-width:0;">
            <div class="channel-title-text" title="${ch.name}">${ch.name}</div>
            <div class="channel-status-sub">
              <span class="live-dot-pulse" style="width:6px;height:6px;"></span> 24/7 HD Live
            </div>
          </div>
        </div>
        <button class="channel-tune-btn">Tune In ›</button>
      `;

      card.addEventListener('click', () => {
        openSportsPlayer(ch.name, '24/7 Live Sports Network', [{ name: ch.name, url: ch.url }], 0);
      });

      el.sportsChannelsGrid.appendChild(card);
    });
  }

  function openSportsPlayer(title, subtitle, channels, initialIndex = 0) {
    if (!channels || channels.length === 0) {
      showToast('No active stream feeds available');
      return;
    }

    // Stop native video player if running
    el.videoElement.pause();
    el.videoElement.src = '';
    el.videoElement.classList.add('hidden');
    if (el.playerControls) el.playerControls.classList.add('hidden');
    el.playerSpinner.classList.add('hidden');

    state.isEmbedMode = true;
    el.playerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    el.playerMediaTitle.textContent = title;
    el.playerMediaSubtitle.textContent = subtitle;
    el.nextEpisodeControlBtn.classList.add('hidden');

    const activeChannel = channels[initialIndex] || channels[0];
    let streamUrl = activeChannel.url || '';
    if (!streamUrl.startsWith('/api/sports-stream')) {
      streamUrl = `/api/sports-stream?name=${encodeURIComponent(activeChannel.name || title)}`;
    }

    if (el.embedPlayerIframe) {
      el.embedPlayerIframe.removeAttribute('sandbox');
      el.embedPlayerIframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      el.embedPlayerIframe.src = streamUrl;
      el.embedPlayerIframe.classList.remove('hidden');
    }
    if (el.currentServerLabel) {
      el.currentServerLabel.textContent = activeChannel.name || `Server ${initialIndex + 1}`;
    }

    // Populate Server switcher
    if (el.serverMenu) {
      el.serverMenu.innerHTML = '';
      const header = document.createElement('div');
      header.style.cssText = 'padding:6px 10px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;';
      header.textContent = `Live Broadcast Servers (${channels.length})`;
      el.serverMenu.appendChild(header);

      channels.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = `menu-item ${idx === initialIndex ? 'active' : ''}`;
        btn.innerHTML = `🔴 <span>${c.name || 'Server ' + (idx + 1)}</span>`;
        btn.addEventListener('click', () => {
          openSportsPlayer(title, subtitle, channels, idx);
          el.serverMenu.classList.add('hidden');
        });
        el.serverMenu.appendChild(btn);
      });
    }

    showToast(`Streaming ${title}`);
  }

  async function navigate(target) {
    state.currentNav = target;
    el.navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === target);
    });
    document.querySelectorAll('.mobile-nav-item[data-nav]').forEach((item) => {
      item.classList.toggle('active', item.dataset.nav === target);
    });

    if (target === 'home') {
      switchView('rails');
    } else if (target === 'sports') {
      openSportsView();
    } else if (target === 'movies') {
      loadCategoryGrid('Popular Movies', '1');
    } else if (target === 'series') {
      loadCategoryGrid('TV Series', '3');
    } else if (target === 'trending') {
      loadCategoryGrid('Trending Titles', '2');
    } else if (target === 'mylist') {
      renderFavoritesView();
    } else if (target === 'history') {
      renderHistoryView();
    }
  }

  async function loadCategoryGrid(title, tabId) {
    switchView('grid');
    el.gridTitle.textContent = title;
    el.gridSubtitle.textContent = 'Loading titles...';
    el.mediaGrid.innerHTML = '<div style="color:var(--text-muted);padding:40px;">Loading catalog...</div>';

    try {
      const res = await fetch(`/api/homepage?tab=${tabId}&page=1`);
      if (!res.ok) throw new Error('Failed to load category');
      const data = await res.json();
      state.gridItems = data.items;
      renderGridItems(data.items);
      el.gridSubtitle.textContent = `Showing ${data.items.length} titles`;
    } catch (err) {
      console.error(err);
      el.gridSubtitle.textContent = 'Error loading titles';
    }
  }

  function renderGridItems(items) {
    el.mediaGrid.innerHTML = '';
    const seen = new Set();
    const filtered = (items || []).filter((item) => {
      if (!item || !item.id) return false;
      const k = getCanonicalKey(item);
      if (k && seen.has(k)) return false;
      if (k) seen.add(k);
      if (state.activeFilter === 'movie') return item.media_type === 'movie';
      if (state.activeFilter === 'series') return item.media_type === 'series';
      return true;
    });

    if (filtered.length === 0) {
      el.mediaGrid.innerHTML = '<p style="color:var(--text-muted);padding:40px;">No matching titles found.</p>';
      return;
    }

    filtered.forEach((item, index) => {
      const card = createMovieCard(item, index);
      el.mediaGrid.appendChild(card);
    });
  }

  function renderFavoritesView() {
    switchView('grid');
    el.gridTitle.textContent = 'My List';
    el.gridSubtitle.textContent = `${state.favorites.length} saved titles`;
    state.gridItems = state.favorites;
    renderGridItems(state.favorites);
  }

  function renderHistoryView() {
    switchView('grid');
    el.gridTitle.textContent = 'Watch History';
    el.gridSubtitle.textContent = `${state.history.length} watched titles`;
    state.gridItems = state.history;
    renderGridItems(state.history);
  }

  // ==========================================================================
  // EVENT LISTENERS
  // ==========================================================================
  function setupEventListeners() {
    // Window Scroll Navbar Style
    window.addEventListener('scroll', () => {
      el.navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Logo Click
    el.logoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      navigate('home');
    });

    // Nav Links Click
    el.navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(link.dataset.nav);
      });
    });

    // Mobile Bottom Nav items click
    document.querySelectorAll('.mobile-nav-item[data-nav]').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(item.dataset.nav);
        closeMobilePlatformsSheet();
      });
    });

    // Mobile Platforms Sheet Open/Close
    const mobilePlatformsBtn = document.getElementById('mobilePlatformsBtn');
    const mobilePlatformsSheet = document.getElementById('mobilePlatformsSheet');
    const mobileSheetBackdrop = document.getElementById('mobileSheetBackdrop');
    const mobileSheetCloseBtn = document.getElementById('mobileSheetCloseBtn');

    function openMobilePlatformsSheet() {
      if (mobilePlatformsSheet) mobilePlatformsSheet.classList.remove('hidden');
    }
    function closeMobilePlatformsSheet() {
      if (mobilePlatformsSheet) mobilePlatformsSheet.classList.add('hidden');
    }

    if (mobilePlatformsBtn) {
      mobilePlatformsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openMobilePlatformsSheet();
      });
    }
    if (mobileSheetBackdrop) mobileSheetBackdrop.addEventListener('click', closeMobilePlatformsSheet);
    if (mobileSheetCloseBtn) mobileSheetCloseBtn.addEventListener('click', closeMobilePlatformsSheet);

    document.querySelectorAll('.mobile-plat-btn[data-ott]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ott = btn.dataset.ott;
        closeMobilePlatformsSheet();
        openPlatformView(ott, btn.textContent.trim());
      });
    });

    // Hero Slider Arrows
    if (el.heroPrevBtn) el.heroPrevBtn.addEventListener('click', () => { prevHeroSlide(); resetHeroAutoRotate(); });
    if (el.heroNextBtn) el.heroNextBtn.addEventListener('click', () => { nextHeroSlide(); resetHeroAutoRotate(); });

    // OTT Platform Dropdown Items
    document.querySelectorAll('.dropdown-item[data-ott]').forEach((item) => {
      item.addEventListener('click', () => {
        const ott = item.dataset.ott;
        openPlatformView(ott, item.textContent.trim());
      });
    });

    // OTT Brand Cards on Home
    document.querySelectorAll('.ott-card[data-ott]').forEach((card) => {
      card.addEventListener('click', () => {
        const ott = card.dataset.ott;
        openPlatformView(ott, card.dataset.title, card.dataset.color);
      });
    });

    // Studio & Universe Chips
    document.querySelectorAll('.universe-chip[data-ott]').forEach((chip) => {
      chip.addEventListener('click', () => {
        const ott = chip.dataset.ott;
        openPlatformView(ott, chip.dataset.title);
      });
    });

    // Platform Preview Rail Links (e.g. "View All Netflix (2,270+) ›")
    document.querySelectorAll('.platform-link-btn[data-ott]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ott = btn.dataset.ott;
        openPlatformView(ott, btn.dataset.title);
      });
    });

    // Platform View Controls
    if (el.platformBackBtn) {
      el.platformBackBtn.addEventListener('click', () => {
        navigate('home');
      });
    }

    if (el.platformTypeFilters) {
      el.platformTypeFilters.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          el.platformTypeFilters.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          state.platformType = chip.dataset.type;
          state.platformPage = 1;
          fetchPlatformData(false);
        });
      });
    }

    if (el.platformSortSelect) {
      el.platformSortSelect.addEventListener('change', () => {
        state.platformSort = el.platformSortSelect.value;
        state.platformPage = 1;
        fetchPlatformData(false);
      });
    }

    if (el.platformLoadMoreBtn) {
      el.platformLoadMoreBtn.addEventListener('click', () => {
        if (state.platformPage < state.platformTotalPages) {
          state.platformPage++;
          fetchPlatformData(true);
        }
      });
    }

    // Live Sports View Controls & Event Handlers
    if (el.sportsBackBtn) {
      el.sportsBackBtn.addEventListener('click', () => {
        navigate('home');
      });
    }

    if (el.homeViewAllSportsBtn) {
      el.homeViewAllSportsBtn.addEventListener('click', () => {
        openSportsView();
      });
    }

    if (el.sportsRefreshBtn) {
      el.sportsRefreshBtn.addEventListener('click', () => {
        fetchSportsData(true);
      });
    }

    if (el.sportsSearchInput) {
      el.sportsSearchInput.addEventListener('input', (e) => {
        state.sportsSearchQuery = e.target.value;
        renderSportsMatches();
      });
    }

    if (el.sportsCategoryFilters) {
      el.sportsCategoryFilters.querySelectorAll('.sports-cat-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          el.sportsCategoryFilters.querySelectorAll('.sports-cat-btn').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          state.sportsActiveCat = btn.dataset.cat || 'all';
          if (state.sportsActiveCat === 'channels' && el.sportsChannelsGrid) {
            el.sportsChannelsGrid.scrollIntoView({ behavior: 'smooth' });
          } else {
            renderSportsMatches();
          }
        });
      });
    }

    if (el.sportsStatusTabs) {
      el.sportsStatusTabs.querySelectorAll('.sports-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          el.sportsStatusTabs.querySelectorAll('.sports-tab').forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          state.sportsActiveStatus = tab.dataset.status || 'all';
          renderSportsMatches();
        });
      });
    }

    // Search Input Events
    el.searchInput.addEventListener('input', handleSearchInput);
    el.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        el.suggestionsPopover.classList.add('hidden');
        executeSearch(el.searchInput.value);
      }
    });

    el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      el.clearSearchBtn.classList.add('hidden');
      el.suggestionsPopover.classList.add('hidden');
    });

    // Click outside search popover
    document.addEventListener('click', (e) => {
      if (!el.searchWrapper.contains(e.target)) {
        el.suggestionsPopover.classList.add('hidden');
      }
      if (el.serverMenuBtn && el.serverMenu && !el.serverMenuBtn.contains(e.target) && !el.serverMenu.contains(e.target)) {
        el.serverMenu.classList.add('hidden');
      }
      if (!el.qualityMenuBtn.contains(e.target) && !el.qualityMenu.contains(e.target)) {
        el.qualityMenu.classList.add('hidden');
      }
      if (!el.subtitlesMenuBtn.contains(e.target) && !el.subtitlesMenu.contains(e.target)) {
        el.subtitlesMenu.classList.add('hidden');
      }
      if (!el.speedMenuBtn.contains(e.target) && !el.speedMenu.contains(e.target)) {
        el.speedMenu.classList.add('hidden');
      }
    });

    // Hero Quick Search
    el.heroSearchSubmitBtn.addEventListener('click', () => {
      const q = el.heroSearchInput.value.trim();
      if (q) executeSearch(q);
    });
    el.heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = el.heroSearchInput.value.trim();
        if (q) executeSearch(q);
      }
    });

    // Hero Tag Chips
    el.quickTags.querySelectorAll('.tag-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.search;
        executeSearch(q);
      });
    });

    // Hero Action Buttons
    el.heroPlayBtn.addEventListener('click', () => {
      if (state.heroItem) openPlayerDirect(state.heroItem);
    });

    el.heroDetailsBtn.addEventListener('click', () => {
      if (state.heroItem) openDetailsModal(state.heroItem.id.value, state.heroItem.id.provider, state.heroItem.title);
    });

    el.heroFavBtn.addEventListener('click', () => {
      if (!state.heroItem) return;
      toggleFavorite(state.heroItem);
      updateHeroFavBtn();
    });

    // Rail Carousels Horizontal Scrolling
    document.querySelectorAll('.rail-nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const target = document.getElementById(targetId);
        if (!target) return;
        const offset = btn.classList.contains('rail-prev') ? -550 : 550;
        target.scrollBy({ left: offset, behavior: 'smooth' });
      });
    });

    // Rail View All Buttons
    document.querySelectorAll('.rail-view-all-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        const names = { '1': 'Popular Movies', '2': 'Trending Now', '3': 'TV Series' };
        loadCategoryGrid(names[tab] || 'Catalog', tab);
      });
    });

    el.clearHistoryBtn.addEventListener('click', () => {
      state.history = [];
      localStorage.removeItem('netmirror_history');
      renderContinueWatching();
      showToast('Watch history cleared');
    });

    // Grid Filters (All, Movies, TV Shows)
    el.gridFilters.querySelectorAll('.filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        el.gridFilters.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        state.activeFilter = chip.dataset.filter;
        renderGridItems(state.gridItems);
      });
    });

    // Modal Close
    el.modalCloseBtn.addEventListener('click', closeDetailsModal);
    el.detailsModal.addEventListener('click', (e) => {
      if (e.target === el.detailsModal) closeDetailsModal();
    });

    el.modalFavBtn.addEventListener('click', () => {
      if (!state.currentDetails) return;
      toggleFavorite(state.currentDetails);
      const isFav = state.favorites.some((f) => f.id.value === state.currentDetails.id.value);
      el.modalFavBtn.classList.toggle('fav-active', isFav);
      el.modalFavBtn.textContent = isFav ? '✓ In My List' : 'Add to List';
    });

    // Shortcuts Modal
    el.shortcutsBtn.addEventListener('click', () => {
      el.shortcutsModal.classList.remove('hidden');
    });
    el.shortcutsCloseBtn.addEventListener('click', () => {
      el.shortcutsModal.classList.add('hidden');
    });
    el.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === el.shortcutsModal) el.shortcutsModal.classList.add('hidden');
    });

    // ========================================================================
    // VIDEO PLAYER CONTROLS & EVENTS
    // ========================================================================
    const video = el.videoElement;

    el.playerBackBtn.addEventListener('click', closePlayer);

    // Play / Pause
    el.playPauseBtn.addEventListener('click', togglePlayPause);
    video.addEventListener('click', togglePlayPause);

    video.addEventListener('play', () => {
      el.playIcon.classList.add('hidden');
      el.pauseIcon.classList.remove('hidden');
      showCenterSplash('play');
    });

    video.addEventListener('pause', () => {
      el.playIcon.classList.remove('hidden');
      el.pauseIcon.classList.add('hidden');
      showCenterSplash('pause');
    });

    // Time Update & Scrubber
    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        el.progressPlayed.style.width = `${percent}%`;
        el.progressHandle.style.left = `${percent}%`;
        el.currentTime.textContent = formatTime(video.currentTime);
      }
    });

    video.addEventListener('durationchange', () => {
      el.durationTime.textContent = formatTime(video.duration);
    });

    video.addEventListener('progress', () => {
      if (video.buffered.length > 0 && video.duration) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = (bufferedEnd / video.duration) * 100;
        el.progressBuffer.style.width = `${percent}%`;
      }
    });

    // Scrubber click & drag
    let isDraggingScrubber = false;

    function handleScrubberSeek(e) {
      const rect = el.progressBarContainer.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      if (video.duration) {
        video.currentTime = pos * video.duration;
      }
    }

    el.progressBarContainer.addEventListener('mousedown', (e) => {
      isDraggingScrubber = true;
      handleScrubberSeek(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingScrubber) handleScrubberSeek(e);
      // Scrubber hover time
      if (!el.playerOverlay.classList.contains('hidden') && video.duration) {
        const rect = el.progressBarContainer.getBoundingClientRect();
        if (e.clientY >= rect.top - 20 && e.clientY <= rect.bottom + 20) {
          const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
          el.progressHoverTime.style.display = 'block';
          el.progressHoverTime.style.left = `${pos * 100}%`;
          el.progressHoverTime.textContent = formatTime(pos * video.duration);
        } else {
          el.progressHoverTime.style.display = 'none';
        }
      }
    });

    window.addEventListener('mouseup', () => {
      isDraggingScrubber = false;
    });

    // Rewind / Forward
    el.rewindBtn.addEventListener('click', () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
      showToast('-10s');
    });

    el.forwardBtn.addEventListener('click', () => {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      showToast('+10s');
    });

    // Volume & Mute
    el.volumeSlider.addEventListener('input', (e) => {
      video.volume = parseFloat(e.target.value);
      video.muted = video.volume === 0;
      updateVolumeIcons();
    });

    el.volumeBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      updateVolumeIcons();
    });

    function updateVolumeIcons() {
      if (video.muted || video.volume === 0) {
        el.volumeHighIcon.classList.add('hidden');
        el.volumeMutedIcon.classList.remove('hidden');
      } else {
        el.volumeHighIcon.classList.remove('hidden');
        el.volumeMutedIcon.classList.add('hidden');
      }
    }

    // Menus Toggle (Server, Quality, Speed, Subtitles)
    if (el.serverMenuBtn && el.serverMenu) {
      el.serverMenuBtn.addEventListener('click', () => {
        el.serverMenu.classList.toggle('hidden');
        el.qualityMenu.classList.add('hidden');
        el.subtitlesMenu.classList.add('hidden');
        el.speedMenu.classList.add('hidden');
      });
    }

    el.qualityMenuBtn.addEventListener('click', () => {
      el.qualityMenu.classList.toggle('hidden');
      if (el.serverMenu) el.serverMenu.classList.add('hidden');
      el.subtitlesMenu.classList.add('hidden');
      el.speedMenu.classList.add('hidden');
    });

    el.subtitlesMenuBtn.addEventListener('click', () => {
      el.subtitlesMenu.classList.toggle('hidden');
      if (el.serverMenu) el.serverMenu.classList.add('hidden');
      el.qualityMenu.classList.add('hidden');
      el.speedMenu.classList.add('hidden');
    });

    el.speedMenuBtn.addEventListener('click', () => {
      el.speedMenu.classList.toggle('hidden');
      if (el.serverMenu) el.serverMenu.classList.add('hidden');
      el.qualityMenu.classList.add('hidden');
      el.subtitlesMenu.classList.add('hidden');
    });

    // Speed options
    el.speedMenu.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', () => {
        const speed = parseFloat(item.dataset.speed);
        video.playbackRate = speed;
        el.currentSpeedLabel.textContent = `${speed}x`;
        el.speedMenu.querySelectorAll('.menu-item').forEach((b) => b.classList.remove('active'));
        item.classList.add('active');
        el.speedMenu.classList.add('hidden');
        showToast(`Speed: ${speed}x`);
      });
    });

    // Picture-in-Picture
    el.pipBtn.addEventListener('click', async () => {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    });

    // Fullscreen
    el.fullscreenBtn.addEventListener('click', toggleFullscreen);

    // Next episode button in player header/control
    el.nextEpisodeControlBtn.addEventListener('click', playNextEpisode);
    el.playNextNowBtn.addEventListener('click', () => {
      clearInterval(state.nextEpCountdownInterval);
      el.nextEpPrompt.classList.add('hidden');
      playNextEpisode();
    });
    el.cancelNextBtn.addEventListener('click', () => {
      clearInterval(state.nextEpCountdownInterval);
      el.nextEpPrompt.classList.add('hidden');
    });

    // Auto-hide controls on mouse idle
    el.playerContainer.addEventListener('mousemove', resetControlsTimeout);
    el.playerContainer.addEventListener('click', resetControlsTimeout);

    // Keyboard Shortcuts
    window.addEventListener('keydown', handleGlobalKeydown);
  }

  function togglePlayPause() {
    const video = el.videoElement;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  function showCenterSplash(type) {
    el.playerCenterIcon.classList.remove('hidden');
    if (type === 'play') {
      el.playerCenterIcon.innerHTML = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
    } else {
      el.playerCenterIcon.innerHTML = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
    }
    setTimeout(() => {
      el.playerCenterIcon.classList.add('hidden');
    }, 500);
  }

  function resetControlsTimeout() {
    el.playerHeader.classList.remove('controls-hidden');
    if (!state.isEmbedMode && el.playerControls) {
      el.playerControls.classList.remove('controls-hidden');
    }
    clearTimeout(state.controlsTimeout);

    state.controlsTimeout = setTimeout(() => {
      const video = el.videoElement;
      if (state.isEmbedMode || !video.paused) {
        if (!state.isEmbedMode && el.playerControls) {
          el.playerControls.classList.add('controls-hidden');
        }
        el.playerHeader.classList.add('controls-hidden');
        el.qualityMenu.classList.add('hidden');
        el.subtitlesMenu.classList.add('hidden');
        el.speedMenu.classList.add('hidden');
        if (el.serverMenu) el.serverMenu.classList.add('hidden');
      }
    }, 2800);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      el.playerOverlay.requestFullscreen().catch(() => {});
      el.fullscreenOpenIcon.classList.add('hidden');
      el.fullscreenExitIcon.classList.remove('hidden');
    } else {
      document.exitFullscreen().catch(() => {});
      el.fullscreenOpenIcon.classList.remove('hidden');
      el.fullscreenExitIcon.classList.add('hidden');
    }
  }

  function toggleFavorite(item) {
    const idx = state.favorites.findIndex((f) => f.id.value === item.id.value);
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      showToast(`Removed "${item.title}" from My List`);
    } else {
      state.favorites.push(item);
      showToast(`Added "${item.title}" to My List`);
    }
    localStorage.setItem('netmirror_favorites', JSON.stringify(state.favorites));
  }

  function handleGlobalKeydown(e) {
    // Ignore if input is focused
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    // Global "/" focuses search
    if (e.key === '/') {
      e.preventDefault();
      el.searchInput.focus();
      return;
    }

    // Escape closes modals/player
    if (e.key === 'Escape') {
      if (!el.shortcutsModal.classList.contains('hidden')) {
        el.shortcutsModal.classList.add('hidden');
        return;
      }
      if (!el.playerOverlay.classList.contains('hidden')) {
        closePlayer();
        return;
      }
      if (!el.detailsModal.classList.contains('hidden')) {
        closeDetailsModal();
        return;
      }
    }

    // Shortcuts only when player is active
    if (!el.playerOverlay.classList.contains('hidden')) {
      const video = el.videoElement;

      if (e.key === ' ' || e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        video.muted = !video.muted;
        el.volumeBtn.click();
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'j') {
        e.preventDefault();
        el.rewindBtn.click();
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'l') {
        e.preventDefault();
        el.forwardBtn.click();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        el.volumeSlider.value = video.volume;
        showToast(`Volume: ${Math.round(video.volume * 100)}%`);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        el.volumeSlider.value = video.volume;
        showToast(`Volume: ${Math.round(video.volume * 100)}%`);
      }
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

