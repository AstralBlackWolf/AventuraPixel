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
        { titulo: "EL PULSO DE LA SELVA", inicio: "Una señal verde parpadea entre las copas. La Red Viva perdió su primer enlace y el sendero está cubierto por lianas y plantas inquietas. Sigue las huellas del jaguar: pueden conducirte hasta el nodo que necesita ayuda.", final: "El dosel vuelve a iluminarse y las semillas ya pueden cruzar el corredor restaurado. El jaguar regresa a su territorio; una bandada lleva la señal hacia las montañas frías.", texto: "El primer nodo de la Red Viva late bajo el dosel. El jaguar y el tapir te enseñan que cada especie cumple una función: cuando el bosque pierde sus corredores, las semillas dejan de viajar y el equilibrio se rompe. Recupera el paso entre los árboles y lleva una semilla al siguiente hábitat.", mapa: ["🌿", "🐆", "🌱", "🦜", "💧"] },
        { titulo: "EL SILENCIO DE LA TAIGA", inicio: "La señal que llega de la selva se debilita bajo una capa de hielo. Las rutas del zorro ártico han quedado aisladas y el suelo resbala a cada paso. Encuentra el paso entre los glaciares antes de que el enlace se apague.", final: "El camino entre la nieve vuelve a abrirse y las especies recuperan su ruta estacional. Desde una cresta, un búho divisa el siguiente destino: las llanuras cálidas de la sabana.", texto: "El frío cambia, el hielo retrocede y las rutas del zorro ártico se interrumpen. La Red Viva conserva la memoria de las estaciones: proteger la tundra también significa cuidar el clima que conecta todos los mundos.", mapa: ["❄️", "🐾", "🏔️", "🦉", "🌨️"] },
        { titulo: "LA SABANA COMPARTIDA", inicio: "El calor ha secado los abrevaderos de la sabana. Sin agua, las manadas cambian su ruta y los carroñeros pierden alimento. Busca la fuente escondida entre la hierba alta y escucha a los animales que comparten el territorio.", final: "La fuente vuelve a fluir y los animales se acercan sin disputarse el último charco. El agua sigue su curso hacia las dunas: allí te espera una nueva prueba de cuidado.", texto: "La hierba alta es refugio, alimento y camino. Al restaurar sus fuentes de agua, descubres que depredadores y carroñeros sostienen juntos la sabana. Ninguna especie prospera aislada.", mapa: ["🌾", "🦁", "🌳", "🦒", "💧"] },
        { titulo: "AGUA PARA EL DESIERTO", inicio: "Una corriente subterránea apenas alcanza el oasis. Las huellas del fennec rodean una zona donde la arena cubrió el antiguo manantial. Cruza las dunas y descubre cómo proteger cada gota.", final: "El oasis queda protegido y vuelve a alimentar a las especies del desierto. Una lluvia lejana viaja hacia los humedales, donde el agua deberá encontrar un nuevo cauce.", texto: "Bajo la arena hay vida que sabe esperar. El fennec, los reptiles y los cactus dependen de cada gota. La semilla del desierto no crea agua: ayuda a proteger los oasis y a usar este recurso con cuidado.", mapa: ["🏜️", "🦊", "🌵", "🪲", "💧"] },
        { titulo: "EL HUMEDAL RESPIRA", inicio: "El agua del oasis llegó turbia y los canales del humedal están atascados. Ranas y aves buscan un paso seguro entre los juncos. Sigue la corriente y localiza el punto donde el agua dejó de circular.", final: "Los canales vuelven a conectarse y el humedal puede filtrar el agua que baja hacia el río. Una nutria aparece en la orilla y se lanza corriente abajo.", texto: "El humedal filtra el agua y amortigua las inundaciones. Capibaras, anfibios y aves encuentran aquí alimento y refugio. Al despejar los canales, la corriente vuelve a conectar la tierra con el río.", mapa: ["🌿", "🐸", "🪷", "🦫", "〰️"] },
        { titulo: "EL RÍO NOS CONECTA", inicio: "La nutria te guía por un río que perdió su brillo. Piedras sueltas y rápidos esconden el origen del problema. Sigue el curso del agua desde sus orillas hasta el punto donde nace la señal.", final: "El agua recupera su curso y lleva vida hacia la costa. El martín pescador encuentra alimento de nuevo; su vuelo marca el rumbo de la siguiente etapa.", texto: "Una corriente limpia lleva nutrientes desde las montañas hasta el mar. La nutria y el martín pescador son parte de una red sensible a la contaminación. Sigue el curso del agua y encuentra dónde vuelve a nacer la vida.", mapa: ["⛰️", "🐟", "〰️", "🦦", "🌊"] },
        { titulo: "CUIDAR LA COSTA", inicio: "El río desemboca entre rocas cubiertas de residuos. La marea empuja los desechos hacia las pozas donde se refugian cangrejos y aves. Explora la costa y despeja el paso antes de que suba la marea.", final: "La costa queda limpia y sus pozas vuelven a servir de refugio. Las corrientes llevan la señal mar adentro, hasta un arrecife que necesita protección.", texto: "La costa rocosa protege el encuentro entre tierra y océano. Pozas, aves y mamíferos marinos dependen de playas sin residuos. La marea te muestra que nuestras acciones viajan mucho más lejos de lo que vemos.", mapa: ["🪨", "🦀", "🪸", "🦭", "🌊"] },
        { titulo: "EL ARRECIFE DE COLORES", inicio: "El arrecife perdió sus colores y sus habitantes buscan refugio. Una corriente cálida atraviesa los corales y altera el equilibrio del agua. Encuentra el nodo marino y aprende qué necesita para recuperarse.", final: "Los corales vuelven a ofrecer refugio y los peces regresan en pequeños grupos. El arrecife envía su pulso hacia las raíces del manglar, que protegen la costa desde tierra.", texto: "El coral es un animal que construye hogar para miles de especies. El agua cálida y la contaminación lo ponen en riesgo. Al restaurar este nodo, la vida del arrecife puede volver a refugiarse y alimentarse.", mapa: ["🐠", "🪸", "🐢", "🪼", "🌊"] },
        { titulo: "RAÍCES QUE PROTEGEN", inicio: "La señal del arrecife llega a un manglar golpeado por las olas. Sus raíces retienen residuos y los canales están bloqueados. Busca entre las raíces el camino que protege a las crías y a las comunidades costeras.", final: "Las raíces vuelven a sostener la orilla y los canales se abren para las crías. El agua desciende hacia la oscuridad: el último nodo aguarda en las profundidades.", texto: "El manglar une agua dulce y salada. Sus raíces guardan carbono, reducen el impacto de las olas y sirven de guardería a muchos animales. Protegerlo es cuidar a las comunidades de la costa y a la fauna que nace entre sus raíces.", mapa: ["🌱", "🦩", "🌳", "🐊", "〰️"] },
        { titulo: "EL LATIDO DEL ABISMO", inicio: "La última señal parpadea muy por debajo de la superficie. En el océano profundo no hay luz solar y cada especie depende de un equilibrio frágil. Desciende con cuidado y encuentra el origen del pulso perdido.", final: "El último nodo despierta y su luz enlaza los diez ecosistemas. La Red Viva está conectada otra vez, pero su futuro depende de las decisiones que tomemos fuera de esta aventura.", texto: "Incluso donde no llega la luz existe una comunidad extraordinaria. El océano profundo influye en el clima y guarda especies que apenas conocemos. Al reparar el último nodo, la Red Viva vuelve a enlazar todos los hábitats: la aventura continúa en nuestras decisiones diarias.", mapa: ["🌊", "🐠", "✨", "🦑", "🌐"] }
    ];
    const CORRUPCIONES_GUARDIAN = [
        { sustancia: "lodo con residuos de minería", sintoma: "la desorientación lo hace embestir todo lo que se acerca" },
        { sustancia: "escorrentía química atrapada en el hielo", sintoma: "el frío y la sustancia lo mantienen en un estado de alarma" },
        { sustancia: "pesticida concentrado en el abrevadero", sintoma: "la sed y el químico alteraron su comportamiento" },
        { sustancia: "residuos tóxicos filtrados en el oasis", sintoma: "el veneno lo volvió impredecible y protege el agua con furia" },
        { sustancia: "fertilizante que llegó al humedal", sintoma: "el agua alterada lo confunde y lo pone a la defensiva" },
        { sustancia: "mercurio arrastrado desde una mina", sintoma: "la contaminación lo desorienta en la corriente" },
        { sustancia: "una mancha de combustible en la costa", sintoma: "el olor y los residuos lo mantienen agitado" },
        { sustancia: "desechos químicos que dañaron el arrecife", sintoma: "el agua alterada lo confunde y lo hace embestir" },
        { sustancia: "residuos de petróleo entre las raíces", sintoma: "la contaminación lo desorienta y lo vuelve territorial" },
        { sustancia: "microplásticos y residuos tóxicos", sintoma: "la sustancia lo confunde y lo mantiene en alerta" }
    ];

    function guardianDeEcosistema(id) {
        return (ESPECIES_ENEMIGAS[id] || ESPECIES_ENEMIGAS[1]).suelo[0][0];
    }

    function relatoCorrupcionGuardian(id) {
        const guardian = guardianDeEcosistema(id);
        const corrupcion = CORRUPCIONES_GUARDIAN[id - 1] || CORRUPCIONES_GUARDIAN[0];
        return `El guardián, un ${guardian}, fue expuesto a ${corrupcion.sustancia}. ${corrupcion.sintoma}. No es un villano: necesita que lo calmes. Reúne los tres diamantes de energía y usa tus pulsos restauradores. Cuando tengas también la llave y completes la ruta, prepararás y administrarás el antídoto de la Red Viva.`;
    }

    function relatoCuraGuardian(id) {
        return `El guardián ${guardianDeEcosistema(id)} recibe el antídoto de la Red Viva, preparado con los tres diamantes que reuniste. Recupera la calma y vuelve a su hábitat.`;
    }
    let ecosistemaAlbum = 0;
    let vistaBitacora = "album";
    let paginaAlbum = 0;
    const PC = { x: 410, ancho: 420, y: 100, paso: 52, alto: 42, botonY: 424, botonAlto: 42 };

    function totalCampoPersonaje(campo) {
        return (campo.colores || campo.nombres).length;
    }

    function normalizarApariencia(entrada) {
        const origen = entrada && typeof entrada === "object" ? entrada : {};
        const resultado = {};
        for (const campo of PERSONAJE_CAMPOS) {
            const valor = Number.isInteger(origen[campo.clave]) ? origen[campo.clave] : 0;
            resultado[campo.clave] = CORE.clamp(valor, 0, totalCampoPersonaje(campo) - 1);
        }
        return resultado;
    }

    function cargarApariencia() {
        try {
            return normalizarApariencia(JSON.parse(localStorage.getItem(CLAVE_PERSONAJE) || "null"));
        } catch (error) {
            return normalizarApariencia(null);
        }
    }

    let apariencia = cargarApariencia();
    let filaPersonaje = 0;

    // Estado del nivel tutorial (aparte de los 50 niveles).
    const CLAVE_TUTORIAL = "aventuraPixelTutorialV1";
    let enTutorial = false;
    let nivelAntesTutorial = 1;
    let puntuacionAntesTutorial = 0;
    let tutorialRespawnX = 60;
    let tutorialCarteles = [];
    let tutorialCompletado = false;
    try { tutorialCompletado = localStorage.getItem(CLAVE_TUTORIAL) === "1"; } catch (error) { /* almacenamiento opcional */ }

    function guardarApariencia() {
        try {
            localStorage.setItem(CLAVE_PERSONAJE, JSON.stringify(apariencia));
        } catch (error) {
            console.warn("No se pudo guardar el personaje.", error);
        }
    }

    function cambiarCampoPersonaje(indice, delta) {
        const campo = PERSONAJE_CAMPOS[indice];
        if (!campo) return;
        const total = totalCampoPersonaje(campo);
        apariencia[campo.clave] = (apariencia[campo.clave] + delta + total) % total;
        guardarApariencia();
    }

    function personajeAleatorio() {
        for (const campo of PERSONAJE_CAMPOS) {
            apariencia[campo.clave] = Math.floor(Math.random() * totalCampoPersonaje(campo));
        }
        guardarApariencia();
    }

    function indiceMenuEn(mouseX, mouseY) {
        const xMin = (ANCHO - MENU_ANCHO) / 2;
        const indice = Math.floor((mouseY - MENU_Y) / MENU_PASO);
        const yMin = MENU_Y + indice * MENU_PASO;
        if (
            mouseX >= xMin && mouseX <= xMin + MENU_ANCHO &&
            indice >= 0 && indice < MENU_TOTAL && mouseY >= yMin && mouseY <= yMin + MENU_ALTO
        ) return indice;
        return -1;
    }

    function salirCreadorPersonaje() {
        estado = "inicio";
        opcionMenu = 4;
        if (canvas && typeof canvas.focus === "function") canvas.focus();
    }

    function manejarTeclaPersonaje(e, tecla) {
        const filas = PERSONAJE_CAMPOS.length + 2;
        const filaAleatorio = PERSONAJE_CAMPOS.length;
        const filaListo = filaAleatorio + 1;
        let atendida = true;
        if (tecla === "arrowup" || tecla === "w") {
            filaPersonaje = (filaPersonaje + filas - 1) % filas;
        } else if (tecla === "arrowdown" || tecla === "s") {
            filaPersonaje = (filaPersonaje + 1) % filas;
        } else if (tecla === "arrowleft" || tecla === "a") {
            if (filaPersonaje < filaAleatorio) cambiarCampoPersonaje(filaPersonaje, -1);
            else filaPersonaje = filaAleatorio;
        } else if (tecla === "arrowright" || tecla === "d") {
            if (filaPersonaje < filaAleatorio) cambiarCampoPersonaje(filaPersonaje, 1);
            else filaPersonaje = filaListo;
        } else if (tecla === "enter" || tecla === " ") {
            if (filaPersonaje === filaAleatorio) personajeAleatorio();
            else if (filaPersonaje === filaListo) salirCreadorPersonaje();
            else filaPersonaje++;
        } else if (tecla === "escape") {
            salirCreadorPersonaje();
        } else {
            atendida = false;
        }
        if (atendida) e.preventDefault();
    }

    function clicPersonaje(mx, my) {
        for (let i = 0; i < PERSONAJE_CAMPOS.length; i++) {
            const y = PC.y + i * PC.paso;
            if (mx >= PC.x && mx <= PC.x + PC.ancho && my >= y && my <= y + PC.alto) {
                filaPersonaje = i;
                if (mx >= PC.x + 170) cambiarCampoPersonaje(i, mx < PC.x + 298 ? -1 : 1);
                return;
            }
        }
        if (my >= PC.botonY && my <= PC.botonY + PC.botonAlto) {
            if (mx >= PC.x && mx <= PC.x + 200) {
                filaPersonaje = PERSONAJE_CAMPOS.length;
                personajeAleatorio();
            } else if (mx >= PC.x + 220 && mx <= PC.x + 420) {
                salirCreadorPersonaje();
            }
        }
    }

    let estado = "inicio";
    let opcionMenu = 2;
    let nivelActual = 1;
    let mapaVista = "ecosistemas";
    let seccionMapaActual = 1;
    let ecosistemaLogros = 0;
    let logrosScroll = 0;
    let nivelesDesbloqueados = 1;
    let mejoresEstrellas = Array(TOTAL_NIVELES).fill(0);
    let estrellasUltimoNivel = 0;
    let sinPerderVidaNivel = true;
    let longitudNivel = 3000;
    let camaraX = 0;
    let tiempo = 0;
    let puntuacion = 0;
    let puntosMostrados = 0;
    let mensaje = "";
    let mensajeTiempo = 0;
    let confirmarReinicio = false;
    let semillaNivel = 1;

    // Efectos de "game feel".
    let temblor = 0;      // Intensidad del temblor de pantalla.
    let congelar = 0;     // Fotogramas de "hit-stop" (pausa breve al golpear).
    let pausado = false;
    let silencio = opciones.silencio;
    let volumenSonido = opciones.volumen / 100;

    // Transición con fundido a negro.
    let fundidoAlfa = 1;
    let fundidoDir = -1;  // 1 = oscureciendo, -1 = aclarando, 0 = nada.
    let fundidoCb = null;

    const CLAVE_GUARDADO = "aventuraPixelProgresoV1";
    let perfilesDificultad = crearPerfilesVacios();
    let logroTodosLosLogros = false;
    let jefesDerrotados = [];
    let logroTodosLosJefes = false;
    let ventanaLogro = null;
    let ventanaHistoria = null;
    let iniciosHistoriaVistos = [];
    let logrosAvaricia = [];
    let logrosSinDanio = [];
    let logrosCazador = [];
    let ecosistemasCompletados = [];
    let logroTodosLosEcosistemas = false;
    let nivelesCompletadosDificultad = { facil: [], normal: [], dificil: [] };
    let logrosDificultad = [];
    let faunaDescubierta = [];
    let retosEcosistemas = ECOSISTEMAS.map(() => ({
        sinDanio: true,
        todasMonedas: true,
        todosEnemigos: true,
        etapasCompletadas: Array(NIVELES_POR_ECOSISTEMA).fill(false)
    }));

    function guardarListaLogros(lista, ecosistema) {
        if (lista.includes(ecosistema)) return false;
        lista.push(ecosistema);
        return true;
    }

    function nuevoRetoEcosistema() {
        return {
            sinDanio: true,
            todasMonedas: true,
            todosEnemigos: true,
            etapasCompletadas: Array(NIVELES_POR_ECOSISTEMA).fill(false)
        };
    }

    function nuevoPerfilDificultad() {
        return {
            nivelesDesbloqueados: 1,
            mejoresEstrellas: Array(TOTAL_NIVELES).fill(0),
            puntuacion: 0,
            jefesDerrotados: [],
            logroTodosLosJefes: false,
            logrosAvaricia: [],
            logrosSinDanio: [],
            logrosCazador: [],
            ecosistemasCompletados: [],
            logroTodosLosEcosistemas: false,
            retosEcosistemas: ECOSISTEMAS.map(() => nuevoRetoEcosistema()),
            nivelesCompletados: [],
            faunaDescubierta: [],
            iniciosHistoriaVistos: []
        };
    }

    function claveFauna(ecosistema, nombre) {
        return `${ecosistema}:${String(nombre).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es")}`;
    }

    function descubrirFauna(nombre, ecosistema = ecosistemaActual()) {
        if (enTutorial || !nombre) return;
        const id = claveFauna(ecosistema, nombre);
        if (faunaDescubierta.includes(id)) return;
        faunaDescubierta.push(id);
        guardarProgreso();
    }

    function catalogoFauna(ecosistema) {
        const especies = ESPECIES_ENEMIGAS[ecosistema];
        const fauna = [...especies.suelo, ...especies.aire].map(ficha => ({ nombre: ficha[0], clase: ficha[1], color: ficha[2], id: claveFauna(ecosistema, ficha[0]) }));
        for (const especie of FAUNA_AMBIENTAL_ECOSISTEMA[ecosistema] || []) {
            const nombres = { mariposa: "Mariposa", ave: "Ave silvestre", luciernaga: "Luciérnaga", liebre: "Liebre ártica", lagartija: "Lagartija", escarabajo: "Escarabajo", libelula: "Libélula", rana: "Rana", pez: "Pez del hábitat", medusa: "Medusa", cangrejo: "Cangrejo" };
            const clases = { mariposa: "insecto", ave: "ave", luciernaga: "insecto", liebre: "mamifero", lagartija: "reptil", escarabajo: "insecto", libelula: "insecto", rana: "anfibio", pez: "pez", medusa: "cnidario", cangrejo: "crustaceo" };
            fauna.push({ nombre: nombres[especie] || especie, clase: clases[especie] || "animal", color: "#8bd8ce", id: claveFauna(ecosistema, especie) });
        }
        return [...new Map(fauna.map(ficha => [ficha.id, ficha])).values()];
    }

    function ilustracionFauna(ficha) {
        const nombre = ficha.nombre.toLocaleLowerCase("es");
        if (nombre.includes("lobo marino")) return "🦭";
        if (nombre.includes("jaguar") || nombre.includes("león") || nombre.includes("puma")) return "🐆";
        if (nombre.includes("lobo") || nombre.includes("hiena") || nombre.includes("fennec") || nombre.includes("zorro")) return "🦊";
        if (nombre.includes("tucán")) return "🦜";
        if (nombre.includes("búho")) return "🦉";
        if (nombre.includes("tapir")) return "🐗";
        if (nombre.includes("capibara")) return "🦫";
        if (nombre.includes("nutria")) return "🦦";
        if (nombre.includes("cocodrilo") || nombre.includes("caimán")) return "🐊";
        if (nombre.includes("cangrejo")) return "🦀";
        if (nombre.includes("medusa")) return "🪼";
        if (nombre.includes("calamar")) return "🦑";
        if (nombre.includes("escorpión")) return "🦂";
        if (nombre.includes("rana")) return "🐸";
        if (nombre.includes("liebre")) return "🐇";
        if (nombre.includes("lagartija")) return "🦎";
        if (nombre.includes("pez") || nombre.includes("bagre") || nombre.includes("morena") || nombre.includes("mantarraya")) return "🐟";
        if (nombre.includes("mariposa")) return "🦋";
        if (nombre.includes("libélula")) return "🪰";
        if (nombre.includes("luciérnaga")) return "✨";
        if (nombre.includes("escarabajo")) return "🪲";
        if (ficha.clase === "pez") return "🐟";
        if (ficha.clase === "reptil") return "🦎";
        if (ficha.clase === "insecto") return "🐞";
        if (ficha.clase === "crustaceo" || ficha.clase === "cangrejo") return "🦀";
        if (ficha.clase === "cnidario" || ficha.clase === "medusa") return "🪼";
        if (ficha.clase === "arácnido" || ficha.clase === "aracnido") return "🕷️";
        if (ficha.clase === "anfibio") return "🐸";
        if (ficha.clase === "ave") return "🐦";
        if (ficha.clase === "mamifero") return "🐾";
        return "🌿";
    }

    function datoEducativoFauna(ficha) {
        const datos = {
            ave: "Dispersa semillas, poliniza y regula insectos.",
            mamifero: "Conecta hábitats y equilibra cadenas alimentarias.",
            pez: "Indica la salud del agua y sostiene la red acuática.",
            reptil: "Regula poblaciones y necesita refugios protegidos.",
            insecto: "Poliniza flores y alimenta a muchas especies.",
            anfibio: "Su piel sensible revela cambios en la calidad del agua.",
            cnidario: "Sostiene la red marina y alimenta a otros animales.",
            crustaceo: "Recicla nutrientes y alimenta peces y aves.",
            arácnido: "Controla poblaciones de otros invertebrados."
        };
        return datos[ficha.clase] || "Cada especie sostiene la red de vida de su hábitat.";
    }

    function crearPerfilesVacios() {
        return Object.fromEntries(DIFICULTADES.map(dificultad => [dificultad, nuevoPerfilDificultad()]));
    }

    function capturarPerfilActual() {
        return {
            nivelesDesbloqueados,
            mejoresEstrellas: [...mejoresEstrellas],
            puntuacion,
            jefesDerrotados: [...jefesDerrotados],
            logroTodosLosJefes,
            logrosAvaricia: [...logrosAvaricia],
            logrosSinDanio: [...logrosSinDanio],
            logrosCazador: [...logrosCazador],
            ecosistemasCompletados: [...ecosistemasCompletados],
            logroTodosLosEcosistemas,
            retosEcosistemas: retosEcosistemas.map(reto => ({ ...reto, etapasCompletadas: [...reto.etapasCompletadas] })),
            nivelesCompletados: [...(nivelesCompletadosDificultad[opciones.dificultad] || [])],
            faunaDescubierta: [...faunaDescubierta],
            iniciosHistoriaVistos: [...iniciosHistoriaVistos]
        };
    }

    function sanitizarPerfil(datos) {
        const origen = datos && typeof datos === "object" ? datos : {};
        const progreso = CORE.sanitizeProgress(origen, TOTAL_NIVELES);
        const listaValida = lista => Array.isArray(lista)
            ? [...new Set(lista.filter(id => Number.isInteger(id) && id >= 1 && id <= ECOSISTEMAS.length))]
            : [];
        const retos = Array.isArray(origen.retosEcosistemas)
            ? ECOSISTEMAS.map((_, indice) => {
                const reto = origen.retosEcosistemas[indice];
                if (!reto || typeof reto !== "object") return nuevoRetoEcosistema();
                return {
                    sinDanio: reto.sinDanio !== false,
                    todasMonedas: reto.todasMonedas !== false,
                    todosEnemigos: reto.todosEnemigos !== false,
                    etapasCompletadas: Array.from({ length: NIVELES_POR_ECOSISTEMA }, (_, etapa) => reto.etapasCompletadas?.[etapa] === true)
                };
            })
            : ECOSISTEMAS.map(() => nuevoRetoEcosistema());
        return {
            nivelesDesbloqueados: progreso.nivelesDesbloqueados,
            mejoresEstrellas: Array.from({ length: TOTAL_NIVELES }, (_, indice) =>
                Number.isInteger(origen.mejoresEstrellas?.[indice]) ? Math.max(0, Math.min(3, origen.mejoresEstrellas[indice])) : 0
            ),
            puntuacion: progreso.puntuacion,
            jefesDerrotados: listaValida(origen.jefesDerrotados),
            logroTodosLosJefes: origen.logroTodosLosJefes === true || listaValida(origen.jefesDerrotados).length === ECOSISTEMAS.length,
            logrosAvaricia: listaValida(origen.logrosAvaricia),
            logrosSinDanio: listaValida(origen.logrosSinDanio),
            logrosCazador: listaValida(origen.logrosCazador),
            ecosistemasCompletados: listaValida(origen.ecosistemasCompletados),
            logroTodosLosEcosistemas: origen.logroTodosLosEcosistemas === true || listaValida(origen.ecosistemasCompletados).length === ECOSISTEMAS.length,
            retosEcosistemas: retos,
            nivelesCompletados: Array.isArray(origen.nivelesCompletados)
                ? [...new Set(origen.nivelesCompletados.filter(nivel => Number.isInteger(nivel) && nivel >= 1 && nivel <= TOTAL_NIVELES))]
                : [],
            faunaDescubierta: Array.isArray(origen.faunaDescubierta)
                ? [...new Set(origen.faunaDescubierta.filter(id => typeof id === "string" && id.length <= 100))]
                : [],
            iniciosHistoriaVistos: Array.isArray(origen.iniciosHistoriaVistos)
                ? [...new Set(origen.iniciosHistoriaVistos.filter(id => Number.isInteger(id) && id >= 1 && id <= ECOSISTEMAS.length))]
                : []
        };
    }

    function aplicarPerfil(datos) {
        const perfil = sanitizarPerfil(datos);
        nivelesDesbloqueados = perfil.nivelesDesbloqueados;
        mejoresEstrellas = perfil.mejoresEstrellas;
        puntuacion = perfil.puntuacion;
        puntosMostrados = puntuacion;
        jefesDerrotados = perfil.jefesDerrotados;
        logroTodosLosJefes = perfil.logroTodosLosJefes;
        logrosAvaricia = perfil.logrosAvaricia;
        logrosSinDanio = perfil.logrosSinDanio;
        logrosCazador = perfil.logrosCazador;
        ecosistemasCompletados = perfil.ecosistemasCompletados;
        logroTodosLosEcosistemas = perfil.logroTodosLosEcosistemas;
        retosEcosistemas = perfil.retosEcosistemas;
        nivelesCompletadosDificultad[opciones.dificultad] = perfil.nivelesCompletados;
        faunaDescubierta = perfil.faunaDescubierta;
        iniciosHistoriaVistos = perfil.iniciosHistoriaVistos;
        nivelActual = nivelesDesbloqueados;
        jugador.vidas = vidasPorNivel();
        // Partidas con todas las estrellas ya conseguidas: los logros correspondientes se otorgan solos.
        otorgarLogrosPorEstrellas([]);
    }

    function perfilTieneTodosLosLogros(perfil) {
        const ids = Array.from({ length: ECOSISTEMAS.length }, (_, indice) => indice + 1);
        return [
            perfil.jefesDerrotados,
            perfil.ecosistemasCompletados,
            perfil.logrosAvaricia,
            perfil.logrosSinDanio,
            perfil.logrosCazador
        ].every(lista => ids.every(id => lista.includes(id))) && perfil.logroTodosLosJefes && perfil.logroTodosLosEcosistemas;
    }

    function actualizarLogroTodosLosLogros() {
        const perfiles = { ...perfilesDificultad, [opciones.dificultad]: capturarPerfilActual() };
        const completos = DIFICULTADES.every(dificultad => perfilTieneTodosLosLogros(perfiles[dificultad])) &&
            DIFICULTADES.every(dificultad => logrosDificultad.includes(dificultad));
        if (completos && !logroTodosLosLogros) {
            logroTodosLosLogros = true;
            return true;
        }
        return false;
    }

    // Con 3 estrellas en los 5 niveles de un ecosistema, sus logros de completarlo,
    // de recoger todas las monedas y de no recibir daño se obtienen automáticamente.
    // Con 3 estrellas en los 50 niveles también se obtiene el logro de la dificultad.
    function otorgarLogrosPorEstrellas(nuevos) {
        const completados = nivelesCompletadosDificultad[opciones.dificultad];
        for (let ecosistema = 1; ecosistema <= ECOSISTEMAS.length; ecosistema++) {
            const inicio = (ecosistema - 1) * NIVELES_POR_ECOSISTEMA;
            const niveles = mejoresEstrellas.slice(inicio, inicio + NIVELES_POR_ECOSISTEMA);
            if (niveles.length < NIVELES_POR_ECOSISTEMA || !niveles.every(estrellas => estrellas >= 3)) continue;
            for (let k = 1; k <= NIVELES_POR_ECOSISTEMA; k++) {
                if (!completados.includes(inicio + k)) completados.push(inicio + k);
            }
            if (guardarListaLogros(ecosistemasCompletados, ecosistema)) nuevos.push(LOGROS_COMPLETAR_ECOSISTEMA[ecosistema - 1]);
            if (guardarListaLogros(logrosAvaricia, ecosistema)) nuevos.push(LOGROS_AVARICIA[ecosistema - 1]);
            if (guardarListaLogros(logrosSinDanio, ecosistema)) nuevos.push(LOGROS_SIN_DANIO[ecosistema - 1]);
        }
        if (!logroTodosLosEcosistemas && ecosistemasCompletados.length === ECOSISTEMAS.length) {
            logroTodosLosEcosistemas = true;
            nuevos.push(LOGRO_TODOS_ECOSISTEMAS);
        }
        if (completados.length === TOTAL_NIVELES && guardarListaLogrosDificultad(opciones.dificultad)) {
            nuevos.push(LOGROS_DIFICULTAD[opciones.dificultad].titulo);
        }
    }

    function registrarLogrosDelNivel() {
        const ecosistema = ecosistemaActual();
        const etapa = etapaActual();
        const reto = retosEcosistemas[ecosistema - 1];
        const nuevos = [];
        const completadosEnDificultad = nivelesCompletadosDificultad[opciones.dificultad];
        if (!completadosEnDificultad.includes(nivelActual)) completadosEnDificultad.push(nivelActual);
        const logroDificultad = LOGROS_DIFICULTAD[opciones.dificultad];
        if (completadosEnDificultad.length === TOTAL_NIVELES && guardarListaLogrosDificultad(opciones.dificultad)) {
            nuevos.push(logroDificultad.titulo);
        }
        reto.etapasCompletadas[etapa - 1] = true;
        reto.todasMonedas = reto.todasMonedas && monedas.every(moneda => moneda.recogida);
        reto.todosEnemigos = reto.todosEnemigos && enemigos.length === 0;
        otorgarLogrosPorEstrellas(nuevos);

        if (etapa !== NIVELES_POR_ECOSISTEMA || !reto.etapasCompletadas.every(Boolean)) {
            if (actualizarLogroTodosLosLogros()) nuevos.push(LOGRO_TODOS_LOGROS);
            return nuevos;
        }

        if (guardarListaLogros(ecosistemasCompletados, ecosistema)) nuevos.push(LOGROS_COMPLETAR_ECOSISTEMA[ecosistema - 1]);
        if (reto.todasMonedas && guardarListaLogros(logrosAvaricia, ecosistema)) nuevos.push(LOGROS_AVARICIA[ecosistema - 1]);
        if (reto.sinDanio && guardarListaLogros(logrosSinDanio, ecosistema)) nuevos.push(LOGROS_SIN_DANIO[ecosistema - 1]);
        if (reto.todosEnemigos && guardarListaLogros(logrosCazador, ecosistema)) nuevos.push(LOGROS_CAZADOR[ecosistema - 1]);
        if (!logroTodosLosEcosistemas && ecosistemasCompletados.length === ECOSISTEMAS.length) {
            logroTodosLosEcosistemas = true;
            nuevos.push(LOGRO_TODOS_ECOSISTEMAS);
        }
        if (actualizarLogroTodosLosLogros()) nuevos.push(LOGRO_TODOS_LOGROS);
        return nuevos;
    }

    function guardarListaLogrosDificultad(dificultad) {
        if (logrosDificultad.includes(dificultad)) return false;
        logrosDificultad.push(dificultad);
        return true;
    }

    function esNivelJefe(numero = nivelActual) {
        return numero % NIVELES_POR_ECOSISTEMA === 0;
    }

    function guardarProgreso() {
        if (enTutorial) return;
        try {
            perfilesDificultad[opciones.dificultad] = sanitizarPerfil(capturarPerfilActual());
            localStorage.setItem(CLAVE_GUARDADO, JSON.stringify({
                version: 2,
                perfilesDificultad,
                nivelesCompletadosDificultad,
                logrosDificultad,
                logroTodosLosLogros
            }));
        } catch (error) {
            console.warn("No se pudo guardar el progreso del juego.", error);
        }
    }

    function cargarProgresoGuardado() {
        try {
            const datos = JSON.parse(localStorage.getItem(CLAVE_GUARDADO) || "null");
            if (!datos || typeof datos !== "object") return;
            logrosDificultad = Array.isArray(datos.logrosDificultad)
                ? [...new Set(datos.logrosDificultad.filter(id => DIFICULTADES.includes(id)))]
                : [];
            logroTodosLosLogros = datos.logroTodosLosLogros === true;

            if (datos.perfilesDificultad && typeof datos.perfilesDificultad === "object") {
                perfilesDificultad = Object.fromEntries(DIFICULTADES.map(dificultad => [
                    dificultad,
                    sanitizarPerfil(datos.perfilesDificultad[dificultad])
                ]));
            } else {
                // Migración del guardado anterior: conserva el progreso en la
                // dificultad seleccionada y deja las otras dos como perfiles nuevos.
                perfilesDificultad = crearPerfilesVacios();
                perfilesDificultad[opciones.dificultad] = sanitizarPerfil({
                    ...datos,
                    nivelesCompletados: datos.nivelesCompletadosDificultad?.[opciones.dificultad] || []
                });
                if (datos.nivelesCompletadosDificultad && typeof datos.nivelesCompletadosDificultad === "object") {
                    for (const dificultad of DIFICULTADES) {
                        perfilesDificultad[dificultad].nivelesCompletados = sanitizarPerfil({
                            nivelesCompletados: datos.nivelesCompletadosDificultad[dificultad]
                        }).nivelesCompletados;
                    }
                }
            }
            nivelesCompletadosDificultad = Object.fromEntries(DIFICULTADES.map(dificultad => [
                dificultad,
                [...perfilesDificultad[dificultad].nivelesCompletados]
            ]));
            aplicarPerfil(perfilesDificultad[opciones.dificultad]);
        } catch (error) {
            perfilesDificultad = crearPerfilesVacios();
            nivelesCompletadosDificultad = { facil: [], normal: [], dificil: [] };
            aplicarPerfil(perfilesDificultad[opciones.dificultad]);
            console.warn("El guardado anterior no se pudo leer; se inicia una partida nueva.", error);
        }
    }

    let plataformas = [];
    let monedas = [];
    let diamantes = [];
    let obstaculosSuelo = [];
    let enemigos = [];
    let proyectiles = [];
    let disparosJugador = [];
    let particulas = [];
    let corazones = [];
    let escudos = [];
    let canones = [];
    let nivelLlave = null;
    let trampolines = [];
    let plantas = [];
    let rutasAlternativas = [];
    let reliquiaSecreta = null;
    let puntoControl = null;
    let textosFlotantes = [];
    let faunaAmbiental = [];
    let plataformaIgnorada = null;
    let ignorarPlataformaHasta = 0;

    const teclas = {};

    const jugador = {
        x: 60,
        y: 350,
        ancho: 28,
        alto: 36,
        vx: 0,
        vy: 0,
        velocidad: 4.3,
        aceleracion: 0.65,
        friccion: 0.78,
        fuerzaSalto: -12.5,
        saltosRestantes: 2,
        enSuelo: false,
        coyote: 0,       // Fotogramas de gracia para saltar tras dejar el borde.
        buffer: 0,       // Salto pulsado justo antes de aterrizar.
        aplastar: 0,     // Animación de aterrizaje (squash).
        sobre: null,     // Plataforma sobre la que está parado.
        hielo: false,    // ¿Está sobre hielo?
        vidas: 3,
        invulnerable: 0,
        mirando: 1,
        disparoEspera: 0,
        monedas: 0,
        diamantes: 0,
        tieneLlave: false,
        escudo: 0
    };

    let jefe = null;

    // El sintetizador está aislado en game-audio.js.
    const audio = window.AventuraAudio.crearAudio();

    function sonido(nombre) {
        audio.reproducir(nombre, { silenciado: silencio, volumen: volumenSonido * 100 });
    }

    let firmaMusica = "";
    function sincronizarMusica() {
        const ecosistema = estado === "jugando" && !pausado ? ecosistemaActual() : 0;
        const firma = `${ecosistema}:${silencio}:${opciones.volumen}`;
        if (firma === firmaMusica) return;
        firmaMusica = firma;
        audio.establecerMusica(ecosistema, { silenciado: silencio, volumen: opciones.volumen * 0.55 });
    }

    // -----------------------------------------------------
    // UTILIDADES
    // -----------------------------------------------------

    function aleatorio(min, max) {
        // Generador pseudoaleatorio reproducible. Solo para generar niveles.
        semillaNivel = (semillaNivel * 1664525 + 1013904223) >>> 0;
        const valor = semillaNivel / 4294967296;
        return min + valor * (max - min);
    }

    function entero(min, max) {
        return Math.floor(aleatorio(min, max + 1));
    }

    // Aleatorio normal para efectos y comportamientos en vivo.
    // Así no se altera la semilla del nivel.
    function azar(min, max) {
        return min + Math.random() * (max - min);
    }

    function accionDeTecla(tecla) {
        return CORE.actionForKey(tecla, opciones.bindings);
    }

    function dificultadActual() {
        return CORE.dificultades[opciones.dificultad] || CORE.dificultades.normal;
    }

    function vidasPorNivel() {
        return dificultadActual().vidas;
    }

    function consejosContextualesNivel() {
        const mecanica = MECANICAS[nivelActual] || {};
        const consejos = [AYUDAS[nivelActual] || "Explora el nivel y busca una ruta segura."];
        if (mecanica.trampolines) consejos.push("Pisa el trampolín para rebotar; mantén salto y avanza para cruzar la barrera alta y seguir las monedas.");
        if (mecanica.escudos) consejos.push("Escudos: te protegen del daño durante 8 segundos.");
        if (mecanica.caen) consejos.push("Las plataformas agrietadas ceden al pisarlas: sigue avanzando.");
        if (mecanica.plantas) consejos.push("Los peligros vivos de este ecosistema se agitan antes de atacar: observa el aviso y esquívalos.");
        return consejos;
    }

    function ecosistemaActual() {
        return CORE.niveles[nivelActual - 1]?.ecosistema || 1;
    }

    function etapaActual() {
        return CORE.niveles[nivelActual - 1]?.etapa || 1;
    }

    function limitar(valor, min, max) {
        return Math.max(min, Math.min(max, valor));
    }

    function mod(a, n) {
        return ((a % n) + n) % n;
    }

    function colision(a, b) {
        return (
            a.x < b.x + b.ancho &&
            a.x + a.ancho > b.x &&
            a.y < b.y + b.alto &&
            a.y + a.alto > b.y
        );
    }

    function mostrarMensaje(texto, duracion = 150) {
        mensaje = texto;
        mensajeTiempo = duracion;
    }

    function textoCentrado(texto, x, y, tamano = 20, color = "#ffffff") {
        ctx.font = `bold ${tamano}px monospace`;
        ctx.textAlign = "center";
        ctx.fillStyle = color;
        ctx.fillText(texto, x, y);
        ctx.textAlign = "left";
    }

    function rectangulo(x, y, ancho, alto, color) {
        ctx.fillStyle = color;
        ctx.fillRect(Math.round(x), Math.round(y), ancho, alto);
    }

    // -----------------------------------------------------
    // TRANSICIONES (fundido a negro)
    // -----------------------------------------------------

    function transicion(callback) {
        if (fundidoDir === 1) return;
        fundidoCb = callback;
        fundidoDir = 1;
    }

    function irANivel(numero) {
        if (enTutorial) {
            jugador.vidas = vidasPorNivel();
            transicion(cargarTutorial);
            return;
        }
        if (!Number.isInteger(numero) || numero < 1 || numero > TOTAL_NIVELES) return;
        if (numero > nivelesDesbloqueados) {
            mostrarMensaje("NIVEL BLOQUEADO: SUPERA EL NIVEL ANTERIOR", 120);
            return;
        }
        const destino = CORE.niveles[numero - 1];
        const ecosistemaAnterior = ecosistemaActual();
        if (destino.etapa === 1 && (estado === "mapa" || estado === "derrota" || (estado === "victoria" && destino.ecosistema !== ecosistemaAnterior))) {
            retosEcosistemas[destino.ecosistema - 1] = nuevoRetoEcosistema();
        }

        // Cada nivel nuevo comienza con tres intentos. Reiniciar el nivel
        // durante la partida conserva los intentos que queden.
        if (
            estado === "inicio" || estado === "derrota" ||
            estado === "mapa" || estado === "victoria" || jugador.vidas <= 0
        ) {
            jugador.vidas = vidasPorNivel();
        }
        transicion(() => cargarNivel(numero));
    }

    function irAMapa() {
        if (enTutorial) {
            transicion(volverAlMenuPrincipal);
            return;
        }
        transicion(() => {
            estado = "mapa";
            mapaVista = "ecosistemas";
            seccionMapaActual = ecosistemaActual();
            pausado = false;
        });
    }

    // -----------------------------------------------------
    // GENERACIÓN DE NIVELES
    // -----------------------------------------------------

    function cargarNivel(numero) {
        nivelActual = limitar(numero, 1, TOTAL_NIVELES);
        // Cada nivel tiene una semilla propia. Al volver a entrar, el diseño
        // de plataformas, objetos, trampas y enemigos permanece igual.
        semillaNivel = (0xA341316C ^ (nivelActual * 0x9E3779B9)) >>> 0;
        const esNivelDeJefe = numero % NIVELES_POR_ECOSISTEMA === 0;
        // Recorridos más largos con crecimiento gradual entre etapas.
        longitudNivel = 5000 + etapaActual() * 430 + ecosistemaActual() * 100 + (esNivelDeJefe ? 1700 : 0);
        camaraX = 0;
        tiempo = 0;
        temblor = 0;
        congelar = 0;
        pausado = false;
        ventanaLogro = null;
        ventanaHistoria = null;
        estrellasUltimoNivel = 0;
        sinPerderVidaNivel = true;
        plataformaIgnorada = null;
        ignorarPlataformaHasta = 0;

        plataformas = [];
        monedas = [];
        diamantes = [];
        obstaculosSuelo = [];
        enemigos = [];
        proyectiles = [];
        disparosJugador = [];
        particulas = [];
        corazones = [];
        escudos = [];
        canones = [];
        nivelLlave = null;
        trampolines = [];
        plantas = [];
        rutasAlternativas = [];
        reliquiaSecreta = null;
        puntoControl = null;
        textosFlotantes = [];
        faunaAmbiental = [];
        jefe = null;

        jugador.x = 60;
        jugador.y = 350;
        jugador.vx = 0;
        jugador.vy = 0;
        jugador.saltosRestantes = 2;
        jugador.enSuelo = false;
        jugador.coyote = 0;
        jugador.buffer = 0;
        jugador.aplastar = 0;
        jugador.sobre = null;
        jugador.hielo = false;
        jugador.invulnerable = 90;
        jugador.disparoEspera = 0;
        jugador.monedas = 0;
        jugador.diamantes = 0;
        jugador.tieneLlave = false;
        jugador.escudo = 0;

        // Suelo dividido en segmentos con espacios pequeños.
        let x = 0;

        while (x < longitudNivel) {
            const anchoSuelo = entero(330, 480);

            plataformas.push({
                x,
                y: SUELO,
                ancho: Math.min(anchoSuelo, longitudNivel - x),
                alto: ALTO - SUELO,
                tipo: "suelo"
            });

            x += anchoSuelo;

            if (x < longitudNivel - 100) {
                x += entero(65, nivelActual >= 7 ? 125 : 105);
            }
        }

        // Plataformas elevadas: alturas alcanzables con doble salto.
        for (let px = 190; px < longitudNivel - 180; px += entero(280, 390)) {
            plataformas.push({
                x: px,
                y: entero(330, 375),
                ancho: entero(110, 165),
                alto: 18,
                tipo: "plataforma"
            });
        }

        // Atajo elevado oculto: la entrada cambia de tramo entre niveles.
        // La secuencia alterna altura y separaciones para exigir saltos medidos.
        const tramoDistribucion = ((nivelActual * 17) % 49) / 100;
        const inicioRuta = Math.round(longitudNivel * (0.22 + tramoDistribucion) + entero(-100, 100));
        const alturasRuta = [SUELO - 126, SUELO - 158, SUELO - 136, SUELO - 174, SUELO - 144];
        let avanceRuta = 0;
        for (let tramo = 0; tramo < alturasRuta.length; tramo++) {
            let px = inicioRuta + avanceRuta;
            for (let intento = 0; intento < 8; intento++) {
                const ocupado = plataformas.some(p => p.tipo !== "suelo" &&
                    px < p.x + p.ancho + 18 && px + 68 > p.x - 18);
                if (!ocupado) break;
                px += 14;
            }
            const plataformaRuta = {
                x: px,
                y: alturasRuta[tramo],
                ancho: 68,
                alto: 14,
                tipo: "ruta",
                rutaSecreta: true,
                descubierta: false
            };
            plataformas.push(plataformaRuta);
            rutasAlternativas.push(plataformaRuta);
            avanceRuta += entero(112, 128);
        }

        const suelosSeguros = plataformas.filter(
            p => p.tipo === "suelo" && p.ancho >= 150
        );

        // Buscar posiciones seguras sobre el suelo. Nunca devuelve puntos de la
        // zona de salida (donde aparece el jugador) para no colocar ahí peligros
        // ni objetos que se desperdician.
        const ZONA_SALIDA = 320;
        function posicionSegura(preferencia, ocupadas = [], separacion = 90) {
            const candidatos = [];

            for (const suelo of suelosSeguros) {
                const inicio = Math.max(suelo.x + 35, ZONA_SALIDA);
                const fin = suelo.x + suelo.ancho - 35;

                for (let px = inicio; px <= fin; px += 55) {
                    const cercaObstaculo = obstaculosSuelo.some(
                        p => Math.abs((p.x + p.ancho / 2) - px) < 75
                    );

                    const cercaObjeto = ocupadas.some(
                        ox => Math.abs(ox - px) < separacion
                    );

                    if (!cercaObstaculo && !cercaObjeto) {
                        candidatos.push(px);
                    }
                }
            }

            if (candidatos.length === 0) {
                for (const suelo of suelosSeguros) {
                    const px = suelo.x + suelo.ancho / 2;

                    if (
                        px >= ZONA_SALIDA &&
                        !ocupadas.some(ox => Math.abs(ox - px) < 35) &&
                        !obstaculosSuelo.some(p => Math.abs(p.x - px) < 50)
                    ) {
                        candidatos.push(px);
                    }
                }
            }

            if (candidatos.length === 0) {
                return limitar(preferencia, ZONA_SALIDA, longitudNivel - 60);
            }

            candidatos.sort(
                (a, b) =>
                    Math.abs(a - preferencia) - Math.abs(b - preferencia)
            );

            return candidatos[0];
        }

        // Obstáculos ambientales en algunos segmentos, sin cerrar la ruta.
        const fichaObstaculo = OBSTACULOS_SUELO[ecosistemaActual()] || OBSTACULOS_SUELO[1];
        for (const suelo of suelosSeguros) {
            if (suelo.x < 600 || aleatorio(0, 1) > 0.34) {
                continue;
            }

            const anchoObstaculo = entero(25, 55);
            const px = suelo.x + entero(70, Math.max(75, suelo.ancho - anchoObstaculo - 50));

            obstaculosSuelo.push({
                x: px,
                y: SUELO - 20,
                ancho: anchoObstaculo,
                alto: 20,
                ...fichaObstaculo
            });
        }

        // Objetos importantes primero para reservar sus posiciones.
        const posicionesUsadas = [];

        // Tres diamantes por nivel, ubicados en zonas seguras.
        const preferenciasDiamantes = [
            longitudNivel * 0.22,
            longitudNivel * 0.50,
            longitudNivel * 0.77
        ];

        for (const preferencia of preferenciasDiamantes) {
            const px = posicionSegura(preferencia, posicionesUsadas, 100);
            posicionesUsadas.push(px);

            diamantes.push({
                x: px - 10,
                y: SUELO - 35,
                ancho: 20,
                alto: 22,
                recogido: false
            });
        }

        // La llave se coloca en una zona accesible del último tercio.
        const posicionLlave = posicionSegura(
            longitudNivel * 0.80,
            posicionesUsadas,
            80
        );

        posicionesUsadas.push(posicionLlave);

        // Punto de control: se reserva antes que las recompensas para que
        // ningún corazón ni escudo quede encima de la baliza.
        const posicionPuntoControl = posicionSegura(longitudNivel * 0.5, posicionesUsadas, 150);
        posicionesUsadas.push(posicionPuntoControl);

        // ---- Recompensas defensivas: corazones (vidas) y escudos ----
        // Se reparten por igual entre el 22 % y el 92 % del recorrido jugable,
        // alternando corazón y escudo, para que la ayuda llegue con ritmo
        // constante y no se acumule en un mismo tramo. En niveles de jefe el
        // recorrido termina antes de la arena (que ya tiene su corazón).
        const escudosNivel = (MECANICAS[nivelActual] || {}).escudos || 0;
        const recorridoIni = 520;
        const recorridoFin = esNivelDeJefe ? longitudNivel - 640 - 160 : longitudNivel - 320;
        const tiposRecompensa = [];
        for (let c = 2, e = escudosNivel; c > 0 || e > 0;) {
            if (c > 0) { tiposRecompensa.push("corazon"); c--; }
            if (e > 0) { tiposRecompensa.push("escudo"); e--; }
        }
        tiposRecompensa.forEach((tipo, i) => {
            const fraccion = 0.22 + 0.70 * (i + 0.5) / tiposRecompensa.length;
            const preferencia = recorridoIni + (recorridoFin - recorridoIni) * fraccion;
            const px = posicionSegura(preferencia, posicionesUsadas, 140);
            posicionesUsadas.push(px);

            if (tipo === "corazon") {
                corazones.push({ x: px - 10, y: SUELO - 27, ancho: 20, alto: 20, recogido: false });
            } else {
                escudos.push({ x: px - 11, y: SUELO - 30, ancho: 22, alto: 22, recogido: false });
            }
        });

        for (const plataformaRuta of rutasAlternativas) {
            monedas.push({
                x: plataformaRuta.x + plataformaRuta.ancho / 2 - 9,
                y: plataformaRuta.y - 24,
                ancho: 18,
                alto: 18,
                recogida: false,
                rutaSecreta: true,
                plataformaRuta
            });
        }
        if (rutasAlternativas.length) {
            const plataformaTesoro = rutasAlternativas[rutasAlternativas.length - 1];
            reliquiaSecreta = {
                x: plataformaTesoro.x + plataformaTesoro.ancho / 2 - 12,
                y: plataformaTesoro.y - 58,
                ancho: 24,
                alto: 24,
                descubierta: false,
                recogida: false
            };
        }

        // La llave del nivel.
        nivelLlave = {
            x: posicionLlave - 10,
            y: SUELO - 27,
            ancho: 20,
            alto: 22,
            recogida: false
        };

        puntoControl = {
            x: posicionPuntoControl - 12,
            y: SUELO - 52,
            ancho: 24,
            alto: 52,
            spawnX: posicionPuntoControl - jugador.ancho / 2,
            spawnY: SUELO - jugador.alto,
            activo: false
        };

        // Enemigos terrestres y voladores.
        const cantidadEnemigos = Math.max(8, Math.floor(longitudNivel / 440));
        const catalogoEspecies = ESPECIES_ENEMIGAS[ecosistemaActual()] || ESPECIES_ENEMIGAS[1];
        // Alterna el orden entre etapas para que cada mapa conserve variedad
        // sin cambiar las especies al reiniciar el mismo nivel.
        let indiceEspecieSuelo = nivelActual - 1;
        let indiceEspecieAire = nivelActual - 1;

        for (let i = 0; i < cantidadEnemigos; i++) {
            const preferencia = longitudNivel * (0.13 + ((i + 0.5) / cantidadEnemigos) * 0.74);

            const px = posicionSegura(preferencia, posicionesUsadas, 110);
            posicionesUsadas.push(px);

            const volador = nivelActual >= 4 && (i % 4 === 3);
            const listaEspecies = volador ? catalogoEspecies.aire : catalogoEspecies.suelo;
            const fichaEspecie = volador
                ? listaEspecies[indiceEspecieAire++ % listaEspecies.length]
                : listaEspecies[indiceEspecieSuelo++ % listaEspecies.length];
            const sueloEnemigo = suelosSeguros.find(
                suelo => px >= suelo.x + 5 && px + 30 <= suelo.x + suelo.ancho - 5
            ) || suelosSeguros.reduce((mejor, suelo) => {
                const centro = suelo.x + suelo.ancho / 2;
                const centroMejor = mejor.x + mejor.ancho / 2;
                return Math.abs(centro - px) < Math.abs(centroMejor - px) ? suelo : mejor;
            }, suelosSeguros[0]);
            const inicioPatrulla = sueloEnemigo
                ? sueloEnemigo.x + 5
                : Math.max(0, px - 35);
            const finPatrulla = sueloEnemigo
                ? sueloEnemigo.x + sueloEnemigo.ancho - 35
                : Math.min(longitudNivel - 30, px + 35);
            const patron = i % 3;
            const comportamiento = COMPORTAMIENTOS_ESPECIE[fichaEspecie[0]] || fichaEspecie[4];
            const velocidadEnemigo = (1 + Math.min(nivelActual, 10) * 0.08 + Math.floor((nivelActual - 1) / 10) * 0.04) * (patron === 2 ? 1.28 : 1) * (comportamiento === "corredor" ? 1.18 : 1) * dificultadActual().velocidadEnemigos;

            enemigos.push({
                x: limitar(px, inicioPatrulla, Math.max(inicioPatrulla, finPatrulla)),
                y: volador ? 240 + (i % 3) * 16 : SUELO - 30,
                ancho: 30,
                alto: 30,
                vx: i % 2 === 0 ? -velocidadEnemigo : velocidadEnemigo,
                velocidadBase: velocidadEnemigo,
                vy: 0,
                vida: 1,
                volador,
                nombreEspecie: fichaEspecie[0],
                claseEspecie: fichaEspecie[1],
                colorEspecie: fichaEspecie[2],
                colorDetalle: fichaEspecie[3],
                comportamientoEspecie: comportamiento,
                patron,
                fase: (i * 47) % 120,
                yBase: volador ? 240 + (i % 3) * 16 : SUELO - 30,
                estadoAtaque: "patrulla",
                ataqueTemporizador: 45 + (i * 37) % 70,
                direccionAtaque: 0,
                mirada: i % 2 === 0 ? -1 : 1,
                vivo: true,
                limiteIzq: inicioPatrulla,
                limiteDer: Math.max(inicioPatrulla + 30, finPatrulla + 30)
            });
        }

        // Cañones que disparan en niveles posteriores.
        if (nivelActual >= 2) {
            const cantidadCanones = 1 + Math.min(4, Math.floor(nivelActual / NIVELES_POR_ECOSISTEMA));
            for (let i = 0; i < cantidadCanones; i++) {
                const preferenciaCanon = longitudNivel * (0.22 + ((i + 0.5) / cantidadCanones) * 0.56);
                const sueloCanon = suelosSeguros
                    .filter(suelo => suelo.x > 180 && suelo.ancho >= 100)
                    .reduce((mejor, suelo) => {
                        if (!mejor) return suelo;
                        const distancia = Math.abs(suelo.x + suelo.ancho / 2 - preferenciaCanon);
                        const distanciaMejor = Math.abs(mejor.x + mejor.ancho / 2 - preferenciaCanon);
                        return distancia < distanciaMejor ? suelo : mejor;
                    }, null);

                if (!sueloCanon) continue;
                const px = limitar(
                    sueloCanon.x + sueloCanon.ancho / 2 - 16,
                    sueloCanon.x + 4,
                    sueloCanon.x + sueloCanon.ancho - 36
                );
                // Separar los cañones de obstáculos, criaturas y objetos para que
                // cada peligro se pueda leer y esquivar como un encuentro propio.
                const cercaDeObstaculo = obstaculosSuelo.some(obstaculo => px < obstaculo.x + obstaculo.ancho + 12 && px + 32 > obstaculo.x - 12);
                const cercaDeEnemigo = enemigos.some(enemigo => Math.abs(enemigo.x + enemigo.ancho / 2 - (px + 16)) < 100);
                const cercaDeObjeto = posicionesUsadas.some(posicion => Math.abs(posicion - (px + 16)) < 82);
                if (cercaDeObstaculo || cercaDeEnemigo || cercaDeObjeto) {
                    continue;
                }

                canones.push({
                    x: px,
                    y: SUELO - 38,
                    ancho: 32,
                    alto: 38,
                    espera: 110 + i * 23 + Math.min(nivelActual, 20) * 3
                });
            }
        }

        // Cada quinto nivel cierra el ecosistema con un jefe.
        if (esNivelJefe()) {
            jefe = {
                x: longitudNivel - 280,
                y: SUELO - 90,
                ancho: 70,
                alto: 90,
                vida: dificultadActual().vidaJefe,
                vidaMaxima: dificultadActual().vidaJefe,
                especie: (ESPECIES_ENEMIGAS[ecosistemaActual()] || ESPECIES_ENEMIGAS[1]).suelo[0],
                ataque: ATAQUES_JEFE[ecosistemaActual() - 1] || ATAQUES_JEFE[0],
                yBase: SUELO - 90,
                fase: ecosistemaActual() * 13,
                vx: -1.6,
                cargando: 0,
                direccionCarga: -1,
                espera: 100,
                golpe: 0,
                enfurecido: false,
                anunciado: false,
                vivo: true
            };
        }

        // ---- Mecánicas especiales del mundo ----
        // (se generan al final y sin usar la semilla, así el resto del
        // nivel queda exactamente igual que antes)
        const mec = MECANICAS[nivelActual] || {};

        // Reparte "cantidad" posiciones a lo largo del nivel.
        const repartir = (cantidad, inicio, fin, desplazamiento) => {
            const lista = [];
            for (let k = 0; k < cantidad; k++) {
                lista.push(
                    longitudNivel *
                    (inicio + (fin - inicio) * (k + desplazamiento) / Math.max(1, cantidad))
                );
            }
            return lista;
        };

        // Trampolines, con monedas de premio en el aire.
        for (const pref of repartir(mec.trampolines || 0, 0.2, 0.75, 0.3)) {
            // Cada muelle precede una barrera alta, con un corredor despejado
            // para despegar, pasar por encima y aterrizar al otro lado.
            const distanciaBarrera = 112;
            const anchoBarrera = 44;
            const altoBarrera = 240;
            const candidatosTrampolin = suelosSeguros.flatMap(suelo => {
                const candidatos = [];
                for (let candidato = suelo.x + 45; candidato <= suelo.x + suelo.ancho - distanciaBarrera - anchoBarrera - 28; candidato += 35) {
                    const finCorredor = candidato + distanciaBarrera + anchoBarrera + 32;
                    const bloqueado = plataformas.some(p => p.tipo !== "suelo" &&
                        p.x < finCorredor && p.x + p.ancho > candidato - 42 &&
                        p.y >= SUELO - 280 && p.y < SUELO - 24);
                    const ocupado = posicionesUsadas.some(ox => ox > candidato - 90 && ox < finCorredor + 20) ||
                        obstaculosSuelo.some(o => o.x < finCorredor && o.x + o.ancho > candidato - 35) ||
                        enemigos.some(e => e.x < finCorredor && e.x + e.ancho > candidato - 35) ||
                        canones.some(c => c.x < finCorredor && c.x + c.ancho > candidato - 35);
                    if (!bloqueado && !ocupado) candidatos.push(candidato);
                }
                return candidatos;
            });
            if (!candidatosTrampolin.length) continue;
            candidatosTrampolin.sort((a, b) => Math.abs(a - pref) - Math.abs(b - pref));
            const px = candidatosTrampolin[0];
            posicionesUsadas.push(px);

            trampolines.push({
                x: px - 17,
                y: SUELO - 14,
                ancho: 34,
                alto: 14,
                comp: 0,
                salidaX: px + distanciaBarrera,
                color: (ESPECIES_ENEMIGAS[ecosistemaActual()] || ESPECIES_ENEMIGAS[1]).suelo[0][2]
            });

            // Recompensas en arco: la primera guía el ascenso y las siguientes
            // marcan el paso seguro sobre la barrera y la salida del salto.
            const monedasImpulso = [
                { dx: 30, y: SUELO - 170 },
                { dx: 100, y: SUELO - 290 },
                { dx: 174, y: SUELO - 280 }
            ];
            for (const moneda of monedasImpulso) {
                monedas.push({
                    x: px + moneda.dx - 9,
                    y: moneda.y - 9,
                    ancho: 18,
                    alto: 18,
                    recogida: false
                });
            }

            obstaculosSuelo.push({
                x: px + distanciaBarrera,
                y: SUELO - altoBarrera,
                ancho: anchoBarrera,
                alto: altoBarrera,
                ...fichaObstaculo,
                impulso: true
            });
        }

        // Peligros vegetales propios de cada ecosistema.
        const floraNivel = PELIGROS_BIOLOGICOS[ecosistemaActual()] || PELIGROS_BIOLOGICOS[1];
        for (const pref of repartir(mec.plantas || 0, 0.3, 0.8, 0.6)) {
            const px = posicionSegura(pref, posicionesUsadas, 90);
            posicionesUsadas.push(px);

            plantas.push({
                x: px - 17,
                ancho: 34,
                ...floraNivel,
                fase: (plantas.length * 67) % 200,
                altura: 0,
                vida: 3,
                golpe: 0,
                vivo: true
            });
        }

        // Plataformas frágiles: se caen unos instantes después de pisarlas.
        const elevadas = plataformas.filter(p => p.tipo === "plataforma");
        const cantidadCaen = Math.min(mec.caen || 0, elevadas.length);

        for (let k = 0; k < cantidadCaen; k++) {
            const p = elevadas[Math.floor((k + 0.5) * elevadas.length / cantidadCaen)];

            p.cae = true;
            p.y0 = p.y;
            p.temblando = 0;
            p.cayendo = false;
            p.vyc = 0;
            p.activa = true;
            p.reaparece = 0;

            // Moneda de premio sobre la plataforma frágil.
            monedas.push({
                x: p.x + p.ancho / 2 - 9,
                y: p.y - 30,
                ancho: 18,
                alto: 18,
                recogida: false
            });
        }

        // Arena del jefe: zona despejada y plana, sin enemigos ni obstáculos.
        if (esNivelJefe()) {
            const arenaX = longitudNivel - 640;

            enemigos = enemigos.filter(e => e.x + e.ancho < arenaX);
            obstaculosSuelo = obstaculosSuelo.filter(p => p.x + p.ancho < arenaX);
            canones = canones.filter(c => c.x + c.ancho < arenaX);
            plantas = plantas.filter(pl => pl.x + pl.ancho < arenaX);
            trampolines = trampolines.filter(t => t.x + t.ancho < arenaX);
            escudos = escudos.filter(e => e.x + e.ancho < arenaX);

            // Fuera plataformas elevadas y suelo (con sus cráteres) de la arena.
            plataformas = plataformas.filter(
                p => p.tipo === "suelo" || p.x + p.ancho < arenaX
            );

            plataformas = plataformas
                .filter(p => p.tipo !== "suelo" || p.x < arenaX)
                .map(p => {
                    if (p.tipo === "suelo" && p.x + p.ancho > arenaX) {
                        p.ancho = arenaX - p.x;
                    }
                    return p;
                });

            // Suelo continuo y plano para pelear.
            plataformas.push({
                x: arenaX,
                y: SUELO,
                ancho: longitudNivel - arenaX,
                alto: ALTO - SUELO,
                tipo: "suelo"
            });

            // Plataformas de evasión para la pelea final: dos laterales para
            // esquivar las embestidas y una central elevada para reposicionarse.
            plataformas.push(
                { x: arenaX + 75, y: 330, ancho: 132, alto: 18, tipo: "plataforma" },
                { x: arenaX + 255, y: 285, ancho: 132, alto: 18, tipo: "plataforma" },
                { x: arenaX + 435, y: 330, ancho: 125, alto: 18, tipo: "plataforma" }
            );

            // Un corazón a la entrada de la arena.
            corazones.push({
                x: arenaX + 40,
                y: SUELO - 27,
                ancho: 20,
                alto: 20,
                recogido: false
            });
        }

        // ---- Monedas: racimos repartidos de forma pareja ----
        // Un racimo de 3 monedas cada ~640 px. El patrón rota entre línea en
        // el suelo, línea sobre una plataforma y arco sobre un hueco u
        // obstáculo (el arco premia el salto). Se colocan al final, cuando ya
        // se conocen todos los peligros, y no compiten con ellos por el suelo.
        {
            const inicioMon = 380;
            const finMon = esNivelDeJefe ? longitudNivel - 640 - 120 : longitudNivel - 240;
            const racimos = Math.max(5, Math.round((finMon - inicioMon) / 640));
            const paso = (finMon - inicioMon) / racimos;
            // Cuánto puede alejarse un racimo de su punto ideal. Se mantiene corto
            // para que nunca quede un tramo largo sin monedas.
            const DESPLAZ = 100;

            const tramosSuelo = plataformas
                .filter(p => p.tipo === "suelo")
                .sort((a, b) => a.x - b.x);
            const hayDeSuelo = x => tramosSuelo.some(t => x >= t.x + 8 && x <= t.x + t.ancho - 8);
            const huecos = [];
            for (let i = 1; i < tramosSuelo.length; i++) {
                const borde = tramosSuelo[i - 1].x + tramosSuelo[i - 1].ancho;
                const ancho = tramosSuelo[i].x - borde;
                if (ancho >= 40) huecos.push({ x: borde + ancho / 2 });
            }
            const rangosPeligro = [...obstaculosSuelo, ...plantas, ...canones, ...trampolines]
                .map(o => [o.x, o.x + o.ancho]);
            const objetosFijos = [...diamantes, ...corazones, ...escudos, nivelLlave, puntoControl]
                .filter(Boolean);
            const usados = new Set();

            const libre = (cx, cy) =>
                !monedas.some(m => Math.abs(m.x + 9 - cx) < 26 && Math.abs(m.y + 9 - cy) < 26) &&
                !objetosFijos.some(o => cx + 9 > o.x - 12 && cx - 9 < o.x + o.ancho + 12 &&
                    cy + 9 > o.y - 12 && cy - 9 < o.y + o.alto + 12);
            const poner = (cx, cy) => {
                if (libre(cx, cy)) monedas.push({ x: cx - 9, y: cy - 9, ancho: 18, alto: 18, recogida: false });
            };
            const masCercano = (lista, centro, maxDist, x = o => o.x) => lista
                .filter(o => !usados.has(o) && Math.abs(x(o) - centro) <= maxDist)
                .sort((a, b) => Math.abs(x(a) - centro) - Math.abs(x(b) - centro))[0];

            const patrones = {
                suelo(centro) {
                    for (let d = 0; d <= DESPLAZ; d += 25) {
                        for (const signo of d === 0 ? [1] : [1, -1]) {
                            const cx = centro + d * signo;
                            if (cx < inicioMon || cx > finMon) continue;
                            if (![cx - 34, cx, cx + 34].every(hayDeSuelo)) continue;
                            if (rangosPeligro.some(([a, b]) => b > cx - 46 && a < cx + 46)) continue;
                            // Lejos de diamantes, llave, corazones y escudos: así el racimo sale completo.
                            if (objetosFijos.some(o => o.x + o.ancho > cx - 60 && o.x < cx + 60)) continue;
                            for (const dx of [-34, 0, 34]) poner(cx + dx, SUELO - 24);
                            return true;
                        }
                    }
                    return false;
                },
                plataforma(centro) {
                    const elevadas = plataformas.filter(p => p.tipo === "plataforma" && !p.cae);
                    const p = masCercano(elevadas, centro, DESPLAZ + 40, o => o.x + o.ancho / 2);
                    if (!p) return false;
                    usados.add(p);
                    const cx = p.x + p.ancho / 2;
                    for (const dx of [-34, 0, 34]) poner(cx + dx, p.y - 26);
                    return true;
                },
                arco(centro) {
                    const candidatos = [
                        // Sobre un hueco la trayectoria del salto sube: las monedas la siguen.
                        ...huecos.map(h => ({ ref: h, cx: h.x, alturas: [70, 118, 140] })),
                        // Sobre un obstáculo el salto hace un arco corto y simétrico.
                        ...obstaculosSuelo.map(o => ({ ref: o, cx: o.x + o.ancho / 2, alturas: [80, 112, 80] }))
                    ].filter(c => !usados.has(c.ref) && Math.abs(c.cx - centro) <= DESPLAZ + 40 &&
                        c.cx >= inicioMon && c.cx <= finMon)
                        .sort((a, b) => Math.abs(a.cx - centro) - Math.abs(b.cx - centro));
                    const c = candidatos[0];
                    if (!c) return false;
                    usados.add(c.ref);
                    [-44, 0, 44].forEach((dx, i) => poner(c.cx + dx, SUELO - c.alturas[i]));
                    return true;
                },
                // Último recurso: línea flotante a media altura, alcanzable con un salto.
                aire(centro) {
                    for (const dx of [-34, 0, 34]) poner(centro + dx, SUELO - 84);
                    return true;
                }
            };

            const orden = ["suelo", "plataforma", "arco", "aire"];
            for (let k = 0; k < racimos; k++) {
                const centro = inicioMon + (k + 0.5) * paso;
                // El patrón rota entre los tres naturales; "aire" solo entra si fallan.
                const primero = (k + nivelActual) % 3;
                for (let intento = 0; intento < 3; intento++) {
                    if (patrones[orden[(primero + intento) % 3]](centro)) break;
                    if (intento === 2) patrones.aire(centro);
                }
            }
        }

        // Suelo seguro junto a la meta: solo rellena lo que no tenga suelo en
        // los últimos 130 px, sin tapar los cráteres anteriores.
        let cursorMeta = longitudNivel - 130;

        for (const tramo of plataformas
            .filter(p => p.tipo === "suelo")
            .sort((a, b) => a.x - b.x)) {
            if (tramo.x + tramo.ancho <= cursorMeta) continue;

            if (tramo.x > cursorMeta) {
                plataformas.push({
                    x: cursorMeta,
                    y: SUELO,
                    ancho: tramo.x - cursorMeta,
                    alto: ALTO - SUELO,
                    tipo: "suelo"
                });
            }

            cursorMeta = Math.max(cursorMeta, tramo.x + tramo.ancho);
        }

        if (cursorMeta < longitudNivel) {
            plataformas.push({
                x: cursorMeta,
                y: SUELO,
                ancho: longitudNivel - cursorMeta,
                alto: ALTO - SUELO,
                tipo: "suelo"
            });
        }

        // Mundos de hielo: todo el suelo resbala.
        if (mec.hielo) {
            for (const p of plataformas) {
                if (p.tipo === "suelo") p.hielo = true;
            }
        }

        crearFaunaAmbiental();
        estado = "jugando";
        mostrarMensaje(`NIVEL ${nivelActual}: ${NOMBRES[nivelActual - 1]}`, 130);
        const eco = ecosistemaActual();
        if (!enTutorial && etapaActual() === 1 && !iniciosHistoriaVistos.includes(eco)) {
            ventanaHistoria = { tipo: "inicio", ecosistema: eco };
            pausado = true;
        }
    }

    // -----------------------------------------------------
    // NIVEL TUTORIAL
    // Recorrido hecho a mano que enseña cada mecánica con carteles. No
    // modifica el progreso, la puntuación ni los logros de la partida.
    // -----------------------------------------------------

    const LONGITUD_TUTORIAL = 6500;

    function iniciarTutorial() {
        if (!enTutorial) {
            nivelAntesTutorial = nivelActual;
            puntuacionAntesTutorial = puntuacion;
        }
        jugador.vidas = vidasPorNivel();
        transicion(cargarTutorial);
    }

    function restaurarTrasTutorial() {
        enTutorial = false;
        nivelActual = nivelAntesTutorial;
        puntuacion = puntuacionAntesTutorial;
        puntosMostrados = puntuacion;
        tutorialCarteles = [];
    }

    function completarTutorial() {
        estado = "victoria";
        sonido("victoria");
        tutorialCompletado = true;
        try { localStorage.setItem(CLAVE_TUTORIAL, "1"); } catch (error) { /* almacenamiento opcional */ }
        crearParticulas(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2, "#ffd34f", 30);
    }

    function cargarTutorial() {
        enTutorial = true;
        cargarNivel(1);
        nivelActual = 1;
        longitudNivel = LONGITUD_TUTORIAL;
        jugador.vidas = vidasPorNivel();
        tutorialRespawnX = 60;
        plataformas = [];
        monedas = [];
        diamantes = [];
        obstaculosSuelo = [];
        enemigos = [];
        corazones = [];
        escudos = [];
        canones = [];
        trampolines = [];
        plantas = [];
        rutasAlternativas = [];
        reliquiaSecreta = null;
        jefe = null;

        const tecla = accion => etiquetaTecla(opciones.bindings[accion]);
        tutorialCarteles = [
            { x: 110, titulo: "MOVERSE", texto: () => `Usa ${tecla("izquierda")} y ${tecla("derecha")} (o A y D) para caminar. La salida de cada nivel está siempre a la derecha.` },
            { x: 380, titulo: "SALTAR", texto: () => `Pulsa ${tecla("saltar")} (o W / ↑) para saltar. Mantén la tecla para saltar más alto y púlsala otra vez en el aire para un DOBLE SALTO.` },
            { x: 630, titulo: "HUECOS", texto: () => "Caer al vacío cuesta una vida. Toma carrerilla y salta antes del borde. En este tutorial reaparecerás en el último cartel." },
            { x: 1000, titulo: "PLATAFORMAS Y DIAMANTES", texto: () => "Las plataformas se atraviesan desde abajo y con ↓ / S bajas de ellas. El DIAMANTE brillante es obligatorio: hay 3 en cada nivel." },
            { x: 1500, titulo: "MONEDAS", texto: () => "Las monedas dan puntos y se acercan a ti como un imán. Si recoges todas las de un nivel ganas una ESTRELLA extra." },
            { x: 1950, titulo: "ENEMIGOS", texto: () => "Si los tocas de lado pierdes una vida. Salta y cae ENCIMA de ellos para derrotarlos (+100 puntos)." },
            { x: 2550, titulo: "DISPARAR", texto: () => `Pulsa ${tecla("disparar")} para disparar. Sirve contra enemigos voladores, plantas y jefes. Abate al ave que patrulla más adelante.` },
            { x: 3100, titulo: "OBSTÁCULOS Y PLANTAS", texto: () => `Salta los obstáculos del suelo. Las plantas pinchan al tocarlas, pero puedes dañarlas disparando (${tecla("disparar")}).` },
            { x: 3700, titulo: "ESCUDOS Y CORAZONES", texto: () => "El ESCUDO te protege del daño durante 8 segundos. El CORAZÓN te devuelve una vida; si ya las tienes todas, da puntos." },
            { x: 4000, titulo: "CAÑONES", texto: () => "Los cañones disparan hacia ti. Una luz naranja avisa justo antes del disparo: salta el proyectil o aléjate." },
            { x: 4240, titulo: "PLATAFORMAS FRÁGILES", texto: () => "Las plataformas que tiemblan se caen poco después de pisarlas y vuelven a aparecer. Cruza sin detenerte." },
            { x: 4630, titulo: "PUNTO DE CONTROL", texto: () => "Toca la baliza para activarla. En los niveles normales, si pierdes una vida reaparecerás aquí y no al inicio." },
            { x: 4880, titulo: "TRAMPOLÍN", texto: () => "Písalo incluso caminando. Mantén salto y avanza para pasar la barrera alta; sigue las monedas para recoger el diamante." },
            { x: 5190, titulo: "HIELO", texto: () => "En los mundos de hielo el suelo resbala: cuesta frenar y girar. Suelta la tecla con antelación." },
            { x: 6000, titulo: "LLAVE", texto: () => "Cada nivel esconde una LLAVE. Sin ella y sin los 3 diamantes no puedes terminar. La flecha del borde de la pantalla te indica dónde está." },
            { x: 6250, titulo: "SALIDA", texto: () => "Con 3 diamantes y la llave, la bandera se pone verde: ¡llega a ella! Al final de cada ecosistema te espera un JEFE; algunas plataformas ocultas guardan tesoros." }
        ];

        // Suelo por tramos: huecos, un tramo de hielo y la zona final.
        const tramos = [[0, 760], [850, 4300], [4580, 5250], [5250, 5900, true], [5900, LONGITUD_TUTORIAL]];
        for (const [inicio, fin, hielo] of tramos) {
            plataformas.push({ x: inicio, y: SUELO, ancho: fin - inicio, alto: ALTO - SUELO, tipo: "suelo", ...(hielo ? { hielo: true } : {}) });
        }
        plataformas.push({ x: 1130, y: 350, ancho: 170, alto: 18, tipo: "plataforma" });
        for (const px of [4330, 4460]) {
            plataformas.push({ x: px, y: 370, ancho: 110, alto: 18, tipo: "plataforma", cae: true, y0: 370, temblando: 0, cayendo: false, vyc: 0, activa: true, reaparece: 0 });
            monedas.push({ x: px + 46, y: 340, ancho: 18, alto: 18, recogida: false });
        }

        // Objetos.
        const nuevoDiamante = (cx, y) => diamantes.push({ x: cx - 10, y, ancho: 20, alto: 22, recogido: false });
        nuevoDiamante(1215, 318);
        nuevoDiamante(5020, SUELO - 215);
        nuevoDiamante(5780, SUELO - 35);
        for (let i = 0; i < 6; i++) {
            monedas.push({ x: 1580 + i * 55 - 9, y: SUELO - 22, ancho: 18, alto: 18, recogida: false });
        }
        monedas.push({ x: 5050 - 9, y: SUELO - 170 - 9, ancho: 18, alto: 18, recogida: false });
        monedas.push({ x: 5120 - 9, y: SUELO - 290 - 9, ancho: 18, alto: 18, recogida: false });
        monedas.push({ x: 5194 - 9, y: SUELO - 280 - 9, ancho: 18, alto: 18, recogida: false });
        escudos.push({ x: 3800 - 11, y: SUELO - 30, ancho: 22, alto: 22, recogido: false });
        corazones.push({ x: 3900 - 10, y: SUELO - 27, ancho: 20, alto: 20, recogido: false });
        nivelLlave = { x: 6080 - 10, y: SUELO - 27, ancho: 20, alto: 22, recogida: false };
        puntoControl = { x: 4720 - 12, y: SUELO - 52, ancho: 24, alto: 52, spawnX: 4720 - 14, spawnY: SUELO - jugador.alto, activo: false };
        trampolines.push({ x: 5020 - 17, y: SUELO - 14, ancho: 34, alto: 14, comp: 0, salidaX: 5132, color: ESPECIES_ENEMIGAS[1].suelo[0][2] });

        // Peligros.
        obstaculosSuelo.push({ x: 3250, y: SUELO - 20, ancho: 40, alto: 20, ...(OBSTACULOS_SUELO[1] || {}) });
        obstaculosSuelo.push({ x: 5132, y: SUELO - 240, ancho: 44, alto: 240, ...(OBSTACULOS_SUELO[1] || {}), impulso: true });
        plantas.push({ x: 3483, ancho: 34, ...PELIGROS_BIOLOGICOS[1], fase: 0, altura: 0, vida: 3, golpe: 0, vivo: true });
        canones.push({ x: 4130, y: SUELO - 38, ancho: 32, alto: 38, espera: 150 });

        const nuevoEnemigo = (ficha, px, py, volador, izquierda, derecha) => enemigos.push({
            x: px, y: py, ancho: 30, alto: 30, vx: -1, velocidadBase: 1, vy: 0, vida: 1, volador,
            nombreEspecie: ficha[0], claseEspecie: ficha[1], colorEspecie: ficha[2], colorDetalle: ficha[3],
            comportamientoEspecie: COMPORTAMIENTOS_ESPECIE[ficha[0]] || ficha[4],
            patron: 0, fase: 0, yBase: py, estadoAtaque: "patrulla", ataqueTemporizador: 9999,
            direccionAtaque: 0, mirada: -1, vivo: true, limiteIzq: izquierda, limiteDer: derecha
        });
        nuevoEnemigo(ESPECIES_ENEMIGAS[1].suelo[0], 2300, SUELO - 30, false, 2150, 2480);
        nuevoEnemigo(ESPECIES_ENEMIGAS[1].aire[0], 2850, 250, true, 2700, 3030);

        crearFaunaAmbiental();
        mostrarMensaje("TUTORIAL: ¡APRENDE A JUGAR!", 160);
    }

    function actualizarTutorial() {
        for (const cartel of tutorialCarteles) {
            if (jugador.x >= cartel.x - 14 && cartel.x - 14 > tutorialRespawnX) tutorialRespawnX = cartel.x - 14;
        }
        if (puntoControl && puntoControl.activo) {
            tutorialRespawnX = Math.max(tutorialRespawnX, puntoControl.spawnX);
        }
    }

    function cartelTutorialActual() {
        const centro = jugador.x + jugador.ancho / 2;
        let mejor = null;
        let mejorDistancia = 230;
        for (const cartel of tutorialCarteles) {
            const distancia = Math.abs(centro - cartel.x);
            if (distancia < mejorDistancia) {
                mejor = cartel;
                mejorDistancia = distancia;
            }
        }
        return mejor;
    }

    function ajustarTextoTutorial(texto, anchoMaximo) {
        const palabras = texto.split(" ");
        const lineas = [];
        let actual = "";
        for (const palabra of palabras) {
            const prueba = actual ? `${actual} ${palabra}` : palabra;
            if (actual && ctx.measureText(prueba).width > anchoMaximo) {
                lineas.push(actual);
                actual = palabra;
            } else {
                actual = prueba;
            }
        }
        if (actual) lineas.push(actual);
        return lineas;
    }

    function dibujarCartelesTutorial() {
        if (!enTutorial) return;
        const activo = cartelTutorialActual();
        for (const cartel of tutorialCarteles) {
            const x = cartel.x - camaraX;
            if (x < -40 || x > ANCHO + 40) continue;
            rectangulo(x - 2, SUELO - 44, 5, 44, "#6b4a2f");
            rectangulo(x - 20, SUELO - 74, 40, 30, cartel === activo ? "#e8c070" : "#b98a4e");
            rectangulo(x - 20, SUELO - 74, 40, 3, "#7a5530");
            textoCentrado("?", x, SUELO - 51, 20, "#3a2511");
        }
    }

    function dibujarPanelTutorial() {
        if (!enTutorial || estado !== "jugando") return;
        const cartel = cartelTutorialActual();
        if (!cartel) return;
        ctx.save();
        ctx.font = "13px monospace";
        ctx.textAlign = "left";
        const lineas = ajustarTextoTutorial(cartel.texto(), 580);
        const ancho = 620;
        const alto = 36 + lineas.length * 18;
        const x = (ANCHO - ancho) / 2;
        const y = 122;
        ctx.fillStyle = "rgba(7, 12, 27, 0.9)";
        ctx.fillRect(x, y, ancho, alto);
        ctx.strokeStyle = "#ffe16b";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, ancho, alto);
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#ffe16b";
        ctx.fillText(cartel.titulo, x + 16, y + 22);
        ctx.textAlign = "right";
        ctx.fillStyle = "#9fb3c9";
        ctx.fillText(`${tutorialCarteles.indexOf(cartel) + 1}/${tutorialCarteles.length}`, x + ancho - 16, y + 22);
        ctx.textAlign = "left";
        ctx.font = "13px monospace";
        ctx.fillStyle = "#e8f4ff";
        lineas.forEach((linea, i) => ctx.fillText(linea, x + 16, y + 44 + i * 18));
        ctx.restore();
    }

    // -----------------------------------------------------
    // MOVIMIENTO DEL JUGADOR
    // -----------------------------------------------------

    // Intenta ejecutar un salto. Devuelve true si saltó.
    function intentarSalto() {
        if (jugador.coyote > 0) {
            // Salto desde el suelo (o recién salido del borde).
            jugador.vy = jugador.fuerzaSalto;
            jugador.saltosRestantes = 1;
            jugador.coyote = 0;
            jugador.enSuelo = false;
        } else if (jugador.saltosRestantes > 0) {
            // Doble salto en el aire.
            jugador.vy = jugador.fuerzaSalto;
            jugador.saltosRestantes--;
        } else {
            return false;
        }

        sonido("salto");
        crearParticulas(
            jugador.x + jugador.ancho / 2,
            jugador.y + jugador.alto,
            "#73e7ff",
            5
        );
        return true;
    }

    function saltar() {
        if (estado !== "jugando" || pausado) return;
        // Se recuerda el salto unos fotogramas (buffer).
        jugador.buffer = 7;
    }

    function disparar() {
        if (estado !== "jugando" || pausado || jugador.disparoEspera > 0) {
            return;
        }

        const origenX = jugador.x + jugador.ancho / 2 - 7;
        const origenY = jugador.y + jugador.alto / 2 - 3;
        const objetivo = enemigos
            .filter(enemigo => enemigo.vivo)
            .map(enemigo => {
                const distancia = Math.hypot(
                    enemigo.x + enemigo.ancho / 2 - origenX,
                    enemigo.y + enemigo.alto / 2 - origenY
                );
                return { enemigo, distancia };
            })
            .filter(candidato => candidato.distancia <= 900)
            .sort((a, b) => a.distancia - b.distancia)[0];
        let vx = jugador.mirando * 8;
        let vy = 0;
        if (objetivo) {
            vx = (objetivo.enemigo.x + objetivo.enemigo.ancho / 2 - origenX) / objetivo.distancia * 8;
            vy = (objetivo.enemigo.y + objetivo.enemigo.alto / 2 - origenY) / objetivo.distancia * 8;
        }

        disparosJugador.push({
            x: origenX,
            y: origenY,
            ancho: 14,
            alto: 6,
            vx,
            vy,
            vida: 120,
            objetivo: objetivo?.enemigo || null
        });

        jugador.disparoEspera = 18;
        sonido("disparo");
    }

    function actualizarJugador() {
        // Si va sobre una plataforma móvil, se mueve con ella.
        const apoyo = jugador.sobre;
        if (apoyo && apoyo.dx) {
            jugador.x += apoyo.dx;
        }
        if (apoyo && apoyo.dy) jugador.y += apoyo.dy;
        const bajarDePlataforma = teclas.arrowdown || teclas.s;
        if (bajarDePlataforma && apoyo && apoyo.tipo !== "suelo") {
            plataformaIgnorada = apoyo;
            ignorarPlataformaHasta = tiempo + 20;
            jugador.y += 3;
            jugador.vy = 2;
            jugador.enSuelo = false;
            jugador.saltosRestantes = 2;
        }
        jugador.sobre = null;

        // En el hielo se acelera poco y se frena mucho menos.
        const hielo = jugador.enSuelo && jugador.hielo;
        jugador.hielo = false;

        // Movimiento horizontal con aceleración y fricción.
        const dir =
            (teclas.derecha ? 1 : 0) -
            (teclas.izquierda ? 1 : 0);

        if (dir !== 0) {
            const aceleracion = hielo ? 0.2 : jugador.aceleracion;
            jugador.vx += dir * aceleracion * (jugador.enSuelo ? 1 : 0.8);
            jugador.mirando = dir;
        } else {
            const friccion = hielo ? 0.975 : jugador.friccion;
            jugador.vx *= jugador.enSuelo ? friccion : 0.92;
            if (Math.abs(jugador.vx) < 0.1) jugador.vx = 0;
        }

        jugador.vx = limitar(jugador.vx, -jugador.velocidad, jugador.velocidad);

        jugador.x += jugador.vx;
        jugador.x = limitar(jugador.x, 0, longitudNivel - jugador.ancho);
        // Al cruzar la entrada de la arena, impide regresar al pasillo.
        // La barrera permanece cerrada tras derrotar al jefe.
        if (jefe && jefe.anunciado) {
            jugador.x = Math.max(jugador.x, longitudNivel - 640);
        }

        jugador.vy += GRAVEDAD;
        jugador.y += jugador.vy;

        const estabaEnSuelo = jugador.enSuelo;
        const velocidadCaida = jugador.vy;
        jugador.enSuelo = false;

        // Trampolines: se activan al aterrizar desde arriba o al pisarlos desde
        // el suelo. La almohadilla está parcialmente hundida en el terreno.
        for (const t of trampolines) {
            const superficieTrampolin = t.y + t.comp * 0.4;
            const pieAnt = jugador.y + jugador.alto - jugador.vy;
            const pieAct = jugador.y + jugador.alto;
            const horizontal = jugador.x + jugador.ancho > t.x && jugador.x < t.x + t.ancho;
            const caeSobreAlmohadilla = pieAnt <= superficieTrampolin + 2 && pieAct >= superficieTrampolin;
            const pisaDesdeSuelo = estabaEnSuelo && pieAnt <= t.y + t.alto + 2 && pieAct >= t.y;

            if (
                jugador.vy > 0 &&
                horizontal &&
                (caeSobreAlmohadilla || pisaDesdeSuelo)
            ) {
                const saltando = teclas.saltar;
                jugador.y = superficieTrampolin - jugador.alto;
                const fuerzaPorCaida = Math.min(2.5, Math.max(0, velocidadCaida - 8) * 0.16);
                jugador.vy = -(saltando ? 19.5 : 16.5) - fuerzaPorCaida;
                const direccion = (teclas.derecha ? 1 : 0) - (teclas.izquierda ? 1 : 0);
                jugador.vx = limitar(jugador.vx + direccion * 1.5, -jugador.velocidad, jugador.velocidad);
                jugador.saltosRestantes = 1;
                jugador.coyote = 0;
                t.comp = 10;
                sonido("resorte");
                crearPolvo(t.x + t.ancho / 2, t.y + t.alto, 9);
                crearParticulas(t.x + t.ancho / 2, superficieTrampolin, "#ffd34f", 7);
            }
        }

        // Colisión con el suelo y las plataformas fijas.
        const superficies = plataformas;

        for (const p of superficies) {
            if (p.rutaSecreta && !p.descubierta) continue;
            // Las plataformas frágiles que ya cayeron no se pueden pisar.
            if (p.cae && (p.cayendo || p.activa === false)) continue;

            const horizontal =
                jugador.x + jugador.ancho > p.x &&
                jugador.x < p.x + p.ancho;

            if (!horizontal) continue;

            const pieAnterior = jugador.y + jugador.alto - jugador.vy;
            const pieActual = jugador.y + jugador.alto;

            // Las plataformas son de paso inferior. Al bajarse se ignora durante
            // unos cuadros la misma superficie para que no atrape al jugador.
            if (p === plataformaIgnorada && tiempo < ignorarPlataformaHasta) continue;

            if (
                jugador.vy >= 0 &&
                pieAnterior <= p.y &&
                pieActual >= p.y
            ) {
                jugador.y = p.y - jugador.alto;
                jugador.vy = 0;
                jugador.enSuelo = true;
                jugador.saltosRestantes = 2;
                jugador.sobre = p;
                jugador.hielo = !!p.hielo;
            }
        }

        // Aterrizaje: aplastamiento y polvo.
        if (jugador.enSuelo && !estabaEnSuelo && velocidadCaida > 4) {
            jugador.aplastar = 8;
            crearPolvo(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto, 6);
        }
        if (jugador.aplastar > 0) jugador.aplastar--;

        // Polvo al correr.
        if (jugador.enSuelo && Math.abs(jugador.vx) > 2.5 && tiempo % 7 === 0) {
            crearPolvo(
                jugador.x + jugador.ancho / 2 - jugador.mirando * 8,
                jugador.y + jugador.alto,
                2
            );
        }

        // Destellos al deslizarse sobre hielo.
        if (jugador.enSuelo && jugador.hielo && Math.abs(jugador.vx) > 1.5 && tiempo % 5 === 0) {
            crearPolvo(
                jugador.x + jugador.ancho / 2,
                jugador.y + jugador.alto,
                2,
                "#dff6ff"
            );
        }

        // Coyote time: un pequeño margen para saltar tras dejar el borde.
        if (jugador.enSuelo) {
            jugador.coyote = 6;
        } else if (jugador.coyote > 0) {
            jugador.coyote--;
            if (jugador.coyote === 0 && jugador.saltosRestantes > 1) {
                jugador.saltosRestantes = 1;
            }
        }

        // Buffer de salto.
        if (jugador.buffer > 0) {
            jugador.buffer--;
            if (intentarSalto()) jugador.buffer = 0;
        }

        if (jugador.y > ALTO + 100) {
            recibirDano(true);
        }

        if (jugador.invulnerable > 0) jugador.invulnerable--;
        if (jugador.escudo > 0) jugador.escudo--;
        if (jugador.disparoEspera > 0) jugador.disparoEspera--;
    }

    // -----------------------------------------------------
    // ENEMIGOS, PROYECTILES Y DAÑO
    // -----------------------------------------------------

    // -----------------------------------------------------
    // MECÁNICAS ESPECIALES
    // -----------------------------------------------------

    function cajaPlanta(pl) {
        return {
            x: pl.x,
            y: SUELO - pl.altura - 16,
            ancho: pl.ancho,
            alto: pl.altura + 16
        };
    }

    function actualizarMecanicas() {
        // Trueno poco después de cada relámpago.
        if ((ecosistemaActual() === 5 || ecosistemaActual() === 9) && (tiempo + 90) % 420 === 40) {
            sonido("trueno");
            temblor = Math.max(temblor, 4);
        }

        // Trampolines: se recuperan después de comprimirse.
        for (const t of trampolines) {
            if (t.comp > 0) t.comp--;
        }
    }

    function actualizarPuntoControl() {
        if (!puntoControl || puntoControl.activo || !colision(jugador, puntoControl)) return;
        puntoControl.activo = true;
        sonido("checkpoint");
        mostrarMensaje("¡PUNTO DE CONTROL ACTIVADO!", 120);
        crearParticulas(puntoControl.x + puntoControl.ancho / 2, puntoControl.y + 10, "#79f7ff", 18);
        crearTextoFlotante(puntoControl.x + puntoControl.ancho / 2, puntoControl.y, "GUARDADO", "#9dfaff");
    }

    function actualizarRutaSecreta() {
        for (const plataforma of rutasAlternativas) {
            if (plataforma.descubierta) continue;
            const distanciaX = Math.abs(jugador.x + jugador.ancho / 2 - (plataforma.x + plataforma.ancho / 2));
            const distanciaY = Math.abs(jugador.y + jugador.alto / 2 - plataforma.y);
            if (distanciaX >= 40 || distanciaY >= 88) continue;
            plataforma.descubierta = true;
            crearParticulas(plataforma.x + plataforma.ancho / 2, plataforma.y, "#a8e8a8", 3);
        }
    }

    function dibujarPuntoControl() {
        if (!puntoControl) return;
        const x = puntoControl.x - camaraX;
        if (x + puntoControl.ancho < 0 || x > ANCHO) return;
        const color = puntoControl.activo ? "#83ffbd" : "#68ddf0";
        const pulso = opciones.reducirMovimiento ? 0 : Math.abs(Math.sin(tiempo * 0.08)) * 5;
        halo(x + 12, puntoControl.y + 8, (puntoControl.activo ? 17 : 12) + pulso);
        rectangulo(x + 9, puntoControl.y + 8, 6, 42, "#40566d");
        rectangulo(x + 5, puntoControl.y + 6, 14, 5, "#d9efff");
        rectangulo(x + 4, puntoControl.y + 4, 16, 7, color);
        rectangulo(x + 8, puntoControl.y + 1, 8, 4, "#ffffff");
        if (puntoControl.activo) rectangulo(x + 10, puntoControl.y + 13, 4, 4, "#eafff2");
    }

    function dibujarReliquiaSecreta() {
        if (!reliquiaSecreta || !reliquiaSecreta.descubierta || reliquiaSecreta.recogida) return;
        const x = reliquiaSecreta.x - camaraX;
        const y = reliquiaSecreta.y + Math.round(Math.sin(tiempo * 0.09) * 3);
        halo(x + 12, y + 12, 19);
        rectangulo(x + 4, y + 7, 16, 13, "#8b4ec1");
        rectangulo(x + 7, y + 3, 10, 6, "#d7a5ff");
        rectangulo(x + 1, y + 9, 4, 8, "#ffdf68");
        rectangulo(x + 19, y + 9, 4, 8, "#ffdf68");
        rectangulo(x + 9, y + 10, 6, 6, "#fff5c2");
    }

    function actualizarPlantas() {
        for (const pl of plantas) {
            if (!pl.vivo) continue;

            // Ciclo de 200 fotogramas: escondida, sube, muerde, baja.
            const ciclo = (tiempo + pl.fase) % 200;
            let altura = 0;

            if (ciclo >= 80 && ciclo < 100) {
                altura = 46 * ((ciclo - 80) / 20);
            } else if (ciclo >= 100 && ciclo < 150) {
                altura = 46;
            } else if (ciclo >= 150 && ciclo < 170) {
                altura = 46 * (1 - (ciclo - 150) / 20);
            }

            pl.altura = altura;

            if (pl.golpe > 0) pl.golpe--;

            if (altura > 12 && colision(jugador, cajaPlanta(pl))) {
                recibirDano();
            }
        }
    }

    function actualizarFragiles() {
        for (const p of plataformas) {
            if (!p.cae) continue;

            if (p.activa === false) {
                p.reaparece--;
                if (p.reaparece <= 0) {
                    p.activa = true;
                    p.cayendo = false;
                    p.y = p.y0;
                    p.temblando = 0;
                    p.vyc = 0;
                }
                continue;
            }

            if (p.cayendo) {
                p.vyc += 0.5;
                p.y += p.vyc;
                if (p.y > ALTO + 60) {
                    p.activa = false;
                    p.reaparece = 240;
                }
                continue;
            }

            if (jugador.sobre === p) {
                p.temblando++;
                if (p.temblando >= 38) p.cayendo = true;
            } else if (p.temblando > 0) {
                p.temblando--;
            }
        }
    }

    function actualizarMovimientoEnemigo(e) {
        const jugadorCentro = jugador.x + jugador.ancho / 2;
        const enemigoCentro = e.x + e.ancho / 2;
        const distancia = Math.abs(jugadorCentro - enemigoCentro);
        const perfil = e.comportamientoEspecie;
        const persigueJugador = jugadorCentro < enemigoCentro ? -1 : 1;

        e.avisandoAtaque = false;
        if (perfil === "embestidor" || perfil === "picado") {
            if (e.estadoAtaque === "patrulla") {
                e.ataqueTemporizador--;
                if (e.ataqueTemporizador <= 0 && distancia < 220) {
                    e.estadoAtaque = "aviso";
                    e.ataqueTemporizador = perfil === "picado" ? 24 : 30;
                    e.direccionAtaque = persigueJugador;
                    e.mirada = persigueJugador;
                    e.vx = 0;
                }
            } else if (e.estadoAtaque === "aviso") {
                e.avisandoAtaque = true;
                e.vx = 0;
                e.ataqueTemporizador--;
                if (perfil === "picado") e.y = e.yBase + Math.sin((tiempo + e.fase) * 0.035) * 5;
                if (e.ataqueTemporizador <= 0) {
                    e.estadoAtaque = perfil === "picado" ? "picado" : "embestida";
                    e.ataqueTemporizador = perfil === "picado" ? 24 : 18;
                }
            } else if (e.estadoAtaque === "embestida") {
                e.vx = e.direccionAtaque * e.velocidadBase * 2.5;
                e.x += e.vx;
                e.ataqueTemporizador--;
                if (e.ataqueTemporizador <= 0 || e.x <= e.limiteIzq || e.x + e.ancho >= e.limiteDer) {
                    e.estadoAtaque = "recuperacion";
                    e.ataqueTemporizador = 40;
                    e.vx = -e.direccionAtaque * e.velocidadBase * 0.45;
                }
            } else if (e.estadoAtaque === "picado") {
                e.ataqueTemporizador--;
                e.y = Math.min(SUELO - e.alto + 5, e.y + 5);
                e.x += e.direccionAtaque * e.velocidadBase * 0.65;
                if (e.ataqueTemporizador <= 0 || e.y >= SUELO - e.alto + 5) {
                    e.estadoAtaque = "recuperacion";
                    e.ataqueTemporizador = 32;
                }
            } else if (e.estadoAtaque === "recuperacion") {
                e.ataqueTemporizador--;
                e.x += e.vx;
                if (e.volador) e.y += (e.yBase - e.y) * 0.16;
                if (e.ataqueTemporizador <= 0) {
                    e.estadoAtaque = "patrulla";
                    e.ataqueTemporizador = 55 + e.fase % 35;
                    if (perfil === "picado") e.vx = -e.direccionAtaque * e.velocidadBase * 0.6;
                }
            }
            if (e.estadoAtaque === "patrulla" || e.estadoAtaque === "aviso") {
                e.x += e.vx;
            }
        } else {
            if (perfil === "acechador" && distancia < 170) {
                e.vx = persigueJugador * e.velocidadBase * 1.12;
                e.mirada = persigueJugador;
            } else if (perfil === "planeador" || perfil === "revoloteador" || perfil === "flotante") {
                const velocidadPerfil = perfil === "planeador" ? 0.72 : perfil === "flotante" ? 0.48 : 1;
                e.vx = Math.sign(e.vx || 1) * e.velocidadBase * velocidadPerfil;
                e.mirada = Math.sign(e.vx);
            } else {
                e.mirada = Math.sign(e.vx || 1);
            }

            e.x += e.vx;
            if (e.x < e.limiteIzq) { e.x = e.limiteIzq; e.vx = Math.abs(e.vx); }
            if (e.x + e.ancho > e.limiteDer) { e.x = e.limiteDer - e.ancho; e.vx = -Math.abs(e.vx); }

            if (e.volador) {
                const amplitud = perfil === "planeador" ? 9 : perfil === "flotante" ? 17 : perfil === "revoloteador" ? 22 : 12;
                const frecuencia = perfil === "planeador" ? 0.022 : perfil === "flotante" ? 0.052 : perfil === "revoloteador" ? 0.095 : 0.035;
                e.y = e.yBase + Math.sin((tiempo + e.fase) * frecuencia) * amplitud;
                if (perfil === "revoloteador") e.y += Math.sin((tiempo + e.fase) * 0.17) * 4;
            } else if (perfil === "saltador") {
                e.y = e.yBase - Math.max(0, Math.sin((tiempo + e.fase) * 0.055)) * 34;
            } else if (perfil === "ondulante") {
                e.y = e.yBase - (0.5 + Math.sin((tiempo + e.fase) * 0.075) * 0.5) * 13;
            } else if (perfil === "lateral") {
                e.y = e.yBase - Math.max(0, Math.sin((tiempo + e.fase) * 0.09)) * 7;
            } else {
                e.y = e.yBase;
            }
        }

        e.x = limitar(e.x, e.limiteIzq, Math.max(e.limiteIzq, e.limiteDer - e.ancho));
        if (e.estadoAtaque === "patrulla" && e.volador && perfil !== "picado") {
            // Vuelo estable por encima del suelo y de las plataformas.
            e.y = limitar(e.y, 180, SUELO - e.alto - 18);
        }
    }

    function actualizarEnemigos() {
        for (const e of enemigos) {
            if (!e.vivo) continue;
            actualizarMovimientoEnemigo(e);
            if (e.x + e.ancho >= camaraX - 20 && e.x <= camaraX + ANCHO + 20) descubrirFauna(e.nombreEspecie);

            if (colision(jugador, e)) {
                if (
                    jugador.vy > 1 &&
                    jugador.y + jugador.alto - e.y < 18
                ) {
                    e.vivo = false;
                    jugador.vy = -8;
                    puntuacion += 100;
                    congelar = 3;
                    temblor = Math.max(temblor, 4);
                    sonido("enemigo");
                    crearParticulas(e.x + 15, e.y + 15, "#ffbc42", 10);
                    crearTextoFlotante(e.x + 15, e.y, "+100", "#ffe16b");
                } else {
                    recibirDano();
                }
            }
        }

        enemigos = enemigos.filter(e => e.vivo);

        for (const c of canones) {
            c.espera--;

            if (c.espera <= 0) {
                c.espera = Math.floor(azar(100, 181));

                proyectiles.push({
                    x: c.x,
                    y: c.y + 10,
                    ancho: 12,
                    alto: 8,
                    vx: jugador.x < c.x ? -3.5 : 3.5,
                    vy: -1.5,
                    enemigo: true
                });

                // Fogonazo del cañón.
                crearParticulas(c.x + 16, c.y + 12, "#ffb347", 4);
            }
        }

        for (const p of proyectiles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.035;

            // Estela del proyectil.
            if (tiempo % 3 === 0) {
                particulas.push({
                    x: p.x + p.ancho / 2,
                    y: p.y + p.alto / 2,
                    vx: 0,
                    vy: 0,
                    vida: 12,
                    color: "#ff875b"
                });
            }

            if (colision(jugador, p)) {
                recibirDano();
                p.fuera = true;
            }

            if (p.x < camaraX - 100 || p.x > camaraX + ANCHO + 100) {
                p.fuera = true;
            }
        }

        proyectiles = proyectiles.filter(p => !p.fuera);
    }

    function actualizarDisparos() {
        for (const d of disparosJugador) {
            if (d.objetivo && d.objetivo.vivo) {
                const dx = d.objetivo.x + d.objetivo.ancho / 2 - (d.x + d.ancho / 2);
                const dy = d.objetivo.y + d.objetivo.alto / 2 - (d.y + d.alto / 2);
                const distancia = Math.hypot(dx, dy) || 1;
                d.vx = dx / distancia * 8;
                d.vy = dy / distancia * 8;
            }
            d.x += d.vx;
            d.y += d.vy || 0;
            d.vida--;

            if (tiempo % 2 === 0) {
                particulas.push({
                    x: d.x + d.ancho / 2,
                    y: d.y + d.alto / 2,
                    vx: 0,
                    vy: 0,
                    vida: 10,
                    color: "#8bf6ff"
                });
            }

            for (const e of enemigos) {
                if (e.vivo && colision(d, e)) {
                    e.vida--;
                    d.vida = 0;

                    if (e.vida <= 0) {
                        e.vivo = false;
                        puntuacion += 100;
                        congelar = 3;
                        sonido("enemigo");
                        crearParticulas(e.x + 15, e.y + 15, "#ffcb52", 8);
                    }
                }
            }

            for (const pl of plantas) {
                if (pl.vivo && pl.altura > 10 && colision(d, cajaPlanta(pl))) {
                    pl.vida--;
                    pl.golpe = 6;
                    d.vida = 0;
                    congelar = 2;
                    sonido("enemigo");
                    crearParticulas(pl.x + pl.ancho / 2, SUELO - pl.altura, "#6be08a", 5);

                    if (pl.vida <= 0) {
                        pl.vivo = false;
                        puntuacion += 150;
                        crearParticulas(pl.x + pl.ancho / 2, SUELO - 30, "#6be08a", 14);
                        crearParticulas(pl.x + pl.ancho / 2, SUELO - 30, "#d63a54", 8);
                    }
                }
            }

            if (jefe && jefe.vivo && colision(d, jefe)) {
                jefe.vida = Math.max(0, jefe.vida - 1);
                jefe.golpe = 6;
                d.vida = 0;
                congelar = 2;
                sonido("enemigo");
                crearParticulas(d.x, d.y, "#ff5577", 5);
                crearTextoFlotante(jefe.x + jefe.ancho / 2, jefe.y, "-1", "#ffb6d2");

                if (jefe.vida <= 0) {
                    derrotarJefe();
                }
            }

            if (d.x < 0 || d.x > longitudNivel || d.vida <= 0) {
                d.vida = 0;
            }
        }

        disparosJugador = disparosJugador.filter(d => d.vida > 0);
        enemigos = enemigos.filter(e => e.vivo);
    }

    function actualizarJefe() {
        if (!jefe || !jefe.vivo) return;

        // El jefe espera hasta que entres a su arena.
        if (!jefe.anunciado) {
            if (jugador.x < longitudNivel - 640) return;
            jefe.anunciado = true;
            temblor = 10;
            ventanaHistoria = { tipo: "jefe", ecosistema: ecosistemaActual() };
            pausado = true;
            return;
        }

        // Fase 2: al bajar a la mitad de vida se enfurece.
        if (!jefe.enfurecido && jefe.vida <= jefe.vidaMaxima / 2) {
            jefe.enfurecido = true;
            temblor = 16;
            mostrarMensaje("¡EL GUARDIÁN PIERDE EL CONTROL!", 110);
            crearParticulas(jefe.x + 35, jefe.y + 45, "#ff3b3b", 14);
        }

        if (jefe.golpe > 0) jefe.golpe--;

        const perfil = dificultadActual();
        const velocidad = (jefe.enfurecido ? 2.4 : 1.6) * perfil.velocidadJefe;
        const minX = longitudNivel - 520;
        const maxX = longitudNivel - 170;

        if (jefe.cargando > 0) {
            jefe.vx = jefe.direccionCarga * velocidad * 2.2;
            jefe.x += jefe.vx;
            jefe.cargando--;
        } else {
            jefe.vx = Math.sign(jefe.vx || 1) * velocidad;
            jefe.x += jefe.vx;
        }

        if (jefe.ataque.movimiento === "salto") {
            jefe.y = jefe.yBase - Math.max(0, Math.sin((tiempo + jefe.fase) * 0.055)) * 34;
        } else {
            jefe.y = jefe.yBase;
        }

        if (jefe.x < minX) {
            jefe.x = minX;
            jefe.vx = velocidad;
        } else if (jefe.x > maxX) {
            jefe.x = maxX;
            jefe.vx = -velocidad;
        }

        jefe.espera--;

        if (jefe.espera <= 0) {
            jefe.espera = Math.floor(
                (jefe.enfurecido ? azar(85, 116) : azar(100, 146)) * perfil.intervaloJefe
            );

            const sentido = jugador.x < jefe.x ? -1 : 1;
            if (jefe.ataque.movimiento === "carga") {
                jefe.direccionCarga = sentido;
                jefe.cargando = jefe.enfurecido ? 24 : 17;
            }
            const multiplicadorVelocidad = perfil.velocidadProyectiles * (jefe.enfurecido ? 1.18 : 1);
            const trayectorias = jefe.ataque.tiros.slice();
            if (jefe.enfurecido) trayectorias.push([4.1, -2.1]);
            for (const [vx, vy] of trayectorias) {
                proyectiles.push({
                    x: jefe.x + jefe.ancho / 2 - 7,
                    y: jefe.y + 35,
                    ancho: 14,
                    alto: 12,
                    vx: sentido * vx * multiplicadorVelocidad,
                    vy: vy * multiplicadorVelocidad,
                    color: jefe.ataque.color,
                    enemigo: true
                });
            }
            crearParticulas(jefe.x + jefe.ancho / 2, jefe.y + 40, jefe.ataque.color, 7);
        }

        if (colision(jugador, jefe)) {
            const caeSobreJefe = jugador.vy > 1 && jugador.y + jugador.alto - jefe.y < 25;
            if (caeSobreJefe) {
                jugador.vy = -10;
                jugador.sobre = null;
                jefe.vida = Math.max(0, jefe.vida - 2);
                jefe.golpe = 10;
                congelar = 5;
                temblor = Math.max(temblor, 7);
                sonido("enemigo");
                crearParticulas(jugador.x + jugador.ancho / 2, jefe.y + 4, "#ffdf68", 12);
                crearTextoFlotante(jefe.x + jefe.ancho / 2, jefe.y, "-2", "#ffe16b");
                if (jefe.vida <= 0) derrotarJefe();
            } else {
                recibirDano();
            }
        }
    }

    function derrotarJefe() {
        if (!jefe || !jefe.vivo) return;
        jefe.vivo = false;
        puntuacion += 1000;
        temblor = 30;
        sonido("victoria");
        crearParticulas(jefe.x + jefe.ancho / 2, jefe.y + jefe.alto / 2, "#ff4c83", 25);
        crearParticulas(jefe.x + jefe.ancho / 2, jefe.y + jefe.alto / 2, "#ffdf68", 25);
        crearParticulas(jefe.x + jefe.ancho / 2, jefe.y + jefe.alto / 2, "#ffffff", 15);
        const idEcosistema = ecosistemaActual();
        const titulosLogrados = [];
        if (guardarListaLogros(jefesDerrotados, idEcosistema)) titulosLogrados.push(LOGROS_JEFES[idEcosistema - 1]);
        const nuevoLogroTotal = !logroTodosLosJefes && jefesDerrotados.length === ECOSISTEMAS.length;
        if (nuevoLogroTotal) {
            logroTodosLosJefes = true;
            titulosLogrados.push("CAMPEÓN DE LOS ECOSISTEMAS");
        }
        guardarProgreso();
        if (titulosLogrados.length) {
            ventanaLogro = { ecosistema: idEcosistema, titulos: titulosLogrados, logroTotal: nuevoLogroTotal };
            pausado = true;
        } else {
            mostrarMensaje("¡GUARDIÁN CALMADO! PREPARA EL ANTÍDOTO", 160);
        }
    }

    function recibirDano(cayo = false) {
        if (jugador.escudo > 0 && !cayo) return;
        if (jugador.invulnerable > 0 && !cayo) return;

        sinPerderVidaNivel = false;
        jugador.vidas--;
        if (!enTutorial) retosEcosistemas[ecosistemaActual() - 1].sinDanio = false;
        jugador.invulnerable = 100;
        jugador.vy = -7;
        temblor = 12;
        congelar = 4;
        sonido("dano");

        crearParticulas(
            jugador.x + jugador.ancho / 2,
            jugador.y + jugador.alto / 2,
            "#ff5364",
            12
        );
        crearTextoFlotante(jugador.x + jugador.ancho / 2, jugador.y, "-1 VIDA", "#ff8da4");

        if (enTutorial && jugador.vidas <= 0) jugador.vidas = vidasPorNivel();
        if (jugador.vidas <= 0) {
            jugador.vidas = 0;
            const inicioEcosistema = Math.floor((nivelActual - 1) / NIVELES_POR_ECOSISTEMA) * NIVELES_POR_ECOSISTEMA + 1;
            // Al agotarse los intentos, se repite el ecosistema actual y se
            // conserva el progreso, la puntuación y los logros de los previos.
            retosEcosistemas[ecosistemaActual() - 1] = nuevoRetoEcosistema();
            nivelActual = inicioEcosistema;
            nivelesDesbloqueados = Math.min(nivelesDesbloqueados, inicioEcosistema);
            guardarProgreso();
            estado = "derrota";
            sonido("derrota");
            mostrarMensaje(`SIN INTENTOS: REPITES ${ECOSISTEMAS[ecosistemaActual() - 1].nombre}`, 200);
        } else {
            const regresoAlJefe = !!(jefe && jefe.anunciado);
            const usarPuntoControl = !!(puntoControl && puntoControl.activo);
            jugador.x = regresoAlJefe
                ? longitudNivel - 600
                : enTutorial ? tutorialRespawnX
                : usarPuntoControl ? puntoControl.spawnX : 60;
            jugador.y = regresoAlJefe || enTutorial || !usarPuntoControl
                ? SUELO - jugador.alto
                : puntoControl.spawnY;
            jugador.vx = 0;
            jugador.vy = 0;
            jugador.sobre = null;
            jugador.enSuelo = false;
            jugador.saltosRestantes = 2;
            // Centrar la cámara inmediatamente evita que el jugador reaparezca
            // fuera de pantalla mientras la cámara alcanza el punto guardado.
            camaraX = limitar(jugador.x - ANCHO * 0.38, 0, Math.max(0, longitudNivel - ANCHO));
            if (enTutorial) {
                mostrarMensaje("¡INTÉNTALO DE NUEVO! VUELVES AL ÚLTIMO CARTEL", 110);
            } else if (usarPuntoControl) {
                mostrarMensaje("¡REGRESAS AL PUNTO DE CONTROL!", 90);
                crearParticulas(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto, "#79f7ff", 12);
            } else if (!regresoAlJefe) {
                mostrarMensaje("VUELVES AL INICIO DEL NIVEL", 90);
            }
        }
    }

    // -----------------------------------------------------
    // OBJETOS COLECCIONABLES
    // -----------------------------------------------------

    function actualizarObjetos() {
        for (const m of monedas) {
            if (m.rutaSecreta && !m.plataformaRuta.descubierta) continue;
            if (m.recogida) continue;

            const jugadorX = jugador.x + jugador.ancho / 2;
            const jugadorY = jugador.y + jugador.alto / 2;
            let dx = jugadorX - (m.x + m.ancho / 2);
            let dy = jugadorY - (m.y + m.alto / 2);
            let distancia = Math.hypot(dx, dy);
            const radioIman = 88;
            m.atrayendo = distancia < radioIman;

            // Las monedas cercanas se acercan suavemente, sin recogerlas desde lejos.
            if (m.atrayendo && distancia > 22) {
                const fuerza = Math.min(6, 1.8 + (radioIman - distancia) * 0.055);
                m.x += dx / distancia * fuerza;
                m.y += dy / distancia * fuerza;
                dx = jugadorX - (m.x + m.ancho / 2);
                dy = jugadorY - (m.y + m.alto / 2);
                distancia = Math.hypot(dx, dy);
            }

            if (distancia < 22 || colision(jugador, m)) {
                m.recogida = true;
                m.atrayendo = false;
                jugador.monedas++;
                puntuacion += 10;
                sonido("moneda");
                crearParticulas(m.x + 9, m.y + 9, "#ffd84d", 10);
                crearTextoFlotante(m.x + 9, m.y, "+10", "#ffe16b");
            }
        }

        for (const d of diamantes) {
            if (!d.recogido && colision(jugador, d)) {
                d.recogido = true;
                jugador.diamantes++;
                puntuacion += 50;
                sonido("diamante");
                crearParticulas(d.x + 10, d.y + 10, "#52edff", 10);
                crearTextoFlotante(d.x + 10, d.y, "+50", "#8df5ff");
                mostrarMensaje("¡DIAMANTE RECOGIDO!", 70);
            }
        }

        for (const h of corazones) {
            if (!h.recogido && colision(jugador, h)) {
                h.recogido = true;
                sonido("vida");

                const recuperoVida = jugador.vidas < vidasPorNivel();
                if (recuperoVida) {
                    jugador.vidas++;
                    mostrarMensaje("+1 VIDA", 70);
                } else {
                    puntuacion += 50;
                    mostrarMensaje("+50 PUNTOS", 70);
                }

                crearParticulas(h.x + 10, h.y + 10, "#ff668a", 8);
                crearTextoFlotante(h.x + 10, h.y, recuperoVida ? "+1 VIDA" : "+50", "#ff9fbd");
            }
        }

        for (const escudo of escudos) {
            if (escudo.recogido || !colision(jugador, escudo)) continue;
            escudo.recogido = true;
            jugador.escudo = 8 * 60;
            sonido("vida");
            mostrarMensaje("¡ESCUDO ACTIVADO! 8 SEGUNDOS", 100);
            crearParticulas(escudo.x + 11, escudo.y + 11, "#69e7ff", 14);
        }

        if (
            nivelLlave &&
            !nivelLlave.recogida &&
            colision(jugador, nivelLlave)
        ) {
            nivelLlave.recogida = true;
            jugador.tieneLlave = true;
            puntuacion += 100;
            sonido("llave");
            mostrarMensaje("¡LLAVE CONSEGUIDA!", 100);
            crearParticulas(
                nivelLlave.x + 10,
                nivelLlave.y + 10,
                "#ffdd62",
                12
            );
        }

        if (reliquiaSecreta && !reliquiaSecreta.recogida) {
            const distanciaX = Math.abs(jugador.x + jugador.ancho / 2 - (reliquiaSecreta.x + reliquiaSecreta.ancho / 2));
            const distanciaY = Math.abs(jugador.y + jugador.alto / 2 - (reliquiaSecreta.y + reliquiaSecreta.alto / 2));
            const ultimoTramo = rutasAlternativas[rutasAlternativas.length - 1];
            if (ultimoTramo?.descubierta && !reliquiaSecreta.descubierta && distanciaX < 72 && distanciaY < 96) {
                reliquiaSecreta.descubierta = true;
                sonido("secreto");
                mostrarMensaje("¡UN TESORO OCULTO!", 90);
                crearParticulas(reliquiaSecreta.x + 12, reliquiaSecreta.y + 12, "#d8a5ff", 12);
            }
            if (reliquiaSecreta.descubierta && colision(jugador, reliquiaSecreta)) {
                reliquiaSecreta.recogida = true;
                puntuacion += 250;
                sonido("secreto");
                mostrarMensaje("¡RELIQUIA SECRETA: +250!", 110);
                crearParticulas(reliquiaSecreta.x + 12, reliquiaSecreta.y + 12, "#e6b8ff", 24);
                crearTextoFlotante(reliquiaSecreta.x + 12, reliquiaSecreta.y, "+250", "#e6b8ff");
            }
        }

        // Peligros del suelo: el aspecto cambia por ecosistema; la colisión
        // sigue limitada al volumen dibujado para permitir saltos limpios.
        for (const p of obstaculosSuelo) {
            if (colision(jugador, p)) {
                recibirDano();
            }
        }
    }

    // -----------------------------------------------------
    // PARTÍCULAS
    // -----------------------------------------------------

    function crearParticulas(x, y, color, cantidad) {
        for (let i = 0; i < cantidad; i++) {
            particulas.push({
                x,
                y,
                vx: azar(-3, 3),
                vy: azar(-4, 1),
                vida: Math.floor(azar(15, 36)),
                color
            });
        }
    }

    function crearTextoFlotante(x, y, texto, color) {
        textosFlotantes.push({ x, y, texto, color, vida: 42 });
    }

    function crearPolvo(x, y, cantidad, color = "#d4dcec") {
        for (let i = 0; i < cantidad; i++) {
            particulas.push({
                x: x + azar(-6, 6),
                y: y - 2,
                vx: azar(-1.2, 1.2),
                vy: azar(-1, -0.2),
                vida: Math.floor(azar(10, 22)),
                color
            });
        }
    }

    function actualizarParticulas() {
        for (const p of particulas) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
            p.vida--;
        }

        particulas = particulas.filter(p => p.vida > 0);
        for (const texto of textosFlotantes) {
            texto.y -= 0.65;
            texto.vida--;
        }
        textosFlotantes = textosFlotantes.filter(texto => texto.vida > 0);
    }

    // -----------------------------------------------------
    // DIBUJO DEL ESCENARIO
    // -----------------------------------------------------

    // Partículas ambientales por mundo (sin estado: se calculan con el tiempo).
    const AMBIENTE = [
        { tipo: "caida", color: "#7ad37a", vel: 0.6, deriva: 1.2 }, // 1 hojas de selva
        { tipo: "caida", color: "#ffffff", vel: 0.7, deriva: 0.4 }, // 2 nieve
        { tipo: "viento", color: "#f4d28a" },                       // 3 polvo de sabana
        { tipo: "viento", color: "#e7bd78" },                       // 4 arena
        { tipo: "lluvia", color: "#a8d8ff" },                       // 5 lluvia de humedal
        { tipo: "sube", color: "#8eeaff" },                         // 6 burbujas del río
        { tipo: "caida", color: "#e8f6ff", vel: 0.5, deriva: 1.3 }, // 7 espuma marina
        { tipo: "sube", color: "#76f4ee" },                         // 8 burbujas del arrecife
        { tipo: "lluvia", color: "#9bd9d2" },                       // 9 lluvia del manglar
        { tipo: "sube", color: "#b4faff" }                          // 10 burbujas profundas
    ];

    function dibujarAmbiente() {
        const a = AMBIENTE[ecosistemaActual() - 1];
        ctx.fillStyle = a.color;

        const cuenta = a.tipo === "lluvia" ? 80 : 40;

        for (let i = 0; i < cuenta; i++) {
            const semX = (i * 97 + 13) % ANCHO;
            const semY = (i * 53 + 7) % ALTO;
            const v = 0.5 + (i % 5) * 0.25;
            let tam = 2 + (i % 3);
            let x, y;
            let alfa = 0.8;
            let largo = tam;

            if (a.tipo === "caida") {
                x = mod(semX + Math.sin((tiempo + i * 23) * 0.02) * 30 * a.deriva - camaraX * 0.4, ANCHO);
                y = mod(semY + tiempo * a.vel * v, ALTO);
            } else if (a.tipo === "sube") {
                x = mod(semX + Math.sin((tiempo + i * 17) * 0.03) * 14 - camaraX * 0.4, ANCHO);
                y = mod(semY - tiempo * v * 1.1, ALTO);
                alfa = 0.3 + 0.6 * (y / ALTO);
            } else if (a.tipo === "lluvia") {
                x = mod(semX + i * 11 - tiempo * 1.2 - camaraX * 0.6, ANCHO);
                y = mod(semY + tiempo * (9 + (i % 4) * 2), ALTO);
                alfa = 0.45;
                largo = 1;
                tam = 9;
            } else if (a.tipo === "viento") {
                x = mod(semX + tiempo * v * 3 - camaraX * 0.8, ANCHO);
                y = 230 + (i * 31) % 200;
                alfa = 0.55;
                largo = 6;
            } else {
                x = mod(semX - camaraX * 0.3, ANCHO);
                y = 120 + (i * 47) % 280 + Math.sin(tiempo * 0.02 + i) * 10;
                alfa = 0.2 + 0.8 * Math.abs(Math.sin(tiempo * 0.03 + i));
            }

            ctx.globalAlpha = alfa;
            ctx.fillRect(Math.round(x), Math.round(y), largo, tam);
        }

        ctx.globalAlpha = 1;
    }

    // Sol o luna: recorre el cielo a medida que avanzas por el nivel.
    function dibujarSolLuna(mundo) {
        const progreso = limitar(camaraX / Math.max(1, longitudNivel - ANCHO), 0, 1);
        const sx = ANCHO - 80 - progreso * (ANCHO - 200);
        const sy = 125 - Math.sin(progreso * Math.PI) * 55 + Math.sin(tiempo * 0.01) * 2;

        ctx.fillStyle = mundo.luz;

        ctx.globalAlpha = 0.10 + Math.sin(tiempo * 0.03) * 0.04;
        ctx.beginPath();
        ctx.arc(sx, sy, 56, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.18;
        ctx.beginPath();
        ctx.arc(sx, sy, 41, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.arc(sx, sy, 29, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 1;
    }

    // Cordillera lejana y suave que se mueve muy despacio (más profundidad).
    function dibujarCapaLejana(mundo) {
        // Las formas lejanas usan colores apagados para que el jugador y las
        // plataformas conserven el mayor contraste.
        ctx.globalAlpha = 0.32;
        ctx.fillStyle = mundo.cielo;
        ctx.beginPath();
        ctx.moveTo(0, 400);

        for (let sx = 0; sx <= ANCHO + 20; sx += 20) {
            const wx = sx + camaraX * 0.06;
            const y = 285 + Math.sin(wx * 0.007) * 35 + Math.sin(wx * 0.019) * 14;
            ctx.lineTo(sx, y);
        }

        ctx.lineTo(ANCHO + 20, 400);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Siluetas propias de cada mundo en dos planos de parallax.
    // Las posiciones dependen de coordenadas del mundo, así no "saltan" al avanzar.
    function dibujarSiluetasMundo(mundo) {
        const n = ecosistemaActual();
        const coloresLejanos = {
            1: "#244b54", 2: "#526d8d", 3: "#8e8750", 4: "#bd7950",
            5: "#24484d", 6: "#397c89", 7: "#526e83", 8: "#17677a",
            9: "#31594e", 10: "#12364c"
        };
        const colorLejano = coloresLejanos[n] || mundo.horizonte;
        const desplazamientoLejano = camaraX * 0.08;
        const desplazamientoCercano = camaraX * 0.18;

        // Horizonte irregular específico de cada bioma.
        ctx.globalAlpha = 0.54;
        ctx.fillStyle = colorLejano;
        ctx.beginPath();
        ctx.moveTo(0, 390);
        for (let sx = 0; sx <= ANCHO + 24; sx += 24) {
            const wx = sx + desplazamientoLejano;
            let y = 325 + Math.sin(wx * 0.009) * 17 + Math.sin(wx * 0.027) * 9;
            if (n === 1 || n === 5 || n === 9) y = 310 + Math.sin(wx * 0.012) * 13;
            if (n === 3 || n === 4) y = 340 + Math.sin(wx * 0.006) * 12;
            if (n === 6 || n === 7 || n === 8) y = 335 + Math.sin(wx * 0.014) * 8;
            if (n === 10) y = 315 + Math.sin(wx * 0.01) * 20;
            ctx.lineTo(sx, y);
        }
        ctx.lineTo(ANCHO, 405);
        ctx.closePath();
        ctx.fill();

        // Elementos medianos: copas, dunas, torres o picos según el mundo.
        ctx.globalAlpha = 0.72;
        for (let i = -3; i < 13; i++) {
            const semillaVisual = (nivelActual * 73 + i + 37) | 0;
            const hashVisual = Math.imul(semillaVisual, 1103515245) >>> 0;
            const ancho = 96 + (hashVisual % 51);
            const wx = i * 125 + (hashVisual % 57) - 28;
            const x = wx - desplazamientoCercano;
            const variacion = (hashVisual >>> 8) % 35;
            const baseY = 392;

            if (n === 1 || n === 5 || n === 9) {
                // Selva, humedal y manglar: árboles de distintas densidades.
                const tono = n === 9 ? "#31594e" : (n === 5 ? "#315647" : "#286146");
                rectangulo(x + 43, baseY - 66 - variacion, 13, 66, tono);
                rectangulo(x + 20, baseY - 95 - variacion, 58, 45, tono);
                rectangulo(x + 31, baseY - 116 - variacion, 38, 34, tono);
                if (n === 9) {
                    rectangulo(x + 30, baseY - 28, 5, 28, tono);
                    rectangulo(x + 63, baseY - 28, 5, 28, tono);
                }
            } else if (n === 4) {
                // Dunas anchas y solapadas.
                ctx.fillStyle = "#cd8e53";
                ctx.beginPath();
                ctx.ellipse(x + 58, baseY - 8, 78, 27 + variacion * 0.2, 0, Math.PI, Math.PI * 2);
                ctx.fill();
            } else if (n === 3) {
                // Acacias de copa extendida en la sabana.
                rectangulo(x + 48, baseY - 65 - variacion, 9, 65, "#76583a");
                rectangulo(x + 18, baseY - 73 - variacion, 68, 16, "#68733e");
                rectangulo(x + 28, baseY - 83 - variacion, 48, 12, "#87904a");
            } else if (n === 6) {
                // Juncos y piedras en las orillas del río.
                rectangulo(x + 28, baseY - 55 - variacion, 5, 55, "#60916b");
                rectangulo(x + 48, baseY - 42 - variacion, 5, 42, "#78a86f");
                rectangulo(x + 68, baseY - 61 - variacion, 5, 61, "#60916b");
            } else if (n === 7) {
                // Acantilados bajos esculpidos por el oleaje.
                ctx.beginPath();
                ctx.moveTo(x + 15, baseY);
                ctx.lineTo(x + 32, baseY - 50 - variacion);
                ctx.lineTo(x + 53, baseY - 72 - variacion);
                ctx.lineTo(x + 91, baseY);
                ctx.closePath();
                ctx.fillStyle = "#526e83";
                ctx.fill();
            } else if (n === 8 || n === 10) {
                // Corales ramificados en el arrecife y las profundidades.
                const coral = n === 10 ? "#367b89" : "#36a89d";
                rectangulo(x + 48, baseY - 50 - variacion, 8, 50, coral);
                rectangulo(x + 29, baseY - 39, 27, 7, coral);
                rectangulo(x + 29, baseY - 55, 7, 20, coral);
                rectangulo(x + 53, baseY - 31, 25, 7, coral);
                rectangulo(x + 71, baseY - 47, 7, 22, coral);
            } else {
                // Siluetas montañosas para los mundos restantes.
                ctx.fillStyle = colorLejano;
                ctx.beginPath();
                ctx.moveTo(x, baseY);
                ctx.lineTo(x + ancho / 2, baseY - 65 - variacion);
                ctx.lineTo(x + ancho, baseY);
                ctx.closePath();
                ctx.fill();
            }
        }
        ctx.globalAlpha = 1;
    }

    // Fenómenos del cielo (detrás de todo): auroras y estrellas fugaces.
    function dibujarEventosCielo() {
        const n = ecosistemaActual();

        if (n === 2) {
            for (let sx = 0; sx < ANCHO; sx += 8) {
                const y = 55 + Math.sin(sx * 0.02 + tiempo * 0.02) * 22;
                const alto = 40 + Math.sin(sx * 0.05 - tiempo * 0.015) * 14;

                ctx.globalAlpha = 0.10 + 0.08 * Math.abs(Math.sin(sx * 0.01 + tiempo * 0.01));
                ctx.fillStyle = Math.floor(sx / 80) % 2 === 0 ? "#6bffb5" : "#b58cff";
                ctx.fillRect(sx, Math.round(y), 8, Math.round(alto));
            }
            ctx.globalAlpha = 1;
        }

        if ([1, 2, 3, 4, 5, 7, 9].includes(n)) {
            const ciclo = tiempo % 260;
            const id = Math.floor(tiempo / 260);

            if (ciclo < 28) {
                const px = (id * 211) % (ANCHO - 300) + 120 + ciclo * 12;
                const py = 30 + (id * 53) % 100 + ciclo * 5;

                ctx.globalAlpha = 1 - ciclo / 28;
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px - 36, py - 15);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }
    }

    // Fenómenos por delante del fondo: rayos de luz, pájaros, relámpagos y calor.
    function dibujarEventosFrente(mundo) {
        const n = ecosistemaActual();

        // Rayos de luz que se desplazan lentamente.
        if (n === 3 || n === 7) {
            ctx.globalAlpha = 0.06;
            ctx.fillStyle = mundo.luz;

            for (let i = 0; i < 5; i++) {
                const bx = mod(i * 230 + tiempo * 0.2 - camaraX * 0.1, ANCHO + 300) - 150;
                const ancho = 26 + (i % 3) * 12;

                ctx.beginPath();
                ctx.moveTo(bx, 0);
                ctx.lineTo(bx + ancho, 0);
                ctx.lineTo(bx + ancho - 170, 400);
                ctx.lineTo(bx - 170, 400);
                ctx.closePath();
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Pájaros que cruzan el cielo aleteando.
        const coloresPajaro = { 1: "#a8f0bf", 3: "#3a2418", 5: "#e8f6ff", 6: "#d9f8ff", 7: "#ffffff", 9: "#d7f3d2" };

        if (coloresPajaro[n]) {
            const color = coloresPajaro[n];
            ctx.globalAlpha = 0.85;

            for (let i = 0; i < 5; i++) {
                const bx = mod(i * 230 + tiempo * (0.7 + (i % 3) * 0.2) - camaraX * 0.04, ANCHO + 160) - 80;
                const by = 60 + (i * 37) % 90 + Math.sin(tiempo * 0.04 + i) * 10;
                const ala = Math.floor(tiempo / 7 + i) % 2 === 0 ? 0 : 2;

                rectangulo(bx, by + ala, 5, 2, color);
                rectangulo(bx + 5, by + ala, 5, 2, color);
                rectangulo(bx + 4, by + 1, 2, 3, color);
            }
            ctx.globalAlpha = 1;
        }

        // Relámpagos con destello de pantalla.
        if (n === 5 || n === 7 || n === 9) {
            const t = tiempo + 90;
            const ciclo = t % 420;
            const id = Math.floor(t / 420);

            if (ciclo < 14) {
                if (!opciones.reducirMovimiento && ciclo % 6 < 3) {
                    ctx.globalAlpha = 0.22;
                    ctx.fillStyle = "#ffffff";
                    ctx.fillRect(0, 0, ANCHO, ALTO);
                }

                let bx = (id * 337) % (ANCHO - 200) + 100;

                ctx.globalAlpha = 0.9;
                ctx.strokeStyle = "#f4f0ff";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(bx, 0);

                for (let k = 1; k <= 7; k++) {
                    bx += ((id * 13 + k * 29) % 41) - 20;
                    ctx.lineTo(bx, k * 50);
                }

                ctx.stroke();
                ctx.globalAlpha = 1;
            }
        }

        // Aire caliente que ondula sobre el horizonte.
        if (n === 3 || n === 4) {
            ctx.globalAlpha = 0.07;
            ctx.fillStyle = mundo.luz;

            for (let i = 0; i < 7; i++) {
                const desvio = Math.round(Math.sin(tiempo * 0.06 + i * 0.9) * 14);
                ctx.fillRect(desvio, 330 + i * 10, ANCHO, 3);
            }
            ctx.globalAlpha = 1;
        }
    }

    // Detalles sobre el suelo que se mueven o brillan (pasto, cristales, lava...).
    function dibujarDecoraciones() {
        const n = ecosistemaActual();

        for (const p of plataformas) {
            if (p.tipo !== "suelo" || p.hielo) continue;

            const desde = Math.max(p.x + 4, camaraX - 12);
            const hasta = Math.min(p.x + p.ancho - 6, camaraX + ANCHO + 12);

            for (let wx = Math.ceil(desde / 22) * 22; wx < hasta; wx += 22) {
                const r = (Math.imul(wx, 2654435761) >>> 0) % 100;
                if (r > 70) continue;

                const sx = wx - camaraX;
                const brisa = Math.sin(tiempo * 0.05 + wx * 0.1);
                const pulso = 0.5 + 0.5 * Math.sin(tiempo * 0.08 + wx * 0.05);

                if ([1, 3, 5, 9].includes(n)) {
                    // Hierbas, helechos y juncos según el ecosistema.
                    const alto = (n === 5 || n === 9) ? 12 + r % 12 : 6 + r % 8;
                    const color = n === 3 ? "#a6a64e" : ((n === 5 || n === 9) ? "#3f8f74" : "#5be39a");
                    const dx = Math.round(brisa * 2);

                    rectangulo(sx + dx, p.y - alto, 2, alto, color);
                    rectangulo(sx - 3 + Math.round(dx / 2), p.y - alto + 3, 2, alto - 3, color);
                    rectangulo(sx + 3 + Math.round(dx / 2), p.y - alto + 2, 2, alto - 2, color);

                    if (n === 5 || n === 9) {
                        rectangulo(sx + dx, p.y - alto, 3, 5, n === 9 ? "#8a6e48" : "#8a9a56");
                    } else if (r % 7 === 0) {
                        rectangulo(sx + 1 + dx, p.y - alto - 3, 3, 3, r % 2 === 0 ? "#ffd84d" : "#ff8fb1");
                    }
                } else if (n === 4) {
                    // Piedras y arbustos del desierto.
                    rectangulo(sx, p.y - 4, 7, 4, "#8c6a3a");
                    rectangulo(sx + 1, p.y - 6, 4, 2, "#a98250");
                } else if (n === 6 || n === 7 || n === 8 || n === 10) {
                    // Reflejos del agua y pequeños corales o conchas.
                    ctx.globalAlpha = 0.3 + 0.6 * pulso;
                    rectangulo(sx, p.y + 9, 10, 2, n === 7 ? "#efffff" : (n === 6 ? "#b8fff1" : "#70eaff"));
                    if (n === 6 && r % 3 === 0) {
                        rectangulo(sx + 5, p.y + 4, 3, 4, "#8dbb83");
                    }
                    if ((n === 8 || n === 10) && r % 2 === 0) {
                        rectangulo(sx + 5, p.y + 5, 3, 5, n === 10 ? "#59b8b0" : "#ff8c9c");
                    }
                    ctx.globalAlpha = 1;
                }
            }
        }
    }

    function dibujarFondo() {
        const mundos = [
            { cielo: "#12394b", horizonte: "#347b63", suelo: "#284b39", luz: "#75edaa" }, // Selva tropical
            { cielo: "#263d59", horizonte: "#7895a6", suelo: "#718c9a", luz: "#e4f5ff" }, // Taiga y tundra
            { cielo: "#687644", horizonte: "#c1a45e", suelo: "#817442", luz: "#ffe49a" }, // Sabana
            { cielo: "#874d32", horizonte: "#e4a552", suelo: "#a66b36", luz: "#ffe49a" }, // Desierto
            { cielo: "#183c49", horizonte: "#387c70", suelo: "#31513e", luz: "#8affb2" }, // Humedal
            { cielo: "#4b9cb8", horizonte: "#89d1d2", suelo: "#397f79", luz: "#fff8b5" }, // Río
            { cielo: "#4c8294", horizonte: "#9ac8bd", suelo: "#657b70", luz: "#fff3c2" }, // Costa
            { cielo: "#06445f", horizonte: "#087d91", suelo: "#176c72", luz: "#83fff0" }, // Arrecife
            { cielo: "#204c45", horizonte: "#4d8070", suelo: "#3e6250", luz: "#c2edaa" }, // Manglar
            { cielo: "#031b38", horizonte: "#07516a", suelo: "#16475a", luz: "#7ef6ed" } // Océano profundo
        ];

        const n = ecosistemaActual();
        const mundo = mundos[n - 1];
        const bajoElAgua = n === 8 || n === 10;

        const gradiente = ctx.createLinearGradient(0, 0, 0, ALTO);
        gradiente.addColorStop(0, mundo.cielo);
        gradiente.addColorStop(1, mundo.horizonte);

        ctx.fillStyle = gradiente;
        ctx.fillRect(0, 0, ANCHO, ALTO);

        // El cielo respira en tierra; bajo el agua aparecen haces de luz.
        if (!bajoElAgua) {
            ctx.globalAlpha = 0.04 + Math.abs(Math.sin(tiempo * 0.012)) * 0.05;
            ctx.fillStyle = mundo.luz;
            ctx.fillRect(0, 0, ANCHO, ALTO * 0.7);
            ctx.globalAlpha = 1;
        } else {
            for (let i = 0; i < 7; i++) {
                const x = mod(i * 175 + tiempo * 0.16 - camaraX * 0.04, ANCHO + 180) - 90;
                const pulso = 0.035 + Math.abs(Math.sin(tiempo * 0.018 + i)) * 0.055;
                ctx.globalAlpha = pulso;
                ctx.fillStyle = mundo.luz;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x + 34, 0);
                ctx.lineTo(x + 150, ALTO);
                ctx.lineTo(x + 92, ALTO);
                ctx.closePath();
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        // Auroras y estrellas fugaces.
        dibujarEventosCielo();

        // Estrellas o partículas luminosas.
        for (let i = 0; !bajoElAgua && i < 65; i++) {
            const x = (i * 137 + 31) % ANCHO;
            const y = (i * 71 + 13) % 260;

            ctx.globalAlpha =
                0.35 + Math.abs(Math.sin(tiempo * 0.035 + i)) * 0.65;

            rectangulo(x, y, i % 4 === 0 ? 3 : 2, 2, mundo.luz);
        }

        ctx.globalAlpha = 1;

        // Sol o luna (se desplaza según avanzas por el nivel).
        if (!bajoElAgua) dibujarSolLuna(mundo);

        // Nubes en planos con contraste suave: sombra inferior y luz superior.
        // Se mantienen translúcidas para conservar visibles el cielo y las siluetas.
        ctx.globalAlpha = bajoElAgua ? 0 : 0.12;
        ctx.fillStyle = mundo.cielo;
        for (let i = 0; !bajoElAgua && i < 6; i++) {
            const W = ANCHO + 240;
            const nx = Math.round(
                mod(i * 210 + tiempo * (0.12 + (i % 3) * 0.05) - camaraX * 0.06, W) - 120
            );
            const ny = 40 + (i * 53) % 130;
            const nw = 70 + (i % 3) * 30;
            ctx.fillRect(nx + 8, ny + 7, nw - 8, 12);
        }

        ctx.globalAlpha = 0.30;
        ctx.fillStyle = mundo.luz;
        for (let i = 0; !bajoElAgua && i < 6; i++) {
            const W = ANCHO + 240;
            const nx = Math.round(
                mod(i * 210 + tiempo * (0.12 + (i % 3) * 0.05) - camaraX * 0.06, W) - 120
            );
            const ny = 40 + (i * 53) % 130;
            const nw = 70 + (i % 3) * 30;

            ctx.fillRect(nx, ny, nw, 10);
            ctx.fillRect(nx + 12, ny - 8, nw - 30, 10);
            ctx.fillRect(nx + 6, ny + 10, nw - 14, 6);
            // Pequeños brillos pixelados que hacen más legible la forma de nube.
            ctx.globalAlpha = 0.20;
            ctx.fillRect(nx + 20, ny - 5, Math.max(10, nw - 48), 3);
            ctx.globalAlpha = 0.30;
        }
        ctx.globalAlpha = 1;

        // Capas lejanas con siluetas y velocidades distintas.
        dibujarCapaLejana(mundo);
        dibujarSiluetasMundo(mundo);

        // Agua con bandas de profundidad para ríos, costa, manglar y océanos.
        if ([6, 7, 8, 9, 10].includes(n)) {
            const nivelAgua = { 6: 328, 7: 296, 8: 0, 9: 350, 10: 0 }[n];
            const aguaClara = n === 7 ? "#65c5c5" : "#28a9ac";
            const aguaOscura = n === 10 ? "#062b49" : "#12677a";
            ctx.globalAlpha = 0.52;
            ctx.fillStyle = aguaOscura;
            ctx.fillRect(0, nivelAgua + 26, ANCHO, ALTO - nivelAgua - 26);
            ctx.globalAlpha = 0.48;
            ctx.fillStyle = aguaClara;
            for (let i = 0; i < 7; i++) {
                const y = nivelAgua + i * 18 + Math.sin(tiempo * 0.025 + i) * 4;
                const x = mod(i * 143 - tiempo * (0.35 + i % 3 * 0.12) - camaraX * 0.15, ANCHO + 150) - 75;
                ctx.fillRect(x, y, 92 + (i % 3) * 22, 3);
            }
            ctx.globalAlpha = 1;
        }

        // Relieve de montaña en tierra; los ecosistemas acuáticos tienen orillas o fondo marino.
        const paisajeTerrestre = ![6, 7, 8, 9, 10].includes(n);
        for (let i = 0; i < (paisajeTerrestre ? 9 : 0); i++) {
            const x = i * 150 - (camaraX * 0.15) % 150;
            const altura = 180 + (i % 4) * 25;

            ctx.fillStyle = mundo.horizonte;
            ctx.beginPath();
            ctx.moveTo(x, 390);
            ctx.lineTo(x + 75, altura);
            ctx.lineTo(x + 150, 390);
            ctx.closePath();
            ctx.fill();

            // Nieve en las montañas del mundo 2.
            if (n === 2) {
                ctx.fillStyle = "#eafaff";
                ctx.beginPath();
                ctx.moveTo(x + 54, altura + 35);
                ctx.lineTo(x + 75, altura);
                ctx.lineTo(x + 96, altura + 35);
                ctx.lineTo(x + 80, altura + 27);
                ctx.lineTo(x + 72, altura + 31);
                ctx.closePath();
                ctx.fill();
            }

        }

        // Coníferas estrechas características de la taiga.
        if (n === 2) {
            for (let i = 0; i < 10; i++) {
                const x = i * 120 - (camaraX * 0.25) % 120;
                const altura = 65 + (i % 4) * 18;
                rectangulo(x + 44, 390 - altura, 9, altura, "#584c42");
                ctx.fillStyle = i % 2 ? "#315b56" : "#3a6b62";
                ctx.beginPath();
                ctx.moveTo(x + 48, 390 - altura);
                ctx.lineTo(x + 17, 390 - altura * 0.25);
                ctx.lineTo(x + 79, 390 - altura * 0.25);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x + 48, 390 - altura * 0.62);
                ctx.lineTo(x + 22, 390 - altura * 0.05);
                ctx.lineTo(x + 74, 390 - altura * 0.05);
                ctx.closePath();
                ctx.fill();
            }
        }

        // Árboles de selva y bosque inundable.
        if (n === 1 || n === 5) {
            for (let i = 0; i < 12; i++) {
                const x = i * 105 - (camaraX * 0.32) % 105;
                // Las copas se balancean un poco con el "viento".
                const balanceo = Math.round(Math.sin(tiempo * 0.03 + i) * 1.5);

                rectangulo(x + 20, 295, 12, 85, "#583b36");
                rectangulo(x + 2 + balanceo, 275, 48, 38, "#28794f");
                rectangulo(x + 9 + balanceo, 260, 34, 28, "#39a65f");
                rectangulo(x + 17 + balanceo, 270, 8, 7, "#78e58a");
            }
        }

        // Dunas y cactus del desierto cálido.
        if (n === 4) {
            for (let i = 0; i < 8; i++) {
                const x = i * 145 - (camaraX * 0.3) % 145;

                ctx.fillStyle = "#f4bd65";
                ctx.beginPath();
                ctx.ellipse(x + 65, 375, 90, 25, 0, 0, Math.PI * 2);
                ctx.fill();

                rectangulo(x + 70, 315, 12, 60, "#367c4b");
                rectangulo(x + 55, 330, 15, 8, "#367c4b");
                rectangulo(x + 55, 322, 8, 16, "#367c4b");
                rectangulo(x + 82, 340, 15, 8, "#367c4b");
                rectangulo(x + 89, 330, 8, 18, "#367c4b");
            }
        }

        // Acacias de copa plana en la sabana.
        if (n === 3) {
            for (let i = 0; i < 10; i++) {
                const x = i * 132 - (camaraX * 0.28) % 132;
                const altura = 55 + (i % 4) * 15;
                rectangulo(x + 48, 390 - altura, 10, altura, "#76583a");
                rectangulo(x + 20, 390 - altura - 10, 68, 13, "#68733e");
                rectangulo(x + 30, 390 - altura - 18, 48, 10, "#87904a");
            }
        }

        // Corales de colores en el arrecife y formas bioluminiscentes al fondo.
        if (n === 8 || n === 10) {
            for (let i = 0; i < 8; i++) {
                const x = i * 132 - (camaraX * 0.24) % 132;
                const base = 414 + (i % 3) * 8;
                const tono = n === 10
                    ? (i % 2 ? "#267b88" : "#406c91")
                    : ["#ef7f91", "#f1bd68", "#6ce0c0"][i % 3];
                rectangulo(x + 50, base - 55, 8, 55, tono);
                rectangulo(x + 33, base - 38, 25, 7, tono);
                rectangulo(x + 33, base - 51, 7, 20, tono);
                rectangulo(x + 55, base - 30, 25, 7, tono);
                rectangulo(x + 73, base - 45, 7, 21, tono);
            }
        }

        // Troncos con raíces aéreas en los canales del manglar.
        if (n === 9) {
            for (let i = 0; i < 7; i++) {
                const x = i * 155 - (camaraX * 0.25) % 155;
                const tronco = "#665844";
                rectangulo(x + 58, 250, 13, 132, tronco);
                rectangulo(x + 38, 238, 54, 19, "#496b4c");
                rectangulo(x + 44, 225, 42, 15, "#5d8551");
                rectangulo(x + 38, 335, 5, 74, tronco);
                rectangulo(x + 66, 350, 5, 62, tronco);
                rectangulo(x + 87, 330, 5, 78, tronco);
            }
        }

        // Bruma que flota y se desplaza sola.
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = mundo.luz;
        for (let i = 0; i < 8; i++) {
            const bx = mod(i * 170 + tiempo * (0.15 + (i % 3) * 0.05) - camaraX * 0.12, ANCHO + 200) - 100;
            ctx.fillRect(Math.round(bx), 392 + (i % 3) * 10, 120 + (i % 4) * 30, 10);
        }
        ctx.globalAlpha = 1;

        // Pájaros, rayos de luz, relámpagos y calor.
        dibujarEventosFrente(mundo);

        // Fauna lejana propia de cada ecosistema: aporta movimiento sin interferir
        // con las plataformas ni con los enemigos del recorrido.
        dibujarFaunaAmbiental();

        // Partículas ambientales del mundo.
        dibujarAmbiente();
    }

    function crearFaunaAmbiental() {
        const especies = FAUNA_AMBIENTAL_ECOSISTEMA[ecosistemaActual()] || ["luciernaga"];
        const cantidad = 6 + (nivelActual % 3);
        const rango = Math.max(1, longitudNivel - 380);

        for (let i = 0; i < cantidad; i++) {
            // Hash estable por nivel: el paisaje conserva su personalidad al reiniciar.
            const hash = Math.imul((nivelActual * 97 + i * 131 + 17) | 0, 2654435761) >>> 0;
            const especie = especies[hash % especies.length];
            faunaAmbiental.push({
                especie,
                x: 180 + (hash >>> 5) % rango,
                y: 105 + (hash >>> 13) % 195,
                fase: (hash % 1000) / 100,
                escala: 0.75 + ((hash >>> 21) % 4) * 0.1,
                color: hash % 2 ? "#e8f2c4" : "#d4e8e8"
            });
        }
    }

    function dibujarFaunaAmbiental() {
        const n = ecosistemaActual();
        const bajoElAgua = n === 8 || n === 10;

        for (const animal of faunaAmbiental) {
            const x = animal.x - camaraX * 0.34 + Math.sin(tiempo * 0.025 + animal.fase) * 5;
            const aleteo = Math.sin(tiempo * 0.16 + animal.fase);
            const y = animal.y + Math.sin(tiempo * 0.035 + animal.fase) * 5;
            const escala = animal.escala;
            if (x < -30 || x > ANCHO + 30) continue;
            descubrirFauna(animal.especie, n);

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(escala, escala);
            ctx.globalAlpha = 0.62;
            const color = animal.color;

            if (animal.especie === "ave") {
                const ala = Math.round(Math.abs(aleteo) * 3);
                rectangulo(0, 2, 11, 4, color);
                rectangulo(10, 1, 4, 4, color);
                rectangulo(3, 2 - ala, 5, 2, color);
                rectangulo(5, 5 + ala, 5, 2, color);
                rectangulo(14, 2, 3, 2, "#f2c66d");
            } else if (animal.especie === "mariposa" || animal.especie === "libelula") {
                rectangulo(5, 1, 3, 11, "#26394b");
                const ala = Math.round(Math.abs(aleteo) * 3);
                rectangulo(0, 2 - ala, 5, 5 + ala, animal.especie === "libelula" ? "#a9e8ed" : "#f1a7c7");
                rectangulo(8, 2 - ala, 5, 5 + ala, animal.especie === "libelula" ? "#a9e8ed" : "#f4d77a");
                rectangulo(2, 8, 4, 3, "#f5ebd0");
                rectangulo(8, 8, 4, 3, "#f5ebd0");
            } else if (animal.especie === "pez") {
                rectangulo(3, 2, 14, 8, n === 10 ? "#75d9dc" : "#f3c76e");
                rectangulo(0, 3, 4, 6, n === 10 ? "#4ba5b5" : "#ed8c79");
                rectangulo(13, 4, 2, 2, "#102d42");
                rectangulo(7, 0, 5, 3, "#b4edf0");
            } else if (animal.especie === "medusa") {
                const brillo = 0.65 + Math.abs(aleteo) * 0.3;
                ctx.globalAlpha *= brillo;
                rectangulo(3, 1, 13, 8, "#b79bdf");
                rectangulo(1, 6, 17, 4, "#d7b8ef");
                rectangulo(4, 10, 2, 8, "#a8eaf0");
                rectangulo(9, 10, 2, 10, "#a8eaf0");
                rectangulo(14, 10, 2, 7, "#a8eaf0");
            } else if (animal.especie === "cangrejo") {
                rectangulo(4, 4, 13, 7, "#e47863");
                rectangulo(1, 1, 5, 4, "#f3a66e");
                rectangulo(15, 1, 5, 4, "#f3a66e");
                for (let pata = 0; pata < 3; pata++) rectangulo(5 + pata * 4, 11 + (pata % 2), 2, 4, "#d8675c");
                rectangulo(7, 3, 2, 2, "#fff4d6");
                rectangulo(13, 3, 2, 2, "#fff4d6");
            } else if (animal.especie === "liebre") {
                rectangulo(3, 6, 13, 7, "#e7e9e2");
                rectangulo(13, 3, 7, 6, "#f6f4ec");
                rectangulo(14, -3, 3, 7, "#e7e9e2");
                rectangulo(18, -2, 3, 6, "#e7e9e2");
                rectangulo(18, 5, 2, 2, "#33394c");
            } else if (animal.especie === "rana") {
                rectangulo(3, 5, 14, 8, "#79b875");
                rectangulo(4, 2, 5, 5, "#9bd687");
                rectangulo(12, 2, 5, 5, "#9bd687");
                rectangulo(6, 4, 2, 2, "#273c36");
                rectangulo(14, 4, 2, 2, "#273c36");
            } else if (animal.especie === "lagartija" || animal.especie === "escarabajo") {
                const tono = animal.especie === "escarabajo" ? "#b69654" : "#86a85b";
                rectangulo(4, 4, 13, 6, tono);
                rectangulo(1, 6, 5, 2, tono);
                rectangulo(15, 5, 5, 4, tono);
                rectangulo(6, 10, 2, 4, tono);
                rectangulo(14, 10, 2, 4, tono);
                rectangulo(16, 6, 2, 2, "#202a30");
            } else if (animal.especie === "luciernaga") {
                const pulso = 0.4 + Math.abs(aleteo) * 0.6;
                ctx.globalAlpha *= pulso;
                ctx.fillStyle = "#fff1a1";
                ctx.beginPath();
                ctx.arc(7, 6, 8, 0, Math.PI * 2);
                ctx.fill();
                rectangulo(5, 4, 5, 5, "#fff4a8");
                rectangulo(6, 8, 3, 3, "#f2bd62");
            }

            ctx.restore();
        }
        ctx.globalAlpha = 1;
    }

    const MATERIALES_ECOSISTEMA = [
        { base: "#284b39", arriba: "#4bd18a", sombra: "#19362e", detalle: "#386b45", acento: "#8de36a" }, // Selva
        { base: "#718c9a", arriba: "#e4f5ff", sombra: "#456574", detalle: "#a9d5e7", acento: "#ffffff" }, // Taiga
        { base: "#817442", arriba: "#c0ad59", sombra: "#554c35", detalle: "#a6974e", acento: "#d6c66a" }, // Sabana
        { base: "#a66b36", arriba: "#f4bd65", sombra: "#71452f", detalle: "#c28b4c", acento: "#f7d58a" }, // Desierto
        { base: "#31513e", arriba: "#8affb2", sombra: "#203a35", detalle: "#47745b", acento: "#b4e384" }, // Humedal
        { base: "#397f79", arriba: "#70eaff", sombra: "#245657", detalle: "#55aaa0", acento: "#b8fff1" }, // Río
        { base: "#657b70", arriba: "#c4eee0", sombra: "#3c5555", detalle: "#879d8b", acento: "#e7fff0" }, // Costa
        { base: "#176c72", arriba: "#83fff0", sombra: "#104653", detalle: "#258a87", acento: "#ff9ab4" }, // Arrecife
        { base: "#3e6250", arriba: "#9ed69b", sombra: "#29463e", detalle: "#66865b", acento: "#b6a16b" }, // Manglar
        { base: "#16475a", arriba: "#7ef6ed", sombra: "#0a2b43", detalle: "#287084", acento: "#87a9ef" } // Océano profundo
    ];

    function dibujarTexturaMaterial(x, y, ancho, alto, mundoX, material, ecosistema) {
        if (alto < 20 || ancho < 18) return;

        const desde = Math.ceil(mundoX / 24) * 24;
        for (let wx = desde; wx < mundoX + ancho - 5; wx += 24) {
            const hash = Math.imul((wx + ecosistema * 7919) | 0, 2654435761) >>> 0;
            const largo = 4 + ((hash >>> 11) % 8);
            const px = Math.min(x + ancho - 13, x + wx - mundoX + 3 + (hash % 7));
            const py = y + 9 + ((hash >>> 5) % Math.max(1, alto - 20));
            const color = hash % 3 === 0 ? material.acento : material.detalle;

            if (ecosistema === 1) {
                // Hojas en capas para la selva tropical.
                rectangulo(px, py, 4, 3, material.sombra);
                rectangulo(px + 3, py - 2, 5, 3, color);
                rectangulo(px + 5, py + 2, 4, 2, material.acento);
            } else if (ecosistema === 3) {
                // Hierba seca y pequeñas grietas de la sabana.
                rectangulo(px, py, 2, 5, color);
                rectangulo(px + 2, py + 3, 5, 2, material.sombra);
                rectangulo(px + 6, py + 1, 2, 3, material.acento);
            } else if (ecosistema === 5) {
                // Juncos cortos y marcas de barro del humedal.
                rectangulo(px, py, 2, 5 + (hash % 4), material.acento);
                rectangulo(px + 3, py + 4, largo, 2, material.sombra);
            } else if (ecosistema === 9) {
                // Vetas verticales de raíces del manglar.
                rectangulo(px, py, 3, 6 + (hash % 5), material.detalle);
                rectangulo(px + 3, py + 4, 5, 2, material.sombra);
            } else if (ecosistema === 4) {
                // Granos y estratos cortos de arena.
                rectangulo(px, py, largo, 2, color);
                if (hash % 4 === 0) rectangulo(px + 3, py + 4, 3, 2, material.sombra);
            } else if (ecosistema === 2) {
                // Facetas de hielo y nieve.
                rectangulo(px, py, largo, 2, color);
                rectangulo(px + 2, py + 4, Math.max(3, largo - 5), 2, material.sombra);
            } else if ([6, 7].includes(ecosistema)) {
                // Guijarros y capas de roca erosionada.
                rectangulo(px, py, largo, 3, color);
                rectangulo(px + 2, py + 3, Math.max(3, largo - 4), 2, material.sombra);
            } else if ([8, 10].includes(ecosistema)) {
                // Nódulos de coral y minerales del fondo marino.
                rectangulo(px, py, 4 + (hash % 4), 4, color);
                rectangulo(px + 2, py + 4, 3, 2, material.sombra);
            } else {
                // Motas de tierra, hojas y vetas de raíces.
                rectangulo(px, py, largo, 2, color);
                if (hash % 4 === 0) rectangulo(px + 3, py + 3, 3, 3, material.sombra);
            }
        }
    }

    function dibujarPlataformas() {
        const ecosistema = ecosistemaActual();
        const material = MATERIALES_ECOSISTEMA[ecosistema - 1];

        for (const p of plataformas) {
            const x = p.x - camaraX;

            // No dibujar plataformas fuera de la pantalla.
            if (x + p.ancho < 0 || x > ANCHO) continue;

            if (p.rutaSecreta && !p.descubierta) continue;
            if (p.cae && p.activa === false) continue;

            if (p.tipo === "suelo" && p.hielo) {
                // Suelo de hielo con brillo.
                rectangulo(x, p.y, p.ancho, p.alto, "#4f8fbf");
                rectangulo(x, p.y, p.ancho, 8, "#bfeaff");
                rectangulo(x, p.y + 8, p.ancho, 4, "#8fd0f0");

                const brillo = mod(tiempo * 2 + p.x, p.ancho);
                rectangulo(x + brillo, p.y + 1, 12, 3, "#ffffff");
                rectangulo(x + mod(brillo + p.ancho / 2, p.ancho), p.y + 1, 8, 2, "#ffffff");
            } else if (p.tipo === "suelo") {
                // Suelo del escenario.
                rectangulo(x, p.y, p.ancho, p.alto, material.base);
                rectangulo(x, p.y, p.ancho, 7, material.arriba);
                rectangulo(x, p.y + 7, p.ancho, 4, material.detalle);
                dibujarTexturaMaterial(x, p.y, p.ancho, p.alto, p.x, material, ecosistema);
            } else if (p.cae) {
                // Plataforma frágil: marrón con grietas, tiembla antes de caer.
                const sacudida = p.temblando > 0 && !p.cayendo ? (tiempo % 4 < 2 ? -1 : 1) : 0;
                const px = x + sacudida;

                rectangulo(px, p.y, p.ancho, p.alto, "#8a5a48");
                rectangulo(px, p.y, p.ancho, 5, "#d98c5f");
                rectangulo(px + 6, p.y + 7, p.ancho - 12, 3, "#5c3a30");
                rectangulo(px + p.ancho * 0.3, p.y + 5, 2, p.alto - 5, "#3a2420");
                rectangulo(px + p.ancho * 0.65, p.y + 5, 2, p.alto - 8, "#3a2420");
            } else if (p.tipo === "ruta") {
                rectangulo(x, p.y, p.ancho, p.alto, "#354c68");
                rectangulo(x, p.y, p.ancho, 5, material.arriba);
                rectangulo(x + 8, p.y + 8, p.ancho - 16, 3, material.base);
                for (let brillo = 10; brillo < p.ancho - 8; brillo += 24) {
                    rectangulo(x + brillo, p.y + 1, 4, 3, "#fff2a6");
                }
            } else {
                // Plataformas elevadas con la misma identidad material del bioma.
                rectangulo(x, p.y, p.ancho, p.alto, material.base);
                rectangulo(x, p.y, p.ancho, 5, material.arriba);
                rectangulo(x, p.y + 5, p.ancho, 3, material.detalle);
                rectangulo(x + 4, p.y + 8, Math.max(0, p.ancho - 8), Math.max(0, p.alto - 8), material.sombra);
                dibujarTexturaMaterial(x, p.y, p.ancho, p.alto, p.x, material, ecosistema);
            }
        }
    }

    function dibujarTrampolines() {
        for (const t of trampolines) {
            const x = t.x - camaraX;
            if (x + t.ancho < 0 || x > ANCHO) continue;

            const altura = 6 - t.comp * 0.4;
            const yAlmohadilla = t.y + t.comp * 0.4;

            // Base y muelle.
            rectangulo(x + 2, t.y + 10, t.ancho - 4, 4, "#2e3a58");
            for (let k = 0; k < 3; k++) {
                rectangulo(x + 6 + k * 9, yAlmohadilla + 4, 4, altura, "#cfd8ee");
            }

            // Almohadilla.
            rectangulo(x, yAlmohadilla, t.ancho, 4, t.color || "#ff5a6e");
            rectangulo(x + 3, yAlmohadilla, t.ancho - 6, 2, "#ffe8b0");

            if (Math.abs(jugador.x + jugador.ancho / 2 - (t.x + t.ancho / 2)) < 235) {
                textoCentrado("↑ IMPULSO", x + t.ancho / 2, t.y - 8, 8, "#ffe16b");
            }
        }
    }

    function dibujarPlantas() {
        for (const pl of plantas) {
            if (!pl.vivo) continue;

            const x = pl.x - camaraX;
            if (x + pl.ancho < 0 || x > ANCHO) continue;

            const h = pl.altura;
            const ciclo = (tiempo + pl.fase) % 200;
            const aviso = ciclo >= 50 && ciclo < 80;
            const temblor = aviso ? Math.round(Math.sin(tiempo * 1.2) * 1.5) : 0;
            const cx = x + pl.ancho / 2;
            const verde = pl.golpe > 0 ? "#ffffff" : pl.tallo;
            const flor = pl.golpe > 0 ? "#ffffff" : pl.flor;
            const arriba = SUELO - h;
            const balanceo = Math.round(Math.sin(tiempo * 0.12 + pl.fase) * (aviso ? 2 : 1));

            // La silueta cambia en cada mundo, aunque conserva el mismo ciclo
            // de aviso y una zona de daño predecible para la jugabilidad.
            if (h > 2 && h < 24) {
                // Brote común durante el crecimiento para evitar segmentos
                // negativos en las siluetas más altas.
                rectangulo(cx - 3, SUELO - h, 6, h, verde);
                rectangulo(cx - 11 + balanceo, SUELO - h + 4, 8, 3, verde);
                rectangulo(cx + 3 - balanceo, SUELO - h + 7, 8, 3, verde);
            } else if (h >= 24) {
                switch (pl.tipo) {
                    case "atrapamoscas": {
                        rectangulo(cx - 3, arriba + 8, 6, h - 8, verde);
                        rectangulo(cx - 12 + temblor, arriba + 2, 13, 8, flor);
                        rectangulo(cx - 11 + temblor, arriba + 6, 11, 5, "#f4d46a");
                        rectangulo(cx - 10 + temblor, arriba + 4, 2, 3, "#fff5d0");
                        rectangulo(cx + 1 + temblor, arriba + 3, 12, 7, flor);
                        rectangulo(cx + 1 + temblor, arriba + 8, 10, 4, "#f4d46a");
                        for (let i = 0; i < 3; i++) rectangulo(cx - 10 + i * 7 + temblor, arriba + 7, 2, 3, "#fff5d0");
                        break;
                    }
                    case "rocío":
                        rectangulo(cx - 2, arriba + 9, 4, h - 9, verde);
                        for (let i = 0; i < 5; i++) {
                            const dx = (i - 2) * 5;
                            rectangulo(cx + dx - 2, arriba + 8 + Math.abs(i - 2) * 2, 4, 3, verde);
                            rectangulo(cx + dx - 1, arriba + 5 + Math.abs(i - 2) * 2, 3, 3, flor);
                            rectangulo(cx + dx, arriba + 5 + Math.abs(i - 2) * 2, 1, 1, "#fff2d4");
                        }
                        break;
                    case "acacia":
                        rectangulo(cx - 3, arriba + 10, 6, h - 10, verde);
                        rectangulo(cx - 14 + balanceo, arriba + 5, 28, 7, verde);
                        rectangulo(cx - 10 + balanceo, arriba, 20, 7, verde);
                        rectangulo(cx - 14 + balanceo, arriba + 8, 5, 3, flor);
                        rectangulo(cx + 9 + balanceo, arriba + 8, 5, 3, flor);
                        rectangulo(cx - 18 + temblor, arriba + 7, 6, 2, "#f4e6b9");
                        rectangulo(cx + 12 + temblor, arriba + 7, 6, 2, "#f4e6b9");
                        break;
                    case "cactus":
                        rectangulo(cx - 5, arriba + 2, 10, h - 2, verde);
                        rectangulo(cx - 13 + balanceo, arriba + 15, 7, 5, verde);
                        rectangulo(cx - 13 + balanceo, arriba + 9, 5, 11, verde);
                        rectangulo(cx + 6 + balanceo, arriba + 21, 7, 5, verde);
                        rectangulo(cx + 8 + balanceo, arriba + 14, 5, 12, verde);
                        for (let i = -1; i <= 1; i++) rectangulo(cx + i * 5, arriba + 11, 2, 2, "#f7e8be");
                        rectangulo(cx - 2, arriba - 2, 4, 4, flor);
                        break;
                    case "vejiga":
                        rectangulo(cx - 2, arriba + 8, 4, h - 8, verde);
                        for (let i = 0; i < 4; i++) {
                            const dx = (i - 1.5) * 7;
                            rectangulo(cx + dx - 3, arriba + 7 + (i % 2) * 3, 6, 7, verde);
                            rectangulo(cx + dx - 2, arriba + 12 + (i % 2) * 3, 4, 2, "#174d4b");
                            rectangulo(cx + dx - 1, arriba + 5 + (i % 2) * 3, 2, 3, flor);
                        }
                        rectangulo(cx - 4, arriba + 1, 8, 5, flor);
                        break;
                    case "nenufar":
                        rectangulo(cx - 2, arriba + 5, 4, h - 5, verde);
                        rectangulo(cx - 16 + balanceo, arriba + 8, 14, 6, verde);
                        rectangulo(cx + 2 + balanceo, arriba + 12, 14, 6, verde);
                        rectangulo(cx - 13 + balanceo, arriba + 4, 9, 5, flor);
                        rectangulo(cx - 10 + balanceo, arriba + 1, 5, 5, "#fff0c6");
                        rectangulo(cx + 3 + balanceo, arriba + 8, 9, 5, flor);
                        break;
                    case "cardo":
                        rectangulo(cx - 3, arriba + 8, 6, h - 8, verde);
                        for (let i = 0; i < 3; i++) {
                            const dx = (i - 1) * 9;
                            rectangulo(cx + dx - 3, arriba + 10 + Math.abs(i - 1) * 3, 6, 8, verde);
                            rectangulo(cx + dx - 4, arriba + 5 + Math.abs(i - 1) * 3, 8, 7, flor);
                            rectangulo(cx + dx - 7, arriba + 7 + Math.abs(i - 1) * 3, 3, 2, "#e7e1fa");
                            rectangulo(cx + dx + 4, arriba + 7 + Math.abs(i - 1) * 3, 3, 2, "#e7e1fa");
                        }
                        break;
                    case "coral":
                        rectangulo(cx - 5, arriba + 15, 10, h - 15, verde);
                        rectangulo(cx - 12, arriba + 9, 6, 17, verde);
                        rectangulo(cx + 6, arriba + 6, 6, 20, verde);
                        rectangulo(cx - 15, arriba + 5, 9, 7, flor);
                        rectangulo(cx - 7, arriba, 8, 8, flor);
                        rectangulo(cx + 4, arriba + 1, 8, 8, flor);
                        rectangulo(cx + 9, arriba - 3, 7, 7, flor);
                        break;
                    case "raiz":
                        rectangulo(cx - 5, arriba + 4, 10, h - 4, verde);
                        rectangulo(cx - 14 + balanceo, arriba + 6, 8, h * 0.55, verde);
                        rectangulo(cx + 6 + balanceo, arriba + 3, 8, h * 0.65, verde);
                        rectangulo(cx - 13 + temblor, arriba + 3, 8, 5, flor);
                        rectangulo(cx + 5 + temblor, arriba, 8, 5, flor);
                        rectangulo(cx - 2, arriba + 2, 4, 4, "#fff0c6");
                        break;
                    case "anemona":
                        halo(cx, arriba + 15, 20);
                        rectangulo(cx - 7, arriba + 17, 14, h - 17, verde);
                        for (let i = 0; i < 7; i++) {
                            const dx = (i - 3) * 4;
                            const wave = Math.round(Math.sin(tiempo * 0.1 + i + pl.fase) * 2);
                            rectangulo(cx + dx - 2 + wave, arriba + 5 + Math.abs(i - 3), 4, 15, flor);
                            rectangulo(cx + dx - 1 + wave, arriba + 3 + Math.abs(i - 3), 2, 4, "#fff0d4");
                        }
                        break;
                }
            }

            // Señal visual en el punto de salida, antes de que la planta emerja.
            if (aviso) {
                const pulso = 0.9 + Math.sin(tiempo * 0.4) * 0.1;
                ctx.save();
                ctx.globalAlpha = pulso;
                ctx.fillStyle = "#ffcf45";
                ctx.strokeStyle = "#7b2634";
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(cx, SUELO - 55);
                ctx.lineTo(cx - 17, SUELO - 27);
                ctx.lineTo(cx + 17, SUELO - 27);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = "#541c29";
                ctx.font = "bold 20px sans-serif";
                ctx.textAlign = "center";
                ctx.fillText("!", cx, SUELO - 33);
                ctx.restore();
            }
        }
    }

    function dibujarMeta() {
        const x = longitudNivel - 60 - camaraX;
        if (x < -40 || x > ANCHO + 40) return;

        const cumple =
            jugador.diamantes >= 3 &&
            jugador.tieneLlave &&
            (!esNivelJefe() || (jefe && !jefe.vivo));

        rectangulo(x, SUELO - 95, 4, 95, "#dfe8f5");
        rectangulo(x - 2, SUELO - 99, 8, 6, "#ffe16b");

        // Bandera ondeando: verde si ya puedes terminar, roja si falta algo.
        for (let i = 0; i < 7; i++) {
            const onda = Math.sin(tiempo * 0.12 + i * 0.8) * 2.5;
            rectangulo(
                x + 4 + i * 5,
                SUELO - 92 + onda + i * 0.4,
                5,
                24 - i * 1.5,
                cumple ? "#52e08a" : "#ff5a6e"
            );
        }
    }

    function dibujarObstaculosSuelo() {
        for (const p of obstaculosSuelo) {
            const x = p.x - camaraX;
            if (x + p.ancho < 0 || x > ANCHO) continue;
            const y = p.y;
            const base = p.base;
            const detalle = p.detalle;
            const cantidad = Math.max(2, Math.floor(p.ancho / 12));

            if (p.impulso) {
                // Barreras altas colocadas junto a los trampolines. Su
                // silueta conserva el material de cada ecosistema.
                switch (p.tipo) {
                    case "lianas":
                    case "raices":
                        for (let i = 0; i < 5; i++) {
                            const bx = x + 3 + i * (p.ancho - 8) / 4;
                            rectangulo(bx, y + (i % 2) * 12, 5, p.alto - (i % 2) * 12, base);
                            for (let k = 1; k < 7; k++) rectangulo(bx + (k % 2 ? -4 : 4), y + k * 31, 5, 3, detalle);
                        }
                        break;
                    case "hielo":
                        for (let i = 0; i < 3; i++) {
                            const bx = x + i * (p.ancho / 3);
                            const w = p.ancho / 3 + 2;
                            ctx.fillStyle = base; ctx.beginPath();
                            ctx.moveTo(bx, SUELO); ctx.lineTo(bx + w * 0.5, y + (i % 2) * 14); ctx.lineTo(bx + w, SUELO); ctx.closePath(); ctx.fill();
                            rectangulo(bx + w * 0.48, y + 12, 3, p.alto - 20, detalle);
                        }
                        break;
                    case "maleza":
                        rectangulo(x, y + 22, p.ancho, p.alto - 22, base);
                        for (let i = 0; i < 6; i++) {
                            const bx = x + i * (p.ancho - 8) / 5;
                            ctx.fillStyle = i % 2 ? detalle : base; ctx.beginPath();
                            ctx.moveTo(bx, y + 48); ctx.lineTo(bx + 5, y + (i % 2) * 10); ctx.lineTo(bx + 11, y + 48); ctx.closePath(); ctx.fill();
                            rectangulo(bx + 5, y + 46, 3, p.alto - 46, base);
                        }
                        break;
                    case "rocas":
                    case "rio":
                    case "costa":
                        for (let i = 0; i < 4; i++) {
                            const bx = x + i * (p.ancho / 4);
                            const w = p.ancho / 4 + 2;
                            ctx.fillStyle = i % 2 ? base : detalle; ctx.beginPath();
                            ctx.moveTo(bx, SUELO); ctx.lineTo(bx + 2, y + 45 + (i % 2) * 18);
                            ctx.lineTo(bx + w * 0.52, y + (i % 2) * 14); ctx.lineTo(bx + w, y + 55);
                            ctx.lineTo(bx + w, SUELO); ctx.closePath(); ctx.fill();
                            if (p.tipo === "costa") rectangulo(bx + 5, y + 60 + (i % 2) * 16, 5, 4, "#e6dba9");
                        }
                        break;
                    case "tocones":
                        rectangulo(x, y + 5, p.ancho, p.alto - 5, base);
                        for (let k = 0; k < 5; k++) {
                            const bx = x + (k % 2) * 19;
                            const by = y + k * 41;
                            rectangulo(bx, by, p.ancho - 5 - (k % 2) * 8, 38, base);
                            rectangulo(bx, by, p.ancho - 5 - (k % 2) * 8, 5, detalle);
                            rectangulo(bx + 6, by + 13, 6, 6, "#4e382c");
                        }
                        break;
                    case "coral":
                        rectangulo(x + 16, y + 22, 12, p.alto - 22, base);
                        for (let i = 0; i < 4; i++) {
                            const bx = x + i * (p.ancho - 10) / 3;
                            const by = y + 42 + (i % 2) * 17;
                            rectangulo(bx + 5, by, 7, SUELO - by, base);
                            rectangulo(bx, by - 4, 17, 8, detalle);
                        }
                        break;
                    case "ventila":
                        rectangulo(x, y + 42, p.ancho, p.alto - 42, base);
                        rectangulo(x + 4, y + 36, p.ancho - 8, 8, detalle);
                        ctx.save(); ctx.globalAlpha = 0.52;
                        rectangulo(x + 7, y, p.ancho - 14, 38, "#ff895c");
                        ctx.restore();
                        rectangulo(x + 15, y + 8, p.ancho - 30, 22, "#ffd285");
                        break;
                }
                rectangulo(x, y, p.ancho, 4, "#ffe16b");
                continue;
            }

            switch (p.tipo) {
                case "lianas":
                case "maleza": {
                    // Enredaderas selváticas y arbustos de espino de sabana.
                    rectangulo(x, y + 11, p.ancho, 9, base);
                    for (let i = 0; i < cantidad; i++) {
                        const bx = x + (i * p.ancho) / cantidad;
                        const alto = p.tipo === "lianas" ? 11 + (i % 2) * 3 : 7 + (i % 3) * 2;
                        ctx.fillStyle = detalle;
                        ctx.beginPath();
                        ctx.moveTo(bx, y + 13);
                        ctx.lineTo(bx + 5, y + 13 - alto);
                        ctx.lineTo(bx + 10, y + 13);
                        ctx.closePath();
                        ctx.fill();
                    }
                    if (p.tipo === "lianas") {
                        rectangulo(x + 3, y + 4, p.ancho - 6, 3, base);
                        rectangulo(x + 8, y + 7, 3, 6, detalle);
                    }
                    break;
                }
                case "hielo":
                    for (let i = 0; i < cantidad; i++) {
                        const bx = x + (i * p.ancho) / cantidad;
                        const w = p.ancho / cantidad;
                        ctx.fillStyle = base;
                        ctx.beginPath(); ctx.moveTo(bx, y + p.alto); ctx.lineTo(bx + w * 0.52, y + (i % 2 ? 4 : 0)); ctx.lineTo(bx + w, y + p.alto); ctx.closePath(); ctx.fill();
                        ctx.fillStyle = detalle;
                        ctx.beginPath(); ctx.moveTo(bx + w * 0.52, y + 2); ctx.lineTo(bx + w * 0.7, y + 10); ctx.lineTo(bx + w * 0.52, y + 8); ctx.closePath(); ctx.fill();
                    }
                    break;
                case "rocas":
                    for (let i = 0; i < 3; i++) {
                        const bx = x + i * (p.ancho / 3);
                        const w = p.ancho / 3 + 2;
                        ctx.fillStyle = i % 2 ? base : detalle;
                        ctx.beginPath(); ctx.moveTo(bx, y + p.alto); ctx.lineTo(bx + 3, y + 9); ctx.lineTo(bx + w * 0.55, y + 4 + i % 2 * 3); ctx.lineTo(bx + w, y + 13); ctx.lineTo(bx + w, y + p.alto); ctx.closePath(); ctx.fill();
                    }
                    rectangulo(x + 4, y + 14, p.ancho - 8, 3, "#82533b");
                    break;
                case "tocones":
                    for (let i = 0; i < cantidad; i++) {
                        const bx = x + i * (p.ancho / cantidad);
                        rectangulo(bx + 1, y + 5 + i % 2 * 3, 7, 15, base);
                        rectangulo(bx, y + 4 + i % 2 * 3, 8, 3, detalle);
                        rectangulo(bx + 3, y + 8 + i % 2 * 3, 2, 2, "#563d31");
                    }
                    break;
                case "rio":
                case "costa": {
                    const piedras = Math.max(2, Math.floor(p.ancho / 17));
                    for (let i = 0; i < piedras; i++) {
                        const bx = x + i * (p.ancho / piedras);
                        const w = p.ancho / piedras + 2;
                        rectangulo(bx, y + 10 + i % 2 * 3, w, 10 - i % 2 * 3, base);
                        rectangulo(bx + 2, y + 10 + i % 2 * 3, Math.max(2, w - 5), 3, detalle);
                        if (p.tipo === "costa") {
                            rectangulo(bx + 4, y + 6 + i % 2 * 3, 3, 4, "#e6dba9");
                            rectangulo(bx + 9, y + 8 + i % 2 * 3, 2, 3, "#e6dba9");
                        }
                    }
                    if (p.tipo === "rio") {
                        rectangulo(x + 2, y + 4, p.ancho - 4, 2, "#a9e8e9");
                        rectangulo(x + 8, y + 7, Math.max(4, p.ancho / 3), 2, "#a9e8e9");
                    }
                    break;
                }
                case "coral":
                    rectangulo(x + p.ancho * 0.4, y + 7, Math.max(5, p.ancho * 0.2), 13, base);
                    for (let i = 0; i < 3; i++) {
                        const bx = x + 3 + i * (p.ancho - 8) / 2;
                        rectangulo(bx, y + 2 + i % 2 * 3, 5, 13, base);
                        rectangulo(bx - 2, y + 1 + i % 2 * 3, 9, 4, detalle);
                    }
                    rectangulo(x + 2, y + 17, p.ancho - 4, 3, detalle);
                    break;
                case "raices":
                    rectangulo(x, y + 15, p.ancho, 5, base);
                    for (let i = 0; i < cantidad; i++) {
                        const bx = x + (i * p.ancho) / cantidad;
                        rectangulo(bx + 2, y + 3 + (i % 2) * 3, 5, 17, base);
                        rectangulo(bx, y + 2 + (i % 2) * 3, 9, 4, detalle);
                    }
                    break;
                case "ventila": {
                    rectangulo(x, y + 13, p.ancho, 7, base);
                    const pulso = Math.floor(tiempo / 5) % 2;
                    for (let i = 0; i < cantidad; i++) {
                        const bx = x + (i * p.ancho) / cantidad;
                        rectangulo(bx + 2, y + 7 + pulso * 2, 5, 13, base);
                        rectangulo(bx + 1, y + 6 + pulso * 2, 7, 3, detalle);
                        rectangulo(bx + 3, y + 2 + pulso * 2, 3, 5, "#f5d48a");
                    }
                    ctx.save();
                    ctx.globalAlpha = 0.45;
                    rectangulo(x + p.ancho * 0.35, y - 2 - pulso * 3, p.ancho * 0.3, 5, "#ff895c");
                    ctx.restore();
                    break;
                }
            }
        }
    }

    // Dibuja al personaje con la apariencia elegida. Lo usan la partida y las vistas previas.
    function dibujarCuerpoPersonaje(x, y, cy, mirando, caminando, fase, enAire, parpadeo) {
        const piel = PERSONAJE_PIELES[apariencia.piel];
        const pelo = PERSONAJE_PELOS[apariencia.pelo];
        const camiseta = PERSONAJE_CAMISETAS[apariencia.camiseta];
        const pantalon = PERSONAJE_PANTALONES[apariencia.pantalon];
        const estilo = apariencia.estilo;
        const accesorio = apariencia.accesorio;
        const alzarA = caminando ? (fase === 0 ? 3 : 0) : (enAire ? 2 : 0);
        const alzarB = caminando ? (fase === 0 ? 0 : 3) : (enAire ? 2 : 0);
        const brazoA = caminando ? (fase === 0 ? 1 : -1) : (enAire ? -3 : 0);
        const brazoB = caminando ? (fase === 0 ? -1 : 1) : (enAire ? -3 : 0);

        // Capa: va detrás del cuerpo y ondea al moverse.
        if (accesorio === 4) {
            const ondeo = caminando ? (fase === 0 ? 2 : 0) : (enAire ? 3 : 0);
            rectangulo(mirando === 1 ? x - 4 - ondeo : x + 22 + ondeo, cy + 19, 10, 17, "#b02a45");
        }

        // Pelo que queda detrás de la cara.
        if (estilo === 3) rectangulo(mirando === 1 ? x - 2 : x + 24, cy + 6, 6, 11, pelo);
        if (estilo === 2) {
            rectangulo(x + 2, cy + 7, 4, 17, pelo);
            rectangulo(x + 22, cy + 7, 4, 17, pelo);
        }

        // Cabello superior (o coronilla al descubierto si es calvo).
        if (estilo === 4) {
            rectangulo(x + 5, cy + 3, 18, 5, piel);
        } else {
            rectangulo(x + 4, cy, 20, 8, pelo);
        }
        if (estilo === 1) {
            rectangulo(x + 6, cy - 4, 4, 4, pelo);
            rectangulo(x + 12, cy - 6, 4, 6, pelo);
            rectangulo(x + 18, cy - 4, 4, 4, pelo);
        }

        // Cara y ojo (parpadea de vez en cuando).
        rectangulo(x + 5, cy + 7, 18, 12, piel);
        rectangulo(x + (mirando === 1 ? 18 : 7), cy + 11, 3, parpadeo ? 1 : 3, "#171727");

        if (accesorio === 1) {
            rectangulo(x + 6, cy + 10, 7, 5, "rgba(150, 225, 255, 0.5)");
            rectangulo(x + 16, cy + 10, 7, 5, "rgba(150, 225, 255, 0.5)");
            rectangulo(x + 5, cy + 9, 18, 1, "#1b1b2e");
            rectangulo(x + 13, cy + 11, 3, 1, "#1b1b2e");
        }
        if (accesorio === 2) {
            rectangulo(x + 3, cy - 2, 22, 7, "#d63a4a");
            rectangulo(mirando === 1 ? x + 20 : x - 4, cy + 4, 8, 3, "#9c2432");
        }

        // Camiseta, piernas que se alternan y brazos que se balancean.
        rectangulo(x + 3, cy + 19, 22, 11, camiseta);
        rectangulo(x + 5, y + 30, 8, 6 - alzarA, pantalon);
        rectangulo(x + 16, y + 30, 8, 6 - alzarB, pantalon);
        rectangulo(x, cy + 20 + brazoA, 4, 9, piel);
        rectangulo(x + 24, cy + 20 + brazoB, 4, 9, piel);

        if (accesorio === 3) {
            rectangulo(x + 4, cy + 17, 20, 4, "#ffb23d");
            rectangulo(mirando === 1 ? x + 1 : x + 21, cy + 20, 5, 9, "#ffb23d");
        }
    }

    function dibujarPreviewPersonaje(px, py, escala, animar) {
        const fase = animar ? Math.floor(tiempo / 8) % 2 : 0;
        const mirando = animar && Math.floor(tiempo / 150) % 2 === 1 ? -1 : 1;
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(escala, escala);
        dibujarCuerpoPersonaje(0, 0, 0, mirando, animar, fase, false, tiempo % 180 < 6);
        ctx.restore();
    }

    function dibujarCreadorPersonaje() {
        dibujarMapa();
        ctx.fillStyle = "rgba(5, 8, 20, 0.88)";
        ctx.fillRect(0, 0, ANCHO, ALTO);
        textoCentrado("CREA TU PERSONAJE", ANCHO / 2, 62, 30, "#8ccbff");

        ctx.fillStyle = "rgba(16, 27, 43, 0.94)";
        ctx.fillRect(70, 100, 300, 302);
        ctx.strokeStyle = "#4b84ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(70, 100, 300, 302);
        rectangulo(100, 360, 240, 4, "#3a5c78");
        dibujarPreviewPersonaje(136, 144, 6, true);
        textoCentrado("VISTA PREVIA", 220, 388, 12, "#9fb3c9");

        for (let i = 0; i < PERSONAJE_CAMPOS.length; i++) {
            const campo = PERSONAJE_CAMPOS[i];
            const y = PC.y + i * PC.paso;
            const seleccionado = filaPersonaje === i;
            ctx.fillStyle = seleccionado ? "rgba(35, 109, 160, 0.96)" : "rgba(16, 27, 43, 0.94)";
            ctx.fillRect(PC.x, y, PC.ancho, PC.alto);
            ctx.strokeStyle = seleccionado ? "#bcecff" : "#4b84ff";
            ctx.lineWidth = seleccionado ? 3 : 2;
            ctx.strokeRect(PC.x, y, PC.ancho, PC.alto);
            ctx.font = "bold 13px monospace";
            ctx.textAlign = "left";
            ctx.fillStyle = "#ffffff";
            ctx.fillText(campo.etiqueta, PC.x + 14, y + 26);
            textoCentrado("◀", PC.x + 210, y + 27, 16, "#bcecff");
            textoCentrado("▶", PC.x + PC.ancho - 34, y + 27, 16, "#bcecff");
            const centro = PC.x + 298;
            const valor = apariencia[campo.clave];
            if (campo.colores) {
                rectangulo(centro - 22, y + 9, 44, 24, campo.colores[valor]);
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 1;
                ctx.strokeRect(centro - 21.5, y + 9.5, 43, 23);
            } else {
                textoCentrado(campo.nombres[valor].toUpperCase(), centro, y + 27, 14, "#ffffff");
            }
        }

        const botones = [
            { texto: "ALEATORIO", x: PC.x, fila: PERSONAJE_CAMPOS.length },
            { texto: "LISTO", x: PC.x + 220, fila: PERSONAJE_CAMPOS.length + 1 }
        ];
        for (const boton of botones) {
            const seleccionado = filaPersonaje === boton.fila;
            ctx.fillStyle = seleccionado ? "rgba(35, 109, 160, 0.96)" : "rgba(16, 27, 43, 0.94)";
            ctx.fillRect(boton.x, PC.botonY, 200, PC.botonAlto);
            ctx.strokeStyle = seleccionado ? "#bcecff" : "#4b84ff";
            ctx.lineWidth = seleccionado ? 3 : 2;
            ctx.strokeRect(boton.x, PC.botonY, 200, PC.botonAlto);
            textoCentrado(boton.texto, boton.x + 100, PC.botonY + 27, 15, "#ffffff");
        }
        textoCentrado("↑↓ elegir · ←→ cambiar · ENTER siguiente · ESC volver", ANCHO / 2, 488, 11, "#bcecff");
    }

    function dibujarJugador() {
        if (
            jugador.invulnerable > 0 &&
            Math.floor(tiempo / 5) % 2 === 0
        ) {
            return;
        }

        const x = jugador.x - camaraX;
        const y = jugador.y;

        if (jugador.escudo > 0) {
            ctx.save();
            ctx.globalAlpha = 0.28 + Math.sin(tiempo * 0.18) * 0.08;
            ctx.strokeStyle = "#69e7ff";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(x + jugador.ancho / 2, y + jugador.alto / 2, 24, 29, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        const caminando = jugador.enSuelo && Math.abs(jugador.vx) > 0.5;
        const fase = Math.floor(tiempo / 6) % 2;
        const rebote = caminando && fase === 0 ? 1 : 0;
        const enAire = !jugador.enSuelo;

        // Squash & stretch (aplastar al caer, estirar al saltar).
        let sx = 1;
        let sy = 1;

        if (jugador.aplastar > 0) {
            const t = jugador.aplastar / 8;
            sx = 1 + 0.25 * t;
            sy = 1 - 0.25 * t;
        } else if (enAire && jugador.vy < -2) {
            sx = 0.9;
            sy = 1.12;
        }

        ctx.save();
        const pivoteX = x + jugador.ancho / 2;
        const pivoteY = y + jugador.alto;
        ctx.translate(pivoteX, pivoteY);
        ctx.scale(sx, sy);
        ctx.translate(-pivoteX, -pivoteY);

        const cy = y - rebote;

        dibujarCuerpoPersonaje(x, y, cy, jugador.mirando, caminando, fase, enAire, tiempo % 180 < 6);

        // Efecto de disparo.
        if (jugador.disparoEspera > 12) {
            const punta = jugador.mirando === 1 ? x + 28 : x - 12;
            rectangulo(punta, cy + 21, 12, 4, "#ffe68b");
        }

        ctx.restore();
    }

    // Halo oscuro detrás de los objetos: se ven bien incluso sobre cielos claros.
    function halo(cx, cy, radio) {
        ctx.fillStyle = "rgba(8, 14, 38, 0.5)";
        ctx.beginPath();
        ctx.arc(cx, cy, radio, 0, Math.PI * 2);
        ctx.fill();
    }

    function dibujarMonedas() {
        for (const m of monedas) {
            if (m.recogida || (m.rutaSecreta && !m.plataformaRuta.descubierta)) continue;

            const x = m.x - camaraX;
            const giro = Math.abs(Math.sin(tiempo * 0.09)) * 5;

            halo(x + 9, m.y + 9, m.atrayendo ? 19 : 13);

            rectangulo(x + giro, m.y, 18 - giro, 18, "#e7a92e");
            rectangulo(x + 4, m.y + 3, 9, 12, "#ffe878");
            rectangulo(x + 7, m.y + 6, 3, 6, "#d78b22");
        }
    }

    function dibujarDiamantes() {
        for (const d of diamantes) {
            if (d.recogido) continue;

            const x = d.x - camaraX;
            const y = d.y + Math.sin(tiempo * 0.08 + d.x) * 3;

            halo(x + 10, y + 11, 17);

            ctx.fillStyle = "#45e9ff";
            ctx.beginPath();
            ctx.moveTo(x + 10, y);
            ctx.lineTo(x + 20, y + 9);
            ctx.lineTo(x + 10, y + 22);
            ctx.lineTo(x, y + 9);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = "#c5fbff";
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 3);
            ctx.lineTo(x + 15, y + 9);
            ctx.lineTo(x + 10, y + 17);
            ctx.lineTo(x + 6, y + 9);
            ctx.closePath();
            ctx.fill();

            // Destello que parpadea.
            if ((tiempo + Math.floor(d.x)) % 90 < 8) {
                rectangulo(x + 14, y + 2, 3, 3, "#ffffff");
                rectangulo(x + 3, y + 12, 2, 2, "#ffffff");
            }
        }
    }

    function dibujarLlave() {
        if (!nivelLlave || nivelLlave.recogida) return;

        const x = nivelLlave.x - camaraX;
        const y = nivelLlave.y + Math.sin(tiempo * 0.07) * 3;

        // Halo que late para localizarla fácilmente.
        const pulso = 20 + Math.sin(tiempo * 0.12) * 3;
        halo(x + 11, y + 9, pulso);

        // Contorno oscuro + llave dorada.
        ctx.strokeStyle = "#1a2038";
        ctx.lineWidth = 9;
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 5, 0, Math.PI * 2);
        ctx.stroke();
        rectangulo(x + 9, y + 2, 13, 8, "#1a2038");
        rectangulo(x + 15, y + 7, 6, 8, "#1a2038");

        ctx.strokeStyle = "#ffdd65";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x + 6, y + 6, 5, 0, Math.PI * 2);
        ctx.stroke();

        rectangulo(x + 10, y + 4, 10, 4, "#ffdd65");
        rectangulo(x + 16, y + 8, 4, 5, "#ffdd65");

        if (tiempo % 70 < 8) {
            rectangulo(x + 18, y - 1, 3, 3, "#ffffff");
        }
    }

    function dibujarCorazones() {
        for (const h of corazones) {
            if (h.recogido) continue;

            const x = h.x - camaraX;
            const y = h.y + Math.sin(tiempo * 0.08) * 2;

            halo(x + 10, y + 10, 15);

            ctx.fillStyle = "#ff5579";
            ctx.beginPath();
            ctx.moveTo(x + 10, y + 18);
            ctx.bezierCurveTo(x - 5, y + 8, x + 2, y - 1, x + 10, y + 6);
            ctx.bezierCurveTo(x + 18, y - 1, x + 25, y + 8, x + 10, y + 18);
            ctx.fill();
        }
    }

    function dibujarEscudos() {
        for (const escudo of escudos) {
            if (escudo.recogido) continue;
            const x = escudo.x - camaraX;
            const y = escudo.y + Math.sin(tiempo * 0.08) * 3;
            halo(x + 11, y + 11, 17);
            ctx.fillStyle = "#69e7ff";
            ctx.beginPath();
            ctx.moveTo(x + 11, y);
            ctx.lineTo(x + 21, y + 4);
            ctx.lineTo(x + 19, y + 15);
            ctx.lineTo(x + 11, y + 22);
            ctx.lineTo(x + 3, y + 15);
            ctx.lineTo(x + 1, y + 4);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = "#eaffff";
            ctx.fillRect(x + 9, y + 5, 4, 11);
            ctx.fillRect(x + 6, y + 8, 10, 4);
        }
    }

    function dibujarEnemigos() {
        for (const e of enemigos) {
            const x = e.x - camaraX;
            const b = Math.floor(tiempo / 10 + e.x / 30) % 2;
            const mirada = e.mirada || Math.sign(e.vx) || 1;
            const y = e.y + b;
            const cuerpo = e.colorEspecie || "#ff6b59";
            const detalle = e.colorDetalle || "#ffd071";
            const caraX = mirada < 0 ? x + 4 : x + 19;

            if (e.nombreEspecie === "jaguar") {
                // Felino compacto, cola larga y rosetas reconocibles.
                rectangulo(x + 4, y + 12, 19, 11, cuerpo);
                rectangulo(caraX, y + 7, 10, 10, cuerpo);
                rectangulo(caraX + 1, y + 5, 3, 4, detalle);
                rectangulo(caraX + 7, y + 5, 3, 4, detalle);
                rectangulo(mirada < 0 ? x : x + 26, y + 12, 5, 4, detalle);
                rectangulo(x + 6, y + 21, 4, 7, detalle); rectangulo(x + 19, y + 21, 4, 7, detalle);
                rectangulo(mirada < 0 ? x + 20 : x, y + 14, mirada < 0 ? 10 : 7, 2, cuerpo);
                for (const [dx, dy] of [[8, 14], [14, 17], [18, 13]]) {
                    rectangulo(x + dx, y + dy, 3, 3, "#4b3021"); rectangulo(x + dx + 1, y + dy + 1, 1, 1, "#f5c64f");
                }
            } else if (e.nombreEspecie === "lobo ártico") {
                rectangulo(x + 4, y + 12, 21, 12, cuerpo);
                rectangulo(caraX, y + 7, 10, 11, cuerpo);
                rectangulo(caraX + 1, y + 3, 4, 6, cuerpo); rectangulo(caraX + 7, y + 4, 4, 5, cuerpo);
                rectangulo(mirada < 0 ? x : x + 27, y + 12, 4, 4, detalle);
                rectangulo(x + 5, y + 22, 5, 6, detalle); rectangulo(x + 19, y + 22, 5, 6, detalle);
                rectangulo(mirada < 0 ? x + 21 : x, y + 16, mirada < 0 ? 8 : 6, 3, detalle);
                rectangulo(x + 9, y + 12, 8, 2, "#edf6f5");
            } else if (e.nombreEspecie === "león") {
                rectangulo(x + 5, y + 13, 20, 11, cuerpo);
                rectangulo(caraX - 2, y + 5, 13, 14, detalle);
                rectangulo(caraX + 1, y + 8, 8, 8, cuerpo);
                rectangulo(caraX + 2, y + 4, 3, 4, cuerpo); rectangulo(caraX + 7, y + 4, 3, 4, cuerpo);
                rectangulo(mirada < 0 ? x : x + 27, y + 12, 4, 3, "#513c2a");
                rectangulo(x + 7, y + 22, 5, 6, detalle); rectangulo(x + 20, y + 22, 5, 6, detalle);
                rectangulo(mirada < 0 ? x + 22 : x, y + 15, 7, 3, cuerpo);
            } else if (e.nombreEspecie === "escorpión") {
                rectangulo(x + 6, y + 16, 17, 8, cuerpo);
                for (let i = 0; i < 4; i++) rectangulo(x + 7 + i * 4, y + 22, 2, 6, detalle);
                rectangulo(x + (mirada < 0 ? 0 : 22), y + 13, 8, 4, detalle);
                rectangulo(x + (mirada < 0 ? 0 : 27), y + 10, 4, 5, cuerpo);
                rectangulo(x + 13, y + 12, 7, 6, cuerpo);
                rectangulo(x + (mirada < 0 ? 18 : 13), y + 6, 4, 6, cuerpo);
                rectangulo(x + (mirada < 0 ? 17 : 14), y + 3, 5, 4, detalle);
                rectangulo(x + 5, y + 14, 5, 3, detalle); rectangulo(x + 21, y + 14, 5, 3, detalle);
            } else if (e.nombreEspecie === "murciélago") {
                const ala = b ? 2 : -2;
                rectangulo(x + 12, y + 9, 9, 12, cuerpo);
                rectangulo(x + 14, y + 4, 3, 7, cuerpo); rectangulo(x + 18, y + 4, 3, 7, cuerpo);
                rectangulo(x + 2, y + 9 + ala, 11, 12, cuerpo); rectangulo(x + 20, y + 9 - ala, 9, 12, cuerpo);
                rectangulo(x + 2, y + 18, 12, 3, detalle); rectangulo(x + 20, y + 18, 9, 3, detalle);
                rectangulo(x + 14, y + 12, 2, 2, "#ffdf68"); rectangulo(x + 19, y + 12, 2, 2, "#ffdf68");
            } else if (e.nombreEspecie === "caimán" || e.nombreEspecie === "cocodrilo") {
                rectangulo(x + 3, y + 15, 22, 9, cuerpo);
                rectangulo(mirada < 0 ? x : x + 20, y + 13, 11, 7, cuerpo);
                rectangulo(mirada < 0 ? x : x + 26, y + 17, 5, 3, detalle);
                rectangulo(x + 5, y + 22, 5, 6, detalle); rectangulo(x + 20, y + 22, 5, 6, detalle);
                rectangulo(mirada < 0 ? x + 21 : x, y + 18, mirada < 0 ? 9 : 5, 4, cuerpo);
                rectangulo(x + 23, y + 13, 2, 2, "#fff3ab"); rectangulo(x + 27, y + 19, 2, 2, "#fff3ab");
                if (e.nombreEspecie === "cocodrilo") for (let i = 0; i < 4; i++) rectangulo(x + 8 + i * 4, y + 13, 2, 2, detalle);
            } else if (e.nombreEspecie === "libélula") {
                rectangulo(x + 14, y + 9, 4, 17, cuerpo); rectangulo(x + 12, y + 5, 8, 7, detalle);
                rectangulo(x + 2, y + 5 + b, 12, 5, "#c9fff1"); rectangulo(x + 17, y + 4 - b, 12, 5, "#b9f4ec");
                rectangulo(x + 3, y + 13, 11, 4, "#c9fff1"); rectangulo(x + 17, y + 12, 11, 4, "#b9f4ec");
                rectangulo(x + 14, y + 7, 2, 2, "#172238");
            } else if (e.nombreEspecie === "bagre") {
                rectangulo(x + 4, y + 10, 20, 14, cuerpo);
                rectangulo(mirada < 0 ? x + 22 : x, y + 13, 8, 8, detalle);
                rectangulo(mirada < 0 ? x + 24 : x + 2, y + 10, 5, 5, cuerpo);
                rectangulo(x + 9, y + 7, 9, 4, detalle); rectangulo(x + 10, y + 23, 8, 4, detalle);
                rectangulo(x + 10, y + 12, 2, 2, "#ffffff");
                rectangulo(mirada < 0 ? x + 23 : x + 4, y + 19, 2, 7, "#f2e4a4");
                rectangulo(mirada < 0 ? x + 25 : x + 2, y + 19, 2, 6, "#f2e4a4");
            } else if (e.nombreEspecie === "martín pescador") {
                rectangulo(x + 9, y + 10, 15, 13, cuerpo); rectangulo(x + 12, y + 5, 11, 9, cuerpo);
                rectangulo(mirada < 0 ? x : x + 21, y + 8, 10, 3, detalle);
                rectangulo(x + 10, y + 16, 14, 4, "#e8a05b");
                rectangulo(x + 8, y + 13 + b, 14, 4, "#50c5c0");
                rectangulo(x + 12, y + 22, 3, 6, detalle); rectangulo(x + 20, y + 22, 3, 6, detalle);
                rectangulo(mirada < 0 ? x + 10 : x + 20, y + 7, 2, 2, "#172238");
            } else if (e.nombreEspecie === "cangrejo") {
                rectangulo(x + 5, y + 15, 20, 10, cuerpo);
                rectangulo(x + 1, y + 7, 7, 8, detalle); rectangulo(x + 22, y + 7, 7, 8, detalle);
                for (let i = 0; i < 4; i++) {
                    rectangulo(x + 5 + i * 5, y + 23, 2, 6, detalle);
                    rectangulo(x + 5 + i * 5, y + 11, 2, 5, detalle);
                }
                rectangulo(x + 8, y + 10, 3, 5, "#ffffff"); rectangulo(x + 19, y + 10, 3, 5, "#ffffff");
            } else if (e.nombreEspecie === "gaviota" || e.nombreEspecie === "buitre" || e.nombreEspecie === "garza" || e.nombreEspecie === "tucán" || e.nombreEspecie === "búho nival" || e.nombreEspecie === "águila marcial") {
                const cabeza = e.nombreEspecie === "garza" ? 8 : 10;
                rectangulo(x + 10, y + 11, 14, 12, cuerpo);
                rectangulo(x + 14, y + cabeza - 2, 10, 9, cuerpo);
                rectangulo(x + 6, y + 12 + b, 17, 5, detalle); rectangulo(x + 8, y + 18 - b, 14, 4, cuerpo);
                if (e.nombreEspecie === "tucán") {
                    rectangulo(mirada < 0 ? x : x + 18, y + 9, 12, 6, "#f4c43f");
                    rectangulo(mirada < 0 ? x + 1 : x + 19, y + 13, 9, 3, "#eb7650");
                } else if (e.nombreEspecie === "búho nival") {
                    rectangulo(x + 12, y + 11, 4, 5, "#fff3d2"); rectangulo(x + 20, y + 11, 4, 5, "#fff3d2");
                    rectangulo(x + 13, y + 12, 2, 3, "#172238"); rectangulo(x + 21, y + 12, 2, 3, "#172238");
                    rectangulo(x + 15, y + 16, 5, 4, "#e9a74a");
                } else if (e.nombreEspecie === "gaviota") {
                    rectangulo(mirada < 0 ? x + 1 : x + 22, y + 10, 8, 3, "#e6a843");
                    rectangulo(x + 12, y + 22, 3, 6, detalle); rectangulo(x + 20, y + 22, 3, 6, detalle);
                } else if (e.nombreEspecie === "buitre") {
                    rectangulo(x + 17, y + 6, 5, 6, "#e6b99a"); rectangulo(mirada < 0 ? x + 1 : x + 22, y + 10, 7, 3, detalle);
                    rectangulo(x + 7, y + 19, 17, 5, "#37352f");
                } else if (e.nombreEspecie === "águila marcial") {
                    rectangulo(mirada < 0 ? x + 1 : x + 22, y + 10, 8, 3, "#d5b16f");
                    rectangulo(x + 12, y + 12 + b, 14, 5, "#e8d5ad");
                    rectangulo(x + 15, y + 4, 4, 4, "#d5b16f");
                } else {
                    rectangulo(mirada < 0 ? x + 1 : x + 20, y + 11, 9, 3, detalle);
                    rectangulo(x + 12, y + 22, 3, 6, detalle); rectangulo(x + 20, y + 22, 3, 6, detalle);
                }
                rectangulo(mirada < 0 ? x + 11 : x + 21, y + 10, 2, 2, "#172238");
            } else if (e.nombreEspecie === "pez león") {
                rectangulo(x + 7, y + 10, 17, 14, cuerpo); rectangulo(mirada < 0 ? x + 22 : x, y + 13, 7, 8, detalle);
                rectangulo(x + 10, y + 6, 12, 5, detalle); rectangulo(x + 10, y + 23, 12, 4, detalle);
                for (let i = 0; i < 5; i++) rectangulo(x + 7 + i * 4, y + 5 - (i % 2) * 3, 2, 6, "#fff0c8");
                rectangulo(x + 12, y + 13, 3, 7, "#fff0c8"); rectangulo(x + 18, y + 13, 3, 7, "#fff0c8");
                rectangulo(mirada < 0 ? x + 7 : x + 20, y + 12, 2, 2, "#172238");
            } else if (e.nombreEspecie === "medusa") {
                halo(x + 15, y + 14, 18); rectangulo(x + 5, y + 8, 20, 12, cuerpo);
                rectangulo(x + 8, y + 4, 14, 8, detalle);
                for (let i = 0; i < 4; i++) rectangulo(x + 7 + i * 5, y + 19, 2, 9 + ((i + b) % 2) * 3, detalle);
                rectangulo(x + 10, y + 12, 2, 2, "#ffffff"); rectangulo(x + 19, y + 12, 2, 2, "#ffffff");
            } else if (e.nombreEspecie === "tiburón") {
                rectangulo(x + 4, y + 11, 21, 12, cuerpo); rectangulo(mirada < 0 ? x : x + 21, y + 13, 10, 8, cuerpo);
                rectangulo(mirada < 0 ? x + 22 : x + 1, y + 8, 7, 7, cuerpo);
                rectangulo(x + 12, y + 6, 7, 7, cuerpo); rectangulo(x + 12, y + 20, 7, 6, detalle);
                rectangulo(x + 6, y + 18, 18, 3, "#f4f0df"); rectangulo(x + 2, y + 12, 5, 9, detalle);
                rectangulo(mirada < 0 ? x + 5 : x + 23, y + 13, 2, 2, "#172238");
            } else if (e.nombreEspecie === "pez linterna") {
                rectangulo(x + 6, y + 11, 19, 13, cuerpo); rectangulo(mirada < 0 ? x : x + 23, y + 14, 7, 8, cuerpo);
                rectangulo(x + 10, y + 8, 9, 4, detalle); rectangulo(x + 11, y + 22, 8, 3, detalle);
                rectangulo(x + 16, y + 4, 2, 6, detalle); rectangulo(x + 15, y + 2, 5, 4, "#a9f2d0");
                halo(x + 18, y + 4, 8); rectangulo(mirada < 0 ? x + 7 : x + 22, y + 14, 2, 2, "#ffffff");
                rectangulo(x + 9, y + 18, 10, 2, "#a9f2d0");
            } else if (e.claseEspecie === "mamifero") {
                // Cuerpo, patas, cola y orejas hacen reconocibles a los animales terrestres.
                rectangulo(x + 5, y + 10, 21, 13, cuerpo);
                rectangulo(x + 19, y + 5, 10, 11, cuerpo);
                rectangulo(x + 20, y + 3, 4, 4, detalle);
                rectangulo(x + 26, y + 4, 4, 4, detalle);
                rectangulo(x + 7, y + 21, 5, 7, detalle);
                rectangulo(x + 21, y + 21, 5, 7, detalle);
                rectangulo(mirada < 0 ? x : x + 26, y + 13, 5, 3, detalle);
                if (e.nombreEspecie === "jaguar" || e.nombreEspecie === "león") {
                    rectangulo(x + 10, y + 13, 3, 3, detalle);
                    rectangulo(x + 16, y + 17, 3, 3, detalle);
                    if (e.nombreEspecie === "león") rectangulo(x + 17, y + 3, 9, 7, detalle);
                }
            } else if (e.claseEspecie === "ave") {
                const ala = b ? 2 : -2;
                rectangulo(x + 9, y + 8, 15, 15, cuerpo);
                rectangulo(x + 11, y + 3, 11, 9, cuerpo);
                rectangulo(x + 8, y + 12 + ala, 13, 5, detalle);
                rectangulo(mirada < 0 ? x + 2 : x + 24, y + 7, 8, 4, detalle);
                rectangulo(x + 12, y + 22, 3, 6, detalle);
                rectangulo(x + 20, y + 22, 3, 6, detalle);
                rectangulo(mirada < 0 ? x + 10 : x + 20, y + 6, 2, 2, "#172238");
            } else if (e.claseEspecie === "reptil") {
                rectangulo(x + 3, y + 12, 24, 12, cuerpo);
                rectangulo(mirada < 0 ? x : x + 22, y + 10, 9, 8, cuerpo);
                rectangulo(x + 8, y + 22, 5, 6, detalle);
                rectangulo(x + 20, y + 22, 5, 6, detalle);
                rectangulo(x + 7, y + 14, 4, 3, detalle);
                rectangulo(x + 15, y + 18, 4, 3, detalle);
                rectangulo(mirada < 0 ? x + 2 : x + 26, y + 12, 2, 2, "#ffffff");
            } else if (e.claseEspecie === "insecto") {
                rectangulo(x + 9, y + 10, 13, 15, cuerpo);
                rectangulo(x + 12, y + 3, 7, 9, detalle);
                rectangulo(x + 6, y + 8 + b, 7, 5, "#bceee1");
                rectangulo(x + 19, y + 8 - b, 7, 5, "#bceee1");
                for (let pata = 0; pata < 3; pata++) rectangulo(x + 5 + pata * 7, y + 23, 2, 6, detalle);
                rectangulo(x + 13, y + 6, 2, 2, "#172238");
            } else if (e.claseEspecie === "arácnido") {
                rectangulo(x + 10, y + 12, 13, 12, cuerpo);
                rectangulo(x + 20, y + 9, 8, 10, detalle);
                rectangulo(x + 24, y + 3, 5, 8, detalle);
                for (let pata = 0; pata < 4; pata++) {
                    rectangulo(x + 3 + pata * 6, y + 20, 3, 8, detalle);
                    rectangulo(x + 2 + pata * 6, y + 8, 3, 7, detalle);
                }
                rectangulo(x + 22, y + 6, 2, 2, "#ffffff");
            } else if (e.claseEspecie === "pez") {
                rectangulo(x + 5, y + 8, 20, 15, cuerpo);
                rectangulo(mirada < 0 ? x + 23 : x + 1, y + 11, 7, 9, detalle);
                rectangulo(x + 11, y + 5, 8, 5, detalle);
                rectangulo(x + 11, y + 22, 8, 4, detalle);
                rectangulo(mirada < 0 ? x + 7 : x + 21, y + 12, 3, 3, "#ffffff");
                rectangulo(mirada < 0 ? x + 8 : x + 22, y + 13, 1, 2, "#172238");
                rectangulo(x + 14, y + 12, 3, 7, detalle);
            } else if (e.claseEspecie === "cangrejo") {
                rectangulo(x + 5, y + 12, 20, 13, cuerpo);
                rectangulo(x + 1, y + 5, 7, 8, detalle);
                rectangulo(x + 22, y + 5, 7, 8, detalle);
                for (let pata = 0; pata < 3; pata++) {
                    rectangulo(x + 5 + pata * 7, y + 23, 3, 6, detalle);
                    rectangulo(x + 5 + pata * 7, y + 10, 2, 4, "#ffffff");
                }
            } else if (e.claseEspecie === "medusa") {
                halo(x + 15, y + 13, 19);
                rectangulo(x + 5, y + 8, 20, 12, cuerpo);
                rectangulo(x + 8, y + 4, 14, 7, detalle);
                for (let tentaculo = 0; tentaculo < 4; tentaculo++) {
                    rectangulo(x + 7 + tentaculo * 5, y + 20, 2, 8 + ((tentaculo + b) % 2) * 3, detalle);
                }
                rectangulo(x + 10, y + 12, 2, 2, "#ffffff");
                rectangulo(x + 19, y + 12, 2, 2, "#ffffff");
            }

            // Rasgos compactos para las especies añadidas al catálogo.
            switch (e.nombreEspecie) {
                case "tapir amazónico":
                    rectangulo(mirada < 0 ? x : x + 24, y + 12, 7, 7, "#e7ded0");
                    rectangulo(x + 7, y + 18, 14, 5, "#e7ded0"); break;
                case "guacamaya roja":
                    rectangulo(x + 8, y + 13 + b, 13, 4, "#365fc4");
                    rectangulo(x + 11, y + 17, 11, 3, "#f1d64a"); break;
                case "zorro ártico":
                    rectangulo(x + 20, y + 2, 5, 7, cuerpo); rectangulo(x + 26, y + 3, 4, 6, cuerpo);
                    rectangulo(mirada < 0 ? x + 1 : x + 24, y + 20, 6, 5, "#fff4df"); break;
                case "perdiz nival":
                    rectangulo(x + 7, y + 13, 16, 8, "#fff8e7");
                    rectangulo(x + 11, y + 15, 2, 2, "#8b735a"); rectangulo(x + 18, y + 18, 2, 2, "#8b735a"); break;
                case "hiena manchada":
                    for (let i = 0; i < 4; i++) rectangulo(x + 7 + i * 5, y + 14 + (i % 2) * 4, 2, 2, "#55483d");
                    rectangulo(x + 16, y + 6, 8, 5, "#55483d"); break;
                case "avestruz":
                    rectangulo(x + 16, y + 3, 4, 12, cuerpo); rectangulo(x + 14, y + 1, 7, 5, detalle);
                    rectangulo(x + 12, y + 22, 2, 7, detalle); rectangulo(x + 21, y + 22, 2, 7, detalle); break;
                case "fennec":
                    rectangulo(x + 11, y, 5, 10, cuerpo); rectangulo(x + 21, y, 6, 10, cuerpo);
                    rectangulo(x + 12, y + 2, 2, 5, "#f4a28c"); rectangulo(x + 23, y + 2, 2, 5, "#f4a28c"); break;
                case "halcón del desierto":
                    rectangulo(mirada < 0 ? x + 1 : x + 23, y + 8, 7, 3, "#f0bd59");
                    rectangulo(x + 8, y + 14 + b, 15, 4, "#e7d5b4"); break;
                case "capibara":
                    rectangulo(x + 23, y + 12, 6, 5, "#d4b68a");
                    rectangulo(x + 19, y + 7, 4, 4, "#755943");
                    rectangulo(x + 5, y + 21, 5, 7, "#795d43"); rectangulo(x + 20, y + 21, 5, 7, "#795d43"); break;
                case "garza real":
                    rectangulo(x + 17, y + 4, 3, 9, cuerpo); rectangulo(mirada < 0 ? x : x + 21, y + 9, 9, 2, "#e2a254");
                    rectangulo(x + 12, y + 22, 2, 7, detalle); rectangulo(x + 21, y + 22, 2, 7, detalle); break;
                case "piraña":
                    rectangulo(mirada < 0 ? x + 1 : x + 21, y + 16, 8, 4, "#d94c4c");
                    rectangulo(mirada < 0 ? x + 2 : x + 22, y + 17, 2, 2, "#fff4d2");
                    rectangulo(x + 10, y + 9, 8, 3, "#d94c4c"); break;
                case "nutria de río":
                    rectangulo(x + 2, y + 17, 9, 4, cuerpo); rectangulo(mirada < 0 ? x : x + 24, y + 12, 6, 5, detalle);
                    rectangulo(x + 26, y + 17, 4, 2, "#f5eddd"); break;
                case "lobo marino":
                    rectangulo(x + 21, y + 9, 8, 8, cuerpo); rectangulo(x + 27, y + 12, 4, 3, detalle);
                    rectangulo(x + 8, y + 21, 10, 5, detalle); rectangulo(x + 18, y + 21, 9, 5, detalle); break;
                case "pelícano":
                    rectangulo(mirada < 0 ? x : x + 18, y + 10, 12, 4, "#e7a94c");
                    rectangulo(mirada < 0 ? x + 2 : x + 19, y + 13, 8, 5, "#f2d49b"); break;
                case "morena":
                    rectangulo(x + 3, y + 13, 24, 6, cuerpo); rectangulo(x + 8, y + 10, 19, 3, detalle);
                    rectangulo(mirada < 0 ? x : x + 24, y + 12, 6, 7, cuerpo);
                    rectangulo(mirada < 0 ? x + 2 : x + 25, y + 15, 5, 2, "#fff2cf"); break;
                case "mantarraya":
                    rectangulo(x + 1, y + 10, 28, 5, cuerpo); rectangulo(x + 4, y + 15, 22, 8, cuerpo);
                    rectangulo(x + 11, y + 7, 8, 5, detalle); rectangulo(x + 13, y + 21, 2, 7, cuerpo); break;
                case "anaconda":
                    rectangulo(x + 2, y + 19, 24, 5, cuerpo); rectangulo(x + 8, y + 16, 18, 5, cuerpo);
                    rectangulo(mirada < 0 ? x : x + 24, y + 14, 6, 6, cuerpo);
                    rectangulo(x + 8, y + 18, 3, 2, detalle); rectangulo(x + 16, y + 21, 3, 2, detalle); break;
                case "ibis escarlata":
                    rectangulo(mirada < 0 ? x : x + 20, y + 8, 10, 3, "#312c2b");
                    rectangulo(x + 17, y + 4, 3, 8, cuerpo); rectangulo(x + 12, y + 22, 2, 7, detalle); break;
                case "calamar gigante":
                    rectangulo(x + 11, y + 4, 10, 15, cuerpo);
                    for (let i = 0; i < 5; i++) rectangulo(x + 7 + i * 4, y + 17, 2, 12 - (i % 2) * 3, detalle);
                    break;
                case "orca":
                    rectangulo(x + 6, y + 16, 16, 5, "#f2f3ed"); rectangulo(x + 20, y + 10, 5, 6, "#f2f3ed");
                    rectangulo(x + 13, y + 5, 5, 7, cuerpo); rectangulo(x + 12, y + 22, 9, 4, detalle); break;
            }

            if (e.avisandoAtaque) {
                ctx.fillStyle = "#ff4c5f";
                ctx.beginPath(); ctx.arc(x + 15, y - 7, 7, 0, Math.PI * 2); ctx.fill();
                ctx.font = "bold 10px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.fillStyle = "#ffffff"; ctx.fillText("!", x + 15, y - 7);
                ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
            } else if (e.estadoAtaque === "embestida" || e.estadoAtaque === "picado") {
                const estela = mirada > 0 ? x - 9 : x + e.ancho + 2;
                rectangulo(estela, y + 10, 6, 2, "#ffe29a");
                rectangulo(estela + (mirada > 0 ? -3 : 3), y + 16, 4, 2, "#ffc76b");
            }

            // La silueta se refuerza con el nombre al acercarse: ayuda a
            // reconocer especies pequeñas sin llenar la pantalla de etiquetas.
            if (Math.abs(e.x - jugador.x) < 190) {
                ctx.save();
                ctx.font = "10px monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                const etiqueta = e.nombreEspecie.toLocaleUpperCase("es");
                const anchoEtiqueta = Math.ceil(ctx.measureText(etiqueta).width) + 8;
                const etiquetaX = Math.max(4, Math.min(ANCHO - anchoEtiqueta - 4, x + e.ancho / 2 - anchoEtiqueta / 2));
                const etiquetaY = Math.max(5, y - 14);
                ctx.fillStyle = "rgba(12, 18, 32, 0.9)";
                ctx.fillRect(etiquetaX, etiquetaY, anchoEtiqueta, 13);
                ctx.fillStyle = "#fff2bd";
                ctx.fillText(etiqueta, etiquetaX + anchoEtiqueta / 2, etiquetaY + 6.5);
                ctx.restore();
            }
        }
    }

    function dibujarCanones() {
        for (const c of canones) {
            const x = c.x - camaraX;
            rectangulo(x, c.y + 8, c.ancho, c.alto - 8, "#4c607b");
            rectangulo(x + 5, c.y, c.ancho - 10, 15, "#8499b6");
            rectangulo(x + 9, c.y + 4, c.ancho - 18, 8, "#171e31");
            rectangulo(x + 5, c.y + c.alto - 6, c.ancho - 10, 6, "#29364b");

            // Luz de aviso poco antes de disparar.
            if (c.espera < 25 && Math.floor(tiempo / 4) % 2 === 0) {
                rectangulo(x + 12, c.y + 6, 8, 4, "#ff7a45");
            }
        }
    }

    function dibujarProyectiles() {
        for (const p of proyectiles) {
            rectangulo(p.x - camaraX, p.y, p.ancho, p.alto, p.color || "#ff875b");
            rectangulo(p.x - camaraX + 3, p.y + 2, 5, 3, "#fff2c2");
        }

        for (const d of disparosJugador) {
            rectangulo(d.x - camaraX, d.y, d.ancho, d.alto, "#8bf6ff");
            rectangulo(d.x - camaraX + 2, d.y + 1, 5, 3, "#ffffff");
        }
    }

    function dibujarJefe() {
        if (!jefe || !jefe.vivo) return;

        const x = jefe.x - camaraX;
        const y = jefe.y + Math.round(Math.sin(tiempo * 0.08) * 2);

        const destello = jefe.golpe > 0;
        const aviso = !opciones.reducirMovimiento && jefe.espera < 60 && Math.floor(tiempo / 5) % 2 === 0;

        const [nombre, clase, colorBase, detalleBase] = jefe.especie || ["bestia", "mamifero", "#bd7045", "#f2c56b"];
        const colorCuerpo = destello ? "#ffffff" : (jefe.enfurecido ? "#a3243f" : colorBase);
        const colorDetalle = destello ? "#ffffff" : (jefe.enfurecido ? "#e0485a" : detalleBase);
        const colorOjos = aviso ? "#ff3b3b" : "#ffdf68";

        // Aviso espacial del ataque: el brillo anticipa el peligro incluso
        // cuando el jugador está mirando la arena y no la barra superior.
        if (jefe.anunciado && jefe.espera < 60) {
            const intensidadAviso = 0.16 + Math.abs(Math.sin(tiempo * 0.18)) * 0.18;
            ctx.globalAlpha = intensidadAviso;
            halo(x + jefe.ancho / 2, y + jefe.alto - 2, 54 + (60 - jefe.espera) * 0.25);
            ctx.globalAlpha = 1;
        }

        // Cada ecosistema tiene un jefe animal con silueta y detalles propios.
        if (clase === "mamifero") {
            rectangulo(x + 7, y + 33, 57, 43, colorCuerpo);
            rectangulo(x + 2, y + 75, 16, 13, colorDetalle);
            rectangulo(x + 51, y + 75, 16, 13, colorDetalle);
            rectangulo(x + 17, y + 5, 43, 38, nombre === "león" ? colorDetalle : colorCuerpo);
            rectangulo(x + 19, y, 12, 13, colorDetalle);
            rectangulo(x + 48, y, 12, 13, colorDetalle);
            rectangulo(x + 1, y + 40, 12, 7, colorDetalle);
            if (nombre === "jaguar" || nombre === "lobo ártico") {
                rectangulo(x + 15, y + 46, 5, 5, colorDetalle);
                rectangulo(x + 42, y + 58, 5, 5, colorDetalle);
                rectangulo(x + 27, y + 38, 5, 5, colorDetalle);
            }
        } else if (clase === "ave") {
            rectangulo(x + 21, y + 18, 34, 53, colorCuerpo);
            rectangulo(x + 22, y + 3, 31, 29, colorCuerpo);
            rectangulo(x - 4, y + 30, 31, 16, colorDetalle);
            rectangulo(x + 47, y + 30, 31, 16, colorDetalle);
            rectangulo(x + 46, y + 12, 21, 8, colorDetalle);
            rectangulo(x + 28, y + 70, 7, 17, colorDetalle);
            rectangulo(x + 44, y + 70, 7, 17, colorDetalle);
        } else if (clase === "reptil") {
            rectangulo(x + 4, y + 37, 57, 38, colorCuerpo);
            rectangulo(x + 43, y + 19, 27, 27, colorCuerpo);
            rectangulo(x + 60, y + 34, 11, 8, colorDetalle);
            rectangulo(x + 8, y + 67, 15, 21, colorDetalle);
            rectangulo(x + 48, y + 67, 15, 21, colorDetalle);
            rectangulo(x - 8, y + 60, 21, 10, colorCuerpo);
            rectangulo(x + 52, y + 26, 6, 6, colorOjos);
        } else if (clase === "insecto") {
            rectangulo(x + 20, y + 24, 32, 52, colorCuerpo);
            rectangulo(x + 24, y + 5, 24, 26, colorDetalle);
            rectangulo(x - 5, y + 31, 25, 23, "#bceee1");
            rectangulo(x + 51, y + 31, 25, 23, "#bceee1");
            rectangulo(x + 5, y + 8, 15, 18, colorCuerpo);
            rectangulo(x + 51, y + 8, 15, 18, colorCuerpo);
            for (let pata = 0; pata < 3; pata++) {
                rectangulo(x + 12 + pata * 17, y + 68, 7, 20, colorDetalle);
            }
            rectangulo(x + 29, y - 7, 5, 16, colorDetalle);
            rectangulo(x + 40, y - 7, 5, 16, colorDetalle);
        } else if (clase === "arácnido") {
            rectangulo(x + 17, y + 37, 35, 34, colorCuerpo);
            rectangulo(x + 22, y + 13, 25, 30, colorDetalle);
            rectangulo(x + 29, y - 5, 7, 24, colorDetalle);
            rectangulo(x + 13, y + 19, 14, 13, colorCuerpo);
            rectangulo(x + 46, y + 19, 14, 13, colorCuerpo);
            for (let pata = 0; pata < 4; pata++) {
                rectangulo(x + 1 + pata * 6, y + 48, 17, 7, colorDetalle);
                rectangulo(x + 52 + pata * 4, y + 48, 17, 7, colorDetalle);
            }
        } else if (clase === "pez") {
            rectangulo(x + 10, y + 18, 51, 54, colorCuerpo);
            rectangulo(x + 56, y + 29, 21, 34, colorDetalle);
            rectangulo(x + 22, y + 5, 26, 18, colorDetalle);
            rectangulo(x + 23, y + 68, 27, 16, colorDetalle);
            rectangulo(x + 17, y + 36, 7, 7, colorOjos);
            rectangulo(x + 18, y + 38, 3, 4, "#172238");
            rectangulo(x + 33, y + 30, 7, 30, colorDetalle);
        } else if (clase === "cangrejo") {
            rectangulo(x + 10, y + 35, 52, 42, colorCuerpo);
            rectangulo(x - 4, y + 17, 21, 24, colorDetalle);
            rectangulo(x + 57, y + 17, 21, 24, colorDetalle);
            rectangulo(x + 16, y + 72, 9, 17, colorDetalle);
            rectangulo(x + 30, y + 74, 9, 15, colorDetalle);
            rectangulo(x + 45, y + 72, 9, 17, colorDetalle);
            rectangulo(x + 20, y + 24, 8, 18, colorOjos);
            rectangulo(x + 45, y + 24, 8, 18, colorOjos);
        } else {
            halo(x + 35, y + 33, 55);
            rectangulo(x + 8, y + 12, 55, 42, colorCuerpo);
            rectangulo(x + 15, y + 2, 41, 20, colorDetalle);
            for (let tentaculo = 0; tentaculo < 5; tentaculo++) {
                rectangulo(x + 12 + tentaculo * 10, y + 52, 6, 27 + (tentaculo % 2) * 8, colorDetalle);
            }
            rectangulo(x + 20, y + 26, 8, 8, colorOjos);
            rectangulo(x + 45, y + 26, 8, 8, colorOjos);
        }
        // Rasgos propios del guardián de cada ecosistema: la clase animal
        // define la base, y la especie determina los signos que lo identifican.
        if (nombre === "jaguar") {
            for (const [dx, dy] of [[20, 48], [35, 59], [47, 48], [27, 68]]) {
                rectangulo(x + dx, y + dy, 5, 5, colorDetalle);
                rectangulo(x + dx + 1, y + dy + 1, 3, 3, colorCuerpo);
            }
            rectangulo(x + 5, y + 56, 18, 5, colorCuerpo);
        } else if (nombre === "lobo ártico") {
            rectangulo(x + 19, y - 3, 10, 11, colorCuerpo); rectangulo(x + 49, y - 3, 10, 11, colorCuerpo);
            rectangulo(x + 22, y + 51, 28, 5, "#eaf4f2"); rectangulo(x + 1, y + 43, 16, 6, colorDetalle);
        } else if (nombre === "león") {
            rectangulo(x + 13, y + 4, 49, 40, colorDetalle);
            rectangulo(x + 24, y + 13, 31, 24, colorCuerpo);
            rectangulo(x + 19, y + 8, 8, 8, colorCuerpo); rectangulo(x + 50, y + 8, 8, 8, colorCuerpo);
        } else if (nombre === "escorpión") {
            rectangulo(x + 4, y + 15, 19, 17, colorDetalle); rectangulo(x + 57, y + 15, 19, 17, colorDetalle);
            rectangulo(x + 31, y + 4, 12, 24, colorCuerpo); rectangulo(x + 39, y - 10, 9, 18, colorDetalle);
            rectangulo(x + 44, y - 19, 12, 11, colorDetalle);
            for (let i = 0; i < 5; i++) rectangulo(x + 18 + i * 8, y + 72, 3, 13, colorDetalle);
        } else if (nombre === "caimán" || nombre === "cocodrilo") {
            rectangulo(x + 59, y + 34, 17, 10, colorDetalle);
            for (let i = 0; i < 6; i++) rectangulo(x + 22 + i * 6, y + 30, 4, 5, colorDetalle);
            rectangulo(x + 6, y + 67, 23, 8, colorCuerpo);
        } else if (nombre === "bagre") {
            rectangulo(x + 3, y + 43, 17, 25, colorDetalle); rectangulo(x + 62, y + 43, 17, 25, colorDetalle);
            rectangulo(x + 53, y + 48, 23, 3, colorDetalle); rectangulo(x + 53, y + 56, 22, 3, colorDetalle);
            rectangulo(x + 21, y + 68, 29, 10, colorDetalle);
        } else if (nombre === "cangrejo") {
            rectangulo(x - 5, y + 14, 23, 24, colorDetalle); rectangulo(x + 57, y + 14, 23, 24, colorDetalle);
            for (let i = 0; i < 4; i++) rectangulo(x + 12 + i * 15, y + 73, 7, 15, colorDetalle);
        } else if (nombre === "pez león") {
            for (let i = 0; i < 8; i++) {
                rectangulo(x + 11 + i * 7, y + 11 - (i % 2) * 6, 3, 22, colorDetalle);
                rectangulo(x + 11 + i * 7, y + 59, 3, 17, colorDetalle);
            }
        } else if (nombre === "tiburón") {
            rectangulo(x + 31, y + 4, 19, 22, colorCuerpo); rectangulo(x + 20, y + 53, 37, 13, colorDetalle);
            rectangulo(x + 59, y + 39, 15, 11, colorDetalle);
        }
        // Pupilas y gesto de jefe visibles sobre cualquiera de las siluetas.
        rectangulo(x + 23, y + 28, 6, 7, colorOjos);
        rectangulo(x + 46, y + 28, 6, 7, colorOjos);
        rectangulo(x + 25, y + 30, 3, 4, "#20152e");
        rectangulo(x + 48, y + 30, 3, 4, "#20152e");
        rectangulo(x + 28, y + 58, 22, 5, jefe.enfurecido ? "#3c193f" : colorDetalle);

        // Barra de vida del jefe (solo cuando ya está activo).
        if (jefe.anunciado) {
            rectangulo(ANCHO / 2 - 120, 124, 240, 14, "#40233c");
            rectangulo(
                ANCHO / 2 - 118,
                126,
                236 * Math.max(0, jefe.vida) / jefe.vidaMaxima,
                10,
                jefe.enfurecido ? "#ff3b3b" : "#ff4c83"
            );

            textoCentrado(
                jefe.espera < 60 ? `${jefe.ataque.nombre.toUpperCase()} · ¡ESQUIVA!` : nombre.toUpperCase(),
                ANCHO / 2,
                116,
                13,
                jefe.espera < 60 ? jefe.ataque.color : "#ffc6e0"
            );
        }
    }

    function dibujarBarreraJefe() {
        if (!jefe || !jefe.anunciado) return;
        const x = longitudNivel - 640 - camaraX;
        if (x < -12 || x > ANCHO + 12) return;
        ctx.save();
        ctx.globalAlpha = 0.88;
        rectangulo(x - 5, 0, 10, SUELO, "#1a2940");
        rectangulo(x - 1, 0, 2, SUELO, "#76dcec");
        for (let y = 12; y < SUELO; y += 28) {
            rectangulo(x - 8, y, 16, 3, "#b1f5ef");
        }
        ctx.restore();
    }

    // -----------------------------------------------------
    // INTERFAZ
    // -----------------------------------------------------

    function dibujarHUD() {
        rectangulo(12, 12, 374, 98, "rgba(7, 12, 27, 0.86)");

        ctx.font = "bold 15px monospace";
        ctx.fillStyle = "#eaf4ff";
        ctx.fillText(enTutorial ? "TUTORIAL" : `NIVEL: ${nivelActual}/${TOTAL_NIVELES}`, 24, 34);
        ctx.fillText(`PUNTOS: ${puntosMostrados}`, 24, 56);

        ctx.fillStyle = "#ffd34f";
        ctx.fillText(`MONEDAS: ${jugador.monedas}/${monedas.length}`, 190, 34);

        ctx.fillStyle = "#54edff";
        ctx.fillText(`DIAMANTES: ${jugador.diamantes}/3`, 190, 56);

        ctx.fillStyle = jugador.tieneLlave ? "#6bffab" : "#ffdc73";
        ctx.fillText(
            jugador.tieneLlave ? "LLAVE: SÍ" : "LLAVE: NO",
            24,
            78
        );

        ctx.font = "bold 12px monospace";
        ctx.fillStyle = "#bdefff";
        let objetivo = "OBJETIVO: LLEGA A LA SALIDA";
        if (jugador.diamantes < 3) {
            objetivo = `OBJETIVO: RECOGE DIAMANTES (${jugador.diamantes}/3)`;
        } else if (!jugador.tieneLlave) {
            objetivo = "OBJETIVO: ENCUENTRA LA LLAVE";
        }
        if (esNivelJefe() && jefe && jefe.vivo) {
            objetivo = jefe.anunciado
                ? `OBJ: CALMA AL GUARDIÁN (${Math.max(0, jefe.vida)}/${jefe.vidaMaxima})`
                : `OBJ: REÚNE DIAMANTES PARA EL ANTÍDOTO (${jugador.diamantes}/3)`;
        }
        ctx.fillText(objetivo, 24, 101);

        // Vidas (el último corazón late cuando queda una sola vida).
        for (let i = 0; i < vidasPorNivel(); i++) {
            const x = ANCHO - 30 - i * 28;
            const y = 22;
            const latido =
                jugador.vidas === 1 && i === 0
                    ? 1 + Math.sin(tiempo * 0.2) * 0.12
                    : 1;

            ctx.save();
            ctx.translate(x, y + 9);
            ctx.scale(latido, latido);
            ctx.translate(-x, -(y + 9));

            ctx.fillStyle = i < jugador.vidas ? "#ff5478" : "#503849";
            ctx.beginPath();
            ctx.moveTo(x, y + 17);
            ctx.bezierCurveTo(x - 15, y + 7, x - 5, y - 2, x, y + 5);
            ctx.bezierCurveTo(x + 5, y - 2, x + 15, y + 7, x, y + 17);
            ctx.fill();
            ctx.restore();
        }

        ctx.font = "12px monospace";
        ctx.fillStyle = "#c6d7f4";
        ctx.fillText(
            `${etiquetaTecla(opciones.bindings.mapa)}: MAPA  ${etiquetaTecla(opciones.bindings.disparar)}: DISPARAR`,
            ANCHO - 350,
            54
        );
        if (jugador.escudo > 0) {
            ctx.font = "bold 12px monospace";
            ctx.fillStyle = "#69e7ff";
            ctx.fillText(`ESCUDO: ${(jugador.escudo / 60).toFixed(1)} s`, 24, 96);
        }
        ctx.fillText(
            `${etiquetaTecla(opciones.bindings.pausa)}: PAUSA  ${silencio ? "SONIDO APAGADO" : "SONIDO ACTIVO"}`,
            ANCHO - 350,
            72
        );
        if (jugador.sobre && jugador.sobre.tipo !== "suelo") {
            textoCentrado("↓ / S: BAJAR DE LA PLATAFORMA", ANCHO / 2, ALTO - 13, 10, "#d7efff");
        }
    }

    // Flecha que señala dónde está la llave cuando aún no la tienes.
    function dibujarIndicadorLlave() {
        if (!nivelLlave || nivelLlave.recogida || jugador.tieneLlave) return;

        const pantallaX = nivelLlave.x - camaraX;
        if (pantallaX > 30 && pantallaX < ANCHO - 30) return;

        const izquierda = pantallaX <= 30;
        const distancia = Math.round(Math.abs(nivelLlave.x - jugador.x) / 10);
        const parpadeo = 0.7 + Math.abs(Math.sin(tiempo * 0.1)) * 0.3;

        ctx.globalAlpha = parpadeo;
        ctx.fillStyle = "rgba(7, 12, 27, 0.85)";
        const cajaX = izquierda ? 12 : ANCHO - 142;
        ctx.fillRect(cajaX, ALTO - 62, 130, 28);

        textoCentrado(
            izquierda ? `◄ LLAVE ${distancia}m` : `LLAVE ${distancia}m ►`,
            cajaX + 65,
            ALTO - 43,
            13,
            "#ffdd65"
        );
        ctx.globalAlpha = 1;
    }

    function dibujarMensaje() {
        if (mensajeTiempo <= 0) return;

        ctx.fillStyle = "rgba(7, 12, 27, 0.82)";
        ctx.fillRect(ANCHO / 2 - 210, 115, 420, 48);

        textoCentrado(mensaje, ANCHO / 2, 146, 19, "#ffffff");
    }

    function dibujarParticulas() {
        for (const p of particulas) {
            ctx.globalAlpha = Math.max(0, p.vida / 35);
            rectangulo(p.x - camaraX, p.y, 4, 4, p.color);
        }

        for (const texto of textosFlotantes) {
            ctx.globalAlpha = Math.min(1, texto.vida / 16);
            ctx.font = "bold 12px monospace";
            ctx.textAlign = "center";
            ctx.fillStyle = texto.color;
            ctx.fillText(texto.texto, texto.x - camaraX, texto.y);
        }
        ctx.textAlign = "left";

        ctx.globalAlpha = 1;
    }

    function dibujarJuego() {
        // El mundo se dibuja con temblor; la interfaz no.
        ctx.save();

        if (temblor > 0 && !opciones.reducirMovimiento) {
            const fuerza = Math.min(temblor, 12) * 0.6;
            ctx.translate(azar(-fuerza, fuerza), azar(-fuerza, fuerza));
        }

        dibujarFondo();
        dibujarPlataformas();
        dibujarBarreraJefe();
        dibujarPuntoControl();
        dibujarCartelesTutorial();
        dibujarDecoraciones();
        dibujarTrampolines();
        dibujarPlantas();
        dibujarMeta();
        dibujarObstaculosSuelo();
        dibujarMonedas();
        dibujarDiamantes();
        dibujarReliquiaSecreta();
        dibujarLlave();
        dibujarCorazones();
        dibujarEscudos();
        dibujarCanones();
        dibujarEnemigos();
        dibujarJefe();
        dibujarProyectiles();
        dibujarJugador();
        dibujarParticulas();

        ctx.restore();

        dibujarHUD();
        dibujarIndicadorLlave();
        dibujarMensaje();
        dibujarPanelTutorial();

        // Consejo de la mecánica del mundo, al empezar el nivel.
        if (!enTutorial && tiempo > 60 && tiempo < 360 && AYUDAS[nivelActual]) {
            const consejos = consejosContextualesNivel();
            const consejo = consejos[Math.floor((tiempo - 60) / 60) % consejos.length];
            ctx.globalAlpha = Math.max(0, Math.min(1, (360 - tiempo) / 40, (tiempo - 60) / 30));
            ctx.fillStyle = "rgba(7, 12, 27, 0.75)";
            ctx.fillRect(ANCHO / 2 - 330, 175, 660, 36);
            textoCentrado(consejo, ANCHO / 2, 198, 12, "#bdefff");
            ctx.globalAlpha = 1;
        }

        if (pausado) {
            ctx.fillStyle = "rgba(6, 10, 25, 0.7)";
            ctx.fillRect(0, 0, ANCHO, ALTO);
            textoCentrado("PAUSA", ANCHO / 2, ALTO / 2 - 48, 40, "#ffe16b");
            textoCentrado(
                "P: continuar   |   M: mapa   |   R: reiniciar   |   Q: menú",
                ANCHO / 2,
                ALTO / 2 - 12,
                12,
                "#c9d9f5"
            );
            rectangulo(ANCHO / 2 - 155, ALTO / 2 + 12, 310, 42, "#24547a");
            ctx.strokeStyle = "#ffe16b";
            ctx.lineWidth = 2;
            ctx.strokeRect(ANCHO / 2 - 155, ALTO / 2 + 12, 310, 42);
            textoCentrado("VOLVER AL MENÚ PRINCIPAL", ANCHO / 2, ALTO / 2 + 39, 13, "#ffffff");
        }
    }

    // -----------------------------------------------------
    // MAPA DE NIVELES
    // -----------------------------------------------------

    function nivelDeEcosistema(ecosistema, etapa = 1) {
        return (ecosistema - 1) * NIVELES_POR_ECOSISTEMA + etapa;
    }

    function abrirSeccionEcosistema(ecosistema) {
        const inicio = nivelDeEcosistema(ecosistema);
        if (inicio > nivelesDesbloqueados) {
            mostrarMensaje("SECCIÓN BLOQUEADA: AVANZA EN LOS NIVELES", 100);
            return;
        }
        seccionMapaActual = ecosistema;
        mapaVista = "niveles";
        const finDisponible = Math.min(inicio + NIVELES_POR_ECOSISTEMA - 1, nivelesDesbloqueados);
        if (nivelActual < inicio || nivelActual > finDisponible) nivelActual = finDisponible;
    }

    function dibujarBotonVolverMenuMapa() {
        const x = ANCHO - 212, y = 421, ancho = 184, alto = 36;
        rectangulo(x, y, ancho, alto, "#142845");
        ctx.strokeStyle = "#ffe16b";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, ancho, alto);
        textoCentrado("⌂ MENÚ PRINCIPAL", x + ancho / 2, y + 24, 12, "#ffffff");
    }

    function dibujarMapa() {
        const colores = [
            "#3b9c65", "#91b9cc", "#c0ad59", "#e4a552", "#48a98b",
            "#54b7ba", "#71b3b5", "#26a9a9", "#4e9273", "#17677a"
        ];
        const fondo = ctx.createLinearGradient(0, 0, 0, ALTO);
        fondo.addColorStop(0, "#07162f");
        fondo.addColorStop(1, "#174b75");
        ctx.fillStyle = fondo;
        ctx.fillRect(0, 0, ANCHO, ALTO);

        for (let i = 0; i < 42; i++) {
            ctx.globalAlpha = 0.25 + Math.abs(Math.sin(tiempo * 0.03 + i)) * 0.4;
            rectangulo((i * 137) % ANCHO, (i * 67) % ALTO, i % 5 === 0 ? 3 : 2, 2, "#bcecff");
        }
        ctx.globalAlpha = 1;

        if (mapaVista === "ecosistemas") {
            textoCentrado("SECCIONES DE ECOSISTEMAS", ANCHO / 2, 48, 25, "#ffe16b");
            textoCentrado(`Progreso independiente · perfil ${opciones.dificultad.toUpperCase()}`, ANCHO / 2, 76, 13, "#bdefff");

            const ancho = 158;
            const alto = 145;
            const espacioX = 12;
            const espacioY = 17;
            const inicioX = (ANCHO - (5 * ancho + 4 * espacioX)) / 2;
            const inicioY = 105;

            for (let i = 1; i <= ECOSISTEMAS.length; i++) {
                const columna = (i - 1) % 5;
                const fila = Math.floor((i - 1) / 5);
                const x = inicioX + columna * (ancho + espacioX);
                const y = inicioY + fila * (alto + espacioY);
                const desbloqueado = nivelDeEcosistema(i) <= nivelesDesbloqueados;
                const color = desbloqueado ? colores[i - 1] : "#515b6c";
                const inicioNivelEco = nivelDeEcosistema(i);
                const etapasAbiertas = limitar(nivelesDesbloqueados - inicioNivelEco + 1, 0, NIVELES_POR_ECOSISTEMA);
                const estrellasEco = mejoresEstrellas.slice(inicioNivelEco - 1, inicioNivelEco + NIVELES_POR_ECOSISTEMA - 1).reduce((total, estrellas) => total + estrellas, 0);
                const jefeSuperado = jefesDerrotados.includes(i);

                rectangulo(x + 4, y + 5, ancho, alto, "#061020");
                rectangulo(x, y, ancho, alto, desbloqueado ? "#142845" : "#202738");
                rectangulo(x, y, ancho, 7, color);
                rectangulo(x + 8, y + 15, ancho - 16, 48, color);

                if ([6, 7, 8, 9, 10].includes(i)) {
                    ctx.fillStyle = "rgba(3, 30, 55, 0.52)";
                    for (let banda = 0; banda < 3; banda++) ctx.fillRect(x + 8, y + 40 + banda * 7, ancho - 16, 2);
                    if (i === 8 || i === 10) {
                        ctx.fillStyle = i === 10 ? "#72e6dc" : "#ff9a9e";
                        ctx.fillRect(x + 68, y + 25, 7, 31);
                        ctx.fillRect(x + 52, y + 38, 22, 5);
                        ctx.fillRect(x + 92, y + 28, 6, 28);
                        ctx.fillRect(x + 95, y + 34, 18, 5);
                    }
                } else if (i === 4) {
                    ctx.fillStyle = "#ffe16b";
                    ctx.beginPath();
                    ctx.arc(x + ancho / 2, y + 38, 13, 0, Math.PI * 2);
                    ctx.fill();
                    rectangulo(x + 12, y + 53, ancho - 24, 5, "#d6964f");
                } else {
                    ctx.fillStyle = "rgba(5, 20, 40, 0.42)";
                    ctx.beginPath();
                    ctx.moveTo(x + 10, y + 62);
                    ctx.lineTo(x + 48, y + 25);
                    ctx.lineTo(x + 76, y + 62);
                    ctx.lineTo(x + 112, y + 30);
                    ctx.lineTo(x + ancho - 10, y + 62);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.font = "bold 10px monospace";
                ctx.fillStyle = desbloqueado ? "#ffffff" : "#9ca5b9";
                ctx.textAlign = "center";
                ctx.fillText(ECOSISTEMAS[i - 1].nombre, x + ancho / 2, y + 82, ancho - 12);
                ctx.font = "bold 11px monospace";
                ctx.fillStyle = desbloqueado ? "#bdefff" : "#8d93a5";
                ctx.fillText(desbloqueado ? `${etapasAbiertas}/5 NIVELES · ${estrellasEco}/15 ★` : "BLOQUEADO", x + ancho / 2, y + 111);
                ctx.font = "bold 9px monospace";
                ctx.fillStyle = jefeSuperado ? "#8affb2" : desbloqueado ? "#ffcf72" : "#8d93a5";
                ctx.fillText(jefeSuperado ? "JEFE SUPERADO ✓" : desbloqueado ? "JEFE FINAL: PENDIENTE" : "JEFE: BLOQUEADO", x + ancho / 2, y + 130);
                ctx.strokeStyle = i === seccionMapaActual ? "#ffe16b" : color;
                ctx.lineWidth = i === seccionMapaActual ? 3 : 2;
                ctx.strokeRect(x, y, ancho, alto);
            }

            textoCentrado(`NIVELES DESBLOQUEADOS: ${nivelesDesbloqueados}/${TOTAL_NIVELES}`, ANCHO / 2, 442, 14, "#ffe16b");
            textoCentrado("FLECHAS: elegir sección  |  ENTER: abrir  |  CLIC: seleccionar", ANCHO / 2, 470, 11, "#c6dcff");
        } else {
            const eco = ECOSISTEMAS[seccionMapaActual - 1];
            const inicio = nivelDeEcosistema(seccionMapaActual);
            const color = colores[seccionMapaActual - 1];
            textoCentrado(eco.nombre, ANCHO / 2, 54, 25, "#ffe16b");
            textoCentrado(`${eco.tipo.toUpperCase()} · PERFIL ${opciones.dificultad.toUpperCase()}`, ANCHO / 2, 82, 13, "#bdefff");

            const ancho = 150;
            const alto = 178;
            const espacio = 18;
            const inicioX = (ANCHO - (5 * ancho + 4 * espacio)) / 2;
            const y = 142;
            for (let etapa = 1; etapa <= NIVELES_POR_ECOSISTEMA; etapa++) {
                const numeroNivel = inicio + etapa - 1;
                const x = inicioX + (etapa - 1) * (ancho + espacio);
                const abierto = numeroNivel <= nivelesDesbloqueados;
                const seleccionado = numeroNivel === nivelActual;
                const tono = abierto ? color : "#515b6c";
                rectangulo(x + 4, y + 5, ancho, alto, "#061020");
                rectangulo(x, y, ancho, alto, abierto ? "#142845" : "#202738");
                rectangulo(x, y, ancho, 8, tono);
                rectangulo(x + 9, y + 17, ancho - 18, 64, abierto ? color : "#3a4353");

                // Cada etapa tiene un patrón, semilla y mezcla de obstáculos propios.
                for (let detalle = 0; detalle < etapa + 1; detalle++) {
                    const dx = x + 18 + ((detalle * 29 + etapa * 11) % (ancho - 36));
                    const dy = y + 70 - ((detalle * 13 + etapa * 7) % 33);
                    rectangulo(dx, dy, 5 + detalle % 3 * 3, 4, abierto ? "#d8ffff" : "#838b99");
                }
                textoCentrado(String(etapa), x + ancho / 2, y + 52, 28, abierto ? "#ffffff" : "#a0a7b3");
                textoCentrado(etapa === NIVELES_POR_ECOSISTEMA ? "JEFE FINAL" : `ETAPA ${etapa}`, x + ancho / 2, y + 108, 14, abierto ? (etapa === NIVELES_POR_ECOSISTEMA ? "#ffcf72" : "#ffffff") : "#9ca5b9");
                textoCentrado(CORE.niveles[numeroNivel - 1].titulo, x + ancho / 2, y + 132, 10, abierto ? "#bdefff" : "#8d93a5");
                const estrellas = mejoresEstrellas[numeroNivel - 1] || 0;
                textoCentrado(`${"★".repeat(estrellas)}${"☆".repeat(3 - estrellas)}`, x + ancho / 2, y + 150, 13, abierto ? "#ffe16b" : "#858d9c");
                const jefeSuperado = etapa === NIVELES_POR_ECOSISTEMA && jefesDerrotados.includes(seccionMapaActual);
                textoCentrado(jefeSuperado ? "JEFE DERROTADO" : abierto ? "DISPONIBLE" : "BLOQUEADO", x + ancho / 2, y + 168, 9, jefeSuperado ? "#8affb2" : abierto ? "#8affb2" : "#9ca5b9");
                ctx.strokeStyle = seleccionado ? "#ffe16b" : tono;
                ctx.lineWidth = seleccionado ? 4 : 2;
                ctx.strokeRect(x, y, ancho, alto);
            }

            rectangulo(28, 421, 184, 36, "#142845");
            ctx.strokeStyle = "#4b84ff";
            ctx.lineWidth = 2;
            ctx.strokeRect(28, 421, 184, 36);
            textoCentrado("← ECOSISTEMAS", 120, 445, 12, "#ffffff");
            textoCentrado("FLECHAS: elegir etapa  |  ENTER: jugar  |  ESC: volver", ANCHO / 2, 477, 11, "#c6dcff");
        }

        dibujarBotonVolverMenuMapa();

        dibujarMensaje();
    }

    // -----------------------------------------------------
    // VICTORIA Y DERROTA
    // -----------------------------------------------------

    function dibujarPantallaFinal(titulo, subtitulo, color) {
        dibujarFondo();

        ctx.fillStyle = "rgba(6, 10, 25, 0.82)";
        ctx.fillRect(0, 0, ANCHO, ALTO);

        textoCentrado(titulo, ANCHO / 2, 190, 34, color);
        textoCentrado(subtitulo, ANCHO / 2, 235, 17, "#eaf2ff");
        textoCentrado(`Puntuación: ${puntuacion}`, ANCHO / 2, 280, 18, "#ffd85d");
        if (estado === "victoria") {
            const estrellas = "★".repeat(estrellasUltimoNivel) + "☆".repeat(3 - estrellasUltimoNivel);
            textoCentrado(`ESTRELLAS DEL NIVEL: ${estrellas}`, ANCHO / 2, 316, 20, "#ffe16b");
            textoCentrado("1 superar · 1 sin perder vidas · 1 recoger todas las monedas", ANCHO / 2, 341, 11, "#c9d9f5");
        }
        textoCentrado("ENTER: continuar   |   R: reiniciar nivel", ANCHO / 2, 383, 14, "#c9d9f5");
        textoCentrado("M: volver al mapa", ANCHO / 2, 412, 14, "#c9d9f5");
    }

    function dibujarVentanaLogro() {
        if (!ventanaLogro) return;
        const titulos = ventanaLogro.titulos || [];
        const alto = Math.max(225, 137 + titulos.length * 30);
        const y = (ALTO - alto) / 2;
        ctx.fillStyle = "rgba(3, 8, 20, 0.78)";
        ctx.fillRect(0, 0, ANCHO, ALTO);
        rectangulo(170, y, ANCHO - 340, alto, "#101d36");
        ctx.strokeStyle = "#ffe16b";
        ctx.lineWidth = 4;
        ctx.strokeRect(170, y, ANCHO - 340, alto);
        textoCentrado("¡LOGRO DESBLOQUEADO!", ANCHO / 2, y + 39, 22, "#ffe16b");
        titulos.forEach((titulo, indice) => textoCentrado(titulo, ANCHO / 2, y + 83 + indice * 28, 14, indice === titulos.length - 1 && ventanaLogro.logroTotal ? "#ffadf4" : "#ffffff"));
        textoCentrado(`JEFES DERROTADOS: ${jefesDerrotados.length}/${ECOSISTEMAS.length}`, ANCHO / 2, y + alto - 47, 12, "#8affb2");
        textoCentrado("ENTER o ESC para continuar", ANCHO / 2, y + alto - 22, 11, "#c9d9f5");
    }

    function dibujarVentanaHistoria() {
        if (!ventanaHistoria) return;
        const id = ventanaHistoria.ecosistema;
        const eco = ECOSISTEMAS[id - 1];
        const capitulo = CAPITULOS_HISTORIA[id - 1];
        const esInicio = ventanaHistoria.tipo === "inicio";
        const esJefe = ventanaHistoria.tipo === "jefe";
        ctx.fillStyle = "rgba(2, 7, 18, 0.82)";
        ctx.fillRect(0, 0, ANCHO, ALTO);
        rectangulo(80, 44, 740, 412, "#10263a");
        ctx.strokeStyle = esJefe ? "#ff9b70" : esInicio ? "#61c9a5" : "#ffe16b";
        ctx.lineWidth = 4;
        ctx.strokeRect(80, 44, 740, 412);
        textoCentrado(esInicio ? "NUEVO ECOSISTEMA" : esJefe ? "PRESENTACIÓN DEL GUARDIÁN" : "¡GUARDIÁN A SALVO!", ANCHO / 2, 82, 24, esInicio ? "#8affb2" : esJefe ? "#ffb790" : "#ffe16b");
        textoCentrado(eco.nombre, ANCHO / 2, 111, 17, "#ffffff");
        const subtitulo = esInicio ? "INICIO DE LA EXPLORACIÓN" : esJefe
            ? `${guardianDeEcosistema(id).toLocaleUpperCase("es")} · GUARDIÁN CORROMPIDO`
            : `${capitulo.titulo} · CAPÍTULO DESBLOQUEADO`;
        textoCentrado(subtitulo, ANCHO / 2, 137, 12, "#bdefff");

        ctx.beginPath(); ctx.moveTo(240, 183); ctx.lineTo(660, 183);
        ctx.strokeStyle = "#91d9b2"; ctx.lineWidth = 4; ctx.stroke();
        capitulo.mapa.forEach((icono, i) => {
            const x = 240 + i * 105;
            ctx.fillStyle = esJefe ? "#734535" : esInicio ? "#24547a" : "#27614e";
            ctx.beginPath(); ctx.arc(x, 183, 22, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#bcecff"; ctx.lineWidth = 1; ctx.stroke();
            ctx.font = "20px sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#ffffff";
            ctx.fillText(icono, x, 190);
            ctx.font = "bold 9px monospace"; ctx.fillStyle = "#c9d9f5";
            ctx.fillText(`ETAPA ${i + 1}`, x, 218);
        });

        const textoHistoria = esInicio
            ? capitulo.inicio
            : esJefe
                ? relatoCorrupcionGuardian(id)
                : `${capitulo.final} ${relatoCuraGuardian(id)}`;
        ctx.font = "13px monospace"; ctx.fillStyle = "#e8f0e0"; ctx.textAlign = "left";
        const lineas = [];
        let linea = "";
        for (const palabra of textoHistoria.split(/\s+/)) {
            const candidata = linea ? `${linea} ${palabra}` : palabra;
            if (ctx.measureText(candidata).width > 640 && linea) { lineas.push(linea); linea = palabra; }
            else linea = candidata;
        }
        if (linea) lineas.push(linea);
        lineas.slice(0, 6).forEach((texto, i) => ctx.fillText(texto, 130, 258 + i * 21));

        rectangulo(350, 380, 200, 43, "#24547a");
        ctx.strokeStyle = "#ffe16b"; ctx.lineWidth = 2; ctx.strokeRect(350, 380, 200, 43);
        const etiquetaBoton = esInicio ? "COMENZAR EXPLORACIÓN" : esJefe ? "AYUDAR AL GUARDIÁN" : "CONTINUAR";
        textoCentrado(etiquetaBoton, ANCHO / 2, 407, 12, "#ffffff");
        textoCentrado("Clic · ENTER · ESPACIO · ESC", ANCHO / 2, 443, 10, "#c9d9f5");
    }

    function cerrarVentanaHistoria() {
        if (!ventanaHistoria) return;
        if (ventanaHistoria.tipo === "inicio") {
            const id = ventanaHistoria.ecosistema;
            if (!iniciosHistoriaVistos.includes(id)) iniciosHistoriaVistos.push(id);
            guardarProgreso();
        }
        ventanaHistoria = null;
        if (estado === "jugando") pausado = false;
    }

    function logrosDeEcosistema(id) {
        const eco = ECOSISTEMAS[id - 1];
        return [
            { titulo: LOGROS_JEFES[id - 1], descripcion: `${eco.nombre}: derrota al jefe final.`, obtenido: jefesDerrotados.includes(id) },
            { titulo: LOGROS_COMPLETAR_ECOSISTEMA[id - 1], descripcion: `${eco.nombre}: supera sus cinco niveles y al jefe.`, obtenido: ecosistemasCompletados.includes(id) },
            { titulo: LOGROS_AVARICIA[id - 1], descripcion: `${eco.nombre}: recoge todas las monedas en sus cinco niveles.`, obtenido: logrosAvaricia.includes(id) },
            { titulo: LOGROS_SIN_DANIO[id - 1], descripcion: `${eco.nombre}: completa los cinco niveles sin perder vidas.`, obtenido: logrosSinDanio.includes(id) },
            { titulo: LOGROS_CAZADOR[id - 1], descripcion: `${eco.nombre}: elimina a todos los enemigos de sus cinco niveles.`, obtenido: logrosCazador.includes(id) }
        ];
    }

    function obtenerTodosLosLogros() {
        const todos = ECOSISTEMAS.flatMap((_, indice) => logrosDeEcosistema(indice + 1));
        todos.push(
            { titulo: "CAMPEÓN DE LOS JEFES", descripcion: "Derrota a los diez jefes finales.", obtenido: logroTodosLosJefes },
            { titulo: LOGRO_TODOS_ECOSISTEMAS, descripcion: "Completa los diez ecosistemas.", obtenido: logroTodosLosEcosistemas },
            ...Object.entries(LOGROS_DIFICULTAD).map(([dificultad, logro]) => ({
                titulo: logro.titulo,
                descripcion: logro.descripcion,
                obtenido: logrosDificultad.includes(dificultad)
            })),
            { titulo: LOGRO_TODOS_LOGROS, descripcion: "Desbloquea todos los logros de los tres perfiles de dificultad.", obtenido: logroTodosLosLogros }
        );
        return todos;
    }

    function dibujarPantallaLogros() {
        const fondo = ctx.createLinearGradient(0, 0, 0, ALTO);
        fondo.addColorStop(0, "#07162f");
        fondo.addColorStop(1, "#174b75");
        ctx.fillStyle = fondo;
        ctx.fillRect(0, 0, ANCHO, ALTO);
        textoCentrado(`LOGROS · ${opciones.dificultad.toUpperCase()}`, ANCHO / 2, 40, 25, "#ffe16b");

        const menuX = 14, menuY = 77, menuW = 190, menuH = 31, menuGap = 4;
        const pestañas = ["TODOS LOS LOGROS", ...ECOSISTEMAS.map(eco => eco.nombre)];
        pestañas.forEach((nombre, indice) => {
            const y = menuY + indice * (menuH + menuGap);
            const seleccionado = indice === ecosistemaLogros;
            rectangulo(menuX + 2, y + 3, menuW, menuH, "#030916");
            rectangulo(menuX, y, menuW, menuH, seleccionado ? "#24547a" : "#14243b");
            ctx.strokeStyle = seleccionado ? "#ffe16b" : "#496987";
            ctx.lineWidth = seleccionado ? 2 : 1;
            ctx.strokeRect(menuX, y, menuW, menuH);
            ctx.font = "bold 9px monospace";
            ctx.textAlign = "left";
            ctx.fillStyle = seleccionado ? "#ffffff" : "#b7c8dc";
            ctx.fillText(nombre, menuX + 10, y + 20, menuW - 18);
        });

        const lista = ecosistemaLogros === 0
            ? obtenerTodosLosLogros()
            : logrosDeEcosistema(ecosistemaLogros);
        const x = 220, y = 91, ancho = ANCHO - 236, altoFila = 51, separacion = 5;
        const filasVisibles = 6;
        const maxScroll = Math.max(0, lista.length - filasVisibles);
        logrosScroll = limitar(logrosScroll, 0, maxScroll);
        const tituloVista = ecosistemaLogros === 0 ? "TODOS LOS DESAFÍOS" : ECOSISTEMAS[ecosistemaLogros - 1].nombre;
        ctx.font = "bold 13px monospace";
        ctx.textAlign = "left";
        ctx.fillStyle = "#ffe16b";
        ctx.fillText(tituloVista, x + 4, 77, ancho - 8);

        for (let fila = 0; fila < filasVisibles; fila++) {
            const logro = lista[logrosScroll + fila];
            if (!logro) break;
            const filaY = y + fila * (altoFila + separacion);
            const color = logro.obtenido ? "#8affb2" : "#74839a";
            rectangulo(x + 3, filaY + 3, ancho, altoFila, "#030916");
            rectangulo(x, filaY, ancho, altoFila, logro.obtenido ? "#183b3a" : "#172235");
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(x, filaY, ancho, altoFila);
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "left";
            ctx.fillStyle = logro.obtenido ? "#ffffff" : "#bac6d6";
            ctx.fillText(logro.titulo, x + 10, filaY + 19, ancho - 130);
            ctx.font = "9px monospace";
            ctx.fillStyle = "#c9d9f5";
            ctx.fillText(logro.descripcion, x + 10, filaY + 38, ancho - 130);
            textoCentrado(logro.obtenido ? "✓ OBTENIDO" : "◇ PENDIENTE", x + ancho - 64, filaY + 30, 9, color);
        }

        if (maxScroll > 0) {
            const barraX = ANCHO - 9, barraY = y, barraAlto = filasVisibles * (altoFila + separacion) - separacion;
            rectangulo(barraX, barraY, 4, barraAlto, "#253951");
            const altoPulgar = Math.max(24, barraAlto * filasVisibles / lista.length);
            rectangulo(barraX, barraY + (barraAlto - altoPulgar) * (logrosScroll / maxScroll), 4, altoPulgar, "#ffe16b");
        }
        const ayuda = ecosistemaLogros === 0
            ? "TODOS: usa RePág/AvPág o la rueda del ratón para recorrer la lista"
            : "Se muestran los cinco logros de esta sección";
        textoCentrado(ayuda, x + ancho / 2, 439, 9, "#bdefff");
        textoCentrado("↑↓ pestañas · clic para elegir · ENTER o ESC para volver al menú", ANCHO / 2, 479, 10, "#d1e4ff");
    }

    function ecosistemaHistoriaAbierta(id) {
        const niveles = nivelesCompletadosDificultad[opciones.dificultad] || [];
        const inicio = nivelDeEcosistema(id);
        return Array.from({ length: NIVELES_POR_ECOSISTEMA }, (_, i) => niveles.includes(inicio + i)).every(Boolean);
    }

    function dibujarSelectorBitacora() {
        const x1 = ANCHO / 2 - 188, y = 84, w = 174, h = 32;
        [["album", "ÁLBUM DE FAUNA", x1], ["historia", "HISTORIA", x1 + 202]].forEach(([vista, label, x]) => {
            rectangulo(x, y, w, h, vistaBitacora === vista ? "#24547a" : "#14243b");
            ctx.strokeStyle = vistaBitacora === vista ? "#ffe16b" : "#496987";
            ctx.lineWidth = vistaBitacora === vista ? 2 : 1;
            ctx.strokeRect(x, y, w, h);
            textoCentrado(label, x + w / 2, y + 21, 11, "#ffffff");
        });
    }

    function dibujarSelectorEcosistemas() {
        const ancho = 158, alto = 36, gapX = 12, gapY = 7;
        const inicioX = (ANCHO - 5 * ancho - 4 * gapX) / 2;
        ECOSISTEMAS.forEach((eco, i) => {
            const x = inicioX + (i % 5) * (ancho + gapX), y = 124 + Math.floor(i / 5) * (alto + gapY);
            const actual = i === ecosistemaAlbum;
            const abierto = nivelesDesbloqueados >= i * NIVELES_POR_ECOSISTEMA + 1;
            rectangulo(x, y, ancho, alto, actual ? "#24547a" : abierto ? "#14243b" : "#202738");
            ctx.strokeStyle = actual ? "#ffe16b" : abierto ? "#61c9a5" : "#425064";
            ctx.lineWidth = actual ? 2 : 1;
            ctx.strokeRect(x, y, ancho, alto);
            ctx.font = "bold 9px monospace"; ctx.textAlign = "center";
            ctx.fillStyle = abierto ? "#fff" : "#9ca5b9";
            ctx.fillText(abierto ? eco.nombre : "??? · BLOQUEADO", x + ancho / 2, y + 23, ancho - 8);
        });
    }

    function dibujarBotonVolverBitacora() {
        rectangulo(730, 24, 140, 32, "#142845");
        ctx.strokeStyle = "#ffe16b"; ctx.lineWidth = 2; ctx.strokeRect(730, 24, 140, 32);
        textoCentrado("← VOLVER", 800, 45, 11, "#ffffff");
    }

    function dibujarPaginacionAlbum(pagina, total) {
        if (total <= 1) return;
        const anterior = pagina > 0, siguiente = pagina < total - 1;
        rectangulo(255, 443, 145, 27, anterior ? "#24547a" : "#202738");
        rectangulo(500, 443, 145, 27, siguiente ? "#24547a" : "#202738");
        ctx.strokeStyle = anterior ? "#9bdfff" : "#465164"; ctx.strokeRect(255, 443, 145, 27);
        ctx.strokeStyle = siguiente ? "#9bdfff" : "#465164"; ctx.strokeRect(500, 443, 145, 27);
        textoCentrado("‹ ANTERIOR", 327, 461, 10, anterior ? "#ffffff" : "#8793a5");
        textoCentrado("SIGUIENTE ›", 572, 461, 10, siguiente ? "#ffffff" : "#8793a5");
    }

    function dibujarBitacora() {
        const fondo = ctx.createLinearGradient(0, 0, 0, ALTO);
        fondo.addColorStop(0, "#07162f"); fondo.addColorStop(1, "#123e45");
        ctx.fillStyle = fondo; ctx.fillRect(0, 0, ANCHO, ALTO);
        textoCentrado("BITÁCORA DEL PACTO VERDE", ANCHO / 2, 42, 25, "#ffe16b");
        textoCentrado("Una aventura de restauración, conocimiento y cuidado", ANCHO / 2, 66, 12, "#bdefff");
        dibujarBotonVolverBitacora();
        dibujarSelectorBitacora();
        dibujarSelectorEcosistemas();

        if (vistaBitacora === "album") {
            const catalogo = catalogoFauna(ecosistemaAlbum + 1);
            const abiertos = catalogo.filter(ficha => faunaDescubierta.includes(ficha.id)).length;
            textoCentrado(`${ECOSISTEMAS[ecosistemaAlbum].nombre} · ${abiertos}/${catalogo.length} ESPECIES DESCUBIERTAS`, ANCHO / 2, 216, 12, "#8affb2");
            const inicioX = 32, ancho = 200, alto = 94, gapX = 12, gapY = 7;
            const paginasAlbum = Math.max(1, Math.ceil(catalogo.length / 8));
            paginaAlbum = limitar(paginaAlbum, 0, paginasAlbum - 1);
            catalogo.slice(paginaAlbum * 8, paginaAlbum * 8 + 8).forEach((ficha, i) => {
                const x = inicioX + (i % 4) * (ancho + gapX), y = 226 + Math.floor(i / 4) * (alto + gapY);
                const descubierta = faunaDescubierta.includes(ficha.id);
                rectangulo(x, y, ancho, alto, descubierta ? "#173b38" : "#192230");
                ctx.strokeStyle = descubierta ? "#61c9a5" : "#465164"; ctx.strokeRect(x, y, ancho, alto);
                ctx.font = "34px sans-serif"; ctx.textAlign = "left"; ctx.fillText(descubierta ? ilustracionFauna(ficha) : "❔", x + 10, y + 45);
                ctx.font = "bold 10px monospace"; ctx.fillStyle = descubierta ? "#ffe16b" : "#d0d7e0";
                ctx.fillText(ficha.nombre.toLocaleUpperCase("es"), x + 58, y + 25, ancho - 64);
                ctx.font = "9px monospace"; ctx.fillStyle = "#9bdfff";
                ctx.fillText(`TIPO: ${ficha.clase.toLocaleUpperCase("es")}`, x + 58, y + 41, ancho - 66);
                ctx.fillStyle = "#d5e6da";
                const nota = descubierta ? datoEducativoFauna(ficha) : "Observa esta especie para completar su ficha.";
                const trozos = []; let trozo = "";
                for (const palabra of nota.split(/\s+/)) {
                    const candidata = trozo ? `${trozo} ${palabra}` : palabra;
                    if (ctx.measureText(candidata).width > ancho - 66 && trozo) { trozos.push(trozo); trozo = palabra; }
                    else trozo = candidata;
                }
                if (trozo) trozos.push(trozo);
                trozos.slice(0, 3).forEach((texto, fila) => ctx.fillText(texto, x + 58, y + 53 + fila * 10));
                ctx.font = "9px monospace"; ctx.fillStyle = descubierta ? "#8affb2" : "#ffcf72";
                ctx.fillText(descubierta ? "✓ FICHA COMPLETA" : "◇ POR DESCUBRIR", x + 58, y + 88);
            });
            textoCentrado(`${abiertos}/${catalogo.length} fichas completas · Las imágenes y datos se revelan al observar cada especie.`, ANCHO / 2, 434, 10, "#bdefff");
            dibujarPaginacionAlbum(paginaAlbum, paginasAlbum);
        } else {
            const id = ecosistemaAlbum + 1;
            const eco = ECOSISTEMAS[ecosistemaAlbum];
            const capitulo = CAPITULOS_HISTORIA[ecosistemaAlbum];
            const abierto = ecosistemaHistoriaAbierta(id);
            const inicioNivel = nivelDeEcosistema(id);
            const nivelesCompletados = nivelesCompletadosDificultad[opciones.dificultad] || [];
            const mapaAbierto = nivelesDesbloqueados >= inicioNivel;
            const coloresMapa = ["#244d3d", "#5c7786", "#716a3b", "#9b6137", "#285441", "#266f79", "#536e73", "#155d66", "#365848", "#143f59"];
            rectangulo(32, 226, 420, 216, coloresMapa[ecosistemaAlbum]);
            ctx.strokeStyle = "#9bdfff"; ctx.lineWidth = 2; ctx.strokeRect(32, 226, 420, 216);
            ctx.font = "bold 11px monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#ffffff";
            ctx.fillText(mapaAbierto ? `MAPA DE RUTA · ${eco.nombre}` : "MAPA AÚN NO EXPLORADO", 242, 248);
            if (mapaAbierto) {
                // Cada nodo marca una etapa del recorrido a través del hábitat.
                ctx.beginPath(); ctx.moveTo(78, 320);
                for (let i = 1; i < 5; i++) ctx.lineTo(78 + i * 84, 320 + (i % 2 ? -34 : 34));
                ctx.strokeStyle = "#c7f3d1"; ctx.lineWidth = 5; ctx.stroke();
                capitulo.mapa.forEach((icono, i) => {
                    const x = 78 + i * 84, y = 320 + (i % 2 ? -34 : 34);
                    ctx.fillStyle = nivelesCompletados.includes(inicioNivel + i) ? "#8affb2" : nivelesDesbloqueados >= inicioNivel + i ? "#ffe16b" : "#8090a4";
                    ctx.beginPath(); ctx.arc(x, y, 19, 0, Math.PI * 2); ctx.fill();
                    ctx.font = "18px sans-serif"; ctx.textAlign = "center"; ctx.fillText(icono, x, y + 6);
                    ctx.font = "bold 9px monospace"; ctx.fillStyle = "#ffffff"; ctx.fillText(`N${i + 1}`, x, y + 38);
                });
            } else {
                textoCentrado("Explora los hábitats en orden para", 242, 315, 11, "#d7e9f0");
                textoCentrado("revelar su mapa de ruta.", 242, 338, 11, "#d7e9f0");
            }
            const finalizado = nivelesCompletados.filter(n => n >= inicioNivel && n < inicioNivel + 5).length;
            rectangulo(78, 397, 330, 5, "#354e60");
            rectangulo(78, 397, 330 * finalizado / 5, 5, "#8affb2");

            rectangulo(470, 226, 398, 216, "#10263a");
            ctx.strokeStyle = abierto ? "#61c9a5" : "#496987"; ctx.lineWidth = 2; ctx.strokeRect(470, 226, 398, 216);
            ctx.textAlign = "left"; ctx.font = "bold 13px monospace"; ctx.fillStyle = abierto ? "#ffe16b" : "#aab6c5";
            ctx.fillText(abierto ? capitulo.titulo : "CAPÍTULO BLOQUEADO", 490, 254, 360);
            const guardian = guardianDeEcosistema(id).toLocaleLowerCase("es");
            const sustancia = CORRUPCIONES_GUARDIAN[ecosistemaAlbum].sustancia;
            const relato = abierto
                ? `${capitulo.texto} En el desafío final, el guardián ${guardian} fue afectado por ${sustancia}. Lo calmaste con pulsos restauradores y le diste un antídoto preparado con los tres diamantes.`
                : "La Red Viva se debilita por incendios, residuos y contaminación. Completa este recorrido para descubrir cómo cada especie ayuda a su hábitat y restaurar la conexión entre los mundos.";
            ctx.font = "10px monospace"; ctx.fillStyle = "#e8f0e0";
            const lineas = [];
            let linea = "";
            for (const palabra of relato.split(/\s+/)) {
                const candidata = linea ? `${linea} ${palabra}` : palabra;
                if (ctx.measureText(candidata).width > 358 && linea) { lineas.push(linea); linea = palabra; }
                else linea = candidata;
            }
            if (linea) lineas.push(linea);
            lineas.slice(0, 7).forEach((texto, i) => ctx.fillText(texto, 490, 280 + i * 17));
            textoCentrado(abierto ? "CAPÍTULO REVELADO · LA RUTA DEJA UNA HUELLA" : `AL COMPLETAR LOS 5 NIVELES · ${finalizado}/5 SUPERADOS`, 669, 416, 9, abierto ? "#8affb2" : "#ffcf72");
        }
        textoCentrado("← → cambia de hábitat · clic para elegir · ESC o VOLVER para salir", ANCHO / 2, 490, 10, "#c9d9f5");
    }
    // -----------------------------------------------------
    // ACTUALIZACIÓN PRINCIPAL
    // -----------------------------------------------------

    function actualizar() {
        sincronizarMusica();
        // En pausa se congela todo (animaciones incluidas).
        // El fundido debe terminar aunque una ventana narrativa pause la partida.
        if (pausado && estado === "jugando" && fundidoDir === 0) return;

        tiempo++;

        // Guarda automáticamente de forma periódica sin escribir en cada fotograma.
        if (tiempo % 180 === 0) guardarProgreso();

        // Fundido entre pantallas.
        if (fundidoDir !== 0) {
            fundidoAlfa += fundidoDir * 0.06;

            if (fundidoDir === 1 && fundidoAlfa >= 1) {
                fundidoAlfa = 1;
                fundidoDir = -1;
                const callback = fundidoCb;
                fundidoCb = null;
                if (callback) callback();
            } else if (fundidoDir === -1 && fundidoAlfa <= 0) {
                fundidoAlfa = 0;
                fundidoDir = 0;
            }
        }

        // Cuando termina el fundido, la ventana narrativa sigue congelando el mundo.
        if (pausado && estado === "jugando") return;

        // Mensajes en pantalla.
        if (mensajeTiempo > 0) {
            mensajeTiempo--;
            if (mensajeTiempo === 0) confirmarReinicio = false;
        }

        // Los puntos suben poco a poco en el marcador.
        if (puntosMostrados < puntuacion) {
            puntosMostrados = Math.min(
                puntuacion,
                puntosMostrados + Math.max(1, Math.ceil((puntuacion - puntosMostrados) * 0.1))
            );
        } else if (puntosMostrados > puntuacion) {
            puntosMostrados = puntuacion;
        }

        if (temblor > 0) temblor--;

        if (estado !== "jugando") return;

        // Hit-stop: pausa brevísima al golpear, da sensación de impacto.
        if (congelar > 0) {
            congelar--;
            if (!opciones.reducirMovimiento) return;
        }

        actualizarMecanicas();
        actualizarRutaSecreta();
        actualizarJugador();
        actualizarPuntoControl();
        actualizarPlantas();
        actualizarFragiles();
        actualizarEnemigos();
        actualizarDisparos();
        actualizarJefe();
        actualizarObjetos();
        if (enTutorial) actualizarTutorial();
        actualizarParticulas();

        // Cámara suave: se acerca poco a poco al objetivo.
        const objetivo = limitar(
            jugador.x - ANCHO * 0.38 + jugador.vx * 8,
            0,
            Math.max(0, longitudNivel - ANCHO)
        );
        camaraX += (objetivo - camaraX) * 0.12;

        // Llegada a la meta.
        if (estado === "jugando" && jugador.x >= longitudNivel - 90) {
            const jefeVivo = esNivelJefe() && !!(jefe && jefe.vivo);
            const nivelCompletado = CORE.canCompleteLevel({
                diamantes: jugador.diamantes,
                tieneLlave: jugador.tieneLlave,
                jefeVivo
            });

            if (nivelCompletado && enTutorial) {
                completarTutorial();
            } else if (nivelCompletado) {
                estado = "victoria";
                sonido("victoria");
                const recogioTodasLasMonedas = monedas.length > 0 && monedas.every(moneda => moneda.recogida);
                estrellasUltimoNivel = 1 + (sinPerderVidaNivel ? 1 : 0) + (recogioTodasLasMonedas ? 1 : 0);
                mejoresEstrellas[nivelActual - 1] = Math.max(mejoresEstrellas[nivelActual - 1], estrellasUltimoNivel);
                sonido("estrella");
                crearParticulas(jugador.x + jugador.ancho / 2, jugador.y + jugador.alto / 2, "#ffd34f", 12 + estrellasUltimoNivel * 6);
                crearTextoFlotante(jugador.x + jugador.ancho / 2, jugador.y - 12, `+${estrellasUltimoNivel} ${estrellasUltimoNivel === 1 ? "ESTRELLA" : "ESTRELLAS"}`, "#ffe16b");
                const seccionYaContabaConHistoria = etapaActual() === NIVELES_POR_ECOSISTEMA && ecosistemaHistoriaAbierta(ecosistemaActual());
                const logrosNivel = registrarLogrosDelNivel();
                if (logrosNivel.length) {
                    ventanaLogro = {
                        ecosistema: ecosistemaActual(),
                        titulos: logrosNivel,
                        logroTotal: logrosNivel.includes(LOGRO_TODOS_ECOSISTEMAS) || logrosNivel.includes(LOGRO_TODOS_LOGROS)
                    };
                }
                nivelesDesbloqueados = Math.max(
                    nivelesDesbloqueados,
                    Math.min(TOTAL_NIVELES, nivelActual + 1)
                );
                guardarProgreso();
                if (etapaActual() === NIVELES_POR_ECOSISTEMA && !seccionYaContabaConHistoria) {
                    ventanaHistoria = { tipo: "desbloqueo", ecosistema: ecosistemaActual() };
                }
            } else {
                if (jugador.diamantes < 3) {
                    mostrarMensaje("TE FALTAN DIAMANTES", 90);
                } else if (!jugador.tieneLlave) {
                    mostrarMensaje(
                        nivelLlave && nivelLlave.x < jugador.x
                            ? "LA LLAVE QUEDÓ ATRÁS"
                            : "BUSCA LA LLAVE",
                        120
                    );
                } else if (jefeVivo) {
                    mostrarMensaje("DERROTA AL JEFE", 90);
                }

                // Evita que el jugador atraviese la meta sin completar.
                jugador.x = longitudNivel - 100;
            }
        }
    }

    function dibujar() {
        if (estado === "inicio") {
            dibujarMapa();
            ctx.fillStyle = "rgba(5, 8, 20, 0.82)";
            ctx.fillRect(0, 0, ANCHO, ALTO);
            textoCentrado("AVENTURA PIXEL", ANCHO / 2, 116, 36, "#8ccbff");

            const opcionesMenu = ["CONFIGURACIÓN", "MAPA DE NIVELES", "INICIAR JUEGO", "LOGROS", "PERSONAJE", tutorialCompletado ? "TUTORIAL ✓" : "TUTORIAL", "BITÁCORA · HISTORIA Y ÁLBUM"];
            const anchoBoton = MENU_ANCHO;
            const altoBoton = MENU_ALTO;
            const inicioY = MENU_Y;
            for (let i = 0; i < opcionesMenu.length; i++) {
                const y = inicioY + i * MENU_PASO;
                const x = (ANCHO - anchoBoton) / 2;
                const seleccionado = i === opcionMenu;
                ctx.fillStyle = seleccionado ? "rgba(35, 109, 160, 0.96)" : "rgba(16, 27, 43, 0.94)";
                ctx.fillRect(x, y, anchoBoton, altoBoton);
                ctx.strokeStyle = seleccionado ? "#bcecff" : "#4b84ff";
                ctx.lineWidth = seleccionado ? 3 : 2;
                ctx.strokeRect(x, y, anchoBoton, altoBoton);
                textoCentrado(opcionesMenu[i], ANCHO / 2, y + 25, 17, "#ffffff");
            }
            dibujarPreviewPersonaje(130, 232, 4, false);
            textoCentrado("Ratón o flechas para elegir · ENTER para confirmar", ANCHO / 2, 442, 12, "#bcecff");
            textoCentrado(`PERFIL ${opciones.dificultad.toUpperCase()} · NIVEL ${nivelActual}/${TOTAL_NIVELES}`, ANCHO / 2, 470, 11, "#8affb2");
            if (canvas.style) canvas.style.cursor = "pointer";
        } else if (estado === "jugando") {
            if (canvas.style) canvas.style.cursor = "default";
            dibujarJuego();
            dibujarVentanaLogro();
        } else if (estado === "bitacora") {
            if (canvas.style) canvas.style.cursor = "pointer";
            dibujarBitacora();
        } else if (estado === "mapa") {
            if (canvas.style) canvas.style.cursor = "pointer";
            dibujarMapa();
        } else if (estado === "personaje") {
            if (canvas.style) canvas.style.cursor = "pointer";
            dibujarCreadorPersonaje();
        } else if (estado === "logros") {
            if (canvas.style) canvas.style.cursor = "pointer";
            dibujarPantallaLogros();
        } else if (estado === "victoria" && enTutorial) {
            dibujarPantallaFinal(
                "¡TUTORIAL COMPLETADO!",
                "Ya conoces todas las mecánicas. Pulsa ENTER para volver al menú.",
                "#72ffb0"
            );
        } else if (estado === "victoria") {
            dibujarPantallaFinal(
                nivelActual === TOTAL_NIVELES ? "¡JUEGO COMPLETADO!" : esNivelJefe() ? "¡ECOSISTEMA SUPERADO!" : "¡NIVEL SUPERADO!",
                nivelActual === TOTAL_NIVELES
                    ? "Has unido los diez hábitats. Consulta el último capítulo en la Bitácora."
                    : esNivelJefe() ? `Has restaurado ${ECOSISTEMAS[ecosistemaActual() - 1].nombre}. El capítulo nuevo te espera en la Bitácora.` : "Has desbloqueado el siguiente nivel.",
                "#72ffb0"
            );
            dibujarVentanaLogro();
        } else if (estado === "derrota") {
            dibujarPantallaFinal(
                "¡HAS PERDIDO!",
                `Agotaste los ${vidasPorNivel()} intentos. Reiniciarás ${ECOSISTEMAS[ecosistemaActual() - 1].nombre}.`,
                "#ff6683"
            );
        }

        dibujarVentanaHistoria();

        // Fundido a negro encima de todo.
        if (fundidoAlfa > 0) {
            ctx.fillStyle = `rgba(5, 8, 20, ${Math.min(1, fundidoAlfa)})`;
            ctx.fillRect(0, 0, ANCHO, ALTO);
        }
    }

    // Bucle con paso fijo: el juego va igual en monitores de 60, 120 o 144 Hz.
    const PASO = 1000 / 60;
    let ultimoMarca = 0;
    let acumulador = 0;

    function bucle(ahora) {
        acumulador += Math.min(ahora - ultimoMarca, 100);
        ultimoMarca = ahora;
        const pasoActual = PASO / (opciones.velocidad / 100);

        while (acumulador >= pasoActual) {
            actualizar();
            acumulador -= pasoActual;
        }

        dibujar();
        requestAnimationFrame(bucle);
    }

    // -----------------------------------------------------
    // CONTROLES
    // -----------------------------------------------------

    const botonSonido = document.getElementById("boton-sonido");
    const controlVolumen = document.getElementById("volumen-sonido");
    const selectorDificultad = document.getElementById("dificultad");
    const controlVelocidad = document.getElementById("velocidad-juego");
    const salidaVelocidad = document.getElementById("valor-velocidad");
    const controlReducirMovimiento = document.getElementById("reducir-movimiento");
    const controlAltoContraste = document.getElementById("alto-contraste");
    const estadoAjustes = document.getElementById("estado-ajustes");
    const panelConfiguracion = document.getElementById("panel-configuracion");
    const botonBorrarProgreso = document.getElementById("boton-borrar-progreso");
    let accionPendiente = null;

    function restablecerProgreso() {
        perfilesDificultad = crearPerfilesVacios();
        nivelesCompletadosDificultad = { facil: [], normal: [], dificil: [] };
        logrosDificultad = [];
        logroTodosLosLogros = false;
        faunaDescubierta = [];
        iniciosHistoriaVistos = [];
        aplicarPerfil(perfilesDificultad[opciones.dificultad]);
        try { localStorage.removeItem(CLAVE_GUARDADO); } catch (error) { /* almacenamiento opcional */ }
        if (estadoAjustes) estadoAjustes.textContent = "Partidas y logros de las tres dificultades borrados. La configuración se conservó.";
    }

    function cambiarDificultad(nuevaDificultad) {
        if (!DIFICULTADES.includes(nuevaDificultad) || nuevaDificultad === opciones.dificultad) return;
        guardarProgreso();
        opciones.dificultad = nuevaDificultad;
        if (!perfilesDificultad[nuevaDificultad]) perfilesDificultad[nuevaDificultad] = nuevoPerfilDificultad();
        aplicarPerfil(perfilesDificultad[nuevaDificultad]);
        guardarCambiosOpciones();
        guardarProgreso();
        if (estadoAjustes) {
            estadoAjustes.textContent = `Perfil ${nuevaDificultad.toUpperCase()}: nivel ${nivelActual}/${TOTAL_NIVELES}, ${vidasPorNivel()} vidas. El progreso se guarda por separado.`;
        }
    }

    function seleccionarOpcionMenu(indice) {
        if (estado !== "inicio") return;
        opcionMenu = indice;

        if (indice === 0) {
            if (!panelConfiguracion) return;
            panelConfiguracion.hidden = false;
            panelConfiguracion.open = true;
            if (typeof panelConfiguracion.scrollIntoView === "function") {
                panelConfiguracion.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            panelConfiguracion.querySelector("summary")?.focus();
        } else if (indice === 1) {
            if (panelConfiguracion) {
                panelConfiguracion.open = false;
                panelConfiguracion.hidden = true;
            }
            estado = "mapa";
            if (canvas && typeof canvas.focus === "function") canvas.focus();
        } else if (indice === 2) {
            if (panelConfiguracion) {
                panelConfiguracion.open = false;
                panelConfiguracion.hidden = true;
            }
            irANivel(nivelActual);
            if (canvas && typeof canvas.focus === "function") canvas.focus();
        } else if (indice === 3) {
            if (panelConfiguracion) {
                panelConfiguracion.open = false;
                panelConfiguracion.hidden = true;
            }
            estado = "logros";
            if (canvas && typeof canvas.focus === "function") canvas.focus();
        } else if (indice === 4) {
            if (panelConfiguracion) {
                panelConfiguracion.open = false;
                panelConfiguracion.hidden = true;
            }
            filaPersonaje = 0;
            estado = "personaje";
            if (canvas && typeof canvas.focus === "function") canvas.focus();
        } else if (indice === 5) {
            if (panelConfiguracion) {
                panelConfiguracion.open = false;
                panelConfiguracion.hidden = true;
            }
            iniciarTutorial();
            if (canvas && typeof canvas.focus === "function") canvas.focus();
        } else if (indice === 6) {
            if (panelConfiguracion) { panelConfiguracion.open = false; panelConfiguracion.hidden = true; }
            ecosistemaAlbum = Math.min(9, Math.floor((nivelActual - 1) / 5));
            vistaBitacora = "album";
            paginaAlbum = 0;
            estado = "bitacora";
            if (canvas && typeof canvas.focus === "function") canvas.focus();
        }
    }

    function volverAlMenuPrincipal() {
        if (enTutorial) restaurarTrasTutorial();
        estado = "inicio";
        pausado = false;
        confirmarReinicio = false;
        ventanaLogro = null;
        for (const tecla in teclas) teclas[tecla] = false;
        if (panelConfiguracion) {
            panelConfiguracion.open = false;
            panelConfiguracion.hidden = true;
        }
    }

    function etiquetaTecla(tecla) {
        const etiquetas = {
            " ": "espacio",
            arrowleft: "←",
            arrowright: "→",
            arrowup: "↑",
            arrowdown: "↓",
            escape: "Esc"
        };
        return etiquetas[tecla] || tecla.toUpperCase();
    }

    function actualizarAjustesUI() {
        if (botonSonido) {
            const apagado = silencio || volumenSonido <= 0;
            botonSonido.textContent = apagado ? "Sonido: apagado" : "Sonido: activado";
            botonSonido.setAttribute("aria-pressed", String(apagado));
        }
        if (controlVolumen) controlVolumen.value = String(opciones.volumen);
        if (selectorDificultad) selectorDificultad.value = opciones.dificultad;
        if (controlVelocidad) controlVelocidad.value = String(opciones.velocidad);
        if (salidaVelocidad) salidaVelocidad.value = `${opciones.velocidad}%`;
        if (controlReducirMovimiento) controlReducirMovimiento.checked = opciones.reducirMovimiento;
        if (controlAltoContraste) controlAltoContraste.checked = opciones.altoContraste;

        document.body.classList.toggle("alto-contraste", opciones.altoContraste);

        for (const boton of document.querySelectorAll("[data-reasignar]")) {
            const accion = boton.dataset.reasignar;
            const nombre = boton.dataset.nombre || boton.textContent.split(":")[0];
            boton.dataset.nombre = nombre;
            boton.textContent = `${nombre}: ${accionPendiente === accion ? "pulsa una tecla…" : etiquetaTecla(opciones.bindings[accion])}`;
            boton.setAttribute("aria-pressed", String(accionPendiente === accion));
        }
    }

    function guardarCambiosOpciones() {
        opciones = CORE.normalizeSettings(opciones, preferenciasSistemaReduceMovimiento);
        silencio = opciones.silencio;
        volumenSonido = opciones.volumen / 100;
        guardarOpciones();
        actualizarAjustesUI();
        sincronizarMusica();
    }

    if (botonBorrarProgreso) {
        botonBorrarProgreso.addEventListener("click", () => {
            if (window.confirm("¿Borrar niveles, estrellas, puntuación y logros de las tres dificultades? Esta acción no se puede deshacer.")) {
                restablecerProgreso();
            }
        });
    }

    if (botonSonido) {
        botonSonido.addEventListener("click", () => {
            opciones.silencio = !opciones.silencio;
            guardarCambiosOpciones();
        });
    }

    if (controlVolumen) {
        controlVolumen.addEventListener("input", () => {
            opciones.volumen = Number(controlVolumen.value);
            guardarCambiosOpciones();
        });
    }

    if (selectorDificultad) {
        selectorDificultad.addEventListener("change", () => {
            cambiarDificultad(selectorDificultad.value);
        });
    }

    if (controlVelocidad) {
        controlVelocidad.addEventListener("input", () => {
            opciones.velocidad = Number(controlVelocidad.value);
            guardarCambiosOpciones();
        });
    }

    if (controlReducirMovimiento) {
        controlReducirMovimiento.addEventListener("change", () => {
            opciones.reducirMovimiento = controlReducirMovimiento.checked;
            guardarCambiosOpciones();
        });
    }

    if (controlAltoContraste) {
        controlAltoContraste.addEventListener("change", () => {
            opciones.altoContraste = controlAltoContraste.checked;
            guardarCambiosOpciones();
        });
    }

    for (const boton of document.querySelectorAll("[data-reasignar]")) {
        boton.addEventListener("click", () => {
            accionPendiente = boton.dataset.reasignar;
            if (estadoAjustes) estadoAjustes.textContent = `Pulsa la tecla nueva para ${accionPendiente}.`;
            actualizarAjustesUI();
        });
    }

    actualizarAjustesUI();

    window.addEventListener("keydown", (e) => {
        const tecla = e.key.toLowerCase();
        if (accionPendiente) {
            const nuevaTecla = CORE.normalizeKey(tecla);
            if (nuevaTecla) {
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
