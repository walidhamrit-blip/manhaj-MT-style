# شركة المنهج للقرطاسية — Al Manhaj Stationery

Site e‑commerce bilingue (**arabe / anglais**) pour une chaîne de papeteries à Tripoli,
avec un **panneau d'administration complet** : tous les textes, images, prix, bandeaux,
menus, magasins et commandes sont gérés depuis l'interface, enregistrés dans une base
**PostgreSQL (Neon)** et donc visibles **immédiatement sur tous les appareils**.

| | |
|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 + TypeScript |
| **Base de données** | Neon PostgreSQL (`@neondatabase/serverless`, requêtes HTTP) |
| **Développement local** | aucune base à installer : PGlite (PostgreSQL en WebAssembly) démarre tout seul |
| **Hébergement** | Vercel (déploiement en un clic depuis GitHub) |
| **Admin** | `/admin` — protégé par mot de passe + cookie de session signé |

---

## 1. Démarrage en local

```bash
npm install
cp .env.example .env.local     # puis renseignez ADMIN_PASSWORD (déjà prérempli dans ce dépôt)
npm run dev                    # → http://localhost:3000
```

- **Site public** : <http://localhost:3000>
- **Administration** : <http://localhost:3000/admin>

Sans `DATABASE_URL`, l'application crée automatiquement une base **locale** dans le dossier
`.pglite/` (versionné nulle part). Le schéma **et** le contenu initial (30 produits, 5 rayons,
9 bandeaux, 89 textes, 3 magasins…) sont installés à la première visite : aucune migration
à lancer.

Sur une base **déjà installée**, les mises à jour de contenu sont appliquées au démarrage par
des migrations ciblées, versionnées dans `settings` (par exemple `app.brands_version` pour les
rubans de marques) : elles ne touchent qu'aux tables concernées et ne réinstallent jamais le
catalogue. Les marques sont protégées par un **index unique sur (nom, ruban)** — doublons
supprimés automatiquement, insertions avec `on conflict` : un ruban affiche donc chaque marque
une seule fois, même si plusieurs instances démarrent en même temps.

> Mot de passe admin en local : celui de `ADMIN_PASSWORD` dans `.env.local`.

En cas de message « base locale corrompue » (serveur tué brutalement pendant une écriture) :

```bash
rm -rf .pglite && npm run dev      # la base locale est recréée avec le contenu initial
```

---

## 2. Ce que l'administrateur peut modifier

| Menu | Contenu éditable |
|---|---|
| **Catalogue → Produits** | nom AR/EN, marque, rayon, description, prix, prix barré, disponibilité, note, image, mots‑clés de recherche, ordre, visibilité |
| **Catalogue → Rayons** | nom AR/EN, identifiant de lien, icône, image, ordre, activation |
| **Catalogue → Sections de l'accueil** | ordre des blocs, titres/sous‑titres, rayon affiché, bandeau affiché, couleur, activation |
| **Contenu → Bandeaux & promotions** | grandes bannières (héros), cartes d'offre, promotions, bandeaux de vente : textes, image de fond, prix/accroche, bouton, couleur |
| **Contenu → Magasins** | nom, téléphone, adresse, horaires, recherche Google Maps, photo |
| **Contenu → Avantages** | petits blocs icône + texte (sous la bannière, en bas de page) |
| **Contenu → Marques** | bandeau des marques et mot‑clé de recherche associé |
| **Contenu → Menus & liens** | menu principal, menu latéral, mégamenu des rayons, tuiles « Acheter par rayon », colonnes du pied de page |
| **Contenu → Bibliothèque d'images** | tous les liens d'images réutilisables (sélecteur visuel dans les formulaires) |
| **Contenu → Textes de l'interface** | **chaque phrase** du site, en arabe et en anglais, regroupée par thème |
| **Ventes → Commandes** | détail des commandes, articles, coordonnées client, **changement de statut** (nouvelle, confirmée, expédiée, livrée, annulée) |
| **Ventes → Devis** | demandes de devis (écoles, entreprises) + statut + contact WhatsApp direct |
| **Ventes → Abonnés newsletter** | liste des inscrits + **export CSV** |
| **Configuration → Réglages** | téléphone, e‑mail, WhatsApp, adresse, horaires, réseaux sociaux, devise, seuil de livraison gratuite, moyens de paiement, texte SEO… |

