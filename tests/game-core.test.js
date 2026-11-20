"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../game-core.js");

test("el progreso guardado se limita a niveles válidos y puntos no negativos", () => {
    assert.deepEqual(core.sanitizeProgress({ nivelesDesbloqueados: 500, puntuacion: -3 }), {
        nivelesDesbloqueados: 10,
        puntuacion: 0
    });
    assert.deepEqual(core.sanitizeProgress({ nivelesDesbloqueados: 4.8, puntuacion: 120.9 }), {
        nivelesDesbloqueados: 4,
        puntuacion: 120
    });
    assert.deepEqual(core.sanitizeProgress(null), { nivelesDesbloqueados: 1, puntuacion: 0 });
});

test("un nivel requiere tres diamantes, llave y jefe derrotado", () => {
    assert.equal(core.canCompleteLevel({ diamantes: 3, tieneLlave: true, jefeVivo: false }), true);
    assert.equal(core.canCompleteLevel({ diamantes: 2, tieneLlave: true, jefeVivo: false }), false);
    assert.equal(core.canCompleteLevel({ diamantes: 3, tieneLlave: false, jefeVivo: false }), false);
    assert.equal(core.canCompleteLevel({ diamantes: 3, tieneLlave: true, jefeVivo: true }), false);
});

test("la configuración descarta datos inválidos y respeta el movimiento reducido del sistema", () => {
    const settings = core.normalizeSettings({ velocidad: 900, volumen: -20, dificultad: "imposible" }, true);
    assert.equal(settings.velocidad, 125);
    assert.equal(settings.volumen, 0);
    assert.equal(settings.dificultad, "normal");
    assert.equal(settings.reducirMovimiento, true);
});

test("las teclas se pueden reasignar sin duplicar acciones y conservan alias clásicos", () => {
    const settings = core.assignBinding(core.defaultSettings, "izquierda", "j");
    assert.equal(settings.bindings.izquierda, "j");
    assert.equal(settings.bindings.derecha, "arrowright");
    assert.equal(core.actionForKey("j", settings.bindings), "izquierda");
    assert.equal(core.actionForKey("a", settings.bindings), "izquierda");

    const swapped = core.assignBinding(settings, "izquierda", "arrowright");
    assert.equal(swapped.bindings.izquierda, "arrowright");
    assert.equal(swapped.bindings.derecha, "j");
});

test("cada dificultad define vidas y parámetros de desafío crecientes", () => {
    const easy = core.dificultades.facil;
    const normal = core.dificultades.normal;
    const hard = core.dificultades.dificil;
    assert.ok(easy.vidas > normal.vidas && normal.vidas > hard.vidas);
    assert.ok(easy.intervaloJefe > normal.intervaloJefe && normal.intervaloJefe > hard.intervaloJefe);
    assert.equal(core.niveles.length, 10);
});
