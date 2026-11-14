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
- Los hechos de respaldo de cada caso original están en `api/mama.js`; lo que edites en el panel docente se lee de la base y tiene prioridad.

## Panel docente (Vercel + Neon)

El botón **Docente** de la barra superior abre el panel. Está ordenado como la portada del estudiante: una entrada por evaluación, más el aula.

- **TEPSI** y **Reflejos**: cada evaluación tiene sus pestañas **Casos** (editar los originales y crear casos nuevos a partir de uno existente; quedan como borrador hasta publicarlos) e **Imágenes** (biblioteca propia de esa evaluación; se adjuntan a los casos y el estudiante las ve con el botón **Documentos**).
- **Examen físico**: imágenes clínicas por zona, con su descripción y la respuesta correcta (hallazgo normal o signo de alerta). Se guardan en la base, así que las ven todos los estudiantes.
- **Secciones**: una por grupo de estudiantes. Dentro de cada sección están **Resultados** (matriz, detalle por intento y exportación a CSV), **Casos asignados**, **Estudiantes** y **Ajustes** (nombre, cerrar el ingreso, eliminar).
- **Menú de cuenta** (abajo en la barra lateral): docentes con acceso y cerrar sesión.

### Recuperar contraseña

En la ventana de ingreso docente, **¿Olvidaste tu contraseña?** envía un correo con un enlace (lo manda Neon Auth, remitente `auth@mail.myneon.app`). El enlace vuelve al simulador y permite crear una contraseña nueva; sirve una sola vez. El dominio del sitio debe estar en los dominios de confianza de Neon Auth (ya está `https://vsimchile.vercel.app`; si cambias de dominio, agrégalo en console.neon.tech → Auth).

### Estudiantes

El botón **Mi sección** pide el código de la sección, nombre y correo (sin contraseña). Desde ahí el estudiante ve los casos asignados y los abre. El resultado se envía cuando presiona **Revisar** en el caso (formulario y conducta en TEPSI, examen en recién nacido). Puede repetir un caso: cada vez queda como un intento nuevo. Lo que haga fuera de lo asignado queda como práctica libre.

Como no hay contraseña, alguien podría entrar con el nombre de otra persona: sirve para uso formativo, no para evaluaciones con nota. Los puntajes indican cuántos elementos coinciden con lo esperado; no son una calificación.

### Archivos

- `api/auth.js`, `api/casos.js`, `api/medios.js`, `api/aula.js`, `api/_lib.js`: funciones del panel (`aula.js`: secciones, asignaciones e intentos).
- `js/vsim-nube.js`, `js/vsim-aula.js`, `css/vsim-nube.css`: el panel y la vista del estudiante. Si faltan las variables de entorno, el simulador funciona igual que antes y el botón Docente no aparece.
- `api/mama.js`: si un caso fue editado o creado en el panel, la madre responde con los hechos guardados en la base.

### Variables de entorno en Vercel

| Variable | Valor |
|---|---|
| `DATABASE_URL` | Cadena de conexión del proyecto Neon `vsimchile` (console.neon.tech → Connect, con *pooling*). |
| `NEON_AUTH_BASE_URL` | URL de Neon Auth del proyecto (console.neon.tech → Auth). |
| `CODIGO_DOCENTE` | Código de invitación que tú eliges. Quien lo tenga puede crear una cuenta de docente. |
| `ANTHROPIC_API_KEY` | Ya existente, para la conversación con la madre. |

Después de agregarlas hay que volver a publicar (Redeploy).

### Base de datos

Tablas en Neon: `perfiles` (rol de cada cuenta), `casos` (ediciones y casos nuevos, con sus datos en JSON), `medios` (imágenes, con la evaluación a la que pertenecen), `caso_medios` (qué imagen va en qué caso) y `exfis_imagenes` (imágenes del examen físico por zona). Para el aula: `secciones`, `asignaciones`, `estudiantes`, `estudiante_tokens` (ingreso recordado en cada equipo) e `intentos` (resultados, con el detalle en JSON). Las cuentas y contraseñas las administra Neon Auth.

### Cuidados

- Cambia `CODIGO_DOCENTE` si se filtra; las cuentas ya creadas siguen funcionando.
- Las imágenes se sirven por un enlace difícil de adivinar pero sin contraseña: no subas imágenes de pacientes reales sin anonimizar.
- Las imágenes viven dentro de la base (plan gratuito de Neon: 0,5 GB). Para video o modelos 3D conviene pasar a Vercel Blob.

