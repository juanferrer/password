/* globals debug */

if ("serviceWorker" in navigator) {
    if (navigator.serviceWorker.controller) {
        debug.log("[PWA] active service worker found, no need to register");
    } else {
        // Register the service worker
        navigator.serviceWorker
            .register("./service-worker.js", {
                scope: "./"
            })
            .then(function (reg) {
                debug.log("[PWA] Service worker has been registered for scope: " + reg.scope);
            });
    }
}
