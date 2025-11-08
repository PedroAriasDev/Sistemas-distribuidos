# Sistema de Compartición Temporal de Archivos Encriptados

Sistema de compartición de archivos temporales para la materia Sistemas Distribuidos. Los archivos se mantienen disponibles por 72 horas antes de expirar.

## Tecnologías

- **Node.js**: Entorno de ejecución
- **Next.js**: Framework React para el backend y frontend
- **React**: Librería para interfaces de usuario
- **UUID**: Generación de identificadores únicos
- **Formidable**: Manejo de archivos multipart/form-data
- **Bcrypt**: Hashing de contraseñas

## Estructura del Proyecto

```
Sistemas-distribuidos/
├── pages/
│   └── api/
│       ├── upload.js          # POST /api/upload
│       ├── validate.js        # POST /api/validate
│       └── download/
│           └── [id].js        # GET /api/download/:id
├── lib/
│   └── database.js            # Módulo de gestión de base de datos JSON
├── data/
│   └── packages.json          # Base de datos (se genera automáticamente)
├── uploads/                   # Carpeta para archivos subidos
├── package.json
├── next.config.js
└── .env.example
```

## Instalación

1. Clonar el repositorio:
```bash
git clone <url-del-repositorio>
cd Sistemas-distribuidos
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env` (opcional):
```bash
cp .env.example .env
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

## API Endpoints

### 1. POST /api/upload

Subir un archivo encriptado y comprimido.

**Request:**
- Content-Type: `multipart/form-data`
- Campos:
  - `file` (archivo): Archivo ZIP encriptado
  - `password_hash` (string): Hash de la contraseña
  - `title` (string, opcional): Título del paquete
  - `description` (string, opcional): Descripción
  - `origin` (string, opcional): Origen del paquete
  - `destinatarios` (string/JSON, opcional): Destinatarios (array o string separado por comas)

**Response exitoso (200):**
```json
{
  "id": "uuid-generado",
  "downloadLink": "localhost:3000/api/download/uuid-generado"
}
```

**Errores:**
- `400`: Falta archivo o password_hash
- `500`: Error interno del servidor

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@archivo.zip" \
  -F "password_hash=hash_de_tu_contraseña" \
  -F "title=Mi Archivo" \
  -F "description=Descripción del archivo" \
  -F "destinatarios=[\"usuario1@ejemplo.com\",\"usuario2@ejemplo.com\"]"
```

---

### 2. POST /api/validate

Validar contraseña y obtener metadata del archivo.

**Request:**
- Content-Type: `application/json`
- Body:
```json
{
  "id": "uuid-del-paquete",
  "password_hash": "hash_de_la_contraseña"
}
```

**Response exitoso (200):**
```json
{
  "result": "ok",
  "metadata": {
    "nombre_archivo_original": "archivo.zip",
    "nombre_zip": "uuid.zip",
    "tamaño_bytes": 1234567,
    "titulo": "Mi Archivo",
    "descripcion": "Descripción del archivo",
    "fecha_creacion": "2024-01-01T00:00:00.000Z",
    "expiracion": "2024-01-04T00:00:00.000Z"
  }
}
```

**Otros resultados posibles:**
```json
{
  "result": "expired"          // El link ha expirado
}
```
```json
{
  "result": "invalid_link"     // El link no existe o no es válido
}
```
```json
{
  "result": "invalid_password" // La contraseña es incorrecta
}
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d '{
    "id": "uuid-del-paquete",
    "password_hash": "hash_de_tu_contraseña"
  }'
```

---

### 3. GET /api/download/:id

Descargar el archivo encriptado.

**Request:**
- URL: `/api/download/:id?password_hash=hash_de_la_contraseña`
- Parámetros:
  - `id` (ruta): UUID del paquete
  - `password_hash` (query): Hash de la contraseña

**Response exitoso (200):**
- Content-Type: `application/zip`
- Content-Disposition: `attachment; filename="archivo_original.zip"`
- Body: Stream del archivo

**Errores:**
- `400`: Falta password_hash
- `401`: Contraseña incorrecta
- `404`: Link no válido, expirado o archivo no encontrado
- `500`: Error interno del servidor

**Ejemplo con cURL:**
```bash
curl -o archivo_descargado.zip \
  "http://localhost:3000/api/download/uuid-del-paquete?password_hash=hash_de_tu_contraseña"
```

**Ejemplo en navegador:**
```
http://localhost:3000/api/download/uuid-del-paquete?password_hash=hash_de_tu_contraseña
```

---

## Esquema de Base de Datos

La base de datos es un archivo JSON (`data/packages.json`) con el siguiente formato:

```json
{
  "packages": [
    {
      "id": "uuid-v4",
      "nombre_archivo_original": "documento.zip",
      "nombre_zip": "uuid.zip",
      "tamaño_bytes": 1234567,
      "titulo": "Título opcional",
      "descripcion": "Descripción opcional",
      "fecha_creacion": "2024-01-01T00:00:00.000Z",
      "contraseña_hash": "hash_de_contraseña",
      "expiracion": "2024-01-04T00:00:00.000Z",
      "es_valido": true,
      "destinatarios": ["email1@ejemplo.com", "email2@ejemplo.com"],
      "origin": "origen_opcional"
    }
  ]
}
```

## Seguridad

1. **Hashing de contraseñas**: Las contraseñas deben ser hasheadas en el cliente antes de enviarlas al servidor. Se recomienda usar bcrypt o argon2.

2. **Expiración automática**: Los archivos se marcan como no válidos después de 72 horas.

3. **Validación de archivos**: El sistema valida que los archivos existan antes de permitir su descarga.

## Notas Importantes

- Los archivos se almacenan en la carpeta `uploads/`
- La base de datos JSON se crea automáticamente en `data/packages.json`
- El límite de tamaño de archivo es de 100 MB (configurable en el código)
- Los links expiran después de 72 horas desde la creación

## Scripts Disponibles

- `npm run dev`: Iniciar servidor de desarrollo
- `npm run build`: Construir para producción
- `npm start`: Iniciar servidor de producción
- `npm run lint`: Ejecutar linter

## Desarrollo Futuro

Posibles mejoras para el proyecto:
- [ ] Implementar interfaz de usuario con React
- [ ] Agregar autenticación de usuarios
- [ ] Implementar sistema de limpieza automática de archivos expirados
- [ ] Agregar soporte para múltiples archivos
- [ ] Implementar notificaciones por email a destinatarios
- [ ] Agregar estadísticas de descargas
- [ ] Implementar rate limiting
- [ ] Agregar tests unitarios e integración

## Autor

Proyecto desarrollado para la materia Sistemas Distribuidos.
