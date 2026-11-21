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
    const CLAVE_SESION = "aventuraPixelSesionMovilV1";
    const CLAVE_CALIDAD = "aventuraPixelCalidadMovilV1";
    const CLAVE_TEXTO = "aventuraPixelTextoMovilV1";
    const selectorDiseno = document.getElementById("diseno-controles");
    const selectorCalidad = document.getElementById("calidad-grafica");
    const selectorTexto = document.getElementById("tamano-texto-movil");
    const esTactil = window.matchMedia("(pointer: coarse)");

    if (!contenedor || !zonaControles || !botonAjustar || !barraAjuste || !canvas || !contexto) return;

    let posiciones = cargarPosiciones();
    let presetControles = "personalizado";
    let estabaJugandoAlAjustar = false;
    let arrastre = null;

    function cargarPosiciones() {
        try {
            const guardadas = JSON.parse(localStorage.getItem(CLAVE_POSICIONES) || "null");
            if (!guardadas || guardadas.version !== 1 || !guardadas.posiciones) return null;
            presetControles = guardadas.preset || "personalizado";
            if (selectorDiseno) selectorDiseno.value = presetControles;
            return guardadas.posiciones;
        } catch (error) {
            return null;
        }
    }

    function guardarPosiciones() {
        try {
            localStorage.setItem(CLAVE_POSICIONES, JSON.stringify({
                version: 1,
                preset: presetControles,
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

    function aplicarDiseno(nombre) {
        const y = nombre === "compacto" ? 0.83 : 0.75;
        const disenos = {
            diestro: {
                izquierda: [0.02, y], derecha: [0.16, y], abajo: [0.30, y],
                disparar: [0.62, y], saltar: [0.81, y]
            },
            zurdo: {
                izquierda: [0.82, y], derecha: [0.68, y], abajo: [0.54, y],
                disparar: [0.04, y], saltar: [0.23, y]
            },
            compacto: {
                izquierda: [0.02, 0.82], derecha: [0.14, 0.82], abajo: [0.27, 0.82],
                disparar: [0.64, 0.82], saltar: [0.82, 0.82]
            }
        };
        const diseno = disenos[nombre];
        if (!diseno) return;
        presetControles = nombre;
        posiciones = {};
        document.body.classList.add("controles-personalizados");
        for (const control of controles) {
            const [x, yPos] = diseno[control.dataset.tactil];
            colocar(control, { x, y: yPos });
        }
        if (selectorDiseno) selectorDiseno.value = nombre;
        guardarPosiciones();
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
                const x = (caja.left - marco.left) / Math.max(1, marco.width);
                const y = (caja.top - marco.top) / Math.max(1, marco.height);
                posiciones[control.dataset.tactil] = limitarPosicion(control, x, y);
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
        presetControles = "diestro";
        if (selectorDiseno) selectorDiseno.value = "diestro";
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

    function enviarTecla(tecla) {
        window.dispatchEvent(new KeyboardEvent("keydown", {
            key: tecla,
            bubbles: true,
            cancelable: true
        }));
    }

    for (const boton of document.querySelectorAll("[data-final]")) {
        boton.addEventListener("click", () => {
            if (!document.body.classList.contains("partida-derrota")) return;
            if (boton.dataset.final === "reiniciar") {
                enviarTecla("Enter");
                return;
            }
            let teclaMapa = "m";
            try {
                const opciones = JSON.parse(localStorage.getItem("aventuraPixelOpcionesV1") || "null");
                teclaMapa = opciones?.bindings?.mapa || teclaMapa;
            } catch (error) {
                // M es la tecla predeterminada para volver al mapa.
            }
            enviarTecla(teclaMapa);
        });
    }

    if (selectorDiseno) {
        selectorDiseno.addEventListener("change", () => {
            if (selectorDiseno.value === "personalizado") return;
            aplicarDiseno(selectorDiseno.value);
        });
    }

    if (selectorCalidad) {
        try {
            selectorCalidad.value = localStorage.getItem(CLAVE_CALIDAD) || "auto";
        } catch (error) { selectorCalidad.value = "auto"; }
        selectorCalidad.addEventListener("change", () => {
            try { localStorage.setItem(CLAVE_CALIDAD, selectorCalidad.value); } catch (error) { /* ajuste de sesión */ }
            ajustarResolucionMovil();
        });
    }

    if (selectorTexto) {
        try {
            selectorTexto.value = localStorage.getItem(CLAVE_TEXTO) || "normal";
        } catch (error) { selectorTexto.value = "normal"; }
        const aplicarTexto = () => {
            const tamano = selectorTexto.value || "normal";
            document.body.dataset.tamanoTexto = tamano;
            try { localStorage.setItem(CLAVE_TEXTO, tamano); } catch (error) { /* ajuste de sesión */ }
        };
        selectorTexto.addEventListener("change", aplicarTexto);
        aplicarTexto();
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
            presetControles = "personalizado";
            if (selectorDiseno) selectorDiseno.value = "personalizado";
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
        const calidad = selectorCalidad?.value || "auto";
        const limites = { auto: 1.25, ahorro: 1, equilibrada: 1.25, alta: 1.5 };
        const escala = Math.min(window.devicePixelRatio || 1, limites[calidad] || 1.25);
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

    let temporizadorMensaje;
    const hudNodos = [...document.querySelectorAll("[data-hud]")];
    const tutorialPanel = document.querySelector(".tutorial-movil");
    const mensajeMovil = document.querySelector(".mensaje-movil");

    window.addEventListener("aventura:hud-movil", (evento) => {
        const dato = evento.detail;
        const valores = [
            dato.tutorial ? "TUTORIAL" : "NIV " + dato.nivel + "/" + dato.totalNiveles,
            "PTS " + dato.puntos,
            "MON " + dato.monedas + "/" + dato.totalMonedas,
            "DIAM " + dato.diamantes + "/3",
            dato.llave ? "LLAVE SÍ" : "LLAVE NO",
            "VIDAS " + dato.vidas + "/" + dato.maxVidas
        ];
        hudNodos.forEach((nodo, indice) => {
            if (nodo.textContent !== valores[indice]) nodo.textContent = valores[indice];
        });
    });

    window.addEventListener("aventura:tutorial-movil", (evento) => {
        const dato = evento.detail;
        document.body.classList.toggle("hay-tutorial-movil", Boolean(dato.visible));
        tutorialPanel.setAttribute("aria-hidden", dato.visible ? "false" : "true");
        if (!dato.visible) return;
        tutorialPanel.querySelector('[data-tutorial="titulo"]').textContent = dato.titulo;
        tutorialPanel.querySelector('[data-tutorial="progreso"]').textContent = dato.progreso;
        tutorialPanel.querySelector('[data-tutorial="texto"]').textContent = dato.texto;
    });

    window.addEventListener("aventura:mensaje-movil", (evento) => {
        if (!mensajeMovil) return;
        mensajeMovil.textContent = evento.detail.texto;
        mensajeMovil.hidden = false;
        document.body.classList.add("hay-mensaje-movil");
        window.clearTimeout(temporizadorMensaje);
        temporizadorMensaje = window.setTimeout(() => {
            mensajeMovil.hidden = true;
            document.body.classList.remove("hay-mensaje-movil");
        }, Math.max(500, evento.detail.duracion * 1000 / 60));
    });

    const panelReanudar = document.querySelector(".reanudar-movil");
    const textoReanudar = panelReanudar?.querySelector('[data-reanudar="texto"]');
    const botonReanudar = panelReanudar?.querySelector('[data-reanudar="continuar"]');
    const botonDescartar = panelReanudar?.querySelector('[data-reanudar="descartar"]');
    let sesionPendiente = null;
    try {
        sesionPendiente = JSON.parse(localStorage.getItem(CLAVE_SESION) || "null");
    } catch (error) {
        sesionPendiente = null;
    }
    if (panelReanudar && sesionPendiente && Number.isInteger(sesionPendiente.nivel)) {
        textoReanudar.textContent = "Nivel " + sesionPendiente.nivel + ". Se retomará desde el inicio de ese nivel.";
        panelReanudar.hidden = false;
        document.body.classList.add("hay-reanudar-movil");
    }
    botonReanudar?.addEventListener("click", () => {
        if (!sesionPendiente) return;
        localStorage.removeItem(CLAVE_SESION);
        panelReanudar.hidden = true;
        window.dispatchEvent(new CustomEvent("aventura:retomar-movil", {
            detail: { nivel: sesionPendiente.nivel }
        }));
    });
    botonDescartar?.addEventListener("click", () => {
        localStorage.removeItem(CLAVE_SESION);
        panelReanudar.hidden = true;
        document.body.classList.remove("hay-reanudar-movil");
    });

    aplicarPosiciones();
    ajustarResolucionMovil();
    window.addEventListener("resize", () => {
        ajustarResolucionMovil();
        aplicarPosiciones();
    }, { passive: true });
    esTactil.addEventListener?.("change", ajustarResolucionMovil);
})();
