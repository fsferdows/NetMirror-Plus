/**
 * NetMirror / MovieBox Web - Client Application
 * Premium Cinema UI/UX & Native In-Browser Video Player
 */

(function () {
  'use strict';

  // Safe Storage Helper to prevent fatal syntax crashes on malformed/corrupted localStorage
  function safeGetStorageJson(key, defaultVal) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return defaultVal;
      const raw = localStorage.getItem(key);
      if (!raw || raw === 'undefined' || raw === 'null') return defaultVal;
      const parsed = JSON.parse(raw);
      return Array.isArray(defaultVal) ? (Array.isArray(parsed) ? parsed : defaultVal) : (parsed || defaultVal);
    } catch (_) {
      return defaultVal;
    }
  }

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
    userLockedEmbedServer: false,
    currentEmbedIndex: 0,
    currentEmbedServerName: '',
    playbackRequestSeq: 0,
    embedLoadSeq: 0,
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
    history: safeGetStorageJson('netmirror_history', []),
    favorites: safeGetStorageJson('netmirror_favorites', []),
    audioProfile: (typeof localStorage !== 'undefined' && localStorage.getItem('moviebox_audio_profile')) || 'cinema',
    audioBoost: parseFloat((typeof localStorage !== 'undefined' && localStorage.getItem('moviebox_audio_boost')) || '1.5'),
    audioLimiter: (typeof localStorage !== 'undefined' && localStorage.getItem('moviebox_audio_limiter')) !== 'false',
    audioVoiceEq: (typeof localStorage !== 'undefined' && localStorage.getItem('moviebox_audio_voice_eq')) !== 'false',
    isVip: (typeof localStorage !== 'undefined' && localStorage.getItem('netmirror_is_vip')) === 'true',
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
    languagesDropdownBtn: document.getElementById('languagesDropdownBtn'),
    languagesDropdownMenu: document.getElementById('languagesDropdownMenu'),
    userHeaderAdBanner: document.getElementById('userHeaderAdBanner'),
    userMidRailAdBanner: document.getElementById('userMidRailAdBanner'),
    userDetailsAdBanner: document.getElementById('userDetailsAdBanner'),
    userPlayerEpisodesAdBanner: document.getElementById('userPlayerEpisodesAdBanner'),
    userFooterAdBanner: document.getElementById('userFooterAdBanner'),
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
    sportsSearchClearBtn: document.getElementById('sportsSearchClearBtn'),
    sportsSearchSubmitBtn: document.getElementById('sportsSearchSubmitBtn'),
    sportsQuickTags: document.getElementById('sportsQuickTags'),
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

    // Carousels & Rails
    homeCategoryBar: document.getElementById('homeCategoryBar'),
    trendingRailSection: document.getElementById('trendingRailSection'),
    englishRailSection: document.getElementById('englishRailSection'),
    hindiRailSection: document.getElementById('hindiRailSection'),
    kannadaRailSection: document.getElementById('kannadaRailSection'),
    netflixRailSection: document.getElementById('netflixRailSection'),
    primeRailSection: document.getElementById('primeRailSection'),
    disneyRailSection: document.getElementById('disneyRailSection'),
    moviesRailSection: document.getElementById('moviesRailSection'),
    seriesRailSection: document.getElementById('seriesRailSection'),
    actionRailSection: document.getElementById('actionRailSection'),
    scifiRailSection: document.getElementById('scifiRailSection'),
    horrorRailSection: document.getElementById('horrorRailSection'),
    animeRailSection: document.getElementById('animeRailSection'),
    kdramaRailSection: document.getElementById('kdramaRailSection'),
    comedyRailSection: document.getElementById('comedyRailSection'),
    topRatedRailSection: document.getElementById('topRatedRailSection'),
    continueWatchingSection: document.getElementById('continueWatchingSection'),
    continueWatchingList: document.getElementById('continueWatchingList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    trendingCarousel: document.getElementById('trendingCarousel'),
    englishCarousel: document.getElementById('englishCarousel'),
    hindiCarousel: document.getElementById('hindiCarousel'),
    kannadaCarousel: document.getElementById('kannadaCarousel'),
    netflixCarousel: document.getElementById('netflixCarousel'),
    primeCarousel: document.getElementById('primeCarousel'),
    disneyCarousel: document.getElementById('disneyCarousel'),
    moviesCarousel: document.getElementById('moviesCarousel'),
    seriesCarousel: document.getElementById('seriesCarousel'),
    actionCarousel: document.getElementById('actionCarousel'),
    scifiCarousel: document.getElementById('scifiCarousel'),
    horrorCarousel: document.getElementById('horrorCarousel'),
    animeCarousel: document.getElementById('animeCarousel'),
    kdramaCarousel: document.getElementById('kdramaCarousel'),
    comedyCarousel: document.getElementById('comedyCarousel'),
    topRatedCarousel: document.getElementById('topRatedCarousel'),

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
    modalCircleRating: document.getElementById('modalCircleRating'),
    modalNetmirrorPlayBtn: document.getElementById('modalNetmirrorPlayBtn'),
    modalPlayBtn: document.getElementById('modalPlayBtn'),
    modalFavBtn: document.getElementById('modalFavBtn'),
    modalShareBtn: document.getElementById('modalShareBtn'),
    modalShareBtnText: document.getElementById('modalShareBtnText'),
    playerShareBtn: document.getElementById('playerShareBtn'),
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
    volumePercentBadge: document.getElementById('volumePercentBadge'),
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
    audioEnhancerWrapper: document.getElementById('audioEnhancerWrapper'),
    audioEnhancerBtn: document.getElementById('audioEnhancerBtn'),
    audioEnhanceBadge: document.getElementById('audioEnhanceBadge'),
    audioEnhancerMenu: document.getElementById('audioEnhancerMenu'),
    boostLevelLabel: document.getElementById('boostLevelLabel'),
    boostRangeSlider: document.getElementById('boostRangeSlider'),
    enhancerPresetsList: document.getElementById('enhancerPresetsList'),
    enhancerLimiterToggle: document.getElementById('enhancerLimiterToggle'),
    enhancerVoiceToggle: document.getElementById('enhancerVoiceToggle'),
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

    // Modern Watch View & Series Episode Selector Elements
    watchCloseBtn: document.getElementById('watchCloseBtn'),
    serverPillsList: document.getElementById('serverPillsList'),
    watchServersColumn: document.getElementById('watchServersColumn'),
    serversStatusBadge: document.getElementById('serversStatusBadge'),
    currentStreamIndicator: document.getElementById('currentStreamIndicator'),
    watchDownloadBtnSide: document.getElementById('watchDownloadBtnSide'),
    watchMobileTabs: document.getElementById('watchMobileTabs'),
    watchEpisodesColumn: document.getElementById('watchEpisodesColumn'),
    watchSeriesContainer: document.getElementById('watchSeriesContainer'),
    watchMovieRecsContainer: document.getElementById('watchMovieRecsContainer'),
    watchMovieRecsGrid: document.getElementById('watchMovieRecsGrid'),
    watchRightColTitle: document.getElementById('watchRightColTitle'),
    watchRightColSub: document.getElementById('watchRightColSub'),
    watchRightColIcon: document.getElementById('watchRightColIcon'),
    watchSeasonsRow: document.getElementById('watchSeasonsRow'),
    watchEpisodesGrid: document.getElementById('watchEpisodesGrid'),
    watchSelectedEpCard: document.getElementById('watchSelectedEpCard'),
    howToDownloadBtn: document.getElementById('howToDownloadBtn'),
    watchDownloadBtn: document.getElementById('watchDownloadBtn'),
    downloadGuideModal: document.getElementById('downloadGuideModal'),
    closeDownloadGuideBtn: document.getElementById('closeDownloadGuideBtn'),
    gotItDownloadGuideBtn: document.getElementById('gotItDownloadGuideBtn'),
    downloadPosterImg: document.getElementById('downloadPosterImg'),
    downloadTitleText: document.getElementById('downloadTitleText'),
    downloadMetaText: document.getElementById('downloadMetaText'),
    downloadSeasonEpBadge: document.getElementById('downloadSeasonEpBadge'),
    downloadStreamsList: document.getElementById('downloadStreamsList'),
    copyDirectStreamUrlBtn: document.getElementById('copyDirectStreamUrlBtn'),
    directBrowserDownloadBtn: document.getElementById('directBrowserDownloadBtn'),

    // Modern Watch Actions: Fullscreen, Sound Booster, Audio Dubs
    watchAudioDubsBtn: document.getElementById('watchAudioDubsBtn'),
    watchAudioDubsLabel: document.getElementById('watchAudioDubsLabel'),
    watchSoundBoosterBtn: document.getElementById('watchSoundBoosterBtn'),
    watchSoundBoosterLabel: document.getElementById('watchSoundBoosterLabel'),
    watchFullscreenBtn: document.getElementById('watchFullscreenBtn'),
    watchFullscreenLabel: document.getElementById('watchFullscreenLabel'),
    watchFullscreenIcon: document.getElementById('watchFullscreenIcon'),
    playerFloatingActions: document.getElementById('playerFloatingActions'),
    floatingSoundBtn: document.getElementById('floatingSoundBtn'),
    floatingSoundLabel: document.getElementById('floatingSoundLabel'),
    floatingFullscreenBtn: document.getElementById('floatingFullscreenBtn'),
    floatingFullscreenLabel: document.getElementById('floatingFullscreenLabel'),
    floatingFullscreenIcon: document.getElementById('floatingFullscreenIcon'),
    floatingAudioBtn: document.getElementById('floatingAudioBtn'),
    floatingAudioLabel: document.getElementById('floatingAudioLabel'),
    watchGuideSecondaryBtn: document.getElementById('watchGuideSecondaryBtn'),

    // Standalone Modals for Sound Booster & Audio Dubs
    soundBoosterModal: document.getElementById('soundBoosterModal'),
    closeSoundBoosterBtn: document.getElementById('closeSoundBoosterBtn'),
    doneSoundBoosterBtn: document.getElementById('doneSoundBoosterBtn'),
    modalBoostLevelLabel: document.getElementById('modalBoostLevelLabel'),
    modalBoostRangeSlider: document.getElementById('modalBoostRangeSlider'),
    modalPresetsList: document.getElementById('modalPresetsList'),
    audioDubsModal: document.getElementById('audioDubsModal'),
    closeAudioDubsBtn: document.getElementById('closeAudioDubsBtn'),
    doneAudioDubsBtn: document.getElementById('doneAudioDubsBtn'),
    audioDubsListContainer: document.getElementById('audioDubsListContainer'),

    // Shortcuts & Toasts
    shortcutsModal: document.getElementById('shortcutsModal'),
    shortcutsCloseBtn: document.getElementById('shortcutsCloseBtn'),
    toastContainer: document.getElementById('toastContainer'),

    // VIP & Monetization Elements
    vipModalBtn: document.getElementById('vipModalBtn'),
    vipModal: document.getElementById('vipModal'),
    vipCloseBtn: document.getElementById('vipCloseBtn'),
    footerVipLink: document.getElementById('footerVipLink'),
    detailsSponsorBanner: document.getElementById('detailsSponsorBanner'),
    playerSponsorPill: document.getElementById('playerSponsorPill'),
    sponsorBannerCta: document.getElementById('sponsorBannerCta'),
    sponsorBannerTitle: document.getElementById('sponsorBannerTitle'),
    sponsorBannerDesc: document.getElementById('sponsorBannerDesc'),
    sponsorDiscountPill: document.getElementById('sponsorDiscountPill'),
    vipPasscodeInput: document.getElementById('vipPasscodeInput'),
    activateVipBtn: document.getElementById('activateVipBtn'),
    vipStatusMsg: document.getElementById('vipStatusMsg'),
    usdtAddrInput: document.getElementById('usdtAddrInput'),
    btcAddrInput: document.getElementById('btcAddrInput'),
    solAddrInput: document.getElementById('solAddrInput'),
    vipBmacLink: document.getElementById('vipBmacLink'),
    vipKofiLink: document.getElementById('vipKofiLink'),
    vipPaypalLink: document.getElementById('vipPaypalLink'),
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

  function formatDisplayDuration(rawDuration, isSeries = false) {
    if (!rawDuration) return isSeries ? '45 min/ep' : '2h 05m';
    const s = String(rawDuration).trim();
    const m = s.match(/^(\d+)\s*(?:min|m|s|sec)?$/i);
    if (m) {
      const num = parseInt(m[1], 10);
      const mins = num > 360 ? Math.round(num / 60) : num;
      if (mins > 0) {
        if (isSeries && mins <= 65) return `${mins} min/ep`;
        const hrs = Math.floor(mins / 60);
        const rem = mins % 60;
        if (hrs > 0) {
          return rem > 0 ? `${hrs}h ${rem}m (${mins} min)` : `${hrs}h (${mins} min)`;
        }
        return `${mins} min`;
      }
    }
    return s;
  }

  function parseDurationToSeconds(rawDuration) {
    if (!rawDuration) return 0;
    const s = String(rawDuration).trim();
    const m = s.match(/^(\d+)\s*(?:min|m|s|sec)?$/i);
    if (m) {
      const num = parseInt(m[1], 10);
      return num > 360 ? num : num * 60;
    }
    const hm = s.match(/(?:(\d+)\s*h(?:ours?)?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?/i);
    if (hm && (hm[1] || hm[2])) {
      const hrs = parseInt(hm[1] || '0', 10);
      const mins = parseInt(hm[2] || '0', 10);
      return hrs * 3600 + mins * 60;
    }
    return 0;
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

  function getMediaIdValue(item) {
    if (!item) return '';
    if (typeof item === 'string') return item.trim();
    if (typeof item === 'number') return String(item);
    if (item.id !== undefined && item.id !== null) {
      if (typeof item.id === 'string' || typeof item.id === 'number') return String(item.id).trim();
      if (typeof item.id === 'object') {
        if (item.id.value !== undefined && item.id.value !== null) return String(item.id.value).trim();
        if (item.id.id !== undefined && item.id.id !== null) return String(item.id.id).trim();
      }
    }
    if (item.value !== undefined && item.value !== null) return String(item.value).trim();
    if (item.imdb_id) return String(item.imdb_id).trim();
    if (item.tmdb_id) return String(item.tmdb_id).trim();
    return '';
  }

  function getMediaProvider(item) {
    if (!item) return 'moviebox';
    if (item.id && typeof item.id === 'object' && item.id.provider) return item.id.provider;
    if (item.provider) return item.provider;
    return 'moviebox';
  }

  function isSameMedia(a, b) {
    if (!a || !b) return false;
    const idA = getMediaIdValue(a);
    const idB = getMediaIdValue(b);
    if (idA && idB && idA === idB) return true;
    const keyA = getCanonicalKey(a);
    const keyB = getCanonicalKey(b);
    return Boolean(keyA && keyB && keyA === keyB);
  }

  // ==========================================================================
  // MONETIZATION, VIP & SPONSOR MANAGEMENT
  // ==========================================================================
  function initMonetization() {
    const config = window.NETMIRROR_MONETIZATION || {};

    // 1. Populate VPN Affiliate Links
    const vpnUrl = config.affiliateVpnUrl || 'https://nordvpn.com';
    if (el.sponsorBannerCta) el.sponsorBannerCta.href = vpnUrl;
    if (el.playerSponsorPill) el.playerSponsorPill.href = vpnUrl;
    if (el.sponsorBannerTitle && config.affiliateVpnTitle) el.sponsorBannerTitle.textContent = config.affiliateVpnTitle;
    if (el.sponsorBannerDesc && config.affiliateVpnDesc) el.sponsorBannerDesc.textContent = config.affiliateVpnDesc;
    if (el.sponsorDiscountPill && config.affiliateVpnBadge) el.sponsorDiscountPill.textContent = config.affiliateVpnBadge;

    // Respect showVpnBanners flag to ensure 100% ad-free mobile browsing
    if (!config.showVpnBanners) {
      if (el.detailsSponsorBanner) el.detailsSponsorBanner.classList.add('hidden');
      if (el.playerSponsorPill) el.playerSponsorPill.classList.add('hidden');
    }

    // 2. Populate Donation Links
    if (el.vipBmacLink && config.buyMeACoffeeUrl) el.vipBmacLink.href = config.buyMeACoffeeUrl;
    if (el.vipKofiLink && config.kofiUrl) el.vipKofiLink.href = config.kofiUrl;
    if (el.vipPaypalLink && config.paypalUrl) el.vipPaypalLink.href = config.paypalUrl;

    // 3. Populate Crypto Addresses
    const wallets = config.cryptoWallets || {};
    if (el.usdtAddrInput) el.usdtAddrInput.value = wallets.usdt || 'TQ... (Configure in monetization-config.js)';
    if (el.btcAddrInput) el.btcAddrInput.value = wallets.btc || 'bc1... (Configure in monetization-config.js)';
    if (el.solAddrInput) el.solAddrInput.value = wallets.sol || 'So1... (Configure in monetization-config.js)';

    // 4. Render Owner Monetized Banner Ads (Google AdSense ca-pub-4512671475286537)
    if (config.adBanners && config.adBanners.enabled && !state.isVip) {
      loadAdSenseUnit(el.userHeaderAdBanner, config.adBanners.headerBannerHtml);
      loadAdSenseUnit(el.userMidRailAdBanner, config.adBanners.midRailBannerHtml);
      loadAdSenseUnit(el.userFooterAdBanner, config.adBanners.footerBannerHtml);
      loadAdSenseUnit(el.userPlayerEpisodesAdBanner, config.adBanners.watchBannerHtml);
    } else {
      hideAllAdUnits();
    }

    // 5. Update VIP Status UI
    updateVipStatusUI();

    // 6. Setup VIP & Monetization Listeners
    setupMonetizationListeners();
  }

  function loadAdSenseUnit(container, customHtml) {
    if (!container) return;
    if (state.isVip) {
      container.innerHTML = '';
      container.classList.add('hidden');
      container.style.display = 'none';
      return;
    }
    const config = window.NETMIRROR_MONETIZATION || {};
    if (!config.adBanners || !config.adBanners.enabled) {
      container.classList.add('hidden');
      container.style.display = 'none';
      return;
    }
    const html = customHtml || config.adBanners.headerBannerHtml || '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>';

    let ins = container.querySelector('ins.adsbygoogle');
    if (!ins) {
      container.innerHTML = html;
      ins = container.querySelector('ins.adsbygoogle');
    }
    container.classList.remove('hidden');
    container.style.display = 'flex';

    const triggerPush = () => {
      try {
        if (ins && !ins.getAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.debug('[AdSense] Push notice:', e);
      }
    };

    triggerPush();
    setTimeout(triggerPush, 400);
    setTimeout(triggerPush, 1200);
  }

  function triggerAllAdSenseUnits() {
    if (state.isVip) return;
    document.querySelectorAll('.user-ad-banner ins.adsbygoogle:not([data-adsbygoogle-status])').forEach(ins => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (_) {}
    });
  }

  function hideAllAdUnits() {
    [
      el.userHeaderAdBanner,
      el.userMidRailAdBanner,
      el.userDetailsAdBanner,
      el.userPlayerEpisodesAdBanner,
      el.userFooterAdBanner,
    ].forEach((b) => {
      if (b) {
        b.innerHTML = '';
        b.classList.add('hidden');
        b.style.display = 'none';
      }
    });
  }

  function updateVipStatusUI() {
    if (state.isVip) {
      if (el.vipModalBtn) {
        el.vipModalBtn.innerHTML = `
          <svg viewBox="0 0 24 24" class="vip-crown-icon" style="fill:#22c55e"><path d="M2 4l3 12h14l3-12-6 7-4-11-4 11-6-7zm3 16h14v2H5v-2z"/></svg>
          <span class="vip-btn-text" style="color:#86efac">VIP Active</span>
        `;
        el.vipModalBtn.style.borderColor = '#22c55e';
      }
      if (el.detailsSponsorBanner) {
        el.detailsSponsorBanner.style.display = 'none';
      }
      if (el.playerSponsorPill) {
        el.playerSponsorPill.style.display = 'none';
      }
      hideAllAdUnits();
    }
  }

  function setupMonetizationListeners() {
    // Open VIP Modal
    if (el.vipModalBtn && el.vipModal) {
      el.vipModalBtn.addEventListener('click', () => {
        el.vipModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    }

    if (el.footerVipLink && el.vipModal) {
      el.footerVipLink.addEventListener('click', (e) => {
        e.preventDefault();
        el.vipModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
      });
    }

    // Close VIP Modal
    if (el.vipCloseBtn && el.vipModal) {
      el.vipCloseBtn.addEventListener('click', () => {
        el.vipModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      });
    }

    if (el.vipModal) {
      el.vipModal.addEventListener('click', (e) => {
        if (e.target === el.vipModal) {
          el.vipModal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      });
    }

    // Copy Crypto Addresses
    document.querySelectorAll('.btn-copy-crypto').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        if (input && input.value) {
          navigator.clipboard.writeText(input.value).then(() => {
            const orig = btn.textContent;
            btn.textContent = 'Copied!';
            showToast('Wallet address copied to clipboard!');
            setTimeout(() => { btn.textContent = orig; }, 2000);
          }).catch(() => {
            input.select();
            document.execCommand('copy');
            showToast('Wallet address copied!');
          });
        }
      });
    });

    // Activate VIP Passcode
    if (el.activateVipBtn && el.vipPasscodeInput) {
      el.activateVipBtn.addEventListener('click', handleVipActivation);
      el.vipPasscodeInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleVipActivation();
      });
    }
  }

  function handleVipActivation() {
    const inputVal = (el.vipPasscodeInput.value || '').trim().toUpperCase();
    const config = window.NETMIRROR_MONETIZATION || {};
    const validCodes = (config.vipPasscodes || ['VIP2026', 'NETMIRRORVIP', 'PREMIUM4K', 'FSFERDOWS']).map(c => String(c).toUpperCase());

    if (!inputVal) {
      showVipMessage('Please enter a valid supporter passcode.', 'error');
      return;
    }

    if (validCodes.includes(inputVal)) {
      state.isVip = true;
      localStorage.setItem('netmirror_is_vip', 'true');
      updateVipStatusUI();
      showVipMessage('🎉 VIP Supporter Pass Activated! Ultra 4K Priority & Ad-Free Cinema unlocked.', 'success');
      showToast('👑 VIP Pass Activated! Enjoy Premium NetMirror.');
      setTimeout(() => {
        if (el.vipModal) {
          el.vipModal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      }, 2500);
    } else {
      showVipMessage('Invalid passcode. Support the site or check your code and try again.', 'error');
    }
  }

  function showVipMessage(msg, type) {
    if (!el.vipStatusMsg) return;
    el.vipStatusMsg.textContent = msg;
    el.vipStatusMsg.className = `vip-status-message ${type}`;
    el.vipStatusMsg.classList.remove('hidden');
  }

  // ==========================================================================
  // INITIALIZATION & DATA FETCHING (FAST ZERO-WAIT ARCHITECTURE)
  // ==========================================================================
  function initAdShield() {
    try {
      const nativeOpen = window.open;
      const dummyWindow = {
        location: { href: '', replace: () => {}, assign: () => {} },
        focus: () => {},
        close: () => {},
        blur: () => {},
        postMessage: () => {},
        document: { write: () => {}, writeln: () => {}, open: () => {}, close: () => {} },
      };

      // 1. Intercept rogue popup and blank window attempts
      window.open = function (url, target, features) {
        if (!url || typeof url !== 'string' || url === 'about:blank' || url === '') {
          console.warn('[AdShield] Blocked blank popup window attempt');
          return dummyWindow;
        }

        const lower = url.toLowerCase();
        const isGoogleAd =
          lower.includes('google.com') ||
          lower.includes('googlesyndication.com') ||
          lower.includes('doubleclick.net') ||
          lower.includes('googleadservices.com') ||
          lower.includes('adservice.google.');

        // Strictly block rogue popups when player is active UNLESS it is an authorized Google AdSense ad click
        if (!isGoogleAd && (state.isEmbedMode || (el.playerOverlay && !el.playerOverlay.classList.contains('hidden')))) {
          console.warn('[AdShield] Blocked popup/tab redirect during playback:', url);
          return dummyWindow;
        }

        const isSafe =
          url.startsWith('/') ||
          isGoogleAd ||
          lower.includes(window.location.hostname) ||
          lower.includes('vercel.app') ||
          lower.includes('netlify.app') ||
          lower.includes('github.com') ||
          lower.includes('buymeacoffee.com') ||
          lower.includes('ko-fi.com') ||
          lower.includes('paypal.me');
        if (!isSafe) {
          console.warn('[AdShield] Blocked unauthorized popup attempt:', url);
          return dummyWindow;
        }
        return nativeOpen.call(window, url, target, features);
      };

      // 2. Prevent rogue beforeunload / frame-busting redirects while video player is active
      window.addEventListener('beforeunload', (e) => {
        if (el.playerOverlay && !el.playerOverlay.classList.contains('hidden') && !state.allowAppNavigation) {
          console.warn('[AdShield] Prevented rogue tab navigation away from player');
        }
      });

      // 3. Intercept rogue external link clicks triggered while playing video
      document.addEventListener('click', (e) => {
        const link = e.target && e.target.closest ? e.target.closest('a') : null;
        if (link && link.href) {
          // Explicitly permit clicks on official Google AdSense ads and banners
          if (link.closest('.user-ad-banner') || link.closest('ins.adsbygoogle') || link.closest('[id*="google_ads"]')) {
            return true;
          }

          const href = link.getAttribute('href') || '';
          const lower = href.toLowerCase();
          if (href.startsWith('http://') || href.startsWith('https://')) {
            const isGoogleAd =
              lower.includes('google.com') ||
              lower.includes('googlesyndication.com') ||
              lower.includes('doubleclick.net') ||
              lower.includes('googleadservices.com') ||
              lower.includes('adservice.google.');
            const isSafe =
              isGoogleAd ||
              lower.includes(window.location.hostname) ||
              lower.includes('vercel.app') ||
              lower.includes('netlify.app') ||
              lower.includes('github.com') ||
              lower.includes('buymeacoffee.com') ||
              lower.includes('ko-fi.com') ||
              lower.includes('paypal.me');

            // If player overlay is active, block any non-safe link click (or rogue ad links)
            if (el.playerOverlay && !el.playerOverlay.classList.contains('hidden')) {
              // Only allow explicit user buttons like direct download link
              if (!link.classList.contains('download-action-btn') && !link.classList.contains('modal-close-btn')) {
                if (!isSafe) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  console.warn('[AdShield] Blocked rogue link click during video playback:', href);
                  return false;
                }
              }
            }
          }
        }
      }, true);

      // 4. Connect Player AdShield Pill
      const pill = document.getElementById('playerAdShieldPill');
      if (pill) {
        pill.style.cursor = 'pointer';
        pill.addEventListener('click', () => {
          showToast('🛡️ AdShield Active: Zero redirects, zero popups. 100% clean streaming.');
        });
      }
    } catch (_) {}
  }

  // ==========================================================================
  // UNIVERSAL MULTI-DEVICE PWA & SOFTWARE INSTALL ENGINE
  // ==========================================================================
  let deferredInstallPrompt = null;

  function initPwaInstall() {
    const installNavBtn = document.getElementById('installAppNavBtn');
    const mobileInstallBannerBtn = document.getElementById('mobileInstallBannerBtn');
    const installModal = document.getElementById('installAppModal');
    const closeInstallModalBtn = document.getElementById('closeInstallModalBtn');
    const closeInstallModalBottomBtn = document.getElementById('closeInstallModalBottomBtn');
    const nativeInstallTriggerBtn = document.getElementById('nativeInstallTriggerBtn');
    const nativeBanner = document.getElementById('nativeInstallPromptBanner');
    const osTabs = document.querySelectorAll('.install-os-tab');

    // Detect user platform
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/.test(ua);
    const isWindows = /windows/.test(ua);
    const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
    const isLinux = /linux/.test(ua) && !isAndroid;

    function detectTargetTab() {
      if (isIOS) return 'ios';
      if (isAndroid) return 'android';
      if (isWindows) return 'windows';
      if (isMac) return 'mac';
      if (isLinux) return 'linux';
      return 'windows';
    }

    const tabDownloadMeta = {
      mac: {
        url: '/downloads/MovieBox-Plus-Mac.dmg',
        filename: 'MovieBox-Plus-Mac.dmg',
        btnText: '⬇️ Download Mac DMG',
        bannerTitle: 'Download Native macOS App (Apple Silicon & Intel DMG)',
        toast: '⬇️ Starting download: MovieBox Plus for Mac (DMG)...'
      },
      windows: {
        url: '/downloads/MovieBox-Plus-Windows.zip',
        filename: 'MovieBox-Plus-Windows.zip',
        btnText: '⬇️ Download Windows (.zip)',
        bannerTitle: 'Download Native Windows Launcher (.zip)',
        toast: '⬇️ Starting download: MovieBox Plus for Windows (.zip)...'
      },
      android: {
        url: '/downloads/MovieBox-Plus.apk',
        filename: 'MovieBox-Plus.apk',
        btnText: '⬇️ Download Android APK',
        bannerTitle: 'Download Standalone Android APK (Phones, Tablets & TV)',
        toast: '⬇️ Starting download: MovieBox Plus for Android (APK)...'
      },
      linux: {
        url: '/downloads/MovieBox-Plus-Linux.tar.gz',
        filename: 'MovieBox-Plus-Linux.tar.gz',
        btnText: '⬇️ Download Linux Package',
        bannerTitle: 'Download Native Linux Package (.tar.gz)',
        toast: '⬇️ Starting download: MovieBox Plus for Linux (.tar.gz)...'
      },
      extension: {
        url: '/downloads/moviebox-extension.zip',
        filename: 'moviebox-extension.zip',
        btnText: '⬇️ Download Extension (ZIP)',
        bannerTitle: 'Download Chrome Extension (Manifest V3)',
        toast: '⬇️ Starting download: MovieBox Plus Chrome Extension (ZIP)...'
      },
      ios: {
        url: null,
        filename: null,
        btnText: '📲 How to Install on iOS',
        bannerTitle: 'Install Standalone Fullscreen Web App for iPhone & iPad',
        toast: '📲 On iPhone/iPad: Tap Share (⎋) in Safari, then "Add to Home Screen"!'
      }
    };

    function triggerFileDownload(url, filename) {
      if (!url) return;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
      }, 300);
    }

    function switchOsTab(tabName) {
      osTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.tab === tabName);
      });
      document.querySelectorAll('.install-tab-content').forEach(content => {
        if (content.id === `tabContent-${tabName}`) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });

      const meta = tabDownloadMeta[tabName];
      if (meta && nativeInstallTriggerBtn) {
        nativeInstallTriggerBtn.textContent = meta.btnText;
      }
      if (meta && nativeBanner) {
        const titleEl = nativeBanner.querySelector('p');
        if (titleEl) titleEl.textContent = meta.bannerTitle;
      }
    }

    function openInstallModal() {
      if (!installModal) return;
      const targetTab = detectTargetTab();
      switchOsTab(targetTab);

      // Keep download banner visible so user can 1-click download directly
      if (nativeBanner) {
        nativeBanner.classList.remove('hidden');
      }

      installModal.classList.remove('hidden');
    }

    function closeInstallModal() {
      if (installModal) installModal.classList.add('hidden');
    }

    // Capture standard PWA install event (Chromium, Edge, Brave, Android)
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (nativeBanner) nativeBanner.classList.remove('hidden');
      if (installNavBtn) {
        installNavBtn.style.borderColor = '#22c55e';
        installNavBtn.style.boxShadow = '0 0 12px rgba(34, 197, 94, 0.4)';
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      closeInstallModal();
      showToast('🎉 MovieBox Plus software installed successfully! Enjoy 4K streaming.');
    });

    // Wire trigger buttons
    if (installNavBtn) {
      installNavBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openInstallModal();
      });
    }

    if (mobileInstallBannerBtn) {
      mobileInstallBannerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const sheet = document.getElementById('mobilePlatformsSheet');
        if (sheet) sheet.classList.add('hidden');
        openInstallModal();
      });
    }

    if (nativeInstallTriggerBtn) {
      nativeInstallTriggerBtn.addEventListener('click', () => {
        const activeTabEl = document.querySelector('.install-os-tab.active');
        const currentTab = activeTabEl ? activeTabEl.dataset.tab : detectTargetTab();
        const meta = tabDownloadMeta[currentTab] || tabDownloadMeta[detectTargetTab()];

        if (meta && meta.url) {
          triggerFileDownload(meta.url, meta.filename);
          showToast(meta.toast);
        } else if (currentTab === 'ios') {
          showToast('📲 On iPhone/iPad: Tap Share (⎋) in Safari, then "Add to Home Screen"!');
        }

        // Also prompt PWA installer if browser supports it
        if (deferredInstallPrompt) {
          setTimeout(() => {
            try {
              deferredInstallPrompt.prompt();
              deferredInstallPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                  showToast('Installing MovieBox Plus...');
                  closeInstallModal();
                }
                deferredInstallPrompt = null;
              });
            } catch (_) {}
          }, 350);
        }
      });
    }

    // Tab buttons
    osTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchOsTab(tab.dataset.tab);
      });
    });

    // Close buttons
    if (closeInstallModalBtn) closeInstallModalBtn.addEventListener('click', closeInstallModal);
    if (closeInstallModalBottomBtn) closeInstallModalBottomBtn.addEventListener('click', closeInstallModal);
    if (installModal) {
      installModal.addEventListener('click', (e) => {
        if (e.target === installModal) closeInstallModal();
      });
    }
  }

  // ==========================================================================
  // CURATED DEFAULT SHOWCASE CATALOG (0ms Instant Category Showcase)
  // 100% Genre-Accurate Catalog with Official High-Res Posters & Metadata
  // ==========================================================================
    const HERO_MOVIE_SLIDES = [
    {
      id: { provider: 'tmdb', value: '533535' },
      tmdb_id: '533535',
      title: 'Deadpool & Wolverine',
      year: '2024',
      rating: '8.6',
      media_type: 'movie',
      overview: 'Wade Wilson must reluctantly suit-up again alongside a cynical Wolverine to protect his universe from an existential void threat.',
      backdrop_path: '/yDHYTjA3R0jFYba16jBB1jv8vE1.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/yDHYTjA3R0jFYba16jBB1jv8vE1.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg'
    },
    {
      id: { provider: 'tmdb', value: '76600' },
      tmdb_id: '76600',
      title: 'Avatar: The Way of Water',
      year: '2022',
      rating: '8.8',
      media_type: 'movie',
      overview: 'Jake Sully and Neytiri fight to protect their family as an ancient enemy resurfaces, leading them to the ocean regions of Pandora.',
      backdrop_path: '/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg'
    },
    {
      id: { provider: 'tmdb', value: '693134' },
      tmdb_id: '693134',
      title: 'Dune: Part Two',
      year: '2024',
      rating: '8.5',
      media_type: 'movie',
      overview: 'Paul Atreides unites with Chani and the Fremen to seek revenge against the conspirators who destroyed his noble family.',
      backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s520b4q.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'
    },
    {
      id: { provider: 'tmdb', value: '1368337' },
      tmdb_id: '1368337',
      title: 'The Odyssey',
      year: '2026',
      rating: '8.0',
      media_type: 'movie',
      overview: 'Odysseus, King of Ithaca, embarks on a perilous epic journey home following the Trojan War across mythical waters.',
      backdrop_path: '/c7btGYblBnfAaw713WvFM0Kimc7.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/c7btGYblBnfAaw713WvFM0Kimc7.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg'
    },
    {
      id: { provider: 'tmdb', value: '66732' },
      tmdb_id: '66732',
      title: 'Stranger Things',
      year: '2024',
      rating: '8.6',
      media_type: 'tv',
      overview: 'When a boy vanishes from Hawkins, friends and family uncover secret experiments, supernatural dangers and an extraordinary girl.',
      backdrop_path: '/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg'
    },
    {
      id: { provider: 'tmdb', value: '299536' },
      tmdb_id: '299536',
      title: 'Avengers: Infinity War',
      year: '2018',
      rating: '8.9',
      media_type: 'movie',
      overview: 'The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation.',
      backdrop_path: '/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg'
    },
    {
      id: { provider: 'tmdb', value: '84958' },
      tmdb_id: '84958',
      title: 'Loki',
      year: '2023',
      rating: '8.4',
      media_type: 'tv',
      overview: 'The mercurial villain Loki resumes his role as the God of Mischief following the timeline events of Avengers: Endgame.',
      backdrop_path: '/voHUmlvjysv923xaoE3q25T0k2d.jpg',
      backdrop_url: 'https://image.tmdb.org/t/p/original/voHUmlvjysv923xaoE3q25T0k2d.jpg',
      poster_url: 'https://image.tmdb.org/t/p/w500/voHUmlvjysv923xaoE3q25T0k2d.jpg'
    }
  ];

