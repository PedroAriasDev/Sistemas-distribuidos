const db = require('../../lib/database');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id, password_hash } = req.body;

    // Validar que se proporcionaron los campos requeridos
    if (!id || !password_hash) {
      return res.status(400).json({
        error: 'Se requieren los campos: id y password_hash'
      });
    }

    // Validar el paquete (verifica existencia, validez y expiración)
    const validation = await db.validatePackage(id);

    if (!validation.valid) {
      return res.status(200).json({
        result: validation.reason
      });
    }

    const pkg = validation.package;

    // Comparar el hash de la contraseña
    if (pkg.contraseña_hash !== password_hash) {
      return res.status(200).json({
        result: 'invalid_password'
      });
    }

    // Si todo es válido, devolver ok con la metadata
    const metadata = {
      nombre_archivo_original: pkg.nombre_archivo_original,
      nombre_zip: pkg.nombre_zip,
      tamaño_bytes: pkg.tamaño_bytes,
      titulo: pkg.titulo,
      descripcion: pkg.descripcion,
      fecha_creacion: pkg.fecha_creacion,
      expiracion: pkg.expiracion
    };

    return res.status(200).json({
      result: 'ok',
      metadata
    });

  } catch (error) {
    console.error('Error al validar:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}
