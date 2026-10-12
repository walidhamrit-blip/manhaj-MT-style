import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Inscription à la newsletter. */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const email = String(payload.email ?? '').trim().toLowerCase();

    if (!EMAIL.test(email)) {
      return NextResponse.json({ error: 'Adresse e-mail invalide.' }, { status: 400 });
    }

    const db = await ensureDatabase();
    await db.query(
      `insert into subscribers (email) values ($1)
       on conflict (email) do update set status = 'active'`,
      [email],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[manhaj] POST /api/subscribers :', error);
    return NextResponse.json({ error: 'Inscription impossible.' }, { status: 500 });
  }
}
