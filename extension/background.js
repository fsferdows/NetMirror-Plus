// moviehub.stream - Chrome Extension Background Service Worker (Manifest V3)

const SITE_URL = 'https://moviehub.stream';

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for searching highlighted text
  chrome.contextMenus.create({
    id: 'moviebox_search_selection',
    title: 'Search on moviehub.stream: "%s"',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'moviebox_open_home',
    title: 'Open moviehub.stream (4K Streams)',
    contexts: ['action']
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'moviebox_search_selection' && info.selectionText) {
    const query = encodeURIComponent(info.selectionText.trim());
    chrome.tabs.create({
      url: `${SITE_URL}/?search=${query}`
    });
  } else if (info.menuItemId === 'moviebox_open_home') {
    chrome.tabs.create({
      url: SITE_URL
    });
  }
});

// Omnibox "mb <query>" support in Chrome address bar
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const query = encodeURIComponent(text.trim());
  const url = query ? `${SITE_URL}/?search=${query}` : SITE_URL;
  if (disposition === 'currentTab') {
    chrome.tabs.update({ url });
  } else {
    chrome.tabs.create({ url });
  }
});

chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (!text || text.trim().length < 2) return;
  try {
    const res = await fetch(`${SITE_URL}/api/search?q=${encodeURIComponent(text.trim())}`);
    if (!res.ok) return;
    const data = await res.json();
    const items = (data.items || []).slice(0, 5);
    const suggestions = items.map(item => ({
      content: item.title,
      description: `<match>${escapeXml(item.title)}</match> <dim>(${item.year || item.media_type || 'Movie'})</dim>`
    }));
    suggest(suggestions);
  } catch (e) {
    // Silent catch for background worker
  }
});

function escapeXml(unsafe) {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
