/* Secciones, asignaciones y resultados (se apoya en js/vsim-nube.js).
   - Estudiantes: botón "Mi sección" para entrar con el código del docente; sus intentos se envían al revisar.
   - Docentes: pestañas "Secciones" y "Resultados" en el panel. */
(() => {
'use strict';
const X = window.VSIM && window.VSIM._; if (!X) return;
const { E, MODS, $, esc, api } = X;
const A = { yo: null, asign: [], llave: {}, clave: {}, t0: {}, enviado: {}, firma: {}, secciones: [], sel: null, res: null };
const uuid = () => crypto.randomUUID ? crypto.randomUUID() : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
const fCorta = v => v ? new Date(v).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
const fHora = v => new Date(v).toLocaleString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const nombreCaso = a => { const v = a.caso_id && X.porId(a.caso_id); return v ? v.titulo : a.titulo || (MODS[a.modulo].doc() ? X.nombreBase(a.modulo, a.base) : a.base); };
function aviso(t) { const el = $('#vaAviso'); el.textContent = t; el.hidden = false; clearTimeout(aviso.t); aviso.t = setTimeout(() => { el.hidden = true; }, 5000); }

/* ================= Estudiante ================= */
function pintarBotonAula() {
  const b = $('#vnAula'); if (!b) return;
  b.hidden = X.esDoc();
  const pend = A.asign.filter(a => !a.intentos).length;
  $('#vnAulaTxt').textContent = A.yo ? (pend ? `Mi sección (${pend})` : 'Mi sección') : 'Mi sección';
}
function pintarAula() {
  const C = $('#vaCuerpo');
  if (!A.yo) {
    C.innerHTML = `<h3 id="vaTit">Entrar a mi sección</h3>
      <p>Escribe el código que te dio tu docente. Verá tu nombre, tu correo y los resultados de los casos que revises.</p>
      <label class="campo"><span>Código de la sección</span><input type="text" name="codigo" autocomplete="off" autocapitalize="characters" maxlength="12" required></label>
      <label class="campo"><span>Nombre y apellido</span><input type="text" name="nombre" autocomplete="name" maxlength="120" minlength="3" required></label>
      <label class="campo"><span>Correo institucional</span><input type="email" name="email" autocomplete="email" required></label>
      <span class="doc-estado" id="vaEstado" role="status"></span>
      <div class="vn-acc"><button type="button" class="btn" data-cerrar>Cancelar</button><button type="submit" class="btn btn-primario">Entrar</button></div>`;
  } else {
    const ahora = Date.now();
    const fila = a => {
      const cerrado = a.cierra && new Date(a.cierra) < ahora, porAbrir = a.abre && new Date(a.abre) > ahora;
      const estado = a.intentos ? `<span class="vn-etq pub">Realizado${a.intentos > 1 ? ' ' + a.intentos + ' veces' : ''}</span>` : cerrado ? '<span class="vn-etq bor">Plazo vencido</span>' : '<span class="vn-etq bor">Pendiente</span>';
      return `<li><div><strong>${esc(nombreCaso(a))}</strong><small>${MODS[a.modulo].nombre}${a.cierra ? ' · hasta el ' + fCorta(a.cierra) : ''}</small></div>${estado}
        <button type="button" class="btn" data-abrir="${a.id}" ${porAbrir ? 'disabled' : ''}>${porAbrir ? 'Abre el ' + fCorta(a.abre) : 'Abrir'}</button></li>`;
    };
    C.innerHTML = `<h3 id="vaTit">${esc(A.yo.seccion)}</h3>
      <p>${esc(A.yo.nombre)} · ${esc(A.yo.email)}</p>
      ${A.asign.length ? `<ul class="va-lista">${A.asign.map(fila).join('')}</ul>` : '<p>Tu docente aún no asigna casos a esta sección. Igual puedes practicar: lo que revises quedará registrado.</p>'}
      <p class="nota">Tu resultado se envía cuando presionas Revisar en el caso. Puedes repetirlo las veces que quieras.</p>
      <span class="doc-estado" id="vaEstado" role="status"></span>
      <div class="vn-acc"><button type="button" class="vn-link" id="vaSalir">Salir de esta sección</button><button type="button" class="btn btn-primario" data-cerrar>Cerrar</button></div>`;
    C.querySelectorAll('[data-abrir]').forEach(b => b.onclick = () => { const a = A.asign.find(x => x.id === b.dataset.abrir); $('#vaDlg').close(); X.irCaso(a.modulo, a.base, a.caso_id); });
    $('#vaSalir').onclick = async () => { if (!confirm('¿Salir de esta sección en este equipo? Tus resultados enviados se conservan.')) return; try { await api('/api/aula', 'POST', { accion: 'salir_est' }); } catch (e) {} A.yo = null; A.asign = []; pintarAula(); pintarBotonAula(); };
  }
  C.querySelectorAll('[data-cerrar]').forEach(b => b.onclick = () => $('#vaDlg').close());
}
async function cargarYo() {
  try { const j = await api('/api/aula'); A.yo = j.estudiante; A.asign = j.asignaciones || []; } catch (e) {}
  pintarBotonAula();
}
async function unirse(e) {
  e.preventDefault(); if (A.yo) return;
  const f = e.target, st = $('#vaEstado');
  st.className = 'doc-estado'; st.textContent = 'Un momento…';
  try {
    const j = await api('/api/aula', 'POST', { accion: 'unirse', codigo: f.codigo.value, nombre: f.nombre.value, email: f.email.value });
    A.yo = j.estudiante; A.asign = j.asignaciones || []; pintarAula(); pintarBotonAula();
    for (const mod in MODS) reiniciar(mod);
  } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
}

/* ---- Registro de intentos ---- */
function reiniciar(mod) { A.clave[mod] = uuid(); A.t0[mod] = Date.now(); A.enviado[mod] = false; A.firma[mod] = ''; }
function alCambiar(mod) {
  const doc = MODS[mod].doc(), cur = X.enPantalla(mod); if (!doc || !doc.intento || !cur) return;
  const llave = cur.id || cur.k;
  if (llave !== A.llave[mod] || (A.enviado[mod] && !doc.intento().revisado)) { A.llave[mod] = llave; reiniciar(mod); }
}
const lineas = sel => [...document.querySelectorAll(sel + ' li')].map(li => ({ ok: li.classList.contains('ok'), sug: li.classList.contains('sug'), t: li.textContent.trim().slice(0, 220) }));
function detalleTepsi() {
  const st = MODS.tepsi.doc().intento(), d = {};
  if (st.revisado && $('#fbForm .fb')) {
    const L = lineas('#fbForm .fb');
    d.items = { ok: st.items.filter(i => i.mia === i.ok).length, total: st.items.length, fallados: st.items.filter(i => i.mia !== i.ok).map(i => i.id) };
    d.formulario = { ok: L.filter(l => l.ok).length, total: L.length, lineas: L };
  }
  if ($('#fbK .fb')) { const L = lineas('#fbK .fb'); d.conducta = { ok: L.filter(l => l.ok).length, total: L.filter(l => l.ok || !l.sug).length, lineas: L }; }
  if (!d.items && !d.conducta) return null;
  d.entrevista = { preguntas: st.charla.filter(m => m.quien === 'est').length, charla: st.charla.slice(0, 80).map(m => ({ quien: m.quien, txt: String(m.txt).slice(0, 300) })) };
  return d;
}
function detalleRN() {
  const st = MODS.rn.doc().intento(); if (!st.revisado) return null;
  return { reflejos: { ok: st.lista.filter(r => r.mia === r.ok).length, total: st.lista.length, lista: st.lista } };
}
async function enviar(mod) {
  if (!A.yo) return;
  const doc = MODS[mod].doc(), cur = X.enPantalla(mod); if (!doc || !doc.intento || !cur) return;
  if (!A.clave[mod]) { A.llave[mod] = cur.id || cur.k; reiniciar(mod); }
  const detalle = mod === 'tepsi' ? detalleTepsi() : detalleRN(); if (!detalle) return;
  const firma = JSON.stringify(detalle); if (firma === A.firma[mod]) return;
  A.firma[mod] = firma;
  try {
    await api('/api/aula', 'POST', { accion: 'intento', clave: A.clave[mod], modulo: mod, base: cur.k, caso_id: cur.id, caso_titulo: cur.titulo, segundos: (Date.now() - A.t0[mod]) / 1000, detalle });
    const primera = !A.enviado[mod]; A.enviado[mod] = true;
    aviso(primera ? 'Resultado enviado a tu docente.' : 'Resultado actualizado.');
    if (primera) { const a = A.asign.find(x => x.modulo === mod && x.base === cur.k && (x.caso_id || null) === (cur.id || null)); if (a) a.intentos++; pintarBotonAula(); }
  } catch (err) {
    A.firma[mod] = '';
    if (err.status === 401) { A.yo = null; pintarBotonAula(); aviso('Tu ingreso a la sección venció: entra de nuevo con el código para enviar tu resultado.'); }
    else aviso('No se pudo enviar tu resultado. Presiona Revisar otra vez cuando tengas conexión.');
  }
}
function vigilarIntentos() {
  const tras = (mod, ms) => { let t; return () => { clearTimeout(t); t = setTimeout(() => enviar(mod), ms); }; };
  const aT = $('#appTepsi'), aR = $('#rnPuntaje');
  if (aT) new MutationObserver(tras('tepsi', 500)).observe(aT, { childList: true, subtree: true });
  if (aR) new MutationObserver(tras('rn', 300)).observe(aR, { childList: true, characterData: true, subtree: true });
  new MutationObserver(() => { const m = document.body.dataset.modulo; if (MODS[m] && !A.enviado[m]) A.t0[m] = Date.now(); }).observe(document.body, { attributes: true, attributeFilter: ['data-modulo'] });
}

/* ================= Docente: Secciones ================= */
const opcionesCasos = () => Object.keys(MODS).filter(m => MODS[m].doc()).map(m => `<optgroup label="${MODS[m].nombre}">${MODS[m].doc().casos().map(c => `<option value="${m}|${c.k}|">${esc(c.nombre)} (original)</option>`).join('')}${E.casos.filter(c => c.modulo === m && !c.es_base && c.estado === 'publicado').map(c => `<option value="${m}|${c.base}|${c.id}">${esc(c.titulo)}</option>`).join('')}</optgroup>`).join('');
async function cargarSecciones() {
  const L = $('#vaSecciones');
  try { A.secciones = (await api('/api/aula?secciones=1')).secciones || []; } catch (err) { L.innerHTML = `<p class="vn-vacio vn-error">${esc(err.message)}</p>`; return; }
  L.innerHTML = A.secciones.length ? A.secciones.map(s => `<article class="va-sec" data-id="${s.id}">
      <header><h3>${esc(s.nombre)}</h3><span class="vn-etq ${s.activa ? 'pub' : 'bor'}">${s.activa ? 'Ingreso abierto' : 'Ingreso cerrado'}</span></header>
      <p class="va-cod"><span>Código para estudiantes</span><b>${esc(s.codigo)}</b><button type="button" class="btn" data-acc="copiar">Copiar</button></p>
      <p class="nota">${s.estudiantes} ${s.estudiantes === 1 ? 'estudiante' : 'estudiantes'} · ${s.intentos} ${s.intentos === 1 ? 'intento' : 'intentos'}</p>
      ${s.asignaciones.length ? `<ul class="va-lista">${s.asignaciones.map(a => `<li><div><strong>${esc(nombreCaso(a))}</strong><small>${MODS[a.modulo].nombre}${a.cierra ? ' · hasta el ' + fCorta(a.cierra) : ' · sin plazo'}</small></div><button type="button" class="btn" data-quitar="${a.id}">Quitar</button></li>`).join('')}</ul>` : '<p class="nota">Sin casos asignados: los estudiantes pueden practicar libremente y sus intentos igual se registran.</p>'}
      <div class="va-asignar"><label class="campo"><span>Asignar caso</span><select name="caso">${opcionesCasos()}</select></label>
        <label class="campo"><span>Plazo (opcional)</span><input type="date" name="cierra"></label><button type="button" class="btn" data-acc="asignar">Asignar</button></div>
      <div class="vn-fila"><button type="button" class="btn btn-primario" data-acc="resultados">Ver resultados</button><button type="button" class="btn" data-acc="renombrar">Renombrar</button>
        <button type="button" class="btn" data-acc="alternar">${s.activa ? 'Cerrar ingreso' : 'Reabrir ingreso'}</button><button type="button" class="btn vn-peligro" data-acc="borrar">Eliminar</button></div>
    </article>`).join('') : '<p class="vn-vacio">Crea una sección por cada grupo de estudiantes. Cada una tiene un código: quien lo escribe en "Mi sección" queda inscrito y sus resultados llegan a la pestaña Resultados.</p>';
  const st = $('#vaSecEstado'), post = async (cuerpo, ok) => { try { await api('/api/aula', 'POST', cuerpo); st.className = 'doc-estado'; st.textContent = ok || ''; await cargarSecciones(); } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; } };
  L.querySelectorAll('[data-quitar]').forEach(b => b.onclick = () => post({ accion: 'desasignar', id: b.dataset.quitar }, 'Caso quitado de la sección.'));
  L.querySelectorAll('[data-acc]').forEach(b => b.onclick = async () => {
    const art = b.closest('.va-sec'), s = A.secciones.find(x => x.id === art.dataset.id), acc = b.dataset.acc;
    if (acc === 'copiar') { try { await navigator.clipboard.writeText(s.codigo); st.className = 'doc-estado'; st.textContent = `Código ${s.codigo} copiado.`; } catch (e) { st.textContent = `Código: ${s.codigo}`; } }
    if (acc === 'asignar') { const [modulo, base, caso_id] = art.querySelector('[name=caso]').value.split('|'), f = art.querySelector('[name=cierra]').value; post({ accion: 'asignar', seccion_id: s.id, modulo, base, caso_id: caso_id || null, cierra: f ? new Date(f + 'T23:59:59').toISOString() : null }, 'Caso asignado.'); }
    if (acc === 'renombrar') { const n = prompt('Nombre de la sección', s.nombre); if (n && n.trim()) post({ accion: 'seccion_editar', id: s.id, nombre: n, activa: s.activa }, 'Sección renombrada.'); }
    if (acc === 'alternar') post({ accion: 'seccion_editar', id: s.id, nombre: s.nombre, activa: !s.activa }, s.activa ? 'Ingreso cerrado: el código ya no acepta estudiantes nuevos.' : 'Ingreso reabierto.');
    if (acc === 'borrar') { if (confirm(`¿Eliminar la sección "${s.nombre}"? Se borran también sus ${s.estudiantes} estudiantes y ${s.intentos} intentos. No se puede deshacer.`)) post({ accion: 'seccion_borrar', id: s.id }, 'Sección eliminada.'); }
    if (acc === 'resultados') { A.sel = s.id; X.irTab('resultados'); }
  });
}
async function crearSeccion(e) {
  e.preventDefault(); const f = e.target, st = $('#vaSecEstado');
  try { const j = await api('/api/aula', 'POST', { accion: 'seccion', nombre: f.nombre.value }); f.reset(); st.className = 'doc-estado'; st.textContent = `Sección creada. Código para estudiantes: ${j.codigo}`; await cargarSecciones(); }
  catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
}

/* ================= Docente: Resultados ================= */
const P = (d, k) => d && d[k] ? `${d[k].ok}/${d[k].total}` : '';
function resumen(i) {
  const d = i.detalle || {};
  return i.modulo === 'rn' ? (d.reflejos ? `Reflejos ${P(d, 'reflejos')}` : '') : [d.items && `Ítems ${P(d, 'items')}`, d.formulario && `Formulario ${P(d, 'formulario')}`, d.conducta && `Conducta ${P(d, 'conducta')}`].filter(Boolean).join(' · ');
}
const minutos = s => s < 60 ? '<1 min' : Math.round(s / 60) + ' min';
const asigDe = (R, i) => R.asignaciones.find(a => a.modulo === i.modulo && a.base === i.base && (a.caso_id || null) === (i.caso_id || null));
const tarde = (R, i) => { const a = asigDe(R, i); return !!(a && a.cierra && new Date(i.creado) > new Date(a.cierra)); };
function detalleHTML(i) {
  const d = i.detalle || {}, li = L => L.map(l => `<li class="${l.ok ? 'ok' : l.sug ? 'sug' : 'no'}">${esc(l.t)}</li>`).join(''); let h = '';
  if (d.items && d.items.fallados.length) h += `<p><strong>Ítems con puntuación distinta a lo observado:</strong> ${d.items.fallados.map(esc).join(', ')}</p>`;
  if (d.formulario) h += `<p><strong>Formulario</strong></p><ul class="va-lin">${li(d.formulario.lineas)}</ul>`;
  if (d.conducta) h += `<p><strong>Conducta</strong></p><ul class="va-lin">${li(d.conducta.lineas)}</ul>`;
  if (d.reflejos) { const O = Object.fromEntries(MODS.rn.doc() ? MODS.rn.doc().opciones() : []); h += `<ul class="va-lin">${d.reflejos.lista.map(r => `<li class="${r.mia === r.ok ? 'ok' : 'no'}">${esc(r.nombre)}: registró "${esc(O[r.mia] || 'sin registrar')}"${r.mia === r.ok ? '' : `; esperado "${esc(O[r.ok] || r.ok)}"`}</li>`).join('')}</ul>`; }
  if (d.entrevista && d.entrevista.charla.length) h += `<details><summary>Entrevista (${d.entrevista.preguntas} ${d.entrevista.preguntas === 1 ? 'pregunta' : 'preguntas'})</summary><div class="va-chat">${d.entrevista.charla.map(m => `<p><b>${m.quien === 'est' ? 'Estudiante' : 'Madre'}:</b> ${esc(m.txt)}</p>`).join('')}</div></details>`;
  return h || '<p class="nota">Sin detalle.</p>';
}
async function cargarResultados() {
  const S = $('#vaResSel'), C = $('#vaRes');
  if (!A.secciones.length) { try { A.secciones = (await api('/api/aula?secciones=1')).secciones || []; } catch (e) {} }
  if (!A.secciones.length) { S.innerHTML = ''; S.disabled = true; $('#vaCsv').disabled = true; C.innerHTML = '<p class="vn-vacio">Primero crea una sección en la pestaña Secciones.</p>'; return; }
  if (!A.secciones.some(s => s.id === A.sel)) A.sel = A.secciones[0].id;
  S.disabled = false; S.innerHTML = A.secciones.map(s => `<option value="${s.id}" ${s.id === A.sel ? 'selected' : ''}>${esc(s.nombre)}</option>`).join('');
  C.innerHTML = '<p class="vn-vacio">Cargando…</p>';
  let R; try { R = await api('/api/aula?resultados=' + A.sel); } catch (err) { C.innerHTML = `<p class="vn-vacio vn-error">${esc(err.message)}</p>`; return; }
  A.res = R; $('#vaCsv').disabled = !R.intentos.length;
  const porEst = id => R.intentos.filter(i => i.estudiante_id === id);
  const hecha = (id, a) => porEst(id).some(i => asigDe(R, i) === a);
  const completos = R.estudiantes.filter(e => R.asignaciones.length && R.asignaciones.every(a => hecha(e.id, a))).length;
  const caja = (n, t) => `<div class="va-caja"><b>${n}</b><span>${t}</span></div>`;
  let h = `<div class="va-cajas">${caja(R.estudiantes.length, 'estudiantes inscritos')}${caja(R.intentos.length, 'intentos enviados')}${R.asignaciones.length ? caja(`${completos}/${R.estudiantes.length}`, 'completaron todo lo asignado') : ''}</div>`;
  if (R.asignaciones.length && R.estudiantes.length) {
    h += `<div class="va-scrollx"><table class="vn-tabla va-matriz"><thead><tr><th>Estudiante</th>${R.asignaciones.map(a => `<th>${esc(nombreCaso(a))}<br><small>${MODS[a.modulo].nombre}</small></th>`).join('')}</tr></thead><tbody>${R.estudiantes.map(e => `<tr><td>${esc(e.nombre)}</td>${R.asignaciones.map(a => { const is = porEst(e.id).filter(i => asigDe(R, i) === a), u = is[is.length - 1]; return `<td>${u ? `${esc(resumen(u)) || 'Enviado'}${is.length > 1 ? `<br><small>${is.length} intentos · último</small>` : ''}${tarde(R, u) ? '<br><span class="vn-etq bor">Fuera de plazo</span>' : ''}` : '<span class="va-nada">Pendiente</span>'}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  h += R.estudiantes.length ? `<h3 class="va-h">Detalle por estudiante</h3>` + R.estudiantes.map(e => { const is = porEst(e.id); return `<details class="va-est"><summary><strong>${esc(e.nombre)}</strong><span>${esc(e.email)} · ${is.length} ${is.length === 1 ? 'intento' : 'intentos'}</span></summary>
      ${is.length ? is.map(i => `<div class="va-int"><p><strong>${esc(i.caso_titulo || i.base)}</strong> · ${MODS[i.modulo].nombre} · ${fHora(i.creado)} · ${minutos(i.segundos)}${asigDe(R, i) ? '' : ' · práctica libre'}${tarde(R, i) ? ' · <span class="vn-etq bor">Fuera de plazo</span>' : ''}</p><p>${esc(resumen(i)) || 'Sin puntajes'}</p>${detalleHTML(i)}</div>`).join('') : '<p class="nota">Aún no envía intentos.</p>'}</details>`; }).join('')
    : '<p class="vn-vacio">Todavía no hay estudiantes inscritos. Comparte el código de la sección para que entren desde el botón "Mi sección".</p>';
  h += '<p class="nota">Los puntajes muestran cuántos elementos coinciden con lo esperado en el caso. No son una nota: la calificación la define cada docente.</p>';
  C.innerHTML = h;
}
function exportarCSV() {
  const R = A.res; if (!R) return;
  const s = A.secciones.find(x => x.id === A.sel), q = v => `"${String(v ?? '').replace(/"/g, '""')}"`, n = (d, k, c) => d && d[k] ? d[k][c] : '';
  const cab = ['Estudiante', 'Correo', 'Evaluación', 'Caso', 'Fecha', 'Minutos', 'Ítems correctos', 'Ítems total', 'Formulario correctos', 'Formulario total', 'Conducta correctos', 'Conducta total', 'Reflejos correctos', 'Reflejos total', 'Preguntas en entrevista', 'Asignado', 'Fuera de plazo'];
  const filas = R.intentos.map(i => { const e = R.estudiantes.find(x => x.id === i.estudiante_id) || {}, d = i.detalle || {};
    return [e.nombre, e.email, MODS[i.modulo].nombre, i.caso_titulo || i.base, fHora(i.creado), Math.round(i.segundos / 60), n(d, 'items', 'ok'), n(d, 'items', 'total'), n(d, 'formulario', 'ok'), n(d, 'formulario', 'total'), n(d, 'conducta', 'ok'), n(d, 'conducta', 'total'), n(d, 'reflejos', 'ok'), n(d, 'reflejos', 'total'), d.entrevista ? d.entrevista.preguntas : '', asigDe(R, i) ? 'Sí' : 'No', tarde(R, i) ? 'Sí' : 'No'].map(q).join(';'); });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + [cab.map(q).join(';'), ...filas].join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  a.download = `resultados-${(s ? s.nombre : 'seccion').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ================= Montaje ================= */
X.alMontar.push(() => {
  $('#vnDocs').insertAdjacentHTML('beforebegin', '<button class="inicio-btn" id="vnAula" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5"/><path d="M16 5.2a3.2 3.2 0 0 1 0 5.6"/><path d="M17.5 14.8c2.1.6 3.5 2.4 3.5 5.2"/></svg><span id="vnAulaTxt">Mi sección</span></button>');
  document.body.insertAdjacentHTML('beforeend', `<dialog class="vn-dlg va-dlg" id="vaDlg" aria-labelledby="vaTit"><form id="vaCuerpo"></form></dialog><div class="va-aviso" id="vaAviso" role="status" hidden></div>`);
  $('.vn-tab[data-tab="docentes"]').insertAdjacentHTML('beforebegin', '<button type="button" class="vn-tab" role="tab" data-tab="secciones" aria-controls="vn-secciones">Secciones</button><button type="button" class="vn-tab" role="tab" data-tab="resultados" aria-controls="vn-resultados">Resultados</button>');
  $('#vnPanel').insertAdjacentHTML('beforeend', `
  <div class="vn-vista" id="vn-secciones" role="tabpanel" hidden><div class="vn-scroll">
    <form class="va-nueva" id="vaNueva"><label class="campo"><span>Nueva sección (por ejemplo, "Pediatría 2026-2 · Sección 3")</span><input type="text" name="nombre" maxlength="120" required></label><button type="submit" class="btn btn-primario">Crear sección</button></form>
    <span class="doc-estado" id="vaSecEstado" role="status"></span>
    <div class="va-secs" id="vaSecciones"></div></div></div>
  <div class="vn-vista" id="vn-resultados" role="tabpanel" hidden><div class="vn-scroll">
    <div class="va-barra"><label class="campo"><span>Sección</span><select id="vaResSel"></select></label><button type="button" class="btn" id="vaCsv" disabled>Exportar a Excel (CSV)</button><button type="button" class="btn" id="vaAct">Actualizar</button></div>
    <div id="vaRes" class="va-res"></div></div></div>`);
  $('#vnAula').onclick = () => { pintarAula(); $('#vaDlg').showModal(); };
  $('#vaCuerpo').onsubmit = unirse;
  $('#vaNueva').onsubmit = crearSeccion;
  $('#vaResSel').onchange = e => { A.sel = e.target.value; cargarResultados(); };
  $('#vaAct').onclick = cargarResultados; $('#vaCsv').onclick = exportarCSV;
  X.tabs.secciones = cargarSecciones; X.tabs.resultados = cargarResultados;
  X.alDecorar.push(alCambiar); X.alSesion.push(pintarBotonAula);
  vigilarIntentos(); pintarBotonAula(); cargarYo();
});
})();
