# Fast Fire CRM

## Descripción

Fast Fire CRM es un sistema de gestión de relaciones con clientes (CRM) desarrollado para empresas, enfocado en la administración de tareas, proyectos, usuarios y procesos de compra. Construido con tecnologías modernas como React y TypeScript, utiliza Firebase para autenticación y base de datos en tiempo real, proporcionando una experiencia fluida y escalable.

El proyecto sigue una arquitectura modular con separación clara de responsabilidades, utilizando Zustand para gestión de estado, servicios estáticos para operaciones con Firebase, y componentes reutilizables con Material-UI.

## Características Principales

- **Autenticación y Autorización**: Sistema de login basado en Firebase con roles de acceso ('TYG', 'ADMIN', 'PURCHASE', 'PROVIDER').
- **Gestión de Tareas**: Creación, edición y seguimiento de tareas con prioridades (LOW/NORMAL/HIGH/URGENT), estados (TODO, IN_PROGRESS, BLOCKED, DONE) y historial.
- **Administración de Proyectos**: Manejo de proyectos con presupuesto, ubicación, líder y colaboradores.
- **Módulo de Compras**: Gestión de licitaciones, stock y órdenes de compra para gerentes de adquisiciones.
- **Interfaz de Usuario**: UI responsiva con tablas dinámicas (MUI DataGrid), formularios modales, notificaciones globales y navegación por roles.
- **Sincronización en Tiempo Real**: Actualizaciones automáticas desde Firebase Realtime Database.
- **Grupos de Trabajo**: Soporte multi-tenant con workgroups para organización por equipos.
- **Integraciones**: Cloudinary para uploads de imágenes, XLSX para exportación a Excel, y dayjs para manejo de fechas.

## Pila Tecnológica

- **Frontend**: React 18.3.1 con TypeScript 5.5.3
- **Herramienta de Build**: Vite 7.3.1
- **Gestión de Estado**: Zustand 5.0.0-rc.2 (con persistencia y devtools)
- **Backend/Base de Datos**: Firebase (Autenticación + Realtime Database)
- **Framework UI**: Material-UI (MUI) v6.1.3 con MUI X (DataGrid, DatePickers)
- **Formularios**: React Hook Form 7.53.0
- **Enrutamiento**: React Router v6.27.0
- **Estilos**: SCSS con Emotion CSS-in-JS
- **Pruebas**: Jest 30.3.0, React Testing Library
- **Linting**: ESLint con soporte TypeScript
- **Otras**: UUID para IDs, react-color para selectores de color, dayjs para fechas, XLSX para Excel

## Arquitectura

### Estructura de Directorios

```
src/
├── App.tsx, main.tsx              # Puntos de entrada
├── router/
│   ├── AppRouter.tsx              # Definición de rutas
│   └── ProtectedRoute.tsx         # Guardia de autenticación
├── pages/                         # Páginas por funcionalidad
│   ├── login/                     # Autenticación
│   ├── home/                      # Dashboard
│   ├── administrator/             # Panel de admin (usuarios, proyectos)
│   ├── purchasing-manager/        # Gestión de compras
│   ├── tasks-groups/              # Tareas por grupos
│   └── tasks-by-group/            # Vista de tareas agrupadas
├── components/                    # Componentes reutilizables
│   ├── header/, menu/, modal/     # UI global
│   ├── table/                     # Tablas de datos
│   ├── *-form/                    # Formularios específicos
│   └── dialogs/, multi-select/    # Componentes auxiliares
├── stores/                        # Gestión de estado con Zustand
│   ├── auth/                      # Estado de autenticación
│   ├── ui/                        # Estado global UI
│   ├── tasks/, projects/, users/  # Estados por dominio
│   └── stock/, tags/, cities/     # Estados adicionales
├── services/                      # Servicios estáticos para Firebase
│   ├── auth.service.ts            # Login/registro
│   ├── task.service.ts            # CRUD de tareas
│   ├── project.service.ts         # Gestión de proyectos
│   └── otros servicios por entidad
├── firebase/                      # Configuración de Firebase
├── interfaces/                    # Definiciones TypeScript
└── utils/                         # Utilidades
```

