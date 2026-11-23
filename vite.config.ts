import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import amiriRegular from "./src/assets/amiri-regular.ttf.asset.json";
import amiriBold from "./src/assets/amiri-bold.ttf.asset.json";

// A distinct fallback avoids Workbox precache routes taking priority over fresh HTML navigations.
const offlineShell = (): Plugin => ({
  name: "noor-offline-shell",
  apply: "build",
  enforce: "post",
  generateBundle(_options, bundle) {
    const html = bundle["index.html"];
    if (html?.type === "asset") this.emitFile({ type: "asset", fileName: "offline-shell.html", source: html.source });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger(), offlineShell(), VitePWA({
    strategies: "generateSW",
    filename: "sw.js",
    registerType: "autoUpdate",
    injectRegister: null,
    manifest: false,
    devOptions: { enabled: false },
    workbox: {
      additionalManifestEntries: [amiriRegular, amiriBold].map(asset => ({ url: asset.url, revision: null })),
      globIgnores: ["**/firebase-messaging-sw.js", "**/index.html"],
      directoryIndex: null,
      globPatterns: ["**/*.{js,css,html,png,jpg,svg,ico,woff,woff2}", "data/quranAyats.json", "manifest.webmanifest"],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      navigateFallback: null,
      runtimeCaching: [
        {
          urlPattern: ({ request, url }) => request.mode === "navigate" && !/^\/(?:~oauth|auth|reset-password|forgot-password)(?:\/|$)/.test(url.pathname),
          handler: "NetworkFirst",
          options: { cacheName: "noor-navigations", networkTimeoutSeconds: 3, precacheFallback: { fallbackURL: "/offline-shell.html" }, expiration: { maxEntries: 30, maxAgeSeconds: 86400 * 7 } },
        },
        {
          urlPattern: ({ url, sameOrigin }) => sameOrigin && /^\/assets\/.+-[\w-]+\.(js|css|woff2?|png|jpg|svg)$/.test(url.pathname),
          handler: "CacheFirst",
          options: { cacheName: "noor-hashed-assets", expiration: { maxEntries: 100, maxAgeSeconds: 86400 * 30 } },
        },
        {
          urlPattern: ({ url }) => url.hostname === "api.aladhan.com" && /^\/v1\/(timings|gToH)/.test(url.pathname),
          handler: "NetworkFirst",
          options: { cacheName: "noor-prayer-data", networkTimeoutSeconds: 5, cacheableResponse: { statuses: [200] }, expiration: { maxEntries: 60, maxAgeSeconds: 86400 * 7 } },
        },
        {
          urlPattern: ({ url }) => ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname),
          handler: "NetworkFirst",
          options: { cacheName: "noor-fonts", networkTimeoutSeconds: 3, cacheableResponse: { statuses: [0, 200] }, expiration: { maxEntries: 40, maxAgeSeconds: 86400 * 30 } },
        },
      ],
    },
  })].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: true,
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
  },
}));
