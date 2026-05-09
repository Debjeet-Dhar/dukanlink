/**
 * SEO configuration and utilities for DukanLink
 */

export const SEO_CONFIG = {
  baseUrl: "https://dukanlink.com",
  siteName: "DukanLink",
  defaultTitle: "DukanLink - Your Shop, One Link Away",
  defaultDescription:
    "Create your free online shop in seconds. No coding required. Get orders directly on WhatsApp. Perfect for small businesses, startups, and resellers.",
  defaultKeywords:
    "online shop, WhatsApp shop, ecommerce, small business, free shop, digital store, no coding",
  defaultImage: "https://dukanlink.com/og-image.png",
  twitterHandle: "@DukanLink",
};

/**
 * Generate structured data for a page
 * @param {string} type - Schema.org type
 * @param {object} data - Data for the schema
 * @returns {object} JSON-LD structure
 */
export const generateSchema = (type, data) => {
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": type,
  };
  return { ...baseSchema, ...data };
};

/**
 * Generate meta tags for a page
 * @param {object} config - Meta configuration
 * @returns {object} Meta tags object
 */
export const generateMetaTags = (config) => {
  const {
    title = SEO_CONFIG.defaultTitle,
    description = SEO_CONFIG.defaultDescription,
    keywords = SEO_CONFIG.defaultKeywords,
    url = SEO_CONFIG.baseUrl,
    image = SEO_CONFIG.defaultImage,
    author = "DukanLink",
    type = "website",
    ogType = "website",
  } = config;

  return {
    title,
    description,
    keywords,
    url,
    image,
    author,
    type,
    ogType,
  };
};

/**
 * Generate breadcrumb schema
 * @param {array} items - Array of {name, url}
 * @returns {object} Breadcrumb schema
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * SEO config for different pages
 */
export const PAGE_SEO = {
  landing: {
    title: "DukanLink - Your Shop, One Link Away | Free Online Store Builder",
    description:
      "Create your free online shop in seconds with DukanLink. No coding required. Get orders directly on WhatsApp. Join 10000+ sellers.",
    keywords:
      "online shop, WhatsApp store, ecommerce platform, free shop builder, digital store, small business",
  },
  login: {
    title: "Login to DukanLink - Your Online Shop",
    description:
      "Sign in to your DukanLink account to manage your shop, products, and orders on WhatsApp.",
    keywords: "DukanLink login, shop account, seller dashboard",
  },
  dashboard: {
    title: "Dashboard - DukanLink",
    description:
      "Manage your shop, products, and orders from your DukanLink dashboard.",
    keywords: "shop dashboard, manage store, seller tools",
  },
  products: {
    title: "Products - DukanLink",
    description:
      "Add, edit, and manage your products on DukanLink. Keep your shop inventory updated.",
    keywords: "product management, inventory, shop catalog",
  },
  settings: {
    title: "Settings - DukanLink",
    description: "Customize your shop settings and preferences on DukanLink.",
    keywords: "shop settings, customize store",
  },
  publicShop: {
    title: "Shop - DukanLink",
    description: "Browse our shop and order directly on WhatsApp.",
    keywords: "shop, products, order online",
  },
  admin: {
    title: "Admin Panel - DukanLink",
    description: "Manage DukanLink platform from the admin panel.",
    keywords: "admin, platform management",
  },
};
