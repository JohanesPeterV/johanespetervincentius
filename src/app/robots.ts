import { MetadataRoute } from 'next';

const SITE_URL = 'https://johanespetervincentius.my.id';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
