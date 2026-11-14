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
const E = { usuario: null, casos: [], medios: [], activa: { tepsi: null, rn: null }, interno: false, ed: null, eds: {}, vista: 'tepsi', sub: { tepsi: 'casos', rn: 'casos' }, exfis: [], zona: null };
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
  ir(E.vista); $('#vnTit').focus();
}
function cerrarPanel() { $('#vnPanel').hidden = true; }
// El panel se ordena como la portada del estudiante: una entrada por evaluación, más el aula.
const EVAL = {
  tepsi: { tit: 'TEPSI', desc: 'Casos e imágenes de «Preescolar de 2 a 5 años», tal como los abre el estudiante.' },
  rn: { tit: 'Reflejos del recién nacido', desc: 'Casos e imágenes del examen de reflejos primitivos.' }
};
const VISTAS = ['tepsi', 'rn', 'exfis', 'secciones', 'docentes'];
function ir(vista, sub) {
  if (!VISTAS.includes(vista)) vista = 'tepsi';
  E.vista = vista; if (sub && MODS[vista]) E.sub[vista] = sub;
  document.querySelectorAll('.vn-nav-it[data-vista]').forEach(b => { if (b.dataset.vista === vista) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
  const cont = MODS[vista] ? 'eval' : vista;
  document.querySelectorAll('.vn-vista').forEach(v => v.hidden = v.id !== 'vn-' + cont);
  $('#vnCuenta').hidden = true; $('#vnCuentaBtn').setAttribute('aria-expanded', 'false');
  if (MODS[vista]) renderEval();
  else if (vista === 'exfis') renderExfis();
  else if (vista === 'docentes') cargarDocentes();
  if (X.tabs[vista]) X.tabs[vista]();
}
function renderEval() {
  const mod = E.vista, sub = E.sub[mod];
  $('#vnEvalTit').textContent = EVAL[mod].tit; $('#vnEvalDesc').textContent = EVAL[mod].desc;
  document.querySelectorAll('#vn-eval .vn-tab').forEach(b => { const on = b.dataset.sub === sub; b.setAttribute('aria-selected', on); b.tabIndex = on ? 0 : -1; });
  $('#vn-sub-casos').hidden = sub !== 'casos'; $('#vn-sub-imagenes').hidden = sub !== 'imagenes';
  if (sub === 'imagenes') return cargarMedios();
  const ed = E.eds[mod] || { tipo: 'base', mod, k: MODS[mod].doc().casos()[0].k };
  if (ed.tipo === 'nuevo') formNuevo(); else abrirCaso(ed);
}

/* ---- Pestaña Casos ---- */
const mismo = (a, b) => a && b && a.tipo === b.tipo && a.mod === b.mod && a.k === b.k && a.id === b.id;
function pintarLista() {
  const L = $('#vnLista'), mod = E.vista, doc = MODS[mod] && MODS[mod].doc(); if (!doc) return;
  const it = (ed, txt, extra) => `<button type="button" class="doc-it${mismo(E.ed, ed) ? ' on' : ''}" data-ed='${esc(JSON.stringify(ed))}'>${esc(txt)}${extra}</button>`;
  let h = '<p class="doc-grupo">Originales</p>';
  for (const c of doc.casos()) h += it({ tipo: 'base', mod, k: c.k }, c.nombre, baseDe(mod, c.k) ? '<small>Editado</small>' : '');
  const vs = variantes(mod);
  h += '<p class="doc-grupo">Casos nuevos</p>' + (vs.length ? '' : '<p class="nota vn-sin">Aún no hay. Crea uno con «Nuevo caso».</p>');
  for (const v of vs) h += it({ tipo: 'var', mod, id: v.id }, v.titulo, `<span class="vn-etq ${v.estado === 'publicado' ? 'pub' : 'bor'}">${v.estado === 'publicado' ? 'Publicado' : 'Borrador'}</span>`);
  L.innerHTML = h;
  L.querySelectorAll('.doc-it').forEach(b => b.onclick = () => abrirCaso(JSON.parse(b.dataset.ed)));
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
  const S = $('#vnAdjSel'), libres = E.medios.filter(m => m.modulo === E.vista && !lista.some(x => x.id === m.id));
  S.innerHTML = '<option value="">Agregar imagen de la biblioteca…</option>' + libres.map(m => `<option value="${m.id}">${esc(m.nombre)}</option>`).join('');
  S.disabled = !libres.length;
  S.onchange = () => { const m = E.medios.find(x => x.id === S.value); if (m) { lista.push({ id: m.id, nombre: m.nombre, alt: m.alt, leyenda: m.alt || '' }); pintarAdjuntos(lista); } };
}
async function abrirCaso(ed) {
  E.ed = ed; E.eds[ed.mod] = ed; pintarLista();
  const F = $('#vnForm'), mod = ed.mod, esVar = ed.tipo === 'var';
  const fila = esVar ? porId(ed.id) : baseDe(mod, ed.k);
  if (esVar && !fila) { E.ed = null; delete E.eds[mod]; return ir(mod, 'casos'); }
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
       <p class="nota">Las imágenes se suben en la pestaña Imágenes de esta evaluación. Recuerda guardar el caso después de agregar o quitar.</p></fieldset>
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
  try { await api('/api/casos?id=' + ed.id, 'DELETE', {}); E.ed = null; delete E.eds[ed.mod]; await recargar(); ir(ed.mod, 'casos'); }
  catch (err) { $('#vnEstado').className = 'doc-estado vn-error'; $('#vnEstado').textContent = err.message; }
}
function verComoEstudiante(mod, id) {
  cerrarPanel();
  const ir = document.querySelector(`[data-ir="${mod}"]`); if (ir) ir.click();
  activar(mod, id);
}
function formNuevo() {
  const mod = E.vista; E.ed = E.eds[mod] = { tipo: 'nuevo', mod }; pintarLista();
  const F = $('#vnForm');
  const fuentes = mod => MODS[mod].doc().casos().map(c => `<option value="b:${c.k}">${esc(c.nombre)} (original)</option>`).join('') + variantes(mod).map(v => `<option value="v:${v.id}">${esc(v.titulo)}</option>`).join('');
  F.innerHTML = `<h3>Nuevo caso</h3>
    <fieldset><legend>Punto de partida</legend><div class="doc-grid">
      <input type="hidden" name="vn.mod" value="${mod}">
      <label class="campo"><span>Crear a partir de</span><select name="vn.fuente"></select></label>
      ${campo('Título del caso nuevo', 'vn.titulo', '')}</div>
      <p class="nota">El caso nuevo parte como copia del que elijas y usa su modelo 3D y su comportamiento. Después editas la historia, las respuestas, el cierre y las imágenes. Queda como borrador hasta que lo publiques.</p></fieldset>
    <div class="doc-acc"><button type="submit" class="btn btn-primario">Crear caso</button><span class="doc-estado" id="vnEstado" role="status"></span></div>`;
  const sm = F.elements['vn.mod'], sf = F.elements['vn.fuente'];
  sf.innerHTML = fuentes(sm.value);
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
    try { const c = await comprimir(f); await api('/api/medios', 'POST', { nombre: f.name.replace(/\.[a-z0-9]+$/i, '').slice(0, 150), alt: '', tipo: c.tipo, base64: c.base64, modulo: E.vista }); ok++; }
    catch (err) { fallas.push(f.name); }
  }
  st.className = fallas.length ? 'doc-estado vn-error' : 'doc-estado';
  st.textContent = `${ok} ${ok === 1 ? 'imagen subida' : 'imágenes subidas'}.` + (fallas.length ? ` No se pudo subir: ${fallas.join(', ')}.` : ' Escribe una descripción para cada una.');
  await cargarMedios();
}
async function cargarMedios() {
  const G = $('#vnGrilla');
  try { E.medios = (await api('/api/medios')).medios || []; } catch (err) { G.innerHTML = `<p class="vn-vacio vn-error">${esc(err.message)}</p>`; return; }
  const lista = E.medios.filter(m => m.modulo === E.vista);
  G.innerHTML = lista.length ? lista.map(m => `<article class="vn-img" data-id="${m.id}"><img src="${urlImg(m.id)}" alt="${esc(m.alt || m.nombre)}" loading="lazy">
      ${campo('Nombre', 'nombre', m.nombre)}${campo('Descripción (texto alternativo)', 'alt', m.alt, 'area', 2)}
      <div class="vn-fila"><span>${kb(m.tamano)} · ${m.usos ? `en ${m.usos} ${m.usos === 1 ? 'caso' : 'casos'}` : 'sin usar'}${m.alt ? '' : ' · <strong class="vn-error">falta descripción</strong>'}</span></div>
      <div class="vn-fila"><button type="button" class="btn" data-acc="guardar">Guardar</button><button type="button" class="btn vn-peligro" data-acc="borrar">Eliminar</button></div></article>`).join('')
    : '<p class="vn-vacio">Aún no hay imágenes. Sube ecografías, carnés de control, curvas de crecimiento u otros documentos y luego adjúntalos a un caso en la pestaña Casos de esta evaluación.</p>';
  G.querySelectorAll('[data-acc]').forEach(b => b.onclick = async () => {
    const art = b.closest('.vn-img'), id = art.dataset.id, m = E.medios.find(x => x.id === id), st = $('#vnSubEstado');
    try {
      if (b.dataset.acc === 'guardar') { await api('/api/medios?id=' + id, 'PUT', { nombre: art.querySelector('[name=nombre]').value, alt: art.querySelector('[name=alt]').value }); st.className = 'doc-estado'; st.textContent = 'Imagen actualizada.'; }
      else { if (!confirm(m.usos ? `Esta imagen está en ${m.usos} ${m.usos === 1 ? 'caso' : 'casos'}. Si la eliminas, desaparece de ahí también. ¿Eliminar?` : '¿Eliminar esta imagen?')) return; await api('/api/medios?id=' + id, 'DELETE', {}); }
      await cargarMedios(); await recargar();
    } catch (err) { st.className = 'doc-estado vn-error'; st.textContent = err.message; }
  });
}

/* ---- Examen físico: imágenes por zona ---- */
async function cargarExfis() {
  try { E.exfis = (await api('/api/medios?exfis=1')).imagenes || []; } catch (e) { return; }
  if (!window.EXFIS || !EXFIS.imagenes) return;
  const d = {}; for (const i of E.exfis) (d[i.zona] = d[i.zona] || []).push({ src: urlImg(i.medio_id), titulo: i.titulo, esNormal: i.es_normal });
  EXFIS.imagenes(d);
}
const TIPOS_EF = es => `<option value="1" ${es ? 'selected' : ''}>Hallazgo normal</option><option value="0" ${es ? '' : 'selected'}>Signo de alerta</option>`;
function renderExfis() {
  const L = $('#vnZonas'), zonas = window.EXFIS && EXFIS.zonas ? EXFIS.zonas() : [];
  if (!zonas.length) { L.innerHTML = ''; $('#vnZona').innerHTML = '<p class="vn-vacio">El módulo de examen físico no está disponible en esta página.</p>'; return; }
  if (!zonas.some(z => z.id === E.zona)) E.zona = zonas[0].id;
  L.innerHTML = '<p class="doc-grupo">Zonas del examen</p>' + zonas.map(z => { const n = E.exfis.filter(i => i.zona === z.id).length; return `<button type="button" class="doc-it${z.id === E.zona ? ' on' : ''}" data-zona="${z.id}">${esc(z.nombre)}${n ? `<span class="vn-etq pub">${n}</span>` : ''}</button>`; }).join('');
  L.querySelectorAll('[data-zona]').forEach(b => b.onclick = () => { E.zona = b.dataset.zona; renderExfis(); });
  const z = zonas.find(x => x.id === E.zona), imgs = E.exfis.filter(i => i.zona === z.id), C = $('#vnZona');
  C.innerHTML = `<h3>${esc(z.nombre)}</h3>
    <p class="nota">El estudiante ve estas imágenes al revisar la zona y responde si cada una es un hallazgo normal o un signo de alerta. Los textos de hallazgos y signos de alerta de la zona no se editan aquí.</p>
    <fieldset><legend>Imágenes de la zona</legend><div class="vn-adj">${imgs.length ? imgs.map(i => `<div class="vn-adj-it vn-ef" data-id="${i.id}"><img src="${urlImg(i.medio_id)}" alt="${esc(i.titulo)}" loading="lazy">
        <div class="doc-grid">${campo('Descripción que lee el estudiante', 'titulo', i.titulo)}<label class="campo"><span>Respuesta correcta</span><select name="tipo">${TIPOS_EF(i.es_normal)}</select></label></div>
        <div class="vn-fila"><button type="button" class="btn" data-acc="guardar">Guardar</button><button type="button" class="btn vn-peligro" data-acc="quitar">Eliminar</button></div></div>`).join('') : '<p class="nota">Esta zona aún no tiene imágenes.</p>'}</div></fieldset>
    <form class="vn-ef-nueva" id="vnEfNueva"><fieldset><legend>Agregar imagen</legend><div class="doc-grid">
        <label class="campo"><span>Archivo de imagen</span><input type="file" name="archivo" accept="image/*" required></label>
        ${campo('Descripción que lee el estudiante', 'titulo', '')}
        <label class="campo"><span>Respuesta correcta</span><select name="tipo">${TIPOS_EF(true)}</select></label></div>
      <p class="nota">No subas imágenes de pacientes reales sin anonimizar.</p>
      <div class="doc-acc"><button type="submit" class="btn btn-primario">Agregar imagen</button><span class="doc-estado" id="vnEfEstado" role="status"></span></div></fieldset></form>`;
  const st = () => $('#vnEfEstado'), falla = err => { st().className = 'doc-estado vn-error'; st().textContent = err.message; };
  C.querySelectorAll('.vn-ef [data-acc]').forEach(b => b.onclick = async () => {
    const fila = b.closest('.vn-ef'), id = fila.dataset.id;
    try {
      if (b.dataset.acc === 'guardar') await api('/api/medios', 'POST', { accion: 'exfis_editar', id, titulo: fila.querySelector('[name=titulo]').value, es_normal: fila.querySelector('[name=tipo]').value === '1' });
      else { if (!confirm('¿Eliminar esta imagen de la zona?')) return; await api('/api/medios', 'POST', { accion: 'exfis_quitar', id }); }
      await cargarExfis(); renderExfis(); st().textContent = b.dataset.acc === 'guardar' ? 'Imagen actualizada.' : 'Imagen eliminada.';
    } catch (err) { falla(err); }
  });
  $('#vnEfNueva').onsubmit = async e => {
    e.preventDefault(); const f = e.target, archivo = f.archivo.files[0], titulo = f.titulo.value.trim(), boton = f.querySelector('[type=submit]');
    if (!archivo || !/^image\//.test(archivo.type)) return falla(new Error('Elige un archivo de imagen (JPG, PNG o WebP).'));
    if (!titulo) { f.titulo.focus(); return falla(new Error('Escribe una descripción: es lo que el estudiante lee junto a la imagen.')); }
    boton.disabled = true; st().className = 'doc-estado'; st().textContent = 'Subiendo…';
    try {
      const c = await comprimir(archivo);
      const m = await api('/api/medios', 'POST', { nombre: titulo.slice(0, 150), alt: titulo, tipo: c.tipo, base64: c.base64, modulo: 'exfis' });
      await api('/api/medios', 'POST', { accion: 'exfis_agregar', zona: z.id, medio_id: m.id, titulo, es_normal: f.tipo.value === '1' });
      await cargarExfis(); renderExfis(); st().textContent = 'Imagen agregada. Los estudiantes ya la ven en esta zona.';
    } catch (err) { falla(err); boton.disabled = false; }
  };
}

/* ---- Docentes (menú de cuenta) ---- */
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
  <nav class="vn-nav" aria-label="Panel docente">
    <h2 id="vnTit" tabindex="-1">Panel docente</h2>
    <p class="vn-grp">Evaluaciones</p>
    <button type="button" class="vn-nav-it" data-vista="tepsi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg><span>TEPSI<small>Preescolar de 2 a 5 años</small></span></button>
    <button type="button" class="vn-nav-it" data-vista="rn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="6" r="3"/><path d="M6 21c0-5 2.500-8 6-8s6 3 6 8M4 12l4 2M20 12l-4 2"/></svg><span>Reflejos<small>Recién nacido</small></span></button>
    <button type="button" class="vn-nav-it" data-vista="exfis"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6v4a3 3 0 0 1-6 0z"/><path d="M12 10v4a4 4 0 0 0 8 0v-2"/><circle cx="20" cy="10" r="2"/></svg><span>Examen físico<small>Recién nacido</small></span></button>
    <p class="vn-grp">Aula</p>
    <button type="button" class="vn-nav-it" data-vista="secciones"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.300 2.700-5.500 6-5.500s6 2.200 6 5.500M16 5.200a3.200 3.200 0 0 1 0 5.600M17.500 14.800c2.100.6 3.500 2.400 3.500 5.200"/></svg><span>Secciones<small>Asignar y ver resultados</small></span></button>
    <div class="vn-pie">
      <div class="vn-cuenta" id="vnCuenta" hidden><button type="button" class="vn-nav-it" data-vista="docentes">Docentes con acceso</button><button type="button" class="vn-nav-it" id="vnSalir">Cerrar sesión</button></div>
      <button type="button" class="vn-nav-it" id="vnCuentaBtn" aria-expanded="false" aria-controls="vnCuenta"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.600-6.500 8-6.500s8 2.500 8 6.500"/></svg><span id="vnQuien"></span></button>
      <button type="button" class="btn" id="vnCerrar">Volver al simulador</button>
    </div>
  </nav>
  <div class="vn-main">
    <div class="vn-vista" id="vn-eval" hidden>
      <header class="vn-enc"><div><h3 id="vnEvalTit"></h3><p id="vnEvalDesc"></p></div><button type="button" class="btn btn-primario" id="vnNuevo">Nuevo caso</button></header>
      <div class="vn-tabs" role="tablist" aria-label="Contenido de la evaluación"><button type="button" class="vn-tab" role="tab" data-sub="casos">Casos</button><button type="button" class="vn-tab" role="tab" data-sub="imagenes">Imágenes</button></div>
      <div class="vn-sub" id="vn-sub-casos"><div class="doc-cuerpo"><nav class="doc-lista" id="vnLista" aria-label="Casos"></nav><form class="doc-form" id="vnForm" autocomplete="off"></form></div></div>
      <div class="vn-sub" id="vn-sub-imagenes" hidden><div class="vn-scroll">
        <div class="vn-subir" id="vnSubir"><p>Arrastra imágenes aquí o elígelas desde tu equipo. Se reducen automáticamente antes de subir. No subas imágenes de pacientes reales sin anonimizar.</p>
          <label class="btn btn-primario">Elegir imágenes<input type="file" id="vnArchivo" accept="image/*" multiple hidden></label></div>
        <span class="doc-estado" id="vnSubEstado" role="status"></span>
        <div class="vn-grilla" id="vnGrilla"></div></div></div>
    </div>
    <div class="vn-vista" id="vn-exfis" hidden>
      <header class="vn-enc"><div><h3>Examen físico del recién nacido</h3><p>Imágenes clínicas por zona, tal como las ve el estudiante al recorrer el examen segmentario.</p></div></header>
      <div class="doc-cuerpo"><nav class="doc-lista" id="vnZonas" aria-label="Zonas"></nav><div class="doc-form" id="vnZona"></div></div>
    </div>
    <div class="vn-vista" id="vn-secciones" hidden></div>
    <div class="vn-vista" id="vn-docentes" hidden>
      <header class="vn-enc"><div><h3>Docentes con acceso</h3><p>Estas personas pueden editar casos, imágenes y secciones. Para sumar a alguien, compártele el código de invitación del Centro: con él crea su cuenta desde el botón Docente.</p></div></header>
      <div class="vn-scroll"><div id="vnDocentes"></div></div>
    </div>
  </div>
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
  const P = $('#vnPanel');
  P.addEventListener('click', e => {
    const v = e.target.closest('[data-vista]'); if (v) return ir(v.dataset.vista);
    const t = e.target.closest('#vn-eval .vn-tab'); if (t) ir(E.vista, t.dataset.sub);
  });
  P.addEventListener('keydown', e => { // flechas entre pestañas de un mismo grupo
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; const g = e.target.closest('.vn-tabs'); if (!g) return;
    const t = [...g.querySelectorAll('.vn-tab')], i = t.indexOf(document.activeElement); if (i < 0) return;
    const n = t[(i + (e.key === 'ArrowRight' ? 1 : t.length - 1)) % t.length]; n.focus(); n.click();
  });
  $('#vnCuentaBtn').onclick = () => { const m = $('#vnCuenta'); m.hidden = !m.hidden; $('#vnCuentaBtn').setAttribute('aria-expanded', String(!m.hidden)); };
  $('#vnNuevo').onclick = () => { ir(E.vista, 'casos'); formNuevo(); };
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
const X = { E, MODS, $, esc, api, esDoc, porId, baseDe, variantes, nombreBase: (m, k) => nombreBase(m, k), enPantalla, irCaso, ir: (v, s) => ir(v, s), abrirPanel: () => abrirPanel(), tabs: {}, alDecorar: [], alMontar: [], alSesion: [] };
window.VSIM = { variante: mod => E.activa[mod] || null, _: X };
(async () => {
  if (!window.TEPSI_DOC && !window.RN_DOC) return;
  let j;
  try { j = await api('/api/auth'); } catch (e) { return; } // sin servidor configurado: el simulador sigue igual
  E.usuario = j.usuario;
  montar();
  revisarEnlaceClave();
  try { await recargar(); } catch (e) {}
  cargarExfis();
})();
})();
