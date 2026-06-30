// Inicializa datos mock en localStorage si no existen
function initData() {
  if (!localStorage.getItem('scf_usuarios')) {
    const usuarios = [
      {
        id: 1,
        nombre: 'Carlos Supervisor',
        email: 'supervisor@nortrans.cl',
        password: 'Admin@1234',
        rol: 'supervisor',
        rut: '12.345.678-9',
        telefono: '+56 9 1234 5678',
        activo: true
      },
      {
        id: 2,
        nombre: 'Pedro Ramírez',
        email: 'pedro@nortrans.cl',
        password: 'Pedro@1234',
        rol: 'conductor',
        rut: '15.678.901-2',
        telefono: '+56 9 8765 4321',
        activo: true
      },
      {
        id: 3,
        nombre: 'Luis Herrera',
        email: 'luis@nortrans.cl',
        password: 'Luis@1234',
        rol: 'conductor',
        rut: '17.234.567-8',
        telefono: '+56 9 5555 6666',
        activo: true
      }
    ];
    localStorage.setItem('scf_usuarios', JSON.stringify(usuarios));
  }

  if (!localStorage.getItem('scf_buses')) {
    const buses = [
      { id: 1, patente: 'BJKP-12', modelo: 'Mercedes-Benz O500', capacidadTanque: 350, kmLitroEsperado: 3.5, activo: true },
      { id: 2, patente: 'FKRM-34', modelo: 'Volvo B12M', capacidadTanque: 300, kmLitroEsperado: 3.2, activo: true },
      { id: 3, patente: 'GHPW-56', modelo: 'Scania K360', capacidadTanque: 320, kmLitroEsperado: 3.8, activo: true },
      { id: 4, patente: 'LNVX-78', modelo: 'Mercedes-Benz O500', capacidadTanque: 350, kmLitroEsperado: 3.5, activo: true }
    ];
    localStorage.setItem('scf_buses', JSON.stringify(buses));
  }

  if (!localStorage.getItem('scf_cargas')) {
    const hoy = new Date();
    const cargas = [
      { id: 1, busId: 1, conductorId: 2, litros: 220, odometro: 145300, odometroAnterior: 144550, grifo: 'Grifo Principal - Calama', fecha: formatFecha(hoy, -2), observaciones: '', estado: 'aprobado' },
      { id: 2, busId: 2, conductorId: 3, litros: 180, odometro: 98700, odometroAnterior: 98100, grifo: 'Grifo Norte - Chuquicamata', fecha: formatFecha(hoy, -1), observaciones: 'Tanque casi vacío', estado: 'aprobado' },
      { id: 3, busId: 3, conductorId: 2, litros: 310, odometro: 201500, odometroAnterior: 200400, grifo: 'Grifo Principal - Calama', fecha: formatFecha(hoy, 0), observaciones: '', estado: 'pendiente' },
      { id: 4, busId: 1, conductorId: 2, litros: 90, odometro: 144550, odometroAnterior: 143900, grifo: 'Grifo Sur - Spence', fecha: formatFecha(hoy, -5), observaciones: '', estado: 'aprobado' },
      { id: 5, busId: 4, conductorId: 3, litros: 260, odometro: 76200, odometroAnterior: 75350, grifo: 'Grifo Principal - Calama', fecha: formatFecha(hoy, -3), observaciones: '', estado: 'alerta' }
    ];
    localStorage.setItem('scf_cargas', JSON.stringify(cargas));
  }
}

// Devuelve fecha en formato YYYY-MM-DD usando la zona horaria local del navegador
// (evita el desfase de un día que produce toISOString cuando UTC y local discrepan)
function fechaLocalISO(d) {
  if (!d) d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatFecha(base, diasAtras) {
  const d = new Date(base);
  d.setDate(d.getDate() + diasAtras);
  return fechaLocalISO(d);
}

// CRUD genérico
function getAll(key) { return JSON.parse(localStorage.getItem(key) || '[]'); }
function saveAll(key, arr) { localStorage.setItem(key, JSON.stringify(arr)); }
function nextId(arr) { return arr.length > 0 ? Math.max(...arr.map(x => x.id)) + 1 : 1; }

// Usuarios
function getUsuarios() { return getAll('scf_usuarios'); }
function getUsuarioById(id) { return getUsuarios().find(u => u.id === parseInt(id)); }
function saveUsuario(usuario) {
  const lista = getUsuarios();
  const idx = lista.findIndex(u => u.id === usuario.id);
  if (idx >= 0) lista[idx] = usuario;
  else { usuario.id = nextId(lista); lista.push(usuario); }
  saveAll('scf_usuarios', lista);
  return usuario;
}
function deleteUsuario(id) {
  saveAll('scf_usuarios', getUsuarios().filter(u => u.id !== parseInt(id)));
}

// Buses
function getBuses() { return getAll('scf_buses'); }
function getBusById(id) { return getBuses().find(b => b.id === parseInt(id)); }
function saveBus(bus) {
  const lista = getBuses();
  const idx = lista.findIndex(b => b.id === bus.id);
  if (idx >= 0) lista[idx] = bus;
  else { bus.id = nextId(lista); lista.push(bus); }
  saveAll('scf_buses', lista);
  return bus;
}
function deleteBus(id) {
  saveAll('scf_buses', getBuses().filter(b => b.id !== parseInt(id)));
}

// Cargas
function getCargas() { return getAll('scf_cargas'); }
function getCargaById(id) { return getCargas().find(c => c.id === parseInt(id)); }
function saveCarga(carga) {
  const lista = getCargas();
  const idx = lista.findIndex(c => c.id === carga.id);
  if (idx >= 0) lista[idx] = carga;
  else { carga.id = nextId(lista); lista.push(carga); }
  saveAll('scf_cargas', lista);
  return carga;
}
function deleteCarga(id) {
  saveAll('scf_cargas', getCargas().filter(c => c.id !== parseInt(id)));
}

// Calcula km/litro de una carga
function calcularConsumo(carga) {
  const km = carga.odometro - carga.odometroAnterior;
  if (km <= 0 || carga.litros <= 0) return null;
  return (km / carga.litros).toFixed(2);
}

// Detecta si el consumo es anómalo respecto al bus
function esAlerta(carga) {
  const bus = getBusById(carga.busId);
  if (!bus) return false;
  const consumo = parseFloat(calcularConsumo(carga));
  if (!consumo) return false;
  return consumo < bus.kmLitroEsperado * 0.7 || consumo > bus.kmLitroEsperado * 1.4;
}
