import { NextResponse } from 'next/server';
import { ensureDatabase } from '@/lib/db';
import { getProducts, getSettings } from '@/lib/data';
import { makeReference } from '@/lib/format';

export const dynamic = 'force-dynamic';

type IncomingItem = { id?: unknown; qty?: unknown };

/**
 * Enregistre une commande envoyée par le site.
 * Les prix sont relus depuis la base (jamais depuis le navigateur).
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const items = Array.isArray(payload.items) ? (payload.items as IncomingItem[]) : [];
    const cleaned = items
      .map((item) => ({
        id: Number(item.id),
        qty: Math.min(Math.max(Math.floor(Number(item.qty) || 0), 1), 999),
      }))
      .filter((item) => Number.isFinite(item.id) && item.id > 0);

    if (!cleaned.length) {
      return NextResponse.json({ error: 'Le panier est vide.' }, { status: 400 });
    }

    const customerName = String(payload.customerName ?? '').trim();
    const phone = String(payload.phone ?? '').trim();
    const address = String(payload.address ?? '').trim();
    if (!customerName || !phone || !address) {
      return NextResponse.json({ error: 'Nom, téléphone et adresse sont obligatoires.' }, { status: 400 });
    }

    const db = await ensureDatabase();
    const [products, settings] = await Promise.all([getProducts(db), getSettings(db)]);

    const lines = cleaned
      .map((item) => {
        const product = products.find((p) => p.id === item.id && p.active);
        if (!product) return null;
        return {
          productId: product.id,
          nameAr: product.nameAr,
          nameEn: product.nameEn,
          price: product.price,
          qty: item.qty,
          lineTotal: Math.round(product.price * item.qty * 100) / 100,
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    if (!lines.length) {
      return NextResponse.json({ error: 'Aucun produit disponible dans le panier.' }, { status: 400 });
    }

    const subtotal = Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;
    const threshold = Number(settings['shop.free_delivery_threshold'] ?? 150);
    const fee = Number(settings['shop.delivery_fee'] ?? 0);
    const delivery = subtotal >= threshold ? 0 : fee;
    const total = Math.round((subtotal + delivery) * 100) / 100;

    const reference = /^[A-Z0-9-]{4,20}$/.test(String(payload.reference ?? ''))
      ? String(payload.reference)
      : makeReference();

    const orderRows = await db.query<{ id: number; reference: string; created_at: string }>(
      `insert into orders
         (reference, customer_name, phone, address, city, note, payment_method, subtotal, delivery, total, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new')
       returning id, reference, created_at`,
      [
        reference, customerName, phone, address,
        String(payload.city ?? ''), String(payload.note ?? ''),
        String(payload.paymentMethod ?? 'cod'), subtotal, delivery, total,
      ],
    );

    const order = orderRows[0];
    if (!order) throw new Error('Insertion impossible');

    try {
      for (const line of lines) {
        await db.query(
          `insert into order_items (order_id, product_id, name_ar, name_en, price, qty, line_total)
           values ($1,$2,$3,$4,$5,$6,$7)`,
          [order.id, line.productId, line.nameAr, line.nameEn, line.price, line.qty, line.lineTotal],
        );
      }
    } catch (error) {
      await db.query('delete from orders where id = $1', [order.id]);
      throw error;
    }

    return NextResponse.json({
      order: {
        id: Number(order.id),
        reference: order.reference,
        customerName,
        phone,
        address,
        city: String(payload.city ?? ''),
        total,
        subtotal,
        delivery,
        status: 'new',
        createdAt: String(order.created_at),
        items: lines,
      },
    });
  } catch (error) {
    console.error('[manhaj] POST /api/orders :', error);
    return NextResponse.json({ error: 'Erreur lors de l’enregistrement de la commande.' }, { status: 500 });
  }
}
