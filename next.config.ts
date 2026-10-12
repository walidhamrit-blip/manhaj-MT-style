import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Les paquets de base de données sont chargés côté serveur uniquement.
  serverExternalPackages: ['@electric-sql/pglite', '@neondatabase/serverless'],
  images: {
    // Les images sont fournies par URL (Unsplash, Drive, hébergeur du client...).
    // On utilise des <img> classiques, aucune restriction de domaine n'est donc nécessaire.
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
