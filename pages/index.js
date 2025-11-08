export default function Home() {
  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Sistema de Compartición Temporal de Archivos</h1>
      <p>API para compartir archivos encriptados con expiración de 72 horas.</p>

      <h2>Endpoints Disponibles:</h2>
      <ul>
        <li><strong>POST /api/upload</strong> - Subir archivo</li>
        <li><strong>POST /api/validate</strong> - Validar contraseña y obtener metadata</li>
        <li><strong>GET /api/download/:id</strong> - Descargar archivo</li>
      </ul>

      <p>
        Ver el archivo <code>README.md</code> para documentación completa.
      </p>
    </div>
  );
}
