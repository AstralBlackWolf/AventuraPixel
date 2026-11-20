(function (root) {
    "use strict";

    const ecosistemas = [
        { nombre: "SELVA TROPICAL", tipo: "terrestre", ayuda: "Cruza la selva y salta las lianas espinosas y la flora peligrosa.", mecanicas: { plantas: 2, trampolines: 1 } },
        { nombre: "TAIGA Y TUNDRA", tipo: "terrestre", ayuda: "El suelo helado resbala y las crestas de hielo dañan: frena con tiempo.", mecanicas: { hielo: true, trampolines: 0 } },
        { nombre: "SABANA Y PRADERA", tipo: "terrestre", ayuda: "Esquiva la maleza espinosa y la flora peligrosa.", mecanicas: { plantas: 2, trampolines: 0 } },
        { nombre: "DESIERTO", tipo: "terrestre", ayuda: "Salta las rocas de arenisca y las plataformas frágiles.", mecanicas: { caen: 3, plantas: 1 } },
        { nombre: "HUMEDAL", tipo: "mixto", ayuda: "Avanza entre juncos, agua y tocones ocultos del humedal.", mecanicas: { plantas: 3, trampolines: 1 } },
        { nombre: "RÍO DE AGUA DULCE", tipo: "acuático", ayuda: "Salta entre las orillas y las piedras resbaladizas de la corriente.", mecanicas: { trampolines: 0, caen: 2 } },
        { nombre: "COSTA ROCOSA", tipo: "mixto", ayuda: "Esquiva las rocas con percebes y las plataformas que ceden junto al mar.", mecanicas: { caen: 3, plantas: 2 } },
        { nombre: "ARRECIFE MARINO", tipo: "acuático", ayuda: "Evita el coral afilado y las criaturas del arrecife.", mecanicas: { trampolines: 0, plantas: 2 } },
        { nombre: "MANGLAR", tipo: "mixto", ayuda: "Salta entre raíces aéreas y canales sin perder el equilibrio.", mecanicas: { plantas: 3, caen: 4, trampolines: 1 } },
        { nombre: "OCÉANO PROFUNDO", tipo: "acuático", ayuda: "Esquiva las chimeneas hidrotermales y derrota al guardián de las profundidades.", mecanicas: { plantas: 2, trampolines: 0 } }
    ].map(ecosistema => Object.freeze({ ...ecosistema, mecanicas: Object.freeze(ecosistema.mecanicas) }));

    const nombresEtapa = ["BORDE", "SENDERO", "CORAZÓN", "FRONTERA", "DESAFÍO FINAL"];
    const ayudasEtapa = [
        "Explora una nueva zona del ecosistema.",
        "Busca una ruta segura entre los obstáculos.",
        "Las plataformas y los enemigos cambian de lugar.",
        "Combina saltos, trampas y objetos para avanzar.",
        "Supera el último desafío antes de cambiar de ecosistema."
    ];

    const niveles = ecosistemas.flatMap((ecosistema, indice) =>
        Array.from({ length: 5 }, (_, etapaIndice) => {
            const etapa = etapaIndice + 1;
            const base = ecosistema.mecanicas;
            const mecanicas = {
                ...base,
                plantas: (base.plantas || 0) + (etapa === 3 ? 1 : etapa === 5 ? 2 : 0),
                trampolines: (base.trampolines || 0) + (base.trampolines && (etapa === 2 || etapa === 4) ? 1 : 0),
                // Escudos: ninguno en la primera etapa de cada ecosistema, uno en las
                // etapas 2 y 3, y dos en las etapas 4 y 5 (la ayuda crece con el reto).
                escudos: etapa === 1 ? 0 : etapa <= 3 ? 1 : 2,
                caen: (base.caen || 0) + (etapa >= 4 ? 1 : 0)
            };
            return Object.freeze({
                nombre: ecosistema.nombre,
                tipoEcosistema: ecosistema.tipo,
                ecosistema: indice + 1,
                etapa,
                titulo: nombresEtapa[etapaIndice],
                ayuda: etapa === 1 ? ecosistema.ayuda : ayudasEtapa[etapaIndice],
                mecanicas: Object.freeze(mecanicas)
            });
        })
    );

    const DEFAULT_BINDINGS = Object.freeze({
        izquierda: "arrowleft",
        derecha: "arrowright",
        saltar: " ",
        disparar: "f",
        pausa: "p",
        mapa: "m",
        reiniciar: "r",
        sonido: "n"
    });

    const aliases = Object.freeze({
        izquierda: ["a"],
        derecha: ["d"],
        saltar: ["w", "arrowup"],
        mapa: ["escape"]
    });

    const dificultades = Object.freeze({
        facil: Object.freeze({ vidas: 5, velocidadEnemigos: 0.82, intervaloJefe: 1.35, velocidadJefe: 0.85, velocidadProyectiles: 0.85, vidaJefe: 8 }),
        normal: Object.freeze({ vidas: 3, velocidadEnemigos: 1, intervaloJefe: 1, velocidadJefe: 1, velocidadProyectiles: 1, vidaJefe: 10 }),
        dificil: Object.freeze({ vidas: 2, velocidadEnemigos: 1.16, intervaloJefe: 0.82, velocidadJefe: 1.12, velocidadProyectiles: 1.08, vidaJefe: 12 })
    });

    const defaultSettings = Object.freeze({
        dificultad: "normal",
        velocidad: 100,
        reducirMovimiento: false,
        altoContraste: false,
        silencio: false,
        volumen: 70,
        bindings: DEFAULT_BINDINGS
    });

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function normalizeKey(key) {
        if (typeof key !== "string") return null;
        const value = key.toLowerCase();
        if ([" ", "space", "spacebar"].includes(value)) return " ";
        if (["arrowleft", "arrowright", "arrowup", "arrowdown", "escape"].includes(value)) return value;
        return /^[a-z0-9]$/.test(value) ? value : null;
    }

    function normalizeSettings(input, prefersReducedMotion = false) {
        const value = input && typeof input === "object" ? input : {};
        const rawBindings = value.bindings && typeof value.bindings === "object" ? value.bindings : {};
        const bindings = { ...DEFAULT_BINDINGS };
        const used = new Set(Object.values(DEFAULT_BINDINGS));

        for (const action of Object.keys(DEFAULT_BINDINGS)) {
            if (!(action in rawBindings)) continue;
            const candidate = normalizeKey(rawBindings[action]);
            if (!candidate || (used.has(candidate) && candidate !== DEFAULT_BINDINGS[action])) continue;
            used.delete(bindings[action]);
            bindings[action] = candidate;
            used.add(candidate);
        }

        return {
            dificultad: Object.hasOwn(dificultades, value.dificultad) ? value.dificultad : defaultSettings.dificultad,
            velocidad: clamp(Number.isFinite(value.velocidad) ? value.velocidad : 100, 75, 125),
            reducirMovimiento: typeof value.reducirMovimiento === "boolean" ? value.reducirMovimiento : prefersReducedMotion,
            altoContraste: value.altoContraste === true,
            silencio: value.silencio === true,
            volumen: clamp(Number.isFinite(value.volumen) ? value.volumen : 70, 0, 100),
            bindings
        };
    }

    function assignBinding(settings, action, key) {
        const normalized = normalizeSettings(settings);
        const candidate = normalizeKey(key);
        if (!candidate || !(action in DEFAULT_BINDINGS)) return normalized;

        const otherAction = Object.keys(normalized.bindings).find(name => normalized.bindings[name] === candidate);
        if (otherAction && otherAction !== action) {
            normalized.bindings[otherAction] = normalized.bindings[action];
        }
        normalized.bindings[action] = candidate;
        return normalized;
    }

    function actionForKey(key, bindings = DEFAULT_BINDINGS) {
        const normalized = normalizeKey(key);
        if (!normalized) return null;
        for (const [action, boundKey] of Object.entries(bindings)) {
            if (boundKey === normalized) return action;
        }
        for (const [action, keys] of Object.entries(aliases)) {
            if (keys.includes(normalized)) return action;
        }
        return null;
    }

    function sanitizeProgress(input, totalLevels = niveles.length) {
        const value = input && typeof input === "object" ? input : {};
        const unlocked = Number.isFinite(value.nivelesDesbloqueados) ? Math.trunc(value.nivelesDesbloqueados) : 1;
        const score = Number.isFinite(value.puntuacion) ? Math.trunc(value.puntuacion) : 0;
        return {
            nivelesDesbloqueados: clamp(unlocked, 1, totalLevels),
            puntuacion: Math.max(0, score)
        };
    }

    function canCompleteLevel({ diamantes = 0, tieneLlave = false, jefeVivo = false }) {
        return diamantes >= 3 && tieneLlave === true && jefeVivo === false;
    }

    const api = Object.freeze({
        ecosistemas: Object.freeze(ecosistemas),
        niveles: Object.freeze(niveles),
        DEFAULT_BINDINGS,
        defaultSettings,
        dificultades,
        clamp,
        normalizeKey,
        normalizeSettings,
        assignBinding,
        actionForKey,
        sanitizeProgress,
        canCompleteLevel
    });

    if (typeof module !== "undefined" && module.exports) module.exports = api;
    if (root) root.AventuraCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this);