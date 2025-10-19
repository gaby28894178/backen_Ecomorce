# Para Tienda API

![Arquitectura Backend y Flujo de Usuario](docs/diagrama.bmp)

> Nota: coloca la imagen compartida en `docs/diagrama.bmp` para que se renderice en el README.

## Seguridad y Arquitectura
- Middleware base: `helmet`, `cors`, `express.json`, `static /public`.
- Rutas bajo `Base URL` `http://localhost:4001/api/v1` (en dev usamos `4002`).
- Autenticación: JWT con `authRequired` (verifica `Authorization: Bearer <token>` y adjunta `req.user`).
- Manejador de errores global: convierte errores de Sequelize y JSON inválido en respuestas 4xx limpias.
- Controladores: aplican validaciones de negocio (IDs válidos, existencia de recursos, roles cuando corresponda).
- Modelos (Sequelize): constraints (único `email`, tipos, defaults) y hash de password con `bcrypt` en `beforeCreate`.

### Capas en la app
- `Express App`: recibe requests, aplica middlewares y enruta a `controllers`.
- `Routes`: agregan `authRequired` donde procede (`productos` protegido, `carritos` protegido).
- `Controllers`: implementan lógica (carrito, productos, usuarios) y delegan a `models`.
- `Error Handler`: capa final que unifica mensajes y códigos HTTP.
- `Sequelize`: mapea a PostgreSQL via `DATABASE_URL`.

## Métodos principales (API)
- Auth
  - `POST /auth/login` y `POST /usuarios/login` → devuelve `{ token, expiresIn, usuario }`.
- Usuarios
  - `POST /usuarios` crear, `GET /usuarios`, `GET /usuarios/:id`, `PUT /usuarios/:id`, `DELETE /usuarios/:id`.
- Productos
  - `POST /productos` (protegido, requiere `Bearer <token>`; disponible para todos los usuarios autenticados), `GET /productos`, `GET /productos/:id`.
- Carritos (protegidos)
  - `POST /carritos/crear`
  - `POST /carritos/agregar`
  - `DELETE /carritos/item/:carritoItemId`
  - `GET /carritos/usuario/:usuarioId`
  - `GET /carritos/usuario/:usuarioId/total`
  - `POST /carritos/checkout` (nuevo)

## Seguridad implementada
- JWT
  - Verificación en `authRequired` con `JWT_SECRET` y expiración configurable con `JWT_EXPIRES_IN`.
  - Acceso a `req.user` para aplicar controles por usuario en controladores.
- Hardening HTTP
  - `helmet` activo (con `crossOriginResourcePolicy: false` para servir estáticos).
  - `cors` habilitado; configurable por entorno si se requiere restringir orígenes.
- Validaciones
  - Controladores validan IDs (`usuarioId` entero ≥ 1) y existencia de entidades.
  - Modelos con constraints de Sequelize: tipos, `unique` en `email`, enums y defaults.
  - `bcrypt` para hash de `password` en `User.beforeCreate`.
- Errores
  - Handler global traduce validaciones, duplicados, FK y JSON inválido a 400; resto a 500.
- Rutas protegidas
  - `POST /productos` y todas las de `carritos` requieren `Bearer <token>`.

## Roles y Permisos
- Todos los usuarios autenticados (role "user") pueden crear productos y comprar: actúan como vendedores y compradores.
- El role "admin" no se asigna por ahora; reservado para gestión de cuentas futura.
- `POST /productos` permanece habilitado para usuarios autenticados; cuando se habilite `admin`, podrá restringirse a ese rol.

## Mejoras recientes
- Validación robusta de `usuarioId` y corrección de `include` anidado en `Carrito.controller`.
- Nuevo `POST /carritos/checkout` con:
  - Transacción Sequelize: decremento de stock, persistencia de compras en `User.productos_comprados` y vaciado de ítems del carrito.
  - Chequeo de stock por producto con respuesta clara `400` y detalle del `productoId`.
  - Respuesta con `mensaje`, `total` y `detalles` por item.
- Postman
  - Se agregó `Postman_Para_Tienda.json` con login y carrito/checkout.
- Documentación
  - README ampliado con seguridad, arquitectura y ejemplos curl.

