"use strict";

const CACHE_NAME = "aventura-pixel-v19";
const APP_FILES = [
    "./",
    "./index.html",
    "./style.css",
    "./game-core.js",
    "./game-audio.js",
    "./game.js?v=13",
    "./mobile-controls.js?v=2",
    "./pwa.js",
    "./manifest.webmanifest",
    "./icon-192.png",
    "./icon-512.png",
    "./apple-touch-icon.png",
    "./icon.svg"
];

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await Promise.all(APP_FILES.map(async (file) => {
            try {
                const request = new Request(file, { cache: "reload" });
                const response = await fetch(request);
                if (response.ok) await cache.put(request, response);
            } catch (error) {
                // Un archivo secundario sin conexión no debe bloquear la app.
            }
        }));
    })());
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(keys
            .filter((key) => key.startsWith("aventura-pixel-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)));
        await self.clients.claim();
    })());
});

self.addEventListener("fetch", (event) => {
    const request = event.request;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
            const response = await fetch(request);
            if (response.ok) await cache.put(request, response.clone());
            return response;
        } catch (error) {
            if (request.mode === "navigate") {
                return (await cache.match("./")) || (await cache.match("./index.html")) || Response.error();
            }
            return Response.error();
        }
    })());
});

