// Secciones, asignaciones y resultados.
// Estudiantes: entran con el código de su sección, nombre y correo (sin contraseña) y envían sus intentos.
// Docentes: crean secciones, asignan casos y revisan resultados.
import { randomBytes, createHash } from 'node:crypto';
import { sql, docente, mismoOrigen, esUUID, configurado } from './_lib.js';

const COOKIE = 'vsim_est';
const MODULOS = ['tepsi', 'rn'];
const txt = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const hash = t => createHash('sha256').update(t).digest('hex');
const fecha = v => { if (!v) return null; const d = new Date(v); return isNaN(d) ? null : d.toISOString(); };
function nuevoCodigo() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return [...randomBytes(6)].map(b => A[b % A.length]).join(''); }
function tokenDe(req) { const m = (req.headers.cookie || '').match(new RegExp('(?:^|;\\s*)' + COOKIE + '=([a-f0-9]{64})')); return m ? m[1] : null; }
const ponerCookie = (res, v) => res.setHeader('Set-Cookie', `${COOKIE}=${v || ''}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${v ? 15552000 : 0}`);

async function estudiante(req) {
  const t = tokenDe(req); if (!t) return null;
  const [e] = await sql`select e.id, e.nombre, e.email, s.id as seccion_id, s.nombre as seccion, s.activa from estudiante_tokens k join estudiantes e on e.id = k.estudiante_id join secciones s on s.id = e.seccion_id where k.hash = ${hash(t)}`;
  return e || null;
}
async function vistaEstudiante(e) {
  const asignaciones = await sql`
    select a.id, a.modulo, a.base, a.caso_id, a.abre, a.cierra, coalesce(c.titulo, '') as titulo,
      (select count(*)::int from intentos i where i.estudiante_id = ${e.id} and i.modulo = a.modulo and i.base = a.base and i.caso_id is not distinct from a.caso_id) as intentos
    from asignaciones a left join casos c on c.id = a.caso_id
    where a.seccion_id = ${e.seccion_id} and (a.caso_id is null or c.estado = 'publicado') order by a.creado`;
  return { estudiante: { nombre: e.nombre, email: e.email, seccion: e.seccion }, asignaciones };
}

