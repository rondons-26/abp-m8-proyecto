# CoreApp Enterprise

![Versión 2.0.0](https://img.shields.io/badge/versi%C3%B3n-2.0.0-0b5cab?style=for-the-badge)
![Estado estable](https://img.shields.io/badge/estado-estable-1f9d55?style=for-the-badge)
![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)

## Ficha del Proyecto

| Campo | Detalle |
| --- | --- |
| **Autor** | Saúl Rondón |
| **Contexto** | Plataforma desarrollada para el Módulo 7: Desarrollo Web Full Stack |
| **Año** | 2026 |
| **Versión** | 2.0.0 |

## Descripción General

CoreApp Enterprise evoluciona hacia una base de datos relacional PostgreSQL gestionada mediante el ORM Sequelize. La aplicación implementa una arquitectura MVC modularizada, capas de servicio para centralizar la lógica de negocio y una relación 1:N entre usuarios y órdenes. Las operaciones compuestas se ejecutan mediante transacciones atómicas, garantizando `commit` ante un flujo exitoso y `rollback` cuando ocurre un error.

## Tecnologías y Herramientas

![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52b0e7?style=flat-square&logo=sequelize&logoColor=white)
![Handlebars](https://img.shields.io/badge/Handlebars-HBS-f0772b?style=flat-square&logo=handlebars.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3?style=flat-square&logo=bootstrap&logoColor=white)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-UI%20feedback-5a67d8?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?style=flat-square&logo=javascript&logoColor=111111)

## Funcionalidades Principales

- **CRUD completo de usuarios:** creación, consulta, actualización y eliminación de registros.
- **Relaciones SQL 1:N:** asociación entre usuarios y sus órdenes.
- **Transacciones SQL atómicas:** creación coordinada de usuarios y órdenes mediante `POST /api/users/transaction`.
- **Simulación de compras:** registro de compras y transacciones desde la interfaz web.
- **Modales interactivos:** visualización de detalles de usuarios y pedidos.
- **Respuestas API estandarizadas:** objetos JSON con las propiedades `status`, `message` y `data`.

## Estructura del JSON Transaccional

El endpoint `POST /api/users/transaction` recibe un usuario y una orden en una única operación transaccional:

```json
{
  "user": {
    "firstname": "Ana",
    "lastname": "Pérez",
    "email": "ana.perez@example.com"
  },
  "order": {
    "product": "Laptop empresarial",
    "quantity": 1,
    "amount": 1299.99
  }
}
```

## Requisitos Previos e Instalación

- [Node.js](https://nodejs.org/) 18 o superior, con `npm` incluido.
- [PostgreSQL](https://www.postgresql.org/) 16.
- Git para clonar el repositorio.

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/rondons-26/abp-m7-proyecto.git
   cd abp-m7-proyecto
   ```

2. **Instalar las dependencias:**

   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto con la configuración de PostgreSQL:

   ```env
   DB_NAME=nombre_de_la_base_de_datos
   DB_USER=usuario_de_postgresql
   DB_PASSWORD=contraseña_de_postgresql
   DB_HOST=localhost
   DB_PORT=5432
   DB_DIALECT=postgres
   ```

4. **Iniciar en producción:**

   ```bash
   npm start
   ```

5. **Iniciar en desarrollo con reinicio automático:**

   ```bash
   npm run dev
   ```

La aplicación estará disponible en `http://localhost:3001`.

## Enlaces y Repositorio

[![Repositorio en GitHub](https://img.shields.io/badge/GitHub-Repositorio-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rondons-26/abp-m7-proyecto)
[![Aplicación en Render](https://img.shields.io/badge/Render-Aplicaci%C3%B3n-46e3b7?style=for-the-badge&logo=render&logoColor=white)](https://abp-m7-proyecto.onrender.com/)

- **Repositorio:** [GitHub - CoreApp Enterprise](https://github.com/rondons-26/abp-m7-proyecto)
- **Aplicación desplegada:** [Render - CoreApp Enterprise](https://abp-m7-proyecto.onrender.com/)

---

_CoreApp Enterprise · Módulo 7 · 2026_