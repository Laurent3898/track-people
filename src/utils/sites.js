const defaultSites = [
  "linkedin.com",
  "x.com",
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "pinterest.com",
];

export const allowedSites =
  process.env.ALLOWED_SITES?.split(",") || defaultSites;
