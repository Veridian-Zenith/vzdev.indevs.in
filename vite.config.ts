import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Don't serve navigations from the precached index.html. index.html
        // references content-hashed asset filenames, so serving a precached
        // shell pins a client to a previous deploy's CSS/JS — which shows up
        // as stale styling, most visibly on mobile where the service worker
        // survives for days between foregroundings.
        // Network-first keeps HTML fresh and falls back to cache when offline.
        navigateFallback: null,
        globPatterns: ['assets/**/*.{js,css,woff2,png,svg,webp}', '*.js', 'manifest.webmanifest'],
        runtimeCaching: [
          {
            urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'vz-pages',
              networkTimeoutSeconds: 3,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
        ],
      },
      manifest: {
          name: 'Veridian Zenith',
          short_name: 'VZ',
          description: 'A high-end, mystical Nordic-inspired digital realm showcasing the artifacts and technologies forged by Veridian Zenith.',
          start_url: '/',
          display: 'standalone',
          background_color: '#050200',
          theme_color: '#FFB347',
          icons: [
          {
            src: '/assets/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/assets/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/') || id.includes('react-router-dom/')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react')) {
              return 'lucide-react';
            }
          }
        },
      },
    },
  },
})
