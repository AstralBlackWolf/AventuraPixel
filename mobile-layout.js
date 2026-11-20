(() => {
    "use strict";

    const contenedor = document.querySelector(".marco-juego");
    const zonaControles = document.querySelector(".controles-tactiles");
    const botonAjustar = document.querySelector('[data-tactil="ajustar"]');
    const barraAjuste = document.querySelector(".controles-ajuste");
    const controles = [...document.querySelectorAll(
        '.controles-tactiles button:not([data-tactil="ajustar"])'
    )];
    const canvas = document.getElementById("juego");
    const contexto = canvas?.getContext("2d");
    const CLAVE_POSICIONES = "aventuraPixelControlesMovilesV1";
    const esTactil = window.matchMedia("(pointer: coarse)");

    if (!contenedor || !zonaControles || !botonAjustar || !barraAjuste || !canvas || !contexto) return;

    let posiciones = cargarPosiciones();
    let estabaJugandoAlAjustar = false;
    let arrastre = null;

    function cargarPosiciones() {
        try {
            const guardadas = JSON.parse(localStorage.getItem(CLAVE_POSICIONES) || "null");
            return guardadas && guardadas.version === 1 && guardadas.posiciones
                ? guardadas.posiciones
                : null;
        } catch (error) {
            return null;
        }
    }

    function guardarPosiciones() {
        try {
            localStorage.setItem(CLAVE_POSICIONES, JSON.stringify({
                version: 1,
                posiciones
            }));
        } catch (error) {
            // El ajuste sigue funcionando durante esta sesión aunque el
            // navegador no permita guardar datos locales.
        }
    }

    function limitarPosicion(control, x, y) {
        const ancho = Math.max(1, contenedor.clientWidth);
        const alto = Math.max(1, contenedor.clientHeight);
        const maxX = Math.max(0, 1 - control.offsetWidth / ancho);
        const maxY = Math.max(0, 1 - control.offsetHeight / alto);
        return {
            x: Math.min(maxX, Math.max(0, x)),
            y: Math.min(maxY, Math.max(0, y))
        };
    }

    function colocar(control, posicion) {
        const segura = limitarPosicion(control, posicion.x, posicion.y);
        control.style.setProperty("--control-x", (segura.x * 100) + "%");
        control.style.setProperty("--control-y", (segura.y * 100) + "%");
        posiciones[control.dataset.tactil] = segura;
    }

    function aplicarPosiciones() {
        if (!posiciones) return;
        document.body.classList.add("controles-personalizados");
        for (const control of controles) {
            const posicion = posiciones[control.dataset.tactil];
            if (posicion && Number.isFinite(posicion.x) && Number.isFinite(posicion.y)) {
                colocar(control, posicion);
            }
        }
    }

    function pulsarPausa() {
        let tecla = "p";
        try {
            const opciones = JSON.parse(localStorage.getItem("aventuraPixelOpcionesV1") || "null");
            tecla = opciones?.bindings?.pausa || tecla;
        } catch (error) {
            // Se conserva P como tecla predeterminada.
        }
        window.dispatchEvent(new KeyboardEvent("keydown", {
            key: tecla,
            bubbles: true,
            cancelable: true
        }));
    }

    function iniciarAjuste() {
        if (!esTactil.matches || !document.body.classList.contains("en-partida")) return;
        estabaJugandoAlAjustar = !document.body.classList.contains("partida-pausada");
        if (estabaJugandoAlAjustar) pulsarPausa();

        if (!posiciones) {
            const marco = contenedor.getBoundingClientRect();
            posiciones = {};
            for (const control of controles) {
                const caja = control.getBoundingClientRect();
                posiciones[control.dataset.tactil] = limitarPosicion(control, {
                    x: (caja.left - marco.left) / marco.width,
                    y: (caja.top - marco.top) / marco.height
                }.x, (caja.top - marco.top) / marco.height);
            }
        }

        document.body.classList.add("controles-personalizados", "ajustando-controles");
        aplicarPosiciones();
        barraAjuste.setAttribute("aria-hidden", "false");
    }

    function terminarAjuste(reanudar = true) {
        if (!document.body.classList.contains("ajustando-controles")) return;
        document.body.classList.remove("ajustando-controles");
        barraAjuste.setAttribute("aria-hidden", "true");
        guardarPosiciones();
        if (reanudar && estabaJugandoAlAjustar) pulsarPausa();
        estabaJugandoAlAjustar = false;
        arrastre = null;
    }

    function restablecer() {
        posiciones = null;
        try {
            localStorage.removeItem(CLAVE_POSICIONES);
        } catch (error) {
            // No hace falta guardar el diseño predeterminado.
        }
        for (const control of controles) {
            control.style.removeProperty("--control-x");
            control.style.removeProperty("--control-y");
        }
        document.body.classList.remove("controles-personalizados", "ajustando-controles");
        barraAjuste.setAttribute("aria-hidden", "true");
        if (estabaJugandoAlAjustar) pulsarPausa();
        estabaJugandoAlAjustar = false;
    }

    botonAjustar.addEventListener("click", iniciarAjuste);
    barraAjuste.querySelector('[data-layout="guardar"]').addEventListener("click", () => terminarAjuste());
    barraAjuste.querySelector('[data-layout="restablecer"]').addEventListener("click", restablecer);

    for (const control of controles) {
        control.addEventListener("pointerdown", (evento) => {
            if (!document.body.classList.contains("ajustando-controles")) return;
            evento.preventDefault();
            evento.stopImmediatePropagation();
            control.setPointerCapture(evento.pointerId);
            const caja = control.getBoundingClientRect();
            arrastre = {
                control,
                id: evento.pointerId,
                inicioX: evento.clientX,
                inicioY: evento.clientY,
                x: (caja.left - contenedor.getBoundingClientRect().left) / contenedor.clientWidth,
                y: (caja.top - contenedor.getBoundingClientRect().top) / contenedor.clientHeight
            };
        }, true);

        control.addEventListener("pointermove", (evento) => {
            if (!arrastre || arrastre.control !== control || arrastre.id !== evento.pointerId) return;
            evento.preventDefault();
            const ancho = Math.max(1, contenedor.clientWidth);
            const alto = Math.max(1, contenedor.clientHeight);
            colocar(control, {
                x: arrastre.x + (evento.clientX - arrastre.inicioX) / ancho,
                y: arrastre.y + (evento.clientY - arrastre.inicioY) / alto
            });
        });

        for (const tipo of ["pointerup", "pointercancel", "lostpointercapture"]) {
            control.addEventListener(tipo, () => {
                if (!arrastre || arrastre.control !== control) return;
                arrastre = null;
                guardarPosiciones();
            });
        }
    }

    function ajustarResolucionMovil() {
        if (!esTactil.matches) return;
        const escala = Math.min(window.devicePixelRatio || 1, 1.25);
        const anchoLogico = 900;
        const altoLogico = 500;
        const ancho = Math.round(anchoLogico * escala);
        const alto = Math.round(altoLogico * escala);
        if (canvas.width === ancho && canvas.height === alto) return;
        canvas.width = ancho;
        canvas.height = alto;
        contexto.setTransform(escala, 0, 0, escala, 0, 0);
        contexto.imageSmoothingEnabled = false;
    }

    aplicarPosiciones();
    ajustarResolucionMovil();
    window.addEventListener("resize", ajustarResolucionMovil, { passive: true });
    esTactil.addEventListener?.("change", ajustarResolucionMovil);
})();
