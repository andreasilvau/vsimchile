// Biblioteca de imágenes de los casos. Las imágenes se guardan en la base (comprimidas por el navegador antes de subir).
import { sql, docente, mismoOrigen, esUUID, configurado } from './_lib.js';

const TIPOS = ['image/webp', 'image/jpeg', 'image/png'];
const MAX = 3 * 1024 * 1024;
const MODULOS = ['tepsi', 'rn', 'exfis'];
const ZONA = /^[a-z_]{1,24}$/;

export default async function handler(req, res) {
  if (!configurado(res)) return;
  try {
    const id = req.query && req.query.id;
    if (req.method === 'GET' && id) {
      if (!esUUID(id)) return res.status(400).end();
      const [m] = await sql`select tipo, encode(contenido, 'base64') as b64 from medios where id = ${id}`;
      if (!m) return res.status(404).end();
      res.setHeader('Content-Type', m.tipo);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.status(200).send(Buffer.from(m.b64, 'base64'));
    }
    res.setHeader('Cache-Control', 'no-store');
    // Imágenes del examen físico por zona (públicas: las ve el estudiante al revisar cada zona).
    if (req.method === 'GET' && req.query && req.query.exfis) {
      const filas = await sql`select id, zona, medio_id, titulo, es_normal from exfis_imagenes order by zona, orden, creado`;
      return res.status(200).json({ imagenes: filas });
    }
    if (req.method === 'GET') {
      if (!await docente(req, res)) return;
      const filas = await sql`select m.id, m.nombre, m.alt, m.tipo, m.tamano, m.modulo, m.creado, (select count(*)::int from caso_medios cm where cm.medio_id = m.id) as usos from medios m order by m.creado desc`;
      return res.status(200).json({ medios: filas });
    }
    if (!mismoOrigen(req, res)) return;
    const u = await docente(req, res);
    if (!u) return;
    const b = req.body || {};
    const nombre = String(b.nombre || '').trim().slice(0, 150), alt = String(b.alt || '').trim().slice(0, 300);

    // Examen físico: vincular una imagen ya subida a una zona, editarla o quitarla.
    if (req.method === 'POST' && b.accion === 'exfis_agregar') {
      if (!ZONA.test(String(b.zona || '')) || !esUUID(b.medio_id)) return res.status(400).json({ error: 'Datos de la imagen inválidos.' });
      const [fila] = await sql`insert into exfis_imagenes (zona, medio_id, titulo, es_normal, orden)
        select ${b.zona}, id, ${String(b.titulo || '').trim().slice(0, 200)}, ${b.es_normal !== false}, (select count(*) from exfis_imagenes where zona = ${b.zona}) from medios where id = ${b.medio_id} returning id`;
      if (!fila) return res.status(404).json({ error: 'La imagen ya no existe.' });
      return res.status(200).json({ id: fila.id });
    }
    if (req.method === 'POST' && b.accion === 'exfis_editar') {
      if (!esUUID(b.id)) return res.status(400).json({ error: 'Falta el identificador.' });
      await sql`update exfis_imagenes set titulo = ${String(b.titulo || '').trim().slice(0, 200)}, es_normal = ${b.es_normal !== false} where id = ${b.id}`;
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'POST' && b.accion === 'exfis_quitar') {
      if (!esUUID(b.id)) return res.status(400).json({ error: 'Falta el identificador.' });
      // La imagen se subió solo para esta zona: se borra también el archivo.
      await sql`delete from medios where id in (select medio_id from exfis_imagenes where id = ${b.id})`;
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'POST') {
      const b64 = String(b.base64 || '');
      if (!nombre || !TIPOS.includes(b.tipo) || !/^[A-Za-z0-9+/]+=*$/.test(b64)) return res.status(400).json({ error: 'Imagen inválida. Usa JPG, PNG o WebP.' });
      const tamano = Math.floor(b64.length * 3 / 4);
      if (tamano > MAX) return res.status(413).json({ error: 'La imagen pesa más de 3 MB.' });
      const [fila] = await sql`insert into medios (nombre, alt, tipo, tamano, contenido, modulo, creado_por) values (${nombre}, ${alt}, ${b.tipo}, ${tamano}, decode(${b64}, 'base64'), ${MODULOS.includes(b.modulo) ? b.modulo : null}, ${u.id}) returning id`;
      return res.status(200).json({ id: fila.id });
    }
    if (!esUUID(id)) return res.status(400).json({ error: 'Falta el identificador de la imagen.' });
    if (req.method === 'PUT') {
      if (!nombre) return res.status(400).json({ error: 'La imagen necesita un nombre.' });
      await sql`update medios set nombre = ${nombre}, alt = ${alt} where id = ${id}`;
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      await sql`delete from medios where id = ${id}`;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno' });
  }
}
