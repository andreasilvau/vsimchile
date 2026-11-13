// Utilidades compartidas por las funciones del panel docente (Vercel ignora los archivos que parten con "_").
import { neon } from '@neondatabase/serverless';

let _sql = null;
export function sql(strings, ...valores) {
  if (!_sql) _sql = neon(process.env.DATABASE_URL);
  return _sql(strings, ...valores);
}

export const AUTH = () => (process.env.NEON_AUTH_BASE_URL || '').replace(/\/$/, '');
const COOKIE = 'vsim_sesion';
const COOKIE_NEON = '__Secure-neon-auth.session_token';

export function leerCookie(req) {
  const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)'));
  return m ? m[1] : null;
}
export function ponerCookie(res, valor) {
  const base = `${COOKIE}=${valor || ''}; Path=/; HttpOnly; Secure; SameSite=Lax`;
  res.setHeader('Set-Cookie', valor ? `${base}; Max-Age=604800` : `${base}; Max-Age=0`);
}
// Extrae el valor de la cookie de sesión que entrega Neon Auth en una respuesta.
export function cookieDeNeon(r) {
  const lista = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [r.headers.get('set-cookie') || ''];
  for (const c of lista) { const m = c.match(/neon-auth\.session_token=([^;]+)/); if (m) return m[1]; }
  return null;
}
export function llamarAuth(ruta, { cuerpo, sesion, metodo } = {}) {
  const headers = { origin: 'http://localhost:3000' };
  if (cuerpo) headers['content-type'] = 'application/json';
  if (sesion) headers.cookie = `${COOKIE_NEON}=${sesion}`;
  return fetch(AUTH() + ruta, { method: metodo || (cuerpo ? 'POST' : 'GET'), headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
}

// Usuario de la sesión actual, con su rol; null si no hay sesión válida.
export async function usuario(req) {
  const sesion = leerCookie(req);
  if (!sesion) return null;
  try {
    const r = await llamarAuth('/get-session', { sesion });
    if (!r.ok) return null;
    const j = await r.json();
    if (!j || !j.user) return null;
    const [p] = await sql`select rol, nombre from perfiles where user_id = ${j.user.id}`;
    return { id: j.user.id, email: j.user.email, nombre: (p && p.nombre) || j.user.name || '', rol: (p && p.rol) || 'estudiante' };
  } catch (e) { return null; }
}
export async function docente(req, res) {
  const u = await usuario(req);
  if (!u) { res.status(401).json({ error: 'Inicia sesión para continuar.' }); return null; }
  if (u.rol !== 'docente') { res.status(403).json({ error: 'Tu cuenta no tiene permiso de docente.' }); return null; }
  return u;
}

// Las operaciones que cambian datos solo se aceptan desde la misma página (protección CSRF).
export function mismoOrigen(req, res) {
  const o = req.headers.origin;
  if (o) { let h = ''; try { h = new URL(o).host; } catch (e) {} if (h !== req.headers.host) { res.status(403).json({ error: 'Origen no permitido.' }); return false; } }
  if (!/application\/json/.test(req.headers['content-type'] || '')) { res.status(415).json({ error: 'Formato no admitido.' }); return false; }
  return true;
}
export const esUUID = s => typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export const configurado = res => { if (process.env.DATABASE_URL && process.env.NEON_AUTH_BASE_URL) return true; res.status(503).json({ error: 'El panel docente aún no está configurado en el servidor.' }); return false; };
