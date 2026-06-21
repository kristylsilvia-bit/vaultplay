import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VaultPlay — Free Browser Games',
    short_name: 'VaultPlay',
    description: 'Play 700+ free browser games instantly. No sign-up, no downloads.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0c0c12',
    theme_color: '#0c0c12',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  };
}
