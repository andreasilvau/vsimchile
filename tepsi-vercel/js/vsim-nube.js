/* Panel docente con base de datos (Vercel + Neon).
   - Estudiantes: reciben las ediciones de los casos originales, los casos nuevos publicados y sus imágenes.
   - Docentes: entran con su cuenta y administran casos, imágenes y equipo desde un panel con pestañas.
   Si el servidor no está configurado, este archivo no cambia nada y el simulador funciona como siempre. */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MODS = {
  tepsi: { nombre: 'TEPSI', doc: () => window.TEPSI_DOC, cont: '#casos' },
  rn: { nombre: 'Recién nacido', doc: () => window.RN_DOC, cont: '#rnCasos' }
};
const E = { usuario: null, casos: [], medios: [], activa: { tepsi: null, rn: null }, interno: false, ed: null, tab: 'casos' };
const esDoc = () => !!E.usuario && E.usuario.rol === 'docente';
const porId = id => E.casos.find(c => c.id === id);
const baseDe = (mod, k) => E.casos.find(c => c.modulo === mod && c.es_base && c.base === k);
const variantes = mod => E.casos.filter(c => c.modulo === mod && !c.es_base && (c.estado === 'publicado' || esDoc()));
const urlImg = id => '/api/medios?id=' + encodeURIComponent(id);

async function api(ruta, metodo = 'GET', cuerpo) {
  let r;
  try { r = await fetch(ruta, { method: metodo, credentials: 'same-origin', headers: cuerpo ? { 'content-type': 'application/json' } : {}, body: cuerpo ? JSON.stringify(cuerpo) : undefined }); }
  catch (e) { throw new Error('No hay conexión con el servidor. Inténtalo de nuevo.'); }
  let j = null; try { j = await r.json(); } catch (e) {}
  if (!r.ok) { const err = new Error((j && j.error) || 'No se pudo completar la acción. Inténtalo de nuevo.'); err.status = r.status; throw err; }
  return j;
}

/* ================= Vista del estudiante ================= */
const nativos = c => [...c.children].filter(b => b.tagName === 'BUTTON' && !b.classList.contains('vn-var'));
const obs = {};

function aplicarBases() {
  for (const mod in MODS) {
    const doc = MODS[mod].doc(); if (!doc) continue;
    const act = porId(E.activa[mod]);
    for (const { k } of doc.casos()) {
      if (act && act.base === k) { doc.aplicar(k, act.datos); continue; }
      const b = baseDe(mod, k);
      try { doc.aplicar(k, b ? b.datos : null); } catch (e) { console.error(e); }
    }
  }
}
function decorar(mod) {
  const c = $(MODS[mod].cont); if (!c) return;
  c.querySelectorAll('.vn-var').forEach(b => b.remove());
  const act = E.activa[mod];
  if (act) {
    nativos(c).forEach(b => b.setAttribute('aria-pressed', 'false'));
    // El botón del caso original conserva su nombre aunque el motor esté mostrando el caso docente.
    const v = porId(act), doc = MODS[mod].doc(), i = v ? doc.casos().findIndex(x => x.k === v.base) : -1, n = nativos(c)[i];
    if (n && mod === 'tepsi') { const fb = baseDe(mod, v.base), o = doc.original(v.base), d = (fb && fb.datos) || {}; n.textContent = `${d.nombre || o.nombre} · ${d.edad || o.edad}`; }
  }
  for (const v of variantes(mod)) {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn vn-var'; b.dataset.vn = v.id;
    b.innerHTML = esc(v.titulo) + (v.estado !== 'publicado' ? ' <small>Borrador</small>' : '');
    b.setAttribute('aria-pressed', act === v.id);
    b.onclick = () => activar(mod, v.id);
    c.appendChild(b);
  }
  if (obs[mod]) obs[mod].takeRecords();
  pintarBotonDocs();
  X.alDecorar.forEach(f => { try { f(mod); } catch (e) { console.error(e); } });
}
function soltar(mod) {
  const v = porId(E.activa[mod]); E.activa[mod] = null;
  const doc = MODS[mod].doc();
  if (v && doc) { const b = baseDe(mod, v.base); doc.aplicar(v.base, b ? b.datos : null); }
}
function activar(mod, id) {
  const v = porId(id), doc = MODS[mod].doc(), c = $(MODS[mod].cont);
  if (!v || !doc || !c) return;
  soltar(mod);
  E.activa[mod] = id;
  doc.aplicar(v.base, v.datos);
  const i = doc.casos().findIndex(x => x.k === v.base);
  E.interno = true;
  try { const b = nativos(c)[i]; if (b) b.click(); } finally { E.interno = false; }
  decorar(mod);
}
function vigilar(mod) {
  const c = $(MODS[mod].cont); if (!c || obs[mod]) return;
  obs[mod] = new MutationObserver(() => decorar(mod));
  obs[mod].observe(c, { childList: true });
  // Al elegir un caso original se suelta el caso docente que estuviera activo.
  c.addEventListener('click', e => {
    if (E.interno || !E.activa[mod]) return;
    const b = e.target.closest('button');
    if (!b || b.classList.contains('vn-var') || b.parentNode !== c) return;
    e.stopPropagation(); e.preventDefault();
    const i = nativos(c).indexOf(b);
    soltar(mod);
    const n = nativos(c)[i]; if (n) n.click();
  }, true);
}
// Caso que el estudiante tiene en pantalla: original (k) o caso docente (id).
function enPantalla(mod) {
  const doc = MODS[mod].doc(), c = $(MODS[mod].cont); if (!doc || !c) return null;
  const v = porId(E.activa[mod]); if (v) return { k: v.base, id: v.id, titulo: v.titulo };
  const i = nativos(c).findIndex(b => b.getAttribute('aria-pressed') === 'true'), x = doc.casos()[i];
  return x ? { k: x.k, id: null, titulo: x.nombre } : null;
}
function irCaso(mod, k, id) {
  const ir = document.querySelector(`[data-ir="${mod}"]`); if (ir) ir.click();
  if (id) return activar(mod, id);
  const doc = MODS[mod].doc(), c = $(MODS[mod].cont), i = doc.casos().findIndex(x => x.k === k);
  soltar(mod);
  E.interno = true; try { const b = nativos(c)[i]; if (b) b.click(); } finally { E.interno = false; }
  decorar(mod);
}
function casoActual() {
  const mod = document.body.dataset.modulo; if (!MODS[mod]) return null;
  if (E.activa[mod]) return porId(E.activa[mod]) || null;
  const c = $(MODS[mod].cont), doc = MODS[mod].doc(); if (!c || !doc) return null;
  const i = nativos(c).findIndex(b => b.getAttribute('aria-pressed') === 'true');
  const k = doc.casos()[i]; return k ? baseDe(mod, k.k) || null : null;
}

