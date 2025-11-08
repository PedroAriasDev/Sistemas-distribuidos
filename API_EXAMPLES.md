# Ejemplos de Uso de la API

Este documento contiene ejemplos prácticos de cómo usar las APIs desde el frontend con JavaScript/React.

## Instalación de bcrypt para el frontend

Para hashear contraseñas en el cliente, puedes usar `bcryptjs` (versión JavaScript pura):

```bash
npm install bcryptjs
```

## 1. Subir Archivo (Upload)

### JavaScript con Fetch

```javascript
import bcrypt from 'bcryptjs';

async function uploadFile(file, password, metadata) {
  try {
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password_hash', password_hash);
    formData.append('title', metadata.title || '');
    formData.append('description', metadata.description || '');
    formData.append('origin', metadata.origin || '');

    if (metadata.destinatarios) {
      formData.append('destinatarios', JSON.stringify(metadata.destinatarios));
    }

    // Hacer la petición
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Archivo subido exitosamente');
      console.log('ID:', data.id);
      console.log('Download Link:', data.downloadLink);
      return data;
    } else {
      throw new Error(data.error || 'Error al subir archivo');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
const fileInput = document.getElementById('fileInput');
const file = fileInput.files[0];

uploadFile(file, 'mi_contraseña_segura', {
  title: 'Documentos importantes',
  description: 'Archivos del proyecto',
  origin: 'usuario@ejemplo.com',
  destinatarios: ['destino1@ejemplo.com', 'destino2@ejemplo.com']
});
```

### React Component

```jsx
import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function FileUploader() {
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !password) {
      alert('Por favor selecciona un archivo y proporciona una contraseña');
      return;
    }

    setLoading(true);

    try {
      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('password_hash', password_hash);
      formData.append('title', title);
      formData.append('description', description);

      // Enviar
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        alert('Archivo subido exitosamente!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al subir el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <div>
          <label>Archivo:</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Título (opcional):</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label>Descripción (opcional):</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </form>

      {uploadResult && (
        <div>
          <h3>Archivo subido exitosamente!</h3>
          <p>ID: {uploadResult.id}</p>
          <p>Link de descarga: {uploadResult.downloadLink}</p>
        </div>
      )}
    </div>
  );
}

export default FileUploader;
```

## 2. Validar Contraseña

### JavaScript con Fetch

```javascript
import bcrypt from 'bcryptjs';

async function validatePassword(id, password) {
  try {
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Hacer la petición
    const response = await fetch('http://localhost:3000/api/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        password_hash,
      }),
    });

    const data = await response.json();

    switch (data.result) {
      case 'ok':
        console.log('Contraseña válida!');
        console.log('Metadata:', data.metadata);
        return { valid: true, metadata: data.metadata };

      case 'expired':
        console.log('El link ha expirado');
        return { valid: false, reason: 'expired' };

      case 'invalid_link':
        console.log('Link no válido');
        return { valid: false, reason: 'invalid_link' };

      case 'invalid_password':
        console.log('Contraseña incorrecta');
        return { valid: false, reason: 'invalid_password' };

      default:
        throw new Error('Respuesta desconocida');
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
validatePassword('uuid-del-archivo', 'mi_contraseña')
  .then(result => {
    if (result.valid) {
      console.log('Archivo disponible para descarga');
      console.log('Nombre:', result.metadata.nombre_archivo_original);
      console.log('Tamaño:', result.metadata.tamaño_bytes, 'bytes');
    } else {
      console.log('No se puede descargar:', result.reason);
    }
  });
```

### React Component

```jsx
import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function FileValidator({ fileId }) {
  const [password, setPassword] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleValidate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Validar
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: fileId,
          password_hash,
        }),
      });

      const data = await response.json();

      if (data.result === 'ok') {
        setMetadata(data.metadata);
      } else {
        const errorMessages = {
          expired: 'El link ha expirado (72 horas)',
          invalid_link: 'El link no es válido',
          invalid_password: 'Contraseña incorrecta',
        };
        setError(errorMessages[data.result] || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al validar');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div>
      <form onSubmit={handleValidate}>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Validando...' : 'Validar y Ver Detalles'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      )}

      {metadata && (
        <div>
          <h3>Información del Archivo</h3>
          <p><strong>Nombre:</strong> {metadata.nombre_archivo_original}</p>
          <p><strong>Tamaño:</strong> {formatFileSize(metadata.tamaño_bytes)}</p>
          {metadata.titulo && <p><strong>Título:</strong> {metadata.titulo}</p>}
          {metadata.descripcion && <p><strong>Descripción:</strong> {metadata.descripcion}</p>}
          <p><strong>Fecha de creación:</strong> {new Date(metadata.fecha_creacion).toLocaleString()}</p>
          <p><strong>Expira:</strong> {new Date(metadata.expiracion).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default FileValidator;
```