## Ejemplo de Checkout (curl)
```bash
curl.exe -s -X POST http://localhost:4001/api/v1/carritos/checkout \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  --data "{}"
```

## Despliegue en Vercel
- Preparación incluidos en repo:
  - `vercel.json` con `@vercel/node` y rutas a `api/index.js`.
  - `api/index.js` envuelve `src/app.js` para serverless y sincroniza la DB al primer request.
- Variables de entorno en Vercel (Project Settings → Environment Variables):
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `DATABASE_SSL` (opcional, usar `true` si tu proveedor exige SSL)
- Pasos (CLI):
  - Instala CLI: `npm i -g vercel`
  - Inicia sesión: `vercel login`
  - Despliega: `vercel`
  - Opcional: `vercel --prod` para producción.

## URLs en Vercel
- Base: `https://<tu-proyecto>.vercel.app/api/v1`
- Auth
  - `POST https://<tu-proyecto>.vercel.app/api/v1/auth/login`
  - `POST https://<tu-proyecto>.vercel.app/api/v1/usuarios/login`
- Usuarios
  - `GET https://<tu-proyecto>.vercel.app/api/v1/usuarios`
  - `GET https://<tu-proyecto>.vercel.app/api/v1/usuarios/:id`
  - `POST https://<tu-proyecto>.vercel.app/api/v1/usuarios`
  - `PUT https://<tu-proyecto>.vercel.app/api/v1/usuarios/:id`
  - `DELETE https://<tu-proyecto>.vercel.app/api/v1/usuarios/:id`
- Productos (protegido)
  - `GET https://<tu-proyecto>.vercel.app/api/v1/productos`
  - `GET https://<tu-proyecto>.vercel.app/api/v1/productos/:id`
  - `POST https://<tu-proyecto>.vercel.app/api/v1/productos` (requiere `Authorization: Bearer <token>`)
- Carritos (protegido)
  - `POST https://<tu-proyecto>.vercel.app/api/v1/carritos/crear`
  - `POST https://<tu-proyecto>.vercel.app/api/v1/carritos/agregar`
  - `DELETE https://<tu-proyecto>.vercel.app/api/v1/carritos/item/:carritoItemId`
  - `GET https://<tu-proyecto>.vercel.app/api/v1/carritos/usuario/:usuarioId`
  - `GET https://<tu-proyecto>.vercel.app/api/v1/carritos/usuario/:usuarioId/total`
  - `POST https://<tu-proyecto>.vercel.app/api/v1/carritos/checkout`

### Solución a 404 NOT_FOUND en Vercel
- Se configuró `rewrites` en `vercel.json` para enrutar `/(.*)` a `api/index.js`.
- Se añadió ruta raíz `/` en Express que responde `{ status: "ok", baseUrl: "/api/v1" }`.
- Vuelve a desplegar con `vercel` o `vercel --prod` para aplicar los cambios.

## Repositorio GitHub
- URL: `https://github.com/gaby28894178/backen_Ecomorce`
- Rama principal: `GrupalPrincipal`
- Remoto configurado: `origin`
- Inicializa y sube el repo (no incluye `.env` por `.gitignore`):
  - `git init`
  - `git add . && git commit -m "init"`
  - Crea repo en GitHub y copia URL SSH/HTTPS.
  - `git remote add origin <URL_DEL_REPO>`
  - `git branch -M main`
  - `git push -u origin main`

## Postman: entornos
- Local: importa `posman/Para_Tienda.postman_environment.json`.
- Vercel: importa `posman/Para_Tienda.vercel.postman_environment.json` y reemplaza `your-project` con el nombre real del proyecto (`https://<tu-proyecto>.vercel.app/api/v1`).
- Después de `Login`, el script guarda `{{token}}` y se usa automáticamente en rutas protegidas.

## Buenas prácticas sugeridas
- Restringir CORS por entorno (`ALLOWED_ORIGINS`).
- Rotar `JWT_SECRET` y usar valores distintos por entorno.
- Auditar acciones sensibles (compra/checkout) en una tabla de órdenes.
- Limitar quién puede crear productos (p.ej. `role = admin`).
- Añadir validación de payload con librería (p.ej. `joi`) si se requiere.# backen_Ecomorce
