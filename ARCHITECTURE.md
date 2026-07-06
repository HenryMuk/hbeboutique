# HBE Boutique — Documentation technique

## 1. Vue d'ensemble

HBE Boutique est une application e-commerce composée de deux projets dans ce même dépôt :

- **`src/`** — Frontend React 19 (Create React App), Tailwind CSS, sans librairie de composants ni client HTTP externe (pas d'axios : un petit wrapper `fetch` maison).
- **`server/`** — Backend Node.js + Express, connecté à MySQL/MariaDB via `mysql2/promise` (aucun ORM : SQL paramétré écrit à la main dans des repositories).

Authentification par JWT (stateless), vérification par email (OTP à 6 chiffres), notifications de statut de commande en direct via **Server-Sent Events (SSE)**.

Le backend remplace un ancien backend PHP (`C:\xampp\htdocs\Les_Formes\HBE`, hors de ce dépôt, non maintenu) et n'utilise plus l'API de paiement Labyrinthe (retirée — voir section 5).

## 2. Architecture des requêtes (backend)

Chaque fonctionnalité suit la même chaîne de responsabilité :

```
routes/*.routes.js  →  controllers/*.controller.js  →  services/*.service.js  →  repositories/*.repo.js  →  db/pool.js (MySQL)
```

- **routes** : déclarent les endpoints Express et les middlewares (`auth`, `admin`, `optionalAuth`).
- **controllers** : parsent `req.body`/`req.params`, appellent le service, formatent la réponse HTTP, ne contiennent aucune logique métier.
- **services** : logique métier (validation, calculs, orchestration). Les opérations CRUD pures sans règle métier (ex. CRUD produits admin) sautent parfois cette couche et vont direct du controller au repository.
- **repositories** : SQL paramétré uniquement, aucune logique.
- **`services/errors.js`** : `ServiceError` (code + status HTTP), attrapée par `middleware/errorHandler.middleware.js` qui la transforme en `{status:'error', code}`. Toute autre erreur devient un 500 générique.

## 3. Flux d'authentification

1. **Inscription** (`POST /api/utilisateur/inscription`) : vérifie unicité email/username, hash bcrypt du mot de passe, génère un code OTP (6 chiffres, expire en 15 min), envoie l'email (Nodemailer/Gmail). Si l'envoi d'email échoue, l'inscription réussit quand même (l'échec est juste loggé) — l'utilisateur peut toujours demander un renvoi du code.
2. **Vérification OTP** (`POST /api/utilisateur/verifier-otp`) : valide le code, marque l'email comme vérifié, délivre un JWT.
3. **Connexion** (`POST /api/utilisateur/connexion`) : vérifie le mot de passe, l'état du compte (`Actif`/`Banni`), délivre un JWT.
4. Le JWT contient `{id, username, email, role}` et est stocké côté client dans `localStorage` (`userToken`, `userId`, `username`, `role`).
5. **`middleware/auth.middleware.js`** : lit `Authorization: Bearer <token>` (ou `?token=` en query, uniquement utile pour le flux SSE qui ne peut pas fixer de headers custom), vérifie le JWT, attache `req.user`.
6. **`middleware/admin.middleware.js`** : à utiliser après `auth.middleware`, vérifie `req.user.role === 'admin'`.
7. **`middleware/optionalAuth.middleware.js`** : comme `auth.middleware` mais ne rejette jamais si le token est absent/invalide — utilisé sur `GET /api/produits/:id` pour rester public tout en sachant si l'utilisateur courant a liké le produit.

**Note importante** : le rôle (`role`) n'a été ajouté au JWT qu'après la mise en place du panel admin. Un utilisateur déjà connecté avant cette mise à jour doit se reconnecter pour obtenir un nouveau token contenant son rôle — sinon les routes admin renverront `403 FORBIDDEN` même pour un compte admin.

Côté frontend, `ProtectedRoute` (dans `App.js`) vérifie la présence du token ; `AdminRoute` vérifie en plus `localStorage.getItem('role') === 'admin'`.

## 4. Flux panier

- Chaque utilisateur a un panier persistant en base (`panier_items`), pas de panier en session/localStorage — il survit à une reconnexion.
- `PanierContext` (React Context, `src/contexts/PanierContext.js`) charge le panier au montage et expose `addItem`/`updateQuantite`/`removeItem`/`refresh`, utilisé par `Navbar` (badge), `Accueil`, `DetailProduit` et `Panier`.
- Ajouter un produit déjà présent incrémente sa quantité (`INSERT ... ON DUPLICATE KEY UPDATE quantite = quantite + VALUES(quantite)`).
- **Checkout** (`POST /api/panier/checkout`) : construit les lignes de commande à partir du panier (prix figés au moment de l'achat), délègue à `commandesService.createCommandeFromLignes`, puis vide le panier.
- Toute commande passe uniquement par le panier — il n'y a pas de bouton d'achat direct sur la fiche produit (décision prise pour éviter deux chemins de code parallèles pour la même logique de commande).

## 5. Flux de commande simulée (ex-intégration Labyrinthe)

L'application intégrait initialement l'API de paiement mobile **Labyrinthe** (RDC) pour de vraies transactions. Cette intégration a été **entièrement retirée** : le réseau de la machine de développement bloquait `payment.labyrinthe-rdc.com`, et le besoin réel n'était qu'une simulation de commande, pas un vrai paiement.

Ce qui reste et fonctionne :
- `commandesRepo.createWithLignes()` insère un en-tête de commande (`commandes`) + ses lignes (`commande_lignes`) dans une **transaction SQL** (le seul endroit du projet qui en a besoin, puisque c'est la seule écriture multi-tables qui doit être atomique).
- `commandesService.simulateConfirmation()` attend 1,5 à 2,5 secondes (délai aléatoire, pour simuler un vrai traitement) puis marque la commande `reussie`.
- Le mécanisme de push en direct au frontend (**SSE**) est conservé tel qu'il avait été conçu pour Labyrinthe : `subscribe()`/`publish()` (registre en mémoire, par `commandeId`) et l'endpoint `GET /api/commandes/:id/statut/stream`. Il est maintenant déclenché par la simulation au lieu du vrai polling — l'expérience utilisateur (statut qui passe de "en attente" à "réussie" en direct) reste identique.
- Il n'y a plus de notion d'échec de commande dans ce flux (toujours un succès, décision prise pour rester simple).

## 6. Likes et signalements

- `produit_likes` (unique par produit+utilisateur) : `POST /api/produits/:id/like` bascule le like (ajoute si absent, retire si présent).
- `signalements` : `POST /api/produits/:id/signaler` avec un motif texte, aucune modération admin des signalements n'a été construite (hors scope demandé) — ils sont juste stockés en base.
- `GET /api/produits/:id` renvoie `likesCount` et `estLikePar` (ce dernier `false` si non connecté, grâce à `optionalAuthMiddleware`).
- Les "suggestions d'autres articles" sur la fiche produit sont calculées **côté client** (4 produits pris au hasard parmi le reste du catalogue) — pas d'endpoint dédié, jugé inutile avec seulement 20 produits et aucun champ de catégorie.

## 7. Panel Admin

- Compte admin par défaut créé par la migration `007_seed_admin.sql` :
  - **email** : `admin@hbeboutique.cd`
  - **mot de passe** : `AdminHBE2026!`
  - **⚠️ à changer immédiatement après la première connexion** (aucune interface de changement de mot de passe n'existe encore — le modifier directement en base avec un nouveau hash bcrypt si besoin).
- Routes `/api/admin/*` (protégées `auth` + `admin`) :
  - CRUD produits (`GET/POST/PUT/DELETE /api/admin/produits[/:id]`).
  - Gestion utilisateurs (`GET /api/admin/utilisateurs`, `PATCH /api/admin/utilisateurs/:id` pour changer `etat` et/ou `role`).
- Frontend : `/admin/produits` et `/admin/utilisateurs`, sous `AdminLayout` (barre latérale), accessibles uniquement via le lien "Admin" dans la navbar si `role === 'admin'`.

## 8. Variables d'environnement (`server/.env`)

| Variable | Rôle |
|---|---|
| `PORT` | Port d'écoute du serveur Express |
| `CORS_ORIGIN` | Origine autorisée pour le CORS (le frontend) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Connexion MySQL/MariaDB |
| `JWT_SECRET` | Clé de signature des JWT |
| `JWT_EXPIRES_IN` | Durée de validité des JWT (ex. `7d`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Envoi des emails OTP (Nodemailer) |

`hbeboutique/.env` (racine, frontend) : `REACT_APP_API_URL` (URL de base de l'API, ex. `http://localhost:5000/api`).

Aucun de ces fichiers `.env` n'est suivi par git — voir `.env.example` (racine et `server/`) pour le modèle à copier.

## 9. Lancer le projet en local

1. Démarrer MySQL/MariaDB (XAMPP ou autre) avec la base `hbeboutique` existante.
2. `cd server && npm install`
3. Copier `server/.env.example` en `server/.env` et renseigner les vraies valeurs.
4. `npm run migrate` (exécute toutes les migrations dans `server/migrations/`, idempotent — sûr à relancer).
5. `npm run dev` (ou `npm start`) pour démarrer l'API sur le port configuré (5000 par défaut).
6. À la racine du dépôt : `npm install`, copier `.env.example` en `.env`, `npm start` pour le frontend (port 3000).
7. Se connecter avec le compte admin par défaut pour accéder à `/admin/produits` et `/admin/utilisateurs`.

## 10. Détail fichier par fichier

### `server/src/`

| Fichier | Responsabilité |
|---|---|
| `index.js` | Point d'entrée Express : middlewares globaux (CORS, JSON), montage des routes, gestion d'erreurs, démarrage du serveur |
| `config/env.js` | Charge et valide les variables d'environnement (`dotenv`) |
| `db/pool.js` | Pool de connexions MySQL (`mysql2/promise`) |
| `middleware/auth.middleware.js` | Vérifie le JWT (header ou query), attache `req.user` |
| `middleware/optionalAuth.middleware.js` | Comme ci-dessus mais ne rejette jamais si absent/invalide |
| `middleware/admin.middleware.js` | Vérifie `req.user.role === 'admin'` |
| `middleware/errorHandler.middleware.js` | Convertit les `ServiceError` (et autres erreurs) en réponses JSON |
| `routes/utilisateur.routes.js` | Endpoints inscription/connexion/OTP |
| `routes/produits.routes.js` | Catalogue public + like/signalement (protégés) |
| `routes/panier.routes.js` | CRUD panier + checkout (tout protégé) |
| `routes/commandes.routes.js` | Endpoint SSE de suivi de statut de commande |
| `routes/admin.routes.js` | CRUD produits admin + gestion utilisateurs (protégé admin) |
| `controllers/utilisateur.controller.js` | Parsing/réponse pour l'auth |
| `controllers/produits.controller.js` | Parsing/réponse pour catalogue, like, signalement |
| `controllers/panier.controller.js` | Parsing/réponse pour le panier |
| `controllers/commandes.controller.js` | Endpoint SSE (`stream`) |
| `controllers/admin.controller.js` | Parsing/réponse pour le CRUD admin (produits + utilisateurs) |
| `services/errors.js` | Classe `ServiceError` (code métier + status HTTP) |
| `services/jwt.service.js` | Signature/vérification des JWT (`jsonwebtoken`) |
| `services/mailer.service.js` | Envoi des emails OTP (`nodemailer`) |
| `services/utilisateur.service.js` | Logique métier auth : hash, OTP, construction du payload JWT (avec `role`) |
| `services/produits.service.js` | Logique métier catalogue : détail avec likes, toggle like, validation signalement |
| `services/panier.service.js` | Logique métier panier : ajout/quantité/suppression/checkout |
| `services/commandes.service.js` | Création de commande (en-tête+lignes), simulation de confirmation, registre SSE (`subscribe`/`publish`) |
| `repositories/utilisateurs.repo.js` | SQL table `utilisateurs` (CRUD auth + `findAll`/`updateEtatRole` pour l'admin) |
| `repositories/produits.repo.js` | SQL table `produits` + `produit_likes` + `signalements` |
| `repositories/panier.repo.js` | SQL table `panier_items` |
| `repositories/commandes.repo.js` | SQL tables `commandes`/`commande_lignes`, transaction d'écriture |

### `server/migrations/`

| Fichier | Contenu |
|---|---|
| `001_create_produits.sql` | Table `produits` |
| `002_create_commandes.sql` | Ancienne table `commandes` (un produit par ligne, avec `order_number` Labyrinthe) — remplacée par `005` |
| `003_seed_produits.sql` | 20 produits de démonstration |
| `004_alter_utilisateurs_role.sql` | Ajoute la colonne `role` à `utilisateurs` |
| `005_recreate_commandes.sql` | Recrée `commandes` (en-tête) + `commande_lignes` (lignes), supprime `order_number` |
| `006_create_panier_produit_likes_signalements.sql` | Tables `panier_items`, `produit_likes`, `signalements` |
| `007_seed_admin.sql` | Compte admin par défaut |
| `run.js` | Exécute les migrations dans l'ordre, avec des garde-fous pour ne pas rejouer un seed ou recréer une table déjà migrée |

### `src/` (frontend)

| Fichier | Responsabilité |
|---|---|
| `App.js` | Déclaration des routes, `ProtectedRoute`/`AdminRoute`, `ToastProvider`/`PanierProvider` |
| `api/client.js` | Wrapper `fetch` (`apiFetch`), gestion du JWT et des erreurs typées (`ApiError`) |
| `contexts/ToastContext.js` | Notifications éphémères (`useToast`) |
| `contexts/PanierContext.js` | État du panier partagé (`usePanier`) |
| `components/Navbar.js` | Barre de navigation partagée (logo, recherche, panier, lien admin, déconnexion) |
| `components/SkeletonCard.js` | Cartes/lignes de chargement animées (shimmer) |
| `ecrans/Authentification/Connexion.js` | Formulaire de connexion |
| `ecrans/Authentification/Inscription.js` | Formulaire d'inscription |
| `ecrans/Authentification/OTP.js` | Vérification du code OTP + renvoi |
| `ecrans/Boutique/Accueil.js` | Catalogue (grille produits, ajout au panier) |
| `ecrans/Boutique/DetailProduit.js` | Fiche produit détaillée (like, signalement, ajout au panier, suggestions) |
| `ecrans/Boutique/Panier.js` | Panier (quantités, suppression, checkout, suivi SSE du statut) |
| `ecrans/Admin/AdminLayout.js` | Mise en page admin (barre latérale + zone de contenu) |
| `ecrans/Admin/AdminProduits.js` | CRUD produits (création, édition, suppression) |
| `ecrans/Admin/AdminUtilisateurs.js` | Liste des utilisateurs, bannir/activer, changer de rôle |
| `index.css` | Styles Tailwind + animations personnalisées (`fadeInUp`, `heartPulse`, `shimmer`, `scaleIn`) |
