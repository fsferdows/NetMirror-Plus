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

  // 5. BANNER ADVERTISING NETWORKS (e.g. Monetag, Adsterra, PropellerAds, Google AdSense)
  // Set enabled to true when you sign up with an ad network and paste your banner ad HTML:
  // When enabled: true, your banners will appear in dedicated, clean sponsor slots.
  // When enabled: false, ALL ad slots are completely removed and blocked.
  adBanners: {
    enabled: false,
    headerBannerHtml: "", // Paste your ad code here (e.g. 728x90 leaderboard or responsive banner)
    detailsBannerHtml: "" // Paste your ad code here (e.g. 300x250 or native banner)
  }
};


