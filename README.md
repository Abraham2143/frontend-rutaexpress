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

## Requisitos

Antes de ejecutar el proyecto debes tener instalado:

- Node.js
- npm
- Git

npm se instala junto con Node.js.

Puedes comprobar las instalaciones con:

```bash
node --version
npm --version
git --version
```

No es necesario instalar Angular CLI de forma global.

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

Este comando instalará automáticamente las dependencias definidas en el proyecto, incluyendo Angular y MSAL.

### 4. Levantar el frontend

```bash
npm start
```

Luego abrir en el navegador:

```text
http://localhost:4200
```

Para detener el servidor utiliza:

```text
Ctrl + C
```

---

## Compilar el proyecto

Para comprobar que el frontend compile correctamente:

```bash
npm run build
```

Los archivos generados se almacenarán en la carpeta `dist/`.

---

## Autenticación y roles

RutaExpress utiliza **Microsoft Entra ID** para autenticar a los usuarios.

Los roles configurados son:

| Rol | Permisos principales |
|---|---|
| `ADMIN` | Visualizar KPIs, consultar envíos, cambiar estados y acceder al catálogo |
| `DISPATCHER` | Crear envíos, gestionar estados y acceder al catálogo |
| `CLIENT` | Crear y consultar sus envíos |

Las rutas privadas requieren autenticación mediante Microsoft y los permisos de la interfaz dependen de los roles asignados al usuario.

> Para iniciar sesión correctamente, la cuenta debe tener acceso a la aplicación configurada en Microsoft Entra ID.

---

## Flujo de ramas

El desarrollo se realiza sobre la rama:

```text
development
```

Los cambios terminados se integran mediante Pull Request:

```text
development
    ↓
Pull Request
    ↓
main
```