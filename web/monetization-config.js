/**
 * NetMirror Plus – Monetization & Revenue Configuration
 * Google AdSense Publisher: ca-pub-4512671475286537
 *
 * POLICY:
 * Ads are shown ONLY when you configure and enable them here (when you get money).
 * When ads are disabled or empty, ZERO ads are displayed to your users.
 * All unauthorized 3rd-party malware, popups, and rogue redirects from video servers
 * are permanently blocked by NetMirror AdShield at all times.
 */
window.NETMIRROR_MONETIZATION = {
  // 1. HIGH-PAYING STREAMING VPN AFFILIATE (NordVPN, Surfshark, CyberGhost, etc.)
  showVpnBanners: false,
  affiliateVpnUrl: "https://nordvpn.com/special-deal/?coupon=save70",
  affiliateVpnBadge: "70% OFF + 3 MO FREE",
  affiliateVpnTitle: "Buffer-Free 4K Streaming VPN",
  affiliateVpnDesc: "Bypass ISP throttling, stream 4K movies with zero lag & unlock worldwide geo-restricted catalogs.",

  // 2. DONATION & SUPPORTER PLATFORMS (Ko-fi, Buy Me a Coffee, PayPal, Patreon)
  buyMeACoffeeUrl: "https://buymeacoffee.com",
  kofiUrl: "https://ko-fi.com",
  paypalUrl: "https://paypal.me",

  // 3. CRYPTOCURRENCY WALLET ADDRESSES FOR TIPS & VIP ACCESS
  cryptoWallets: {
    usdt: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (USDT TRC-20)",
    btc: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Bitcoin)",
    eth: "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (Ethereum / USDT ERC-20)",
    sol: "So11111111111111111111111111111111111111112 (Solana)"
  },

  // 4. VIP PASSCODES (Users can enter these to unlock VIP ad-free status)
  vipPasscodes: ["FSFERDOWS", "FARDIN KHAN", "ILOVEUU"],

  // 5. BANNER ADVERTISING NETWORKS – GOOGLE ADSENSE (ca-pub-4512671475286537)
  // Google AdSense is the only permitted monetization partner.
  // All unauthorized popups, popunders, and rogue redirects from video mirrors are blocked by AdShield.
  googleAdSense: {
    client: "ca-pub-4512671475286537",
    enabled: true
  },
  adBanners: {
    enabled: true,
    // Google AdSense Responsive Display Unit for Header (Top of Homepage)
    headerBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Responsive Display Unit for Mid-Rail (In-Between Category Rails)
    midRailBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Responsive Display Unit for Movie/Show Details Modal
    detailsBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-slot="auto" data-ad-format="rectangle" data-full-width-responsive="true"></ins>',
    // Google AdSense Responsive Unit for Cinema Watch Cockpit View
    watchBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Footer Unit (Bottom of Homepage)
    footerBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-slot="auto" data-ad-format="auto" data-full-width-responsive="true"></ins>'
  },

  // 6. THE MOVIE DATABASE (TMDB) API KEY / BEARER TOKEN
  tmdbApiKey: (typeof window !== "undefined" && (window.VITE_TMDB_API_KEY || window.NEXT_PUBLIC_TMDB_API_KEY)) || ""
};
