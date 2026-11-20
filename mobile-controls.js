(() => {
    "use strict";

    const bajar = document.querySelector('[data-tactil="abajo"]');
    if (!bajar) return;

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
        emitirTecla("keydown");
    });

    for (const tipo of ["pointerup", "pointercancel", "lostpointercapture"]) {
        bajar.addEventListener(tipo, () => emitirTecla("keyup"));
    }
})();

