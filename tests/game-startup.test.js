"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const core = require("../game-core.js");
const audio = require("../game-audio.js");

function crearElemento(id, dataset = {}) {
    const listeners = {};
    return {
        id,
        dataset,
        width: 900,
        height: 500,
        value: "",
        checked: false,
        textContent: "",
        classList: { toggle() {} },
        addEventListener(tipo, callback) { listeners[tipo] = callback; },
        setAttribute() {},
        setPointerCapture() {},
        getBoundingClientRect() { return { left: 0, top: 0, width: 900, height: 500 }; },
        getContext() { return crearContexto(); },
        listeners
    };
}

function crearContexto() {
    return new Proxy({
        createLinearGradient() { return { addColorStop() {} }; },
        measureText() { return { width: 0 }; }
    }, {
        get(target, key) {
            if (key in target) return target[key];
            return () => {};
        },
        set(target, key, value) {
            target[key] = value;
            return true;
        }
    });
}

test("el juego carga los módulos, construye el mapa y dibuja un fotograma", () => {
    const ids = [
        "juego", "boton-sonido", "volumen-sonido", "dificultad", "velocidad-juego",
        "valor-velocidad", "reducir-movimiento", "alto-contraste", "estado-ajustes"
    ];
    const elementos = new Map(ids.map(id => [id, crearElemento(id)]));
    const botonesReasignar = ["izquierda", "derecha", "saltar", "disparar", "pausa", "mapa", "reiniciar", "sonido"]
        .map(action => crearElemento("", { reasignar: action }));
    const botonesTactiles = ["izquierda", "derecha", "saltar", "disparar", "pausa", "mapa"]
        .map(action => crearElemento("", { accion: action }));
    const handlersVentana = {};
    const windowMock = {
        AventuraCore: core,
        AventuraAudio: audio,
        matchMedia() { return { matches: false }; },
        addEventListener(tipo, callback) { handlersVentana[tipo] = callback; }
    };
    const documentMock = {
        body: crearElemento("body"),
        getElementById(id) { return elementos.get(id) || null; },
        querySelectorAll(selector) {
            return selector === "[data-reasignar]" ? botonesReasignar : botonesTactiles;
        }
    };
    const almacenamiento = new Map();
    let siguienteFotograma = null;
    const contexto = vm.createContext({
        window: windowMock,
        document: documentMock,
        localStorage: {
            getItem(key) { return almacenamiento.get(key) || null; },
            setItem(key, value) { almacenamiento.set(key, value); },
            removeItem(key) { almacenamiento.delete(key); }
        },
        requestAnimationFrame(callback) { siguienteFotograma = callback; },
        console,
        Math,
        JSON,
        Number,
        Object,
        Set
    });

    const sourcePath = path.join(__dirname, "..", "game.js");
    const marker = "    // Recuperar progreso y abrir el mapa en el último nivel desbloqueado.";
    const original = fs.readFileSync(sourcePath, "utf8");
    assert.ok(original.includes(marker));
    const source = original.replace(marker, [
        "    window.__testGame = {",
        "        cargarNivel, jugador, get plataformas() { return plataformas; },",
        "        get enemigos() { return enemigos; }, get jefe() { return jefe; },",
        "        get longitudNivel() { return longitudNivel; }",
        "    };",
        marker
    ].join("\n"));
    vm.runInContext(source, contexto, { filename: "game.js" });
    assert.equal(typeof siguienteFotograma, "function");
    assert.equal(typeof handlersVentana.keydown, "function");
    assert.equal(almacenamiento.has("aventuraPixelOpcionesV1"), false);

    assert.doesNotThrow(() => siguienteFotograma(17));
    assert.equal(typeof siguienteFotograma, "function");

    for (let nivel = 1; nivel <= core.niveles.length; nivel++) {
        contexto.window.__testGame.cargarNivel(nivel);
        assert.ok(contexto.window.__testGame.plataformas.length > 0, `nivel ${nivel} tiene plataformas`);
        assert.ok(contexto.window.__testGame.enemigos.length > 0, `nivel ${nivel} tiene enemigos`);
        for (const plataforma of contexto.window.__testGame.plataformas) {
            assert.ok(Number.isFinite(plataforma.x) && Number.isFinite(plataforma.y));
            assert.ok(plataforma.ancho > 0);
        }
    }

    contexto.window.__testGame.cargarNivel(10);
    const inicioArena = contexto.window.__testGame.longitudNivel - 640;
    const plataformasJefe = contexto.window.__testGame.plataformas.filter(
        plataforma => plataforma.tipo === "plataforma" && plataforma.x >= inicioArena
    );
    assert.equal(plataformasJefe.length, 3, "la arena del jefe ofrece tres plataformas de evasión");
    assert.equal(contexto.window.__testGame.jefe.vida, contexto.window.__testGame.jefe.vidaMaxima);
});