**Propagation des changements.** Le site est rendu à chaque visite à partir de la base
(`force-dynamic`). Après un enregistrement dans l'administration, la modification est
visible sur tous les appareils (téléphones, tablettes, ordinateurs) au rechargement de la
page — aucun cache à vider.

**Langue de l'administration** : français par défaut, arabe au choix (bouton en bas de la
barre latérale). Le contenu du site, lui, reste toujours bilingue AR/EN.

---

## 3. Déploiement sur Vercel + base Neon

### Étape 1 — Créer la base Neon

1. Créez un compte sur <https://neon.com> (offre gratuite suffisante pour démarrer).
2. **Create project** → région la plus proche (par ex. `eu-central-1`).
3. Dans le tableau de bord, cliquez sur **Connect** et copiez la chaîne **Pooled connection**
   (elle contient `-pooler`) :

   ```
   postgresql://neondb_owner:motdepasse@ep-xxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

> Gardez cette chaîne secrète : elle donne accès à vos données.

### Étape 2 — Importer le dépôt dans Vercel

1. <https://vercel.com/new> → **Import Git Repository** → `walidhamrit-blip/manhaj-MT-style`.
2. Framework détecté automatiquement : **Next.js** (build `next build`, aucune configuration à changer).
3. N'appuyez pas encore sur *Deploy* : ajoutez d'abord les variables d'environnement.

### Étape 3 — Variables d'environnement (Vercel)

**Project → Settings → Environment Variables** (environnements *Production*, *Preview*, *Development*) :

| Nom | Valeur | Obligatoire |
|---|---|---|
| `DATABASE_URL` | la chaîne de connexion Neon copiée à l'étape 1 | ✅ |
| `ADMIN_PASSWORD` | le mot de passe du panneau d'administration (choisissez‑le solide) | ✅ |
| `AUTH_SECRET` | une chaîne aléatoire de 64 caractères (voir ci‑dessous) | recommandé |
| `ADMIN_SESSION_HOURS` | durée de session en heures (défaut `12`) | optionnel |

Générer un secret :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Si `AUTH_SECRET` est absent, une clé dérivée de `ADMIN_PASSWORD` est utilisée :
> changer le mot de passe invalide alors toutes les sessions ouvertes.

### Étape 4 — Déployer

Cliquez sur **Deploy**. Au premier chargement du site, l'application :

1. crée les **16 tables** (`products`, `categories`, `sections`, `banners`, `stores`,
   `benefits`, `brands`, `nav_links`, `media`, `texts`, `settings`, `orders`, `order_items`,
   `quotes`, `subscribers`, `activity_log`) ;
2. insère le **contenu initial** (produits, textes, bandeaux, magasins…) ;
3. affiche le site. Aucune commande de migration n'est nécessaire.

**Vérification** : ouvrez `https://votre-site.vercel.app/api/health` — vous devez voir :

```json
{ "ok": true, "driver": "neon", "database": "ep-xxx-pooler...", "counts": { "products": 30, "texts": 89 } }
```

Puis connectez‑vous sur `https://votre-site.vercel.app/admin` avec `ADMIN_PASSWORD`.

### Étape 5 — Nom de domaine

**Vercel → Project → Settings → Domains** → ajoutez votre domaine (ex. `almanhaj.ly`) et
suivez les instructions DNS. Le site est déjà optimisé pour les moteurs de recherche
(`robots.txt` exclut `/admin` et `/api`).

---

## 4. Utilisation au quotidien

1. Connectez‑vous sur `/admin`.
2. Modifiez ce que vous voulez (prix, texte, image, bandeau…), cliquez sur **Enregistrer**.
3. Rechargez le site public : le changement est en ligne, pour tous les visiteurs.

**Commandes** : chaque commande passée sur le site apparaît dans *Ventes → Commandes*.
Vous pouvez la marquer « confirmée », « expédiée », « livrée » ou « annulée », appeler le
client en un clic (WhatsApp) et consulter le détail des articles.

**Devis** : les demandes « Request a quote » sont enregistrées avec les coordonnées de
l'école ou de l'entreprise.

**Images** : les images sont désignées par une **adresse (URL)**. Collez l'adresse d'une
image (Unsplash, Google Drive en partage public, votre hébergeur, etc.) ou choisissez‑la
dans la bibliothèque. Chaque champ image affiche un aperçu immédiat.

---

## 5. Structure du projet

