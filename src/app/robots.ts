import type { MetadataRoute } from 'next';

/** Le panneau d'administration ne doit pas être indexé par les moteurs. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
  };
}
