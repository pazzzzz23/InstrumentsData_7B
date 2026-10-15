# Paz Instruments

Aplicación web para registrar instrumentos con nombre de quien carga el dato, nombre del equipo, número de parte, número de serie y foto. Los datos se guardan en PostgreSQL y las fotos en Vercel Blob.

## Desarrollo local

Requiere Node.js 20 o superior. Instala dependencias con `npm install` y copia `.env.example` a `.env.local`. Completa las variables con las credenciales de tus integraciones antes de iniciar `npm run dev`.

La tabla `instruments` se crea automáticamente al consultar o guardar el primer registro. La aplicación acepta `POSTGRES_URL` o `DATABASE_URL` para PostgreSQL y requiere `BLOB_READ_WRITE_TOKEN` para cargar imágenes. Las fotos aceptadas son JPG, PNG y WEBP de hasta 5 MB.

## Despliegue en Vercel

1. Crea un repositorio en GitHub y sube el contenido de este proyecto a la rama principal.
2. En Vercel, selecciona **Add New → Project** y conecta GitHub.
3. Elige el repositorio y pulsa **Import**. Vercel detecta Next.js automáticamente.
4. En **Storage**, crea o conecta una base PostgreSQL del Marketplace (por ejemplo, Neon) y una tienda **Blob**.
5. Verifica que estén disponibles `POSTGRES_URL` (o `DATABASE_URL`) y `BLOB_READ_WRITE_TOKEN` en las variables del proyecto. Si agregas las integraciones después de importar, revisa sus variables y vuelve a desplegar.
6. Pulsa **Deploy**. Al abrir la aplicación, la tabla de instrumentos se inicializa automáticamente.

No se incluyen credenciales: Vercel las genera al conectar cada servicio. No subas `.env.local` al repositorio.

## Comandos

- `npm run dev`: servidor local.
- `npm run lint`: análisis de código.
- `npm run build`: compilación de producción.