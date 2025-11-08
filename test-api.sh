#!/bin/bash

# Script de prueba para las APIs
# Asegúrate de que el servidor esté corriendo (npm run dev)

echo "=== Test de API de Sistema de Archivos Temporales ==="
echo ""

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Crear un archivo de prueba
echo "${YELLOW}1. Creando archivo de prueba...${NC}"
echo "Este es un archivo de prueba" > test_file.txt
zip test_file.zip test_file.txt
echo "${GREEN}✓ Archivo creado${NC}"
echo ""

# 2. Calcular hash de contraseña (usando echo simple para el ejemplo)
PASSWORD_HASH="test_password_hash_123"
echo "${YELLOW}2. Password hash: ${PASSWORD_HASH}${NC}"
echo ""

# 3. Subir archivo
echo "${YELLOW}3. Subiendo archivo a /api/upload...${NC}"
UPLOAD_RESPONSE=$(curl -s -X POST http://localhost:3000/api/upload \
  -F "file=@test_file.zip" \
  -F "password_hash=${PASSWORD_HASH}" \
  -F "title=Archivo de Prueba" \
  -F "description=Este es un archivo de prueba del sistema")

echo "Response: ${UPLOAD_RESPONSE}"
echo ""

# Extraer ID y downloadLink
ID=$(echo $UPLOAD_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
DOWNLOAD_LINK=$(echo $UPLOAD_RESPONSE | grep -o '"downloadLink":"[^"]*' | cut -d'"' -f4)

if [ -z "$ID" ]; then
  echo "${RED}✗ Error: No se pudo subir el archivo${NC}"
  exit 1
fi

echo "${GREEN}✓ Archivo subido exitosamente${NC}"
echo "ID: ${ID}"
echo "Download Link: ${DOWNLOAD_LINK}"
echo ""

# 4. Validar contraseña
echo "${YELLOW}4. Validando contraseña con /api/validate...${NC}"
VALIDATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"${ID}\",\"password_hash\":\"${PASSWORD_HASH}\"}")

echo "Response: ${VALIDATE_RESPONSE}"
RESULT=$(echo $VALIDATE_RESPONSE | grep -o '"result":"[^"]*' | cut -d'"' -f4)

if [ "$RESULT" == "ok" ]; then
  echo "${GREEN}✓ Contraseña validada correctamente${NC}"
else
  echo "${RED}✗ Error: Validación fallida${NC}"
fi
echo ""

# 5. Probar validación con contraseña incorrecta
echo "${YELLOW}5. Probando con contraseña incorrecta...${NC}"
INVALID_RESPONSE=$(curl -s -X POST http://localhost:3000/api/validate \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"${ID}\",\"password_hash\":\"contraseña_incorrecta\"}")

echo "Response: ${INVALID_RESPONSE}"
RESULT=$(echo $INVALID_RESPONSE | grep -o '"result":"[^"]*' | cut -d'"' -f4)

if [ "$RESULT" == "invalid_password" ]; then
  echo "${GREEN}✓ Contraseña incorrecta detectada correctamente${NC}"
else
  echo "${RED}✗ Error: Debería rechazar contraseña incorrecta${NC}"
fi
echo ""

# 6. Descargar archivo
echo "${YELLOW}6. Descargando archivo desde /api/download/${ID}...${NC}"
curl -o downloaded_file.zip "http://localhost:3000/api/download/${ID}?password_hash=${PASSWORD_HASH}"
echo ""

if [ -f "downloaded_file.zip" ]; then
  echo "${GREEN}✓ Archivo descargado exitosamente${NC}"

  # Verificar el contenido
  unzip -q downloaded_file.zip -d temp_extract
  if [ -f "temp_extract/test_file.txt" ]; then
    echo "${GREEN}✓ Contenido del archivo verificado${NC}"
    rm -rf temp_extract
  fi
else
  echo "${RED}✗ Error: No se pudo descargar el archivo${NC}"
fi
echo ""

# Limpiar archivos de prueba
echo "${YELLOW}Limpiando archivos de prueba...${NC}"
rm -f test_file.txt test_file.zip downloaded_file.zip
echo "${GREEN}✓ Limpieza completada${NC}"
echo ""

echo "${GREEN}=== Pruebas completadas ===${NC}"