/* ---- Documentos del caso (imágenes que adjunta el docente) ---- */
function pintarBotonDocs() {
  const b = $('#vnDocs'); if (!b) return;
  const c = casoActual(), n = c && c.medios ? c.medios.length : 0;
  b.hidden = !n; if (n) $('#vnDocsN').textContent = `Documentos (${n})`;
}
function abrirDocs() {
  const c = casoActual(); if (!c || !c.medios.length) return;
  $('#vnGaleria').innerHTML = c.medios.map(m => `<figure><img src="${urlImg(m.id)}" alt="${esc(m.alt || m.leyenda || m.nombre)}" loading="lazy"><figcaption>${esc(m.leyenda || m.alt || '')}</figcaption></figure>`).join('');
  $('#vnDlgDocs').showModal();
}

/* ================= Sesión ================= */
const LOGIN = {
  entrar: { tit: 'Ingreso docente', ayuda: 'Entra con tu cuenta para editar casos e imágenes.', ok: 'Entrar', cambio: 'Crear cuenta de docente', a: 'registro', campos: ['email', 'password'] },
  registro: { tit: 'Crear cuenta de docente', ayuda: 'Necesitas el código de invitación que entrega la coordinación del Centro.', ok: 'Crear cuenta', cambio: 'Ya tengo cuenta', a: 'entrar', campos: ['nombre', 'email', 'password', 'codigo'] },
  recuperar: { tit: 'Recuperar contraseña', ayuda: 'Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.', ok: 'Enviar enlace', cambio: 'Volver a ingresar', a: 'entrar', campos: ['email'] },
  nueva: { tit: 'Crear contraseña nueva', ayuda: 'Elige una contraseña nueva para tu cuenta.', ok: 'Guardar contraseña', cambio: 'Volver a ingresar', a: 'entrar', campos: ['password'] }
};
function abrirLogin(modo = 'entrar', mensaje = '', error = false) {
  const d = $('#vnDlgLogin'), M = LOGIN[modo], f = $('#vnLoginForm');
  d.dataset.modo = modo;
  $('#vnLoginTit').textContent = M.tit; $('#vnLoginAyuda').textContent = M.ayuda;
  for (const n of ['nombre', 'email', 'password', 'codigo']) { const on = M.campos.includes(n), el = f.elements[n]; el.closest('label').hidden = !on; el.required = on; el.disabled = !on; }
  $('#vnLoginPass').autocomplete = modo === 'entrar' ? 'current-password' : 'new-password';
  $('#vnLoginPassEtq').textContent = modo === 'nueva' ? 'Contraseña nueva (mínimo 8 caracteres)' : 'Contraseña (mínimo 8 caracteres)';
  $('#vnLoginOk').textContent = M.ok; $('#vnLoginCambio').textContent = M.cambio;
  $('#vnLoginOlvido').hidden = modo !== 'entrar';
  const st = $('#vnLoginEstado'); st.className = 'doc-estado' + (error ? ' vn-error' : ''); st.textContent = mensaje;
  if (!d.open) d.showModal();
}
async function enviarLogin(e) {
  e.preventDefault();
  const d = $('#vnDlgLogin'), f = e.target, st = $('#vnLoginEstado'), ok = $('#vnLoginOk'), modo = d.dataset.modo;
  ok.disabled = true; st.className = 'doc-estado'; st.textContent = 'Un momento…';
  try {
    if (modo === 'recuperar') {
      await api('/api/auth', 'POST', { accion: 'recuperar', email: f.email.value });
      st.textContent = 'Si ese correo tiene una cuenta, te llegará un enlace en unos minutos. Revisa también la carpeta de spam.';
      return;
    }
    if (modo === 'nueva') {
      await api('/api/auth', 'POST', { accion: 'nueva_clave', token: E.tokenClave, password: f.password.value });
      E.tokenClave = null; f.password.value = '';
      abrirLogin('entrar', 'Contraseña actualizada. Entra con tu contraseña nueva.');
      return;
    }
    const j = await api('/api/auth', 'POST', { accion: modo, email: f.email.value, password: f.password.value, nombre: f.nombre.value, codigo: f.codigo.value });
    E.usuario = j.usuario; f.password.value = ''; f.codigo.value = '';
    if (!esDoc()) { st.className = 'doc-estado vn-error'; st.textContent = 'Tu cuenta no tiene permiso de docente.'; return; }
    d.close(); await recargar(); X.alSesion.forEach(f => f()); abrirPanel();
  } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
  finally { ok.disabled = false; }
}
// Al volver desde el enlace del correo, la página trae ?recuperar=1&token=… (o &error=… si el enlace venció).
function revisarEnlaceClave() {
  const q = new URLSearchParams(location.search); if (!q.has('recuperar')) return;
  const token = q.get('token'), error = q.get('error');
  try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) {}
  if (token && !error) { E.tokenClave = token; abrirLogin('nueva'); }
  else abrirLogin('recuperar', 'El enlace venció o ya fue usado. Pide uno nuevo.', true);
}
async function salir() {
  try { await api('/api/auth', 'POST', { accion: 'salir' }); } catch (e) {}
  E.usuario = null; cerrarPanel(); await recargar(); X.alSesion.forEach(f => f());
}

