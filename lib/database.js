const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(process.cwd(), 'data', 'packages.json');

// Inicializar la base de datos si no existe
async function initDB() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify({ packages: [] }, null, 2));
  }
}

// Leer todos los paquetes
async function readDB() {
  await initDB();
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

// Escribir en la base de datos
async function writeDB(data) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// Guardar un nuevo paquete
async function savePackage(packageData) {
  const db = await readDB();
  db.packages.push(packageData);
  await writeDB(db);
  return packageData;
}

// Buscar un paquete por ID
async function findPackageById(id) {
  const db = await readDB();
  return db.packages.find(pkg => pkg.id === id);
}

// Actualizar un paquete
async function updatePackage(id, updates) {
  const db = await readDB();
  const index = db.packages.findIndex(pkg => pkg.id === id);

  if (index === -1) {
    return null;
  }

  db.packages[index] = { ...db.packages[index], ...updates };
  await writeDB(db);
  return db.packages[index];
}

// Verificar si un paquete ha expirado
function isExpired(expirationDate) {
  return new Date(expirationDate) < new Date();
}

// Validar un paquete (verificar si existe, está válido y no ha expirado)
async function validatePackage(id) {
  const pkg = await findPackageById(id);

  if (!pkg) {
    return { valid: false, reason: 'invalid_link' };
  }

  if (!pkg.es_valido) {
    return { valid: false, reason: 'invalid_link' };
  }

  if (isExpired(pkg.expiracion)) {
    // Marcar como no válido
    await updatePackage(id, { es_valido: false });
    return { valid: false, reason: 'expired' };
  }

  return { valid: true, package: pkg };
}

module.exports = {
  initDB,
  readDB,
  writeDB,
  savePackage,
  findPackageById,
  updatePackage,
  isExpired,
  validatePackage
};
