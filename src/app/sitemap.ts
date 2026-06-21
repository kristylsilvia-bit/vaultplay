import type { MetadataRoute } from 'next';
import { games } from '@/lib/games';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaultplay.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/games`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/favorites`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ];
  const gameRoutes: MetadataRoute.Sitemap = games
    .filter((g) => g.playable)
    .map((g) => ({
      url: `${siteUrl}/game/${g.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  return [...staticRoutes, ...gameRoutes];
}
