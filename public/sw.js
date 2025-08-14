const CACHE_NAME = "daily-journal-v1"
const urlsToCache = [
    "/",
    "/src/main.ts",
    "/src/App.vue",
    "/src/style.css",
    "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600&display=swap",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Opened cache")
            return cache.addAll(urlsToCache)
        }),
    )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached version or fetch from network
            if (response) {
                return response
            }
            return fetch(event.request)
        }),
    )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log("Deleting old cache:", cacheName)
                        return caches.delete(cacheName)
                    }
                }),
            )
        }),
    )
})

// Background sync for saving entries when back online
self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
        event.waitUntil(doBackgroundSync())
    }
})

function doBackgroundSync() {
    // Since we're using localStorage, entries are already saved locally
    // This could be extended to sync with a server if needed
    console.log("Background sync completed")
    return Promise.resolve()
}
