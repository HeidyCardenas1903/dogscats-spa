/* DogsCats Spa – interfaz del prototipo (enrutamiento por hash, sin dependencias) */
const $ = (s, el = document) => el.querySelector(s);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pesos = (n) => '$' + Number(n).toLocaleString('es-CO');
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const hoyISO = () => new Date().toISOString().slice(0, 10);

let usuario = null;
try { usuario = JSON.parse(sessionStorage.getItem('dc-sesion')); } catch { usuario = null; }
const setSesion = (u) => { usuario = u; try { u ? sessionStorage.setItem('dc-sesion', JSON.stringify(u)) : sessionStorage.removeItem('dc-sesion'); } catch {} };

function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('ver'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('ver'), 3200); }

const MENUS = {
  cliente: [['#/mascotas', 'Mis mascotas'], ['#/reservar', 'Reservar'], ['#/mis-citas', 'Mis citas'], ['#/correos', 'Notificaciones']],
  groomer: [['#/agenda-groomer', 'Mi agenda']],
  admin: [['#/agenda', 'Agenda'], ['#/catalogo', 'Catálogo'], ['#/disponibilidad', 'Disponibilidad'], ['#/reportes', 'Reportes']],
};
const INICIO = { cliente: '#/mascotas', groomer: '#/agenda-groomer', admin: '#/agenda' };

