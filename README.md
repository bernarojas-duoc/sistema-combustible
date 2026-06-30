# SCF Nortrans — Sistema de Control de Combustible (Angular)

Aplicación FrontEnd para la gestión y control del combustible de una flota de buses
de transporte minero. Permite registrar cargas de combustible, detectar consumos
anómalos, controlar el **gasto mensual** y gestionar el **mantenimiento preventivo
por kilometraje** (cambio de aceite, filtros, frenos y neumáticos).

Migración a **Angular 20** del proyecto original desarrollado en HTML/CSS/Bootstrap
vanilla (conservado en la carpeta [`/legacy`](./legacy) como referencia).

> Asignatura: Desarrollo Full Stack II (DSY2202) — Experiencia 2, Semana 6.

---

## 🚌 Funcionalidades

### Dos roles con privilegios diferentes
- **Conductor**: registra sus cargas, consulta su historial y su rendimiento.
- **Supervisor**: revisa todas las cargas (aprobar/rechazar), gestiona buses y
  conductores, y accede a los reportes de gasto y mantenimiento.

### Páginas
- **Autenticación**: inicio de sesión, registro de usuarios y recuperación de
  contraseña (3 pasos).
- **Perfil**: edición de datos personales y cambio de contraseña.
- **Conductor**: dashboard, registro de nueva carga (con cálculo en tiempo real de
  km/L, costo y estado), historial con filtros.
- **Supervisor**: dashboard operacional, historial general con revisión,
  centro de alertas de consumo, **reporte de gasto** y **mantenimiento preventivo**,
  mantenedor de buses y mantenedor de conductores.

### Funcionalidades nuevas respecto a la versión vanilla
- **💰 Reporte de gasto en combustible**: cuánto gasta la empresa por mes y por bus
  (cada carga registra su precio por litro; el costo = litros × precio).
- **🔧 Mantenimiento preventivo por kilometraje**: alertas de cambio de aceite,
  filtros, frenos y neumáticos según el odómetro de cada bus, con estados
  *al día / por vencer / vencido* y registro de mantención realizada.

---

## 🛠️ Tecnologías

- **Angular 20** (componentes standalone, signals, control flow `@if`/`@for`).
- **Formularios reactivos** y validaciones personalizadas.
- **Bootstrap 5** + **Bootstrap Icons** (grid responsive de 12 columnas).
- **Jasmine + Karma** para pruebas unitarias.
- **Compodoc** para la documentación del código.
- Persistencia en `localStorage` (datos mock, sin backend).

---

## 🚀 Puesta en marcha

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor de desarrollo
npm start
# Abrir http://localhost:4200
```

### Credenciales de prueba

| Rol        | Correo                    | Contraseña   |
|------------|---------------------------|--------------|
| Supervisor | supervisor@nortrans.cl    | Admin@1234   |
| Conductor  | pedro@nortrans.cl         | Pedro@1234   |
| Conductor  | luis@nortrans.cl          | Luis@1234    |

---

## 🧪 Pruebas unitarias

```bash
# Modo interactivo (watch)
npm test

# Una sola ejecución, headless (CI)
npm run test:ci
```

Se incluyen pruebas para los validadores, los servicios de cargas,
autenticación y mantenimiento, y el componente reutilizable de estado
(27 specs en total).

---

## 📚 Documentación (Compodoc)

```bash
# Generar la documentación en ./documentation
npm run docs

# Generarla y servirla en http://localhost:8080
npm run docs:serve
```

Todo el código (modelos, servicios, guards, validadores y componentes) está
documentado con comentarios JSDoc/TSDoc que Compodoc procesa automáticamente.

---

## 📁 Estructura del proyecto

```
src/app/
├── core/                 # Lógica de negocio (sin UI)
│   ├── models/           # Interfaces (Usuario, Bus, Carga, Mantenimiento)
│   ├── services/         # Storage, Auth, Usuario, Bus, Carga, Mantenimiento
│   └── guards/           # authGuard, rolGuard
├── shared/               # Reutilizables
│   ├── components/       # Navbar, Layout, EstadoBadge, PasswordStrength
│   ├── pipes/            # FechaPipe
│   └── validators/       # Validadores (password, rut, teléfono, coinciden)
└── features/             # Páginas por dominio
    ├── auth/             # login, register, recover
    ├── profile/
    ├── conductor/        # dashboard, nueva-carga, historial
    └── supervisor/       # dashboard, historial-general, alertas,
                          # reporte-gasto, mantenimiento, buses, conductores
```

---

## 🔗 Entregables

- **Repositorio Git**: https://github.com/bernarojas-duoc/sistema-combustible
- **Tablero Trello**: _(agregar link)_
- **Video de presentación (Kaltura)**: _(agregar link)_
