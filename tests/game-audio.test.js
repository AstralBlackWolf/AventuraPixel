"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { crearAudio } = require("../game-audio.js");

function contextoDeAudio() {
    const llamadas = { osciladores: 0, ganancias: 0, volumen: null };
    const context = {
        currentTime: 1,
        destination: {},
        createOscillator() {
            llamadas.osciladores++;
            return {
                frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
                connect() {}, start() {}, stop() {}
            };
        },
        createGain() {
            llamadas.ganancias++;
            return {
                gain: {
                    setValueAtTime(value) { llamadas.volumen = value; },
                    exponentialRampToValueAtTime() {}
                },
                connect() {}
            };
        }
    };
    return { context, llamadas };
}

test("el audio no crea contexto cuando está silenciado o el volumen es cero", () => {
    let creaciones = 0;
    const reproducir = crearAudio(() => { creaciones++; return contextoDeAudio().context; }).reproducir;
    assert.equal(reproducir("salto", { silenciado: true, volumen: 100 }), false);
    assert.equal(reproducir("salto", { volumen: 0 }), false);
    assert.equal(reproducir("desconocido", { volumen: 100 }), false);
    assert.equal(creaciones, 0);
});

test("los efectos respetan el porcentaje de volumen y reutilizan el contexto", () => {
    const { context, llamadas } = contextoDeAudio();
    let creaciones = 0;
    const audio = crearAudio(() => { creaciones++; return context; });
    assert.equal(audio.reproducir("salto", { volumen: 50 }), true);
    assert.equal(audio.reproducir("moneda", { volumen: 25 }), true);
    assert.equal(creaciones, 1);
    assert.equal(llamadas.osciladores, 2);
    assert.equal(llamadas.ganancias, 2);
    assert.equal(llamadas.volumen, 0.01);
});