const DEFAULT_SHOWCASE_CATALOG = {
  "hero_slides": [
    {
      "id": {
        "provider": "moviebox",
        "value": "57081"
      },
      "title": "Star Wars: The Force Awakens",
      "media_type": "movie",
      "year": "2015",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTAzODEzNDAzMl5BMl5BanBnXkFtZTgwMDU1MTgzNzE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "moviebox",
        "value": "51415"
      },
      "title": "Avengers: Endgame",
      "media_type": "movie",
      "year": "2019",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "moviebox",
        "value": "45288"
      },
      "title": "Spider-Man: No Way Home",
      "media_type": "movie",
      "year": "2021",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTUtZGYmOTUxNjAwNTVhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "moviebox",
        "value": "62875"
      },
      "title": "Avatar: The Way of Water",
      "media_type": "movie",
      "year": "2022",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDEzMmQwZjctZWU2My00MWVOLWE0NzItM2NjNDcyNTQ3OGY3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "moviebox",
        "value": "20010"
      },
      "title": "Dune: Part Two",
      "media_type": "movie",
      "year": "2024",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "trending": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt6263850"
      },
      "title": "Deadpool & Wolverine",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1630029"
      },
      "title": "Avatar: The Way of Water",
      "media_type": "movie",
      "year": "2022",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt4154796"
      },
      "title": "Avengers: Endgame",
      "media_type": "movie",
      "year": "2019",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt22022452"
      },
      "title": "Inside Out 2",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWY3MDE2Y2UtOTE3Zi00MGUzLTg2MTItZjE1ZWVkMGVlODRmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10872600"
      },
      "title": "Spider-Man: No Way Home",
      "media_type": "movie",
      "year": "2021",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMmFiZGZjMmEtMTA0Ni00MzA2LTljMTYtZGI2MGJmZWYzZTQ2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1745960"
      },
      "title": "Top Gun: Maverick",
      "media_type": "movie",
      "year": "2022",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1825683"
      },
      "title": "Black Panther",
      "media_type": "movie",
      "year": "2018",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTg1MTY2MjYzNV5BMl5BanBnXkFtZTgwMTc4NTMwNDI@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1517268"
      },
      "title": "Barbie",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjI3NDU0ZGYtYjA2YS00Y2RlLTgwZDAtYTE2YTM5ZjE1M2JlXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0369610"
      },
      "title": "Jurassic World",
      "media_type": "movie",
      "year": "2015",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzBhNzlkM2UtZTQyOC00NjUyLTkzMmMtNDQ1YTM5N2NmMGE5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt4154756"
      },
      "title": "Avengers: Infinity War",
      "media_type": "movie",
      "year": "2018",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjMxNjY2MDU1OV5BMl5BanBnXkFtZTgwNzY1MTUwNTM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0120338"
      },
      "title": "Titanic",
      "media_type": "movie",
      "year": "1997",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzYyN2FiZmUtYWYzMy00MzViLWJkZTMtOGY1ZjgzNWMwN2YxXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt15398776"
      },
      "title": "Oppenheimer",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt15239678"
      },
      "title": "Dune: Part Two",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13622970"
      },
      "title": "Moana 2",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDUxNThhYTUtYjgxNy00MGQ4LTgzOTEtZjg1YTU5NTcwNThlXkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "netflix": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt4574334"
      },
      "title": "Stranger Things",
      "media_type": "series",
      "year": "2016",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjEzMDAxOTUyMV5BMl5BanBnXkFtZTgwNzAxMzYzOTE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13443470"
      },
      "title": "Wednesday",
      "media_type": "series",
      "year": "2022",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BY2E1NDI5OWEtODJmYi00Nzg2LWI4MjUtODFiMTU2YWViOTU3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10919420"
      },
      "title": "Squid Game",
      "media_type": "series",
      "year": "2021",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDcxYjg1OTctYmUxZi00ZjhjLWIwNTMtNmI2M2Y4OTU1YWU2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0388629"
      },
      "title": "One Piece",
      "media_type": "series",
      "year": "1999",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6468322"
      },
      "title": "Money Heist",
      "media_type": "series",
      "year": "2017",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BODdiNWI5ZjgtY2RhZi00ODlmLTkyNDEtMzIyMTEyZDE2ZjNjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5180504"
      },
      "title": "The Witcher",
      "media_type": "series",
      "year": "2019",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTQzMzNmMzUtODgwNS00YTdhLTg5N2MtOWU1YTc4YWY3NjRlXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7991608"
      },
      "title": "Red Notice",
      "media_type": "movie",
      "year": "2021",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOGNjNGQ3MmItYTM5NS00NjBiLWI0ZTItZDE5ZjQyNjg3ODBjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12263384"
      },
      "title": "Extraction II",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZGQwNDdhODAtY2Y0Ni00YzFhLTk1OGUtY2RkMDAzNzBmZjAxXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7221388"
      },
      "title": "Cobra Kai",
      "media_type": "series",
      "year": "2018",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjA3NDkwNzktNjJkYi00ODNhLWFhYzQtYzk5NjU4MDM0OWZmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2707408"
      },
      "title": "Narcos",
      "media_type": "series",
      "year": "2015",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzQwOTcwMzIwN15BMl5BanBnXkFtZTgwMjYxMTA0NjE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13603966"
      },
      "title": "Heart of Stone",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTM5OTQ2ZTYtY2EzMC00Zjc3LTg3NWEtZWI4OTdlMjcwMGFlXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2531336"
      },
      "title": "Lupin",
      "media_type": "series",
      "year": "2021",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMzk4MTc0NWUtZjk3Mi00ODkzLTlkYjItOWRhMTc5MmRiNjI0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5753856"
      },
      "title": "Dark",
      "media_type": "series",
      "year": "2017",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTUzNjQ2MTY5NV5BMl5BanBnXkFtZTgwOTAzNTQxNDM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12590266"
      },
      "title": "Cyberpunk: Edgerunners",
      "media_type": "series",
      "year": "2022",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNjUwY2RlMjctYTA4My00NzNjLTlmYzQtMTg0NzM0ZDU5ZGY0XkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "prime": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt1190634"
      },
      "title": "The Boys",
      "media_type": "series",
      "year": "2019",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZjU4OWNiYzQtMzc1NS00NjZlLTgyYTctZWY4ZmEzMTkxYjA4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9288030"
      },
      "title": "Reacher",
      "media_type": "series",
      "year": "2022",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMmE0YTA3MTItMjhiNC00MGQ3LTllZDktNGNiZWY1OWFmNmM1XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7631058"
      },
      "title": "The Lord of the Rings: The Rings of Power",
      "media_type": "series",
      "year": "2022",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjlhYTk3ZGQtNjdlYi00NDQyLTgxZTEtMzk0OTU5OTRhNGZhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12637874"
      },
      "title": "Fallout",
      "media_type": "series",
      "year": "2024",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzE1MTZmY2ItMTgxNi00OGU5LTk4NTItMmY2ODFhYzhjZjRkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6741278"
      },
      "title": "Invincible",
      "media_type": "series",
      "year": "2021",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZGM5MmM2ZDAtMzBjNS00NjMxLWE4ZTMtNzFjMWMxYzU2ZThjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5057054"
      },
      "title": "Jack Ryan",
      "media_type": "series",
      "year": "2018",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNGYxNzgzNTQtY2U0OC00NzU2LTgxZmYtNmZkMmVlMjgyMzM3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9794044"
      },
      "title": "Citadel",
      "media_type": "series",
      "year": "2023",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTE0ZWI1MmItODA4NS00NjM0LWJiODUtYzg0Y2I1YTUwYTRmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7462410"
      },
      "title": "The Wheel of Time",
      "media_type": "series",
      "year": "2021",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNmQ5Y2U2MWYtZDcyMi00YTk5LWEyYjItNTI3ODg4MTdlMjYwXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt11743610"
      },
      "title": "The Terminal List",
      "media_type": "series",
      "year": "2022",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTFiZDQ1NWItODBkZS00ZjA1LThkNzUtY2M5Yzk2M2Y3ZDNkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13159924"
      },
      "title": "Gen V",
      "media_type": "series",
      "year": "2023",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWU4YTljYmItYjczNS00MWY0LWI3NjctZjJhYjU3NWNmNWZhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt3359350"
      },
      "title": "Road House",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BODVkYjlkM2UtNWVlMS00N2U1LTgxOTYtODlmNmE1YTgzMjczXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9466114"
      },
      "title": "The Idea of You",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BY2RkZmZjYTQtOGExMS00YTljLWJmNzQtMzI0ZDU3YzFjNzJkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5500218"
      },
      "title": "Samaritan",
      "media_type": "movie",
      "year": "2022",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzYwODI2MTYtZDJjZi00ZDdjLWJiYTktZmQyNGJiMmJmMWIxXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9777666"
      },
      "title": "The Tomorrow War",
      "media_type": "movie",
      "year": "2021",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYmUyNzY2YWYtNWQ0My00ODMwLTkwOTQtOTA0ZjM0MjRmYjJiXkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "disney": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt9140554"
      },
      "title": "Loki",
      "media_type": "series",
      "year": "2021",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzA2YjM2ZWQtYTZhMS00OTI3LTlhYzQtZjBiZWZkMDdlNjA5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt8111088"
      },
      "title": "The Mandalorian",
      "media_type": "series",
      "year": "2019",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNjgxZGM0OWUtZGY1MS00MWRmLTk2N2ItYjQyZTI1OThlZDliXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt4154756"
      },
      "title": "Avengers: Infinity War",
      "media_type": "movie",
      "year": "2018",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjMxNjY2MDU1OV5BMl5BanBnXkFtZTgwNzY1MTUwNTM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6791350"
      },
      "title": "Guardians of the Galaxy Vol. 3",
      "media_type": "movie",
      "year": "2023",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTJhOTMxMmItZmE0Ny00MDc3LWEzOGEtOGFkMzY4MWYyZDQ0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9140560"
      },
      "title": "WandaVision",
      "media_type": "series",
      "year": "2021",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZTMxMmM1ODItMTZiMS00NjI1LWEwODctMjQ4ZjY4ODliNDI0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt27419466"
      },
      "title": "Moana",
      "media_type": "movie",
      "year": "2026",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTQ1OTQ2Y2UtMzllNS00ODFiLWFkNGItNGRjOWRlMjIwNTRlXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt4520988"
      },
      "title": "Frozen II",
      "media_type": "movie",
      "year": "2019",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZTE1YjlmZjctNjIwNi00NDQ0LTlmMzgtYWZkY2RkZTMwNTdmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13622776"
      },
      "title": "Ahsoka",
      "media_type": "series",
      "year": "2023",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTM3MjVjZjUtYTEyMi00OTA5LWExMzEtYjhhYmEyYzMzNTBiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10234724"
      },
      "title": "Moon Knight",
      "media_type": "series",
      "year": "2022",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNDAzNmYwZjgtNDc3YS00ZDMyLTk0MjktMTg4MGNmNGU3MjlhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9114286"
      },
      "title": "Black Panther: Wakanda Forever",
      "media_type": "movie",
      "year": "2022",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWY5NDY1ZjItZDQxMy00MTAzLTgyOGQtNTQxYjFiMzZjMjUyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2953050"
      },
      "title": "Encanto",
      "media_type": "movie",
      "year": "2021",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNGEyNzk2M2MtNjBhZS00MzYwLWI0Y2YtYjc5ZWE2MjM0YWE5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt3501632"
      },
      "title": "Thor: Ragnarok",
      "media_type": "movie",
      "year": "2017",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjMyNDkzMzI1OF5BMl5BanBnXkFtZTgwODcxODg5MjI@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0371746"
      },
      "title": "Iron Man",
      "media_type": "movie",
      "year": "2008",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTczNTI2ODUwOF5BMl5BanBnXkFtZTcwMTU0NTIzMw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12324366"
      },
      "title": "Percy Jackson and the Olympians",
      "media_type": "series",
      "year": "2023",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMGUwOTQ0ZjMtYzA3NS00YWJiLWE3YzEtOGI1YzNkZGFlOWQ5XkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "movies": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt15398776"
      },
      "title": "Oppenheimer",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2JkMDc5MGQtZjg3YS00NmFiLWIyZmQtZTJmNTM5MjVmYTQ4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0816692"
      },
      "title": "Interstellar",
      "media_type": "movie",
      "year": "2014",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0468569"
      },
      "title": "The Dark Knight",
      "media_type": "movie",
      "year": "2008",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1375666"
      },
      "title": "Inception",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt15239678"
      },
      "title": "Dune: Part Two",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0172495"
      },
      "title": "Gladiator",
      "media_type": "movie",
      "year": "2000",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0110912"
      },
      "title": "Pulp Fiction",
      "media_type": "movie",
      "year": "1994",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0137523"
      },
      "title": "Fight Club",
      "media_type": "movie",
      "year": "1999",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0133093"
      },
      "title": "The Matrix",
      "media_type": "movie",
      "year": "1999",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6751668"
      },
      "title": "Parasite",
      "media_type": "movie",
      "year": "2019",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7286456"
      },
      "title": "Joker",
      "media_type": "movie",
      "year": "2019",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzY3OWQ5NDktNWQ2OC00ZjdlLThkMmItMDhhNDk3NTFiZGU4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9362722"
      },
      "title": "Spider-Man: Across the Spider-Verse",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNThiZjA3MjItZGY5Ni00ZmJhLWEwN2EtOTBlYTA4Y2E0M2ZmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0993846"
      },
      "title": "The Wolf of Wall Street",
      "media_type": "movie",
      "year": "2013",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1130884"
      },
      "title": "Shutter Island",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2FjNWExYzEtY2YzOC00YjNlLTllMTQtNmIwM2Q1YzBhOWM1XkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "series": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt0903747"
      },
      "title": "Breaking Bad",
      "media_type": "series",
      "year": "2008",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0944947"
      },
      "title": "Game of Thrones",
      "media_type": "series",
      "year": "2011",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNGYxOGJkMjItZjVkZC00OGEzLWExNjktOTZmNGZhZmRlMTk2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7366338"
      },
      "title": "Chernobyl",
      "media_type": "series",
      "year": "2019",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzU0OTI4YTQtNGQ1ZS00ZjA4LTg3MTMtZjkyZWNjN2RiZDJmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7660850"
      },
      "title": "Succession",
      "media_type": "series",
      "year": "2018",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTY4YTVkY2QtMjRmOS00YzliLWIxOWQtMTdkOTVkN2UzODNmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt3581920"
      },
      "title": "The Last of Us",
      "media_type": "series",
      "year": "2023",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWI3ODJlMzktY2U5NC00ZjdlLWE1MGItNWQxZDk3NWNjN2RhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2442560"
      },
      "title": "Peaky Blinders",
      "media_type": "series",
      "year": "2013",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOGM0NGY3ZmItOGE2ZC00OWIxLTk0N2EtZWY4Yzg3ZDlhNGI3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt3032476"
      },
      "title": "Better Call Saul",
      "media_type": "series",
      "year": "2015",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTAxOTQ0MjUzMzJeQTJeQWpwZ15BbWU4MDY0NTAxNzMx._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt11198330"
      },
      "title": "House of the Dragon",
      "media_type": "series",
      "year": "2022",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOWU2ZDA0M2EtNWEyYy00MWUwLWI4NjAtYzkxMDFjYzZkNGFiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2788316"
      },
      "title": "Shōgun",
      "media_type": "series",
      "year": "2024",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZmJkMDRjYzEtMWI3Ny00OWE3LWJlNTItMGQ1MTQzMzc3NDY5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2356777"
      },
      "title": "True Detective",
      "media_type": "series",
      "year": "2014",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjgwYzA1NWMtNDYyZi00ZGQyLWI5NTktMDYwZjE2OTIwZWEwXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt33043892"
      },
      "title": "Dexter: Resurrection",
      "media_type": "series",
      "year": "2025",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMWFmZDE2OTktOWY1Yi00ZTBiLWE3NWUtMzdmNTM1ZmQ0ZGQzXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt11280740"
      },
      "title": "Severance",
      "media_type": "series",
      "year": "2022",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDI5YzJhODQtMzQyNy00YWNmLWIxMjUtNDBjNjA5YWRjMzExXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2802850"
      },
      "title": "Fargo",
      "media_type": "series",
      "year": "2014",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjMzMTIzMTUwN15BMl5BanBnXkFtZTgwNjE0NTg0MTE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1475582"
      },
      "title": "Sherlock",
      "media_type": "series",
      "year": "2010",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjRhZDdjMDYtMTg5Yy00NGI4LWI3ZDgtYjNkNDc4MzJkNDRjXkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "action": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt10366206"
      },
      "title": "John Wick: Chapter 4",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BY2Q2ZmI5ZjUtNWVhMC00YzJkLTlmYjMtY2RmZDhkNzEzYjZhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1392190"
      },
      "title": "Mad Max: Fury Road",
      "media_type": "movie",
      "year": "2015",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDRkODJhOTgtOTc1OC00NTgzLTk4NjItNDgxZDY4YjlmNDY2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1745960"
      },
      "title": "Top Gun: Maverick",
      "media_type": "movie",
      "year": "2022",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt9603212"
      },
      "title": "Mission: Impossible - Dead Reckoning Part One",
      "media_type": "movie",
      "year": "2023",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2U4OTdmM2QtZTkxYy00ZmQyLTg2N2UtMDdmMGJmNDhlZDU1XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5433140"
      },
      "title": "Fast X",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzEwZjczOTktYzU1OS00YjJlLTgyY2UtNWEzODBlN2RjZDEwXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1877830"
      },
      "title": "The Batman",
      "media_type": "movie",
      "year": "2022",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMmU5NGJlMzAtMGNmOC00YjJjLTgyMzUtNjAyYmE4Njg5YWMyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12263384"
      },
      "title": "Extraction II",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZGQwNDdhODAtY2Y0Ni00YzFhLTk1OGUtY2RkMDAzNzBmZjAxXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt17024450"
      },
      "title": "The Equalizer 3",
      "media_type": "movie",
      "year": "2023",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTM1OTAyYmQtY2ZiZS00NTRlLWEyZDYtZWMyYjMyOTE2YWE4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12593682"
      },
      "title": "Bullet Train",
      "media_type": "movie",
      "year": "2022",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BODUyZjkxZDMtZGI3ZC00ZmEwLTgwMTUtYTU4OTQ5YjU4ZjRlXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt4154796"
      },
      "title": "Avengers: Endgame",
      "media_type": "movie",
      "year": "2019",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0172495"
      },
      "title": "Gladiator",
      "media_type": "movie",
      "year": "2000",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWQ4YmNjYjEtOWE1Zi00Y2U4LWI4NTAtMTU0MjkxNWQ1ZmJiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0381061"
      },
      "title": "Casino Royale",
      "media_type": "movie",
      "year": "2006",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMWQ1ZDM4NDktMWY0NC00MjcxLWJlMDMtNmE2MGVhYzRjMWQ0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6263850"
      },
      "title": "Deadpool & Wolverine",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1345836"
      },
      "title": "The Dark Knight Rises",
      "media_type": "movie",
      "year": "2012",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTk4ODQzNDY3Ml5BMl5BanBnXkFtZTcwODA0NTM4Nw@@._V1_.jpg"
    }
  ],
  "scifi": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt0816692"
      },
      "title": "Interstellar",
      "media_type": "movie",
      "year": "2014",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt15239678"
      },
      "title": "Dune: Part Two",
      "media_type": "movie",
      "year": "2024",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1856101"
      },
      "title": "Blade Runner 2049",
      "media_type": "movie",
      "year": "2017",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzA1Njg4NzYxOV5BMl5BanBnXkFtZTgwODk5NjU3MzI@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1375666"
      },
      "title": "Inception",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0133093"
      },
      "title": "The Matrix",
      "media_type": "movie",
      "year": "1999",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1630029"
      },
      "title": "Avatar: The Way of Water",
      "media_type": "movie",
      "year": "2022",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNWI0Y2NkOWEtMmM2OC00MjQ3LWI1YzItZGQxYzQ3NzI4NWZmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6723592"
      },
      "title": "Tenet",
      "media_type": "movie",
      "year": "2020",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTIzNDIxMzktMzlkMi00MmUyLWFmMjQtZDgwMjBmOGJmNTI3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2543164"
      },
      "title": "Arrival",
      "media_type": "movie",
      "year": "2016",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTExMzU0ODcxNDheQTJeQWpwZ15BbWU4MDE1OTI4MzAy._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt11858890"
      },
      "title": "The Creator",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDkxMTUxOTQtYzM4Yi00YzA2LTgzOTYtNDg2NTliODE0ZTRjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1677720"
      },
      "title": "Ready Player One",
      "media_type": "movie",
      "year": "2018",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzVkMTgzODQtMWIwZC00NzE4LTgzZjYtMzAwM2I5OGZhNjE4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1631867"
      },
      "title": "Edge of Tomorrow",
      "media_type": "movie",
      "year": "2014",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTc5OTk4MTM3M15BMl5BanBnXkFtZTgwODcxNjg3MDE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1136608"
      },
      "title": "District 9",
      "media_type": "movie",
      "year": "2009",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTM4OTI1OTM5NF5BMl5BanBnXkFtZTcwMzk5MTU1Mg@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12637874"
      },
      "title": "Fallout",
      "media_type": "series",
      "year": "2024",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYzE1MTZmY2ItMTgxNi00OGU5LTk4NTItMmY2ODFhYzhjZjRkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1104001"
      },
      "title": "Tron: Legacy",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTk4NTk4MTk1OF5BMl5BanBnXkFtZTcwNTE2MDIwNA@@._V1_.jpg"
    }
  ],
  "horror": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt1457767"
      },
      "title": "The Conjuring",
      "media_type": "movie",
      "year": "2013",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTM3NjA1NDMyMV5BMl5BanBnXkFtZTcwMDQzNDMzOQ@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1396484"
      },
      "title": "It",
      "media_type": "movie",
      "year": "2017",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZGZmOTZjNzUtOTE4OS00OGM3LWJiNGEtZjk4Yzg2M2Q1YzYxXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6644200"
      },
      "title": "A Quiet Place",
      "media_type": "movie",
      "year": "2018",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjI0MDMzNTQ0M15BMl5BanBnXkFtZTgwMTM5NzM3NDM@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt7784604"
      },
      "title": "Hereditary",
      "media_type": "movie",
      "year": "2018",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTEyZGQwODctYWJjZi00NjFmLTg3YmEtMzlhNjljOGZhMWMyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1922777"
      },
      "title": "Sinister",
      "media_type": "movie",
      "year": "2012",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjI5MTg1Njg0Ml5BMl5BanBnXkFtZTcwNzg2Mjc4Nw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt15474916"
      },
      "title": "Smile",
      "media_type": "movie",
      "year": "2022",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNjFhMzBlNzktMjE2Ni00YTMyLWI2YWUtYmM1N2QxMDQwZmZhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10638522"
      },
      "title": "Talk to Me",
      "media_type": "movie",
      "year": "2022",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BY2I2NzJmY2YtYTM3Ni00ZGJhLThkZTItODFhMzhlZjZkMDQ5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1591095"
      },
      "title": "Insidious",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTYyOTAxMDA0OF5BMl5BanBnXkFtZTcwNzgwNTc1NA@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10160976"
      },
      "title": "The Nun II",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNmJkYWIyYWYtNWVhZi00ZTkyLWExMTktZWUzNGE1MjNlNjQ0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0077651"
      },
      "title": "Halloween",
      "media_type": "movie",
      "year": "1978",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMzZiNTdiYTgtYjNkMS00MmJmLWEwZGQtNmY0NGJkMGE0YmYzXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5052448"
      },
      "title": "Get Out",
      "media_type": "movie",
      "year": "2017",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjUxMDQwNjcyNl5BMl5BanBnXkFtZTgwNzcwMzc0MTI@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt8760708"
      },
      "title": "M3GAN",
      "media_type": "movie",
      "year": "2022",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjU1ZWMxYTUtNzQ1ZC00ZTcxLTg0NTMtMzY1ZmQyZjhmYjMyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13345606"
      },
      "title": "Evil Dead Rise",
      "media_type": "movie",
      "year": "2023",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjM1ZmViMmYtOGYzZC00YzhmLWE0MTMtMzNjYzcyNjEwYWRkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt8350360"
      },
      "title": "Annabelle Comes Home",
      "media_type": "movie",
      "year": "2019",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjRjYmQ5NTQtYzIyNi00MmNlLTlmNjYtNjQ3NzRlZmY3YjFlXkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "anime": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt9335498"
      },
      "title": "Demon Slayer: Kimetsu no Yaiba",
      "media_type": "series",
      "year": "2019",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMWU1OGEwNmQtNGM3MS00YTYyLThmYmMtN2FjYzQzNzNmNTE0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt2560140"
      },
      "title": "Attack on Titan",
      "media_type": "series",
      "year": "2013",
      "rating": "8.9",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZjliODY5MzQtMmViZC00MTZmLWFhMWMtMjMwM2I3OGY1MTRiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12343534"
      },
      "title": "Jujutsu Kaisen",
      "media_type": "series",
      "year": "2020",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjBlNTExMDAtMWZjZi00MDc5LWFkMjgtZDU0ZWQ5ODk3YWY5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0877057"
      },
      "title": "Death Note",
      "media_type": "series",
      "year": "2006",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTgyZDhmMTEtZDFhNi00MTc4LTg3NjUtYWJlNGE5Mzk2NzMxXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13616990"
      },
      "title": "Chainsaw Man",
      "media_type": "series",
      "year": "2022",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZGY2ZTM2MWMtNzA2OS00ZjJlLWIwZTMtMDBhN2EwYjZjZjEyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt21209876"
      },
      "title": "Solo Leveling",
      "media_type": "series",
      "year": "2024",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BM2M4YzdkMTEtMjUyYy00ZWY0LWI5ODQtNGRkZWQ1MzU5MWM2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0988824"
      },
      "title": "Naruto: Shippuden",
      "media_type": "series",
      "year": "2007",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTk3MDA1ZjAtNTRhYS00YzNiLTgwOGEtYWRmYTQ3NjA0NTAwXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0434665"
      },
      "title": "Bleach",
      "media_type": "series",
      "year": "2004",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOWQwOWY5NTUtMjAyZi00YjQzLTkwODgtNmQwZjU1MGIzZDhjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0388629"
      },
      "title": "One Piece",
      "media_type": "series",
      "year": "1999",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTNjNGU4NTUtYmVjMy00YjRiLTkxMWUtNzZkMDNiYjZhNmViXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0245429"
      },
      "title": "Spirited Away",
      "media_type": "movie",
      "year": "2001",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTEyNmEwOWUtYzkyOC00ZTQ4LTllZmUtMjk0Y2YwOGUzYjRiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5311514"
      },
      "title": "Your Name.",
      "media_type": "movie",
      "year": "2016",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjI1ODZkYTgtYTY3Yy00ZTJkLWFkOTgtZDUyYWM4MzQwNjk0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5626028"
      },
      "title": "My Hero Academia",
      "media_type": "series",
      "year": "2016",
      "rating": "9.0",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BY2QzODA5OTQtYWJlNi00ZjIzLThhNTItMDMwODhlYzYzMjA2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13706018"
      },
      "title": "Spy x Family",
      "media_type": "series",
      "year": "2022",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDkwNjc0NWEtNzJlOC00N2YwLTk4MjktZGFlZDE2Y2QzOWI0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt3741634"
      },
      "title": "Tokyo Ghoul",
      "media_type": "series",
      "year": "2014",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYmU0ODU1MzItYzA4Yi00NjI1LWIxNWQtYmRiMTkxNGQ2Mjk1XkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "kdrama": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt10919420"
      },
      "title": "Squid Game",
      "media_type": "series",
      "year": "2021",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDcxYjg1OTctYmUxZi00ZjhjLWIwNTMtNmI2M2Y4OTU1YWU2XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt27668559"
      },
      "title": "Queen of Tears",
      "media_type": "series",
      "year": "2024",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNWNmYmQ2NzctNTA1NS00NGU2LThjOTQtYTgxNmUyYmNjODYyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10850932"
      },
      "title": "Crash Landing on You",
      "media_type": "series",
      "year": "2019",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZmRkNzAzODItZmI5OS00NzU0LWIwZjEtYjhiMTkyMzIwZDVjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt14169960"
      },
      "title": "All of Us Are Dead",
      "media_type": "series",
      "year": "2022",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDY4ZmZhNzMtNjdkMC00NTE3LWFjYzQtOGE4OTllOGY1NTk5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt21344706"
      },
      "title": "The Glory",
      "media_type": "series",
      "year": "2022",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BODM0ZTc5YTAtZmMxNi00YzJkLWEzODItZDczZTRlNTc1NGE3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt13433812"
      },
      "title": "Vincenzo",
      "media_type": "series",
      "year": "2021",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDk5ZTY1ZWMtYzY0MC00MmRkLTlmYjYtZTA4ZDYxNWNjZDVkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt14819828"
      },
      "title": "Business Proposal",
      "media_type": "series",
      "year": "2022",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWM2NTM4MTktNDFiNi00NTI3LThiZTgtZmJiZTQ2NzdhNDE3XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt11239552"
      },
      "title": "Itaewon Class",
      "media_type": "series",
      "year": "2020",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjVjYjMzNjMtZDBjYy00NmE2LTlmMDEtZDZhY2Q5MGMzNTExXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt12940504"
      },
      "title": "My Name",
      "media_type": "series",
      "year": "2021",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2ZiZWU3MzMtNGM5OC00ZWVkLTkxNjUtMTYwZGU4MzgxYzk0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt11612120"
      },
      "title": "Sweet Home",
      "media_type": "series",
      "year": "2020",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDE0MTM5YjgtMzNhOS00NWE2LTkxN2EtMzg0NWRmODBmMDA5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10220588"
      },
      "title": "Hotel Del Luna",
      "media_type": "series",
      "year": "2019",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZmFmYTU0YTItZTk4ZS00ZWMzLThmOTgtOGIyOTBkY2QwZjc0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt24640580"
      },
      "title": "Moving",
      "media_type": "series",
      "year": "2023",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNTg4NTI5NmItNGJjNC00ZmFhLTg0NzctZWQxZjAzYTAyNTQwXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt5700672"
      },
      "title": "Train to Busan",
      "media_type": "movie",
      "year": "2016",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BODA3OTM4NWQtMjU1OS00NzA2LTlhZDAtYjU2YjM5MWUxNTdiXkEyXkFqcGc@._V1_.jpg"
    }
  ],
  "comedy": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt1119646"
      },
      "title": "The Hangover",
      "media_type": "movie",
      "year": "2009",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNDI2MzBhNzgtOWYyOS00NDM2LWE0OGYtOGQ0M2FjMTI2NTllXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0829482"
      },
      "title": "Superbad",
      "media_type": "movie",
      "year": "2007",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNjk0MzdlZGEtNTRkOC00ZDRiLWJkYjAtMzUzYTRiNzk1YTViXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt10986410"
      },
      "title": "Ted Lasso",
      "media_type": "series",
      "year": "2020",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BM2ZlYTU0YWUtMzY4OC00N2JkLTk1ZGQtN2UxNWJhMTBkMzM4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1232829"
      },
      "title": "21 Jump Street",
      "media_type": "movie",
      "year": "2012",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTg2NjJiODctM2IyMS00MmQ5LWI1YmQtNTBjMTI4M2U2YzA5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1723121"
      },
      "title": "We're the Millers",
      "media_type": "movie",
      "year": "2013",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNDQ0NWI1ZGEtY2NlMy00MWYyLTk4NGEtMTY5MmQ4YTcyY2E0XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6264654"
      },
      "title": "Free Guy",
      "media_type": "movie",
      "year": "2021",
      "rating": "8.6",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2I0MGMxYjUtZTZiMS00MzMxLTkzNWYtMDUyZmUwY2ViYTljXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1375670"
      },
      "title": "Grown Ups",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjA0ODYwNzU5Nl5BMl5BanBnXkFtZTcwNTI1MTgxMw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0838283"
      },
      "title": "Step Brothers",
      "media_type": "movie",
      "year": "2008",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYWNiOGZkOTgtNGMzMC00MDg5LTliM2UtN2VjMDI3N2ViOWE5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1489889"
      },
      "title": "Central Intelligence",
      "media_type": "movie",
      "year": "2016",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjA2NzEzNjIwNl5BMl5BanBnXkFtZTgwNzgwMTEzNzE@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt8946378"
      },
      "title": "Knives Out",
      "media_type": "movie",
      "year": "2019",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BZDU5ZTRkYmItZjg0Mi00ZTQwLThjMWItNWM3MTMxMzVjZmVjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0109686"
      },
      "title": "Dumb and Dumber",
      "media_type": "movie",
      "year": "1994",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNGQxZDA1MmMtYWQ1Ni00NTJmLTljMjgtZWVmODllODVhMzgyXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0377092"
      },
      "title": "Mean Girls",
      "media_type": "movie",
      "year": "2004",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjE1MDQ4MjI1OV5BMl5BanBnXkFtZTcwNzcwODAzMw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1499658"
      },
      "title": "Horrible Bosses",
      "media_type": "movie",
      "year": "2011",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNzYxNDI5Njc5NF5BMl5BanBnXkFtZTcwMDUxODE1NQ@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0993846"
      },
      "title": "The Wolf of Wall Street",
      "media_type": "movie",
      "year": "2013",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjIxMjgxNTk0MF5BMl5BanBnXkFtZTgwNjIyOTg2MDE@._V1_.jpg"
    }
  ],
  "toprated": [
    {
      "id": {
        "provider": "imdb",
        "value": "tt0111161"
      },
      "title": "The Shawshank Redemption",
      "media_type": "movie",
      "year": "1994",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0068646"
      },
      "title": "The Godfather",
      "media_type": "movie",
      "year": "1972",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNGEwYjgwOGQtYjg5ZS00Njc1LTk2ZGEtM2QwZWQ2NjdhZTE5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0468569"
      },
      "title": "The Dark Knight",
      "media_type": "movie",
      "year": "2008",
      "rating": "8.8",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0050083"
      },
      "title": "12 Angry Men",
      "media_type": "movie",
      "year": "1957",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0108052"
      },
      "title": "Schindler's List",
      "media_type": "movie",
      "year": "1993",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNjM1ZDQxYWUtMzQyZS00MTE1LWJmZGYtNGUyNTdlYjM3ZmVmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0167260"
      },
      "title": "The Lord of the Rings: The Return of the King",
      "media_type": "movie",
      "year": "2003",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0110912"
      },
      "title": "Pulp Fiction",
      "media_type": "movie",
      "year": "1994",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYTViYTE3ZGQtNDBlMC00ZTAyLTkyODMtZGRiZDg0MjA2YThkXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0137523"
      },
      "title": "Fight Club",
      "media_type": "movie",
      "year": "1999",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BOTgyOGQ1NDItNGU3Ny00MjU3LTg2YWEtNmEyYjBiMjI1Y2M5XkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0109830"
      },
      "title": "Forrest Gump",
      "media_type": "movie",
      "year": "1994",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BNDYwNzVjMTItZmU5YS00YjQ5LTljYjgtMjY2NDVmYWMyNWFmXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0099685"
      },
      "title": "GoodFellas",
      "media_type": "movie",
      "year": "1990",
      "rating": "8.4",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2E5NzI2ZGMtY2VjNi00YTRjLWI1MDUtZGY5OWU1MWJjZjRjXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt1375666"
      },
      "title": "Inception",
      "media_type": "movie",
      "year": "2010",
      "rating": "8.7",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0133093"
      },
      "title": "The Matrix",
      "media_type": "movie",
      "year": "1999",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BN2NmN2VhMTQtMDNiOS00NDlhLTliMjgtODE2ZTY0ODQyNDRhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt6751668"
      },
      "title": "Parasite",
      "media_type": "movie",
      "year": "2019",
      "rating": "9.1",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BYjk1Y2U4MjQtY2ZiNS00OWQyLWI3MmYtZWUwNmRjYWRiNWNhXkEyXkFqcGc@._V1_.jpg"
    },
    {
      "id": {
        "provider": "imdb",
        "value": "tt0114369"
      },
      "title": "Seven",
      "media_type": "movie",
      "year": "1995",
      "rating": "8.5",
      "poster_url": "https://m.media-amazon.com/images/M/MV5BY2IzNzMxZjctZjUxZi00YzAxLTk3ZjMtODFjODdhMDU5NDM1XkEyXkFqcGc@._V1_.jpg"
    }
  ]
};

  const DEFAULT_SPORTS_CHANNELS = [
    { name: 'Sky Sports Premier League HD', url: 'https://fl01.topembed.pw/live/skysp_pl/playlist.m3u8', sport: 'Football' },
    { name: 'Willow Cricket HD (Live Matches)', url: 'https://fl01.topembed.pw/live/willow_hd/playlist.m3u8', sport: 'Cricket' },
    { name: 'TNT Sports 1 (Champions League)', url: 'https://fl01.topembed.pw/live/btsp1/playlist.m3u8', sport: 'Football' },
    { name: 'Sky Sports F1 HD (Grand Prix)', url: 'https://fl01.topembed.pw/live/skysp_f1/playlist.m3u8', sport: 'Formula 1' },
    { name: 'Star Sports 1 Hindi / English HD', url: 'https://fl01.topembed.pw/live/star1_in/playlist.m3u8', sport: 'Cricket' },
    { name: 'ESPN Live Sports USA HD', url: 'https://fl01.topembed.pw/live/espn_us/playlist.m3u8', sport: 'Sports' }
  ];

  // ==========================================================================
  // HIGH-FIDELITY BUILT-IN FALLBACK CATALOG (30+ REAL TMDB TITLES)
  // Ensures Homepage Rows Are NEVER Blank Under Any Network / API Constraint
  // ==========================================================================
  const FALLBACK_TMDB_CATALOG = {
  "trending": [
    {
      "id": {
        "provider": "tmdb",
        "value": "1368337"
      },
      "tmdb_id": "1368337",
      "title": "The Odyssey",
      "year": "2026",
      "rating": 8.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
      "tag": "Trending",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "76600"
      },
      "tmdb_id": "76600",
      "title": "Avatar: The Way of Water",
      "year": "2022",
      "rating": 7.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
      "tag": "Trending",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "299536"
      },
      "tmdb_id": "299536",
      "title": "Avengers: Infinity War",
      "year": "2018",
      "rating": 8.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg",
      "tag": "Trending",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "533535"
      },
      "tmdb_id": "533535",
      "title": "Deadpool & Wolverine",
      "year": "2024",
      "rating": 7.7,
      "poster_url": "https://image.tmdb.org/t/p/w500/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
      "tag": "Trending",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1300968"
      },
      "tmdb_id": "1300968",
      "title": "The Hunger Games: Sunrise on the Reaping",
      "year": "2026",
      "rating": 7.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/jNcZH8yplxttRlf0wwqfGGMKHxX.jpg",
      "backdrop_path": "/aqFZcr2dxSZ2UwWSo1WC6C0rwDf.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1003596"
      },
      "tmdb_id": "1003596",
      "title": "Avengers: Doomsday",
      "year": "2026",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/1zqWkLwC1zLBBBtIWzmkmWeMWnT.jpg",
      "backdrop_path": "/9N21RJNwDuYJP5M0Of3mN4xG3IA.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "84773"
      },
      "tmdb_id": "84773",
      "title": "The Lord of the Rings: The Rings of Power",
      "year": "2022",
      "rating": 7.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/bMXWXKM9ydUmMTNvDnYo9QtCBRt.jpg",
      "backdrop_path": "/i1phX1JpaqSnHBBGta6LBFYVCZq.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "291507"
      },
      "tmdb_id": "291507",
      "title": "The Body",
      "year": "2026",
      "rating": 7.9,
      "poster_url": "https://image.tmdb.org/t/p/w500/zleCYDRbW5mKwgZwVK4SNIrKXWx.jpg",
      "backdrop_path": "/hYJqUoXRZnodGxgVZTM8uwr5kbC.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1185344"
      },
      "tmdb_id": "1185344",
      "title": "The Beast",
      "year": "2026",
      "rating": 5.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/ocg5JfJP19fodcv5uQUApkmZMdI.jpg",
      "backdrop_path": "/r5RYEmZzm1Z6imS7XfiKPnMlyc7.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "213375"
      },
      "tmdb_id": "213375",
      "title": "VisionQuest",
      "year": "2026",
      "rating": 8.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/WGyAyBPncfuu8MZhLY9RtfZPM0.jpg",
      "backdrop_path": "/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "254630"
      },
      "tmdb_id": "254630",
      "title": "12 12 12",
      "year": "2026",
      "rating": 6.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/8q6BvFQuKM1Rud4E9NQDaMGy9EL.jpg",
      "backdrop_path": "/tjy25xpiFeo2gahl7N0hoxbRtG7.jpg",
      "media_type": "tv",
      "original_language": "en"
    }
  ],
  "english": [
    {
      "id": {
        "provider": "tmdb",
        "value": "693134"
      },
      "tmdb_id": "693134",
      "title": "Dune: Part Two",
      "year": "2024",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      "tag": "English",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "917496"
      },
      "tmdb_id": "917496",
      "title": "Beetlejuice Beetlejuice",
      "year": "2024",
      "rating": 7.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/kKgQzkUCUmgnqzAzJJflYRoAeQX.jpg",
      "tag": "English",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "558449"
      },
      "tmdb_id": "558449",
      "title": "Gladiator II",
      "year": "2024",
      "rating": 7.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg",
      "tag": "English",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "653346"
      },
      "tmdb_id": "653346",
      "title": "Kingdom of the Planet of the Apes",
      "year": "2024",
      "rating": 7.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/gKkl37BQuKTanygYQG1pyYgLVgf.jpg",
      "tag": "English",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1368337"
      },
      "tmdb_id": "1368337",
      "title": "The Odyssey",
      "year": "2026",
      "rating": 8.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/5rhTDKUhPYvpdQIijFIs5VoWsON.jpg",
      "backdrop_path": "/c7btGYblBnfAaw713WvFM0Kimc7.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1263337"
      },
      "tmdb_id": "1263337",
      "title": "Heart of the Beast",
      "year": "2026",
      "rating": 7.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/6sYemVUn79UPKz1ZsSG6kPU4RVy.jpg",
      "backdrop_path": "/yE766yhgg98tKwTKd8CyNvAtmn6.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1400837"
      },
      "tmdb_id": "1400837",
      "title": "Other Mommy",
      "year": "2026",
      "rating": 6.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/fGRNCssTRrhYZxNzykGGCoMsAVq.jpg",
      "backdrop_path": "/smZ8BT4Vzw4iCEppTLCnN8jNYtn.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1423191"
      },
      "tmdb_id": "1423191",
      "title": "Resident Evil",
      "year": "2026",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/gAgWJhUSQWCgtKR8170nMkYlBda.jpg",
      "backdrop_path": "/3icyRAqgakNcQn6aDVz9libFmBA.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "969681"
      },
      "tmdb_id": "969681",
      "title": "Spider-Man: Brand New Day",
      "year": "2026",
      "rating": 8.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/bjiS5ipwxb9JFy3XRRN4OAilSeX.jpg",
      "backdrop_path": "/r08LxMJCbf1SiJIWeyH9aJmdqwC.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1300968"
      },
      "tmdb_id": "1300968",
      "title": "The Hunger Games: Sunrise on the Reaping",
      "year": "2026",
      "rating": 7.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/jNcZH8yplxttRlf0wwqfGGMKHxX.jpg",
      "backdrop_path": "/aqFZcr2dxSZ2UwWSo1WC6C0rwDf.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "687163"
      },
      "tmdb_id": "687163",
      "title": "Project Hail Mary",
      "year": "2026",
      "rating": 8.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/iOb2fjXLbpJgyQXe46n1WtGCnaa.jpg",
      "backdrop_path": "/2I1OFQJ0L9T0dpU6FobKFWV2PxX.jpg",
      "media_type": "movie",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1813355"
      },
      "tmdb_id": "1813355",
      "title": "A Story of Derry",
      "year": "2026",
      "rating": 6.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/4PtzGcegF5Po1NmDAW9IklyvAUh.jpg",
      "backdrop_path": "/z26LxXDMmAIzKr06FPDudCJyvsM.jpg",
      "media_type": "movie",
      "original_language": "en"
    }
  ],
  "hindi": [
    {
      "id": {
        "provider": "tmdb",
        "value": "1084736"
      },
      "tmdb_id": "1084736",
      "title": "Stree 2",
      "year": "2024",
      "rating": 7.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/m2zxbOiTsvN9aK37cKk18V1d6K3.jpg",
      "tag": "Hindi",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "872585"
      },
      "tmdb_id": "872585",
      "title": "Oppenheimer (Hindi)",
      "year": "2023",
      "rating": 8.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      "tag": "Hindi",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "786892"
      },
      "tmdb_id": "786892",
      "title": "Fighter",
      "year": "2024",
      "rating": 7.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/zDZowwb9STn4o4r0a0aK0qF5q8U.jpg",
      "tag": "Hindi",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "823464"
      },
      "tmdb_id": "823464",
      "title": "Kalki 2898 AD",
      "year": "2024",
      "rating": 7.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/fa7mK5qJc61aF9M1Qp3v5X9Lg9p.jpg",
      "tag": "Hindi",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "656908"
      },
      "tmdb_id": "656908",
      "title": "Ramayana: Rise of a Legend",
      "year": "2026",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/vBQ7wks68OhJKlb3RnXSl2yXBXK.jpg",
      "backdrop_path": "/yHVZncPRZr63mezRX20IyKLrSkv.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1453407"
      },
      "tmdb_id": "1453407",
      "title": "Gajab Raat",
      "year": "2026",
      "rating": 6.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/e4N7M52cBbyi24xLga8yI6yt1u1.jpg",
      "backdrop_path": "/8I4YFWgi9IZW4VUi398A0BqLnm.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1389172"
      },
      "tmdb_id": "1389172",
      "title": "Reporting Live",
      "year": "2026",
      "rating": 7.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/xVabS4lTi6IMscr2FOucxydE6ZD.jpg",
      "backdrop_path": "/faJB8DXU0LXwq5ebMLj5drz8S4N.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1215889"
      },
      "tmdb_id": "1215889",
      "title": "Daayra",
      "year": "2026",
      "rating": 6.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/eAsR8oCZGCOqaxDVt0c0WrRFjrn.jpg",
      "backdrop_path": "/rbwmf04kpX1o3zbbOS6Y7woF2Ku.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1493572"
      },
      "tmdb_id": "1493572",
      "title": "Parivarik ManuRanjan",
      "year": "2026",
      "rating": 5.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/2gKGkD0pN2Ss9LrHA6tv5hEjHOs.jpg",
      "backdrop_path": "/9j9DtcTGSSZJVrimys2emN5kVh3.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "19404"
      },
      "tmdb_id": "19404",
      "title": "Dilwale Dulhania Le Jayenge",
      "year": "1995",
      "rating": 8.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/lfRkUr7DYdHldAqi3PwdQGBRBPM.jpg",
      "backdrop_path": "/7VDLEHli74eLsYLNcq9djn1Gw76.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1291608"
      },
      "tmdb_id": "1291608",
      "title": "Dhurandhar",
      "year": "2025",
      "rating": 7.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/8FHOtUpNIk5ZPEay2N2EY5lrxkv.jpg",
      "backdrop_path": "/snYOXem8pUGOffnLbbGq4aB1pg4.jpg",
      "media_type": "movie",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1582770"
      },
      "tmdb_id": "1582770",
      "title": "Dhurandhar: The Revenge",
      "year": "2026",
      "rating": 7.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/ov8vrRLZGoXHpYjSY9Vpv1tHJX7.jpg",
      "backdrop_path": "/br4Ra4dRpvR0R7a1zPPkOwGkcky.jpg",
      "media_type": "movie",
      "original_language": "hi"
    }
  ],
  "kannada": [
    {
      "id": {
        "provider": "tmdb",
        "value": "785084"
      },
      "tmdb_id": "785084",
      "title": "KGF: Chapter 2",
      "year": "2022",
      "rating": 7.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/kh9j1pD6B77a28Z2c6z8Fq67bA8.jpg",
      "tag": "Kannada",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1004021"
      },
      "tmdb_id": "1004021",
      "title": "Kantara",
      "year": "2022",
      "rating": 8.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/5k7mZgC3fD7f8bZ3zL9jB5vD7kY.jpg",
      "tag": "Kannada",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "853521"
      },
      "tmdb_id": "853521",
      "title": "777 Charlie",
      "year": "2022",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/2L3A3mY5zB8uK7vF6p3xK7aP8o9.jpg",
      "tag": "Kannada",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "939243"
      },
      "tmdb_id": "939243",
      "title": "Toxic",
      "year": "2026",
      "rating": 7.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/5RTd3YCLWbEhbe9OXRuNX3pbT5U.jpg",
      "tag": "Kannada",
      "media_type": "movie"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1735270"
      },
      "tmdb_id": "1735270",
      "title": "Premada Oorali",
      "year": "2026",
      "rating": 4.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/wJsUmiwuZ9eKnOiYLAVk8THFk7i.jpg",
      "backdrop_path": "/r22LSVD46wOY3rkavnM4gWc3sz2.jpg",
      "media_type": "movie",
      "original_language": "kn"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1083637"
      },
      "tmdb_id": "1083637",
      "title": "Kantara - A Legend: Chapter 1",
      "year": "2025",
      "rating": 7.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/hCxdcaRK6jmwnwjitYRejVCU1P0.jpg",
      "backdrop_path": "/w57nxiBIODAYHLRs1xmrCY9zEFe.jpg",
      "media_type": "movie",
      "original_language": "kn"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "564147"
      },
      "tmdb_id": "564147",
      "title": "K.G.F: Chapter 1",
      "year": "2018",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/ltHlJwvxKv7d0ooCiKSAvfwV9tX.jpg",
      "backdrop_path": "/4i1ofsSpfTuswHXcgPtXbZrSnoe.jpg",
      "media_type": "movie",
      "original_language": "kn"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "587412"
      },
      "tmdb_id": "587412",
      "title": "K.G.F: Chapter 2",
      "year": "2022",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/khNVygolU0TxLIDWff5tQlAhZ23.jpg",
      "backdrop_path": "/nsV5Mfi9FAV4w8eDsdr7uqVswOk.jpg",
      "media_type": "movie",
      "original_language": "kn"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "962640"
      },
      "tmdb_id": "962640",
      "title": "K.G.F: Chapter 3",
      "year": "2024",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/ex2zyM6LVd31h9TlAi9RaR7QARK.jpg",
      "backdrop_path": null,
      "media_type": "movie",
      "original_language": "kn"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1103473"
      },
      "tmdb_id": "1103473",
      "title": "KD \u2013 The Devil",
      "year": "2026",
      "rating": 5.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/nEuEMJrnLBneE9tJlmzbhCFLu95.jpg",
      "backdrop_path": "/cNvaYDnGSfmOFi2yGnOmRIM5pce.jpg",
      "media_type": "movie",
      "original_language": "kn"
    }
  ],
  "netflix": [
    {
      "id": {
        "provider": "tmdb",
        "value": "66732"
      },
      "tmdb_id": "66732",
      "title": "Stranger Things",
      "year": "2016",
      "rating": 8.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      "tag": "Netflix",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "119051"
      },
      "tmdb_id": "119051",
      "title": "Wednesday",
      "year": "2022",
      "rating": 8.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/9PFonBhy4cQy7Jz20NpMygczOkv.jpg",
      "tag": "Netflix",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "93405"
      },
      "tmdb_id": "93405",
      "title": "Squid Game",
      "year": "2021",
      "rating": 7.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/dDlG1T8v4oO7xP9bJ9zN2YgQ1kZ.jpg",
      "tag": "Netflix",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "111110"
      },
      "tmdb_id": "111110",
      "title": "One Piece (Live Action)",
      "year": "2023",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/fcXdJUSDiDiFnbUQ9Ki4vMm99u4.jpg",
      "tag": "Netflix",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "63333"
      },
      "tmdb_id": "63333",
      "title": "The Last Kingdom",
      "year": "2015",
      "rating": 8.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/8eJf0hxgIhE6QSxbtuNCekTddy1.jpg",
      "backdrop_path": "/QbtctI8EzlhsyFDMUMyG3fli8B.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "4656"
      },
      "tmdb_id": "4656",
      "title": "Raw",
      "year": "1993",
      "rating": 6.7,
      "poster_url": "https://image.tmdb.org/t/p/w500/fstEe6RsyNyPUnMwNcL20iNl0nE.jpg",
      "backdrop_path": "/ykWWT8FAChBffNxcDzoJMCK9LBb.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "65494"
      },
      "tmdb_id": "65494",
      "title": "The Crown",
      "year": "2016",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/1M876KPjulVwppEpldhdc8V4o68.jpg",
      "backdrop_path": "/8VXhcrl5z2I1zEU9X3pkkNrZlD.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "291507"
      },
      "tmdb_id": "291507",
      "title": "The Body",
      "year": "2026",
      "rating": 7.9,
      "poster_url": "https://image.tmdb.org/t/p/w500/zleCYDRbW5mKwgZwVK4SNIrKXWx.jpg",
      "backdrop_path": "/hYJqUoXRZnodGxgVZTM8uwr5kbC.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "15226"
      },
      "tmdb_id": "15226",
      "title": "C.I.D.",
      "year": "1998",
      "rating": 5.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/3UymnlLfLMKxG8OcFhSnAlnhQfZ.jpg",
      "backdrop_path": "/1gZrOa2E9DOohEvSLLBJqus2zGu.jpg",
      "media_type": "tv",
      "original_language": "hi"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "67744"
      },
      "tmdb_id": "67744",
      "title": "MINDHUNTER",
      "year": "2017",
      "rating": 8.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/fbKE87mojpIETWepSbD5Qt741fp.jpg",
      "backdrop_path": "/lpDVJuIro21gtMj9iXMFKHuroZN.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "65701"
      },
      "tmdb_id": "65701",
      "title": "Good Mythical Morning",
      "year": "2012",
      "rating": 6.9,
      "poster_url": "https://image.tmdb.org/t/p/w500/jMpBQr2aNOFAI6wsC47zsOG6qOh.jpg",
      "backdrop_path": "/hvFCS0dMeC3ffiF4uYTKzUAkvYL.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1424"
      },
      "tmdb_id": "1424",
      "title": "Orange Is the New Black",
      "year": "2013",
      "rating": 7.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/ekaa7YjGPTkFLcPhwWXTnARuCEU.jpg",
      "backdrop_path": "/zJiWhsEYCy5BkFCBONoMnUunyZQ.jpg",
      "media_type": "tv",
      "original_language": "en"
    }
  ],
  "prime": [
    {
      "id": {
        "provider": "tmdb",
        "value": "76479"
      },
      "tmdb_id": "76479",
      "title": "The Boys",
      "year": "2019",
      "rating": 8.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/2zmTngn1tYC1AvfnNDBpQI4r1fB.jpg",
      "tag": "Prime",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "108978"
      },
      "tmdb_id": "108978",
      "title": "Reacher",
      "year": "2022",
      "rating": 8.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/j7uBDwCKnSp1T7c0A2L7n9V3k1a.jpg",
      "tag": "Prime",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "106379"
      },
      "tmdb_id": "106379",
      "title": "Fallout",
      "year": "2024",
      "rating": 8.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/AnsZu4h8p3F2Q1l2LzG2vK1Q6m7.jpg",
      "tag": "Prime",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "84773"
      },
      "tmdb_id": "84773",
      "title": "The Lord of the Rings: The Rings of Power",
      "year": "2022",
      "rating": 7.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/bMXWXKM9ydUmMTNvDnYo9QtCBRt.jpg",
      "tag": "Prime",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "253376"
      },
      "tmdb_id": "253376",
      "title": "The Girlfriend",
      "year": "2025",
      "rating": 7.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/ktrp3tdZ5IQpFux4nLy8z70bt3n.jpg",
      "backdrop_path": "/lnVWmFvLv2pTZGsuAJytiqKu541.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "194766"
      },
      "tmdb_id": "194766",
      "title": "The Summer I Turned Pretty",
      "year": "2022",
      "rating": 8.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/xBIz53wYWsKfFpN0TaizVAjKJ0z.jpg",
      "backdrop_path": "/jCQV3rHNbgHKo3N4G6CARbVEjPV.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "85077"
      },
      "tmdb_id": "85077",
      "title": "The Chosen",
      "year": "2019",
      "rating": 8.9,
      "poster_url": "https://image.tmdb.org/t/p/w500/nr0r7YTn1l84KLG1iCSO5ofHTvO.jpg",
      "backdrop_path": "/2YQFwn9aF7huTFHxn9lFTAn14F.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "303044"
      },
      "tmdb_id": "303044",
      "title": "Campus Drivers",
      "year": "2026",
      "rating": 7.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/kTgV6VLp70QOBpCZqvEuTWAA4Ng.jpg",
      "backdrop_path": "/oaWJm4brEMSWBmQIB73DFxsU683.jpg",
      "media_type": "tv",
      "original_language": "fr"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "44217"
      },
      "tmdb_id": "44217",
      "title": "Vikings",
      "year": "2013",
      "rating": 8.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/bQLrHIRNEkE3PdIWQrZHynQZazu.jpg",
      "backdrop_path": "/13kblIK8DnxMurcRDkeyy2sGR7v.jpg",
      "media_type": "tv",
      "original_language": "en"
    }
  ],
  "disney": [
    {
      "id": {
        "provider": "tmdb",
        "value": "84958"
      },
      "tmdb_id": "84958",
      "title": "Loki",
      "year": "2021",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/voHUmlvjysv923xaoE3q25T0k2d.jpg",
      "tag": "Disney+",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "82856"
      },
      "tmdb_id": "82856",
      "title": "The Mandalorian",
      "year": "2019",
      "rating": 8.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/eU1i6eHXlzMOlEq0ku1R07Y8vun.jpg",
      "tag": "Disney+",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "88396"
      },
      "tmdb_id": "88396",
      "title": "The Falcon and the Winter Soldier",
      "year": "2021",
      "rating": 7.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/6kbAMLteGO8yyewYau6bJ683sw7.jpg",
      "tag": "Disney+",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "114472"
      },
      "tmdb_id": "114472",
      "title": "Secret Invasion",
      "year": "2023",
      "rating": 7.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/f5JggRLJS205k01Z5q8a4g2qQ9Z.jpg",
      "tag": "Disney+",
      "media_type": "tv"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "279246"
      },
      "tmdb_id": "279246",
      "title": "The Remarried Empress",
      "year": "2026",
      "rating": 8.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/zn3IXZzGavH3qle3o3g1r32eXDy.jpg",
      "backdrop_path": "/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "213375"
      },
      "tmdb_id": "213375",
      "title": "VisionQuest",
      "year": "2026",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/WGyAyBPncfuu8MZhLY9RtfZPM0.jpg",
      "backdrop_path": "/uoXXbN2PrOxH6UKyP7kYwmGpAAP.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "1508"
      },
      "tmdb_id": "1508",
      "title": "Dancing with the Stars",
      "year": "2005",
      "rating": 6.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/iisHVZ6we56PE4BcV1csB46SbiG.jpg",
      "backdrop_path": "/r4ceAy8m4w9gheLWEgEgQnbYK85.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "208921"
      },
      "tmdb_id": "208921",
      "title": "Rivals",
      "year": "2024",
      "rating": 7.4,
      "poster_url": "https://image.tmdb.org/t/p/w500/3p9t1KDo5iXAn1zsSPn8sdtakWs.jpg",
      "backdrop_path": "/vPw5Gpg0YEEk1VsE8QlmyTxIJuU.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "4194"
      },
      "tmdb_id": "4194",
      "title": "Star Wars: The Clone Wars",
      "year": "2008",
      "rating": 8.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/e1nWfnnCVqxS2LeTO3dwGyAsG2V.jpg",
      "backdrop_path": "/m6eRgkR1KC6Mr6gKx6gKCzSn6vD.jpg",
      "media_type": "tv",
      "original_language": "en"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "103540"
      },
      "tmdb_id": "103540",
      "title": "Percy Jackson and the Olympians",
      "year": "2023",
      "rating": 7.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/zofPiEpwCRYaezOncTlQwXebHFU.jpg",
      "backdrop_path": "/dLIKNqBi9L1cVbwuniXkaNOsIXg.jpg",
      "media_type": "tv",
      "original_language": "en"
    }
  ],
  "kdrama": [
    {
      "id": {
        "provider": "tmdb",
        "value": "33238"
      },
      "tmdb_id": "33238",
      "title": "Running Man",
      "year": "2010",
      "rating": 8.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/2Wmmu1MkqxJ48J7aySET9EKEjXz.jpg",
      "backdrop_path": "/wsHj4oHQJoe7DMYaqNFwVoyLiAh.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "279246"
      },
      "tmdb_id": "279246",
      "title": "The Remarried Empress",
      "year": "2026",
      "rating": 8.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/zn3IXZzGavH3qle3o3g1r32eXDy.jpg",
      "backdrop_path": "/fNcpHmuZLKoyhNMBEzdqzX8iIvg.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "5092"
      },
      "tmdb_id": "5092",
      "title": "Infinite Challenge",
      "year": "2005",
      "rating": 7.5,
      "poster_url": "https://image.tmdb.org/t/p/w500/3ZIPTvMnzI5ThmdGeEYQFxJV5Sg.jpg",
      "backdrop_path": "/s2qJb1FLwp1Mse9lY08JqgMp0kw.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "65270"
      },
      "tmdb_id": "65270",
      "title": "Radio Star",
      "year": "2007",
      "rating": 5.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/uRUZDsvUfIP3JUEgOC8ReBlQQUU.jpg",
      "backdrop_path": "/kCd0rmnNwCd3sgupO9DqSi9aHa0.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "303745"
      },
      "tmdb_id": "303745",
      "title": "Love in Disguise",
      "year": "2026",
      "rating": 9.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/c9DEtqCDZBPL9i06WmbDrcndrBy.jpg",
      "backdrop_path": "/ob7m6JqZ7jSOocR3VL73VxRC6Is.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "39429"
      },
      "tmdb_id": "39429",
      "title": "You Hee-yeol's Sketchbook",
      "year": "2009",
      "rating": 6.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/5zsoaVX483aJG90rJhlAup1VAXI.jpg",
      "backdrop_path": "/gWTJDV0iRWkkiwlL5uXHQvRPbkk.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "70672"
      },
      "tmdb_id": "70672",
      "title": "Men on a Mission",
      "year": "2015",
      "rating": 7.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/2jIi55JtYKJTL1km8qHMuUilOWo.jpg",
      "backdrop_path": "/a8a8z4aJr40zYgRMfmSESppX2eO.jpg",
      "media_type": "tv",
      "original_language": "ko"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "65282"
      },
      "tmdb_id": "65282",
      "title": "Home Alone",
      "year": "2013",
      "rating": 7.2,
      "poster_url": "https://image.tmdb.org/t/p/w500/1hqGagr94soBq70Lq7tPHvNmmxy.jpg",
      "backdrop_path": "/sztoil0XfQ0cSHy4PXmYW6uAdfQ.jpg",
      "media_type": "tv",
      "original_language": "ko"
    }
  ],
  "anime": [
    {
      "id": {
        "provider": "tmdb",
        "value": "60572"
      },
      "tmdb_id": "60572",
      "title": "Pok\u00e9mon",
      "year": "1997",
      "rating": 8.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/lP4zwr0F7hWTbAFltfoFTc2AxRG.jpg",
      "backdrop_path": "/yYpQV25I7XB6S0POJOScPjxYWV5.jpg",
      "media_type": "tv",
      "original_language": "ja"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "37854"
      },
      "tmdb_id": "37854",
      "title": "One Piece",
      "year": "1999",
      "rating": 8.8,
      "poster_url": "https://image.tmdb.org/t/p/w500/dB4EDhre2dsC2kxYDavyKWqLQwi.jpg",
      "backdrop_path": "/2rmK7mnchw9Xr3XdiTFSxTTLXqv.jpg",
      "media_type": "tv",
      "original_language": "ja"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "65733"
      },
      "tmdb_id": "65733",
      "title": "Doraemon",
      "year": "2005",
      "rating": 8.1,
      "poster_url": "https://image.tmdb.org/t/p/w500/9ZN1P32SHviL3SV51qLivxycvcx.jpg",
      "backdrop_path": "/c2oiRa7V3bQzof4wVGzLXtWJ5QU.jpg",
      "media_type": "tv",
      "original_language": "ja"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "57775"
      },
      "tmdb_id": "57775",
      "title": "Chibi Maruko-chan",
      "year": "1990",
      "rating": 7.6,
      "poster_url": "https://image.tmdb.org/t/p/w500/bfn54AAMuh47IFqeoco0jgeVH1a.jpg",
      "backdrop_path": "/vuajwjep1FxphPhMEWKv4bfrCnf.jpg",
      "media_type": "tv",
      "original_language": "ja"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "30983"
      },
      "tmdb_id": "30983",
      "title": "Detective Conan",
      "year": "1996",
      "rating": 8.0,
      "poster_url": "https://image.tmdb.org/t/p/w500/iHfA63x7rFaWbP2C832uCe2r0zy.jpg",
      "backdrop_path": "/z67lpMtm8YGykJO4p89meuNMvj8.jpg",
      "media_type": "tv",
      "original_language": "ja"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "30984"
      },
      "tmdb_id": "30984",
      "title": "Bleach",
      "year": "2004",
      "rating": 8.3,
      "poster_url": "https://image.tmdb.org/t/p/w500/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg",
      "backdrop_path": "/o0NsbcIvsllg6CJX0FBFY8wWbsn.jpg",
      "media_type": "tv",
      "original_language": "ja"
    },
    {
      "id": {
        "provider": "tmdb",
        "value": "34860"
      },
      "tmdb_id": "34860",
      "title": "Ninja Boy Rantaro",
      "year": "1993",
      "rating": 6.9,
      "poster_url": "https://image.tmdb.org/t/p/w500/fzNiSp0HhCthOTYu9IYWlPPa7fU.jpg",
      "backdrop_path": "/4fVwc77cov2q9i0szzYhlkAaqza.jpg",
      "media_type": "tv",
      "original_language": "ja"
    }
  ]
};

  function getFallbackCatalogForCategory(key) {
    if (FALLBACK_TMDB_CATALOG[key] && FALLBACK_TMDB_CATALOG[key].length > 0) {
      return FALLBACK_TMDB_CATALOG[key];
    }
    if (DEFAULT_SHOWCASE_CATALOG[key] && DEFAULT_SHOWCASE_CATALOG[key].length > 0) {
      return DEFAULT_SHOWCASE_CATALOG[key];
    }
    return FALLBACK_TMDB_CATALOG.trending || [];
  }

  function showTmdbDebugError(msg) {
    console.warn('[TMDB Diagnostics]', msg);
    const banner = document.getElementById('tmdbDebugBanner');
    const msgEl = document.getElementById('tmdbDebugMessage');
    if (banner && msgEl) {
      msgEl.textContent = msg;
      banner.style.display = 'block';
    }
  }

  function initTmdbDebugBanner() {
    const dismissBtn = document.getElementById('tmdbDebugDismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        const banner = document.getElementById('tmdbDebugBanner');
        if (banner) banner.style.display = 'none';
      });
    }
  }

  // ==========================================================================
  // TMDB API V3 INTEGRATION & CATEGORY ROWS ENGINE
  // ==========================================================================
  const TMDB_CONFIG = {
    baseUrl: 'https://api.themoviedb.org/3',
    imageBase: 'https://image.tmdb.org/t/p/w500',
    defaultKey: '15d2ea6d0dc1d476efbca3eba2b9bbfb',
    getKey: () => {
      // 1. Check window environment variables (Vite / Next.js / Custom)
      if (typeof window !== 'undefined') {
        if (window.VITE_TMDB_API_KEY) return window.VITE_TMDB_API_KEY;
        if (window.NEXT_PUBLIC_TMDB_API_KEY) return window.NEXT_PUBLIC_TMDB_API_KEY;
        if (window.TMDB_API_KEY) return window.TMDB_API_KEY;
        if (window.ENV?.VITE_TMDB_API_KEY) return window.ENV.VITE_TMDB_API_KEY;
        if (window.ENV?.NEXT_PUBLIC_TMDB_API_KEY) return window.ENV.NEXT_PUBLIC_TMDB_API_KEY;
        if (window.NETMIRROR_MONETIZATION?.tmdbApiKey) return window.NETMIRROR_MONETIZATION.tmdbApiKey;
      }
      // 2. Check process.env if available (bundlers)
      if (typeof process !== 'undefined' && process.env) {
        if (process.env.VITE_TMDB_API_KEY) return process.env.VITE_TMDB_API_KEY;
        if (process.env.NEXT_PUBLIC_TMDB_API_KEY) return process.env.NEXT_PUBLIC_TMDB_API_KEY;
        if (process.env.TMDB_API_KEY) return process.env.TMDB_API_KEY;
      }
      return TMDB_CONFIG.defaultKey;
    }
  };

  const TMDB_CATEGORIES = [
    {
      key: 'trending',
      carouselEl: () => el.trendingCarousel,
      sectionEl: () => el.trendingRailSection,
      title: 'Trending Now',
      endpoint: '/trending/all/week',
      defaultTag: 'Trending'
    },
    {
      key: 'english',
      carouselEl: () => el.englishCarousel,
      sectionEl: () => el.englishRailSection,
      title: 'Latest English',
      endpoint: '/discover/movie?with_original_language=en&sort_by=popularity.desc',
      defaultTag: 'English'
    },
    {
      key: 'hindi',
      carouselEl: () => el.hindiCarousel,
      sectionEl: () => el.hindiRailSection,
      title: 'Latest Hindi',
      endpoint: '/discover/movie?with_original_language=hi&sort_by=popularity.desc',
      defaultTag: 'Hindi'
    },
    {
      key: 'kannada',
      carouselEl: () => el.kannadaCarousel,
      sectionEl: () => el.kannadaRailSection,
      title: 'Latest Kannada',
      endpoint: '/discover/movie?with_original_language=kn&sort_by=popularity.desc',
      defaultTag: 'Kannada'
    },
    {
      key: 'netflix',
      carouselEl: () => el.netflixCarousel,
      sectionEl: () => el.netflixRailSection,
      title: 'Netflix Originals & Exclusives',
      endpoint: '/discover/tv?with_networks=213&sort_by=popularity.desc',
      defaultTag: 'Netflix'
    },
    {
      key: 'prime',
      carouselEl: () => el.primeCarousel,
      sectionEl: () => el.primeRailSection,
      title: 'Prime Video Exclusives',
      endpoint: '/discover/tv?with_networks=1024&sort_by=popularity.desc',
      defaultTag: 'Prime'
    },
    {
      key: 'disney',
      carouselEl: () => el.disneyCarousel,
      sectionEl: () => el.disneyRailSection,
      title: 'Disney+ & Marvel Showcase',
      endpoint: '/discover/tv?with_networks=2739&sort_by=popularity.desc',
      defaultTag: 'Disney+'
    },
    {
      key: 'movies',
      carouselEl: () => el.moviesCarousel,
      sectionEl: () => el.moviesRailSection,
      title: 'Popular Movies',
      endpoint: '/discover/movie?sort_by=popularity.desc',
      defaultTag: 'Movie'
    },
    {
      key: 'series',
      carouselEl: () => el.seriesCarousel,
      sectionEl: () => el.seriesRailSection,
      title: 'Bingeworthy TV Series',
      endpoint: '/discover/tv?sort_by=popularity.desc',
      defaultTag: 'S1'
    },
    {
      key: 'action',
      carouselEl: () => el.actionCarousel,
      sectionEl: () => el.actionRailSection,
      title: 'Action & Adventure Blockbusters',
      endpoint: '/discover/movie?with_genres=28&sort_by=popularity.desc',
      defaultTag: 'Action'
    },
    {
      key: 'scifi',
      carouselEl: () => el.scifiCarousel,
      sectionEl: () => el.scifiRailSection,
      title: 'Sci-Fi, Cyberpunk & Fantasy Epics',
      endpoint: '/discover/movie?with_genres=878&sort_by=popularity.desc',
      defaultTag: 'Sci-Fi'
    },
    {
      key: 'horror',
      carouselEl: () => el.horrorCarousel,
      sectionEl: () => el.horrorRailSection,
      title: 'Horror & Supernatural Thrillers',
      endpoint: '/discover/movie?with_genres=27&sort_by=popularity.desc',
      defaultTag: 'Horror'
    },
    {
      key: 'anime',
      carouselEl: () => el.animeCarousel,
      sectionEl: () => el.animeRailSection,
      title: 'Anime Series & Animation',
      endpoint: '/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
      defaultTag: 'Anime'
    },
    {
      key: 'kdrama',
      carouselEl: () => el.kdramaCarousel,
      sectionEl: () => el.kdramaRailSection,
      title: 'Korean K-Drama Sensation',
      endpoint: '/discover/tv?with_original_language=ko&sort_by=popularity.desc',
      defaultTag: 'K-Drama'
    },
    {
      key: 'comedy',
      carouselEl: () => el.comedyCarousel,
      sectionEl: () => el.comedyRailSection,
      title: 'Comedy & Feel-Good Hits',
      endpoint: '/discover/movie?with_genres=35&sort_by=popularity.desc',
      defaultTag: 'Comedy'
    },
    {
      key: 'toprated',
      carouselEl: () => el.topRatedCarousel,
      sectionEl: () => el.topRatedRailSection,
      title: 'Top Rated IMDb Hall of Fame',
      endpoint: '/movie/top_rated',
      defaultTag: 'Top 250'
    }
  ];

  function buildTmdbRequest(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
    const url = `/api/tmdb?endpoint=${encodeURIComponent(cleanEndpoint)}`;
    return { url, headers: { 'Accept': 'application/json' } };
  }

  function buildDirectTmdbFallbackRequest(endpoint) {
    const tokenOrKey = TMDB_CONFIG.getKey();
    const isBearer = Boolean(tokenOrKey && (tokenOrKey.startsWith('ey') || tokenOrKey.length > 40));
    const headers = { 'Accept': 'application/json' };
    if (isBearer) {
      headers['Authorization'] = `Bearer ${tokenOrKey}`;
    }
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = isBearer
      ? `${TMDB_CONFIG.baseUrl}${endpoint}`
      : `${TMDB_CONFIG.baseUrl}${endpoint}${sep}api_key=${encodeURIComponent(tokenOrKey)}`;
    return { url, headers };
  }

  function mapTmdbItem(item, defaultTag = '') {
    if (!item || !item.poster_path) return null;
    const isTv = Boolean(item.name || item.first_air_date || item.media_type === 'tv');
    const title = (item.title || item.name || 'Untitled').trim();
    const year = (item.release_date || item.first_air_date || '').slice(0, 4) || '2024';
    const posterUrl = `https://image.tmdb.org/t/p/w500${item.poster_path}`;
    const voteAvg = typeof item.vote_average === 'number' && item.vote_average > 0 ? item.vote_average : 7.8;

    let tag = defaultTag;
    if (!tag) {
      const lang = (item.original_language || '').toLowerCase();
      const langMap = {
        en: 'English',
        hi: 'Hindi',
        kn: 'Kannada',
        ko: 'K-Drama',
        ja: 'Anime',
        es: 'Spanish',
        fr: 'French',
        de: 'German',
        ta: 'Tamil',
        te: 'Telugu',
        ml: 'Malayalam'
      };
      if (langMap[lang]) {
        tag = langMap[lang];
      } else if (isTv) {
        tag = 'S1';
      } else {
        tag = 'Movie';
      }
    }

    return {
      id: { provider: 'tmdb', value: String(item.id) },
      tmdb_id: String(item.id),
      title,
      name: title,
      poster_url: posterUrl,
      poster_path: item.poster_path,
      media_type: isTv ? 'series' : 'movie',
      year,
      vote_average: voteAvg,
      rating: voteAvg.toFixed(1),
      tag,
      original_language: item.original_language,
      backdrop_path: item.backdrop_path,
      overview: item.overview || ''
    };
  }

  function renderRailSkeletons(carousel, count = 7) {
    if (!carousel) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const card = document.createElement('div');
      card.className = 'skeleton-card';
      card.innerHTML = `
        <div class="skeleton-poster aspect-[2/3] rounded-xl"></div>
        <div class="skeleton-info pt-5">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-year"></div>
        </div>
      `;
      frag.appendChild(card);
    }
    carousel.innerHTML = '';
    carousel.appendChild(frag);
  }

  function renderRailFallback(carousel, cat) {
    if (!carousel) return;
    carousel.innerHTML = `
      <div class="rail-fallback-msg">
        <span class="rail-fallback-icon">📡</span>
        <div class="rail-fallback-content">
          <span class="rail-fallback-text">Unable to load ${cat.title} right now.</span>
          <button type="button" class="rail-retry-btn" data-category="${cat.key}">Retry</button>
        </div>
      </div>
    `;
    const retryBtn = carousel.querySelector('.rail-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        fetchSingleTmdbCategory(cat);
      });
    }
  }

  async function fetchSingleTmdbCategory(cat) {
    const carousel = cat.carouselEl();
    if (!carousel) return;

    // Check memory or session cache first for fast 0ms restores
    const cacheKey = `tmdb_cache_${cat.key}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          renderCarousel(carousel, parsed);
          return parsed;
        }
      }
    } catch (_) {}

    // Only render skeletons if carousel is completely empty
    if (!carousel.children || carousel.children.length === 0) {
      renderRailSkeletons(carousel, 7);
    }

    try {
      // Primary: Server-side proxy route /api/tmdb to bypass client adblockers and CORS
      const { url, headers } = buildTmdbRequest(cat.endpoint);
      let res;
      try {
        res = await fetch(url, { headers });
      } catch (proxyNetErr) {
        // Fallback to direct client-side fetch if proxy unreachable
        const direct = buildDirectTmdbFallbackRequest(cat.endpoint);
        res = await fetch(direct.url, { headers: direct.headers });
      }

      // If server proxy returned 404/500/offline, try direct TMDB API fetch before throwing to fallback
      if (!res || !res.ok) {
        try {
          const direct = buildDirectTmdbFallbackRequest(cat.endpoint);
          const directRes = await fetch(direct.url, { headers: direct.headers });
          if (directRes && directRes.ok) {
            res = directRes;
          }
        } catch (_) {}
      }

      if (!res || !res.ok) {
        let errMsg = `TMDB API error HTTP ${res ? res.status : 'offline'}`;
        try {
          const errData = await res.json();
          if (errData?.error || errData?.status_message) {
            errMsg = errData.error || errData.status_message;
          }
        } catch (_) {}
        showTmdbDebugError(`TMDB Notice (${res ? res.status : 'offline'}): ${errMsg}. Active catalog loaded.`);
        throw new Error(errMsg);
      }

      const data = await res.json();
      if (data?.error) {
        showTmdbDebugError(`TMDB Notice: ${data.error}. Rendering active fallback catalog.`);
        throw new Error(data.error);
      }

      const results = (data.results || []).filter(item => Boolean(item && item.poster_path));
      if (!results.length) {
        throw new Error('No items with poster_path');
      }

      const mapped = results.map(item => mapTmdbItem(item, cat.defaultTag)).filter(Boolean);
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(mapped));
      } catch (_) {}

      renderCarousel(carousel, mapped);

      // If this is trending row, also update hero slides with high-res backdrops
      if (cat.key === 'trending' && mapped.length > 0) {
        const heroItems = mapped.slice(0, 5).map(m => {
          const backdrop = m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : m.poster_url;
          return { ...m, poster_url: backdrop };
        });
        state.heroSlides = heroItems;
        setHero(heroItems[0]);
        renderHeroIndicators();
        startHeroAutoRotate();
      }

      return mapped;
    } catch (err) {
      console.warn(`TMDB fetch failed for ${cat.key}:`, err);
      // Fallback to rich built-in mock dataset so homepage is NEVER blank
      const fallbackList = getFallbackCatalogForCategory(cat.key);
      if (fallbackList && fallbackList.length > 0) {
        renderCarousel(carousel, fallbackList);
      } else {
        renderRailFallback(carousel, cat);
      }
      return null;
    }
  }

  async function fetchTmdbCategories() {
    // Fire all category fetches concurrently
    const promises = TMDB_CATEGORIES.map(cat => fetchSingleTmdbCategory(cat));
    await Promise.allSettled(promises);
  }

  function applyDefaultShowcase() {
    // 1. Multi-slide Hero setup with verified high-definition sliding movies
    state.heroSlides = HERO_MOVIE_SLIDES || [];
    state.heroCurrentIndex = 0;
    if (state.heroSlides && state.heroSlides.length > 0) {
      setHero(state.heroSlides[0]);
    }
    renderHeroIndicators();
    startHeroAutoRotate();

    // 2. Populate EVERY category section immediately so all sections have their movies listed on 0ms first paint
    TMDB_CATEGORIES.forEach(cat => {
      let carousel = null;
      try {
        carousel = cat.carouselEl ? cat.carouselEl() : null;
      } catch (_) {}
      if (!carousel) {
        carousel = document.getElementById(cat.key + 'Carousel') || (cat.key === 'toprated' && document.getElementById('topRatedCarousel'));
      }
      if (carousel) {
        const items = getFallbackCatalogForCategory(cat.key);
        if (items && items.length > 0) {
          renderCarousel(carousel, items);
        }
      }
    });

    // 3. Showcase live sports immediately
    renderSportsSpotlight();
  }

  async function init() {
    // 1. Instantly populate default catalog & hero (0ms first paint)
    try {
      applyDefaultShowcase();
    } catch (e) {
      console.warn('Initial default showcase warning:', e);
    }

    try { initAdShield(); } catch (e) { console.warn('initAdShield warning:', e); }
    try { initPwaInstall(); } catch (e) { console.warn('initPwaInstall warning:', e); }
    try { initTmdbDebugBanner(); } catch (e) { console.warn('initTmdbDebugBanner warning:', e); }
    try { setupEventListeners(); } catch (e) { console.error('setupEventListeners error:', e); }
    try { updateAudioEnhancerUI(); } catch (e) { console.warn('updateAudioEnhancerUI warning:', e); }
    try { initMonetization(); } catch (e) { console.warn('initMonetization warning:', e); }
    try { renderContinueWatching(); } catch (e) { console.warn('renderContinueWatching warning:', e); }

    try { handleDeepLinkOnLoad(); } catch (e) { console.warn('handleDeepLinkOnLoad warning:', e); }

    // 2. Connect all homepage rows to TMDB API v3 & populate real posters, ratings, and titles
    fetchTmdbCategories();

    // Defer sports schedule fetching until main thread is idle to conserve mobile bandwidth
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        fetchSportsData().catch(() => {});
      }, { timeout: 2500 });
    } else {
      setTimeout(() => {
        fetchSportsData().catch(() => {});
      }, 1500);
    }
  }

  function setHero(item) {
    if (!item) return;
    state.heroItem = item;
    const title = cleanDisplayTitle(item.title || item.name || 'Featured Title');
    const backdrop = item.backdrop_url || (item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : (item.poster_url || fallbackPoster(title)));
    
    // Smooth sliding backdrop transition
    if (el.heroBackdrop) {
      el.heroBackdrop.style.opacity = '0.25';
      el.heroBackdrop.style.transform = 'scale(1.05)';
      setTimeout(() => {
        el.heroBackdrop.style.backgroundImage = `url('${backdrop}')`;
        el.heroBackdrop.style.opacity = '1';
        el.heroBackdrop.style.transform = 'scale(1.02)';
      }, 180);
    }

    if (el.heroTitle) el.heroTitle.textContent = title;
    if (el.heroYear) el.heroYear.textContent = item.year || '2024';
    if (el.heroMediaType) el.heroMediaType.textContent = (item.media_type === 'series' || item.media_type === 'tv') ? 'TV SERIES' : 'MOVIE';
    if (el.heroRating) {
      const vote = item.rating || (item.vote_average ? (Math.round(Number(item.vote_average) * 10) / 10).toFixed(1) : '8.6');
      el.heroRating.textContent = `⭐ ${vote}`;
    }
    if (el.heroSynopsis) {
      el.heroSynopsis.textContent = item.overview ||
        `Stream ${title} directly in your browser in 4K Ultra HD with crystal-clear audio and multi-language subtitles.`;
    }

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
    const isFav = (state.favorites || []).some((f) => isSameMedia(f, state.heroItem));
    if (el.heroFavBtn) el.heroFavBtn.classList.toggle('fav-active', isFav);
  }

  // ==========================================================================
  // CAROUSEL & CARDS RENDERING
  // ==========================================================================
  function renderCarousel(container, items) {
    if (!container) return;
    const seen = new Set();
    const fragment = document.createDocumentFragment();
    let index = 0;
    let cardCount = 0;
    (items || []).forEach((item) => {
      try {
        if (!item) return;
        const key = getCanonicalKey(item) || getMediaIdValue(item);
        if (key && seen.has(key)) return;
        if (key) seen.add(key);
        const card = createMovieCard(item, index++);
        if (card) {
          fragment.appendChild(card);
          cardCount++;
        }
      } catch (e) {
        console.warn('Error rendering carousel card:', e, item);
      }
    });
    if (cardCount > 0) {
      container.innerHTML = '';
      container.appendChild(fragment);
    }
  }

  function createMovieCard(item, index = 0) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const displayTitle = cleanDisplayTitle(item?.title || item?.name || 'Unknown Title');
    const poster = item?.poster_url
      || (item?.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : fallbackPoster(displayTitle));

    // Top-Right Badge: Small rounded pill showing language or season tag (e.g. English, Hindi, Kannada, S1)
    let tag = item?.tag || '';
    if (!tag) {
      if (item?.original_language) {
        const langMap = {
          en: 'English',
          hi: 'Hindi',
          kn: 'Kannada',
          ko: 'K-Drama',
          ja: 'Anime',
          es: 'Spanish',
          fr: 'French',
          de: 'German',
          ta: 'Tamil',
          te: 'Telugu',
          ml: 'Malayalam'
        };
        tag = langMap[item.original_language.toLowerCase()] || item.original_language.toUpperCase();
      } else if (item?.media_type === 'series') {
        tag = 'S1';
      } else {
        tag = 'Movie';
      }
    }

    const year = (item?.release_date || item?.first_air_date || item?.year || '2024').toString().slice(0, 4);
    const voteAvg = item?.vote_average != null ? Number(item.vote_average) : (item?.rating ? Number(item.rating) : (7.5 + ((index % 5) * 0.3)));
    const ratingFormatted = (Math.round(voteAvg * 10) / 10).toFixed(1);
    const isHighRating = voteAvg >= 7.0;
    const ringClass = isHighRating ? 'border-emerald-500' : 'border-amber-500';
    const ringColor = isHighRating ? '#10b981' : '#f59e0b';

    // Check if item is in continue watching history safely
    let historyItem = null;
    try {
      historyItem = (state.history || []).find((h) => isSameMedia(h, item));
    } catch (_) {}

    const progressPercent = historyItem && historyItem.duration > 0
      ? Math.min(100, Math.floor((historyItem.currentTime / historyItem.duration) * 100))
      : 0;

    card.innerHTML = `
      <div class="poster-wrap aspect-[2/3] relative rounded-xl">
        <div class="poster-inner rounded-xl overflow-hidden relative w-full h-full">
          <img class="poster-img" src="${poster}" alt="${displayTitle}" loading="lazy" onerror="this.src='${fallbackPoster(displayTitle)}'" />
          
          <!-- Top-Right Badge: Small rounded pill inside top-right corner of poster -->
          <span class="card-tag-badge bg-rose-600 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">${tag}</span>
          
          <div class="card-play-overlay">
            <div class="card-play-icon">
              <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            </div>
          </div>
          ${progressPercent > 0 ? `<div class="card-progress-bar"><div class="card-progress-fill" style="width: ${progressPercent}%;"></div></div>` : ''}
        </div>

        <!-- Bottom-Left Circular Rating Badge overlapping bottom-left edge (-bottom-4 left-2.5) -->
        <div class="card-rating-badge -bottom-4 left-2.5 w-9 h-9 rounded-full bg-white text-slate-900 font-bold text-xs shadow-md ${ringClass}" style="border: 2.5px solid ${ringColor};" title="TMDB Rating: ${ratingFormatted}">
          ${ratingFormatted}
        </div>
      </div>
      
      <!-- Metadata Below Poster: pt-5 to clear overlapping rating circle -->
      <div class="card-info pt-5">
        <div class="card-title text-sm font-semibold text-white truncate" title="${displayTitle}">${displayTitle}</div>
        <div class="card-year text-xs text-slate-400 mt-0.5">${year}</div>
      </div>
    `;

    // Click behavior
    card.addEventListener('click', (e) => {
      const playBtn = card.querySelector('.card-play-icon');
      if (playBtn && (e.target === playBtn || playBtn.contains(e.target))) {
        e.stopPropagation();
        openPlayerDirect(item);
      } else {
        openDetailsModal(getMediaIdValue(item), getMediaProvider(item), displayTitle, item);
      }
    });

    return card;
  }

  function renderContinueWatching() {
    if (!state.history || state.history.length === 0) {
      if (el.continueWatchingSection) el.continueWatchingSection.classList.add('hidden');
      return;
    }
    const fragment = document.createDocumentFragment();
    let cwCount = 0;
    state.history.slice(0, 12).forEach((item) => {
      try {
        if (!item) return;
        const card = createMovieCard(item);
        if (card) {
          fragment.appendChild(card);
          cwCount++;
        }
      } catch (e) {
        console.warn('Error rendering continue watching card:', e, item);
      }
    });
    if (cwCount > 0) {
      if (el.continueWatchingSection) el.continueWatchingSection.classList.remove('hidden');
      if (el.continueWatchingList) {
        el.continueWatchingList.innerHTML = '';
        el.continueWatchingList.appendChild(fragment);
      }
    } else if (el.continueWatchingSection) {
      el.continueWatchingSection.classList.add('hidden');
    }
  }

  // ==========================================================================
  // UNIVERSAL MOVIE URL GENERATION, SHARING & DEEP-LINKING
  // ==========================================================================
  function generateMovieUrl(id, title = '') {
    const origin = window.location.origin;
    const cleanT = encodeURIComponent(cleanDisplayTitle(title || ''));
    return `${origin}/?movie=${encodeURIComponent(id)}${cleanT ? `&title=${cleanT}` : ''}`;
  }

  function generateWatchUrl(id, season = 0, episode = 0, title = '') {
    const origin = window.location.origin;
    const cleanT = encodeURIComponent(cleanDisplayTitle(title || ''));
    const epParams = (season > 0 || episode > 0) ? `&s=${season}&e=${episode}` : '';
    return `${origin}/?watch=${encodeURIComponent(id)}${epParams}${cleanT ? `&title=${cleanT}` : ''}`;
  }

  function updateMovieUrl(id, title = '', pushHistory = true) {
    const url = generateMovieUrl(id, title);
    if (pushHistory) {
      window.history.pushState({ type: 'movie', id, title }, '', url);
    } else {
      window.history.replaceState({ type: 'movie', id, title }, '', url);
    }
  }

  function updateWatchUrl(id, season = 0, episode = 0, title = '', pushHistory = true) {
    const url = generateWatchUrl(id, season, episode, title);
    if (pushHistory) {
      window.history.pushState({ type: 'watch', id, season, episode, title }, '', url);
    } else {
      window.history.replaceState({ type: 'watch', id, season, episode, title }, '', url);
    }
  }

  function revertUrlToBase() {
    const origin = window.location.origin;
    const pathname = window.location.pathname === '/watch' ? '/' : window.location.pathname;
    window.history.replaceState({}, '', `${origin}${pathname}`);
    revertSeoMeta();
  }

  // ==========================================================================
  // PROGRAMMATIC SEO & AI-SEARCH (AEO) METADATA ENGINE
  // ==========================================================================
  function updateSeoMeta(details, isWatch = false, season = 0, episode = 0) {
    if (!details) return;
    const title = cleanDisplayTitle(details.title || details.name || 'Movie');
    const year = (details.release_date || details.first_air_date || details.year || '2024').toString().slice(0, 4);
    const isTv = details.media_type === 'series' || details.media_type === 'tv' || season > 0;
    
    let seoTitle = '';
    if (isWatch) {
      seoTitle = isTv && season > 0
        ? `Watch ${title} Season ${season} Episode ${episode} Online Free | MovieBox Plus`
        : `Watch ${title} (${year}) Full Movie Online Free in 4K | MovieBox Plus`;
    } else {
      seoTitle = `${title} (${year}) – Watch Free Online in 4K UHD | MovieBox Plus`;
    }

    document.title = seoTitle;

    const overview = details.overview ||
      `Stream ${title} (${year}) online in 4K Ultra HD on MovieBox Plus with multi-language audio dubs, subtitles, and 300% studio sound booster.`;

    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) descMeta.setAttribute('content', overview.slice(0, 160));

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seoTitle);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', overview.slice(0, 200));

    const poster = details.poster_url || (details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://netmirror-plus.vercel.app/og-image.png');
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', poster);

    const canonicalUrl = isWatch
      ? generateWatchUrl(getMediaIdValue(details), season, episode, title)
      : generateMovieUrl(getMediaIdValue(details), title);
    
    const canonicalTag = document.getElementById('canonicalTag');
    if (canonicalTag) canonicalTag.setAttribute('href', canonicalUrl);

    // Dynamic JSON-LD structured data for Google, Bing & AI Answer Engines (ChatGPT, Perplexity)
    let mediaSchemaEl = document.getElementById('dynamicMediaSchema');
    if (!mediaSchemaEl) {
      mediaSchemaEl = document.createElement('script');
      mediaSchemaEl.id = 'dynamicMediaSchema';
      mediaSchemaEl.type = 'application/ld+json';
      document.head.appendChild(mediaSchemaEl);
    }
    const vote = Number(details.vote_average || details.rating || 8.0).toFixed(1);
    mediaSchemaEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": isTv ? "TVSeries" : "Movie",
      "name": title,
      "image": poster,
      "description": overview,
      "datePublished": details.release_date || details.first_air_date || `${year}-01-01`,
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": vote,
        "bestRating": "10"
      }
    });
  }

  function revertSeoMeta() {
    document.title = 'MovieBox Plus – Watch Worldwide Movies, TV Series & Live Sports Online';
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', 'Stream worldwide movies, TV series, and 24/7 live sports (Cricket, Football, NBA) in 4K Ultra HD with multi-language subtitles, audio dubs, and up to 300% studio sound booster.');
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', 'MovieBox Plus – Watch Worldwide Movies, Series & Live Sports');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', 'Stream worldwide movies, TV series, and 24/7 live sports (Cricket, Football, NBA) in Ultra HD with multi-language subtitles and up to 300% volume booster.');
    const ogImg = document.querySelector('meta[property="og:image"]');
    if (ogImg) ogImg.setAttribute('content', 'https://netmirror-plus.vercel.app/og-image.png');
    const canonicalTag = document.getElementById('canonicalTag');
    if (canonicalTag) canonicalTag.setAttribute('href', 'https://netmirror-plus.vercel.app/');
    const mediaSchemaEl = document.getElementById('dynamicMediaSchema');
    if (mediaSchemaEl) mediaSchemaEl.remove();
  }

  async function shareMovieLink(id, title, desc = '', poster = '', isWatch = false, season = 0, episode = 0) {
    const cleanT = cleanDisplayTitle(title || 'Movie');
    const shareUrl = isWatch 
      ? generateWatchUrl(id, season, episode, cleanT)
      : generateMovieUrl(id, cleanT);

    const shareData = {
      title: `${cleanT} – MovieBox Plus`,
      text: isWatch && season > 0
        ? `Watch ${cleanT} Season ${season} Episode ${episode} on MovieBox Plus:`
        : `Watch ${cleanT} in Full HD on MovieBox Plus:`,
      url: shareUrl,
    };

    // Use native device Web Share API on mobile if supported
    if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        showToast('Link shared successfully!');
        return;
      } catch (err) {
        // Fallback to clipboard if cancelled or failed
      }
    }

    // Clipboard copy
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const dummy = document.createElement('input');
        document.body.appendChild(dummy);
        dummy.value = shareUrl;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
      }

      if (el.modalShareBtnText) {
        const orig = el.modalShareBtnText.textContent;
        el.modalShareBtnText.textContent = 'Copied!';
        setTimeout(() => { el.modalShareBtnText.textContent = orig; }, 2200);
      }

      showToast(`🔗 Movie URL copied to clipboard!`);
    } catch (err) {
      showToast('Could not copy link to clipboard');
    }
  }

  // Deep-Link Route Handler on Initial Page Load
  async function handleDeepLinkOnLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash || '';
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));

    const watchId = urlParams.get('watch') || (window.location.pathname.startsWith('/watch') ? urlParams.get('id') : null);
    const movieId = urlParams.get('movie') || urlParams.get('details');
    const title = urlParams.get('title') || '';
    const season = parseInt(urlParams.get('s') || urlParams.get('season') || '0', 10);
    const episode = parseInt(urlParams.get('e') || urlParams.get('episode') || '0', 10);
    const lang = urlParams.get('lang') || urlParams.get('language') || hashParams.get('language') || hashParams.get('lang');
    const platform = urlParams.get('platform') || hashParams.get('platform');

    if (watchId) {
      let s = season;
      let ep = episode;
      try {
        const qs = new URLSearchParams();
        if (title) qs.set('title', title);
        if (s > 0 || ep > 0) qs.set('type', 'tv');
        const qStr = qs.toString();
        const res = await fetch(`/api/details/${watchId}${qStr ? `?${qStr}` : ''}`);
        if (res.ok) {
          const details = await res.json();
          state.currentDetails = details;
          if (details) {
            const isSer = details.media_type === 'series' || (details.seasons && details.seasons.length > 0) || s > 0 || ep > 0;
            const targetS = s > 0 ? s : 1;
            const targetEp = ep > 0 ? ep : 1;
            if (isSer) {
              el.playerMediaSubtitle.textContent = `Season ${targetS} • Episode ${targetEp}`;
            } else {
              el.playerMediaSubtitle.textContent = details.year || 'Movie';
            }
            if (details.duration && el.durationTime && (!el.videoElement.duration || isNaN(el.videoElement.duration) || el.videoElement.duration === 0)) {
              const parsedSecs = parseDurationToSeconds(details.duration);
              if (parsedSecs > 0) el.durationTime.textContent = formatTime(parsedSecs);
            }
          }
          const isSeries = details.media_type === 'series' || (details.seasons && details.seasons.length > 0) || s > 0 || ep > 0;
          if (isSeries) {
            if (s <= 0) s = 1;
            if (ep <= 0) ep = 1;
          }
          startPlayback(details, s, ep);
          return;
        }
      } catch (e) {
        console.warn('Deep link details fetch error:', e);
      }

      const mediaItem = {
        id: { provider: 'moviebox', value: watchId },
        title: decodeURIComponent(title) || 'Movie',
        media_type: season > 0 || episode > 0 ? 'series' : 'movie',
      };
      startPlayback(mediaItem, season, episode);
    } else if (movieId) {
      openDetailsModal(movieId, 'moviebox', decodeURIComponent(title));
    } else if (lang) {
      openLanguageView(lang);
    } else if (platform) {
      openPlatformView(platform);
    }
  }

  // Handle browser Back / Forward history buttons
  window.addEventListener('popstate', (e) => {
    if (!el.playerOverlay.classList.contains('hidden')) {
      closePlayer();
      return;
    }
    if (!el.detailsModal.classList.contains('hidden')) {
      closeDetailsModal();
      return;
    }
    if (e.state && e.state.id) {
      if (e.state.type === 'watch') {
        const item = { id: { provider: 'moviebox', value: e.state.id }, title: e.state.title, media_type: e.state.season > 0 ? 'series' : 'movie' };
        startPlayback(item, e.state.season || 0, e.state.episode || 0);
      } else if (e.state.type === 'movie') {
        openDetailsModal(e.state.id, 'moviebox', e.state.title);
      }
    }
  });

  // ==========================================================================
  // MEDIA DETAILS MODAL
  // ==========================================================================
  async function openDetailsModal(id, provider = 'moviebox', titleHint = '') {
    el.detailsModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const modalCard = el.detailsModal.querySelector('.modal-card');
    if (modalCard) modalCard.scrollTop = 0;

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

      // Update Browser URL & Programmatic SEO Metadata so every movie has its own unique, shareable link
      const detailsIdVal = getMediaIdValue(details);
      updateMovieUrl(detailsIdVal, details.title, true);
      updateSeoMeta(details, false, 0, 0);

      // Wire Share Link Button
      if (el.modalShareBtn) {
        el.modalShareBtn.onclick = () => {
          shareMovieLink(detailsIdVal, details.title, details.description, poster, false);
        };
      }
      el.modalPoster.src = poster;
      el.modalHeroBg.style.backgroundImage = `url('${poster}')`;
      el.modalTitle.textContent = displayTitle;
      el.modalTagline.textContent = details.tagline || '';
      el.modalYear.textContent = details.year || '2025';
      el.modalDuration.textContent = formatDisplayDuration(details.duration, details.media_type === 'series');
      el.modalMediaType.textContent = details.media_type === 'series' ? 'TV SERIES' : 'MOVIE';
      el.modalRating.textContent = `⭐ ${details.imdb_rating || '8.5'}`;
      el.modalOverview.textContent = details.description || 'No detailed overview available.';

      // NetMirror Signature Circular Progress Rating
      if (el.modalCircleRating) {
        const ratingNum = parseFloat(details.imdb_rating || details.rating || '8.5') || 8.5;
        const colorClass = ratingNum < 5.0 ? 'red' : ratingNum < 7.0 ? 'orange' : 'green';
        const strokePct = Math.min(100, Math.max(0, Math.round(ratingNum * 10)));
        el.modalCircleRating.innerHTML = `
          <svg viewBox="0 0 36 36" class="circular-chart ${colorClass}">
            <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path class="circle-stroke" stroke-dasharray="${strokePct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <text x="18" y="20.8" class="circle-text">${ratingNum.toFixed(1)}</text>
          </svg>
        `;
        el.modalCircleRating.title = `IMDb Score: ${ratingNum.toFixed(1)} / 10`;
      }

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
      if (isSeries) {
        if (!details.seasons || details.seasons.length === 0) {
          details.seasons = [{
            number: 1,
            season_number: 1,
            episodes: Array.from({ length: 10 }, (_, i) => ({
              season: 1,
              number: i + 1,
              episode_number: i + 1,
              title: `Episode ${i + 1}`,
              duration: '45 min',
            })),
          }];
        }
        const s0 = details.seasons[0];
        const s0Num = parseInt(s0.number ?? s0.season_number ?? 1, 10) || 1;
        state.currentSeason = s0Num;
        state.currentEpisode = 1;
        el.modalSeriesSection.classList.remove('hidden');
        populateSeasonSelector(details.seasons);
      } else {
        state.currentSeason = 0;
        state.currentEpisode = 0;
        el.modalSeriesSection.classList.add('hidden');
      }

      // Favorite Button State
      const isFav = (state.favorites || []).some((f) => isSameMedia(f, details));
      el.modalFavBtn.classList.toggle('fav-active', isFav);
      el.modalFavBtn.textContent = isFav ? '✓ In My List' : 'Add to List';

      // Play Button Handlers (Standard & NetMirror Animated Play SVG)
      const handlePlayClick = () => {
        closeDetailsModal();
        const s = isSeries ? (parseInt(state.currentSeason, 10) || 1) : 0;
        const e = isSeries ? (parseInt(state.currentEpisode, 10) || 1) : 0;
        startPlayback(details, s, e);
      };
      el.modalPlayBtn.onclick = handlePlayClick;
      if (el.modalNetmirrorPlayBtn) {
        el.modalNetmirrorPlayBtn.onclick = handlePlayClick;
      }

      // AdSense dynamic impression refresh for modal view
      const monConfig = window.NETMIRROR_MONETIZATION || {};
      loadAdSenseUnit(el.userDetailsAdBanner, monConfig.adBanners?.detailsBannerHtml);

    } catch (err) {
      console.error(err);
      el.modalOverview.textContent = 'Error loading media details. Please try again.';
      showToast('Could not load details');
    }
  }

  function populateSeasonSelector(seasons) {
    el.seasonSelect.innerHTML = '';
    seasons.forEach((season, idx) => {
      const sNum = parseInt(season.number ?? season.season_number ?? (idx + 1), 10) || (idx + 1);
      const eps = season.episodes || [];
      const opt = document.createElement('option');
      opt.value = sNum;
      opt.textContent = `Season ${sNum} (${eps.length} Episodes)`;
      el.seasonSelect.appendChild(opt);
    });

    const firstSeason = seasons[0];
    const firstSNum = parseInt(firstSeason ? (firstSeason.number ?? firstSeason.season_number ?? 1) : 1, 10) || 1;
    state.currentSeason = firstSNum;
    state.currentEpisode = 1;
    if (el.episodeSearchInput) el.episodeSearchInput.value = '';
    renderEpisodes(firstSeason ? firstSeason.episodes : []);

    el.seasonSelect.onchange = (e) => {
      const sNum = parseInt(e.target.value, 10) || 1;
      state.currentSeason = sNum;
      state.currentEpisode = 1;
      if (el.episodeSearchInput) el.episodeSearchInput.value = '';
      const found = seasons.find((s, idx) => ((parseInt(s.number ?? s.season_number ?? (idx + 1), 10) || (idx + 1)) === sNum));
      if (found) {
        renderEpisodes(found.episodes);
      }
    };

    el.episodeSearchInput.oninput = (e) => {
      const q = e.target.value.toLowerCase().trim();
      const currentSeasonData = seasons.find((s, idx) => ((parseInt(s.number ?? s.season_number ?? (idx + 1), 10) || (idx + 1)) === state.currentSeason));
      if (currentSeasonData) {
        const filtered = (currentSeasonData.episodes || []).filter((ep, idx) => {
          const epNum = parseInt(ep.number ?? ep.episode_number ?? (idx + 1), 10) || (idx + 1);
          return (ep.title && ep.title.toLowerCase().includes(q)) || String(epNum).includes(q);
        });
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

    const activeEp = parseInt(state.currentEpisode, 10) || 1;
    episodes.forEach((ep, idx) => {
      const epNum = parseInt(ep.number ?? ep.episode_number ?? (idx + 1), 10) || (idx + 1);
      const epCard = document.createElement('div');
      epCard.className = `episode-card${epNum === activeEp ? ' active' : ''}`;
      const poster = (state.currentDetails && state.currentDetails.poster_url) || fallbackPoster((state.currentDetails && state.currentDetails.title) || 'Episode');
      const epTitle = ep.title || `Episode ${epNum}`;
      const epOverview = ep.overview || `Watch Season ${state.currentSeason || 1} Episode ${epNum}.`;

      epCard.innerHTML = `
        <div class="ep-num">${String(epNum).padStart(2, '0')}</div>
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
        const s = parseInt(state.currentSeason, 10) || 1;
        const e = parseInt(epNum, 10) || 1;
        state.currentSeason = s;
        state.currentEpisode = e;
        startPlayback(state.currentDetails, s, e);
      });

      el.episodesGrid.appendChild(epCard);
    });
  }

  function closeDetailsModal() {
    el.detailsModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    if (el.playerOverlay.classList.contains('hidden')) {
      revertUrlToBase();
    }
  }

  function openPlayerDirect(item) {
    const isSeries = item.media_type === 'series'
      || (item.season && parseInt(item.season, 10) > 0)
      || /\bS\d+(-S\d+)?\b/i.test(item.title || '')
      || /\bSeason\s*\d+\b/i.test(item.title || '');
    const s = isSeries ? (parseInt(item.season, 10) || 1) : 0;
    const e = isSeries ? (parseInt(item.episode, 10) || 1) : 0;
    startPlayback(item, s, e);
  }

  // ==========================================================================
  // WEB AUDIO STUDIO ENHANCER & VOLUME BOOSTER (0% - 300%)
  // ==========================================================================
  let audioCtx = null;
  let sourceNode = null;
  let bassNode = null;
  let voiceNode = null;
  let trebleNode = null;
  let compressorNode = null;
  let boostGainNode = null;
  let limiterNode = null;
  let isAudioEngineReady = false;

  const audioProfiles = {
    balanced: {
      name: 'Studio Balanced',
      badge: 'Balanced',
      bass: 0.0,
      voice: 0.0,
      treble: 0.0,
      boost: 1.0,
      compressor: { threshold: -12, knee: 10, ratio: 2, attack: 0.005, release: 0.2 },
      desc: 'Clean, flat reference studio acoustic passthrough'
    },
    cinema: {
      name: 'Cinema Theater',
      badge: 'Cinema',
      bass: 5.5,
      voice: 4.5,
      treble: 3.0,
      boost: 1.5,
      compressor: { threshold: -22, knee: 24, ratio: 4, attack: 0.003, release: 0.25 },
      desc: 'Theater surround, warm bass punch & clear dialogue'
    },
    theater: {
      name: 'Cinema Theater',
      badge: 'Cinema',
      bass: 5.5,
      voice: 4.5,
      treble: 3.0,
      boost: 1.5,
      compressor: { threshold: -22, knee: 24, ratio: 4, attack: 0.003, release: 0.25 },
      desc: 'Theater surround, warm bass punch & clear dialogue'
    },
    vocal: {
      name: 'Vocal Clarity',
      badge: 'Vocal',
      bass: -1.0,
      voice: 7.5,
      treble: 2.5,
      boost: 1.6,
      compressor: { threshold: -26, knee: 18, ratio: 6, attack: 0.002, release: 0.2 },
      desc: 'Crisp speech, lifts whisper audio & dialogue'
    },
    bass: {
      name: 'Bass Blast',
      badge: 'Bass',
      bass: 8.5,
      voice: 2.0,
      treble: 3.5,
      boost: 1.5,
      compressor: { threshold: -20, knee: 30, ratio: 3.5, attack: 0.005, release: 0.3 },
      desc: 'Heavy low-end rumble for explosions and blockbusters'
    },
    night: {
      name: 'Night Mode',
      badge: 'Night',
      bass: -2.5,
      voice: 5.0,
      treble: 0.5,
      boost: 1.3,
      compressor: { threshold: -32, knee: 20, ratio: 8, attack: 0.001, release: 0.15 },
      desc: 'Softens loud explosions, boosts quiet whispers'
    },
    loud: {
      name: 'Super Loud 300%',
      badge: '300%',
      bass: 4.0,
      voice: 5.0,
      treble: 3.0,
      boost: 3.0,
      compressor: { threshold: -18, knee: 20, ratio: 5, attack: 0.002, release: 0.2 },
      desc: 'Maximized volume boost with anti-clipping limiter'
    },
    pure: {
      name: 'Pure Neutral',
      badge: 'Pure',
      bass: 0.0,
      voice: 0.0,
      treble: 0.0,
      boost: 1.0,
      compressor: { threshold: 0, knee: 0, ratio: 1, attack: 0.01, release: 0.1 },
      desc: 'Flat studio passthrough without equalization'
    }
  };

  function ensureAudioEngine() {
    if (el.videoElement) {
      el.videoElement.muted = false;
      if (el.videoElement.volume <= 0.05) {
        el.videoElement.volume = 1.0;
      }
    }

    if (!audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      } catch (e) {
        console.warn('AudioContext init note:', e);
      }
    }

    if (audioCtx && !sourceNode && el.videoElement) {
      try {
        sourceNode = audioCtx.createMediaElementSource(el.videoElement);
        bassNode = audioCtx.createBiquadFilter();
        bassNode.type = 'lowshelf';
        bassNode.frequency.value = 250;

        voiceNode = audioCtx.createBiquadFilter();
        voiceNode.type = 'peaking';
        voiceNode.frequency.value = 2500;
        voiceNode.Q.value = 1.0;

        trebleNode = audioCtx.createBiquadFilter();
        trebleNode.type = 'highshelf';
        trebleNode.frequency.value = 4000;

        compressorNode = audioCtx.createDynamicsCompressor();

        boostGainNode = audioCtx.createGain();
        boostGainNode.gain.value = state.audioBoost || 1.5;

        // Chain: source -> bass -> voice -> treble -> compressor -> boostGain -> destination
        sourceNode.connect(bassNode);
        bassNode.connect(voiceNode);
        voiceNode.connect(trebleNode);
        trebleNode.connect(compressorNode);
        compressorNode.connect(boostGainNode);
        boostGainNode.connect(audioCtx.destination);
      } catch (err) {
        console.warn('MediaElementSource note (direct audio fallback):', err);
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    isAudioEngineReady = true;
  }

  function applyAudioProfile(profileKey, showNotification = true) {
    const profile = audioProfiles[profileKey] || audioProfiles.theater || audioProfiles.cinema;
    state.audioProfile = profileKey;
    localStorage.setItem('moviebox_audio_profile', profileKey);

    if (profile.boost && Math.abs((state.audioBoost || 1.5) - profile.boost) > 0.05) {
      setVolumeBoost(profile.boost, true);
    }

    if (audioCtx) {
      const now = audioCtx.currentTime;
      if (bassNode) bassNode.gain.setTargetAtTime(profile.bass, now, 0.05);
      if (voiceNode) {
        const voiceGain = state.audioVoiceEq ? profile.voice : 0;
        voiceNode.gain.setTargetAtTime(voiceGain, now, 0.05);
      }
      if (trebleNode) trebleNode.gain.setTargetAtTime(profile.treble, now, 0.05);

      if (compressorNode && profile.compressor) {
        compressorNode.threshold.setTargetAtTime(profile.compressor.threshold, now, 0.05);
        compressorNode.knee.setTargetAtTime(profile.compressor.knee, now, 0.05);
        compressorNode.ratio.setTargetAtTime(profile.compressor.ratio, now, 0.05);
        compressorNode.attack.setTargetAtTime(profile.compressor.attack, now, 0.05);
        compressorNode.release.setTargetAtTime(profile.compressor.release, now, 0.05);
      }
    }

    updateAudioEnhancerUI();

    if (showNotification) {
      showToast(`Sound Profile: ${profile.name}`);
    }
  }

  function setVolumeBoost(multiplier, save = true) {
    const clamped = Math.max(0.5, Math.min(3.0, parseFloat(multiplier) || 1.5));
    state.audioBoost = clamped;
    if (save) {
      localStorage.setItem('moviebox_audio_boost', String(clamped));
    }

    if (el.videoElement) {
      el.videoElement.muted = false;
      el.videoElement.volume = 1.0;
    }

    if (boostGainNode && audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      boostGainNode.gain.setTargetAtTime(clamped, audioCtx.currentTime, 0.05);
    }

    updateAudioEnhancerUI();
  }

  function cycleAudioProfile() {
    const keys = Object.keys(audioProfiles);
    const currentIndex = keys.indexOf(state.audioProfile || 'cinema');
    const nextIndex = (currentIndex + 1) % keys.length;
    const nextKey = keys[nextIndex];
    applyAudioProfile(nextKey, true);
  }

  function updateAudioEnhancerUI() {
    const boostPercent = Math.round((state.audioBoost || 1.5) * 100);
    const profile = audioProfiles[state.audioProfile || 'cinema'] || audioProfiles.cinema;

    // Update Badge & Watch Bar Labels
    if (el.audioEnhanceBadge) {
      el.audioEnhanceBadge.textContent = `${profile.badge} ${boostPercent}%`;
    }
    if (el.watchSoundBoosterLabel) {
      el.watchSoundBoosterLabel.textContent = `🔊 Sound (${profile.name} ${boostPercent}%)`;
    }
    if (el.floatingSoundLabel) {
      el.floatingSoundLabel.textContent = `${boostPercent}%`;
    }

    // Update Level Label
    if (el.boostLevelLabel) {
      const extra = boostPercent > 100 ? ` (${boostPercent}% Loud)` : ' (Standard)';
      el.boostLevelLabel.textContent = `${boostPercent}%${extra}`;
    }
    if (el.modalBoostLevelLabel) {
      const extra = boostPercent > 100 ? ` (${boostPercent}% Loud)` : ' (Standard)';
      el.modalBoostLevelLabel.textContent = `${boostPercent}%${extra}`;
    }

    // Update Slider
    if (el.boostRangeSlider) {
      el.boostRangeSlider.value = state.audioBoost || 1.5;
    }
    if (el.modalBoostRangeSlider) {
      el.modalBoostRangeSlider.value = state.audioBoost || 1.5;
    }

    // Update Chips
    document.querySelectorAll('.boost-chip, .modal-boost-chip').forEach((chip) => {
      const val = parseFloat(chip.dataset.boost);
      chip.classList.toggle('active', Math.abs(val - (state.audioBoost || 1.5)) < 0.1);
    });

    // Update Presets List
    if (el.enhancerPresetsList) {
      el.enhancerPresetsList.querySelectorAll('.preset-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.preset === (state.audioProfile || 'cinema'));
      });
    }
    if (el.modalPresetsList) {
      el.modalPresetsList.querySelectorAll('.preset-item').forEach((item) => {
        item.classList.toggle('active', item.dataset.preset === (state.audioProfile || 'cinema'));
      });
    }

    updateVolumeSliderUI();
  }

  function updateVolumeSliderUI() {
    const video = el.videoElement;
    if (!video || !el.volumePercentBadge) return;

    if (video.muted || video.volume === 0) {
      el.volumePercentBadge.textContent = 'Muted';
      el.volumePercentBadge.style.color = 'var(--text-muted)';
    } else {
      const boostVal = (boostGainNode && audioCtx) ? boostGainNode.gain.value : (state.audioBoost || 1.5);
      const totalPercent = Math.round(video.volume * boostVal * 100);
      let icon = '';
      if (totalPercent >= 200) icon = ' 🔥';
      else if (totalPercent >= 140) icon = ' ⚡';
      el.volumePercentBadge.textContent = `${totalPercent}%${icon}`;
      el.volumePercentBadge.style.color = totalPercent > 100 ? '#ff4d58' : '#38bdf8';
    }
  }

  // ==========================================================================
  // IN-BROWSER VIDEO PLAYER & 3-COLUMN CINEMA COCKPIT
  // Left: Servers List | Center: Video Player | Right: Seasons & Episodes
  // ==========================================================================
  function getDefaultEmbedServers(media, s = 1, ep = 1) {
    const isSeries = Boolean(s > 0 || ep > 0 || media?.media_type === 'series');
    const mediaIdVal = getMediaIdValue(media);
    const detailsIdVal = getMediaIdValue(state.currentDetails);
    const targetId = (media && (media.tmdb_id || media.tm_id))
      || (mediaIdVal.startsWith('tt') ? mediaIdVal : null)
      || (state.currentDetails && (state.currentDetails.tmdb_id || state.currentDetails.tm_id))
      || (detailsIdVal.startsWith('tt') ? detailsIdVal : null)
      || (mediaIdVal || '284054');

    return [
      {
        name: 'VidLink Cloud (4K)',
        url: isSeries
          ? `https://vidlink.pro/tv/${targetId}/${s}/${ep}?primaryColor=e50914&nextbutton=true&autoplay=true`
          : `https://vidlink.pro/movie/${targetId}?primaryColor=e50914&autoplay=true`
      },
      {
        name: 'SmashyStream (Cinema HD)',
        url: isSeries
          ? `https://embed.smashystream.com/playere.php?imdb=${targetId}&season=${s}&episode=${ep}`
          : `https://embed.smashystream.com/playere.php?imdb=${targetId}`
      },
      {
        name: 'MultiEmbed (Cloud Fast)',
        url: isSeries
          ? `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${s}&e=${ep}`
          : `https://multiembed.mov/?video_id=${targetId}&tmdb=1`
      },
      {
        name: '2Embed (Ultra HD)',
        url: isSeries
          ? `https://www.2embed.cc/embedtv/${targetId}&s=${s}&e=${ep}`
          : `https://www.2embed.cc/embed/${targetId}`
      },
      {
        name: 'AutoEmbed (VIP)',
        url: isSeries
          ? `https://player.autoembed.cc/embed/tv/${targetId}/${s}/${ep}`
          : `https://player.autoembed.cc/embed/movie/${targetId}`
      }
    ];
  }

  function updateCurrentStreamIndicator(serverName) {
    if (el.currentStreamIndicator) {
      el.currentStreamIndicator.innerHTML = `⚡ ${serverName || 'Server 1 • Cloud Pro (4K UHD)'}`;
    }
  }

  function renderWatchMovieRecommendations(media) {
    if (!el.watchMovieRecsContainer || !el.watchMovieRecsGrid) return;
    el.watchMovieRecsGrid.innerHTML = '';

    const allTitles = [
      ...(state.currentCatalog || []),
      ...(state.browseData?.movies || []),
      ...(state.browseData?.trending || []),
      ...(DEFAULT_SHOWCASE_CATALOG.movies || []),
      ...(DEFAULT_SHOWCASE_CATALOG.trending || [])
    ];

    const currentKey = getCanonicalKey(media);
    const seen = new Set();
    if (currentKey) seen.add(currentKey);

    const recs = [];
    for (const item of allTitles) {
      if (!item || item.media_type === 'series') continue;
      const k = getCanonicalKey(item) || getMediaIdValue(item);
      if (k && seen.has(k)) continue;
      if (k) seen.add(k);
      recs.push(item);
      if (recs.length >= 8) break;
    }

    recs.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'watch-rec-card';
      const title = cleanDisplayTitle(item.title);
      const poster = item.poster_url || fallbackPoster(title);
      card.innerHTML = `
        <img class="watch-rec-poster" src="${poster}" alt="${title}" loading="lazy" onerror="this.src='${fallbackPoster(title)}'" />
        <span class="watch-rec-title" title="${title}">${title}</span>
        <div class="watch-rec-meta">
          <span>${item.year || 'Movie'}</span>
          <span>⭐ 8.6</span>
        </div>
      `;
      card.addEventListener('click', () => {
        openPlayerDirect(item);
      });
      el.watchMovieRecsGrid.appendChild(card);
    });
  }

  function initWatchMobileTabs() {
    if (!el.watchMobileTabs) return;
    const tabBtns = el.watchMobileTabs.querySelectorAll('.watch-mobile-tab');
    const layout = document.getElementById('watchMainLayout');
    if (layout && !layout.getAttribute('data-mobile-tab')) {
      layout.setAttribute('data-mobile-tab', 'player');
    }

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach((b) => b.classList.toggle('active', b === btn));
        if (layout) {
          layout.setAttribute('data-mobile-tab', target);
        }

        if (target === 'player' && el.playerContainer) {
          el.playerContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (target === 'servers' && el.watchServersColumn) {
          el.watchServersColumn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (target === 'episodes' && el.watchEpisodesColumn) {
          el.watchEpisodesColumn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if (target === 'info' && el.watchVideoFooter) {
          el.watchVideoFooter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  async function startPlayback(media, season = 0, episode = 0) {
    const reqId = ++state.playbackRequestSeq;
    el.playerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    el.playerSpinner.classList.remove('hidden');
    el.spinnerText.textContent = 'Resolving video streams...';

    let s = parseInt(season, 10) || 0;
    let ep = parseInt(episode, 10) || 0;

    const mediaIdVal = getMediaIdValue(media);
    const hasMatchingDetails = isSameMedia(state.currentDetails, media);
    const titleLooksSeries = /\bS\d+(-S\d+)?\b/i.test(media.title || '') || /\bSeason\s*\d+\b/i.test(media.title || '');
    const isSeries = media.media_type === 'series'
      || s > 0
      || ep > 0
      || titleLooksSeries
      || (media.seasons && media.seasons.length > 0)
      || (hasMatchingDetails && (state.currentDetails.media_type === 'series' || (state.currentDetails.seasons && state.currentDetails.seasons.length > 0)));

    // Set Header Info
    el.playerMediaTitle.textContent = media.title;
    if (isSeries) {
      if (s <= 0) s = 1;
      if (ep <= 0) ep = 1;
      el.playerMediaSubtitle.textContent = `Season ${s} • Episode ${ep}`;
      if (el.nextEpisodeControlBtn) el.nextEpisodeControlBtn.classList.remove('hidden');
    } else {
      el.playerMediaSubtitle.textContent = media.year || 'Movie';
      if (el.nextEpisodeControlBtn) el.nextEpisodeControlBtn.classList.add('hidden');
    }
    if (media.duration && el.durationTime) {
      const parsedSecs = parseDurationToSeconds(media.duration);
      if (parsedSecs > 0) el.durationTime.textContent = formatTime(parsedSecs);
    }

    state.currentSeason = s;
    state.currentEpisode = ep;
    state.currentStreamIndex = 0;

    // Reset layout & mobile tab state
    const layout = document.getElementById('watchMainLayout');
    if (layout) {
      layout.setAttribute('data-mobile-tab', 'player');
    }
    if (el.watchServersColumn) el.watchServersColumn.style.display = '';
    if (el.watchEpisodesColumn) el.watchEpisodesColumn.style.display = '';
    if (el.watchVideoFooter) el.watchVideoFooter.style.display = '';
    if (el.watchMobileTabs) {
      const tabs = el.watchMobileTabs.querySelectorAll('.watch-mobile-tab');
      tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === 'player'));
    }

    // 1. LEFT SIDEBAR: Instantly populate servers on the left side (0ms instant display)
    state.embedUrls = getDefaultEmbedServers(media, s, ep);
    populateServerMenu(state.currentStreams || [], state.embedUrls);
    updateCurrentStreamIndicator('Server 1 • Cloud Pro (4K UHD)');

    // 2. RIGHT SIDEBAR: Show Season & Episode selector for series, or Recommended Movies for movies
    if (el.watchEpisodesColumn) el.watchEpisodesColumn.classList.remove('hidden');
    if (isSeries) {
      if (el.watchSeriesContainer) el.watchSeriesContainer.classList.remove('hidden');
      if (el.watchMovieRecsContainer) el.watchMovieRecsContainer.classList.add('hidden');
      if (el.watchRightColTitle) el.watchRightColTitle.textContent = 'Seasons & Episodes';
      if (el.watchRightColSub) el.watchRightColSub.textContent = `Season ${s} • Select episode`;
      if (el.watchRightColIcon) el.watchRightColIcon.textContent = '📺';
      setupWatchEpisodesPanel(media, s, ep, true, reqId);
    } else {
      if (el.watchSeriesContainer) el.watchSeriesContainer.classList.add('hidden');
      if (el.watchMovieRecsContainer) el.watchMovieRecsContainer.classList.remove('hidden');
      if (el.watchRightColTitle) el.watchRightColTitle.textContent = 'Recommended Titles';
      if (el.watchRightColSub) el.watchRightColSub.textContent = 'More movies you might like';
      if (el.watchRightColIcon) el.watchRightColIcon.textContent = '🎬';
      renderWatchMovieRecommendations(media);
      if (!hasMatchingDetails) {
        setupWatchEpisodesPanel(media, s, ep, false, reqId);
      }
    }

    // Update Browser URL & Programmatic SEO Metadata so every watch stream has its own unique, shareable watch URL
    updateWatchUrl(mediaIdVal, s, ep, media.title, true);
    updateSeoMeta(media, true, s, ep);

    // Wire Share Stream URL button
    if (el.playerShareBtn) {
      el.playerShareBtn.onclick = () => {
        shareMovieLink(mediaIdVal, media.title, '', media.poster_url || '', true, s, ep);
      };
    }

    // Pre-warm playback immediately
    const preWarmEmbed = (state.userLockedEmbedServer && state.embedUrls.find(e => e.name === state.currentEmbedServerName)) || state.embedUrls[0];
    if (preWarmEmbed) {
      playEmbedUrl(preWarmEmbed.url, preWarmEmbed.name);
    }

    try {
      const titleParam = encodeURIComponent(media.title || '');
      const providerParam = media.id && media.id.provider ? `&provider=${media.id.provider}` : '';
      const typeParam = isSeries ? '&type=tv' : '';
      const res = await fetch(`/api/streams/${mediaIdVal}?season=${s}&episode=${ep}&title=${titleParam}${providerParam}${typeParam}`);
      if (reqId !== state.playbackRequestSeq) return;
      if (!res.ok) throw new Error('No streams found');
      const data = await res.json();
      if (reqId !== state.playbackRequestSeq) return;

      // Sort streams so highest quality (4K, 1080p, FHD, high-bitrate) is always prioritized!
      const qualityScore = (q) => {
        const str = String(q || '').toLowerCase();
        if (str.includes('4k') || str.includes('2160') || str.includes('ultra')) return 4000;
        if (str.includes('1080') || str.includes('fhd')) return 1080;
        if (str.includes('720') || str.includes('hd')) return 720;
        if (str.includes('480')) return 480;
        if (str.includes('auto')) return 500;
        return 100;
      };
      state.currentStreams = (data.streams || []).sort((a, b) => qualityScore(b.quality) - qualityScore(a.quality));
      state.embedUrls = data.embed_urls || [];
      ensureAudioEngine();

      // Check Saved Timestamp
      const historyItem = (state.history || []).find(
        (h) => isSameMedia(h, media) && (parseInt(h.season, 10) || 0) === s && (parseInt(h.episode, 10) || 0) === ep
      );
      const resumeTime = historyItem ? historyItem.currentTime : 0;

      // Populate Server Menu & Top Server Pills Bar
      populateServerMenu(state.currentStreams, state.embedUrls);

      // Toggle floating dubs button on player if audio tracks / dubs are available
      if (el.floatingAudioBtn) {
        const hasDubs = (state.currentDetails?.dubs && state.currentDetails.dubs.length > 0) || (media && media.dubs && media.dubs.length > 0);
        if (hasDubs) {
          el.floatingAudioBtn.classList.remove('hidden');
        } else {
          el.floatingAudioBtn.classList.add('hidden');
        }
      }

      if (state.userLockedEmbedServer && state.embedUrls.length > 0) {
        // If user explicitly chose an embed provider, stay on that mirror for the new episode!
        const matchingEmbed = state.embedUrls.find(e => e.name === state.currentEmbedServerName) || state.embedUrls[state.currentEmbedIndex] || state.embedUrls[0];
        if (!el.embedPlayerIframe || el.embedPlayerIframe.src !== matchingEmbed.url) {
          playEmbedUrl(matchingEmbed.url, matchingEmbed.name);
        }
      } else if (state.embedUrls.length > 0) {
        // Fast Cloud Mirrors are prioritized as Server 1 for zero-delay, instant playback!
        const targetEmbed = state.embedUrls[0];
        if (!state.isEmbedMode || !el.embedPlayerIframe || el.embedPlayerIframe.src !== targetEmbed.url) {
          playEmbedUrl(targetEmbed.url, targetEmbed.name);
        }
      } else if (state.currentStreams.length > 0) {
        // Fallback to direct stream if no embed mirrors
        state.isEmbedMode = false;
        state.userLockedEmbedServer = false;
        clearEmbedIframe();
        el.videoElement.classList.remove('hidden');
        if (el.playerControls) {
          el.playerControls.classList.remove('hidden');
        }
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
          loadSubtitles(mediaIdVal, data.resource_id, s, ep);
        }

        // Play video
        playStreamUrl(defaultStream.proxy_url, resumeTime);
      } else {
        throw new Error('No playable stream mirrors available');
      }

      // Record to history
      saveToHistory(media, s, ep);

    } catch (err) {
      if (reqId !== state.playbackRequestSeq) return;
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

  async function setupWatchEpisodesPanel(media, activeSeason, activeEpisode, knownSeries = true, reqId = state.playbackRequestSeq) {
    const mediaIdVal = getMediaIdValue(media);
    let details = (media && media.seasons && media.seasons.length > 0) ? media : state.currentDetails;
    const isMatchingId = isSameMedia(details, media);
    const hasValidSeasons = isMatchingId && details && details.seasons && details.seasons.length > 0;

    // Immediately render with whatever seasons we already have so the UI responds right away
    if (knownSeries) {
      renderWatchEpisodes(hasValidSeasons ? details : media, activeSeason, activeEpisode);
    }

    if (!hasValidSeasons && mediaIdVal) {
      try {
        const titleParam = media && media.title ? `&title=${encodeURIComponent(media.title)}` : '';
        const providerVal = getMediaProvider(media);
        const providerParam = providerVal ? `&provider=${encodeURIComponent(providerVal)}` : '';
        const typeParam = knownSeries ? 'type=tv' : '';
        const res = await fetch(`/api/details/${encodeURIComponent(mediaIdVal)}?${typeParam}${titleParam}${providerParam}`);
        if (reqId !== state.playbackRequestSeq) return;
        if (res.ok) {
          details = await res.json();
          if (reqId !== state.playbackRequestSeq) return;
          state.currentDetails = details;
          if (details) {
            const isSer = details.media_type === 'series' || (details.seasons && details.seasons.length > 0) || activeSeason > 0 || activeEpisode > 0;
            const targetS = activeSeason > 0 ? activeSeason : 1;
            const targetEp = activeEpisode > 0 ? activeEpisode : 1;
            if (isSer) {
              el.playerMediaSubtitle.textContent = `Season ${targetS} • Episode ${targetEp}`;
            } else {
              el.playerMediaSubtitle.textContent = details.year || 'Movie';
            }
            if (details.duration && el.durationTime && (!el.videoElement.duration || isNaN(el.videoElement.duration) || el.videoElement.duration === 0)) {
              const parsedSecs = parseDurationToSeconds(details.duration);
              if (parsedSecs > 0) el.durationTime.textContent = formatTime(parsedSecs);
            }
          }

          const detectedSeries = details.media_type === 'series' || (details.seasons && details.seasons.length > 0);
          if (!knownSeries && detectedSeries) {
            const targetS = activeSeason > 0 ? activeSeason : 1;
            const targetEp = activeEpisode > 0 ? activeEpisode : 1;
            if (el.watchEpisodesColumn) el.watchEpisodesColumn.classList.remove('hidden');
            renderWatchEpisodes(details, targetS, targetEp);
            startPlayback(details, targetS, targetEp);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not fetch series seasons:', err);
      }
    }

    if (reqId !== state.playbackRequestSeq) return;
    if (knownSeries || (details && (details.media_type === 'series' || (details.seasons && details.seasons.length > 0)))) {
      if (el.watchEpisodesColumn) el.watchEpisodesColumn.classList.remove('hidden');
      renderWatchEpisodes(details || media, activeSeason, activeEpisode);
    }
  }

  function renderWatchEpisodes(details, curSeason, curEpisode) {
    if (!el.watchEpisodesColumn || !el.watchEpisodesGrid || !el.watchSeasonsRow) return;

    let seasons = (details && details.seasons && details.seasons.length > 0) ? details.seasons : null;
    if (!seasons) {
      seasons = [{
        number: 1,
        season_number: 1,
        episodes: Array.from({ length: 10 }, (_, i) => ({
          number: i + 1,
          episode_number: i + 1,
          title: `Episode ${i + 1}`,
        })),
      }];
    }

    let sNum = parseInt(curSeason, 10) || 1;
    let activeSeasonObj = seasons.find((s, idx) => (parseInt(s.number ?? s.season_number ?? (idx + 1), 10) || (idx + 1)) === sNum) || seasons[0];
    sNum = activeSeasonObj ? (parseInt(activeSeasonObj.number ?? activeSeasonObj.season_number ?? 1, 10) || 1) : 1;
    state.currentSeason = sNum;

    let epNumActive = parseInt(curEpisode, 10) || 1;
    state.currentEpisode = epNumActive;

    // Render Season Badges (SE1, SE2...)
    el.watchSeasonsRow.innerHTML = '';
    seasons.forEach((sObj, idx) => {
      const sn = parseInt(sObj.number ?? sObj.season_number ?? (idx + 1), 10) || (idx + 1);
      const sBtn = document.createElement('button');
      sBtn.type = 'button';
      sBtn.className = `watch-season-pill ${sn === sNum ? 'active' : ''}`;
      sBtn.textContent = `SE${sn}`;
      sBtn.addEventListener('click', () => {
        state.currentSeason = sn;
        state.currentEpisode = 1;
        const targetDetails = (details && details.seasons && details.seasons.length > 0) ? details : (state.currentDetails || details);
        renderWatchEpisodes(targetDetails, sn, 1);
        startPlayback(targetDetails, sn, 1);
      });
      el.watchSeasonsRow.appendChild(sBtn);
    });

    // Render Episode Buttons Grid (1, 2, 3, 4, 5, 6, 7...)
    el.watchEpisodesGrid.innerHTML = '';
    const epList = (activeSeasonObj && activeSeasonObj.episodes && activeSeasonObj.episodes.length > 0)
      ? activeSeasonObj.episodes
      : Array.from({ length: 10 }, (_, i) => ({ number: i + 1, episode_number: i + 1, title: `Episode ${i + 1}` }));

    let activeBtnEl = null;
    epList.forEach((ep, idx) => {
      const epNum = parseInt(ep.number ?? ep.episode_number ?? (idx + 1), 10) || (idx + 1);
      const isSelected = epNum === epNumActive;
      const epBtn = document.createElement('button');
      epBtn.type = 'button';
      epBtn.className = `watch-ep-btn ${isSelected ? 'active' : ''}`;
      if (isSelected) {
        epBtn.innerHTML = `${epNum} <span class="ep-live-signal"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></span>`;
        activeBtnEl = epBtn;
      } else {
        epBtn.textContent = String(epNum);
      }
      epBtn.title = ep.title || `Episode ${epNum}`;

      epBtn.addEventListener('click', () => {
        state.currentSeason = sNum;
        state.currentEpisode = epNum;
        if (el.watchSelectedEpCard) {
          el.watchSelectedEpCard.textContent = `Season ${sNum} Selected Episode: ${epNum}`;
        }
        const targetDetails = (details && details.seasons && details.seasons.length > 0) ? details : (state.currentDetails || details);
        renderWatchEpisodes(targetDetails, sNum, epNum);
        startPlayback(targetDetails, sNum, epNum);
      });
      el.watchEpisodesGrid.appendChild(epBtn);
    });

    if (activeBtnEl) {
      activeBtnEl.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }

    // Update Selected Episode Card (matching screenshot format)
    if (el.watchSelectedEpCard) {
      el.watchSelectedEpCard.textContent = `Season ${sNum} Selected Episode: ${epNumActive}`;
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes <= 0) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(0)} MB`;
  }

  function copyTextToClipboard(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const dummy = document.createElement('input');
    dummy.style.position = 'fixed';
    dummy.style.opacity = '0';
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
  }

  function renderDownloadModal() {
    if (!el.downloadGuideModal) return;
    const details = state.currentDetails;
    const s = state.currentSeason || 1;
    const ep = state.currentEpisode || 1;
    const isSeries = details?.media_type === 'series' || s > 0;
    const rawTitle = details?.title || 'Video Title';
    const cleanTitle = rawTitle.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = isSeries ? `${cleanTitle}_S${s}E${ep}` : cleanTitle;

    if (el.downloadTitleText) {
      el.downloadTitleText.textContent = rawTitle;
    }
    if (el.downloadPosterImg && details?.poster_url) {
      el.downloadPosterImg.src = details.poster_url;
    }
    if (el.downloadSeasonEpBadge) {
      el.downloadSeasonEpBadge.textContent = isSeries ? `Season ${s} • Episode ${ep}` : (details?.year ? `${details.year} Movie` : 'Feature Film');
    }

    if (!el.downloadStreamsList) {
      el.downloadGuideModal.classList.remove('hidden');
      return;
    }

    el.downloadStreamsList.innerHTML = '';

    // If direct streams exist in state.currentStreams, list each quality
    const directStreams = state.currentStreams || [];
    let bestStreamUrl = null;

    if (directStreams.length > 0) {
      const heading = document.createElement('div');
      heading.className = 'download-section-heading';
      heading.textContent = '🚀 Direct High-Speed Download Streams';
      el.downloadStreamsList.appendChild(heading);

      directStreams.forEach((stream) => {
        const qual = stream.quality || 'HD';
        const isUhd = /2160|4k|uhd|4320|8k/i.test(qual) || /ultra/i.test(stream.server);
        const isFhd = /1080/i.test(qual);
        const card = document.createElement('div');
        card.className = `download-quality-card ${isUhd ? 'uhd-card' : ''}`;

        const sizeStr = stream.size_bytes ? ` • ${formatBytes(stream.size_bytes)}` : '';
        const codecStr = stream.codec ? ` • ${stream.codec.toUpperCase()}` : '';
        const directFileUrl = stream.direct_url || stream.proxy_url;
        const streamFile = `${fileName}_${qual}.mp4`;
        if (!bestStreamUrl && directFileUrl) bestStreamUrl = directFileUrl;

        card.innerHTML = `
          <div class="download-quality-info">
            <div class="download-quality-name">
              <span>${isUhd ? '⚡' : isFhd ? '🎬' : '📱'} ${qual} ${isUhd ? 'Ultra HD' : isFhd ? 'Full HD' : 'HD'}</span>
              ${isUhd ? '<span class="download-badge-uhd">4K UHD</span>' : ''}
            </div>
            <div class="download-quality-meta">${stream.server}${codecStr}${sizeStr} • Direct CDN MP4</div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;">
            <button type="button" class="download-action-btn btn-copy" title="Copy Direct Stream Link for IDM/ADM/VLC">
              📋 Copy Link
            </button>
            <a href="${directFileUrl}" download="${streamFile}" target="_blank" class="download-action-btn">
              ⬇ Download
            </a>
          </div>
        `;

        card.querySelector('.btn-copy').addEventListener('click', () => {
          copyTextToClipboard(directFileUrl);
          showToast('📋 Direct MP4 Stream URL copied! Paste into IDM, 1DM, ADM or VLC for max speed.');
        });

        el.downloadStreamsList.appendChild(card);
      });
    } else if (getMediaIdValue(details) && !state.downloadModalStreamsLoading) {
      state.downloadModalStreamsLoading = true;
      const detailsStreamId = getMediaIdValue(details);
      fetch(`/api/streams/${encodeURIComponent(detailsStreamId)}?season=${s}&episode=${ep}&title=${encodeURIComponent(rawTitle)}`)
        .then(r => r.json())
        .then(data => {
          state.downloadModalStreamsLoading = false;
          if (data && data.streams && data.streams.length > 0) {
            state.currentStreams = data.streams;
            renderDownloadModal();
          }
        })
        .catch(() => { state.downloadModalStreamsLoading = false; });
    }

    // Always provide 8K & 4K Ultra HD Cloud Downloader options
    const cloudHeading = document.createElement('div');
    cloudHeading.className = 'download-section-heading';
    cloudHeading.style.marginTop = '10px';
    cloudHeading.textContent = '⚡ 4K & 8K Ultra HD Cloud Multi-Mirror Downloader';
    el.downloadStreamsList.appendChild(cloudHeading);

    const cloudOptions = [
      { name: '4K Ultra HD Cloud Stream (2160p HDR)', badge: '4K UHD', server: 'VidLink Cloud 4K (Ultra Fast)', icon: '⚡' },
      { name: '1080p Cinema Full HD Stream', badge: '1080P', server: 'SmashyStream Cinema HD', icon: '🎬' },
      { name: '720p Fast Mobile Download', badge: '720P', server: 'MultiEmbed Cloud Mirror', icon: '📱' },
    ];

    cloudOptions.forEach((opt, idx) => {
      const card = document.createElement('div');
      card.className = `download-quality-card ${idx === 0 ? 'uhd-card' : ''}`;
      const mirrorUrl = state.embedUrls && state.embedUrls[idx] ? state.embedUrls[idx].url : '#';

      card.innerHTML = `
        <div class="download-quality-info">
          <div class="download-quality-name">
            <span>${opt.icon} ${opt.name}</span>
            <span class="badge" style="background:rgba(255,255,255,0.1);font-size:10px;">${opt.badge}</span>
          </div>
          <div class="download-quality-meta">${opt.server} • Multi-Language Audio Dubs & Subtitles</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <a href="${mirrorUrl}" target="_blank" class="download-action-btn" style="background:#3b82f6;">
            Open & Download ›
          </a>
        </div>
      `;
      el.downloadStreamsList.appendChild(card);
    });

    // Wire global copy button
    if (el.copyDirectStreamUrlBtn) {
      el.copyDirectStreamUrlBtn.onclick = () => {
        const url = bestStreamUrl || (state.embedUrls && state.embedUrls[0] ? state.embedUrls[0].url : window.location.href);
        copyTextToClipboard(url);
        showToast('📋 4K Link copied! Paste into IDM, ADM or VLC.');
      };
    }

    // Wire global direct browser download button
    if (el.directBrowserDownloadBtn) {
      if (bestStreamUrl) {
        el.directBrowserDownloadBtn.href = bestStreamUrl;
        el.directBrowserDownloadBtn.setAttribute('download', `${fileName}.mp4`);
      } else if (state.embedUrls && state.embedUrls[0]) {
        el.directBrowserDownloadBtn.href = state.embedUrls[0].url;
        el.directBrowserDownloadBtn.removeAttribute('download');
      }
    }

    el.downloadGuideModal.classList.remove('hidden');
  }

  function handleDownloadClick() {
    renderDownloadModal();
  }

  function openDownloadGuide() {
    renderDownloadModal();
  }

  function closeDownloadGuide() {
    if (el.downloadGuideModal) el.downloadGuideModal.classList.add('hidden');
  }

  let activeStreamFallbackTimer = null;

  function playStreamUrl(url, seekTime = 0) {
    const video = el.videoElement;
    if (activeStreamFallbackTimer) {
      clearTimeout(activeStreamFallbackTimer);
      activeStreamFallbackTimer = null;
    }
    el.spinnerText.textContent = 'Buffering HD/4K stream...';
    const reqAtStart = state.playbackRequestSeq;
    video.src = url;
    video.load();

    const triggerFallback = () => {
      if (activeStreamFallbackTimer) {
        clearTimeout(activeStreamFallbackTimer);
        activeStreamFallbackTimer = null;
      }
      if (reqAtStart !== state.playbackRequestSeq || state.isEmbedMode) return;
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

    const onCanPlay = () => {
      if (activeStreamFallbackTimer) {
        clearTimeout(activeStreamFallbackTimer);
        activeStreamFallbackTimer = null;
      }
      el.playerSpinner.classList.add('hidden');
      ensureAudioEngine();
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

    activeStreamFallbackTimer = setTimeout(() => {
      if (reqAtStart === state.playbackRequestSeq && !state.isEmbedMode && video.readyState < 2) {
        console.warn('Direct stream buffered slowly, auto-switching to high-speed mirror');
        triggerFallback();
      }
    }, 2500);

    video.onerror = () => {
      console.warn('Video element reported error for:', video.src);
      triggerFallback();
    };
  }

  function clearEmbedIframe() {
    state.embedLoadSeq += 1;
    if (!el.embedPlayerIframe) return;
    const parent = el.embedPlayerIframe.parentNode;
    const blank = document.createElement('iframe');
    blank.id = 'embedPlayerIframe';
    blank.className = 'embed-player-iframe hidden';
    blank.setAttribute('allowfullscreen', '');
    blank.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    blank.setAttribute('referrerpolicy', 'no-referrer');
    if (parent) {
      parent.replaceChild(blank, el.embedPlayerIframe);
      el.embedPlayerIframe = blank;
    } else {
      el.embedPlayerIframe.classList.add('hidden');
      el.embedPlayerIframe.src = '';
    }
  }

  function mountEmbedIframe(url) {
    state.embedLoadSeq += 1;
    if (!el.embedPlayerIframe) return;
    const parent = el.embedPlayerIframe.parentNode;
    const frame = document.createElement('iframe');
    frame.id = 'embedPlayerIframe';
    frame.className = 'embed-player-iframe';
    frame.setAttribute('allowfullscreen', 'true');
    frame.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    frame.setAttribute('loading', 'eager');
    frame.setAttribute('fetchpriority', 'high');
    frame.src = url;

    frame.addEventListener('load', () => {
      if (el.playerSpinner) el.playerSpinner.classList.add('hidden');
    });

    if (parent) {
      parent.replaceChild(frame, el.embedPlayerIframe);
      el.embedPlayerIframe = frame;
    } else {
      el.embedPlayerIframe.removeAttribute('sandbox');
      el.embedPlayerIframe.setAttribute('referrerpolicy', 'no-referrer');
      el.embedPlayerIframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
      el.embedPlayerIframe.setAttribute('loading', 'eager');
      el.embedPlayerIframe.setAttribute('fetchpriority', 'high');
      el.embedPlayerIframe.classList.remove('hidden');
      el.embedPlayerIframe.src = url;
    }
    if (el.playerSpinner) el.playerSpinner.classList.add('hidden');
  }

  function playEmbedUrl(url, serverName = 'Embed Player') {
    state.isEmbedMode = true;
    state.currentEmbedServerName = serverName;
    state.currentEmbedIndex = (state.embedUrls || []).findIndex((e) => e.name === serverName || e.url === url);
    if (state.currentEmbedIndex < 0) state.currentEmbedIndex = 0;

    el.videoElement.pause();
    el.videoElement.classList.add('hidden');
    if (el.playerControls) {
      el.playerControls.classList.add('hidden');
    }
    mountEmbedIframe(url);
    el.playerSpinner.classList.add('hidden');
    if (el.currentServerLabel) {
      el.currentServerLabel.textContent = serverName;
    }
    showToast(`Streaming via ${serverName} • Switch server pill if unavailable`);
    populateServerMenu(state.currentStreams, state.embedUrls);
  }

  function populateServerMenu(streams, embeds) {
    // 1. Populate Left Sidebar Servers List (UI/UX Pro Max)
    if (el.serverPillsList) {
      el.serverPillsList.innerHTML = '';
      let serverCounter = 1;
      let totalMirrors = 0;

      // Embed cloud servers first (instant playback, 4K UHD, subtitles, zero 428/429 delays)
      const embedList = (embeds && embeds.length > 0) ? embeds : getDefaultEmbedServers(state.currentDetails);
      totalMirrors += embedList.length;

      embedList.forEach((emb, idx) => {
        const pill = document.createElement('button');
        pill.type = 'button';
        const isActive = state.isEmbedMode && (state.currentEmbedServerName === emb.name || (el.embedPlayerIframe && el.embedPlayerIframe.src === emb.url));
        pill.className = `server-pill-btn ${isActive ? 'active' : ''}`;

        let displayName = `Server ${serverCounter}`;
        let tag = '4K UHD';
        let ping = `${20 + (idx * 4)}ms`;
        const isVidLink = emb.name.includes('VidLink') || emb.name.includes('4K');
        const isSmashy = emb.name.includes('Smashy') || emb.name.includes('Cinema');
        const isMulti = emb.name.includes('Multi') || emb.name.includes('Fast');
        const is2Embed = emb.name.includes('2Embed') || emb.name.includes('Ultra');
        const isAutoEmbed = emb.name.includes('AutoEmbed') || emb.name.includes('VIP');

        if (serverCounter === 1) {
          displayName = 'Server 1 • Cloud Pro';
          tag = '4K UHD';
          ping = '20ms';
        } else if (isSmashy) {
          displayName = `Server ${serverCounter} • Cinema HD`;
          tag = '1080p';
          ping = '26ms';
        } else if (isMulti) {
          displayName = `Server ${serverCounter} • Multi-Stream`;
          tag = 'FAST';
          ping = '24ms';
        } else if (is2Embed) {
          displayName = `Server ${serverCounter} • VIP Ultra`;
          tag = '1080p';
          ping = '29ms';
        } else if (isAutoEmbed) {
          displayName = `Server ${serverCounter} • Global CDN`;
          tag = 'HD';
          ping = '33ms';
        } else {
          displayName = `Server ${serverCounter} • ${emb.name.replace(/\(.*?\)/g, '').trim() || 'Mirror'}`;
          tag = 'HD';
          ping = `${24 + idx * 3}ms`;
        }
        serverCounter++;

        if (isActive) {
          updateCurrentStreamIndicator(displayName);
        }

        pill.innerHTML = `
          <div class="server-pill-left">
            ${isActive ? '<span class="live-signal-bars"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></span>' : '<span style="font-size:13px;opacity:0.8;">⚡</span>'}
            <span class="server-pill-name">${displayName}</span>
          </div>
          <div class="server-pill-badges">
            <span class="server-pill-ping">🟢 ${ping}</span>
            <span class="server-pill-tag">${tag}</span>
          </div>
        `;

        pill.title = `Switch to ${emb.name} (Instant stream mirror)`;
        pill.addEventListener('click', () => {
          state.userLockedEmbedServer = true;
          playEmbedUrl(emb.url, emb.name);
          updateCurrentStreamIndicator(displayName);
          populateServerMenu(state.currentStreams, state.embedUrls);
        });
        el.serverPillsList.appendChild(pill);
      });

      // Direct CDN streams (optional raw streams / experimental)
      if (streams && streams.length > 0) {
        totalMirrors += streams.length;
        streams.forEach((stream, idx) => {
          const pill = document.createElement('button');
          pill.type = 'button';
          const isActive = idx === state.currentStreamIndex && !state.isEmbedMode;
          pill.className = `server-pill-btn ${isActive ? 'active' : ''}`;
          
          let displayName = `Server ${serverCounter} • Direct CDN`;
          serverCounter++;

          if (isActive) {
            updateCurrentStreamIndicator(displayName);
          }

          pill.innerHTML = `
            <div class="server-pill-left">
              ${isActive ? '<span class="live-signal-bars"><span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span></span>' : '<span style="font-size:13px;opacity:0.8;">📡</span>'}
              <span class="server-pill-name">${displayName}</span>
            </div>
            <div class="server-pill-badges">
              <span class="server-pill-ping">🟢 18ms</span>
              <span class="server-pill-tag">${stream.quality || 'Auto'}</span>
            </div>
          `;

          pill.title = `Switch to Direct ${stream.server || 'CDN'} (${stream.quality})`;
          pill.addEventListener('click', () => {
            state.currentStreamIndex = idx;
            state.isEmbedMode = false;
            state.userLockedEmbedServer = false;
            clearEmbedIframe();
            el.videoElement.classList.remove('hidden');
            if (el.playerControls) {
              el.playerControls.classList.remove('hidden');
            }
            switchStream(stream, el.videoElement.currentTime || 0);
            updateCurrentStreamIndicator(displayName);
            populateServerMenu(state.currentStreams, state.embedUrls);
          });
          el.serverPillsList.appendChild(pill);
        });
      }

      if (el.serversStatusBadge) {
        el.serversStatusBadge.textContent = `🟢 ${totalMirrors} Fast Mirrors`;
      }
    }

    // 2. Also populate legacy dropdown menu for compatibility
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
          state.userLockedEmbedServer = false;
          clearEmbedIframe();
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
          state.userLockedEmbedServer = true;
          playEmbedUrl(emb.url, emb.name);
          el.serverMenu.classList.add('hidden');
        });
        el.serverMenu.appendChild(btn);
      });
    }
  }

  function switchStream(stream, seekTime = 0) {
    state.isEmbedMode = false;
    clearEmbedIframe();
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
      ensureAudioEngine();
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

  let isInternalNavigation = false;

  function closePlayer() {
    isInternalNavigation = true;
    setTimeout(() => { isInternalNavigation = false; }, 400);
    state.playbackRequestSeq += 1;
    if (activeStreamFallbackTimer) {
      clearTimeout(activeStreamFallbackTimer);
      activeStreamFallbackTimer = null;
    }
    const video = el.videoElement;
    video.pause();
    video.src = '';
    clearEmbedIframe();
    el.videoElement.classList.remove('hidden');
    state.isEmbedMode = false;
    state.userLockedEmbedServer = false;
    state.currentEmbedServerName = '';
    state.currentEmbedIndex = 0;
    exitFullscreen();
    if (el.watchEpisodesColumn) el.watchEpisodesColumn.classList.add('hidden');
    el.playerOverlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
    revertUrlToBase();
    renderContinueWatching();
  }

  function saveToHistory(media, season, episode) {
    if (!media) return;
    const video = el.videoElement;
    const s = parseInt(season, 10) || 0;
    const ep = parseInt(episode, 10) || 0;
    const historyItem = {
      id: media.id || { provider: getMediaProvider(media), value: getMediaIdValue(media) },
      title: media.title || '',
      poster_url: media.poster_url || '',
      media_type: media.media_type || (s > 0 || ep > 0 ? 'series' : 'movie'),
      year: media.year || '',
      season: s,
      episode: ep,
      currentTime: video ? (video.currentTime || 0) : 0,
      duration: video ? (video.duration || 0) : 0,
      timestamp: Date.now(),
    };

    // Filter out existing and unshift safely
    state.history = (state.history || []).filter(
      (h) => !(isSameMedia(h, media) && (parseInt(h.season, 10) || 0) === s && (parseInt(h.episode, 10) || 0) === ep)
    );
    state.history.unshift(historyItem);
    if (state.history.length > 30) state.history.pop();
    try {
      localStorage.setItem('netmirror_history', JSON.stringify(state.history));
    } catch (_) {}
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
    let nextEp = (parseInt(state.currentEpisode, 10) || 1) + 1;
    let curSeason = parseInt(state.currentSeason, 10) || 1;
    const details = state.currentDetails;
    if (details && details.seasons && details.seasons.length > 0) {
      const sObj = details.seasons.find((s, idx) => (parseInt(s.number ?? s.season_number ?? (idx + 1), 10) || (idx + 1)) === curSeason);
      if (sObj && sObj.episodes && nextEp > sObj.episodes.length) {
        const nextSeasonObj = details.seasons.find((s, idx) => (parseInt(s.number ?? s.season_number ?? (idx + 1), 10) || (idx + 1)) === curSeason + 1);
        if (nextSeasonObj) {
          curSeason += 1;
          nextEp = 1;
        }
      }
    }
    state.currentSeason = curSeason;
    state.currentEpisode = nextEp;
    if (details) {
      startPlayback(details, curSeason, nextEp);
    }
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
        if (el.searchInput) el.searchInput.blur();
        openDetailsModal(getMediaIdValue(item), getMediaProvider(item), item?.title || '');
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
      if (el.searchInput) el.searchInput.blur();
      executeSearch(query);
    };
    el.suggestionsPopover.appendChild(viewAllDiv);

    el.suggestionsPopover.classList.remove('hidden');
  }

  async function executeSearch(query) {
    if (el.searchInput) el.searchInput.blur();
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
    dubbed: { name: 'All Dubbed Series & Multi-Audio', badge: 'DUBBED SERIES', color: '#8b5cf6', desc: 'Binge top worldwide TV series, K-Dramas, and Anime with multi-language audio dubs (English, Hindi, Spanish, French, Bengali, and more).' },

    // Multi-Language Worldwide Cinema Catalogs
    hindi: { name: 'Hindi Cinema (Bollywood)', badge: 'BOLLYWOOD / हिन्दी', color: '#eab308', desc: 'Stream blockbuster Bollywood movies, Hindi originals, and top Indian drama series.' },
    japanese: { name: 'Japanese Anime & Cinema', badge: 'ANIME / 日本語', color: '#ec4899', desc: 'Stream world-famous anime series and films: Demon Slayer, Attack on Titan, Jujutsu Kaisen, and more.' },
    korean: { name: 'Korean K-Drama & Cinema', badge: 'K-DRAMA / 한국어', color: '#f43f5e', desc: 'Binge the most captivating Korean romantic dramas, award-winning films like Parasite, and revenge thrillers.' },
    english: { name: 'Hollywood & Global English', badge: 'HOLLYWOOD / ENGLISH', color: '#06b6d4', desc: 'All-time box office champions, Hollywood blockbusters, and award-winning American and British cinema.' },
    spanish: { name: 'Spanish Cinema (Español)', badge: 'ESPAÑOL / CINEMA', color: '#f59e0b', desc: 'Top Spanish and Latin American titles: Money Heist, Berlin, Elite, Society of the Snow, and Narcos.' },
    french: { name: 'French Cinema (Français)', badge: 'FRANÇAIS / CINEMA', color: '#3b82f6', desc: 'Masterpieces of French cinema and hit series: Lupin, Anatomy of a Fall, Amélie, and French thrillers.' },
    tamil_telugu: { name: 'South Indian Cinema (Tamil & Telugu)', badge: 'SOUTH CINEMA', color: '#f97316', desc: 'Blockbusters from Tollywood & Kollywood: RRR, Baahubali, Pushpa, KGF, Kantara, and Kalki 2898 AD.' },
    tamil: { name: 'Tamil Cinema (Kollywood)', badge: 'TAMIL CINEMA', color: '#f97316', desc: 'Top Tamil blockbusters and movies: Leo, Jailer, Vikram, Master, and Ponniyin Selvan.' },
    telugu: { name: 'Telugu Cinema (Tollywood)', badge: 'TELUGU CINEMA', color: '#f97316', desc: 'Top Telugu blockbusters: RRR, Baahubali, Pushpa, Salaar, Devara, and Kalki 2898 AD.' },
    bengali: { name: 'Bengali Cinema (বাংলা)', badge: 'বাংলা / TOLLYWOOD', color: '#10b981', desc: 'Iconic Bengali cinema, Hoichoi originals, detective thrillers (Byomkesh, Feluda), and drama.' },
    german: { name: 'German Cinema (Deutsch)', badge: 'DEUTSCH / CINEMA', color: '#6366f1', desc: 'Acclaimed German sci-fi and drama: Dark, 1899, All Quiet on the Western Front, and Babylon Berlin.' },
    italian: { name: 'Italian Cinema (Italiano)', badge: 'ITALIANO / CINEMA', color: '#14b8a6', desc: 'Cinematic classics and gritty series: Cinema Paradiso, Life is Beautiful, Suburra, and Gomorrah.' },
    arabic: { name: 'Arabic Cinema & Dramas (العربية)', badge: 'العربية / CINEMA', color: '#84cc16', desc: 'Middle Eastern and North African hits: AlRawabi School for Girls, Fauda, Capernaum, and historical epics.' },
    turkish: { name: 'Turkish Cinema (Türkçe)', badge: 'TÜRKÇE / DIZI', color: '#e11d48', desc: 'Famous Turkish historical epics and dramas: Resurrection: Ertugrul, Kurulus: Osman, and Miracle in Cell No. 7.' },
    chinese: { name: 'Chinese Cinema & C-Drama (中文)', badge: '中文 / C-DRAMA', color: '#d97706', desc: 'Epic martial arts, Wuxia fantasy, and modern C-Dramas: The Untamed, Word of Honor, and Ip Man.' },
    russian: { name: 'Russian Cinema (Русский)', badge: 'РУССКИЙ / CINEMA', color: '#8b5cf6', desc: 'Renowned Russian sci-fi, historical epics, and action: Major Grom, To the Lake, Leviathan, and Solaris.' },
    tagalog: { name: 'Filipino Cinema (Tagalog)', badge: 'PINOY / TAGALOG', color: '#ea580c', desc: 'Top Filipino films and Vivamax originals: romance, action thrillers, and acclaimed independent cinema.' },
    filipino: { name: 'Filipino Cinema (Tagalog)', badge: 'PINOY / TAGALOG', color: '#ea580c', desc: 'Top Filipino films and Vivamax originals: romance, action thrillers, and acclaimed independent cinema.' },
    portuguese: { name: 'Portuguese & Brazilian Cinema', badge: 'PORTUGUÊS / CINEMA', color: '#059669', desc: 'Celebrated Brazilian and Portuguese cinema: City of God, Elite Squad, Invisible City, and 3%.' },
  };

  function openLanguageView(langKey, titleHint, brandColor) {
    const norm = (langKey || 'hindi').toLowerCase().replace(/[\s-]/g, '_');
    const meta = PLATFORM_METADATA[norm] || {
      name: titleHint || `${norm.toUpperCase()} Cinema`,
      badge: norm.toUpperCase(),
      color: brandColor || '#3b82f6',
      desc: `Explore movies and series in ${titleHint || norm}.`,
    };
    try {
      history.replaceState(null, '', `#language=${encodeURIComponent(norm)}`);
    } catch (_) {}
    openPlatformView(norm, meta.name, meta.color);
  }

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
          try {
            const card = createMovieCard(item, (append ? state.platformItems.length - uniqueIncoming.length : 0) + index);
            if (el.platformGrid && card) el.platformGrid.appendChild(card);
          } catch (e) {
            console.warn('Error creating platform card:', e, item);
          }
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
    const featuredNetworks = (state.sportsChannels && state.sportsChannels.length > 0)
      ? state.sportsChannels.filter((c) =>
          /cricket|willow|premier league|sky sports football|tnt sports 1|f1/i.test(c.name)
        ).slice(0, 6)
      : DEFAULT_SPORTS_CHANNELS;

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

      if (!query) {
        el.sportsMatchesGrid.appendChild(hubCard);
      }
    }

    let filtered = state.sportsMatches.filter((m) => {
      // Category filter (ignored when user enters a specific text query)
      if (cat !== 'all' && !query) {
        const sp = (m.sport || '').toLowerCase();
        if (cat === 'Soccer' && !sp.includes('soccer') && !sp.includes('football')) return false;
        else if (cat === 'NBA' && !sp.includes('nba') && !sp.includes('basketball') && !sp.includes('ncaa')) return false;
        else if (cat === 'NFL' && !sp.includes('nfl') && !sp.includes('american football')) return false;
        else if (cat === 'Motorsport' && !sp.includes('motor') && !sp.includes('f1') && !sp.includes('formula')) return false;
        else if (cat === 'combat' && !sp.includes('ufc') && !sp.includes('mma') && !sp.includes('boxing') && !sp.includes('wwe')) return false;
        else if (cat === 'Cricket' && !sp.includes('cricket')) return false;
        else if (cat === 'Tennis' && !sp.includes('tennis')) return false;
        else if (cat === 'Golf' && !sp.includes('golf')) return false;
        else if (cat === 'channels') return false;
        else if (cat !== 'Soccer' && cat !== 'NBA' && cat !== 'NFL' && cat !== 'Motorsport' && cat !== 'combat' && cat !== 'Cricket' && cat !== 'Tennis' && cat !== 'Golf') {
          if (!sp.includes(cat.toLowerCase())) return false;
        }
      }

      // Status filter
      if (status === 'live') {
        if (!m.has_stream && m.status !== 'LIVE') return false;
      } else if (status === 'upcoming') {
        if (m.status === 'LIVE') return false;
      }

      // Search query filter (matches event, teams, tournament, sport, country, and channel names)
      if (query) {
        const text = `${m.event || ''} ${m.home_team || ''} ${m.away_team || ''} ${m.tournament || ''} ${m.sport || ''} ${m.country || ''}`.toLowerCase();
        const chNames = (m.channels || []).map((c) => c.name || '').join(' ').toLowerCase();
        if (!text.includes(query) && !chNames.includes(query)) return false;
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

    if (el.sportsLiveCount) {
      if (query) {
        el.sportsLiveCount.textContent = `${filtered.length} matches found for "${query}"`;
      } else {
        const liveCount = state.sportsMatches.filter((m) => m.has_stream || m.status === 'LIVE').length;
        el.sportsLiveCount.textContent = `${liveCount || state.sportsMatches.length} Live/Streaming • ${state.sportsChannels.length} Channels`;
      }
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
    const query = (state.sportsSearchQuery || '').toLowerCase().trim();
    let list = state.sportsChannels;

    if (query) {
      list = state.sportsChannels.filter((c) => (c.name || '').toLowerCase().includes(query));
    } else if (cat === 'Cricket') {
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

    if (list.length === 0 && !query) {
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

    // Auto-inject resilient fallback sports channels based on sport type
    const lowerTitle = `${title || ''} ${subtitle || ''}`.toLowerCase();
    const enrichedChannels = [...channels];
    const addBackup = (chName) => {
      if (!enrichedChannels.some(c => (c.name || '').toLowerCase() === chName.toLowerCase())) {
        enrichedChannels.push({
          name: chName,
          url: `/api/sports-stream?name=${encodeURIComponent(chName)}`
        });
      }
    };

    if (lowerTitle.includes('cricket') || lowerTitle.includes('willow') || lowerTitle.includes('ipl') || lowerTitle.includes('t20') || lowerTitle.includes('bbl') || lowerTitle.includes('icc')) {
      addBackup('Sky Sports Cricket FHD UK');
      addBackup('Willow Cricket HD US');
      addBackup('ASTRO CRICKET HD');
      addBackup('FOX Sports 501 Cricket HD AU');
    } else if (lowerTitle.includes('premier') || lowerTitle.includes('football') || lowerTitle.includes('soccer') || lowerTitle.includes('bundesliga') || lowerTitle.includes('laliga') || lowerTitle.includes('serie') || lowerTitle.includes('champions')) {
      addBackup('Sky Sports Premier League FHD UK');
      addBackup('Sky Sports Football FHD UK');
      addBackup('TNT Sports 1 FHD UK');
      addBackup('beIN Sports HD US');
      addBackup('Canal+ Premier League HD FR');
    } else {
      addBackup('Sky Sports Main Event FHD UK');
      addBackup('ESPN HD US');
      addBackup('TNT Sports 1 FHD UK');
    }

    state.currentSportsTitle = title;
    state.currentSportsSubtitle = subtitle;
    state.currentSportsChannels = enrichedChannels;
    state.currentSportsChannelIndex = initialIndex;

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
    if (el.nextEpisodeControlBtn) el.nextEpisodeControlBtn.classList.add('hidden');

    const activeChannel = enrichedChannels[initialIndex] || enrichedChannels[0];
    let streamUrl = activeChannel.url || '';
    if (!streamUrl.startsWith('/api/sports-stream')) {
      streamUrl = `/api/sports-stream?name=${encodeURIComponent(activeChannel.name || title)}`;
    }

    mountEmbedIframe(streamUrl);
    if (el.currentServerLabel) {
      el.currentServerLabel.textContent = activeChannel.name || `Server ${initialIndex + 1}`;
    }

    // Populate Server switcher
    if (el.serverMenu) {
      el.serverMenu.innerHTML = '';
      const header = document.createElement('div');
      header.style.cssText = 'padding:6px 10px;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;';
      header.textContent = `Live Broadcast Servers (${enrichedChannels.length})`;
      el.serverMenu.appendChild(header);

      enrichedChannels.forEach((c, idx) => {
        const btn = document.createElement('button');
        btn.className = `menu-item ${idx === initialIndex ? 'active' : ''}`;
        btn.innerHTML = `🔴 <span>${c.name || 'Server ' + (idx + 1)}</span>`;
        btn.addEventListener('click', () => {
          openSportsPlayer(title, subtitle, enrichedChannels, idx);
          el.serverMenu.classList.add('hidden');
        });
        el.serverMenu.appendChild(btn);
      });
    }

    showToast(`Streaming ${title}`);
  }

  // Auto-failover listener for sports streams
  window.addEventListener('message', (ev) => {
    if (ev.data && ev.data.type === 'stream_error') {
      if (state.isEmbedMode && state.currentSportsChannels && state.currentSportsChannels.length > 1) {
        const nextIdx = (state.currentSportsChannelIndex + 1) % state.currentSportsChannels.length;
        if (nextIdx !== state.currentSportsChannelIndex) {
          const nextChannel = state.currentSportsChannels[nextIdx];
          showToast(`Switching to backup live feed: ${nextChannel.name}...`);
          openSportsPlayer(state.currentSportsTitle, state.currentSportsSubtitle, state.currentSportsChannels, nextIdx);
        }
      }
    }
  });

  async function navigate(target) {
    state.currentNav = target;
    el.navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.nav === target);
    });
    document.querySelectorAll('.mobile-nav-item[data-nav]').forEach((item) => {
      item.classList.toggle('active', item.dataset.nav === target);
    });

    // Clear platform/language hash from URL bar when navigating between main tabs
    try {
      if (window.location.hash && target !== 'platform') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    } catch (_) {}

    if (target === 'home') {
      switchView('rails');
      revertSeoMeta();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (target === 'sports') {
      document.title = 'Live Sports 24/7 – Watch Cricket, Football & NBA Online Free | MovieBox Plus';
      const canonicalTag = document.getElementById('canonicalTag');
      if (canonicalTag) canonicalTag.setAttribute('href', `${window.location.origin}/?nav=sports`);
      openSportsView();
    } else if (target === 'movies') {
      if (state.currentNav !== 'home') switchView('rails');
      const targetEl = el.moviesRailSection || document.getElementById('moviesRailSection');
      if (targetEl) {
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
        const h = targetEl.querySelector('.rail-header');
        if (h) {
          h.classList.add('rail-highlight-pulse');
          setTimeout(() => h.classList.remove('rail-highlight-pulse'), 1300);
        }
      } else {
        loadCategoryGrid('Popular Movies', 'movies');
      }
    } else if (target === 'series') {
      if (state.currentNav !== 'home') switchView('rails');
      const targetEl = el.seriesRailSection || document.getElementById('seriesRailSection');
      if (targetEl) {
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
        const h = targetEl.querySelector('.rail-header');
        if (h) {
          h.classList.add('rail-highlight-pulse');
          setTimeout(() => h.classList.remove('rail-highlight-pulse'), 1300);
        }
      } else {
        loadCategoryGrid('TV Series', 'series');
      }
    } else if (target === 'trending') {
      if (state.currentNav !== 'home') switchView('rails');
      const targetEl = el.trendingRailSection || document.getElementById('trendingRailSection');
      if (targetEl) {
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
        const h = targetEl.querySelector('.rail-header');
        if (h) {
          h.classList.add('rail-highlight-pulse');
          setTimeout(() => h.classList.remove('rail-highlight-pulse'), 1300);
        }
      } else {
        loadCategoryGrid('Trending Now', 'trending');
      }
    } else if (target === 'mylist') {
      renderFavoritesView();
    } else if (target === 'history') {
      renderHistoryView();
    }
  }

  async function loadCategoryGrid(title, tabId) {
    switchView('grid');
    el.gridTitle.textContent = title;
    el.gridSubtitle.textContent = 'Loading titles from TMDB...';

    // 1. Direct match with TMDB category endpoint
    const cat = TMDB_CATEGORIES.find(c => c.key === tabId || c.title.toLowerCase() === (title || '').toLowerCase());
    if (cat) {
      try {
        const { url, headers } = buildTmdbRequest(cat.endpoint);
        let res;
        try {
          res = await fetch(url, { headers });
        } catch (_) {
          const direct = buildDirectTmdbFallbackRequest(cat.endpoint);
          res = await fetch(direct.url, { headers: direct.headers });
        }
        if (res && res.ok) {
          const data = await res.json();
          const items = (data.results || []).filter(item => Boolean(item && item.poster_path)).map(item => mapTmdbItem(item, cat.defaultTag)).filter(Boolean);
          if (items.length) {
            state.gridItems = items;
            renderGridItems(items);
            el.gridSubtitle.textContent = `Showing ${items.length} titles in ${title}`;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      } catch (e) {
        console.warn('Grid TMDB fetch failed, falling back:', e);
      }
    }

    // 2. Curated showcase catalog fallback
    const fallbackItems = getFallbackCatalogForCategory(tabId);
    if (fallbackItems && fallbackItems.length > 0) {
      state.gridItems = fallbackItems;
      renderGridItems(fallbackItems);
      el.gridSubtitle.textContent = `Showing ${fallbackItems.length} titles in ${title}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

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
      if (!item) return false;
      const k = getCanonicalKey(item) || getMediaIdValue(item);
      if (k && seen.has(k)) return false;
      if (k) seen.add(k);
      if (state.activeFilter === 'movie') return item.media_type === 'movie';
      if (state.activeFilter === 'series') return item.media_type === 'series';
      if (state.activeFilter === 'dubbed') {
        const titleLower = (item.title || '').toLowerCase();
        return item.media_type === 'series' || titleLower.includes('dub') || titleLower.includes('dual') || titleLower.includes('hindi');
      }
      return true;
    });

    if (filtered.length === 0) {
      el.mediaGrid.innerHTML = '<p style="color:var(--text-muted);padding:40px;">No matching titles found.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();
    filtered.forEach((item, index) => {
      try {
        const card = createMovieCard(item, index);
        if (card) fragment.appendChild(card);
      } catch (e) {
        console.warn('Error creating grid card:', e, item);
      }
    });
    el.mediaGrid.appendChild(fragment);
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
    try {
    // Window Scroll Navbar Style
    window.addEventListener('scroll', () => {
      el.navbar.classList.toggle('scrolled', window.scrollY > 40);
    });

    // Logo Click
    if (el.logoBtn) el.logoBtn.addEventListener('click', (e) => {
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

    // Footer Nav Links Click
    document.querySelectorAll('.footer a[data-nav]').forEach((link) => {
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

    document.querySelectorAll('.mobile-plat-btn[data-lang]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        closeMobilePlatformsSheet();
        openLanguageView(lang, btn.textContent.trim());
      });
    });

    // Hero Slider Arrows
    if (el.heroPrevBtn) el.heroPrevBtn.addEventListener('click', () => { prevHeroSlide(); resetHeroAutoRotate(); });
    if (el.heroNextBtn) el.heroNextBtn.addEventListener('click', () => { nextHeroSlide(); resetHeroAutoRotate(); });

    // Hero Touch Gestures for Mobile (Swipe left / right to change featured titles)
    if (el.heroSection) {
      let touchStartX = 0;
      let touchStartY = 0;
      el.heroSection.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });
      el.heroSection.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches[0]) {
          const deltaX = e.changedTouches[0].clientX - touchStartX;
          const deltaY = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
              nextHeroSlide();
            } else {
              prevHeroSlide();
            }
            resetHeroAutoRotate();
          }
        }
      }, { passive: true });
    }

    // OTT Platform Dropdown Items
    document.querySelectorAll('.dropdown-item[data-ott]').forEach((item) => {
      item.addEventListener('click', () => {
        const ott = item.dataset.ott;
        openPlatformView(ott, item.textContent.trim());
      });
    });

    // Language Dropdown Items
    document.querySelectorAll('.dropdown-item[data-lang]').forEach((item) => {
      item.addEventListener('click', () => {
        const lang = item.dataset.lang;
        openLanguageView(lang, item.textContent.trim());
      });
    });

    // OTT Brand Cards on Home
    document.querySelectorAll('.ott-card[data-ott]').forEach((card) => {
      card.addEventListener('click', () => {
        const ott = card.dataset.ott;
        openPlatformView(ott, card.dataset.title, card.dataset.color);
      });
    });

    // Language Brand Cards on Home
    document.querySelectorAll('.lang-card[data-lang]').forEach((card) => {
      card.addEventListener('click', () => {
        const lang = card.dataset.lang;
        openLanguageView(lang, card.dataset.title, card.dataset.color);
      });
    });

    // Grid View Language Filter Chips
    document.querySelectorAll('.lang-filter-chip[data-lang]').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.lang-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const lang = chip.dataset.lang;
        if (lang === 'all') {
          renderGrid();
        } else {
          openLanguageView(lang);
        }
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

    const triggerSportsSearch = (val) => {
      state.sportsSearchQuery = (val || '').trim();
      if (el.sportsSearchClearBtn) {
        el.sportsSearchClearBtn.classList.toggle('hidden', !state.sportsSearchQuery);
      }
      renderSportsMatches();
      renderSportsChannels();
    };

    if (el.sportsSearchInput) {
      el.sportsSearchInput.addEventListener('input', (e) => {
        triggerSportsSearch(e.target.value);
      });
      el.sportsSearchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          triggerSportsSearch(el.sportsSearchInput.value);
          if (el.sportsMatchesGrid) {
            el.sportsMatchesGrid.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    }

    if (el.sportsSearchClearBtn) {
      el.sportsSearchClearBtn.addEventListener('click', () => {
        if (el.sportsSearchInput) el.sportsSearchInput.value = '';
        triggerSportsSearch('');
      });
    }

    if (el.sportsSearchSubmitBtn) {
      el.sportsSearchSubmitBtn.addEventListener('click', () => {
        const val = el.sportsSearchInput ? el.sportsSearchInput.value : '';
        triggerSportsSearch(val);
        if (el.sportsMatchesGrid) {
          el.sportsMatchesGrid.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    if (el.sportsQuickTags) {
      el.sportsQuickTags.querySelectorAll('.sports-tag-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          const q = chip.dataset.search || '';
          if (el.sportsSearchInput) el.sportsSearchInput.value = q;
          el.sportsQuickTags.querySelectorAll('.sports-tag-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          triggerSportsSearch(q);
          if (el.sportsMatchesGrid) {
            el.sportsMatchesGrid.scrollIntoView({ behavior: 'smooth' });
          }
        });
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
    if (el.searchInput) el.searchInput.addEventListener('input', handleSearchInput);
    if (el.searchInput) el.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        el.suggestionsPopover.classList.add('hidden');
        executeSearch(el.searchInput.value);
      }
    });

    if (el.clearSearchBtn) el.clearSearchBtn.addEventListener('click', () => {
      el.searchInput.value = '';
      el.clearSearchBtn.classList.add('hidden');
      el.suggestionsPopover.classList.add('hidden');
    });

    // Click outside search popover
    document.addEventListener('click', (e) => {
      if (el.searchWrapper && el.suggestionsPopover && !el.searchWrapper.contains(e.target)) {
        el.suggestionsPopover.classList.add('hidden');
      }
      if (el.serverMenuBtn && el.serverMenu && !el.serverMenuBtn.contains(e.target) && !el.serverMenu.contains(e.target)) {
        el.serverMenu.classList.add('hidden');
      }
      if (el.qualityMenuBtn && el.qualityMenu && !el.qualityMenuBtn.contains(e.target) && !el.qualityMenu.contains(e.target)) {
        el.qualityMenu.classList.add('hidden');
      }
      if (el.subtitlesMenuBtn && el.subtitlesMenu && !el.subtitlesMenuBtn.contains(e.target) && !el.subtitlesMenu.contains(e.target)) {
        el.subtitlesMenu.classList.add('hidden');
      }
      if (el.speedMenuBtn && el.speedMenu && !el.speedMenuBtn.contains(e.target) && !el.speedMenu.contains(e.target)) {
        el.speedMenu.classList.add('hidden');
      }
      if (el.audioEnhancerBtn && el.audioEnhancerMenu && !el.audioEnhancerBtn.contains(e.target) && !el.audioEnhancerMenu.contains(e.target)) {
        el.audioEnhancerMenu.classList.add('hidden');
      }
    });

    // Hero Quick Search
    if (el.heroSearchSubmitBtn) el.heroSearchSubmitBtn.addEventListener('click', () => {
      const q = el.heroSearchInput.value.trim();
      if (q) executeSearch(q);
    });
    if (el.heroSearchInput) el.heroSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = el.heroSearchInput.value.trim();
        if (q) executeSearch(q);
      }
    });

    // Hero Tag Chips
    if (el.quickTags) el.quickTags.querySelectorAll('.tag-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.dataset.search;
        executeSearch(q);
      });
    });

    // Hero Action Buttons
    if (el.heroPlayBtn) el.heroPlayBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (state.heroItem) openPlayerDirect(state.heroItem);
    });

    if (el.heroDetailsBtn) el.heroDetailsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (state.heroItem) openDetailsModal(getMediaIdValue(state.heroItem), getMediaProvider(state.heroItem), state.heroItem?.title || '');
    });

    if (el.heroFavBtn) el.heroFavBtn.addEventListener('click', () => {
      if (!state.heroItem) return;
      toggleFavorite(state.heroItem);
      updateHeroFavBtn();
    });

    // Universal Category & Carousel Horizontal Sliding System
    function initCarouselSliding() {
      // 1. Sliding Navigation Buttons (Left / Right)
      document.querySelectorAll('.rail-nav-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const targetId = btn.dataset.target;
          const target = document.getElementById(targetId);
          if (!target) return;
          const cardEl = target.querySelector('.movie-card, .skeleton-card, .ott-card, .lang-card');
          const stepUnit = cardEl ? (cardEl.offsetWidth + 14) : 194;
          const visibleCount = Math.max(1, Math.floor(target.clientWidth / stepUnit));
          const scrollStep = Math.max(stepUnit, (visibleCount > 1 ? visibleCount - 1 : 1) * stepUnit);
          const offset = btn.classList.contains('rail-prev') ? -scrollStep : scrollStep;
          target.scrollBy({ left: offset, behavior: 'smooth' });
        });
      });

      // 2. Attach Smooth Mouse Drag-to-Slide and Wheel Navigation to all Horizontal Containers
      const sliderContainers = document.querySelectorAll(
        '.rail-carousel, .ott-brand-cards, .language-brand-cards, .home-category-scroll, .universe-chips'
      );

      sliderContainers.forEach((container) => {
        let isDown = false;
        let startX = 0;
        let scrollStart = 0;
        let hasMoved = false;

        // Dynamic Arrow State Sync
        const updateArrowStates = () => {
          const wrapper = container.closest('.rail-carousel-wrapper');
          if (!wrapper) return;
          const prevBtn = wrapper.querySelector('.rail-prev');
          const nextBtn = wrapper.querySelector('.rail-next');
          const maxScroll = container.scrollWidth - container.clientWidth;
          if (prevBtn) {
            prevBtn.classList.toggle('disabled', container.scrollLeft <= 5);
          }
          if (nextBtn) {
            nextBtn.classList.toggle('disabled', container.scrollLeft >= maxScroll - 5);
          }
        };

        container.addEventListener('scroll', updateArrowStates, { passive: true });
        setTimeout(updateArrowStates, 300);

        // Mouse Drag to Slide
        container.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          isDown = true;
          hasMoved = false;
          startX = e.pageX - container.offsetLeft;
          scrollStart = container.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
          if (isDown) {
            isDown = false;
            container.classList.remove('is-dragging');
          }
        });

        container.addEventListener('mouseleave', () => {
          if (isDown) {
            isDown = false;
            container.classList.remove('is-dragging');
          }
        });

        container.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          const x = e.pageX - container.offsetLeft;
          const walk = (x - startX) * 1.5;
          if (Math.abs(walk) > 6) {
            hasMoved = true;
            container.classList.add('is-dragging');
            container.scrollLeft = scrollStart - walk;
          }
        });

        // Prevent accidental card clicks when dragging
        container.addEventListener('click', (e) => {
          if (hasMoved) {
            e.preventDefault();
            e.stopPropagation();
            hasMoved = false;
          }
        }, true);

        // Allow Shift+Wheel for horizontal scrolling without hijacking standard vertical page scroll
        container.addEventListener('wheel', (e) => {
          if (e.shiftKey && Math.abs(e.deltaY) > 0) {
            e.preventDefault();
            container.scrollBy({ left: e.deltaY, behavior: 'auto' });
          }
        }, { passive: false });
      });
    }

    initCarouselSliding();

    // Rail View All Buttons
    document.querySelectorAll('.rail-view-all-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.category) {
          const cat = btn.dataset.category;
          const catTitle = btn.dataset.title || `${cat.toUpperCase()} Titles`;
          loadCategoryGrid(catTitle, cat);
          return;
        }
        const tab = btn.dataset.tab;
        if (tab) {
          const names = { '1': 'Popular Movies', '2': 'Trending Now', '3': 'TV Series' };
          loadCategoryGrid(names[tab] || 'Catalog', tab);
        }
      });
    });

    // Category Quick Navigation Bar Pills
    document.querySelectorAll('.cat-pill[data-target]').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (typeof btn.scrollIntoView === 'function') {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        const targetId = btn.dataset.target;
        if (state.currentNav !== 'home') {
          switchView('rails');
          state.currentNav = 'home';
          el.navLinks.forEach(link => link.classList.toggle('active', link.dataset.nav === 'home'));
        }
        if (targetId === 'all') {
          const targetY = el.heroSection ? el.heroSection.offsetHeight : 0;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        } else {
          const targetEl = document.getElementById(targetId);
          if (targetEl) {
            const yOffset = window.innerWidth <= 768 ? -96 : -124; // offset for sticky navbar + category bar
            const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            const header = targetEl.querySelector('.rail-header');
            if (header) {
              header.classList.add('rail-highlight-pulse');
              setTimeout(() => header.classList.remove('rail-highlight-pulse'), 1300);
            }
          }
        }
      });
    });

    if (el.clearHistoryBtn) {
      el.clearHistoryBtn.addEventListener('click', () => {
        state.history = [];
        localStorage.removeItem('netmirror_history');
        renderContinueWatching();
        showToast('Watch history cleared');
      });
    }

    // Grid Filters (All, Movies, TV Shows, Dubbed Series)
    if (el.gridFilters) {
      el.gridFilters.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          el.gridFilters.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
          chip.classList.add('active');
          state.activeFilter = chip.dataset.filter;
          if (state.activeFilter === 'dubbed') {
            if (!state.currentQuery && (!state.gridItems || state.gridItems.length < 5)) {
              openPlatformView('dubbed', 'All Dubbed Series & Multi-Audio', '#8b5cf6');
              return;
            }
          }
          renderGridItems(state.gridItems);
        });
      });
    }

    // Modal Close
    if (el.modalCloseBtn) el.modalCloseBtn.addEventListener('click', closeDetailsModal);
    if (el.detailsModal) {
      el.detailsModal.addEventListener('click', (e) => {
        if (e.target === el.detailsModal) closeDetailsModal();
      });
    }

    if (el.modalFavBtn) {
      el.modalFavBtn.addEventListener('click', () => {
        if (!state.currentDetails) return;
        toggleFavorite(state.currentDetails);
        const isFav = (state.favorites || []).some((f) => isSameMedia(f, state.currentDetails));
        el.modalFavBtn.classList.toggle('fav-active', isFav);
        el.modalFavBtn.textContent = isFav ? '✓ In My List' : 'Add to List';
      });
    }

    // Shortcuts Modal
    if (el.shortcutsBtn) {
      el.shortcutsBtn.addEventListener('click', () => {
        if (el.shortcutsModal) el.shortcutsModal.classList.remove('hidden');
      });
    }
    if (el.shortcutsCloseBtn) {
      el.shortcutsCloseBtn.addEventListener('click', () => {
        if (el.shortcutsModal) el.shortcutsModal.classList.add('hidden');
      });
    }
    if (el.shortcutsModal) {
      el.shortcutsModal.addEventListener('click', (e) => {
        if (e.target === el.shortcutsModal) el.shortcutsModal.classList.add('hidden');
      });
    }

    // ========================================================================
    // VIDEO PLAYER CONTROLS & EVENTS
    // ========================================================================
    const video = el.videoElement;

    if (el.playerBackBtn) el.playerBackBtn.addEventListener('click', closePlayer);
    if (el.watchCloseBtn) el.watchCloseBtn.addEventListener('click', closePlayer);

    // Anti-Redirect Shield:
    // If a cross-origin embed script tries to hijack top-level window location to an ad network,
    // beforeunload intercepts it and cancels the unauthorized navigation.
    window.addEventListener('beforeunload', (e) => {
      if (state.isEmbedMode && !isInternalNavigation) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    });

    // Block unauthorized popup window attempts when in watch mode
    const originalWindowOpen = window.open;
    window.open = function(url, target, features) {
      if (state.isEmbedMode && !isInternalNavigation) {
        console.warn('Blocked unauthorized popup/tab creation:', url);
        return null;
      }
      return originalWindowOpen.apply(this, arguments);
    };

    // Auto-focus Trap:
    // If an ad click inside an embed tries to open a popup tab or blur window,
    // refocus immediately to keep the user in MovieBox Plus.
    window.addEventListener('blur', () => {
      if (state.isEmbedMode) {
        setTimeout(() => {
          window.focus();
        }, 80);
      }
    });
    if (el.howToDownloadBtn) el.howToDownloadBtn.addEventListener('click', openDownloadGuide);
    if (el.watchDownloadBtn) el.watchDownloadBtn.addEventListener('click', handleDownloadClick);
    if (el.watchDownloadBtnSide) el.watchDownloadBtnSide.addEventListener('click', handleDownloadClick);
    initWatchMobileTabs();
    if (el.closeDownloadGuideBtn) el.closeDownloadGuideBtn.addEventListener('click', closeDownloadGuide);
    if (el.gotItDownloadGuideBtn) el.gotItDownloadGuideBtn.addEventListener('click', closeDownloadGuide);
    if (el.downloadGuideModal) {
      el.downloadGuideModal.addEventListener('click', (e) => {
        if (e.target === el.downloadGuideModal) closeDownloadGuide();
      });
    }

    // Play / Pause
    if (el.playPauseBtn) el.playPauseBtn.addEventListener('click', togglePlayPause);
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

    // Scrubber click & drag (Mouse & Touch responsive)
    let isDraggingScrubber = false;

    function getPointerClientX(e) {
      if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
      if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientX;
      return e.clientX;
    }

    function handleScrubberSeek(e) {
      const rect = el.progressBarContainer.getBoundingClientRect();
      const clientX = getPointerClientX(e);
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      if (video.duration) {
        video.currentTime = pos * video.duration;
      }
    }

    if (el.progressBarContainer) el.progressBarContainer.addEventListener('mousedown', (e) => {
      isDraggingScrubber = true;
      handleScrubberSeek(e);
    });

    if (el.progressBarContainer) el.progressBarContainer.addEventListener('touchstart', (e) => {
      isDraggingScrubber = true;
      handleScrubberSeek(e);
    }, { passive: true });

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

    window.addEventListener('touchmove', (e) => {
      if (isDraggingScrubber) handleScrubberSeek(e);
    }, { passive: true });

    window.addEventListener('mouseup', () => {
      isDraggingScrubber = false;
    });

    window.addEventListener('touchend', () => {
      isDraggingScrubber = false;
    });

    // Rewind / Forward
    if (el.rewindBtn) el.rewindBtn.addEventListener('click', () => {
      video.currentTime = Math.max(0, video.currentTime - 10);
      showToast('-10s');
    });

    if (el.forwardBtn) el.forwardBtn.addEventListener('click', () => {
      video.currentTime = Math.min(video.duration, video.currentTime + 10);
      showToast('+10s');
    });

    // Volume & Mute with Amplification (0% to 300%)
    if (el.volumeSlider) el.volumeSlider.addEventListener('input', (e) => {
      ensureAudioEngine();
      const val = parseFloat(e.target.value);
      if (val <= 1.0) {
        video.volume = Math.max(0, val);
        video.muted = video.volume === 0;
      } else {
        video.volume = 1.0;
        video.muted = false;
        setVolumeBoost(val, true);
      }
      updateVolumeIcons();
    });

    if (el.volumeBtn) el.volumeBtn.addEventListener('click', () => {
      ensureAudioEngine();
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
      updateVolumeSliderUI();
    }

    // Audio Enhancer Menu Toggle & Controls
    if (el.audioEnhancerBtn && el.audioEnhancerMenu) {
      el.audioEnhancerBtn.addEventListener('click', () => {
        ensureAudioEngine();
        if (window.innerWidth <= 768) {
          openSoundBoosterModal();
          return;
        }
        el.audioEnhancerMenu.classList.toggle('hidden');
        if (el.serverMenu) el.serverMenu.classList.add('hidden');
        if (el.qualityMenu) el.qualityMenu.classList.add('hidden');
        if (el.subtitlesMenu) el.subtitlesMenu.classList.add('hidden');
        if (el.speedMenu) el.speedMenu.classList.add('hidden');
      });

      // Boost Slider
      if (el.boostRangeSlider) {
        el.boostRangeSlider.addEventListener('input', (e) => {
          ensureAudioEngine();
          const boost = parseFloat(e.target.value);
          setVolumeBoost(boost, true);
          el.volumeSlider.value = Math.min(2.0, boost);
          updateVolumeIcons();
        });
      }

      // Boost Chips
      document.querySelectorAll('.boost-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          ensureAudioEngine();
          const boost = parseFloat(chip.dataset.boost);
          setVolumeBoost(boost, true);
          el.volumeSlider.value = Math.min(2.0, boost);
          updateVolumeIcons();
          showToast(`Volume Boost: ${Math.round(boost * 100)}% ⚡`);
        });
      });

      // Preset Items
      if (el.enhancerPresetsList) {
        el.enhancerPresetsList.querySelectorAll('.preset-item').forEach((item) => {
          item.addEventListener('click', () => {
            ensureAudioEngine();
            applyAudioProfile(item.dataset.preset, true);
          });
        });
      }

      // Limiter Toggle
      if (el.enhancerLimiterToggle) {
        el.enhancerLimiterToggle.addEventListener('change', (e) => {
          ensureAudioEngine();
          state.audioLimiter = e.target.checked;
          localStorage.setItem('moviebox_audio_limiter', String(e.target.checked));
          if (limiterNode && audioCtx) {
            limiterNode.threshold.setTargetAtTime(e.target.checked ? -1.0 : 0, audioCtx.currentTime, 0.05);
          }
          showToast(e.target.checked ? 'Smart Limiter: Active (Zero Distortion)' : 'Smart Limiter: Bypassed');
        });
      }

      // Voice EQ Toggle
      if (el.enhancerVoiceToggle) {
        el.enhancerVoiceToggle.addEventListener('change', (e) => {
          ensureAudioEngine();
          state.audioVoiceEq = e.target.checked;
          localStorage.setItem('moviebox_audio_voice_eq', String(e.target.checked));
          if (voiceNode && audioCtx) {
            const profile = audioProfiles[state.audioProfile || 'cinema'] || audioProfiles.cinema;
            voiceNode.gain.setTargetAtTime(e.target.checked ? profile.voice : 0, audioCtx.currentTime, 0.05);
          }
          showToast(e.target.checked ? 'Dialogue Clarity: Enabled (+4dB Voice Lift)' : 'Dialogue Clarity: Flat');
        });
      }
    }

    // Menus Toggle (Server, Quality, Speed, Subtitles)
    if (el.serverMenuBtn && el.serverMenu) {
      el.serverMenuBtn.addEventListener('click', () => {
        el.serverMenu.classList.toggle('hidden');
        el.qualityMenu.classList.add('hidden');
        el.subtitlesMenu.classList.add('hidden');
        el.speedMenu.classList.add('hidden');
        if (el.audioEnhancerMenu) el.audioEnhancerMenu.classList.add('hidden');
      });
    }

    if (el.qualityMenuBtn) el.qualityMenuBtn.addEventListener('click', () => {
      el.qualityMenu.classList.toggle('hidden');
      if (el.serverMenu) el.serverMenu.classList.add('hidden');
      el.subtitlesMenu.classList.add('hidden');
      el.speedMenu.classList.add('hidden');
      if (el.audioEnhancerMenu) el.audioEnhancerMenu.classList.add('hidden');
    });

    if (el.subtitlesMenuBtn) el.subtitlesMenuBtn.addEventListener('click', () => {
      el.subtitlesMenu.classList.toggle('hidden');
      if (el.serverMenu) el.serverMenu.classList.add('hidden');
      el.qualityMenu.classList.add('hidden');
      el.speedMenu.classList.add('hidden');
      if (el.audioEnhancerMenu) el.audioEnhancerMenu.classList.add('hidden');
    });

    if (el.speedMenuBtn) el.speedMenuBtn.addEventListener('click', () => {
      el.speedMenu.classList.toggle('hidden');
      if (el.serverMenu) el.serverMenu.classList.add('hidden');
      el.qualityMenu.classList.add('hidden');
      el.subtitlesMenu.classList.add('hidden');
      if (el.audioEnhancerMenu) el.audioEnhancerMenu.classList.add('hidden');
    });

    // Speed options
    if (el.speedMenu) el.speedMenu.querySelectorAll('.menu-item').forEach((item) => {
      item.addEventListener('click', () => {
        const speed = parseFloat(item.dataset.speed);
        video.playbackRate = speed;
        el.currentSpeedLabel.textContent = `${speed}x`;
        if (el.speedMenu) el.speedMenu.querySelectorAll('.menu-item').forEach((b) => b.classList.remove('active'));
        item.classList.add('active');
        el.speedMenu.classList.add('hidden');
        showToast(`Speed: ${speed}x`);
      });
    });

    // Picture-in-Picture
    if (el.pipBtn) el.pipBtn.addEventListener('click', async () => {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    });

    // Fullscreen / Zoom In
    if (el.fullscreenBtn) el.fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (el.watchFullscreenBtn) el.watchFullscreenBtn.addEventListener('click', toggleFullscreen);
    if (el.floatingFullscreenBtn) el.floatingFullscreenBtn.addEventListener('click', toggleFullscreen);

    // Fullscreen event sync across browsers, devices & iOS
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach((ev) => {
      document.addEventListener(ev, updateFullscreenUI);
    });
    if (el.videoElement) {
      el.videoElement.addEventListener('webkitbeginfullscreen', updateFullscreenUI);
      el.videoElement.addEventListener('webkitendfullscreen', updateFullscreenUI);
    }
    if (el.playerContainer) {
      el.playerContainer.addEventListener('dblclick', (e) => {
        if (e.target.closest('.player-controls') || e.target.closest('.player-floating-actions') || e.target.closest('button')) return;
        toggleFullscreen();
      });
    }

    // Sound Booster & Audio Presets
    if (el.watchSoundBoosterBtn) el.watchSoundBoosterBtn.addEventListener('click', openSoundBoosterModal);
    if (el.floatingSoundBtn) el.floatingSoundBtn.addEventListener('click', openSoundBoosterModal);
    if (el.closeSoundBoosterBtn) el.closeSoundBoosterBtn.addEventListener('click', closeSoundBoosterModal);
    if (el.doneSoundBoosterBtn) el.doneSoundBoosterBtn.addEventListener('click', closeSoundBoosterModal);
    if (el.soundBoosterModal) {
      el.soundBoosterModal.addEventListener('click', (e) => {
        if (e.target === el.soundBoosterModal) closeSoundBoosterModal();
      });
    }

    if (el.modalBoostRangeSlider) {
      el.modalBoostRangeSlider.addEventListener('input', (e) => {
        ensureAudioEngine();
        const boost = parseFloat(e.target.value);
        setVolumeBoost(boost, true);
      });
    }

    document.querySelectorAll('.modal-boost-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        ensureAudioEngine();
        const boost = parseFloat(chip.dataset.boost);
        setVolumeBoost(boost, true);
        showToast(`Volume Boost: ${Math.round(boost * 100)}% ⚡`);
      });
    });

    if (el.modalPresetsList) {
      el.modalPresetsList.querySelectorAll('.preset-item').forEach((item) => {
        item.addEventListener('click', () => {
          ensureAudioEngine();
          applyAudioProfile(item.dataset.preset, true);
        });
      });
    }

    // Audio Dubs / Languages
    if (el.watchAudioDubsBtn) el.watchAudioDubsBtn.addEventListener('click', openAudioDubsModal);
    if (el.floatingAudioBtn) el.floatingAudioBtn.addEventListener('click', openAudioDubsModal);
    if (el.watchGuideSecondaryBtn) el.watchGuideSecondaryBtn.addEventListener('click', openDownloadGuide);
    if (el.closeAudioDubsBtn) el.closeAudioDubsBtn.addEventListener('click', closeAudioDubsModal);
    if (el.doneAudioDubsBtn) el.doneAudioDubsBtn.addEventListener('click', closeAudioDubsModal);
    if (el.audioDubsModal) {
      el.audioDubsModal.addEventListener('click', (e) => {
        if (e.target === el.audioDubsModal) closeAudioDubsModal();
      });
    }

    // Next episode button in player header/control
    if (el.nextEpisodeControlBtn) el.nextEpisodeControlBtn.addEventListener('click', playNextEpisode);
    if (el.playNextNowBtn) {
      el.playNextNowBtn.addEventListener('click', () => {
        clearInterval(state.nextEpCountdownInterval);
        if (el.nextEpPrompt) el.nextEpPrompt.classList.add('hidden');
        playNextEpisode();
      });
    }
    if (el.cancelNextBtn) {
      el.cancelNextBtn.addEventListener('click', () => {
        clearInterval(state.nextEpCountdownInterval);
        if (el.nextEpPrompt) el.nextEpPrompt.classList.add('hidden');
      });
    }

    // Auto-hide controls on mouse idle
    if (el.playerContainer) {
      el.playerContainer.addEventListener('mousemove', resetControlsTimeout);
      el.playerContainer.addEventListener('click', resetControlsTimeout);
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', handleGlobalKeydown);
    } catch (err) {
      console.warn("[MovieBox] Error in setupEventListeners:", err);
    }
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
        if (el.playerHeader && !el.playerHeader.classList.contains('watch-top-bar')) {
          el.playerHeader.classList.add('controls-hidden');
        }
        el.qualityMenu.classList.add('hidden');
        el.subtitlesMenu.classList.add('hidden');
        el.speedMenu.classList.add('hidden');
        if (el.serverMenu) el.serverMenu.classList.add('hidden');
        if (el.audioEnhancerMenu) el.audioEnhancerMenu.classList.add('hidden');
      }
    }, 2800);
  }

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement ||
      (el.videoElement && el.videoElement.webkitDisplayingFullscreen) ||
      (el.playerContainer && el.playerContainer.classList.contains('is-fullscreen'))
    );
  }

  function updateFullscreenUI() {
    const isFull = isFullscreenActive();

    // 1. Controls bar fullscreen toggle icon
    if (el.fullscreenOpenIcon) el.fullscreenOpenIcon.classList.toggle('hidden', isFull);
    if (el.fullscreenExitIcon) el.fullscreenExitIcon.classList.toggle('hidden', !isFull);

    // 2. Watch action pill button (above video)
    if (el.watchFullscreenLabel) {
      el.watchFullscreenLabel.textContent = isFull ? 'Exit Fullscreen' : 'Zoom In / Fullscreen';
    }
    if (el.watchFullscreenIcon) {
      el.watchFullscreenIcon.innerHTML = isFull
        ? '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>'
        : '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>';
    }
    if (el.watchFullscreenBtn) {
      el.watchFullscreenBtn.classList.toggle('active', isFull);
      el.watchFullscreenBtn.title = isFull ? 'Exit Fullscreen (Esc / F)' : 'Zoom In / Fullscreen (F)';
    }

    // 3. Floating action button (inside video corner)
    if (el.floatingFullscreenLabel) {
      el.floatingFullscreenLabel.textContent = isFull ? 'Exit' : 'Fullscreen';
    }
    if (el.floatingFullscreenIcon) {
      el.floatingFullscreenIcon.innerHTML = isFull
        ? '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>'
        : '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>';
    }
    if (el.floatingFullscreenBtn) {
      el.floatingFullscreenBtn.classList.toggle('active', isFull);
    }
  }

  async function enterFullscreen() {
    const isMobile = window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Method 1: On iOS Safari with HTML5 video, use native webkitEnterFullscreen
    if (!state.isEmbedMode && el.videoElement && typeof el.videoElement.webkitEnterFullscreen === 'function' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        el.videoElement.webkitEnterFullscreen();
        updateFullscreenUI();
        showToast('⛶ Fullscreen Active');
        return;
      } catch (err) {
        console.warn('iOS webkitEnterFullscreen note:', err);
      }
    }

    // Method 2: Standard HTML5 Fullscreen API on playerContainer
    const target = el.playerContainer || el.playerOverlay || document.documentElement;
    let nativeSuccess = false;

    if (target.requestFullscreen) {
      try {
        await target.requestFullscreen({ navigationUI: 'hide' });
        nativeSuccess = true;
      } catch (e) {
        if (state.isEmbedMode && el.embedPlayerIframe && el.embedPlayerIframe.requestFullscreen) {
          try {
            await el.embedPlayerIframe.requestFullscreen({ navigationUI: 'hide' });
            nativeSuccess = true;
          } catch (e2) {}
        }
      }
    } else if (target.webkitRequestFullscreen) {
      try {
        target.webkitRequestFullscreen();
        nativeSuccess = true;
      } catch (e) {}
    } else if (target.mozRequestFullScreen) {
      try {
        target.mozRequestFullScreen();
        nativeSuccess = true;
      } catch (e) {}
    } else if (target.msRequestFullscreen) {
      try {
        target.msRequestFullscreen();
        nativeSuccess = true;
      } catch (e) {}
    }

    // Method 3: Mobile & Universal CSS Immersive Fullscreen Fallback
    // Always apply CSS zoom-in mode on mobile or when native fullscreen is unavailable/rejected
    if (!nativeSuccess || isMobile) {
      if (el.playerContainer) {
        el.playerContainer.classList.add('is-fullscreen');
      }
      document.body.classList.add('player-in-fullscreen');
    }

    // Attempt orientation lock to landscape on smartphones if supported
    if (screen.orientation && screen.orientation.lock && window.innerWidth <= 768) {
      try {
        screen.orientation.lock('landscape').catch(() => {});
      } catch (e) {}
    }

    updateFullscreenUI();
    showToast(nativeSuccess ? '⛶ Fullscreen Active (Press Esc to exit)' : '⛶ Zoomed to Fullscreen');
  }

  async function exitFullscreen() {
    // 1. Exit native browser fullscreen
    if (document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) {
        await document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }

    // 2. Exit iOS video fullscreen if active
    if (el.videoElement && el.videoElement.webkitDisplayingFullscreen && typeof el.videoElement.webkitExitFullscreen === 'function') {
      try {
        el.videoElement.webkitExitFullscreen();
      } catch (e) {}
    }

    // 3. Remove CSS Immersive Fullscreen
    if (el.playerContainer) {
      el.playerContainer.classList.remove('is-fullscreen');
    }
    document.body.classList.remove('player-in-fullscreen');

    // Unlock screen orientation if locked
    if (screen.orientation && screen.orientation.unlock) {
      try {
        screen.orientation.unlock();
      } catch (e) {}
    }

    updateFullscreenUI();
  }

  function toggleFullscreen() {
    if (isFullscreenActive()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  function openSoundBoosterModal() {
    ensureAudioEngine();
    updateAudioEnhancerUI();
    if (el.soundBoosterModal) {
      const modeHint = document.getElementById('soundBoosterModeHint');
      if (modeHint) {
        const boostPercent = Math.round((state.audioBoost || 1.5) * 100);
        const profile = audioProfiles[state.audioProfile || 'cinema'] || audioProfiles.cinema;
        modeHint.innerHTML = `
          <div style="padding:10px 14px;background:rgba(229,9,20,0.1);border:1px solid rgba(229,9,20,0.3);border-radius:8px;font-size:12.5px;color:#fca5a5;line-height:1.5;margin-bottom:14px;">
            ⚡ <strong>Current Sound Profile:</strong> ${profile.name} • <strong>${boostPercent}% Volume Multiplier</strong>. Tap any preset or drag the slider to change acoustics on any device.
          </div>
        `;
      }
      el.soundBoosterModal.classList.remove('hidden');
    }
  }

  function closeSoundBoosterModal() {
    if (el.soundBoosterModal) {
      el.soundBoosterModal.classList.add('hidden');
    }
  }

  function openAudioDubsModal() {
    if (!el.audioDubsModal || !el.audioDubsListContainer) return;
    el.audioDubsListContainer.innerHTML = '';

    const dubs = state.currentDetails?.dubs || [];
    if (dubs.length > 0) {
      dubs.forEach((dub, idx) => {
        const btn = document.createElement('button');
        btn.className = `menu-item preset-item ${idx === 0 ? 'active' : ''}`;
        btn.style.cssText = 'padding:12px 16px;border-radius:8px;display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,0.06);margin-bottom:6px;';
        btn.innerHTML = `
          <span style="font-weight:600;font-size:14px;">🎧 ${dub.label || dub.language || `Audio Track ${idx + 1}`}</span>
          <span style="font-size:12px;color:var(--text-muted);">${dub.language ? 'Available' : 'Primary'}</span>
        `;
        btn.addEventListener('click', () => {
          closeAudioDubsModal();
          showToast(`Switching to Audio Track: ${dub.label || dub.language}`);
          if (dub.subject_id) {
            startPlayback({ id: { provider: 'moviebox', value: dub.subject_id }, title: state.currentDetails?.title });
          }
        });
        el.audioDubsListContainer.appendChild(btn);
      });
    } else {
      el.audioDubsListContainer.innerHTML = `
        <div style="padding:14px 16px;background:rgba(255,255,255,0.05);border-radius:8px;font-size:13px;line-height:1.6;color:var(--text-secondary);">
          <p><strong>⚡ Multi-Language Server:</strong> Server 1 (Ultra 4K) includes built-in multi-language audio dubs and subtitles.</p>
          <p style="margin-top:8px;">Click the <strong>Audio / Subtitles (CC)</strong> icon inside the player bottom-right controls to switch between English, Hindi, Spanish, French, and other languages instantly!</p>
        </div>
      `;
    }

    el.audioDubsModal.classList.remove('hidden');
  }

  function closeAudioDubsModal() {
    if (el.audioDubsModal) el.audioDubsModal.classList.add('hidden');
  }

  function toggleFavorite(item) {
    if (!item) return;
    const idx = (state.favorites || []).findIndex((f) => isSameMedia(f, item));
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      showToast(`Removed "${item.title || 'Title'}" from My List`);
    } else {
      state.favorites.push(item);
      showToast(`Added "${item.title || 'Title'}" to My List`);
    }
    try {
      localStorage.setItem('netmirror_favorites', JSON.stringify(state.favorites));
    } catch (_) {}
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
      if (isFullscreenActive()) {
        exitFullscreen();
        return;
      }
      if (el.vipModal && !el.vipModal.classList.contains('hidden')) {
        el.vipModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        return;
      }
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
        ensureAudioEngine();
        let cur = parseFloat(el.volumeSlider.value) || 1.0;
        let next = Math.min(2.5, +(cur + 0.1).toFixed(2));
        el.volumeSlider.value = next;
        if (next <= 1.0) {
          video.volume = next;
          video.muted = false;
        } else {
          video.volume = 1.0;
          video.muted = false;
          setVolumeBoost(next, true);
        }
        updateVolumeIcons();
        const total = Math.round(video.volume * (state.audioBoost || 1.5) * 100);
        showToast(`Volume: ${total}% ${total > 100 ? '⚡ (Boosted)' : ''}`);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        ensureAudioEngine();
        let cur = parseFloat(el.volumeSlider.value) || 1.0;
        let next = Math.max(0, +(cur - 0.1).toFixed(2));
        el.volumeSlider.value = next;
        if (next <= 1.0) {
          video.volume = next;
          video.muted = next === 0;
        } else {
          setVolumeBoost(next, true);
        }
        updateVolumeIcons();
        const total = Math.round(video.volume * (state.audioBoost || 1.5) * 100);
        showToast(`Volume: ${total}%`);
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        ensureAudioEngine();
        cycleAudioProfile();
      }
    }
  }

  // 1. Instant 0ms hydration if DOM elements already parsed
  try {
    if (document.getElementById('trendingCarousel')) {
      applyDefaultShowcase();
    }
  } catch (_) {}

  // 2. Standard DOM ready execution
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 3. Window load safety net and AdSense push trigger
  window.addEventListener('load', () => {
    try {
      if (!state.heroItem) applyDefaultShowcase();
      triggerAllAdSenseUnits();
    } catch (_) {}
  });

})();

