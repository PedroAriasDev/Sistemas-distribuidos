import { v4 as uuidv4 } from 'uuid';
import formidable from 'formidable';
import fs from 'fs/promises';
import path from 'path';
const db = require('../../lib/database');

// Configuración de Next.js para desactivar el bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Función para parsear el form-data
function parseForm(req) {
  return new Promise((resolve, reject) => {
    const uploadDir = path.join(process.cwd(), 'uploads');

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 100 * 1024 * 1024, // 100 MB límite
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Parsear el formulario
    const { fields, files } = await parseForm(req);

    // Validar que se haya enviado un archivo
    if (!files.file || !files.file[0]) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const uploadedFile = files.file[0];

    // Validar password_hash
    if (!fields.password_hash || !fields.password_hash[0]) {
      return res.status(400).json({ error: 'No se proporcionó password_hash' });
    }

    // Generar ID único
    const id = uuidv4();

    // Crear nombre del archivo con el UUID
    const fileExtension = path.extname(uploadedFile.originalFilename || '');
    const newFileName = `${id}${fileExtension}`;
    const newFilePath = path.join(process.cwd(), 'uploads', newFileName);

    // Renombrar el archivo
    await fs.rename(uploadedFile.filepath, newFilePath);

    // Obtener tamaño del archivo
    const stats = await fs.stat(newFilePath);
    const fileSize = stats.size;

    // Calcular fecha de expiración (72 horas desde ahora)
    const creationDate = new Date();
    const expirationDate = new Date(creationDate.getTime() + 72 * 60 * 60 * 1000);

    // Parsear destinatarios (si viene como string JSON, convertirlo a array)
    let destinatarios = null;
    if (fields.destinatarios && fields.destinatarios[0]) {
      try {
        destinatarios = JSON.parse(fields.destinatarios[0]);
      } catch {
        // Si no es JSON, asumir que es un string separado por comas
        destinatarios = fields.destinatarios[0].split(',').map(d => d.trim());
      }
    }

    // Crear el registro del paquete
    const packageData = {
      id,
      nombre_archivo_original: uploadedFile.originalFilename || 'archivo.zip',
      nombre_zip: newFileName,
      tamaño_bytes: fileSize,
      titulo: fields.title && fields.title[0] ? fields.title[0] : null,
      descripcion: fields.description && fields.description[0] ? fields.description[0] : null,
      fecha_creacion: creationDate.toISOString(),
      contraseña_hash: fields.password_hash[0],
      expiracion: expirationDate.toISOString(),
      es_valido: true,
      destinatarios,
      origin: fields.origin && fields.origin[0] ? fields.origin[0] : null,
    };

    // Guardar en la base de datos
    await db.savePackage(packageData);

    // Generar el link de descarga
    const downloadLink = `${req.headers.host}/api/download/${id}`;

    // Responder con éxito
    return res.status(200).json({
      id,
      downloadLink,
    });

  } catch (error) {
    console.error('Error al procesar la carga:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}
