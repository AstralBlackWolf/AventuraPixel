/* Efectos Web Audio aislados para facilitar su mantenimiento y prueba. */
(function (root) {
    "use strict";

    const SONIDOS = Object.freeze({
        salto:    { f: 320, f2: 640,  d: 0.12, t: "square",   v: 0.04 },
        moneda:   { f: 880, f2: 1400, d: 0.10, t: "square",   v: 0.04 },
        diamante: { f: 660, f2: 1500, d: 0.28, t: "triangle", v: 0.07 },
        vida:     { f: 500, f2: 1000, d: 0.25, t: "triangle", v: 0.07 },
        llave:    { f: 700, f2: 1800, d: 0.30, t: "triangle", v: 0.07 },
        disparo:  { f: 900, f2: 300,  d: 0.08, t: "square",   v: 0.03 },
        enemigo:  { f: 420, f2: 90,   d: 0.15, t: "square",   v: 0.05 },
        dano:     { f: 220, f2: 50,   d: 0.28, t: "sawtooth", v: 0.06 },
        victoria: { f: 440, f2: 1760, d: 0.60, t: "triangle", v: 0.08 },
        derrota:  { f: 300, f2: 40,   d: 0.70, t: "sawtooth", v: 0.06 },
        resorte:  { f: 200, f2: 1000, d: 0.22, t: "sine",     v: 0.08 },
        checkpoint:{ f: 520, f2: 1320, d: 0.30, t: "triangle", v: 0.06 },
        secreto:  { f: 740, f2: 1760, d: 0.38, t: "sine",     v: 0.07 },
        estrella: { f: 620, f2: 1560, d: 0.34, t: "triangle", v: 0.06 },
        planta:   { f: 180, f2: 70,   d: 0.14, t: "sawtooth", v: 0.05 },
        trueno:   { f: 90,  f2: 35,   d: 0.90, t: "sawtooth", v: 0.07 }
    });

    // Loops breves y discretos: cada bioma tiene su propia escala y timbre.
    const PISTAS = Object.freeze([
        { notas: [196, 247, 294, 247, 220, 294, 330, 294], tipo: "triangle", pulso: 0.045, paso: 390 },
        { notas: [147, 196, 220, 196, 165, 220, 247, 220], tipo: "sine", pulso: 0.05, paso: 460 },
        { notas: [165, 220, 247, 220, 196, 247, 294, 247], tipo: "triangle", pulso: 0.045, paso: 420 },
        { notas: [110, 147, 165, 147, 123, 165, 185, 165], tipo: "sine", pulso: 0.05, paso: 480 },
        { notas: [174, 220, 262, 220, 196, 262, 294, 262], tipo: "triangle", pulso: 0.04, paso: 430 },
        { notas: [196, 247, 294, 330, 294, 247, 220, 247], tipo: "sine", pulso: 0.045, paso: 400 },
        { notas: [165, 208, 247, 208, 185, 247, 277, 247], tipo: "triangle", pulso: 0.04, paso: 440 },
        { notas: [220, 277, 330, 277, 247, 330, 370, 330], tipo: "sine", pulso: 0.04, paso: 390 },
        { notas: [147, 185, 220, 185, 165, 220, 247, 220], tipo: "triangle", pulso: 0.04, paso: 450 },
        { notas: [110, 165, 220, 247, 220, 165, 147, 165], tipo: "sine", pulso: 0.05, paso: 500 }
    ]);

    // Evita depender del navegador en las pruebas: se puede inyectar un contexto.
    function crearAudio(contextFactory = null) {
        let audioCtx = null;
        let temporizadorMusica = null;
        let busMusica = null;
        let pasoMusica = 0;
        let pistaActual = 0;

        function obtenerContexto() {
            if (audioCtx) return audioCtx;
            try {
                if (contextFactory) audioCtx = contextFactory();
                else {
                    const AudioContextDisponible = root.AudioContext || root.webkitAudioContext;
                    if (AudioContextDisponible) audioCtx = new AudioContextDisponible();
                }
            } catch (error) {
                audioCtx = null;
            }
            return audioCtx;
        }

        function reproducir(nombre, { silenciado = false, volumen = 100 } = {}) {
            if (silenciado || volumen <= 0) return false;
            const sonido = SONIDOS[nombre];
            if (!sonido) return false;

            try {
                if (!obtenerContexto()) return false;
                if (audioCtx.state === "suspended") Promise.resolve(audioCtx.resume()).catch(() => {});

                const ahora = audioCtx.currentTime;
                const oscilador = audioCtx.createOscillator();
                const ganancia = audioCtx.createGain();
                oscilador.type = sonido.t;
                oscilador.frequency.setValueAtTime(sonido.f, ahora);
                oscilador.frequency.exponentialRampToValueAtTime(sonido.f2, ahora + sonido.d);
                ganancia.gain.setValueAtTime(sonido.v * volumen / 100, ahora);
                ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + sonido.d);
                oscilador.connect(ganancia);
                ganancia.connect(audioCtx.destination);
                oscilador.start(ahora);
                oscilador.stop(ahora + sonido.d + 0.02);
                return true;
            } catch (error) {
                // El audio es opcional; una API bloqueada no debe detener el juego.
                return false;
            }
        }

        function detenerMusica() {
            if (temporizadorMusica !== null) clearInterval(temporizadorMusica);
            temporizadorMusica = null;
            pistaActual = 0;
            if (busMusica && audioCtx) {
                try {
                    busMusica.gain.setTargetAtTime(0, audioCtx.currentTime, 0.12);
                    const busAnterior = busMusica;
                    setTimeout(() => {
                        try { busAnterior.disconnect(); } catch (error) { /* ya desconectado */ }
                    }, 450);
                } catch (error) { /* el audio ambiental es opcional */ }
            }
            busMusica = null;
        }

        function establecerMusica(ecosistema, { silenciado = false, volumen = 70 } = {}) {
            if (!Number.isInteger(ecosistema) || ecosistema < 1 || ecosistema > PISTAS.length || silenciado || volumen <= 0) {
                detenerMusica();
                return false;
            }
            const contexto = obtenerContexto();
            if (!contexto) return false;
            try {
                if (contexto.state === "suspended") Promise.resolve(contexto.resume()).catch(() => {});
                if (pistaActual === ecosistema && temporizadorMusica !== null && busMusica) {
                    busMusica.gain.setTargetAtTime(0.12 * volumen / 100, contexto.currentTime, 0.15);
                    return true;
                }
                detenerMusica();
                pistaActual = ecosistema;
                pasoMusica = 0;
                busMusica = contexto.createGain();
                busMusica.gain.setValueAtTime(0, contexto.currentTime);
                busMusica.gain.setTargetAtTime(0.12 * volumen / 100, contexto.currentTime, 0.3);
                busMusica.connect(contexto.destination);

                const pista = PISTAS[ecosistema - 1];
                const tocarNota = () => {
                    if (!busMusica || pistaActual !== ecosistema) return;
                    const ahora = contexto.currentTime;
                    const tono = contexto.createOscillator();
                    const ganancia = contexto.createGain();
                    const frecuencia = pista.notas[pasoMusica % pista.notas.length];
                    tono.type = pista.tipo;
                    tono.frequency.setValueAtTime(frecuencia, ahora);
                    ganancia.gain.setValueAtTime(0.0001, ahora);
                    ganancia.gain.exponentialRampToValueAtTime(pista.pulso, ahora + 0.045);
                    ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + pista.paso / 1000 * 0.86);
                    tono.connect(ganancia);
                    ganancia.connect(busMusica);
                    tono.start(ahora);
                    tono.stop(ahora + pista.paso / 1000);
                    pasoMusica++;
                };
                tocarNota();
                temporizadorMusica = setInterval(tocarNota, pista.paso);
                return true;
            } catch (error) {
                detenerMusica();
                return false;
            }
        }

        return Object.freeze({ reproducir, establecerMusica, detenerMusica });
    }

    const api = Object.freeze({ crearAudio });
    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (root) root.AventuraAudio = api;
})(typeof globalThis !== "undefined" ? globalThis : this);