/**
 * Test de bout en bout des écritures du panneau d'administration.
 *
 * Il rejoue exactement ce que fait le navigateur lorsqu'un formulaire
 * d'administration est envoyé (protocole « server action » de Next.js) :
 *   1. ouverture d'une page d'édition avec le cookie de session,
 *   2. envoi du formulaire avec des valeurs modifiées,
 *   3. vérification que le site public affiche la nouvelle valeur.
 *
 *   node scripts/smoke-test.mjs [http://127.0.0.1:3000]
 */
import { createHmac } from 'node:crypto';

const BASE = process.argv[2] || 'http://127.0.0.1:3000';
const SECRET = process.env.AUTH_SECRET || 'dev-secret-local-8f2c1a9b7e4d6c3a';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const expires = Date.now() + 3600 * 1000;
const signature = createHmac('sha256', SECRET).update(`admin:${expires}`).digest('hex');
const cookie = `manhaj_admin_session=${expires}.${signature}`;

let failures = 0;
const check = (label, ok, detail = '') => {
  console.log(`${ok ? '✓' : '✗'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
};

function decode(value) {
  return String(value ?? '')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Extrait tous les champs du formulaire contenant `marker` :
 * champs cachés du protocole « server action » + valeurs actuelles des champs.
 */
function findForm(html, marker) {
  const index = html.indexOf(`name="${marker}"`);
  if (index < 0) return null;
  const start = html.lastIndexOf('<form', index);
  const end = html.indexOf('</form>', index);
  const form = html.slice(start, end);
  const fields = {};
  for (const match of form.matchAll(/<input\s+([^>]*)\/?>/g)) {
    const attrs = match[1];
    const name = /name="([^"]+)"/.exec(attrs)?.[1];
    if (!name) continue;
    const type = /type="([^"]+)"/.exec(attrs)?.[1] ?? 'text';
    if (type === 'checkbox') {
      if (/checked/.test(attrs)) fields[name] = 'on';
      continue;
    }
    fields[name] = decode(/value="([^"]*)"/.exec(attrs)?.[1] ?? '');
  }
  for (const match of form.matchAll(/<textarea[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/textarea>/g)) {
    fields[match[1]] = decode(match[2]);
  }
  return fields;
}

async function get(path, withCookie = true) {
  const response = await fetch(`${BASE}${path}`, {
    headers: withCookie ? { cookie } : {},
    redirect: 'manual',
  });
  return { status: response.status, body: await response.text() };
}

async function main() {
  console.log(`\n── Test du panneau d'administration sur ${BASE} ──\n`);

  /* 1. Pages protégées */
  const login = await get('/admin/login', false);
  check('page de connexion accessible', login.status === 200 && login.body.includes('password'));

  const anonymous = await fetch(`${BASE}/admin/products`, { redirect: 'manual' });
  check(
    '/admin redirige un visiteur non connecté',
    anonymous.status === 307 || anonymous.status === 302 || anonymous.status === 303,
    `statut ${anonymous.status}`,
  );

  const dash = await get('/admin');
  check('tableau de bord avec session', dash.status === 200 && dash.body.includes('Tableau de bord'));

  /* 2. Écriture : modification d'un produit */
  const edit = await get('/admin/products/1');
  const hidden = findForm(edit.body, 'price');
  if (!hidden) {
    check('formulaire produit trouvé', false);
  } else {
    check('formulaire produit trouvé', true);
    const marker = 'SMOKE-' + Date.now().toString().slice(-6);
    const payload = {
      ...hidden,
      name_ar: `منتج اختبار ${marker}`,
      name_en: `Smoke test product ${marker}`,
      brand: 'TEST',
      category_id: '1',
      price: '77.5',
      old_price: '99',
      stock_ar: 'متوفر',
      stock_en: 'IN STOCK',
      rating: '4.8',
      keywords: 'smoke test',
      image_url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?auto=format&fit=crop&w=600&q=80',
      sort: '10',
      active: 'on',
    };
    const form = new FormData();
    for (const [key, value] of Object.entries(payload)) form.append(key, value);

    const response = await fetch(`${BASE}/admin/products/1`, {
      method: 'POST',
      headers: { cookie },
      body: form,
      redirect: 'manual',
    });
    check('enregistrement du produit', response.status === 303, `statut ${response.status}`);

    const home = await get('/', false);
    check(
      'le site public affiche la nouvelle valeur',
      home.body.includes(marker) && home.body.includes('٧٧٫٥٠'),
      'texte + prix mis à jour',
    );

    /* 3. Vérification côté discipline : relecture de la fiche */
    const reread = await get('/admin/products/1');
    check('la fiche produit conserve la valeur', reread.body.includes(`Smoke test product ${marker}`));
  }

  /* 4. Réglages : on renvoie tous les champs du formulaire (comme le navigateur) */
  const settings = await get('/admin/settings');
  const settingsFields = findForm(settings.body, 'contact.phone');
  if (settingsFields) {
    const form = new FormData();
    for (const [key, value] of Object.entries(settingsFields)) form.append(key, value);
    form.set('contact.phone', '+218 91 000 0000');
    form.append('ui.countdown', 'on');
    const response = await fetch(`${BASE}/admin/settings`, {
      method: 'POST',
      headers: { cookie },
      body: form,
      redirect: 'manual',
    });
    check('enregistrement des réglages', response.status === 200 || response.status === 303, `statut ${response.status}`);
    const home = await get('/', false);
    check('nouveau téléphone visible sur le site', home.body.includes('+218 91 000 0000'));
  }

  /* 5. Commande de bout en bout */
  const orderResponse = await fetch(`${BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'Test Client',
      phone: '+218 91 111 2222',
      address: 'Rue de test',
      city: 'Tripoli',
      paymentMethod: 'cod',
      items: [{ id: 2, qty: 1 }],
    }),
  });
  const order = await orderResponse.json();
  check('commande enregistrée', Boolean(order.order?.reference), order.order?.reference);

  const track = await fetch(`${BASE}/api/track?reference=${order.order?.reference}`);
  const tracked = await track.json();
  check('suivi de commande', tracked.found === true);

  const quote = await fetch(`${BASE}/api/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contactName: 'École', phone: '0910000000', message: 'Test' }),
  });
  check('demande de devis enregistrée', (await quote.json()).ok === true);

  const invalid = await fetch(`${BASE}/api/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pas-un-email' }),
  });
  check('e-mail invalide refusé', invalid.status === 400);

  const subscriber = await fetch(`${BASE}/api/subscribers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: `test${Date.now()}@exemple.ly` }),
  });
  check('abonnement newsletter', (await subscriber.json()).ok === true);

  const orders = await get('/admin/orders');
  check('commande visible dans l’administration', orders.body.includes(order.order?.reference ?? 'AM-'));
  const quotes = await get('/admin/quotes');
  check('devis visible dans l’administration', quotes.body.includes('École'));

  const csv = await fetch(`${BASE}/api/admin/subscribers/export`, { headers: { cookie } });
  check('export CSV des abonnés', csv.status === 200 && (await csv.text()).includes('email;statut'));
  const csvAnon = await fetch(`${BASE}/api/admin/subscribers/export`);
  check('export CSV protégé', csvAnon.status === 401);

  console.log(`\n${failures === 0 ? '✅ Tous les tests passent' : `❌ ${failures} test(s) en échec`}\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
  console.error('Erreur du test :', error);
  process.exit(1);
});