/* ================= Datos ================= */
async function recargar() {
  try { E.casos = (await api('/api/casos' + (esDoc() ? '?todos=1' : ''))).casos || []; } catch (e) { if (e.status === 503) throw e; }
  for (const mod in MODS) if (E.activa[mod] && !variantes(mod).some(v => v.id === E.activa[mod])) soltar(mod);
  aplicarBases();
  refrescarTepsi();
  for (const mod in MODS) decorar(mod);
}
// El motor del TEPSI solo repinta el contexto al cargar un caso: se vuelve a cargar el que está en pantalla.
// Ocurre al abrir la página y cuando un docente guarda; nunca en medio de la evaluación de un estudiante.
function refrescarTepsi() {
  const c = $(MODS.tepsi.cont), doc = MODS.tepsi.doc(); if (!c || !doc) return;
  if (E.activa.tepsi) return activar('tepsi', E.activa.tepsi);
  const b = nativos(c).find(x => x.getAttribute('aria-pressed') === 'true'); if (!b) return;
  E.interno = true; try { b.click(); } finally { E.interno = false; }
}
const copia = o => JSON.parse(JSON.stringify(o));
// Datos editables de un caso original (sin lo que agrega el motor 3D).
function originales(mod, k) {
  const d = MODS[mod].doc().original(k);
  return mod === 'rn' ? { nombre: d.nombre, ctx: d.ctx, ficha: copia(d.ficha), clave: copia(d.clave || {}), cierre: copia(d.cierre) } : d;
}
const nombreBase = (mod, k) => { const c = MODS[mod].doc().casos().find(x => x.k === k); return c ? c.nombre : k; };

