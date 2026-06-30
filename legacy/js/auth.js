// Gestión de sesión y autenticación

function login(email, password) {
  const usuarios = getUsuarios();
  const usuario = usuarios.find(u => u.email === email && u.password === password && u.activo);
  if (!usuario) return null;
  localStorage.setItem('scf_session', JSON.stringify({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }));
  return usuario;
}

function logout() {
  localStorage.removeItem('scf_session');
  window.location.href = getRootPath() + 'login.html';
}

function getSession() {
  return JSON.parse(localStorage.getItem('scf_session') || 'null');
}

// Protege la página: redirige si no hay sesión o el rol no coincide
function requireAuth(rolRequerido) {
  const session = getSession();
  if (!session) {
    window.location.href = getRootPath() + 'login.html';
    return null;
  }
  if (rolRequerido && session.rol !== rolRequerido) {
    window.location.href = getRootPath() + (session.rol === 'supervisor' ? 'supervisor/dashboard.html' : 'conductor/dashboard.html');
    return null;
  }
  return session;
}

// Determina la ruta raíz según profundidad del archivo actual
function getRootPath() {
  const path = window.location.pathname;
  if (path.includes('/conductor/') || path.includes('/supervisor/')) return '../';
  return '';
}

// Inyecta navbar con nombre y botón logout
function renderNavbar(titulo) {
  const session = getSession();
  if (!session) return;
  const rolLabel = session.rol === 'supervisor' ? '<span class="badge bg-warning text-dark ms-2">Supervisor</span>' : '<span class="badge bg-info text-dark ms-2">Conductor</span>';
  const nav = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark border-bottom border-warning">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold text-warning" href="${getRootPath()}${session.rol === 'supervisor' ? 'supervisor/dashboard.html' : 'conductor/dashboard.html'}">
          <i class="bi bi-fuel-pump-fill me-2"></i>SCF Nortrans
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            ${getNavLinks(session.rol)}
          </ul>
          <div class="d-flex align-items-center gap-2">
            <span class="text-light small">${session.nombre}${rolLabel}</span>
            <a href="${getRootPath()}profile.html" class="btn btn-outline-warning btn-sm"><i class="bi bi-person-circle"></i></a>
            <button onclick="logout()" class="btn btn-outline-danger btn-sm"><i class="bi bi-box-arrow-right"></i> Salir</button>
          </div>
        </div>
      </div>
    </nav>`;
}

function getNavLinks(rol) {
  if (rol === 'supervisor') {
    return `
      <li class="nav-item"><a class="nav-link" href="../supervisor/dashboard.html"><i class="bi bi-speedometer2"></i> Dashboard</a></li>
      <li class="nav-item"><a class="nav-link" href="../supervisor/historial-general.html"><i class="bi bi-list-ul"></i> Registros</a></li>
      <li class="nav-item"><a class="nav-link" href="../supervisor/alertas.html"><i class="bi bi-exclamation-triangle"></i> Alertas</a></li>
      <li class="nav-item"><a class="nav-link" href="../supervisor/buses.html"><i class="bi bi-bus-front"></i> Buses</a></li>
      <li class="nav-item"><a class="nav-link" href="../supervisor/conductores.html"><i class="bi bi-people"></i> Conductores</a></li>`;
  }
  return `
    <li class="nav-item"><a class="nav-link" href="../conductor/dashboard.html"><i class="bi bi-speedometer2"></i> Inicio</a></li>
    <li class="nav-item"><a class="nav-link" href="../conductor/nueva-carga.html"><i class="bi bi-plus-circle"></i> Nueva Carga</a></li>
    <li class="nav-item"><a class="nav-link" href="../conductor/historial.html"><i class="bi bi-clock-history"></i> Mi Historial</a></li>`;
}
