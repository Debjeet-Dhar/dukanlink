/**
 * SEO Performance and Accessibility Enhancements
 * Utilities for improving Core Web Vitals and page performance
 */

/**
 * Generate image srcset for responsive images
 * @param {string} imagePath - Base image path
 * @returns {object} srcset and sizes for responsive images
 */
export const generateImageSrcSet = (imagePath) => {
  return {
    srcSet: `
      ${imagePath}?w=640 640w,
      ${imagePath}?w=1024 1024w,
      ${imagePath}?w=1280 1280w,
      ${imagePath}?w=1920 1920w
    `.trim(),
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1280px",
  };
};

/**
 * Optimize images for lazy loading and performance
 * @param {string} imagePath - Image URL
 * @returns {object} Image loading optimization config
 */
export const optimizeImageLoading = (imagePath) => {
  return {
    loading: "lazy",
    decoding: "async",
    ...generateImageSrcSet(imagePath),
  };
};

/**
 * Generate preload link for critical resources
 * @param {string} href - Resource URL
 * @param {string} type - Resource type (script, style, image, etc)
 * @returns {object} Link configuration
 */
export const generatePreloadLink = (href, type = "script") => {
  return {
    rel: "preload",
    href,
    as: type,
  };
};

/**
 * Performance hints for page optimization
 * @returns {array} Array of performance optimization hints
 */
export const getPerformanceHints = () => [
  { rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
  { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
  { rel: "preconnect", href: "https://cdn.jsdelivr.net" },
];

/**
 * Generate accessibility attributes for interactive elements
 * @param {string} label - ARIA label
 * @param {string} description - ARIA description
 * @param {boolean} required - Is element required
 * @returns {object} Accessibility attributes
 */
export const generateA11yAttributes = (
  label,
  description = "",
  required = false,
) => {
  return {
    "aria-label": label,
    ...(description && { "aria-description": description }),
    ...(required && { "aria-required": true }),
  };
};

/**
 * Compress and optimize URL parameters
 * @param {object} params - URL parameters
 * @returns {string} Compressed URL query string
 */
export const compressUrlParams = (params) => {
  const query = new URLSearchParams(params);
  return query.toString();
};

/**
 * Generate canonical URL
 * @param {string} path - Page path
 * @param {string} baseUrl - Base domain URL
 * @returns {string} Canonical URL
 */
export const generateCanonicalUrl = (
  path,
  baseUrl = "https://dukanlink.com",
) => {
  const url = new URL(path, baseUrl);
  return url.toString();
};

/**
 * Social sharing utilities
 * Generate pre-formatted sharing URLs for different platforms
 */
export const generateSocialShareUrls = (title, description, url) => {
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(description)}`,
  };
};
