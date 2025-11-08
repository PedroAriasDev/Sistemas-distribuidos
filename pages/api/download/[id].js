import fs from 'fs';
import path from 'path';
const db = require('../../../lib/database');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id } = req.query;

    // Obtener password_hash del query string
    const password_hash = req.query.password_hash;

    // Validar que se proporcionó el password_hash
    if (!password_hash) {
      return res.status(400).json({
        error: 'Se requiere el parámetro password_hash en la URL'
      });
    }

    // Validar el paquete
    const validation = await db.validatePackage(id);

    if (!validation.valid) {
      const errorMessages = {
        'invalid_link': 'El link de descarga no es válido o no existe',
        'expired': 'El link de descarga ha expirado'
      };

      return res.status(404).json({
        error: errorMessages[validation.reason] || 'Error desconocido'
      });
    }

    const pkg = validation.package;

    // Verificar la contraseña
    if (pkg.contraseña_hash !== password_hash) {
      return res.status(401).json({
        error: 'Contraseña incorrecta'
      });
    }

    // Ruta del archivo
    const filePath = path.join(process.cwd(), 'uploads', pkg.nombre_zip);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'El archivo no se encuentra en el servidor'
      });
    }

    // Obtener el tamaño del archivo
    const stat = fs.statSync(filePath);

    // Configurar headers para la descarga
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${pkg.nombre_archivo_original}"`);
    res.setHeader('Content-Length', stat.size);

    // Crear stream de lectura y enviarlo al cliente
    const fileStream = fs.createReadStream(filePath);

    fileStream.on('error', (error) => {
      console.error('Error al leer el archivo:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error al leer el archivo' });
      }
    });

    // Enviar el archivo
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error al descargar:', error);

    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
}
