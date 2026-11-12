// Biblioteca de imágenes de los casos. Las imágenes se guardan en la base (comprimidas por el navegador antes de subir).
import { sql, docente, mismoOrigen, esUUID, configurado } from './_lib.js';

const TIPOS = ['image/webp', 'image/jpeg', 'image/png'];
const MAX = 3 * 1024 * 1024;

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
    if (req.method === 'GET') {
      if (!await docente(req, res)) return;
      const filas = await sql`select m.id, m.nombre, m.alt, m.tipo, m.tamano, m.creado, (select count(*)::int from caso_medios cm where cm.medio_id = m.id) as usos from medios m order by m.creado desc`;
      return res.status(200).json({ medios: filas });
    }
    if (!mismoOrigen(req, res)) return;
    const u = await docente(req, res);
    if (!u) return;
    const b = req.body || {};
    const nombre = String(b.nombre || '').trim().slice(0, 150), alt = String(b.alt || '').trim().slice(0, 300);

    if (req.method === 'POST') {
      const b64 = String(b.base64 || '');
      if (!nombre || !TIPOS.includes(b.tipo) || !/^[A-Za-z0-9+/]+=*$/.test(b64)) return res.status(400).json({ error: 'Imagen inválida. Usa JPG, PNG o WebP.' });
      const tamano = Math.floor(b64.length * 3 / 4);
      if (tamano > MAX) return res.status(413).json({ error: 'La imagen pesa más de 3 MB.' });
      const [fila] = await sql`insert into medios (nombre, alt, tipo, tamano, contenido, creado_por) values (${nombre}, ${alt}, ${b.tipo}, ${tamano}, decode(${b64}, 'base64'), ${u.id}) returning id`;
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
