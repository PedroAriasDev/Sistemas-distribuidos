/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  api: {
    bodyParser: false, // Deshabilitamos el bodyParser predeterminado para manejar archivos
  },
}

module.exports = nextConfig
