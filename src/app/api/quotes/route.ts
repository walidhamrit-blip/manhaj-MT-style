import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/lib/db';
import { makeReference } from '@/lib/format';

export const dynamic = 'force-dynamic';

/** Enregistre une demande de devis (écoles, entreprises, gros volumes). */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const contactName = String(payload.contactName ?? '').trim();
    const phone = String(payload.phone ?? '').trim();

    if (!contactName || !phone) {
      return NextResponse.json({ error: 'Nom et téléphone sont obligatoires.' }, { status: 400 });
    }

    const db = await ensureDatabase();
    const rows = await db.query<{ reference: string }>(
      `insert into quotes (reference, contact_name, company, phone, email, message, status)
       values ($1,$2,$3,$4,$5,$6,'new')
       returning reference`,
      [
        makeReference('DV'),
        contactName,
        String(payload.company ?? '').trim(),
        phone,
        String(payload.email ?? '').trim(),
        String(payload.message ?? '').trim(),
      ],
    );

    return NextResponse.json({ ok: true, reference: rows[0]?.reference });
  } catch (error) {
    console.error('[manhaj] POST /api/quotes :', error);
    return NextResponse.json({ error: 'Enregistrement impossible.' }, { status: 500 });
  }
}