### Patrones y Convenciones

- **Gestión de Estado**: Stores modulares con Zustand, hooks `useXxxStore`, persistencia opcional.
- **Capa de Servicios**: Clases estáticas con métodos CRUD, respuesta consistente `ServiceResponse`.
- **Componentes**: Funcionales con hooks, organizados por feature.
- **Tipado**: TypeScript estricto con interfaces en `/interfaces/`.
- **Estilos**: SCSS + sx prop de MUI.
- **Flujo de Datos**:
  ```
  Acción del Usuario → Llamada a Servicio → Operación Firebase → Actualización de Store → Re-render
  ```
- **Autenticación**: Firebase Auth + validación en DB, rutas protegidas con ProtectedRoute.

### Puntos de Extensión

Para nuevas funcionalidades:
- Agregar store en `/stores/xxx/`, servicio en `/services/xxx.service.ts`, página en `/pages/xxx/`.
- Nuevas entidades: Interfaz en `/interfaces/`, servicio CRUD, store correspondiente.
- Sincronización real: Usar `onValue()` en métodos `loadXxx()` del store.
- Permisos: Verificar `user.permissions` en componentes.

## API/Endpoints

El proyecto utiliza servicios estáticos para interactuar con Firebase. No hay endpoints REST tradicionales, sino operaciones directas con la base de datos. Métodos principales:

- **AuthService**:
  - `signIn(email, password)`: Inicio de sesión.
  - `signUp(userData)`: Registro de usuario.
  - `signOut()`: Cierre de sesión.

- **TaskService**:
  - `createTask(taskData)`: Crear tarea.
  - `updateTask(id, updates)`: Actualizar tarea.
  - `deleteTask(id)`: Eliminar tarea.
  - `getTasksByWorkgroup(workgroupId)`: Obtener tareas por grupo.

- **ProjectService**:
  - `createProject(projectData)`: Crear proyecto.
  - `getProjects()`: Listar proyectos.
  - `updateProject(id, updates)`: Actualizar proyecto.

- **UserService**:
  - `getUsers()`: Listar usuarios.
  - `updateUser(id, updates)`: Actualizar usuario.

- **PurchaseService**:
  - `createLicitacion(data)`: Crear licitación.
  - `getStock()`: Obtener inventario.

Todos los métodos devuelven `ServiceResponse { result: "OK"|"ERROR", message?, errorMessage? }`.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd fast-fire-crm
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura Firebase:
   - Crea un proyecto en Firebase Console.
   - Habilita Authentication y Realtime Database.
   - Copia las credenciales a `src/firebase/firebase.config.ts`.

4. Ejecuta en desarrollo:
   ```bash
   npm run dev
   ```

5. Construye para producción:
   ```bash
   npm run build
   ```

## Uso

- **Login**: Accede con credenciales de usuario.
- **Dashboard**: Vista general en `/home`.
- **Tareas**: Gestiona en `/tasks` o `/tasksbygroup`.
- **Admin**: Panel en `/admin` para usuarios y proyectos (requiere rol ADMIN).
- **Compras**: Módulo en `/purchasing-manager` (rol PURCHASE).

## Estructura del Proyecto

Ver [src/](src/) para la implementación completa. Archivos clave:
- [src/stores/](src/stores/) - Gestión de estado.
- [src/services/](src/services/) - Lógica de negocio.
- [src/interfaces/](src/interfaces/) - Tipos TypeScript.
- [src/router/AppRouter.tsx](src/router/AppRouter.tsx) - Enrutamiento.

## Contribución

1. Fork el repositorio.
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`.
3. Realiza commits descriptivos.
4. Push y crea un Pull Request.

Sigue los patrones de arquitectura existentes para mantener consistencia.

## Licencia

Este proyecto está bajo una licencia genérica. Consulta los términos específicos si aplica.
