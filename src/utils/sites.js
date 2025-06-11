const defaultSites = [
  "linkedin.com",
  "twitter.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "pinterest.com",
];

export const allowedSites =
  process.env.ALLOWED_SITES?.split(",") || defaultSites;
