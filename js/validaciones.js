// Validaciones reutilizables para formularios

const Validar = {
  // Contraseña: 4 reglas de seguridad
  password(valor) {
    const errores = [];
    if (valor.length < 8) errores.push('Mínimo 8 caracteres');
    if (valor.length > 20) errores.push('Máximo 20 caracteres');
    if (!/[0-9]/.test(valor)) errores.push('Debe contener al menos un número');
    if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(valor)) errores.push('Debe contener al menos un carácter especial (!@#$%...)');
    return errores;
  },

  email(valor) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor) ? [] : ['Correo electrónico inválido'];
  },

  rut(valor) {
    // Formato: XX.XXX.XXX-X
    return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(valor) ? [] : ['RUT inválido (formato: 12.345.678-9)'];
  },

  requerido(valor, nombre) {
    return valor.trim() === '' ? [`El campo ${nombre} es obligatorio`] : [];
  },

  numero(valor, nombre, min, max) {
    const n = parseFloat(valor);
    if (isNaN(n)) return [`${nombre} debe ser un número`];
    if (min !== undefined && n < min) return [`${nombre} debe ser mayor a ${min}`];
    if (max !== undefined && n > max) return [`${nombre} debe ser menor a ${max}`];
    return [];
  },

  telefono(valor) {
    return /^(\+56\s?)?[29]\d{8}$/.test(valor.replace(/\s/g, '')) ? [] : ['Teléfono inválido (ej: +56 9 1234 5678)'];
  }
};

// Muestra errores en el campo y feedback visual Bootstrap
function mostrarError(inputId, errores) {
  const input = document.getElementById(inputId);
  const feedback = document.getElementById(inputId + '-feedback');
  if (!input) return;
  if (errores.length > 0) {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    if (feedback) feedback.textContent = errores[0];
  } else {
    input.classList.remove('is-invalid');
    input.classList.add('is-valid');
    if (feedback) feedback.textContent = '';
  }
  return errores.length === 0;
}

function limpiarValidaciones(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.is-invalid, .is-valid').forEach(el => {
    el.classList.remove('is-invalid', 'is-valid');
  });
}

// Muestra alerta Bootstrap dentro de un contenedor
function mostrarAlerta(containerId, mensaje, tipo = 'danger') {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `
    <div class="alert alert-${tipo} alert-dismissible fade show" role="alert">
      <i class="bi bi-${tipo === 'danger' ? 'exclamation-circle' : tipo === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
      ${mensaje}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>`;
}

// Indicador de fuerza de contraseña
function actualizarFuerzaPassword(valor, barraId, textoId) {
  const barra = document.getElementById(barraId);
  const texto = document.getElementById(textoId);
  if (!barra || !texto) return;
  let puntos = 0;
  if (valor.length >= 8) puntos++;
  if (valor.length >= 12) puntos++;
  if (/[0-9]/.test(valor)) puntos++;
  if (/[!@#$%^&*]/.test(valor)) puntos++;
  if (/[A-Z]/.test(valor)) puntos++;

  const niveles = [
    { pct: 0, clase: 'bg-secondary', label: '' },
    { pct: 20, clase: 'bg-danger', label: 'Muy débil' },
    { pct: 40, clase: 'bg-warning', label: 'Débil' },
    { pct: 60, clase: 'bg-info', label: 'Moderada' },
    { pct: 80, clase: 'bg-primary', label: 'Fuerte' },
    { pct: 100, clase: 'bg-success', label: 'Muy fuerte' }
  ];
  const nivel = niveles[Math.min(puntos, 5)];
  barra.style.width = nivel.pct + '%';
  barra.className = 'progress-bar ' + nivel.clase;
  texto.textContent = nivel.label;
}
