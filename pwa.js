(() => {
    "use strict";

    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./service-worker.js").catch((error) => {
                console.warn("No se pudo preparar el modo sin conexión.", error);
            });
        });
    }
})();
