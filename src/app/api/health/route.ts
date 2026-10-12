import { NextResponse } from 'next/server';
import { ensureDatabase, hasRemoteDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Diagnostic de la base de données — utile après un déploiement Vercel
 * pour vérifier que la connexion Neon fonctionne.
 * Aucune donnée sensible n'est exposée.
 */
export async function GET() {
  const startedAt = Date.now();
  try {
    const db = await ensureDatabase();
    const rows = await db.query<{ total: number }>('select count(*)::int as total from products');
    const texts = await db.query<{ total: number }>('select count(*)::int as total from texts');

    let host = '';
    try {
      host = hasRemoteDatabase ? new URL(process.env.DATABASE_URL ?? '').hostname : 'local (PGlite)';
    } catch {
      host = 'configuré';
    }

    return NextResponse.json({
      ok: true,
      driver: db.driver,
      database: host,
      counts: {
        products: Number(rows[0]?.total ?? 0),
        texts: Number(texts[0]?.total ?? 0),
      },
      latencyMs: Date.now() - startedAt,
      adminConfigured: Boolean(process.env.ADMIN_PASSWORD),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
        hint: 'Vérifiez la variable DATABASE_URL (chaîne de connexion Neon).',
      },
      { status: 500 },
    );
  }
}
