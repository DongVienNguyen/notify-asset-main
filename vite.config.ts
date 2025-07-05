import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
	allowedHosts: [
      'refined-haddock-perfect.ngrok-free.app',
      'localhost',
      '127.0.0.1',
      // thêm bất kỳ tên miền nào khác mà bạn cần cho phép
    ],
  },
  //base: '/notify-asset-main/',
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'logo192.png', 'logo512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Hệ thống Thông báo TS',
        short_name: 'Thông báo TS',
        description: 'Hệ thống quản lý tài sản và thông báo mượn/xuất tài sản',
        theme_color: '#4ade80',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/itoapoyrxxmtbbuolfhk\.supabase\.co\/rest\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));