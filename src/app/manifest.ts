import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LevelUP',
    short_name: 'LevelUP',
    description: 'Convierte tus hábitos en una aventura RPG.',
    start_url: '/home',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0E1116',
    theme_color: '#0E1116',
    categories: ['health', 'fitness', 'lifestyle', 'games'],
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Inicio',
        url: '/home',
        icons: [{ src: '/icon', sizes: '96x96' }],
      },
      {
        name: 'Mi héroe',
        url: '/me',
        icons: [{ src: '/icon', sizes: '96x96' }],
      },
    ],
  };
}
