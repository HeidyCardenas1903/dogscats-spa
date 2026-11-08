/*
 * Capa de datos del prototipo. Simula la API REST de DogsCats Spa y su base de datos
 * usando localStorage del navegador. En la Actividad 5 se reemplaza por Node.js + PostgreSQL.
 */
const Store = (() => {
  const KEY = 'dogscats-spa-v1';

  async function hash(texto) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }

  const uid = (p) => p + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  async function semilla() {
    return {
      usuarios: [
        { id: 'U-1', nombre: 'Laura Gómez', correo: 'cliente@dogscats.co', rol: 'cliente', clave: await hash('Cliente123') },
        { id: 'U-2', nombre: 'Camila Torres', correo: 'groomer@dogscats.co', rol: 'groomer', clave: await hash('Groomer123') },
        { id: 'U-3', nombre: 'Administración Spa', correo: 'admin@dogscats.co', rol: 'admin', clave: await hash('Admin123') },
        { id: 'U-4', nombre: 'Julián Pérez', correo: 'julian@dogscats.co', rol: 'groomer', clave: await hash('Groomer123') },
      ],
      servicios: [
        { id: 'S-1', nombre: 'Baño completo', duracion: 60, precio: 45000, tamanos: ['Pequeño', 'Mediano', 'Grande'], activo: true },
        { id: 'S-2', nombre: 'Peluquería y corte', duracion: 90, precio: 65000, tamanos: ['Pequeño', 'Mediano', 'Grande'], activo: true },
        { id: 'S-3', nombre: 'Corte de uñas', duracion: 30, precio: 15000, tamanos: ['Pequeño', 'Mediano', 'Grande'], activo: true },
        { id: 'S-4', nombre: 'Spa relajante (hidratación)', duracion: 60, precio: 55000, tamanos: ['Pequeño', 'Mediano'], activo: true },
      ],
      horario: { apertura: '08:00', cierre: '18:00', diasLaborables: [1, 2, 3, 4, 5, 6] }, // 0 = domingo
      noLaborables: ['2026-12-08', '2026-12-25'],
      groomers: { 'U-2': [1, 2, 3, 4, 5], 'U-4': [2, 3, 4, 5, 6] },
      citas: [],
      correos: [],
    };
  }

  let db = null;
  async function cargar() {
    try { db = JSON.parse(localStorage.getItem(KEY)); } catch { db = null; }
    if (!db) { db = await semilla(); guardar(); }
    return db;
  }
  function guardar() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* modo privado */ } }
  async function reiniciar() { db = await semilla(); guardar(); }

  // ---------- RF01 Autenticación y roles ----------
  async function iniciarSesion(correo, clave) {
    if (!correo || !clave) throw new Error('Completa el correo y la contraseña.');
    const u = db.usuarios.find(x => x.correo.toLowerCase() === correo.trim().toLowerCase());
    if (!u || u.clave !== await hash(clave)) throw new Error('Correo o contraseña incorrectos.');
    return { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol };
  }
  async function registrar({ nombre, correo, clave }) {
    if (!nombre || !correo || !clave) throw new Error('Todos los campos son obligatorios.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) throw new Error('El correo no tiene un formato válido.');
    if (clave.length < 8 || !/\d/.test(clave)) throw new Error('La contraseña debe tener mínimo 8 caracteres y un número.');
    if (db.usuarios.some(x => x.correo.toLowerCase() === correo.toLowerCase())) throw new Error('Ya existe una cuenta con ese correo.');
    const u = { id: uid('U'), nombre, correo, rol: 'cliente', clave: await hash(clave) };
    db.usuarios.push(u); guardar();
    return { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol };
  }

  // ---------- RF03 Catálogo ----------
  const servicios = (soloActivos = false) => db.servicios.filter(s => !soloActivos || s.activo);
  function guardarServicio(s) {
    if (!s.nombre || !(s.duracion > 0) || !(s.precio >= 0) || !s.tamanos.length) throw new Error('Revisa nombre, duración, precio y tamaños.');
    if (s.id) Object.assign(db.servicios.find(x => x.id === s.id), s);
    else db.servicios.push({ ...s, id: uid('S'), activo: true });
    guardar();
  }
  function alternarServicio(id) { const s = db.servicios.find(x => x.id === id); s.activo = !s.activo; guardar(); }

  // ---------- RF04 Disponibilidad ----------
  const groomers = () => db.usuarios.filter(u => u.rol === 'groomer');
  function guardarHorario(h) {
    if (h.apertura >= h.cierre) throw new Error('La hora de apertura debe ser anterior a la de cierre.');
    db.horario = h; guardar();
  }
  function agregarNoLaborable(fecha) { if (fecha && !db.noLaborables.includes(fecha)) { db.noLaborables.push(fecha); db.noLaborables.sort(); guardar(); } }
  function quitarNoLaborable(fecha) { db.noLaborables = db.noLaborables.filter(f => f !== fecha); guardar(); }
  function guardarTurnos(groomerId, dias) { db.groomers[groomerId] = dias; guardar(); }

  const aMin = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  const aHora = (min) => String(Math.floor(min / 60)).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0');
  const diaSemana = (fecha) => new Date(fecha + 'T12:00:00').getDay();

  // Franjas libres de 30 min donde cabe el servicio con al menos un groomer disponible
  function franjasDisponibles(fecha, servicioId, excluirCitaId = null) {
    const s = db.servicios.find(x => x.id === servicioId);
    if (!s || !fecha) return [];
    if (db.noLaborables.includes(fecha) || !db.horario.diasLaborables.includes(diaSemana(fecha))) return [];
    const hoy = new Date(); const esHoy = fecha === hoy.toISOString().slice(0, 10);
    const ahora = hoy.getHours() * 60 + hoy.getMinutes();
    const res = [];
    for (let t = aMin(db.horario.apertura); t + s.duracion <= aMin(db.horario.cierre); t += 30) {
      if (esHoy && t <= ahora) continue;
      const libres = groomersLibres(fecha, t, s.duracion, excluirCitaId);
      if (libres.length) res.push({ hora: aHora(t), groomers: libres });
    }
    return res;
  }
  function groomersLibres(fecha, inicio, duracion, excluirCitaId) {
    return groomers().filter(g => (db.groomers[g.id] || []).includes(diaSemana(fecha))).filter(g =>
      !db.citas.some(c => c.id !== excluirCitaId && c.groomerId === g.id && c.fecha === fecha && c.estado !== 'Cancelada' &&
        aMin(c.hora) < inicio + duracion && inicio < aMin(c.hora) + c.duracion));
  }

  // ---------- RF05 Reservas / RF06 Gestión / RF07 Notificaciones ----------
  function reservar({ clienteId, mascota, servicioId, fecha, hora }) {
    const s = db.servicios.find(x => x.id === servicioId);
    if (!mascota || !s || !fecha || !hora) throw new Error('Selecciona mascota, servicio, fecha y hora.');
    if (!s.tamanos.includes(mascota.tamano)) throw new Error(`El servicio no está disponible para mascotas de tamaño ${mascota.tamano}.`);
    // Verificación final (equivale a la transacción con bloqueo de franja del riesgo R4)
    const libres = groomersLibres(fecha, aMin(hora), s.duracion, null);
    if (!libres.length) throw new Error('Esa franja acaba de ser ocupada. Elige otra hora.');
    const cita = { id: uid('C'), clienteId, mascotaId: mascota.id, mascotaNombre: mascota.nombre, servicioId, servicio: s.nombre,
      duracion: s.duracion, precio: s.precio, fecha, hora, groomerId: libres[0].id, groomer: libres[0].nombre,
      estado: 'Pendiente', creada: new Date().toISOString(), historial: null };
    db.citas.push(cita);
    notificar(clienteId, 'Confirmación de tu reserva', `${cita.servicio} para ${cita.mascotaNombre} el ${fecha} a las ${hora} con ${cita.groomer}.`);
    notificar(clienteId, 'Recordatorio programado', `Te recordaremos la cita 24 horas antes (${restarDia(fecha)} a las ${hora}).`);
    guardar();
    return cita;
  }
  const restarDia = (f) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
  function citas(filtro = {}) {
    return db.citas.filter(c => (!filtro.clienteId || c.clienteId === filtro.clienteId) && (!filtro.groomerId || c.groomerId === filtro.groomerId) && (!filtro.fecha || c.fecha === filtro.fecha))
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }
  function cambiarEstado(id, estado) {
    const c = db.citas.find(x => x.id === id); c.estado = estado;
    if (estado === 'Cancelada') notificar(c.clienteId, 'Cita cancelada', `Se canceló ${c.servicio} de ${c.mascotaNombre} del ${c.fecha} ${c.hora}.`);
    guardar();
  }
  function reprogramar(id, fecha, hora) {
    const c = db.citas.find(x => x.id === id);
    const libres = groomersLibres(fecha, aMin(hora), c.duracion, id);
    if (!libres.length) throw new Error('La nueva franja no está disponible.');
    Object.assign(c, { fecha, hora, groomerId: libres[0].id, groomer: libres[0].nombre, estado: 'Pendiente' });
    notificar(c.clienteId, 'Cita reprogramada', `${c.servicio} de ${c.mascotaNombre} ahora es el ${fecha} a las ${hora}.`);
    guardar();
  }
  function registrarServicio(id, observacion) {
    const c = db.citas.find(x => x.id === id); c.estado = 'Realizada'; c.historial = observacion || 'Sin observaciones.'; guardar();
  }
  function notificar(usuarioId, asunto, cuerpo) {
    const u = db.usuarios.find(x => x.id === usuarioId);
    db.correos.unshift({ para: u ? u.correo : '', asunto, cuerpo, fecha: new Date().toISOString() });
  }
  const correos = (correo) => db.correos.filter(m => m.para === correo);

  return { cargar, reiniciar, iniciarSesion, registrar, servicios, guardarServicio, alternarServicio, groomers,
    horario: () => db.horario, noLaborables: () => db.noLaborables, turnos: () => db.groomers, guardarHorario,
    agregarNoLaborable, quitarNoLaborable, guardarTurnos, franjasDisponibles, reservar, citas, cambiarEstado,
    reprogramar, registrarServicio, correos };
})();