## 3. Descargar Archivo

### JavaScript con Fetch

```javascript
import bcrypt from 'bcryptjs';

async function downloadFile(id, password, filename) {
  try {
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Crear URL con el hash
    const url = `http://localhost:3000/api/download/${id}?password_hash=${encodeURIComponent(password_hash)}`;

    // Hacer la petición
    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al descargar');
    }

    // Obtener el blob
    const blob = await response.blob();

    // Crear un link temporal y hacer click para descargar
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'archivo_descargado.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Limpiar el objeto URL
    window.URL.revokeObjectURL(downloadUrl);

    console.log('Archivo descargado exitosamente');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Ejemplo de uso
downloadFile('uuid-del-archivo', 'mi_contraseña', 'mi_archivo.zip');
```

### React Component

```jsx
import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function FileDownloader({ fileId, fileName }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Hashear contraseña
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Crear URL
      const url = `/api/download/${fileId}?password_hash=${encodeURIComponent(password_hash)}`;

      // Descargar
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descargar');
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'archivo.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      alert('Archivo descargado exitosamente!');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleDownload}>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Descargando...' : 'Descargar Archivo'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
        </div>
      )}
    </div>
  );
}

export default FileDownloader;
```

## Flujo Completo de Ejemplo

```jsx
import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function CompleteFileShareApp() {
  const [mode, setMode] = useState('upload'); // 'upload' o 'download'
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [fileId, setFileId] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('password_hash', password_hash);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
        alert('Archivo subido! Comparte el ID: ' + data.id);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al subir: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    setLoading(true);

    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId, password_hash }),
      });

      const data = await response.json();

      if (data.result === 'ok') {
        setMetadata(data.metadata);
      } else {
        alert('Error: ' + data.result);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);

    try {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const url = `/api/download/${fileId}?password_hash=${encodeURIComponent(password_hash)}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error('Error al descargar');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = metadata?.nombre_archivo_original || 'archivo.zip';
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Sistema de Compartición de Archivos</h1>

      <div>
        <button onClick={() => setMode('upload')}>Subir Archivo</button>
        <button onClick={() => setMode('download')}>Descargar Archivo</button>
      </div>

      {mode === 'upload' && (
        <div>
          <h2>Subir Archivo</h2>
          <form onSubmit={handleUpload}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Subiendo...' : 'Subir'}
            </button>
          </form>

          {uploadResult && (
            <div>
              <h3>Archivo Subido!</h3>
              <p>ID: {uploadResult.id}</p>
              <p>Comparte este ID con los destinatarios</p>
            </div>
          )}
        </div>
      )}

      {mode === 'download' && (
        <div>
          <h2>Descargar Archivo</h2>
          <input
            type="text"
            placeholder="ID del archivo"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleValidate} disabled={loading}>
            Validar
          </button>

          {metadata && (
            <div>
              <h3>Información del Archivo</h3>
              <p>Nombre: {metadata.nombre_archivo_original}</p>
              <p>Tamaño: {(metadata.tamaño_bytes / 1024).toFixed(2)} KB</p>
              <button onClick={handleDownload} disabled={loading}>
                {loading ? 'Descargando...' : 'Descargar'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CompleteFileShareApp;
```

## Notas Importantes

1. **Hashing de Contraseñas**: Asegúrate de usar la misma configuración de bcrypt (salt rounds) tanto al subir como al descargar.

2. **CORS**: Si tu frontend está en un dominio diferente al backend, necesitarás configurar CORS en Next.js.

3. **HTTPS**: En producción, siempre usa HTTPS para proteger las contraseñas en tránsito.

4. **Manejo de Errores**: Los ejemplos incluyen manejo básico de errores, pero deberías expandirlo según tus necesidades.

5. **Progreso de Carga**: Para archivos grandes, considera agregar un indicador de progreso usando XMLHttpRequest o la API de Fetch con streams.
