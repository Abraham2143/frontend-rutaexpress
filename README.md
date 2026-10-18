# RutaExpress - Frontend

Frontend web de **RutaExpress**, desarrollado con Angular e integrado con **Microsoft Entra ID mediante MSAL** para autenticación y control de acceso por roles. Desplegado en **AWS Amplify** con integración CI/CD automática.

---

## Matriz de Funcionalidades 

A continuación se presenta el alcance completo del proyecto, su estado de implementación, componente responsable y evidencia verificable para la evaluación:

| N° | Funcionalidad | Estado | Componente Responsable | Evidencia Verificable / Endpoint |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Despliegue Cloud Frontend y Pipeline CI/CD | **Implementada** | AWS Amplify (Angular) | Aplicación activa en la nube con despliegue automático desde GitHub. |
| **2** | Autenticación OIDC / OAuth2 e IDaaS | **Implementada** | Microsoft Entra ID / Angular MSAL | Login, `MsalGuard`, consumo de claims y obtención de tokens JWT válidos. |
| **3** | Enrutamiento API Gateway y Seguridad CORS | **Implementada** | BFF (`ms-rutaexpress-bff`) | Validación de JWT, control de CORS y enrutamiento a microservicios. |
| **4** | Consulta de Catálogo de Servicios | **Implementada** | `ms-rutaexpress-catalog` | Endpoint `GET /api/v1/catalog` con integración a Oracle Autonomous DB. |
| **5** | Creación y Consulta de Envíos | **Implementada** | `ms-rutaexpress-shipments` | Endpoints REST `GET /POST /api/v1/shipments` con persistencia mediante Wallet TLS. |
| **6** | Transacción y Cambio de Estado (Síncrono) | **Implementada** | Frontend / `ms-rutaexpress-shipments` | Botón "Aceptar", llamado `PUT /api/v1/shipments/{id}/status` y actualización en Oracle. |
| **7** | Publicación Asíncrona de Eventos | **Implementada** | `ms-rutaexpress-shipments` / RabbitMQ | Disparo de `ShipmentNotification` a `shipments.exchange` -> `shipments.queue` (`Ready: 1`). |
| **8** | API REST de Administración de Colas | **Implementada** | `ms-rutaexpress-admin` | Endpoints `POST /queues`, `DELETE /queues/{name}`, DTOs con `@NotBlank` y `@Valid`. |
| **9** | Topología de Tolerancia a Fallos y DLQ | **Implementada** | Clúster RabbitMQ / Spring AMQP | Colas `q.cmd.*` configuradas con directivas **DLX**, **DLK** y colas de descarte (`*.dlq`). |

---

## Tecnologías

- Angular
- TypeScript
- HTML / CSS
- MSAL Angular
- Microsoft Entra ID
- AWS Amplify
- Git / GitHub

---

## Funcionalidades de la Interfaz

- Inicio y cierre de sesión con Microsoft.
- Protección de rutas mediante `MsalGuard`.
- Obtención de roles desde Microsoft Entra ID.
- Dashboard adaptado según el rol del usuario.
- Gestión y actualización de estado de envíos.
- Consulta del catálogo de servicios.
- Control de acciones según permisos.

### Roles

- `ADMIN` — Administrador.
- `DISPATCHER` — Despachador.
- `CLIENT` — Cliente.

Los roles son obtenidos desde los claims entregados por Microsoft Entra ID.

---

## Rutas Principales

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

Puedes comprobar las instalaciones con:

```bash
node --version
npm --version
git --version