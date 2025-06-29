import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
