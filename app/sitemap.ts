import type { MetadataRoute } from 'next';

const BASE = 'https://v0-farm-contact-website.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['', '/about', '/rtsfarm', '/rtsfarm/play', '/privacy'].map(path => ({
    url: `${BASE}${path}`,
  }));
}
