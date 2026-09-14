# RutaExpress - Frontend

Frontend web de **RutaExpress**, desarrollado con Angular e integrado con **Microsoft Entra ID mediante MSAL** para autenticación y control de acceso por roles.

---

## Tecnologías

- Angular
- TypeScript
- HTML / CSS
- MSAL Angular
- Microsoft Entra ID
- Git / GitHub

---

## Funcionalidades

- Inicio y cierre de sesión con Microsoft.
- Protección de rutas mediante `MsalGuard`.
- Obtención de roles desde Microsoft Entra ID.
- Dashboard adaptado según el rol del usuario.
- Gestión de envíos.
- Consulta del catálogo de servicios.
- Control de acciones según permisos.

### Roles

- `ADMIN` — Administrador.
- `DISPATCHER` — Despachador.
- `CLIENT` — Cliente.

Los roles son obtenidos desde los claims entregados por Microsoft Entra ID.

---

## Rutas principales

| Ruta | Acceso |
|---|---|
| `/login` | Público |
| `/dashboard` | Usuario autenticado |
| `/shipments` | ADMIN, DISPATCHER, CLIENT |
| `/catalog` | ADMIN, DISPATCHER |

---

## Ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/Abraham2143/frontend-rutaexpress.git
```

### 2. Entrar al proyecto

```bash
cd frontend-rutaexpress
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Levantar el frontend

```bash
ng serve
```

Abrir en el navegador:

```text
http://localhost:4200
```

---

## Flujo de ramas

```text
development
    ↓
Pull Request
    ↓
main
```

Los cambios se desarrollan en `development` y se integran a `main` mediante Pull Request.