// Utilidades generales

function formatearFecha(fechaStr) {
  if (!fechaStr) return '-';
  const [y, m, d] = fechaStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatearNumero(n, decimales = 0) {
  if (n === null || n === undefined) return '-';
  return parseFloat(n).toLocaleString('es-CL', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
}

function estadoBadge(estado) {
  const map = {
    aprobado: '<span class="badge bg-success">Aprobado</span>',
    pendiente: '<span class="badge bg-secondary">Pendiente</span>',
    alerta: '<span class="badge bg-danger">Alerta</span>',
    rechazado: '<span class="badge bg-dark">Rechazado</span>'
  };
  return map[estado] || '<span class="badge bg-secondary">-</span>';
}

function nombreConductor(id) {
  const u = getUsuarioById(id);
  return u ? u.nombre : 'Desconocido';
}

function nombreBus(id) {
  const b = getBusById(id);
  return b ? `${b.patente} — ${b.modelo}` : 'Desconocido';
}

// Activa el link de nav que corresponde a la página actual
function marcarNavActivo() {
  const path = window.location.pathname;
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href').replace('../', ''))) {
      link.classList.add('active');
    }
  });
}

// Rellena un <select> con opciones
function llenarSelect(selectId, items, valorKey, textoKey, placeholder = 'Selecciona...') {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item[valorKey];
    opt.textContent = item[textoKey];
    sel.appendChild(opt);
  });
}

// Confirma una acción con modal nativo
function confirmar(mensaje, callback) {
  if (window.confirm(mensaje)) callback();
}