/* ================= Panel ================= */
function abrirPanel() {
  const P = $('#vnPanel');
  P.style.top = $('.topbar').offsetHeight + 'px'; P.hidden = false;
  $('#vnQuien').textContent = E.usuario.nombre || E.usuario.email;
  irTab(E.tab); $('#vnTit').focus();
}
function cerrarPanel() { $('#vnPanel').hidden = true; }
function irTab(t) {
  E.tab = t;
  document.querySelectorAll('.vn-tab').forEach(b => { const on = b.dataset.tab === t; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  document.querySelectorAll('.vn-vista').forEach(v => v.hidden = v.id !== 'vn-' + t);
  if (t === 'casos') { pintarLista(); if (!E.ed) abrirCaso({ tipo: 'base', mod: 'tepsi', k: MODS.tepsi.doc().casos()[0].k }); }
  if (t === 'imagenes') cargarMedios();
  if (t === 'docentes') cargarDocentes();
  if (X.tabs[t]) X.tabs[t]();
}

/* ---- Pestaña Casos ---- */
const mismo = (a, b) => a && b && a.tipo === b.tipo && a.mod === b.mod && a.k === b.k && a.id === b.id;
function pintarLista() {
  const L = $('#vnLista'); let h = '<button type="button" class="btn btn-primario vn-nuevo" id="vnNuevo">Nuevo caso</button>';
  for (const mod in MODS) {
    const doc = MODS[mod].doc(); if (!doc) continue;
    h += `<p class="doc-grupo">${MODS[mod].nombre} · originales</p>`;
    for (const c of doc.casos()) { const ed = { tipo: 'base', mod, k: c.k }; h += `<button type="button" class="doc-it${mismo(E.ed, ed) ? ' on' : ''}" data-ed='${esc(JSON.stringify(ed))}'>${esc(c.nombre)}${baseDe(mod, c.k) ? '<small>Editado</small>' : ''}</button>`; }
    const vs = variantes(mod);
    if (vs.length) h += `<p class="doc-grupo">${MODS[mod].nombre} · casos nuevos</p>`;
    for (const v of vs) { const ed = { tipo: 'var', mod, id: v.id }; h += `<button type="button" class="doc-it${mismo(E.ed, ed) ? ' on' : ''}" data-ed='${esc(JSON.stringify(ed))}'>${esc(v.titulo)}<span class="vn-etq ${v.estado === 'publicado' ? 'pub' : 'bor'}">${v.estado === 'publicado' ? 'Publicado' : 'Borrador'}</span></button>`; }
  }
  L.innerHTML = h;
  L.querySelectorAll('.doc-it').forEach(b => b.onclick = () => abrirCaso(JSON.parse(b.dataset.ed)));
  $('#vnNuevo').onclick = formNuevo;
}
const campo = (etq, nombre, valor, tipo = 'text', extra = '') => `<label class="campo"><span>${etq}</span>${tipo === 'area' ? `<textarea name="${nombre}" rows="${extra || 3}" spellcheck="true">${esc(valor)}</textarea>` : `<input type="${tipo}" name="${nombre}" value="${esc(valor)}" spellcheck="false">`}</label>`;

function camposTepsi(d, o) {
  const doc = MODS.tepsi.doc(), P = doc.preguntas(), K = doc.conductas();
  const est = [['', 'Según categorías'], ['esperada', 'Esperada'], ['sugerida', 'Sugerida'], ['no', 'No corresponde']];
  d = Object.assign({}, o, d); d.ident = Object.assign({}, o.ident, d.ident); d.mama = Object.assign({}, o.mama, d.mama); d.conducta = d.conducta || {}; d.resp = d.resp || [];
  return `<fieldset><legend>Identificación</legend><div class="doc-grid">
      ${campo('Nombre (como lo llama la app)', 'nombre', d.nombre)}${campo('Edad (texto)', 'edad', d.edad)}${campo('Sexo', 'sexo', d.sexo)}
      ${campo('Nombre completo', 'ident.nombre', d.ident.nombre)}${campo('RUN', 'ident.run', d.ident.run)}${campo('N.º de ficha', 'ident.ficha', d.ident.ficha)}
      ${campo('Fecha de nacimiento', 'ident.nac', d.ident.nac, 'date')}${campo('Fecha del examen', 'ident.examen', d.ident.examen, 'date')}</div>
      ${campo('Contexto del caso', 'ctx', d.ctx, 'area', 2)}</fieldset>
    <fieldset><legend>Madre</legend><div class="doc-grid">${campo('Nombre', 'mama.nombre', d.mama.nombre)}${campo('Tono al responder', 'mama.tono', d.mama.tono)}</div>
      ${campo('Hechos que conoce (los usa para responder preguntas libres)', 'mama.hechos', d.mama.hechos, 'area', 8)}</fieldset>
    <fieldset><legend>Respuestas a las preguntas sugeridas</legend>${P.map((p, i) => campo(esc(p.q), 'resp.' + i, d.resp[i] ?? o.resp[i], 'area', 2)).join('')}</fieldset>
    <fieldset><legend>Cierre y conducta esperada</legend>${campo('Lectura del caso (se muestra al revisar el formulario)', 'cierre', d.cierre, 'area', 4)}
      <div class="doc-cond">${K.map(c => `<label class="campo"><span>${esc(c.txt)}</span><select name="conducta.${c.id}">${est.map(([v, t]) => `<option value="${v}" ${(d.conducta[c.id] || '') === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`).join('')}</div>
      ${campo('Explicación de la conducta (vacío: automática según categorías)', 'motivo', d.motivo || '', 'area', 3)}</fieldset>`;
}
function camposRN(d, o) {
  const doc = MODS.rn.doc(), R = doc.reflejos(), O = doc.opciones();
  d = Object.assign({}, o, d); if (!Array.isArray(d.ficha) || d.ficha.length !== o.ficha.length) d.ficha = o.ficha; d.clave = d.clave || {}; if (!Array.isArray(d.cierre)) d.cierre = o.cierre;
  return `<fieldset><legend>Antecedentes</legend>${campo('Contexto del caso', 'ctx', d.ctx, 'area', 3)}<div class="doc-grid">${d.ficha.map(([a, b], i) => campo(esc(a), 'ficha.' + i, b)).join('')}</div></fieldset>
    <fieldset><legend>Hallazgo esperado (el RN responde según esto)</legend><div class="doc-grid">${R.map(r => `<label class="campo"><span>${esc(r.nombre)}</span><select name="clave.${r.id}">${O.map(([v, t]) => `<option value="${v}" ${(d.clave[r.id] || 'sim') === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`).join('')}</div>
      <p class="nota">"Asimétrico" deja sin respuesta el lado derecho. La postura de base del RN (sano, brazo en propina o hipotonía) viene del caso original y no cambia.</p></fieldset>
    <fieldset><legend>Cierre</legend>${campo('Diagnóstico', 'cierre.0', d.cierre[0])}${campo('Explicación', 'cierre.1', d.cierre[1], 'area', 4)}</fieldset>`;
}
function pintarAdjuntos(lista) {
  const A = $('#vnAdj'); if (!A) return;
  A._lista = lista;
  A.innerHTML = lista.length ? lista.map((m, i) => `<div class="vn-adj-it"><img src="${urlImg(m.id)}" alt="${esc(m.alt || m.nombre || '')}" loading="lazy">
      <label class="campo"><span>Leyenda que verá el estudiante (${esc(m.nombre || 'imagen')})</span><input type="text" data-ley="${i}" value="${esc(m.leyenda || '')}" maxlength="300"></label>
      <button type="button" class="btn" data-quitar="${i}">Quitar</button></div>`).join('') : '<p class="nota">Este caso no tiene imágenes. El estudiante verá el botón "Documentos" cuando agregues alguna.</p>';
  A.querySelectorAll('[data-ley]').forEach(x => x.oninput = () => { lista[+x.dataset.ley].leyenda = x.value; });
  A.querySelectorAll('[data-quitar]').forEach(x => x.onclick = () => { lista.splice(+x.dataset.quitar, 1); pintarAdjuntos(lista); });
  const S = $('#vnAdjSel'), libres = E.medios.filter(m => !lista.some(x => x.id === m.id));
  S.innerHTML = '<option value="">Agregar imagen de la biblioteca…</option>' + libres.map(m => `<option value="${m.id}">${esc(m.nombre)}</option>`).join('');
  S.disabled = !libres.length;
  S.onchange = () => { const m = E.medios.find(x => x.id === S.value); if (m) { lista.push({ id: m.id, nombre: m.nombre, alt: m.alt, leyenda: m.alt || '' }); pintarAdjuntos(lista); } };
}
async function abrirCaso(ed) {
  E.ed = ed; pintarLista();
  const F = $('#vnForm'), mod = ed.mod, esVar = ed.tipo === 'var';
  const fila = esVar ? porId(ed.id) : baseDe(mod, ed.k);
  if (esVar && !fila) { E.ed = null; return irTab('casos'); }
  const k = esVar ? fila.base : ed.k, o = originales(mod, k), d = fila ? fila.datos : o;
  const cab = esVar
    ? `<h3>${esc(fila.titulo)} · ${MODS[mod].nombre}</h3>
       <fieldset><legend>Caso nuevo</legend><div class="doc-grid">${campo('Título (lo ve el estudiante en el botón del caso)', 'vn.titulo', fila.titulo)}
         <label class="campo"><span>Estado</span><select name="vn.estado"><option value="borrador" ${fila.estado !== 'publicado' ? 'selected' : ''}>Borrador (solo docentes)</option><option value="publicado" ${fila.estado === 'publicado' ? 'selected' : ''}>Publicado (lo ven los estudiantes)</option></select></label></div>
         <p class="nota">Usa el modelo 3D y el comportamiento de <strong>${esc(nombreBase(mod, k))}</strong>. Lo que dejes vacío toma el texto de ese caso original.</p></fieldset>`
    : `<h3>${esc(nombreBase(mod, k))} · ${MODS[mod].nombre} · caso original</h3><p class="nota">Los cambios que guardes los ven todos los estudiantes. Lo que dejes vacío vuelve al texto original.</p>`;
  F.innerHTML = cab + (mod === 'tepsi' ? camposTepsi(d, o) : camposRN(d, o)) +
    `<fieldset><legend>Imágenes del caso</legend><div class="vn-adj" id="vnAdj"></div>
       <label class="campo"><span>Biblioteca</span><select id="vnAdjSel"></select></label>
       <p class="nota">Las imágenes se suben en la pestaña Imágenes. Recuerda guardar el caso después de agregar o quitar.</p></fieldset>
     <div class="doc-acc"><button type="submit" class="btn btn-primario">${esVar ? 'Guardar' : 'Guardar para todos'}</button>
       ${esVar ? '<button type="button" class="btn" id="vnVer">Ver como estudiante</button><button type="button" class="btn vn-peligro" id="vnBorrar">Eliminar caso</button>' : '<button type="button" class="btn" id="vnRest">Restaurar original</button>'}
       <span class="doc-estado" id="vnEstado" role="status"></span></div>`;
  if (!E.medios.length) { try { E.medios = (await api('/api/medios')).medios || []; } catch (e) {} }
  if (!mismo(E.ed, ed)) return;
  pintarAdjuntos(copia(fila ? fila.medios || [] : []));
  if (esVar) { $('#vnVer').onclick = () => verComoEstudiante(mod, ed.id); $('#vnBorrar').onclick = () => borrarCaso(ed); }
  else { $('#vnRest').onclick = () => restaurar(ed); $('#vnRest').disabled = !fila; }
  F.scrollTop = 0;
}
function recoger(mod, k) {
  const d = originales(mod, k);
  for (const el of $('#vnForm').querySelectorAll('[name]')) {
    const ruta = el.name.split('.'), v = el.value.trim();
    if (ruta[0] === 'vn') continue;
    if (mod === 'tepsi' && ruta[0] === 'conducta') { d.conducta = d.conducta || {}; if (v) d.conducta[ruta[1]] = v; else delete d.conducta[ruta[1]]; continue; }
    if (mod === 'rn' && ruta[0] === 'ficha') { d.ficha[+ruta[1]][1] = v; continue; }
    if (mod === 'rn' && ruta[0] === 'clave') { if (v === 'sim') delete d.clave[ruta[1]]; else d.clave[ruta[1]] = v; continue; }
    let o = d; for (let i = 0; i < ruta.length - 1; i++) o = o[ruta[i]]; o[ruta[ruta.length - 1]] = v;
  }
  return d;
}
async function guardarCaso(e) {
  e.preventDefault();
  const ed = E.ed; if (!ed || ed.tipo === 'nuevo') return;
  const F = $('#vnForm'), st = $('#vnEstado'), b = F.querySelector('[type=submit]'), esVar = ed.tipo === 'var';
  const fila = esVar ? porId(ed.id) : null, k = esVar ? fila.base : ed.k;
  const cuerpo = { modulo: ed.mod, base: k, es_base: !esVar, datos: recoger(ed.mod, k), medios: ($('#vnAdj')._lista || []).map(m => ({ id: m.id, leyenda: m.leyenda })),
    titulo: esVar ? F.elements['vn.titulo'].value.trim() : nombreBase(ed.mod, k), estado: esVar ? F.elements['vn.estado'].value : 'publicado' };
  b.disabled = true; st.className = 'doc-estado'; st.textContent = 'Guardando…';
  try {
    await api(esVar ? '/api/casos?id=' + ed.id : '/api/casos', esVar ? 'PUT' : 'POST', cuerpo);
    await recargar(); pintarLista();
    if (!esVar) $('#vnRest').disabled = false;
    st.textContent = !esVar ? 'Guardado. Los estudiantes ya ven este cambio.' : cuerpo.estado === 'publicado' ? 'Guardado y publicado para los estudiantes.' : 'Guardado como borrador. Los estudiantes aún no lo ven.';
  } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
  b.disabled = false;
}
async function restaurar(ed) {
  const fila = baseDe(ed.mod, ed.k); if (!fila) return;
  if (!confirm('¿Volver a los datos originales de este caso? Se borran los cambios guardados para todos, incluidas sus imágenes adjuntas.')) return;
  try { await api('/api/casos?id=' + fila.id, 'DELETE', {}); await recargar(); await abrirCaso(ed); $('#vnEstado').textContent = 'Caso restaurado al original.'; }
  catch (err) { $('#vnEstado').className = 'doc-estado vn-error'; $('#vnEstado').textContent = err.message; }
}
async function borrarCaso(ed) {
  const fila = porId(ed.id); if (!fila) return;
  if (!confirm(`¿Eliminar el caso "${fila.titulo}"? Esta acción no se puede deshacer.`)) return;
  try { await api('/api/casos?id=' + ed.id, 'DELETE', {}); E.ed = null; await recargar(); irTab('casos'); }
  catch (err) { $('#vnEstado').className = 'doc-estado vn-error'; $('#vnEstado').textContent = err.message; }
}
function verComoEstudiante(mod, id) {
  cerrarPanel();
  const ir = document.querySelector(`[data-ir="${mod}"]`); if (ir) ir.click();
  activar(mod, id);
}
function formNuevo() {
  E.ed = { tipo: 'nuevo' }; pintarLista();
  const F = $('#vnForm');
  const fuentes = mod => MODS[mod].doc().casos().map(c => `<option value="b:${c.k}">${esc(c.nombre)} (original)</option>`).join('') + variantes(mod).map(v => `<option value="v:${v.id}">${esc(v.titulo)}</option>`).join('');
  F.innerHTML = `<h3>Nuevo caso</h3>
    <fieldset><legend>Punto de partida</legend><div class="doc-grid">
      <label class="campo"><span>Evaluación</span><select name="vn.mod">${Object.keys(MODS).filter(m => MODS[m].doc()).map(m => `<option value="${m}">${MODS[m].nombre}</option>`).join('')}</select></label>
      <label class="campo"><span>Crear a partir de</span><select name="vn.fuente"></select></label>
      ${campo('Título del caso nuevo', 'vn.titulo', '')}</div>
      <p class="nota">El caso nuevo parte como copia del que elijas y usa su modelo 3D y su comportamiento. Después editas la historia, las respuestas, el cierre y las imágenes. Queda como borrador hasta que lo publiques.</p></fieldset>
    <div class="doc-acc"><button type="submit" class="btn btn-primario">Crear caso</button><span class="doc-estado" id="vnEstado" role="status"></span></div>`;
  const sm = F.elements['vn.mod'], sf = F.elements['vn.fuente'];
  const llenar = () => { sf.innerHTML = fuentes(sm.value); }; sm.onchange = llenar; llenar();
  F.elements['vn.titulo'].focus();
}
async function crearCaso(e) {
  e.preventDefault();
  const F = $('#vnForm'), st = $('#vnEstado'), mod = F.elements['vn.mod'].value, [tipo, ref] = F.elements['vn.fuente'].value.split(':'), titulo = F.elements['vn.titulo'].value.trim();
  if (!titulo) { st.className = 'doc-estado vn-error'; st.textContent = 'Ponle un título al caso.'; F.elements['vn.titulo'].focus(); return; }
  const fuente = tipo === 'v' ? porId(ref) : null, k = fuente ? fuente.base : ref, fb = baseDe(mod, k);
  const datos = copia(fuente ? fuente.datos : fb ? fb.datos : originales(mod, k));
  st.className = 'doc-estado'; st.textContent = 'Creando…';
  try {
    const j = await api('/api/casos', 'POST', { modulo: mod, base: k, es_base: false, titulo, estado: 'borrador', datos, medios: [] });
    await recargar(); await abrirCaso({ tipo: 'var', mod, id: j.id });
    $('#vnEstado').textContent = 'Caso creado como borrador. Edítalo y publícalo cuando esté listo.';
  } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
}

/* ---- Pestaña Imágenes ---- */
const kb = n => n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
async function comprimir(file) {
  const bmp = await createImageBitmap(file), f = Math.min(1, 1800 / Math.max(bmp.width, bmp.height));
  const cv = document.createElement('canvas'); cv.width = Math.round(bmp.width * f); cv.height = Math.round(bmp.height * f);
  const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0, cv.width, cv.height);
  const aBlob = (t, q) => new Promise(r => cv.toBlob(r, t, q));
  let blob = await aBlob('image/webp', .86);
  if (!blob || blob.type !== 'image/webp') { cx.globalCompositeOperation = 'destination-over'; cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); blob = await aBlob('image/jpeg', .86); }
  const b64 = await new Promise((ok, mal) => { const fr = new FileReader(); fr.onload = () => ok(String(fr.result).split(',')[1]); fr.onerror = mal; fr.readAsDataURL(blob); });
  return { tipo: blob.type, base64: b64 };
}
async function subir(files) {
  const st = $('#vnSubEstado'), lista = [...files].filter(f => /^image\//.test(f.type));
  if (!lista.length) { st.className = 'doc-estado vn-error'; st.textContent = 'Elige archivos de imagen (JPG, PNG o WebP).'; return; }
  st.className = 'doc-estado'; let ok = 0; const fallas = [];
  for (const f of lista) {
    st.textContent = `Subiendo ${ok + fallas.length + 1} de ${lista.length}…`;
    try { const c = await comprimir(f); await api('/api/medios', 'POST', { nombre: f.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 150), alt: '', tipo: c.tipo, base64: c.base64 }); ok++; }
    catch (err) { fallas.push(f.name); }
  }
  st.className = fallas.length ? 'doc-estado vn-error' : 'doc-estado';
  st.textContent = `${ok} ${ok === 1 ? 'imagen subida' : 'imágenes subidas'}.` + (fallas.length ? ` No se pudo subir: ${fallas.join(', ')}.` : ' Escribe una descripción para cada una.');
  await cargarMedios();
}
async function cargarMedios() {
  const G = $('#vnGrilla');
  try { E.medios = (await api('/api/medios')).medios || []; } catch (err) { G.innerHTML = `<p class="vn-vacio vn-error">${esc(err.message)}</p>`; return; }
  G.innerHTML = E.medios.length ? E.medios.map(m => `<article class="vn-img" data-id="${m.id}"><img src="${urlImg(m.id)}" alt="${esc(m.alt || m.nombre)}" loading="lazy">
      ${campo('Nombre', 'nombre', m.nombre)}${campo('Descripción (texto alternativo)', 'alt', m.alt, 'area', 2)}
      <div class="vn-fila"><span>${kb(m.tamano)} · ${m.usos ? `en ${m.usos} ${m.usos === 1 ? 'caso' : 'casos'}` : 'sin usar'}${m.alt ? '' : ' · <strong class="vn-error">falta descripción</strong>'}</span></div>
      <div class="vn-fila"><button type="button" class="btn" data-acc="guardar">Guardar</button><button type="button" class="btn vn-peligro" data-acc="borrar">Eliminar</button></div></article>`).join('')
    : '<p class="vn-vacio">Aún no hay imágenes. Sube ecografías, carnés de control, curvas de crecimiento u otros documentos y luego adjúntalos a un caso en la pestaña Casos.</p>';
  G.querySelectorAll('[data-acc]').forEach(b => b.onclick = async () => {
    const art = b.closest('.vn-img'), id = art.dataset.id, m = E.medios.find(x => x.id === id), st = $('#vnSubEstado');
    try {
      if (b.dataset.acc === 'guardar') { await api('/api/medios?id=' + id, 'PUT', { nombre: art.querySelector('[name=nombre]').value, alt: art.querySelector('[name=alt]').value }); st.className = 'doc-estado'; st.textContent = 'Imagen actualizada.'; }
      else { if (!confirm(m.usos ? `Esta imagen está en ${m.usos} ${m.usos === 1 ? 'caso' : 'casos'}. Si la eliminas, desaparece de ahí también. ¿Eliminar?` : '¿Eliminar esta imagen?')) return; await api('/api/medios?id=' + id, 'DELETE', {}); }
      await cargarMedios(); await recargar();
    } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
  });
}

/* ---- Pestaña Docentes ---- */
async function cargarDocentes() {
  const T = $('#vnDocentes');
  try {
    const { docentes } = await api('/api/auth?lista=1');
    T.innerHTML = `<table class="vn-tabla"><thead><tr><th>Nombre</th><th>Correo</th><th>Desde</th></tr></thead><tbody>${docentes.map(d => `<tr><td>${esc(d.nombre)}</td><td>${esc(d.email)}</td><td>${new Date(d.creado).toLocaleDateString('es-CL')}</td></tr>`).join('')}</tbody></table>`;
  } catch (err) { T.innerHTML = `<p class="vn-vacio vn-error">${esc(err.message)}</p>`; }
}

/* ================= Montaje ================= */
function montar() {
  document.body.insertAdjacentHTML('beforeend', `
<section class="docente vn-panel" id="vnPanel" hidden aria-labelledby="vnTit">
  <div class="vn-cab">
    <h2 id="vnTit" tabindex="-1">Panel docente</h2>
    <span class="vn-quien" id="vnQuien"></span>
    <button type="button" class="btn" id="vnSalir">Cerrar sesión</button>
    <button type="button" class="btn" id="vnCerrar">Volver al simulador</button>
    <div class="vn-tabs" role="tablist" aria-label="Secciones del panel">
      <button type="button" class="vn-tab" role="tab" data-tab="casos" aria-controls="vn-casos">Casos</button>
      <button type="button" class="vn-tab" role="tab" data-tab="imagenes" aria-controls="vn-imagenes">Imágenes</button>
      <button type="button" class="vn-tab" role="tab" data-tab="docentes" aria-controls="vn-docentes">Docentes</button>
    </div>
  </div>
  <div class="vn-vista" id="vn-casos" role="tabpanel"><div class="doc-cuerpo"><nav class="doc-lista" id="vnLista" aria-label="Casos"></nav><form class="doc-form" id="vnForm" autocomplete="off"></form></div></div>
  <div class="vn-vista" id="vn-imagenes" role="tabpanel" hidden><div class="vn-scroll">
    <div class="vn-subir" id="vnSubir"><p>Arrastra imágenes aquí o elígelas desde tu equipo. Se reducen automáticamente antes de subir. No subas imágenes de pacientes reales sin anonimizar.</p>
      <label class="btn btn-primario">Elegir imágenes<input type="file" id="vnArchivo" accept="image/*" multiple hidden></label></div>
    <span class="doc-estado" id="vnSubEstado" role="status"></span>
    <div class="vn-grilla" id="vnGrilla"></div></div></div>
  <div class="vn-vista" id="vn-docentes" role="tabpanel" hidden><div class="vn-scroll">
    <p class="vn-vacio">Estas personas pueden editar casos e imágenes. Para sumar a alguien, compártele el código de invitación del Centro: con él crea su cuenta desde el botón Docente.</p>
    <div id="vnDocentes"></div></div></div>
</section>
<dialog class="vn-dlg" id="vnDlgLogin" aria-labelledby="vnLoginTit"><form id="vnLoginForm">
  <h3 id="vnLoginTit">Ingreso docente</h3><p id="vnLoginAyuda"></p>
  <label class="campo" data-reg hidden><span>Nombre y apellido</span><input type="text" name="nombre" autocomplete="name" maxlength="120"></label>
  <label class="campo"><span>Correo</span><input type="email" name="email" autocomplete="email" required></label>
  <label class="campo"><span id="vnLoginPassEtq">Contraseña (mínimo 8 caracteres)</span><input type="password" name="password" id="vnLoginPass" minlength="8" required></label>
  <label class="campo" data-reg hidden><span>Código de invitación</span><input type="text" name="codigo" autocomplete="off"></label>
  <button type="button" class="vn-link vn-olvido" id="vnLoginOlvido">¿Olvidaste tu contraseña?</button>
  <span class="doc-estado" id="vnLoginEstado" role="status"></span>
  <div class="vn-acc"><button type="button" class="vn-link" id="vnLoginCambio"></button><button type="button" class="btn" id="vnLoginNo">Cancelar</button><button type="submit" class="btn btn-primario" id="vnLoginOk">Entrar</button></div>
</form></dialog>
<dialog class="vn-dlg ancho" id="vnDlgDocs" aria-labelledby="vnDocsTit"><div class="vn-dlg-in">
  <h3 id="vnDocsTit">Documentos del caso</h3><div class="vn-galeria" id="vnGaleria"></div>
  <div class="vn-acc"><button type="button" class="btn btn-primario" id="vnDocsCerrar">Cerrar</button></div>
</div></dialog>`);
  const db = $('#docenteBtn');
  db.insertAdjacentHTML('beforebegin', '<button class="inicio-btn" id="vnDocs" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m3 16 5-5 4 4 3-3 6 6"/><circle cx="15.5" cy="9" r="1.5"/></svg><span id="vnDocsN">Documentos</span></button>');
  db.hidden = false; db.setAttribute('aria-label', 'Panel docente');
  db.onclick = () => esDoc() ? abrirPanel() : abrirLogin();
  $('#vnDocs').onclick = abrirDocs; $('#vnDocsCerrar').onclick = () => $('#vnDlgDocs').close();
  $('#vnCerrar').onclick = () => { cerrarPanel(); db.focus(); }; $('#vnSalir').onclick = salir;
  X.alMontar.forEach(f => f());
  $('.vn-tabs').addEventListener('click', e => { const b = e.target.closest('.vn-tab'); if (b) irTab(b.dataset.tab); });
  $('.vn-tabs').addEventListener('keydown', e => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const t = [...document.querySelectorAll('.vn-tab')], i = t.indexOf(document.activeElement); if (i < 0) return; const n = t[(i + (e.key === 'ArrowRight' ? 1 : t.length - 1)) % t.length]; n.focus(); n.click(); });
  $('#vnForm').onsubmit = e => E.ed && E.ed.tipo === 'nuevo' ? crearCaso(e) : guardarCaso(e);
  $('#vnLoginForm').onsubmit = enviarLogin; $('#vnLoginNo').onclick = () => $('#vnDlgLogin').close();
  $('#vnLoginCambio').onclick = () => abrirLogin(LOGIN[$('#vnDlgLogin').dataset.modo].a);
  $('#vnLoginOlvido').onclick = () => abrirLogin('recuperar');
  $('#vnArchivo').onchange = e => { subir(e.target.files); e.target.value = ''; };
  const Z = $('#vnSubir');
  Z.ondragover = e => { e.preventDefault(); Z.classList.add('sobre'); }; Z.ondragleave = () => Z.classList.remove('sobre');
  Z.ondrop = e => { e.preventDefault(); Z.classList.remove('sobre'); subir(e.dataTransfer.files); };
  addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#vnPanel').hidden && !document.querySelector('dialog[open]')) { cerrarPanel(); db.focus(); } });
  new MutationObserver(pintarBotonDocs).observe(document.body, { attributes: true, attributeFilter: ['data-modulo'] });
  for (const mod in MODS) vigilar(mod);
}

// Puntos de extensión para js/vsim-aula.js (secciones, asignaciones y resultados).
// El modo docente del examen físico (administrar imágenes por zona) sigue la sesión del panel.
function sincronizarExfis() { if (window.EXFIS && EXFIS.modoDocente) EXFIS.modoDocente(esDoc()); }
const X = { E, MODS, $, esc, api, esDoc, porId, baseDe, variantes, nombreBase: (m, k) => nombreBase(m, k), enPantalla, irCaso, irTab: t => irTab(t), abrirPanel: () => abrirPanel(), tabs: {}, alDecorar: [], alMontar: [], alSesion: [] };
window.VSIM = { variante: mod => E.activa[mod] || null, _: X };
X.alSesion.push(sincronizarExfis);
(async () => {
  if (!window.TEPSI_DOC && !window.RN_DOC) return;
  let j;
  try { j = await api('/api/auth'); } catch (e) { return; } // sin servidor configurado: el simulador sigue igual
  E.usuario = j.usuario;
  montar();
  sincronizarExfis();
  revisarEnlaceClave();
  try { await recargar(); } catch (e) {}
})();
})();
