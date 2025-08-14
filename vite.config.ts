import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { VitePWA } from "vite-plugin-pwa"

export default defineConfig({
    server: {
        host: true, // Accept connections from any host
        allowedHosts: true, // Added allowedHost: true for ngrok compatibility
        port: 5173,
    },
    plugins: [
        vue(),
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
            manifest: {
                name: "Daily Journal",
                short_name: "Journal",
                description: "Your personal daily reflection companion",
                theme_color: "#0a0907",
                background_color: "#0a0907",
                display: "standalone",
                orientation: "portrait",
                scope: "/",
                start_url: "/",
                categories: ["productivity", "lifestyle"],
                lang: "en",
                dir: "ltr",
                display_override: ["window-controls-overlay", "standalone"],
                edge_side_panel: {
                    preferred_width: 400,
                },
                icons: [
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "pwa-512x512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                    {
                        src: "pwa-192x192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "monochrome",
                    },
                ],
                shortcuts: [
                    {
                        name: "New Entry",
                        short_name: "New",
                        description: "Create a new journal entry",
                        url: "/",
                        icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
                    },
                    {
                        name: "Calendar",
                        short_name: "Calendar",
                        description: "Browse past entries",
                        url: "/",
                        icons: [{ src: "pwa-192x192.png", sizes: "192x192" }],
                    },
                ],
            },
            workbox: {
                globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
                runtimeCaching: [
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "google-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                        },
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
                        handler: "CacheFirst",
                        options: {
                            cacheName: "gstatic-fonts-cache",
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365,
                            },
                        },
                    },
                ],
            },
            devOptions: {
                enabled: true,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": "/src",
        },
    },
})
