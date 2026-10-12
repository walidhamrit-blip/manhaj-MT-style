import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Suivi de commande par référence (AM-XXXXX). */
export async function GET(request: Request) {
  try {
    const reference = new URL(request.url).searchParams.get('reference')?.trim() ?? '';
    if (!reference) return NextResponse.json({ found: false });

    const db = await ensureDatabase();
    const rows = await db.query<{ reference: string; status: string; total: string; created_at: string }>(
      `select reference, status, total, created_at from orders where upper(reference) = upper($1) limit 1`,
      [reference],
    );

    if (!rows.length) return NextResponse.json({ found: false });

    const order = rows[0];
    return NextResponse.json({
      found: true,
      reference: order.reference,
      status: order.status,
      total: Number(order.total),
      createdAt: String(order.created_at),
    });
  } catch (error) {
    console.error('[manhaj] GET /api/track :', error);
    return NextResponse.json({ found: false }, { status: 500 });
  }
}
