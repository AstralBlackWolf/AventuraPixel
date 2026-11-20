(() => {
    "use strict";

    if (!("serviceWorker" in navigator) || (location.protocol !== "https:" && location.hostname !== "localhost")) return;

    let registro;
    let recargando = false;

    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
            if (recargando) return;
            recargando = true;
            window.location.reload();
        });
    }

    const actualizar = () => {
        if (registro) registro.update().catch(() => {});
    };

    window.addEventListener("load", async () => {
        try {
            registro = await navigator.serviceWorker.register("./service-worker.js", { updateViaCache: "none" });
            actualizar();
        } catch (error) {
            console.warn("No se pudo preparar el modo sin conexión.", error);
        }
    });

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) actualizar();
    });
})();

