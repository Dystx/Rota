import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/trip/new',
      ],
      disallow: [
        '/admin/',
        '/reviewer/',
        '/account/',
        '/trip/',
        '/api/',
      ],
    },
    sitemap: 'https://rumia.pt/sitemap.xml',
  };
}
