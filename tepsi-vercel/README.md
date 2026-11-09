# Evaluación Psicomotora TEPSI 3D — versión para Vercel

Esta carpeta publica el simulador como sitio propio. La diferencia con el artefacto de Claude es que la **conversación libre con la madre** usa tu propia clave de la API de Claude, así que cualquier estudiante puede usarla sin cuenta de Claude.

## Contenido

- `index.html`: el simulador completo (niños 3D, 52 ítems, formulario, perfil y conducta).
- `api/mama.js`: función que responde como la madre del caso. Los hechos de cada caso viven en el servidor, así que la página no puede pedirle a la API cualquier otra cosa.
- `package.json`: configuración mínima.

## Publicar

1. Sube esta carpeta a un repositorio de GitHub (o arrástrala en vercel.com → Add New → Project).
2. En Vercel, en **Settings → Environment Variables**, agrega:
   - `ANTHROPIC_API_KEY`: tu clave de la API de Claude (console.anthropic.com).
   - `ANTHROPIC_MODEL` (opcional): modelo a usar; por defecto `claude-haiku-5-5`, rápido y económico para respuestas cortas.
3. Publica (Deploy). La página queda en `https://tu-proyecto.vercel.app`.

## Costos y cuidados

- Cada pregunta libre es una llamada corta a la API (unas pocas centésimas de dólar con Haiku). Las preguntas sugeridas no usan la API.
- Si quieres limitar el uso, activa la protección por contraseña de Vercel o restringe el acceso a la red institucional.
- Si cambias los hechos de un caso en el simulador, cámbialos también en `api/mama.js`.
