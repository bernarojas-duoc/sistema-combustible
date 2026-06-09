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

function estadoBadge(estado, motivo) {
  const map = {
    aprobado: '<span class="badge bg-success">Aprobado</span>',
    pendiente: '<span class="badge bg-secondary">Pendiente</span>',
    alerta: '<span class="badge bg-danger">Alerta</span>',
    rechazado: '<span class="badge bg-dark">Rechazado</span>'
  };
  let html = map[estado] || '<span class="badge bg-secondary">-</span>';
  if (estado === 'rechazado' && motivo) {
    html += ` <i class="bi bi-info-circle text-muted ms-1 estado-info"`
         +  ` role="button" tabindex="0"`
         +  ` data-bs-toggle="popover" data-bs-trigger="focus" data-bs-placement="top"`
         +  ` data-bs-title="Motivo del rechazo"`
         +  ` data-bs-content="${escapeAttr(motivo)}"></i>`;
  }
  return html;
}

// Escapa una cadena para uso seguro dentro de un atributo HTML (entre comillas dobles)
function escapeAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Inicializa (o reinicializa) todos los popovers de la página
function initPopovers() {
  if (typeof bootstrap === 'undefined') return;
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
    if (!bootstrap.Popover.getInstance(el)) new bootstrap.Popover(el);
  });
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
