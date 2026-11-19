/**
 * NetMirror Plus – Monetization & Revenue Configuration
 * Customize your affiliate links, donation URLs, crypto wallet addresses, VIP passcodes, and ad banners here!
 *
 * POLICY:
 * Ads are shown ONLY when you configure and enable them here (when you get money).
 * When ads are disabled or empty, ZERO ads are displayed to your users.
 * All unauthorized 3rd-party malware, popups, and rogue redirects from video servers
 * are permanently blocked by NetMirror AdShield at all times.
 */
window.NETMIRROR_MONETIZATION = {
  // 1. HIGH-PAYING STREAMING VPN AFFILIATE (NordVPN, Surfshark, CyberGhost, etc.)
  // Kept off by default to guarantee 100% clean, ad-free mobile & desktop experience.
  showVpnBanners: false,
  // Replace with your real affiliate link from CJ Affiliate, Impact, or NordVPN/Surfshark directly:
  affiliateVpnUrl: "https://nordvpn.com/special-deal/?coupon=save70",
  affiliateVpnBadge: "70% OFF + 3 MO FREE",
  affiliateVpnTitle: "Buffer-Free 4K Streaming VPN",
  affiliateVpnDesc: "Bypass ISP throttling, stream 4K movies with zero lag & unlock worldwide geo-restricted catalogs.",

  // 2. DONATION & SUPPORTER PLATFORMS (Ko-fi, Buy Me a Coffee, PayPal, Patreon)
  // Replace these with your own profile usernames/links:
  buyMeACoffeeUrl: "https://buymeacoffee.com",
  kofiUrl: "https://ko-fi.com",
  paypalUrl: "https://paypal.me",

  // 3. CRYPTOCURRENCY WALLET ADDRESSES FOR TIPS & VIP ACCESS
  // Users can copy your address with 1 click in the VIP modal:
  cryptoWallets: {
    usdt: "TXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (USDT TRC-20)",
    btc: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (Bitcoin)",
    eth: "0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (Ethereum / USDT ERC-20)",
    sol: "So11111111111111111111111111111111111111112 (Solana)"
  },

  // 4. VIP PASSCODES (Users can enter these to unlock VIP status)
  // You can sell these passcodes on Gumroad, Discord, Telegram, or Ko-fi!
  vipPasscodes: ["VIP2026", "NETMIRRORVIP", "PREMIUM4K", "GOLDENPASS", "FSFERDOWS"],

  // 5. BANNER ADVERTISING NETWORKS – GOOGLE ADSENSE ONLY
  // Google AdSense is the only permitted monetization partner.
  // All unauthorized popups, popunders, and rogue redirects from video mirrors are blocked by AdShield.
  googleAdSense: {
    client: "ca-pub-4512671475286537",
    enabled: true
  },
  adBanners: {
    enabled: true,
    // Google AdSense Responsive Display Unit for Header
    headerBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Responsive Display Unit for Movie/Show Details Modal
    detailsBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="rectangle" data-full-width-responsive="true"></ins>',
    // Google AdSense Responsive Display Unit for Watch Player Screen (Below Video)
    playerBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Display Unit for Watch Series Episodes Sidebar
    playerSidebarBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="rectangle" data-full-width-responsive="true"></ins>',
    // Google AdSense In-Feed / Browse Rails Unit
    infeedBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Grid Top Unit (Movies / TV Shows / Trending / Sports / Search)
    gridBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="auto" data-full-width-responsive="true"></ins>',
    // Google AdSense Download Center Modal Unit
    downloadBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="rectangle" data-full-width-responsive="true"></ins>',
    // Google AdSense Footer Unit
    footerBannerHtml: '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-4512671475286537" data-ad-format="auto" data-full-width-responsive="true"></ins>'
  }
};


