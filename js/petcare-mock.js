/*
 * Servicio simulado (mock) de la API REST de PetCare.
 * Mitiga el riesgo R2 de la Actividad 2: mientras la API real no esté disponible,
 * DogsCats Spa consume este contrato con la misma forma de respuesta.
 *
 * Contrato acordado:
 *   GET /api/propietarios?correo={correo}        -> Propietario
 *   GET /api/propietarios/{id}/mascotas          -> Mascota[]
 *   GET /api/mascotas/{id}                       -> Mascota
 */
const PetCareAPI = (() => {
  // Datos ficticios (Ley 1581 de 2012: no se usan datos personales reales)
  const propietarios = [
    { id: 'PC-001', nombre: 'Laura Gómez', correo: 'cliente@dogscats.co', telefono: '300 000 0001' },
    { id: 'PC-002', nombre: 'Andrés Ruiz', correo: 'andres@correo.co', telefono: '300 000 0002' },
  ];
  const mascotas = [
    { id: 'M-101', propietarioId: 'PC-001', nombre: 'Luna', especie: 'Perro', raza: 'Golden Retriever', tamano: 'Grande',
      edad: 4, alergias: ['Champú con avena'], observaciones: 'Se pone nerviosa con el secador.' },
    { id: 'M-102', propietarioId: 'PC-001', nombre: 'Michi', especie: 'Gato', raza: 'Criollo', tamano: 'Pequeño',
      edad: 2, alergias: [], observaciones: 'Prefiere baño en seco.' },
    { id: 'M-201', propietarioId: 'PC-002', nombre: 'Rocky', especie: 'Perro', raza: 'Bulldog Francés', tamano: 'Mediano',
      edad: 6, alergias: ['Perfume', 'Pollo'], observaciones: 'Problemas respiratorios leves: sesiones cortas.' },
  ];

  const delay = (data, ms = 250) => new Promise(res => setTimeout(() => res(structuredClone(data)), ms));

  return {
    async buscarPropietarioPorCorreo(correo) {
      const p = propietarios.find(x => x.correo.toLowerCase() === String(correo).toLowerCase());
      if (!p) throw Object.assign(new Error('Propietario no encontrado en PetCare'), { status: 404 });
      return delay(p);
    },
    async mascotasDePropietario(propietarioId) {
      return delay(mascotas.filter(m => m.propietarioId === propietarioId));
    },
    async mascota(id) {
      const m = mascotas.find(x => x.id === id);
      if (!m) throw Object.assign(new Error('Mascota no encontrada'), { status: 404 });
      return delay(m);
    },
  };
})();
