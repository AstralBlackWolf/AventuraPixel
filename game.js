Warning: truncated output (original token count: 81847)
Total output lines: 6663

(() => {
    "use strict";

    const CORE = window.AventuraCore;
    if (!CORE) {
        console.error("No se encontró game-core.js.");
        return;
    }

    const canvas = document.getElementById("juego");
    if (!canvas) {
        console.error('No se encontró el canvas con id="juego".');
        return;
    }

    const ctx = canvas.getContext("2d");

    const ANCHO = canvas.width;
    const ALTO = canvas.height;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(ANCHO * pixelRatio);
    canvas.height = Math.round(ALTO * pixelRatio);
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    // Mantiene nítidos los recursos rasterizados que se escalen dentro del canvas.
    ctx.imageSmoothingEnabled = false;
    const SUELO = 440;
    const GRAVEDAD = 0.65;
    const TOTAL_NIVELES = CORE.niveles.length;
    const NIVELES_POR_ECOSISTEMA = 5;
    const ECOSISTEMAS = CORE.ecosistemas;
    // Fauna propia de cada zona. Los sprites se dibujan con píxeles del canvas,
    // así que no dependen de imágenes externas ni de rutas adicionales.
    const ESPECIES_ENEMIGAS = {
        1: { suelo: [["jaguar", "mamifero", "#d79a35", "#54351f", "saltador"], ["tapir amazónico", "mamifero", "#65534a", "#e7ded0", "corredor"], ["ocelote", "mamifero", "#c68c45", "#493527", "acechador"], ["rana dardo", "anfibio", "#42b889", "#f4d54e", "saltador"]], aire: [["tucán", "ave", "#27364b", "#ffca4d", "volador"], ["guacamaya roja", "ave", "#d74735", "#f2cf42", "volador"], ["águila harpía", "ave", "#584b42", "#e6d3a2", "volador"], ["mariposa morpho", "insecto", "#287ec0", "#a9ecf4", "volador"]] },
        2: { suelo: [["lobo ártico", "mamifero", "#b9d4df", "#526d83", "corredor"], ["zorro ártico", "mamifero", "#e6edf0", "#c37a55", "saltador"], ["liebre ártica", "mamifero", "#e8edf0", "#9fb8c3", "saltador"], ["glotón", "mamifero", "#765f50", "#d0bd9e", "embestidor"]], aire: [["búho nival", "ave", "#dce9ed", "#e8a64b", "volador"], ["perdiz nival", "ave", "#d8ddd8", "#8b735a", "volador"], ["águila real", "ave", "#765239", "#e2bd69", "volador"], ["cuervo boreal", "ave", "#303b4e", "#aeb9c4", "volador"]] },
        3: { suelo: [["león", "mamifero", "#d59b3c", "#6b4724", "saltador"], ["hiena manchada", "mamifero", "#a89373", "#55483d", "corredor"], ["guepardo", "mamifero", "#d8a64a", "#624322", "acechador"], ["jabalí africano", "mamifero", "#78634b", "#d8b579", "embestidor"]], aire: [["buitre", "ave", "#55483d", "#c97845", "volador"], ["águila marcial", "ave", "#55483d", "#d9c7a6", "volador"], ["avestruz", "ave", "#6d5540", "#d2b78e", "volador"], ["secretario", "ave", "#ded3b7", "#bd6645", "volador"]] },
        4: { suelo: [["escorpión", "arácnido", "#bd6636", "#623528", "saltador"], ["fennec", "mamifero", "#d8a85b", "#f2dfb6", "corredor"], ["varano del desierto", "reptil", "#9c7651", "#d6bd79", "acechador"], ["jerbo", "mamifero", "#c9985d", "#f1dfbd", "saltador"]], aire: [["murciélago", "ave", "#59477d", "#bd9bdd", "volador"], ["halcón del desierto", "ave", "#88634b", "#e4c078", "volador"], ["buitre egipcio", "ave", "#e5d8c5", "#b66a49", "volador"], ["alondra del desierto", "ave", "#b29467", "#e7d6a6", "volador"]] },
        5: { suelo: [["caimán", "reptil", "#5f9660", "#315b45", "saltador"], ["capibara", "mamifero", "#9a7651", "#d4b68a", "corredor"], ["rana toro", "anfibio", "#66a76b", "#d0e07a", "saltador"], ["nutria gigante", "mamifero", "#79583d", "#d9b17c", "embestidor"]], aire: [["libélula", "insecto", "#51b9ad", "#b7f5df", "volador"], ["garza real", "ave", "#e3ddd0", "#d67854", "volador"], ["martín pescador", "ave", "#288eae", "#f2a546", "volador"], ["mariposa tigre", "insecto", "#e4a83f", "#3d342a", "volador"]] },
        6: { suelo: [["bagre", "pez", "#5b9da7", "#d4c16a", "corredor"], ["piraña", "pez", "#789b70", "#e7e7c5", "saltador"], ["nutria neotropical", "mamifero", "#76553e", "#d7b784", "acechador"], ["tortuga de río", "reptil", "#63866b", "#c4a568", "corredor"]], aire: [["martín pescador", "ave", "#288eae", "#f2a546", "volador"], ["nutria de río", "mamifero", "#76553e", "#d7b784", "volador"], ["garza azul", "ave", "#728da5", "#e6d8bd", "volador"], ["golondrina ribereña", "ave", "#574e48", "#d8b479", "volador"]] },
        7: { suelo: [["cangrejo", "cangrejo", "#e36b4f", "#ffd071", "saltador"], ["lobo marino", "mamifero", "#70645a", "#d0b99a", "corredor"], ["pulpo de roca", "molusco", "#b85c58", "#efc38b", "ondulante"], ["iguana marina", "reptil", "#586e5d", "#c4ae71", "acechador"]], aire: [["gaviota", "ave", "#e4e6df", "#e7a94c", "volador"], ["pelícano", "ave", "#d5d8d4", "#edaa53", "volador"], ["albatros", "ave", "#e8e5dc", "#657b8b", "volador"], ["ostrero", "ave", "#383c42", "#e06a4e", "volador"]] },
        8: { suelo: [["pez león", "pez", "#ee8c45", "#f7d890", "corredor"], ["morena", "pez", "#49866d", "#d6be73", "saltador"], ["pez loro", "pez", "#50a58a", "#e99e68", "ondulante"], ["pulpo de arrecife", "molusco", "#a85769", "#efbc9a", "acechador"]], aire: [["medusa", "medusa", "#aa78d5", "#f2b7ff", "volador"], ["mantarraya", "pez", "#506d91", "#c4d8e8", "volador"], ["tortuga carey", "reptil", "#71885e", "#d7c279", "volador"], ["pez mariposa", "pez", "#e5bb55", "#f5e6ad", "volador"]] },
        9: { suelo: [["cocodrilo", "reptil", "#668c4c", "#384f34", "saltador"], ["anaconda", "reptil", "#56804c", "#d5b954", "corredor"], ["jaguar del manglar", "mamifero", "#c99547", "#523a28", "acechador"], ["cangrejo violinista", "cangrejo", "#d87955", "#f0c279", "lateral"]], aire: [["garza", "ave", "#e1ddd0", "#d67854", "volador"], ["ibis escarlata", "ave", "#d84e43", "#f0bf56", "volador"], ["martín pescador amazónico", "ave", "#2989a1", "#e5a74c", "volador"], ["murciélago pescador", "mamifero", "#51445f", "#bd9bdd", "volador"]] },
        10: { suelo: [["tiburón", "pez", "#688db7", "#d8e5ef", "corredor"], ["calamar gigante", "pez", "#795a9d", "#e5a2c8", "saltador"], ["pez víbora", "pez", "#4c5f9d", "#a9f2d0", "acechador"], ["cangrejo yeti", "crustáceo", "#ddd7d1", "#ba6c55", "lateral"]], aire: [["pez linterna", "pez", "#5574bd", "#a9f2d0", "volador"], ["orca", "pez", "#26384e", "#e8f0f2", "volador"], ["medusa peine", "medusa", "#9b7dd0", "#80e9e1", "volador"], ["pulpo dumbo", "molusco", "#a77ab2", "#efbad6", "volador"]] }
    };
    // Perfil de movimiento y ataque por especie; las familias comparten solo
    // las reglas base, cada perfil añade una pauta distinta y telegráfica.
    const COMPORTAMIENTOS_ESPECIE = {
        "jaguar": "acechador", "tapir amazónico": "corredor", "tucán": "planeador", "guacamaya roja": "planeador",
        "ocelote": "acechador", "rana dardo": "saltador", "águila harpía": "picado", "mariposa morpho": "revoloteador",
        "lobo ártico": "acechador", "zorro ártico": "saltador", "búho nival": "picado", "perdiz nival": "planeador",
        "liebre ártica": "saltador", "glotón": "embestidor", "águila real": "picado", "cuervo boreal": "planeador",
        "león": "saltador", "hiena manchada": "embestidor", "buitre": "planeador", "águila marcial": "picado",
        "guepardo": "acechador", "jabalí africano": "embestidor", "avestruz": "corredor", "secretario": "picado",
        "escorpión": "embestidor", "fennec": "corredor", "murciélago": "revoloteador", "halcón del desierto": "picado",
        "varano del desierto": "acechador", "jerbo": "saltador", "buitre egipcio": "planeador", "alondra del desierto": "revoloteador",
        "caimán": "embestidor", "capibara": "corredor", "libélula": "revoloteador", "garza real": "picado",
        "rana toro": "saltador", "nutria gigante": "embestidor", "martín pescador": "picado", "mariposa tigre": "revoloteador",
        "bagre": "ondulante", "piraña": "embestidor", "martín pescador": "picado", "nutria de río": "ondulante",
        "nutria neotropical": "acechador", "tortuga de río": "ondulante", "garza azul": "picado", "golondrina ribereña": "revoloteador",
        "cangrejo": "lateral", "lobo marino": "embestidor", "gaviota": "planeador", "pelícano": "picado",
        "pulpo de roca": "ondulante", "iguana marina": "acechador", "albatros": "planeador", "ostrero": "picado",
        "pez león": "ondulante", "morena": "embestidor", "medusa": "flotante", "mantarraya": "planeador",
        "pez loro": "ondulante", "pulpo de arrecife": "acechador", "tortuga carey": "planeador", "pez mariposa": "revoloteador",
        "cocodrilo": "embestidor", "anaconda": "acechador", "garza": "picado", "ibis escarlata": "planeador",
        "jaguar del manglar": "acechador", "cangrejo violinista": "lateral", "martín pescador amazónico": "picado", "murciélago pescador": "revoloteador",
        "tiburón": "acechador", "calamar gigante": "embestidor", "pez linterna": "flotante", "orca": "acechador",
        "pez víbora": "acechador", "cangrejo yeti": "lateral", "medusa peine": "flotante", "pulpo dumbo": "planeador"
    };
    // Una amenaza biológica distinta por ecosistema. Coral y anémona son
    // animales sésiles; se incluyen como peligros del arrecife y el abismo.
    const PELIGROS_BIOLOGICOS = {
        1: { nombre: "atrapamoscas tropical", tipo: "atrapamoscas", tallo: "#2f8f4e", flor: "#d63a54" },
        2: { nombre: "rocío del sol boreal", tipo: "rocío", tallo: "#6f947c", flor: "#bb536f" },
        3: { nombre: "acacia espinosa", tipo: "acacia", tallo: "#96713d", flor: "#e7bf62" },
        4: { nombre: "cactus saguaro", tipo: "cactus", tallo: "#57945d", flor: "#f08a75" },
        5: { nombre: "vejiga de agua del humedal", tipo: "vejiga", tallo: "#368d68", flor: "#e0c65a" },
        6: { nombre: "nenúfar del río", tipo: "nenufar", tallo: "#378c73", flor: "#f18eb2" },
        7: { nombre: "cardo marino espinoso", tipo: "cardo", tallo: "#668b58", flor: "#9579b7" },
        8: { nombre: "coral de fuego", tipo: "coral", tallo: "#ee725d", flor: "#ffd58a" },
        9: { nombre: "raíz mordedora del manglar", tipo: "raiz", tallo: "#76523a", flor: "#d97755" },
        10: { nombre: "anémona abisal", tipo: "anemona", tallo: "#7560ad", flor: "#f29bc5" }
    };
    // Los peligros del suelo varían con la geología y el hábitat del mundo.
    // Comparten una zona de daño corta y visible para conservar la dificultad.
    const OBSTACULOS_SUELO = {
        1: { nombre: "lianas espinosas", tipo: "lianas", base: "#76503b", detalle: "#df9e43" },
        2: { nombre: "crestas de hielo", tipo: "hielo", base: "#8fd9ee", detalle: "#e5fbff" },
        3: { nombre: "maleza espinosa", tipo: "maleza", base: "#8a7149", detalle: "#ddbd70" },
        4: { nombre: "rocas de arenisca", tipo: "rocas", base: "#bc7548", detalle: "#e7b46a" },
        5: { nombre: "tocones del humedal", tipo: "tocones", base: "#72543e", detalle: "#b5935d" },
        6: { nombre: "piedras de río", tipo: "rio", base: "#718f91", detalle: "#b9dbd4" },
        7: { nombre: "rocas con percebes", tipo: "costa", base: "#68727a", detalle: "#c7c2a1" },
        8: { nombre: "coral afilado", tipo: "coral", base: "#e46e70", detalle: "#ffcf89" },
        9: { nombre: "raíces aéreas", tipo: "raices", base: "#76503b", detalle: "#c29458" },
        10: { nombre: "chimeneas hidrotermales", tipo: "ventila", base: "#566482", detalle: "#ff9b60" }
    };
    const ATAQUES_JEFE = [
        { nombre: "ZARPAZO EN ABANICO", color: "#a6df7a", movimiento: "salto", tiros: [[-2.2, -2.7], [0, -3.6], [2.2, -2.7]] },
        { nombre: "RÁFAGA HELADA", color: "#a9edff", movimiento: "patrulla", tiros: [[3.4, -1.8], [3.7, -0.7], [3.4, 0.4]] },
        { nombre: "ONDA DE LA SABANA", color: "#ffc45c", movimiento: "patrulla", tiros: [[3.2, -2.5], [4.1, 0.2]] },
        { nombre: "AGUIJÓN VENENOSO", color: "#c78cff", movimiento: "patrulla", tiros: [[4.8, -1.8], [3.8, -2.6]] },
        { nombre: "MORDISCO DE AGUA", color: "#67e6cf", movimiento: "salto", tiros: [[2.1, -3.1], [3, -2.3], [3.8, -1.2]] },
        { nombre: "BURBUJAS DE CORRIENTE", color: "#75eaff", movimiento: "patrulla", tiros: [[2, -3.5], [2.8, -2.6], [3.5, -1.6]] },
        { nombre: "PINZAS DE ROCAS", color: "#ff9870", movimiento: "patrulla", tiros: [[2.8, -2.4], [4, -1.2], [3, 0.2]] },
        { nombre: "LLUVIA DE ESPINAS", color: "#ff9ad2", movimiento: "patrulla", tiros: [[-3, -2.2], [-1.6, -3], [0, -3.6], [1.6, -3], [3, -2.2]] },
        { nombre: "EMBESTIDA DEL MANGLAR", color: "#9fe080", movimiento: "carga", tiros: [[3, -1.6], [3.6, -0.4]] },
        { nombre: "TORBELLINO ABISAL", color: "#8cbbff", movimiento: "carga", tiros: [[-3, -1.8], [-2, -2.8], [-1, -3.5], [1, -3.5], [2, -2.8], [3, -1.8]] }
    ];
    const LOGROS_JEFES = [
        "PROTECTOR SELVÁTICO", "DOMADOR DEL HIELO", "LEYENDA DE LA SABANA", "CONQUISTADOR DE DUNAS",
        "VIGÍA DEL HUMEDAL", "GUARDIÁN DEL RÍO", "SEÑOR DE LA COSTA", "DEFENSOR DEL ARRECIFE",
        "ALIADO DEL MANGLAR", "REY DE LAS PROFUNDIDADES"
    ];
    const LOGROS_AVARICIA = [
        "TESORO DE LA SELVA", "ORO ENTRE EL HIELO", "RIQUEZA DE LA SABANA", "BOTÍN DEL DESIERTO",
        "TESORO DEL HUMEDAL", "FORTUNA DEL RÍO", "BOTÍN COSTERO", "JOYAS DEL ARRECIFE",
        "TESORO DEL MANGLAR", "RIQUEZA ABISAL"
    ];
    const LOGROS_SIN_DANIO = [
        "PASO SILENCIOSO", "A PRUEBA DE HIELO", "SIN UN RASGUÑO", "INTOCABLE EN LAS DUNAS",
        "CRUCE IMPECABLE", "RUMBO PERFECTO", "COSTA SIN HERIDAS", "NADO PERFECTO",
        "ENTRE RAÍCES ILESO", "DOMINIO DE LAS PROFUNDIDADES"
    ];
    const LOGROS_CAZADOR = [
        "GUARDABOSQUES", "CAZADOR DE LA TAIGA", "DOMINIO DE LA SABANA", "CAZADOR DEL DESIERTO",
        "VIGILANTE DEL PANTANO", "SEÑOR DE LA CORRIENTE", "COSTA DESPEJADA", "CAZADOR DEL ARRECIFE",
        "RAÍCES DESPEJADAS", "CAZADOR ABISAL"
    ];
    const LOGROS_COMPLETAR_ECOSISTEMA = [
        "VIAJERO DE LA SELVA", "SUPERVIVIENTE DE LA TAIGA", "RUTA DE LA SABANA", "CRUCE DEL DESIERTO",
        "CORAZÓN DEL HUMEDAL", "RÍO CONQUISTADO", "COSTA EXPLORADA", "ARRECIFE CONQUISTADO",
        "GUARDIÁN DEL MANGLAR", "ABISMO SUPERADO"
    ];
    const LOGRO_TODOS_ECOSISTEMAS = "MAESTRO DE LOS ECOSISTEMAS";
    const LOGRO_TODOS_LOGROS = "COLECCIONISTA ABSOLUTO";
    const DIFICULTADES = ["facil", "normal", "dificil"];
    const LOGROS_DIFICULTAD = {
        facil: { titulo: "AVENTURERO RELAJADO", descripcion: "Completa los 50 niveles en dificultad Fácil." },
        normal: { titulo: "HÉROE DEL EQUILIBRIO", descripcion: "Completa los 50 niveles en dificultad Normal." },
        dificil: { titulo: "LEYENDA PIXEL", descripcion: "Completa los 50 niveles en dificultad Difícil." }
    };
    const NOMBRES = CORE.niveles.map(nivel => `${nivel.nombre} ${nivel.etapa}/5`);
    const MECANICAS = [null, ...CORE.niveles.map(nivel => nivel.mecanicas)];
    const AYUDAS = [null, ...CORE.niveles.map(nivel => nivel.ayuda)];

    const CLAVE_OPCIONES = "aventuraPixelOpcionesV1";
    let preferenciasSistemaReduceMovimiento = false;
    try {
        preferenciasSistemaReduceMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (error) {
        // matchMedia puede no estar disponible en navegadores antiguos.
    }

    function cargarOpciones() {
        try {
            const guardadas = JSON.parse(localStorage.getItem(CLAVE_OPCIONES) || "null");
            return CORE.normalizeSettings(guardadas, preferenciasSistemaReduceMovimiento);
        } catch (error) {
            return CORE.normalizeSettings(null, preferenciasSistemaReduceMovimiento);
        }
    }

    let opciones = cargarOpciones();

    function guardarOpciones() {
        try {
            localStorage.setItem(CLAVE_OPCIONES, JSON.stringify(opciones));
        } catch (error) {
            console.warn("No se pudieron guardar las opciones del juego.", error);
        }
    }

    // -----------------------------------------------------
    // CREADOR DE PERSONAJE
    // -----------------------------------------------------
    const CLAVE_PERSONAJE = "aventuraPixelPersonajeV1";
    const PERSONAJE_PIELES = ["#f1bb8c", "#ffd9b3", "#d9a066", "#a8714a", "#7a4b2e", "#4e2f1d"];
    const PERSONAJE_PELOS = ["#29243e", "#5b3a1e", "#c9702b", "#e8c15a", "#d8d8e0", "#d6407a", "#3aa7ff", "#41c46a"];
    const PERSONAJE_ESTILOS = ["Corto", "Punk", "Largo", "Coleta", "Calvo"];
    const PERSONAJE_CAMISETAS = ["#45a6ff", "#ff5a6e", "#4fd17a", "#ffd24a", "#b27cff", "#ff9b3a", "#f2f2f2", "#2b2b3a"];
    const PERSONAJE_PANTALONES = ["#25335d", "#3b3b4f", "#6b4a2f", "#1f6b4a", "#7a2e3f", "#c8c8d4"];
    const PERSONAJE_ACCESORIOS = ["Ninguno", "Gafas", "Gorra", "Bufanda", "Capa"];
    const PERSONAJE_CAMPOS = [
        { clave: "piel", etiqueta: "PIEL", colores: PERSONAJE_PIELES },
        { clave: "pelo", etiqueta: "COLOR DE PELO", colores: PERSONAJE_PELOS },
        { clave: "estilo", etiqueta: "PEINADO", nombres: PERSONAJE_ESTILOS },
        { clave: "camiseta", etiqueta: "CAMISETA", colores: PERSONAJE_CAMISETAS },
        { clave: "pantalon", etiqueta: "PANTALÓN", colores: PERSONAJE_PANTALONES },
        { clave: "accesorio", etiqueta: "ACCESORIO", nombres: PERSONAJE_ACCESORIOS }
    ];
    // Geometría compartida entre el dibujo y los clics del menú principal y del creador.
    const MENU_ANCHO = 350, MENU_ALTO = 34, MENU_Y = 125, MENU_PASO = 40, MENU_TOTAL = 7;
    const FAUNA_AMBIENTAL_ECOSISTEMA = {
        1: ["mariposa", "ave", "luciernaga"], 2: ["ave", "liebre", "luciernaga"],
        3: ["ave", "lagartija"], 4: ["lagartija", "escarabajo"],
        5: ["libelula", "rana", "luciernaga"], 6: ["pez", "libelula"],
        7: ["cangrejo", "ave", "pez"], 8: ["pez", "medusa"],
        9: ["ave", "rana", "luciernaga"], 10: ["pez", "medusa", "luciernaga"]
    };
    const CAPITULOS_HISTORIA = [
        { titulo: "EL PULSO DE LA SELVA", inicio: "Una señal verde parpadea entre l…72847 tokens truncated…ecla) {
                e.preventDefault();
                opciones = CORE.assignBinding(opciones, accionPendiente, nuevaTecla);
                accionPendiente = null;
                if (estadoAjustes) estadoAjustes.textContent = "Tecla actualizada.";
                guardarCambiosOpciones();
            }
            return;
        }
        if (estado === "personaje") {
            manejarTeclaPersonaje(e, tecla);
            return;
        }
        const editandoConfiguracion = estado === "inicio" && panelConfiguracion &&
            panelConfiguracion.open && panelConfiguracion.contains(document.activeElement);
        if (estado === "inicio" && !editandoConfiguracion) {
            if (tecla === "arrowup" || tecla === "arrowleft") {
                opcionMenu = (opcionMenu + MENU_TOTAL - 1) % MENU_TOTAL;
                e.preventDefault();
            } else if (tecla === "arrowdown" || tecla === "arrowright") {
                opcionMenu = (opcionMenu + 1) % MENU_TOTAL;
                e.preventDefault();
            } else if (tecla === "enter" || tecla === " ") {
                e.preventDefault();
                seleccionarOpcionMenu(opcionMenu);
            } else if (/^[1-7]$/.test(tecla)) {
                seleccionarOpcionMenu(Number(tecla) - 1);
            }
            return;
        }
        const accion = accionDeTecla(tecla);

        if (
            ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
                .includes(tecla)
        ) {
            e.preventDefault();
        }

        teclas[tecla] = true;
        if (accion) teclas[accion] = true;

        if (ventanaHistoria) {
            if (tecla === "enter" || tecla === "escape" || tecla === " ") {
                e.preventDefault();
                cerrarVentanaHistoria();
            }
            return;
        }

        if (ventanaLogro) {
            if (tecla === "enter" || tecla === "escape" || tecla === " ") {
                ventanaLogro = null;
                pausado = false;
            }
            return;
        }

        // Mientras la pantalla se oscurece no se aceptan más órdenes.
        if (fundidoDir === 1) return;

        if (estado === "jugando" && pausado && tecla === "q" && !ventanaLogro) {
            e.preventDefault();
            volverAlMenuPrincipal();
            return;
        }

        if (estado === "logros") {
            if (tecla === "pagedown" || tecla === "pageup") e.preventDefault();
            if (tecla === "arrowup" || accion === "izquierda") {
                ecosistemaLogros = limitar(ecosistemaLogros - 1, 0, ECOSISTEMAS.length);
                logrosScroll = 0;
            } else if (tecla === "arrowdown" || accion === "derecha") {
                ecosistemaLogros = limitar(ecosistemaLogros + 1, 0, ECOSISTEMAS.length);
                logrosScroll = 0;
            } else if (tecla === "pagedown" || tecla === "pageup") {
                if (ecosistemaLogros === 0) {
                    logrosScroll = limitar(logrosScroll + (tecla === "pagedown" ? 6 : -6), 0, obtenerTodosLosLogros().length - 6);
                }
            } else if (/^[1-9]$/.test(tecla) || tecla === "0") {
                ecosistemaLogros = tecla === "0" ? 10 : Number(tecla);
                logrosScroll = 0;
            } else if (tecla === "enter" || tecla === "escape" || tecla === " " || accion === "mapa") {
                estado = "inicio";
            }
            return;
        }
        if (estado === "bitacora") {
            const totalPaginas = Math.ceil(catalogoFauna(ecosistemaAlbum + 1).length / 8);
            if (tecla === "arrowleft") { ecosistemaAlbum = (ecosistemaAlbum + 9) % 10; paginaAlbum = 0; }
            else if (tecla === "arrowright") { ecosistemaAlbum = (ecosistemaAlbum + 1) % 10; paginaAlbum = 0; }
            else if (tecla === "arrowup" && vistaBitacora === "album") paginaAlbum = Math.max(0, paginaAlbum - 1);
            else if (tecla === "arrowdown" && vistaBitacora === "album") paginaAlbum = Math.min(totalPaginas - 1, paginaAlbum + 1);
            else if (tecla === "tab") { vistaBitacora = vistaBitacora === "album" ? "historia" : "album"; e.preventDefault(); }
            else if (/^[1-9]$/.test(tecla)) ecosistemaAlbum = Number(tecla) - 1;
            else if (tecla === "0") ecosistemaAlbum = 9;
            else if (tecla === "enter" || tecla === "escape" || tecla === " ") estado = "inicio";
            return;
        }

        if (accion === "sonido" && !e.repeat) {
            opciones.silencio = !opciones.silencio;
            guardarCambiosOpciones();
            return;
        }

        if (accion === "pausa" && estado === "jugando" && !e.repeat) {
            pausado = !pausado;
            return;
        }

        if (accion === "mapa") {
            confirmarReinicio = false;
            if (estado !== "mapa") {
                pausado = false;
                irAMapa();
            }
            return;
        }

        if (accion === "reiniciar" && !e.repeat) {
            if (estado === "mapa") {
                if (confirmarReinicio) {
                    restablecerProgreso();
                    irANivel(1);
                    confirmarReinicio = false;
                } else {
                    confirmarReinicio = true;
                    mostrarMensaje("PULSA R OTRA VEZ PARA REINICIAR PROGRESO", 160);
                }
            } else {
                irANivel(nivelActual);
            }
            return;
        }

        if (estado === "mapa" && mapaVista === "niveles" && (tecla === "escape" || tecla === "backspace" || accion === "mapa")) {
            mapaVista = "ecosistemas";
            return;
        }

        if (estado === "mapa") {
            if (tecla === "q") {
                volverAlMenuPrincipal();
                return;
            }
            if (mapaVista === "ecosistemas") {
                let seleccion = seccionMapaActual;
                if (accion === "izquierda") seleccion--;
                else if (accion === "derecha") seleccion++;
                else if (tecla === "arrowup" || tecla === "w") seleccion -= 5;
                else if (tecla === "arrowdown" || tecla === "s") seleccion += 5;
                else if (tecla === "enter") {
                    abrirSeccionEcosistema(seccionMapaActual);
                    return;
                } else if (/^[1-9]$/.test(tecla) || tecla === "0") {
                    seleccion = tecla === "0" ? 10 : Number(tecla);
                    seccionMapaActual = seleccion;
                    abrirSeccionEcosistema(seleccion);
                    return;
                }
                seccionMapaActual = limitar(seleccion, 1, ECOSISTEMAS.length);
            } else {
                const inicio = nivelDeEcosistema(seccionMapaActual);
                const fin = Math.min(inicio + NIVELES_POR_ECOSISTEMA - 1, nivelesDesbloqueados);
                if (tecla === "enter") {
                    if (nivelActual >= inicio && nivelActual <= fin) irANivel(nivelActual);
                } else if (accion === "izquierda") nivelActual = Math.max(inicio, nivelActual - 1);
                else if (accion === "derecha") nivelActual = Math.min(fin, nivelActual + 1);
                else if (tecla === "arrowup" || tecla === "w") nivelActual = Math.max(inicio, nivelActual - 1);
                else if (tecla === "arrowdown" || tecla === "s") nivelActual = Math.min(fin, nivelActual + 1);
                else if (/^[1-5]$/.test(tecla)) {
                    const etapa = Number(tecla);
                    const nivel = inicio + etapa - 1;
                    if (nivel <= nivelesDesbloqueados) irANivel(nivel);
                    else mostrarMensaje("NIVEL BLOQUEADO", 90);
                }
            }
            return;
        }

        if (estado === "victoria" && enTutorial) {
            if (tecla === "enter" || tecla === "escape") transicion(volverAlMenuPrincipal);
            return;
        }

        if (estado === "victoria") {
            if (tecla === "enter") {
                if (nivelActual < TOTAL_NIVELES) {
                    irANivel(nivelActual + 1);
                } else {
                    irAMapa();
                }
            }
            return;
        }

        if (estado === "derrota") {
            if (tecla === "enter" || accion === "reiniciar") {
                irANivel(nivelActual);
            }
            return;
        }

        if (estado === "jugando" && !pausado) {
            if (accion === "saltar" && !e.repeat) {
                saltar();
            }

            if (accion === "disparar" && !e.repeat) {
                disparar();
            }
        }
    });

    window.addEventListener("keyup", (e) => {
        const tecla = e.key.toLowerCase();
        const accion = accionDeTecla(tecla);
        teclas[tecla] = false;
        if (accion) teclas[accion] = false;

        // Salto variable: si sueltas pronto la tecla, el salto es más corto.
        if (
            estado === "jugando" &&
            !pausado &&
            accion === "saltar" &&
            jugador.vy < -4
        ) {
            jugador.vy *= 0.5;
        }
    });

    // Al cambiar de ventana se sueltan las teclas y el juego se pausa.
    window.addEventListener("blur", () => {
        for (const k in teclas) teclas[k] = false;
        if (jugador.vy < -4) jugador.vy *= 0.5;
        if (estado === "jugando") pausado = true;
    });

    for (const boton of document.querySelectorAll("[data-tactil]")) {
        const accion = boton.dataset.tactil;
        const soltar = () => {
            if (accion === "izquierda" || accion === "derecha") teclas[accion] = false;
            if (accion === "saltar") {
                teclas.saltar = false;
                if (estado === "jugando" && !pausado && jugador.vy < -4) jugador.vy *= 0.5;
            }
            boton.classList.remove("presionado");
        };
        boton.addEventListener("pointerdown", (evento) => {
            evento.preventDefault();
            if (estado !== "jugando" || (pausado && accion !== "pausa" && accion !== "mapa")) return;
            boton.setPointerCapture?.(evento.pointerId);
            boton.classList.add("presionado");
            if (accion === "izquierda" || accion === "derecha") teclas[accion] = true;
            else if (accion === "saltar") {
                teclas.saltar = true;
                saltar();
            } else if (accion === "disparar") disparar();
            else if (accion === "pausa") pausado = !pausado;
            else if (accion === "mapa") irAMapa();
        });
        boton.addEventListener("pointerup", soltar);
        boton.addEventListener("pointercancel", soltar);
        boton.addEventListener("lostpointercapture", soltar);
    }

    window.addEventListener("pagehide", () => {
        guardarProgreso();
        guardarOpciones();
        audio.detenerMusica();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            guardarProgreso();
            audio.detenerMusica();
            firmaMusica = "";
        } else {
            firmaMusica = "";
            sincronizarMusica();
        }
    });

    // Selección del menú y de niveles haciendo clic sobre el lienzo.
    canvas.addEventListener("pointermove", (e) => {
        if (estado !== "inicio") return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (ANCHO / rect.width);
        const mouseY = (e.clientY - rect.top) * (ALTO / rect.height);
        const indice = indiceMenuEn(mouseX, mouseY);
        if (indice >= 0) opcionMenu = indice;
    });

    canvas.addEventListener("click", (e) => {
        if (fundidoDir === 1) return;

        const rect = canvas.getBoundingClientRect();
        const escalaX = ANCHO / rect.width;
        const escalaY = ALTO / rect.height;
        const mouseX = (e.clientX - rect.left) * escalaX;
        const mouseY = (e.clientY - rect.top) * escalaY;

        if (ventanaHistoria) {
            if (mouseX >= 350 && mouseX <= 550 && mouseY >= 380 && mouseY <= 423) cerrarVentanaHistoria();
            return;
        }

        if (
            estado === "jugando" && pausado && !ventanaLogro &&
            mouseX >= ANCHO / 2 - 155 && mouseX <= ANCHO / 2 + 155 &&
            mouseY >= ALTO / 2 + 12 && mouseY <= ALTO / 2 + 54
        ) {
            volverAlMenuPrincipal();
            return;
        }

        if (estado === "victoria" && enTutorial) {
            transicion(volverAlMenuPrincipal);
            return;
        }
        if (estado === "personaje") {
            clicPersonaje(mouseX, mouseY);
            return;
        }
        if (estado === "inicio") {
            const indice = indiceMenuEn(mouseX, mouseY);
            if (indice >= 0) seleccionarOpcionMenu(indice);
            return;
        }
        if (estado === "logros") {
            const menuX = 14, menuY = 77, menuW = 190, menuH = 31, menuGap = 4;
            const indice = Math.floor((mouseY - menuY) / (menuH + menuGap));
            const y = menuY + indice * (menuH + menuGap);
            if (mouseX >= menuX && mouseX <= menuX + menuW && indice >= 0 && indice <= ECOSISTEMAS.length && mouseY >= y && mouseY <= y + menuH) {
                ecosistemaLogros = indice;
                logrosScroll = 0;
                return;
            }
            estado = "inicio";
            return;
        }
        if (estado === "bitacora") {
            if (mouseX >= 730 && mouseX <= 870 && mouseY >= 24 && mouseY <= 56) {
                estado = "inicio";
                return;
            }
            if (mouseY >= 84 && mouseY <= 116) {
                if (mouseX >= ANCHO / 2 - 188 && mouseX <= ANCHO / 2 - 14) vistaBitacora = "album";
                else if (mouseX >= ANCHO / 2 + 14 && mouseX <= ANCHO / 2 + 188) vistaBitacora = "historia";
                return;
            }
            if (mouseY >= 124 && mouseY <= 203) {
                const ancho = 158, alto = 36, gapX = 12, gapY = 7, inicioX = (ANCHO - 5 * ancho - 4 * gapX) / 2;
                const col = Math.floor((mouseX - inicioX) / (ancho + gapX));
                const fila = Math.floor((mouseY - 124) / (alto + gapY));
                const x = inicioX + col * (ancho + gapX), y = 124 + fila * (alto + gapY);
                if (col >= 0 && col < 5 && fila >= 0 && fila < 2 && mouseX >= x && mouseX <= x + ancho && mouseY >= y && mouseY <= y + alto) {
                    ecosistemaAlbum = fila * 5 + col; paginaAlbum = 0;
                }
                return;
            }
            if (vistaBitacora === "album" && mouseY >= 443 && mouseY <= 470) {
                const totalPaginas = Math.ceil(catalogoFauna(ecosistemaAlbum + 1).length / 8);
                if (mouseX >= 255 && mouseX <= 400) paginaAlbum = Math.max(0, paginaAlbum - 1);
                else if (mouseX >= 500 && mouseX <= 645) paginaAlbum = Math.min(totalPaginas - 1, paginaAlbum + 1);
            }
            return;
        }
        if (estado !== "mapa") return;

        if (mouseX >= ANCHO - 212 && mouseX <= ANCHO - 28 && mouseY >= 421 && mouseY <= 457) {
            volverAlMenuPrincipal();
            return;
        }

        if (mapaVista === "ecosistemas") {
            const ancho = 158, alto = 145, espacioX = 12, espacioY = 17;
            const inicioX = (ANCHO - (5 * ancho + 4 * espacioX)) / 2;
            const inicioY = 105;
            const columna = Math.floor((mouseX - inicioX) / (ancho + espacioX));
            const fila = Math.floor((mouseY - inicioY) / (alto + espacioY));
            const x = inicioX + columna * (ancho + espacioX);
            const y = inicioY + fila * (alto + espacioY);
            if (columna >= 0 && columna < 5 && fila >= 0 && fila < 2 && mouseX >= x && mouseX <= x + ancho && mouseY >= y && mouseY <= y + alto) {
                abrirSeccionEcosistema(fila * 5 + columna + 1);
            }
            return;
        }

        if (mouseX >= 28 && mouseX <= 212 && mouseY >= 421 && mouseY <= 457) {
            mapaVista = "ecosistemas";
            return;
        }
        const ancho = 150, espacio = 18;
        const inicioX = (ANCHO - (5 * ancho + 4 * espacio)) / 2;
        const etapa = Math.floor((mouseX - inicioX) / (ancho + espacio)) + 1;
        const x = inicioX + (etapa - 1) * (ancho + espacio);
        const inicio = nivelDeEcosistema(seccionMapaActual);
        if (etapa >= 1 && etapa <= 5 && mouseX >= x && mouseX <= x + ancho && mouseY >= 142 && mouseY <= 320) {
            const nivel = inicio + etapa - 1;
            if (nivel <= nivelesDesbloqueados) irANivel(nivel);
            else mostrarMensaje("NIVEL BLOQUEADO", 90);
        }
    });

    canvas.addEventListener("wheel", (e) => {
        if (estado !== "logros" || ecosistemaLogros !== 0) return;
        e.preventDefault();
        logrosScroll = limitar(logrosScroll + (e.deltaY > 0 ? 2 : -2), 0, obtenerTodosLosLogros().length - 6);
    }, { passive: false });

    // Recuperar progreso y abrir el mapa en el último nivel desbloqueado.
    cargarProgresoGuardado();
    puntosMostrados = puntuacion;
    nivelActual = nivelesDesbloqueados;
    jugador.vidas = vidasPorNivel();

    // Iniciar el juego (con fundido de entrada).
    cargarNivel(nivelActual);
    estado = "inicio";
    ventanaHistoria = null;
    pausado = false;
    mensajeTiempo = 0;
    fundidoAlfa = 1;
    fundidoDir = -1;
    requestAnimationFrame(bucle);
})();

