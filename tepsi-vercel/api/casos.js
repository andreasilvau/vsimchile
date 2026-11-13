// Casos del simulador guardados en la base: ediciones de los casos originales y casos nuevos (variantes).
import { sql, usuario, docente, mismoOrigen, esUUID, configurado } from './_lib.js';

const MODULOS = ['tepsi', 'rn'];
function validar(b, res) {
  const modulo = String(b.modulo || ''), base = String(b.base || ''), estado = b.estado === 'publicado' ? 'publicado' : 'borrador';
  const titulo = String(b.titulo || '').trim().slice(0, 120);
  const datos = b.datos && typeof b.datos === 'object' && !Array.isArray(b.datos) ? b.datos : null;
  const medios = Array.isArray(b.medios) ? b.medios.slice(0, 30).filter(m => m && esUUID(m.id)).map((m, i) => ({ id: m.id, leyenda: String(m.leyenda || '').trim().slice(0, 300), orden: i })) : [];
  if (!MODULOS.includes(modulo) || !/^[A-Za-z0-9]{1,8}$/.test(base) || !datos || JSON.stringify(datos).length > 60000) { res.status(400).json({ error: 'Datos del caso inválidos.' }); return null; }
  if (!b.es_base && !titulo) { res.status(400).json({ error: 'Ponle un título al caso.' }); return null; }
  return { modulo, base, estado, titulo, datos, medios, es_base: !!b.es_base };
}
async function guardarMedios(id, medios) {
  await sql`delete from caso_medios where caso_id = ${id}`;
  for (const m of medios) await sql`insert into caso_medios (caso_id, medio_id, orden, leyenda) select ${id}, id, ${m.orden}, ${m.leyenda} from medios where id = ${m.id} on conflict do nothing`;
}

export default async function handler(req, res) {
  if (!configurado(res)) return;
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      let todos = false;
      if (req.query && req.query.todos) { const u = await usuario(req); todos = !!u && u.rol === 'docente'; }
      const filas = await sql`
        select c.id, c.modulo, c.base, c.es_base, c.titulo, c.estado, c.datos, c.actualizado,
          coalesce((select json_agg(json_build_object('id', m.id, 'leyenda', cm.leyenda, 'alt', m.alt, 'nombre', m.nombre) order by cm.orden)
                    from caso_medios cm join medios m on m.id = cm.medio_id where cm.caso_id = c.id), '[]'::json) as medios
        from casos c where (${todos} or c.estado = 'publicado') order by c.modulo, c.base, c.es_base desc, c.creado`;
      return res.status(200).json({ casos: filas });
    }
    if (!mismoOrigen(req, res)) return;
    const u = await docente(req, res);
    if (!u) return;
    const id = req.query && req.query.id;

    if (req.method === 'POST') {
      const v = validar(req.body || {}, res);
      if (!v) return;
      let fila;
      if (v.es_base) {
        [fila] = await sql`insert into casos (modulo, base, es_base, titulo, estado, datos, creado_por) values (${v.modulo}, ${v.base}, true, ${v.titulo}, ${v.estado}, ${JSON.stringify(v.datos)}::jsonb, ${u.id})
          on conflict (modulo, base) where es_base do update set titulo = excluded.titulo, estado = excluded.estado, datos = excluded.datos, actualizado = now() returning id`;
      } else {
        [fila] = await sql`insert into casos (modulo, base, es_base, titulo, estado, datos, creado_por) values (${v.modulo}, ${v.base}, false, ${v.titulo}, ${v.estado}, ${JSON.stringify(v.datos)}::jsonb, ${u.id}) returning id`;
      }
      await guardarMedios(fila.id, v.medios);
      return res.status(200).json({ id: fila.id });
    }
    if (!esUUID(id)) return res.status(400).json({ error: 'Falta el identificador del caso.' });
    if (req.method === 'PUT') {
      const v = validar(req.body || {}, res);
      if (!v) return;
      const [fila] = await sql`update casos set titulo = ${v.titulo}, estado = ${v.estado}, datos = ${JSON.stringify(v.datos)}::jsonb, actualizado = now() where id = ${id} returning id`;
      if (!fila) return res.status(404).json({ error: 'El caso ya no existe.' });
      await guardarMedios(id, v.medios);
      return res.status(200).json({ id });
    }
    if (req.method === 'DELETE') {
      await sql`delete from casos where id = ${id}`;
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Error interno' });
  }
}
