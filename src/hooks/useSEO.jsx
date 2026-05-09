import { Helmet } from "react-helmet-async";
import { SEO_CONFIG, PAGE_SEO } from "../lib/seo";

/**
 * Custom hook to set page SEO metadata
 * Usage: useSEO({ title, description, keywords, image, url })
 */
export const useSEO = ({
  title = SEO_CONFIG.defaultTitle,
  description = SEO_CONFIG.defaultDescription,
  keywords = SEO_CONFIG.defaultKeywords,
  image = SEO_CONFIG.defaultImage,
  url = SEO_CONFIG.baseUrl,
  canonicalUrl = url,
  ogType = "website",
  author = "DukanLink",
  publishedDate,
  modifiedDate,
  schema,
} = {}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="canonical" href={canonicalUrl} />
      {publishedDate && (
        <meta property="article:published_time" content={publishedDate} />
      )}
      {modifiedDate && (
        <meta property="article:modified_time" content={modifiedDate} />
      )}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
};

export default useSEO;