const I = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONOS = {
  '#/mascotas': I('<circle cx="5.5" cy="10" r="2"/><circle cx="9.5" cy="5.5" r="2"/><circle cx="14.5" cy="5.5" r="2"/><circle cx="18.5" cy="10" r="2"/><path d="M8 17.5c0-2.5 1.8-5 4-5s4 2.5 4 5c0 1.7-1.5 2.5-4 2.5s-4-.8-4-2.5z"/>'),
  '#/reservar': I('<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18M12 13.5v4M10 15.5h4"/>'),
  '#/mis-citas': I('<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18M8 15h3"/>'),
  '#/correos': I('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  '#/agenda-groomer': I('<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>'),
  '#/agenda': I('<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3 10h18"/>'),
  '#/catalogo': I('<path d="M4 6h16M4 12h16M4 18h10"/>'),
  '#/disponibilidad': I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  '#/reportes': I('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
};
function pintarCabecera() {
  const ruta = location.hash || '#/login';
  document.body.classList.toggle('sin-sesion', !usuario);
  $('#menu').innerHTML = usuario ? MENUS[usuario.rol].map(([h, t]) => `<a href="${h}" class="${ruta === h ? 'activo' : ''}">${ICONOS[h] || ''}<span>${t}</span></a>`).join('') : '';
  const ini = usuario ? usuario.nombre.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase() : '';
  $('#sesion').innerHTML = usuario ? `<div class="avatar-u">${esc(ini)}</div><span class="nombre">${esc(usuario.nombre)}<br><span class="rol">${usuario.rol}</span></span><button class="sec mini" id="salir">Salir</button>` : '';
  if (usuario) $('#salir').onclick = () => { setSesion(null); location.hash = '#/inicio'; };
}

async function router() {
  const ruta = location.hash || '#/inicio';
  if (ruta === '#/inicio') { pintarCabecera(); document.body.classList.add('sin-sesion'); return vLanding($('#app')); }
  if (!usuario && !['#/login', '#/registro'].includes(ruta)) { location.hash = '#/inicio'; return; }
  if (usuario && ['#/login', '#/registro'].includes(ruta)) { location.hash = INICIO[usuario.rol]; return; }
  const permitido = !usuario || MENUS[usuario.rol].some(([h]) => h === ruta);
  pintarCabecera();
  const vistas = { '#/login': vLogin, '#/registro': vRegistro, '#/mascotas': vMascotas, '#/reservar': vReservar, '#/mis-citas': vMisCitas,
    '#/correos': vCorreos, '#/agenda-groomer': vAgendaGroomer, '#/agenda': vAgenda, '#/catalogo': vCatalogo,
    '#/disponibilidad': vDisponibilidad, '#/reportes': vReportes };
  const v = vistas[ruta];
  if (!v || !permitido) { $('#app').innerHTML = `<div class="card"><h1>Acceso restringido</h1><p class="muted">Tu rol no tiene permiso para esta sección.</p></div>`; return; }
  await v($('#app'));
}

/* ---------- RF01: inicio de sesión y registro ---------- */
function vLogin(el) {
  el.innerHTML = `<div class="auth"><div class="auth-hero"><span class="burbuja" style="width:320px;height:320px;right:-90px;top:-90px"></span><span class="burbuja" style="width:200px;height:200px;left:-60px;bottom:-60px"></span>
    <div class="brand" style="color:#fff;padding:0"><img class="logo" src="img/logo-icono.png" alt="" style="background:#fff;padding:3px"> DogsCats Spa</div>
    <div><div class="pets">🐶🐱</div><h2>El spa de tu mascota, sin filas ni llamadas.</h2><p>Reserva baño, peluquería y cuidados en línea. Conectado con PetCare para que conozcamos a tu mascota antes de que llegue.</p></div>
    <p style="font-size:13px;opacity:.75">Prototipo funcional · Proyecto de software</p></div><div class="auth-form"><img src="img/logo.png" alt="Logo DogsCats Spa" class="auth-logo"><div class="login"><h1>Iniciar sesión</h1><p class="muted">Agenda el spa de tu mascota en minutos.</p>
    <form id="f" novalidate><label for="correo">Correo</label><input id="correo" type="email" autocomplete="username">
    <label for="clave">Contraseña</label><input id="clave" type="password" autocomplete="current-password">
    <div class="acciones"><button>Ingresar</button><a href="#/registro"><button type="button" class="sec">Crear cuenta</button></a></div>
    <div id="msg"></div></form>
    <p class=\"muted\" style=\"margin-top:22px;font-size:13.5px\"><a href=\"#/inicio\">← Volver a la presentación del demo</a></p></div></div></div>`;
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    const c = $('#correo'), k = $('#clave');
    c.classList.toggle('invalido', !c.value); k.classList.toggle('invalido', !k.value);
    try { setSesion(await Store.iniciarSesion(c.value, k.value)); toast(`Bienvenida(o), ${usuario.nombre}`); location.hash = INICIO[usuario.rol]; }
    catch (err) { $('#msg').innerHTML = `<div class="error">${esc(err.message)}</div>`; }
  };
}
function vRegistro(el) {
  el.innerHTML = `<div class="auth"><div class="auth-hero"><span class="burbuja" style="width:320px;height:320px;right:-90px;top:-90px"></span><span class="burbuja" style="width:200px;height:200px;left:-60px;bottom:-60px"></span>
    <div class="brand" style="color:#fff;padding:0"><img class="logo" src="img/logo-icono.png" alt="" style="background:#fff;padding:3px"> DogsCats Spa</div>
    <div><div class="pets">🐶🐱</div><h2>El spa de tu mascota, sin filas ni llamadas.</h2><p>Reserva baño, peluquería y cuidados en línea. Conectado con PetCare para que conozcamos a tu mascota antes de que llegue.</p></div>
    <p style="font-size:13px;opacity:.75">Prototipo funcional · Proyecto de software</p></div><div class="auth-form"><img src="img/logo.png" alt="Logo DogsCats Spa" class="auth-logo"><div class="login"><h1>Crear cuenta</h1><p class="muted">Usa el mismo correo con el que estás registrada(o) en PetCare para traer tus mascotas.</p>
    <form id="f" novalidate><label>Nombre completo</label><input id="nombre"><label>Correo</label><input id="correo" type="email">
    <label>Contraseña</label><input id="clave" type="password" placeholder="Mínimo 8 caracteres y un número">
    <div class="acciones"><button>Registrarme</button><a href="#/login"><button type="button" class="sec">Volver</button></a></div><div id="msg"></div></form></div></div></div>`;
  $('#f').onsubmit = async (e) => {
    e.preventDefault();
    try { setSesion(await Store.registrar({ nombre: $('#nombre').value.trim(), correo: $('#correo').value.trim(), clave: $('#clave').value }));
      toast('Cuenta creada'); location.hash = INICIO.cliente; }
    catch (err) { $('#msg').innerHTML = `<div class="error">${esc(err.message)}</div>`; }
  };
}

/* ---------- RF02: mascotas desde PetCare ---------- */
async function mascotasCliente() {
  const p = await PetCareAPI.buscarPropietarioPorCorreo(usuario.correo);
  return PetCareAPI.mascotasDePropietario(p.id);
}
function fichaMascota(m) {
  return `<div class="mascota"><div class="avatar">${m.especie === 'Gato' ? '🐱' : '🐶'}</div><div>
    <h2 style="margin:0">${esc(m.nombre)} <span class="tag">PetCare ${esc(m.id)}</span></h2>
    <div class="muted">${esc(m.especie)} · ${esc(m.raza)} · Tamaño ${esc(m.tamano)} · ${m.edad} años</div>
    ${m.alergias.length ? `<div class="alerta">⚠️ <b>Alergias:</b> ${m.alergias.map(esc).join(', ')}</div>` : '<div class="muted" style="margin-top:8px">Sin alergias registradas</div>'}
    <div style="margin-top:6px;font-size:14px"><b>Observaciones:</b> ${esc(m.observaciones || '—')}</div></div></div>`;
}
async function vMascotas(el) {
  el.innerHTML = `<h1>Mis mascotas</h1><p class="muted">Información consultada en línea desde la plataforma PetCare.</p><div id="lista"><div class="card muted">Consultando PetCare…</div></div>`;
  try {
    const ms = await mascotasCliente();
    $('#lista').innerHTML = ms.length ? `<div class="grid">${ms.map(m => `<div class="card">${fichaMascota(m)}
      <div class="acciones"><a href="#/reservar" data-m="${m.id}"><button class="mini">Reservar para ${esc(m.nombre)}</button></a></div></div>`).join('')}</div>`
      : '<div class="card">No tienes mascotas registradas en PetCare.</div>';
    el.querySelectorAll('[data-m]').forEach(a => a.onclick = () => sessionStorage.setItem('dc-mascota', a.dataset.m));
  } catch (err) {
    $('#lista').innerHTML = `<div class="card"><div class="error">No encontramos tu cuenta en PetCare (${esc(err.message)}). Registra a tus mascotas en PetCare con el correo <b>${esc(usuario.correo)}</b>.</div></div>`;
  }
}

/* ---------- RF05: reservas sin cruces ---------- */
async function vReservar(el) {
  let ms = [];
  try { ms = await mascotasCliente(); } catch { /* sin PetCare */ }
  const pre = sessionStorage.getItem('dc-mascota');
  const st = { mascota: ms.find(m => m.id === pre) || ms[0], servicioId: '', fecha: '', hora: '' };
  el.innerHTML = `<h1>Reservar un servicio</h1><p class="muted">Solo se muestran las horas libres. Una franja ocupada no se puede volver a reservar.</p>
    <div class="card"><div class="grid">
      <div><label>1. Mascota</label><select id="mascota">${ms.map(m => `<option value="${m.id}" ${st.mascota && m.id === st.mascota.id ? 'selected' : ''}>${esc(m.nombre)} (${esc(m.tamano)})</option>`).join('')}</select></div>
      <div><label>2. Servicio</label><select id="servicio"></select></div>
      <div><label>3. Fecha</label><input type="date" id="fecha" min="${hoyISO()}"></div></div>
      <label>4. Hora disponible</label><div id="horas" class="chips"><span class="muted">Elige servicio y fecha.</span></div>
      <div id="resumen"></div><div class="acciones"><button id="confirmar" disabled>Confirmar reserva</button></div><div id="msg"></div></div>`;
  if (!ms.length) { $('#msg').innerHTML = '<div class="error">Necesitas al menos una mascota registrada en PetCare para reservar.</div>'; return; }
  const pintarServicios = () => {
    const ss = Store.servicios(true).filter(s => s.tamanos.includes(st.mascota.tamano));
    $('#servicio').innerHTML = '<option value="">Selecciona…</option>' + ss.map(s => `<option value="${s.id}">${esc(s.nombre)} · ${s.duracion} min · ${pesos(s.precio)}</option>`).join('');
    st.servicioId = ''; pintarHoras();
  };
  const pintarHoras = () => {
    st.hora = '';
    if (!st.servicioId || !st.fecha) { $('#horas').innerHTML = '<span class="muted">Elige servicio y fecha.</span>'; return actualizar(); }
    const fr = Store.franjasDisponibles(st.fecha, st.servicioId);
    $('#horas').innerHTML = fr.length ? fr.map(f => `<button type="button" class="chip" data-h="${f.hora}">${f.hora}</button>`).join('')
      : '<span class="error" style="margin:0">No hay horarios disponibles ese día (cerrado, festivo o agenda llena).</span>';
    $('#horas').querySelectorAll('[data-h]').forEach(b => b.onclick = () => { st.hora = b.dataset.h; $('#horas').querySelectorAll('.chip').forEach(x => x.classList.toggle('sel', x === b)); actualizar(); });
    actualizar();
  };
  const actualizar = () => {
    const s = Store.servicios().find(x => x.id === st.servicioId);
    $('#confirmar').disabled = !(st.mascota && s && st.fecha && st.hora);
    $('#resumen').innerHTML = s && st.hora ? `<div class="exito">Resumen: <b>${esc(s.nombre)}</b> para <b>${esc(st.mascota.nombre)}</b> el <b>${st.fecha}</b> a las <b>${st.hora}</b> · ${pesos(s.precio)}</div>` : '';
  };
  $('#mascota').onchange = (e) => { st.mascota = ms.find(m => m.id === e.target.value); pintarServicios(); };
  $('#servicio').onchange = (e) => { st.servicioId = e.target.value; pintarHoras(); };
  $('#fecha').onchange = (e) => { st.fecha = e.target.value; pintarHoras(); };
  $('#confirmar').onclick = () => {
    try { const c = Store.reservar({ clienteId: usuario.id, mascota: st.mascota, servicioId: st.servicioId, fecha: st.fecha, hora: st.hora });
      el.innerHTML = `<div class="card"><h1>¡Reserva confirmada! 🎉</h1><p>${esc(c.servicio)} para <b>${esc(c.mascotaNombre)}</b> el <b>${c.fecha}</b> a las <b>${c.hora}</b> con ${esc(c.groomer)}.</p>
        <p class="muted">Código ${c.id}. Te enviamos la confirmación al correo y un recordatorio 24 horas antes.</p>
        <div class="acciones"><a href="#/mis-citas"><button>Ver mis citas</button></a><a href="#/correos"><button class="sec">Ver notificaciones</button></a></div></div>`;
    } catch (err) { $('#msg').innerHTML = `<div class="error">${esc(err.message)}</div>`; pintarHoras(); }
  };
  pintarServicios();
}

/* ---------- RF06: gestión de citas ---------- */
const filaEstado = (c) => `<span class="estado e-${c.estado}">${c.estado}</span>`;
function vMisCitas(el) {
  const cs = Store.citas({ clienteId: usuario.id });
  el.innerHTML = `<h1>Mis citas</h1><div class="card">${cs.length ? `<div class="tabla"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Mascota</th><th>Servicio</th><th>Groomer</th><th>Estado</th><th></th></tr></thead><tbody>
    ${cs.map(c => `<tr><td>${c.fecha}</td><td>${c.hora}</td><td>${esc(c.mascotaNombre)}</td><td>${esc(c.servicio)}</td><td>${esc(c.groomer)}</td><td>${filaEstado(c)}</td>
    <td>${['Pendiente', 'Confirmada'].includes(c.estado) ? `<button class="sec mini" data-rep="${c.id}">Reprogramar</button> <button class="peligro mini" data-can="${c.id}">Cancelar</button>` : (c.historial ? `<span class="muted">${esc(c.historial)}</span>` : '')}</td></tr>
    <tr id="rep-${c.id}" hidden><td colspan="7"></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Aún no tienes citas. <a href="#/reservar">Reserva la primera</a>.</p>'}</div>`;
  el.querySelectorAll('[data-can]').forEach(b => b.onclick = () => { if (confirm('¿Cancelar esta cita?')) { Store.cambiarEstado(b.dataset.can, 'Cancelada'); toast('Cita cancelada. La franja quedó libre.'); vMisCitas(el); } });
  el.querySelectorAll('[data-rep]').forEach(b => b.onclick = () => formReprogramar(el, b.dataset.rep));
}
function formReprogramar(el, id) {
  const c = Store.citas().find(x => x.id === id); const fila = $(`#rep-${id}`); fila.hidden = false;
  fila.firstElementChild.innerHTML = `<div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap"><div><label>Nueva fecha</label><input type="date" min="${hoyISO()}" id="nf-${id}" value="${c.fecha}"></div>
    <div style="flex:1"><label>Hora</label><div class="chips" id="nh-${id}"></div></div></div>`;
  const pintar = () => {
    const f = $(`#nf-${id}`).value; const fr = Store.franjasDisponibles(f, c.servicioId, id);
    $(`#nh-${id}`).innerHTML = fr.map(x => `<button class="chip" data-h="${x.hora}">${x.hora}</button>`).join('') || '<span class="muted">Sin horas libres</span>';
    $(`#nh-${id}`).querySelectorAll('[data-h]').forEach(b => b.onclick = () => { try { Store.reprogramar(id, f, b.dataset.h); toast('Cita reprogramada'); vMisCitas(el); } catch (e) { toast(e.message); } });
  };
  $(`#nf-${id}`).onchange = pintar; pintar();
}
function vCorreos(el) {
  const ms = Store.correos(usuario.correo);
  el.innerHTML = `<h1>Notificaciones</h1><p class="muted">Bandeja simulada de los correos que envía el sistema (RF07).</p>
    ${ms.length ? ms.map(m => `<div class="card"><b>📧 ${esc(m.asunto)}</b><div class="muted" style="font-size:13px">Para: ${esc(m.para)} · ${new Date(m.fecha).toLocaleString('es-CO')}</div><p style="margin-bottom:0">${esc(m.cuerpo)}</p></div>`).join('') : '<div class="card muted">Sin notificaciones.</div>'}`;
}

/* ---------- Groomer: agenda con ficha de la mascota (RF02 + RF08) ---------- */
async function vAgendaGroomer(el) {
  const cs = Store.citas({ groomerId: usuario.id }).filter(c => c.estado !== 'Cancelada');
  const fichas = {};
  for (const c of cs) { try { fichas[c.mascotaId] = await PetCareAPI.mascota(c.mascotaId); } catch {} }
  el.innerHTML = `<h1>Mi agenda</h1><p class="muted">Revisa la ficha de cada mascota antes del servicio.</p>
    ${cs.length ? cs.map(c => `<div class="card"><div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><div><b>${c.fecha} · ${c.hora}</b> — ${esc(c.servicio)} (${c.duracion} min)</div><div>${filaEstado(c)}</div></div>
      <div style="margin-top:12px">${fichas[c.mascotaId] ? fichaMascota(fichas[c.mascotaId]) : '<span class="muted">Ficha no disponible</span>'}</div>
      ${['Pendiente', 'Confirmada'].includes(c.estado) ? `<label>Observaciones del servicio</label><textarea id="obs-${c.id}" rows="2" placeholder="Ej.: piel sensible en el lomo, se usó champú hipoalergénico"></textarea>
      <div class="acciones"><button class="mini" data-fin="${c.id}">Registrar servicio realizado</button></div>` : c.historial ? `<div class="exito">Historial: ${esc(c.historial)}</div>` : ''}</div>`).join('')
      : '<div class="card muted">No tienes citas asignadas.</div>'}`;
  el.querySelectorAll('[data-fin]').forEach(b => b.onclick = () => { Store.registrarServicio(b.dataset.fin, $(`#obs-${b.dataset.fin}`).value.trim()); toast('Servicio registrado en el historial'); vAgendaGroomer(el); });
}

/* ---------- Admin: agenda general (RF06) ---------- */
function vAgenda(el) {
  const f = sessionStorage.getItem('dc-filtro') || '';
  const cs = Store.citas(f ? { fecha: f } : {});
  el.innerHTML = `<h1>Agenda del spa</h1><div class="card"><div style="display:flex;gap:10px;align-items:end;flex-wrap:wrap"><div><label>Filtrar por fecha</label><input type="date" id="ff" value="${f}"></div><button class="sec" id="todas">Ver todas</button></div></div>
    <div class="card">${cs.length ? `<div class="tabla"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Mascota</th><th>Servicio</th><th>Groomer</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>
    ${cs.map(c => `<tr><td>${c.fecha}</td><td>${c.hora}</td><td>${esc(c.mascotaNombre)}</td><td>${esc(c.servicio)}</td><td>${esc(c.groomer)}</td><td>${filaEstado(c)}</td><td>
    ${c.estado === 'Pendiente' ? `<button class="mini" data-e="Confirmada" data-id="${c.id}">Confirmar</button> ` : ''}
    ${['Pendiente', 'Confirmada'].includes(c.estado) ? `<button class="sec mini" data-e="Inasistencia" data-id="${c.id}">Inasistencia</button> <button class="peligro mini" data-e="Cancelada" data-id="${c.id}">Cancelar</button>` : ''}</td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">No hay citas para mostrar.</p>'}</div>`;
  $('#ff').onchange = (e) => { sessionStorage.setItem('dc-filtro', e.target.value); vAgenda(el); };
  $('#todas').onclick = () => { sessionStorage.removeItem('dc-filtro'); vAgenda(el); };
  el.querySelectorAll('[data-e]').forEach(b => b.onclick = () => { Store.cambiarEstado(b.dataset.id, b.dataset.e); toast(`Cita marcada como ${b.dataset.e}`); vAgenda(el); });
}

/* ---------- Admin: catálogo (RF03) ---------- */
function vCatalogo(el, editar = null) {
  const ss = Store.servicios(); const s = editar ? ss.find(x => x.id === editar) : null;
  const T = ['Pequeño', 'Mediano', 'Grande'];
  el.innerHTML = `<h1>Catálogo de servicios</h1><div class="card"><h2>${s ? 'Editar servicio' : 'Nuevo servicio'}</h2><form id="f" novalidate><div class="grid">
    <div><label>Nombre</label><input id="n" value="${esc(s?.nombre || '')}"></div><div><label>Duración (min)</label><input id="d" type="number" min="15" step="15" value="${s?.duracion || ''}"></div>
    <div><label>Precio (COP)</label><input id="p" type="number" min="0" step="1000" value="${s?.precio ?? ''}"></div></div>
    <label>Tamaños de mascota</label><div class="dias">${T.map(t => `<label><input type="checkbox" value="${t}" ${!s || s.tamanos.includes(t) ? 'checked' : ''}> ${t}</label>`).join('')}</div>
    <div class="acciones"><button>${s ? 'Guardar cambios' : 'Crear servicio'}</button>${s ? '<button type="button" class="sec" id="cancelar">Cancelar</button>' : ''}</div><div id="msg"></div></form></div>
    <div class="card"><div class="tabla"><table><thead><tr><th>Servicio</th><th>Duración</th><th>Precio</th><th>Tamaños</th><th>Estado</th><th></th></tr></thead><tbody>
    ${ss.map(x => `<tr style="${x.activo ? '' : 'opacity:.55'}"><td>${esc(x.nombre)}</td><td>${x.duracion} min</td><td>${pesos(x.precio)}</td><td>${x.tamanos.join(', ')}</td><td>${x.activo ? 'Activo' : 'Inactivo'}</td>
    <td><button class="sec mini" data-ed="${x.id}">Editar</button> <button class="mini ${x.activo ? 'peligro' : ''}" data-al="${x.id}">${x.activo ? 'Desactivar' : 'Activar'}</button></td></tr>`).join('')}</tbody></table></div></div>`;
  $('#f').onsubmit = (e) => {
    e.preventDefault();
    try { Store.guardarServicio({ id: s?.id, nombre: $('#n').value.trim(), duracion: +$('#d').value, precio: +$('#p').value, tamanos: [...el.querySelectorAll('.dias input:checked')].map(i => i.value) });
      toast(s ? 'Servicio actualizado' : 'Servicio creado'); vCatalogo(el); }
    catch (err) { $('#msg').innerHTML = `<div class="error">${esc(err.message)}</div>`; }
  };
  if (s) $('#cancelar').onclick = () => vCatalogo(el);
  el.querySelectorAll('[data-ed]').forEach(b => b.onclick = () => vCatalogo(el, b.dataset.ed));
  el.querySelectorAll('[data-al]').forEach(b => b.onclick = () => { Store.alternarServicio(b.dataset.al); toast('Estado del servicio actualizado'); vCatalogo(el); });
}

/* ---------- Admin: disponibilidad (RF04) ---------- */
function vDisponibilidad(el) {
  const h = Store.horario(); const tur = Store.turnos();
  const dias = (sel, name) => `<div class="dias">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label><input type="checkbox" name="${name}" value="${d}" ${sel.includes(d) ? 'checked' : ''}> ${DIAS[d]}</label>`).join('')}</div>`;
  el.innerHTML = `<h1>Disponibilidad</h1><div class="grid">
    <div class="card"><h2>Horario de atención</h2><div class="grid"><div><label>Apertura</label><input type="time" id="ap" value="${h.apertura}"></div><div><label>Cierre</label><input type="time" id="ci" value="${h.cierre}"></div></div>
      <label>Días de atención</label>${dias(h.diasLaborables, 'dl')}<div class="acciones"><button id="gh">Guardar horario</button></div><div id="msg"></div></div>
    <div class="card"><h2>Días no laborables</h2><div style="display:flex;gap:8px;align-items:end"><div style="flex:1"><label>Fecha</label><input type="date" id="nl"></div><button id="anl">Agregar</button></div>
      <table style="margin-top:10px"><tbody>${Store.noLaborables().map(f => `<tr><td>${f}</td><td style="text-align:right"><button class="peligro mini" data-q="${f}">Quitar</button></td></tr>`).join('')}</tbody></table></div></div>
    <div class="card"><h2>Turnos por groomer</h2>${Store.groomers().map(g => `<div style="margin-bottom:12px"><b>${esc(g.nombre)}</b>${dias(tur[g.id] || [], 'g-' + g.id)}</div>`).join('')}
      <div class="acciones"><button id="gt">Guardar turnos</button></div></div>`;
  const marcados = (n) => [...el.querySelectorAll(`input[name="${n}"]:checked`)].map(i => +i.value);
  $('#gh').onclick = () => { try { Store.guardarHorario({ apertura: $('#ap').value, cierre: $('#ci').value, diasLaborables: marcados('dl') }); toast('Horario guardado'); $('#msg').innerHTML = ''; } catch (e) { $('#msg').innerHTML = `<div class="error">${esc(e.message)}</div>`; } };
  $('#anl').onclick = () => { Store.agregarNoLaborable($('#nl').value); toast('Día no laborable agregado'); vDisponibilidad(el); };
  el.querySelectorAll('[data-q]').forEach(b => b.onclick = () => { Store.quitarNoLaborable(b.dataset.q); vDisponibilidad(el); });
  $('#gt').onclick = () => { Store.groomers().forEach(g => Store.guardarTurnos(g.id, marcados('g-' + g.id))); toast('Turnos guardados'); };
}

/* ---------- Admin: reportes (RF09, prioridad Podría) ---------- */
function vReportes(el) {
  const cs = Store.citas(); const val = cs.filter(c => c.estado !== 'Cancelada');
  const porServ = {}; val.forEach(c => porServ[c.servicio] = (porServ[c.servicio] || 0) + 1);
  const inas = cs.filter(c => c.estado === 'Inasistencia').length;
  el.innerHTML = `<h1>Reportes</h1><div class="grid"><div class="card"><div class="muted">Citas registradas</div><div class="kpi">${cs.length}</div></div>
    <div class="card"><div class="muted">Realizadas</div><div class="kpi">${cs.filter(c => c.estado === 'Realizada').length}</div></div>
    <div class="card"><div class="muted">Inasistencias</div><div class="kpi">${inas}</div><div class="muted">${cs.length ? Math.round(inas * 100 / cs.length) : 0}% del total</div></div></div>
    <div class="card"><h2>Servicios más solicitados</h2><table><tbody>${Object.entries(porServ).sort((a, b) => b[1] - a[1]).map(([s, n]) => `<tr><td>${esc(s)}</td><td style="width:60%"><div style="background:var(--rosa);height:12px;border-radius:6px;width:${n * 100 / Math.max(...Object.values(porServ))}%"></div></td><td>${n}</td></tr>`).join('') || '<tr><td class="muted">Sin datos</td></tr>'}</tbody></table></div>
    <div class="card"><button class="sec" id="reset">Restablecer datos de demostración</button></div>`;
  $('#reset').onclick = async () => { if (confirm('Se borrarán las citas y cambios de prueba.')) { await Store.reiniciar(); toast('Datos restablecidos'); vReportes(el); } };
}

/* ---------- Landing: presentación del demo ---------- */
function vLanding(el) {
  const sesion = usuario ? `<a href="${INICIO[usuario.rol]}"><button>Volver a mi panel</button></a>` : `<a href="#/login"><button>Ingresar al demo</button></a>`;
  const feat = (i, t, d) => `<div class="card feat"><div class="feat-ico">${i}</div><h3>${t}</h3><p class="muted">${d}</p></div>`;
  const rol = (r, icon, c, k, pasos) => `<div class="card rol-card"><div class="rol-top"><span class="feat-ico">${icon}</span><div><h3>${r}</h3>
    <div class="cred"><span>Correo</span><code>${c}</code></div><div class="cred"><span>Contraseña</span><code>${k}</code></div></div></div>
    <ol>${pasos.map(p => `<li>${p}</li>`).join('')}</ol></div>`;
  el.innerHTML = `<div class="landing">
    <header class="l-top"><div class="brand" style="padding:0"><img class="logo" src="img/logo-icono.png" alt=""> DogsCats <b>Spa</b></div>${sesion}</header>
    <section class="l-hero"><div><span class="pill">Prototipo funcional · Demo</span><h1>Agenda en línea para el spa de tu mascota, sin citas cruzadas</h1>
      <p class="muted">DogsCats Spa reemplaza la agenda en cuaderno y WhatsApp por reservas en línea que nunca se cruzan, y le muestra al spa las alergias y cuidados de cada mascota antes del servicio, consultándolos en PetCare.</p>
      <div class="acciones">${sesion}<button class="sec" id="ver-guia">Ver cómo probarlo</button></div></div>
      <img src="img/logo.png" alt="Logo DogsCats Spa" class="l-logo"></section>
    <section><h2 class="l-h2">Qué puedes probar</h2><div class="grid">
      ${feat('📅', 'Reservas sin cruces', 'Solo se ofrecen las horas libres. Si dos personas eligen la misma franja, el sistema rechaza la segunda.')}
      ${feat('🐾', 'Ficha de la mascota', 'Raza, tamaño, alergias y observaciones llegan desde PetCare, con alertas visibles.')}
      ${feat('✂️', 'Agenda del groomer', 'Cada groomer ve sus citas con la ficha de la mascota y registra el servicio realizado.')}
      ${feat('⚙️', 'Administración', 'Catálogo de servicios, horarios, días no laborables, turnos, estados de cita y reportes.')}</div></section>
    <section id="guia"><h2 class="l-h2">Cómo recorrer el demo</h2><p class="muted" style="margin-top:-6px">Usuarios de demostración con datos ficticios, uno por rol</p><div class="grid">
      ${rol('Cliente', '🧑', 'cliente@dogscats.co', 'Cliente123', ['Revisa <b>Mis mascotas</b>: Luna tiene una alergia resaltada', 'En <b>Reservar</b> elige mascota, servicio, fecha y una hora libre', 'Reserva dos veces la misma hora: al ocuparse los dos groomers, esa hora desaparece', 'En <b>Mis citas</b> reprograma o cancela, y mira <b>Notificaciones</b>'])}
      ${rol('Groomer', '✂️', 'groomer@dogscats.co', 'Groomer123', ['Abre <b>Mi agenda</b> y revisa la ficha de cada mascota', 'Escribe una observación y marca el servicio como realizado'])}
      ${rol('Administrador', '⚙️', 'admin@dogscats.co', 'Admin123', ['En <b>Agenda</b> confirma citas o marca inasistencias', 'Crea, edita o desactiva servicios en <b>Catálogo</b>', 'Agrega un día no laborable en <b>Disponibilidad</b>', 'Mira los indicadores en <b>Reportes</b> o restablece los datos de prueba'])}</div></section>
    <section class="card aviso"><b>Aviso:</b> prototipo académico. Todos los datos son ficticios y se guardan solo en este navegador; no se envía información a ningún servidor.</section>
  </div>`;
  $('#ver-guia').onclick = () => $('#guia').scrollIntoView({ behavior: 'smooth' });
}

window.addEventListener('hashchange', router);
Store.cargar().then(router);
