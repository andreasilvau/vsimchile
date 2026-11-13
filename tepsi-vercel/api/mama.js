// Función de Vercel: responde como la madre del caso usando la API de Claude.
// Requiere la variable de entorno ANTHROPIC_API_KEY (y opcionalmente ANTHROPIC_MODEL).
import { sql, esUUID } from './_lib.js';

const CASOS = {
  "A": {
    "nino": "Tomás",
    "edad": "3 años 5 meses",
    "mama": "Carolina",
    "tono": "tranquila y cooperadora",
    "hechos": "Hijo: Tomás Ignacio Soto Muñoz, nacido el 14 de mayo de 2023, RUN 25.481.337-6, ficha 4581. Padre: Rodrigo Soto. Madre: Carolina Muñoz, 31 años, técnico en párvulos.\nMotivo: control de salud de los 3 años; no trae preocupaciones.\nEmbarazo controlado, sin complicaciones. Parto vaginal a las 39 semanas, peso 3.420 g, Apgar 9/10, sin hospitalizaciones neonatales.\nLactancia materna exclusiva hasta los 6 meses, luego mixta hasta el año y medio.\nDesarrollo: sostuvo la cabeza a los 3 meses, se sentó a los 6, caminó solo a los 12 meses, primeras palabras al año, frases de dos palabras a los 20 meses. Hoy habla en frases y se le entiende casi todo.\nSalud: resfríos ocasionales, sin otitis a repetición, sin hospitalizaciones. Vacunas al día. EEDP a los 18 meses normal.\nAsiste a jardín infantil JUNJI desde los 2 años; la tía dice que juega bien con otros niños. Vive con ambos padres y una hermana de 7 años. Duerme bien, come de todo. Le gusta la pelota y dibujar."
  },
  "B": {
    "nino": "Martina",
    "edad": "3 años 2 meses",
    "mama": "Paola",
    "tono": "preocupada, algo ansiosa, coopera",
    "hechos": "Hija: Martina Belén Rojas Pérez, nacida el 9 de agosto de 2023, RUN 25.539.208-K, ficha 4632. Padre: Jorge Rojas (trabaja de noche, conductor). Madre: Paola Pérez, 27 años, trabaja en un supermercado.\nMotivo: control de los 3 años; le preocupa que \"habla poco y no se le entiende\", \"dice palabras sueltas y muchas las cambia\". En el jardín le dijeron lo mismo.\nEmbarazo controlado; diabetes gestacional tratada con dieta. Parto por cesárea a las 38 semanas por presentación podálica, peso 3.150 g, Apgar 8/9.\nLactancia materna hasta los 4 meses, luego fórmula.\nDesarrollo: caminó a los 14 meses, primeras palabras a los 18 meses (mamá, papá, agua). Hoy usa palabras sueltas y algunas combinaciones de dos palabras; entiende lo que se le dice y sigue instrucciones simples. Se frustra cuando no la entienden y señala lo que quiere.\nSalud: otitis media aguda a repetición entre el año y los dos años (unos 6 episodios, varios con antibiótico); nunca le han hecho examen de audición. A veces no responde cuando la llaman desde otra pieza; sube el volumen de la tele.\nAsiste a sala cuna/jardín desde los 2 años. Vive con ambos padres y la abuela materna, que la cuida en las tardes. Mucha pantalla (celular y TV, unas 3 horas al día). Juega bien con su prima. Duerme bien.\nEEDP a los 18 meses: no recuerda el resultado; cree que le dijeron que \"estaba un poquito atrasada en el lenguaje\" pero no volvió al control porque cambió de trabajo."
  }
};

// Si el caso fue editado o creado en el panel docente, sus hechos se leen de la base de datos.
async function casoGuardado(caso, variante) {
  if (!process.env.DATABASE_URL) return null;
  try {
    const [fila] = esUUID(variante)
      ? await sql`select base, datos from casos where id = ${variante} and modulo = 'tepsi'`
      : await sql`select base, datos from casos where modulo = 'tepsi' and base = ${String(caso || '')} and es_base and estado = 'publicado'`;
    if (!fila || !fila.datos) return null;
    const d = fila.datos, m = d.mama || {}, o = CASOS[fila.base] || {};
    const c = { nino: d.nombre || o.nino, edad: d.edad || o.edad, mama: m.nombre || o.mama, tono: m.tono || o.tono, hechos: String(m.hechos || o.hechos || '').slice(0, 8000) };
    return c.nino && c.mama && c.hechos ? c : null;
  } catch (e) { console.error(e); return null; }
}

function prompt(c, historial) {
  const guia = `Eres ${c.mama}, madre de ${c.nino} (${c.edad}), en un control de salud en un CESFAM de Chile. Una estudiante de salud te entrevista antes de aplicar el TEPSI.
Responde SOLO como la madre, en español de Chile, en 1 a 3 frases, con tono ${c.tono}. Usa únicamente estos hechos; si te preguntan algo que no está, responde con naturalidad sin inventar datos clínicos importantes ("no sé", "no me acuerdo", "no que yo sepa").
No des diagnósticos ni uses lenguaje técnico. No reveles que eres una simulación.
HECHOS:
${c.hechos}`;
  const turnos = historial.map(m => `${m.quien === 'est' ? 'Estudiante' : c.mama}: ${m.txt}`).join('\n');
  return `${guia}\n\nCONVERSACIÓN HASTA AHORA:\n${turnos}\n\nResponde ahora como ${c.mama} a la última pregunta de la estudiante. Solo el texto de la respuesta.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { caso, variante, historial } = req.body || {};
  const c = (await casoGuardado(caso, variante)) || CASOS[caso];
  if (!c || !Array.isArray(historial) || !historial.length) return res.status(400).json({ error: 'Solicitud inválida' });
  const h = historial.slice(-20).map(m => ({ quien: m.quien === 'est' ? 'est' : 'mama', txt: String(m.txt || '').slice(0, 500) }));
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5', max_tokens: 300, messages: [{ role: 'user', content: prompt(c, h) }] })
    });
    const j = await r.json();
    if (!r.ok) return res.status(502).json({ error: 'El modelo no respondió' });
    const texto = (j.content || []).map(b => b.text || '').join('').trim().replace(/^["“]|["”]$/g, '');
    return res.status(200).json({ texto });
  } catch (e) {
    return res.status(500).json({ error: 'Error interno' });
  }
}