```
├── legacy/index.html          # ancien site statique, conservé comme référence
├── scripts/
│   ├── db-setup.mjs           # vérifier / réinitialiser la base (npm run db:setup | db:reset)
│   ├── smoke-test.mjs         # test de bout en bout du site et de l'administration
│   ├── extract-legacy.mjs     # (migration) extraction du contenu de l'ancien site
│   └── gen-catalog-seed.mjs   # (migration) génération du catalogue initial
├── src/
│   ├── app/
│   │   ├── page.tsx           # page d'accueil (rendue depuis la base à chaque visite)
│   │   ├── layout.tsx         # polices, icônes, styles globaux
│   │   ├── globals.css        # design du site public (repris à l'identique)
│   │   ├── robots.ts
│   │   ├── admin/             # panneau d'administration
│   │   │   ├── login/         #   connexion
│   │   │   └── (dash)/        #   tableau de bord, listes, formulaires, commandes…
│   │   └── api/               # commandes, suivi, devis, newsletter, santé, export CSV
│   ├── components/
│   │   ├── store/             # en‑tête, héros, sections, pied de page, panier, fenêtres
│   │   └── admin/             # formulaires génériques, filtres, barre latérale…
│   └── lib/
│       ├── db/                # connexion (Neon/PGlite), schéma, contenu initial
│       ├── admin/             # ressources administrables, CRUD, actions serveur, i18n
│       ├── data.ts            # lecture du contenu du site
│       └── auth.ts            # mot de passe + session signée
└── .env.example               # variables d'environnement documentées
```

### Comment ajouter un champ à un formulaire existant

Tout le panneau repose sur la description des ressources dans
`src/lib/admin/resources.ts` : ajoutez un `FieldDef` (et la colonne correspondante dans
`src/lib/db/schema.ts`), puis relancez. Le formulaire, la liste, la recherche et l'API
d'enregistrement prennent le nouveau champ en compte automatiquement.

---

## 6. Commandes utiles

```bash
npm run dev          # développement (base locale PGlite si DATABASE_URL est absente)
npm run build        # compilation de production (identique à Vercel)
npm start            # serveur de production local
npm run typecheck    # vérification TypeScript
npm run db:setup     # vérifie la connexion et affiche le contenu de la base
npm run db:reset     # supprime les tables (le contenu initial est réinstallé à la visite suivante)
node scripts/smoke-test.mjs            # test de bout en bout (site + admin + API)
node scripts/smoke-test.mjs https://votre-site.vercel.app   # …sur le site déployé
```

---

## 7. Sécurité

- Une seule porte d'entrée : `ADMIN_PASSWORD` (variable d'environnement, jamais dans le code).
- Session stockée dans un cookie `httpOnly`, `SameSite=Lax`, signé en **HMAC‑SHA256**,
  expirant après `ADMIN_SESSION_HOURS` heures.
- Comparaison du mot de passe à temps constant (`timingSafeEqual`) — pas de fuite par timing.
- Toutes les pages `/admin` sont protégées ; les routes publiques (`/api/orders`,
  `/api/quotes`, `/api/subscribers`) n'acceptent que des données validées et ne renvoient
  aucune information interne.
- Les prix des commandes sont **relus depuis la base** : un client ne peut pas manipuler
  les montants depuis son navigateur.
- L'export CSV des abonnés est réservé aux sessions administrateur.

**Pour passer à plusieurs comptes administrateurs** (droit d'accès différenciés), il suffira
de remplacer `verifyPassword()` / `getSession()` dans `src/lib/auth.ts` par une table
`admin_users` (email + mot de passe haché) : le reste du panneau n'a pas à changer.

---

## 8. Dépannage

| Symptôme | Solution |
|---|---|
| Écran « Base de données non configurée » | `DATABASE_URL` absente ou incorrecte dans Vercel (chaîne *pooled* + `sslmode=require`), puis **Redeploy**. |
| `/api/health` répond `ok:false` | Vérifiez la chaîne Neon (mot de passe, `-pooler`, base `neondb`) et que le projet Neon n'est pas suspendu. |
| Connexion admin impossible | `ADMIN_PASSWORD` non définie dans l'environnement ; après l'ajout, réglez *Settings → Environment Variables* puis redéployez. |
| « base locale corrompue » en développement | `rm -rf .pglite && npm run dev`. |
| Une image ne s'affiche pas | Utilisez une URL directe terminant par `.jpg`/`.png`/`.webp` (les liens de partage Google Drive doivent être convertis en lien direct). |
| Produits absents du site | Vérifiez que le produit et son rayon sont « Visibles » dans l'administration. |
