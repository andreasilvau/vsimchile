// Sesión del panel docente: entrar, crear cuenta de docente (con código de invitación) y salir.
import { timingSafeEqual } from 'node:crypto';
import { sql, usuario, docente, llamarAuth, cookieDeNeon, ponerCookie, leerCookie, mismoOrigen, configurado } from './_lib.js';

const texto = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
function codigoValido(c) {
  const real = process.env.CODIGO_DOCENTE || '';
  if (!real || !c) return false;
  const a = Buffer.from(String(c)), b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  if (!configurado(res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      if (req.query && req.query.lista) {
        if (!await docente(req, res)) return;
        const filas = await sql`select nombre, email, rol, creado from perfiles order by creado`;
        return res.status(200).json({ docentes: filas });
      }
      return res.status(200).json({ usuario: await usuario(req) });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    if (!mismoOrigen(req, res)) return;
    const b = req.body || {};

    if (b.accion === 'salir') {
      const sesion = leerCookie(req);
      if (sesion) { try { await llamarAuth('/sign-out', { sesion, metodo: 'POST', cuerpo: {} }); } catch (e) {} }
      ponerCookie(res, null);
      return res.status(200).json({ ok: true });
    }

    const email = texto(b.email, 200).toLowerCase(), password = String(b.password || '');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || password.length < 8 || password.length > 128)
      return res.status(400).json({ error: 'Revisa el correo y la contraseña (mínimo 8 caracteres).' });

    if (b.accion === 'entrar') {
      const r = await llamarAuth('/sign-in/email', { cuerpo: { email, password } });
      const sesion = r.ok ? cookieDeNeon(r) : null;
      if (!sesion) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
      ponerCookie(res, sesion);
      const j = await r.json();
      const [p] = await sql`select rol, nombre from perfiles where user_id = ${j.user.id}`;
      return res.status(200).json({ usuario: { id: j.user.id, email: j.user.email, nombre: (p && p.nombre) || j.user.name || '', rol: (p && p.rol) || 'estudiante' } });
    }

    if (b.accion === 'registro') {
      const nombre = texto(b.nombre, 120);
      if (!nombre) return res.status(400).json({ error: 'Escribe tu nombre.' });
      if (!codigoValido(b.codigo)) return res.status(403).json({ error: 'El código de invitación no es correcto.' });
      const r = await llamarAuth('/sign-up/email', { cuerpo: { name: nombre, email, password } });
      const sesion = r.ok ? cookieDeNeon(r) : null;
      if (!sesion) return res.status(409).json({ error: 'No se pudo crear la cuenta. Si ya tienes una con ese correo, entra con tu contraseña.' });
      const j = await r.json();
      await sql`insert into perfiles (user_id, email, nombre, rol) values (${j.user.id}, ${email}, ${nombre}, 'docente')
                on conflict (user_id) do update set rol = 'docente', nombre = excluded.nombre`;
      ponerCookie(res, sesion);
      return res.status(200).json({ usuario: { id: j.user.id, email, nombre, rol: 'docente' } });
    }
    return res.status(400).json({ error: 'Solicitud inválida' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno' });
  }
}
