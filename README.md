# Aventura Pixel

Juego de plataformas para navegador, hecho con HTML, CSS y JavaScript. Incluye controles táctiles y se puede instalar como PWA.

## Publicar en GitHub Pages

El flujo de GitHub Actions de este repositorio publica el juego al enviar cambios a la rama `main`. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como origen de publicación. La URL aparecerá en esa misma sección cuando termine la primera publicación.

El sitio requiere HTTPS para instalarse desde el navegador. GitHub Pages sirve el sitio con HTTPS.

## Ejecutar localmente

Abre el proyecto desde un servidor local, por ejemplo con Python:

```powershell
python -m http.server 8000
```

Después visita `http://localhost:8000`. El modo sin conexión se activa después de cargar el sitio una vez.
