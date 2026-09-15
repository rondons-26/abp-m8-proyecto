# CoreApp Enterprise

![Versión 3.0.0](https://img.shields.io/badge/versi%C3%B3n-3.0.0-0b5cab?style=for-the-badge)
![Estado estable](https://img.shields.io/badge/estado-estable-1f9d55?style=for-the-badge)
![PostgreSQL 18](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Módulo 8](https://img.shields.io/badge/m%C3%B3dulo-8-7c3aed?style=for-the-badge)

## Ficha del Proyecto

| Campo | Detalle |
| --- | --- |
| **Autor** | Saúl Rondón |
| **Contexto** | Plataforma desarrollada para el Módulo 8: Desarrollo Web Full Stack |
| **Año** | 2026 |
| **Versión** | 3.0.0 |

## Descripción General

CoreApp Enterprise es una plataforma web construida con Node.js y Express, organizada bajo una arquitectura MVC y respaldada por PostgreSQL mediante Sequelize. Esta versión incorpora autenticación segura con JWT, control de acceso basado en roles para Administradores y Clientes, y gestión de avatares mediante carga de imágenes. La aplicación mantiene una separación clara entre controladores, servicios, modelos y vistas para facilitar su evolución y mantenimiento.

## Tecnologías y Herramientas

![Node.js](https://img.shields.io/badge/Node.js-ESM-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=flat-square&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-ORM-52b0e7?style=flat-square&logo=sequelize&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-autenticaci%C3%B3n-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Multer](https://img.shields.io/badge/Multer-carga%20de%20archivos-2f855a?style=flat-square)
![Handlebars](https://img.shields.io/badge/Handlebars-HBS-f0772b?style=flat-square&logo=handlebars.js&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952b3?style=flat-square&logo=bootstrap&logoColor=white)
![SweetAlert2](https://img.shields.io/badge/SweetAlert2-UI%20feedback-5a67d8?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?style=flat-square&logo=javascript&logoColor=111111)

## Funcionalidades Principales

- **Autenticación con JWT:** inicio de sesión y protección de recursos mediante tokens.
- **Control de roles:** permisos diferenciados para los perfiles Administrador y Cliente.
- **Gestión de usuarios:** registro, consulta, actualización y administración de perfiles.
- **Carga de avatares:** subida y almacenamiento de imágenes de perfil mediante Multer.
- **Arquitectura MVC:** organización modular con controladores, servicios, modelos y vistas.
- **Persistencia relacional:** gestión de datos PostgreSQL mediante Sequelize.
- **Gestión de órdenes:** registro y consulta de compras asociadas a los usuarios.
- **Interfaz web:** panel administrativo y experiencia de cliente con vistas dinámicas.

## Acceso y Pruebas en el Despliegue

Para probar el panel administrativo, utiliza estas credenciales directamente en la aplicación desplegada en Render:

- **URL de la aplicación:** [https://abp-m8-proyecto.onrender.com/](https://abp-m8-proyecto.onrender.com/)
- **Correo:** `testing@admin.com`
- **Contraseña:** `123456`

Estas credenciales están destinadas exclusivamente a las pruebas del entorno desplegado.

## Requisitos Previos e Instalación

- [Node.js](https://nodejs.org/) 18 o superior, con `npm` incluido.
- [PostgreSQL](https://www.postgresql.org/) 18.
- Git para clonar el repositorio.

1. **Clonar el repositorio:**

   ```bash
   gh repo clone rondons-26/abp-m8-proyecto
   cd abp-m8-proyecto
   ```

2. **Instalar las dependencias:**

   ```bash
   npm install
   ```

3. **Configurar las variables de entorno:**

   Crea un archivo `.env` en la raíz del proyecto con la conexión a PostgreSQL y la configuración de sesión JWT:

   ```env
   DB_NAME=nombre_de_la_base_de_datos
   DB_USER=usuario_de_postgresql
   DB_PASSWORD=contraseña_de_postgresql
   DB_HOST=localhost
   DB_PORT=5432
   DB_DIALECT=postgres
   JWT_SECRET=clave_secreta_larga_y_segura
   NODE_ENV=development
   ```

   Usa valores propios en el entorno local y nunca publiques contraseñas, claves JWT u otros secretos en el repositorio.

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

[![Repositorio en GitHub](https://img.shields.io/badge/GitHub-Repositorio-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/rondons-26/abp-m8-proyecto)
[![Aplicación en Render](https://img.shields.io/badge/Render-Aplicaci%C3%B3n-46e3b7?style=for-the-badge&logo=render&logoColor=white)](https://abp-m8-proyecto.onrender.com/)

- **Repositorio:** [GitHub - CoreApp Enterprise](https://github.com/rondons-26/abp-m8-proyecto)
- **Aplicación desplegada:** [Render - CoreApp Enterprise](https://abp-m8-proyecto.onrender.com/)

---

_CoreApp Enterprise · Módulo 8 · 2026_