export default async function handler(req, res) {
  if (!configurado(res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    const q = req.query || {};
    if (req.method === 'GET') {
      if (q.secciones) {
        if (!await docente(req, res)) return;
        const secciones = await sql`
          select s.id, s.nombre, s.codigo, s.activa, s.creado,
            (select count(*)::int from estudiantes e where e.seccion_id = s.id) as estudiantes,
            (select count(*)::int from intentos i join estudiantes e on e.id = i.estudiante_id where e.seccion_id = s.id) as intentos,
            coalesce((select json_agg(json_build_object('id', a.id, 'modulo', a.modulo, 'base', a.base, 'caso_id', a.caso_id, 'abre', a.abre, 'cierra', a.cierra) order by a.creado) from asignaciones a where a.seccion_id = s.id), '[]'::json) as asignaciones
          from secciones s order by s.creado desc`;
        return res.status(200).json({ secciones });
      }
      if (q.resultados) {
        if (!await docente(req, res)) return;
        if (!esUUID(q.resultados)) return res.status(400).json({ error: 'Sección inválida.' });
        const estudiantes = await sql`select id, nombre, email, creado from estudiantes where seccion_id = ${q.resultados} order by nombre`;
        const intentos = await sql`select i.id, i.estudiante_id, i.modulo, i.base, i.caso_id, i.caso_titulo, i.segundos, i.detalle, i.creado, i.enviado from intentos i join estudiantes e on e.id = i.estudiante_id where e.seccion_id = ${q.resultados} order by i.creado`;
        const asignaciones = await sql`select id, modulo, base, caso_id, abre, cierra from asignaciones where seccion_id = ${q.resultados} order by creado`;
        return res.status(200).json({ estudiantes, intentos, asignaciones });
      }
      const e = await estudiante(req);
      return res.status(200).json(e ? await vistaEstudiante(e) : { estudiante: null });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
    if (!mismoOrigen(req, res)) return;
    const b = req.body || {};

    /* ---------- Estudiantes ---------- */
    if (b.accion === 'unirse') {
      const codigo = txt(b.codigo, 12).toUpperCase().replace(/[^A-Z0-9]/g, ''), nombre = txt(b.nombre, 120), email = txt(b.email, 200).toLowerCase();
      if (!codigo || nombre.length < 3 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Completa el código, tu nombre y un correo válido.' });
      const [s] = await sql`select id from secciones where codigo = ${codigo} and activa`;
      if (!s) return res.status(404).json({ error: 'No hay una sección activa con ese código. Revísalo con tu docente.' });
      const [e] = await sql`insert into estudiantes (seccion_id, nombre, email) values (${s.id}, ${nombre}, ${email}) on conflict (seccion_id, email) do update set nombre = excluded.nombre returning id`;
      const t = randomBytes(32).toString('hex');
      await sql`insert into estudiante_tokens (hash, estudiante_id) values (${hash(t)}, ${e.id})`;
      ponerCookie(res, t);
      const [fila] = await sql`select e.id, e.nombre, e.email, s.id as seccion_id, s.nombre as seccion from estudiantes e join secciones s on s.id = e.seccion_id where e.id = ${e.id}`;
      return res.status(200).json(await vistaEstudiante(fila));
    }
    if (b.accion === 'salir_est') {
      const t = tokenDe(req); if (t) await sql`delete from estudiante_tokens where hash = ${hash(t)}`;
      ponerCookie(res, null);
      return res.status(200).json({ ok: true });
    }
    if (b.accion === 'intento') {
      const e = await estudiante(req);
      if (!e) return res.status(401).json({ error: 'Vuelve a ingresar el código de tu sección.' });
      const detalle = b.detalle && typeof b.detalle === 'object' && !Array.isArray(b.detalle) ? b.detalle : null;
      if (!esUUID(b.clave) || !MODULOS.includes(b.modulo) || !/^[A-Za-z0-9]{1,8}$/.test(String(b.base || '')) || !detalle || JSON.stringify(detalle).length > 40000) return res.status(400).json({ error: 'Intento inválido.' });
      const casoId = esUUID(b.caso_id) ? b.caso_id : null, seg = Math.max(0, Math.min(86400, Math.round(+b.segundos || 0)));
      await sql`insert into intentos (estudiante_id, clave, modulo, base, caso_id, caso_titulo, segundos, detalle)
        values (${e.id}, ${b.clave}, ${b.modulo}, ${b.base}, (select id from casos where id = ${casoId}), ${txt(b.caso_titulo, 120)}, ${seg}, ${JSON.stringify(detalle)}::jsonb)
        on conflict (estudiante_id, clave) do update set segundos = excluded.segundos, detalle = intentos.detalle || excluded.detalle, enviado = now()`;
      return res.status(200).json({ ok: true });
    }

    /* ---------- Docentes ---------- */
    const u = await docente(req, res);
    if (!u) return;
    if (b.accion === 'seccion') {
      const nombre = txt(b.nombre, 120);
      if (!nombre) return res.status(400).json({ error: 'Ponle un nombre a la sección.' });
      for (let i = 0; i < 5; i++) {
        const [s] = await sql`insert into secciones (nombre, codigo, creado_por) values (${nombre}, ${nuevoCodigo()}, ${u.id}) on conflict (codigo) do nothing returning id, codigo`;
        if (s) return res.status(200).json(s);
      }
      return res.status(500).json({ error: 'No se pudo generar el código. Inténtalo de nuevo.' });
    }
    if (!esUUID(b.id) && b.accion !== 'asignar') return res.status(400).json({ error: 'Falta el identificador.' });
    if (b.accion === 'seccion_editar') {
      const nombre = txt(b.nombre, 120);
      if (!nombre) return res.status(400).json({ error: 'Ponle un nombre a la sección.' });
      await sql`update secciones set nombre = ${nombre}, activa = ${b.activa !== false} where id = ${b.id}`;
      return res.status(200).json({ ok: true });
    }
    if (b.accion === 'seccion_borrar') { await sql`delete from secciones where id = ${b.id}`; return res.status(200).json({ ok: true }); }
    if (b.accion === 'asignar') {
      const casoId = esUUID(b.caso_id) ? b.caso_id : null;
      if (!esUUID(b.seccion_id) || !MODULOS.includes(b.modulo) || !/^[A-Za-z0-9]{1,8}$/.test(String(b.base || ''))) return res.status(400).json({ error: 'Asignación inválida.' });
      const [ya] = await sql`select id from asignaciones where seccion_id = ${b.seccion_id} and modulo = ${b.modulo} and base = ${b.base} and caso_id is not distinct from ${casoId}`;
      if (ya) return res.status(409).json({ error: 'Ese caso ya está asignado a la sección.' });
      await sql`insert into asignaciones (seccion_id, modulo, base, caso_id, abre, cierra) values (${b.seccion_id}, ${b.modulo}, ${b.base}, ${casoId}, ${fecha(b.abre)}, ${fecha(b.cierra)})`;
      return res.status(200).json({ ok: true });
    }
    if (b.accion === 'desasignar') { await sql`delete from asignaciones where id = ${b.id}`; return res.status(200).json({ ok: true }); }
    return res.status(400).json({ error: 'Solicitud inválida' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno' });
  }
}
