(() => {
    "use strict";

    const bajar = document.querySelector('[data-tactil="abajo"]');
    if (!bajar) return;

    let pulsadoDesde = 0;
    let liberacionSolicitada = false;

    const emitirTecla = (tipo) => {
        window.dispatchEvent(new KeyboardEvent(tipo, {
            key: "ArrowDown",
            code: "ArrowDown",
            bubbles: true,
            cancelable: true
        }));
    };

    bajar.addEventListener("pointerdown", (evento) => {
        evento.preventDefault();
        if (pulsadoDesde) return;
        pulsadoDesde = Date.now();
        liberacionSolicitada = false;
        emitirTecla("keydown");
    });

    for (const tipo of ["pointerup", "pointercancel", "lostpointercapture"]) {
        bajar.addEventListener(tipo, () => {
            if (!pulsadoDesde || liberacionSolicitada) return;
            liberacionSolicitada = true;
            const espera = Math.max(0, 180 - (Date.now() - pulsadoDesde));
            setTimeout(() => {
                emitirTecla("keyup");
                pulsadoDesde = 0;
                liberacionSolicitada = false;
            }, espera);
        });
    }
})();

