import { ensureDatabase } from '@/lib/db';
import { hasValidSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Export CSV des abonnés à la newsletter (réservé à l'administration). */
export async function GET() {
  if (!(await hasValidSession())) {
    return new Response('Non autorisé', { status: 401 });
  }

  const db = await ensureDatabase();
  const rows = await db.query<{ email: string; status: string; created_at: string }>(
    'select email, status, created_at from subscribers order by created_at desc',
  );

  const lines = ['email;statut;date_inscription'];
  for (const row of rows) {
    const date = new Date(row.created_at).toISOString().slice(0, 19).replace('T', ' ');
    lines.push(`${row.email};${row.status};${date}`);
  }

  return new Response(`\uFEFF${lines.join('\n')}`, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="abonnes-manhaj-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
