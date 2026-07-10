# HBE Boutique

Application e-commerce (boutique de mode) avec **espace client** (catalogue, panier, commande, suivi, réclamations) et **espace professionnel** multi-rôles (validation des commandes, gestion du stock, expédition, livraison, SAV, administration).

Le projet est composé de deux applications :

- **Frontend** — React 19 (Create React App) + Tailwind CSS, à la racine du dépôt.
- **Backend** — API REST Node.js / Express + MySQL, dans `server/`.

---

## Sommaire

- [Aperçu fonctionnel](#aperçu-fonctionnel)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Structure du dépôt](#structure-du-dépôt)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Base de données](#base-de-données)
- [API — vue d'ensemble](#api--vue-densemble)
- [Diagrammes](#diagrammes)
- [Documentation complémentaire](#documentation-complémentaire)

---

## Aperçu fonctionnel

L'application distingue **7 rôles métier** plus un rôle **admin** (accès à toutes les vues) : `client`, `caissier`, `gestionnaire_boutique`, `entrepot`, `livraison`, `sav`, `admin`. Chaque rôle professionnel dispose de sa propre section dans `/admin/*`, filtrée à la fois côté client (React, garde de route par rôle) et côté serveur (middleware `requireRole`).

Parcours principal côté client :

1. Inscription / connexion avec vérification par code **OTP** envoyé par email.
2. Parcours du catalogue, ajout au panier (plafonné au stock disponible).
3. Passage de commande → paiement simulé → mise en file d'attente pour validation.
4. Le **gestionnaire de boutique** revérifie le stock, valide (génère une facture PDF) ou rejette la commande.
5. L'**entrepôt** attribue un livreur à toute commande validée.
6. Le **livreur** fait passer la livraison de *attribuée* → *en cours* → *livrée* (ce qui clôture la commande).
7. Le client peut ouvrir une **réclamation SAV** sur une commande livrée ; l'agent **SAV** la traite avec le contexte complet de la livraison.

Le détail des fonctionnalités par module et leur statut (implémenté / prévu en V2) est dans [`docs/FONCTIONNALITES.md`](docs/FONCTIONNALITES.md). Le détail des rôles et des vues associées est dans [`docs/ROLES.md`](docs/ROLES.md).

## Architecture

```
Navigateur (React SPA)
        │  HTTPS — REST/JSON (Bearer JWT) + SSE (suivi de commande)
        ▼
API Express (server/src)
  routes → controllers → services → repositories
        │  mysql2 (pool de connexions)
        ▼
MySQL (schéma hbeboutique)

API Express ──SMTP/TLS──▶ Serveur mail externe (envoi des codes OTP)
```

- Le token **JWT** (émis à l'inscription/connexion) porte l'identité et le rôle de l'utilisateur ; il est vérifié par `auth.middleware.js` puis contrôlé par rôle via `role.middleware.js` (`requireRole`).
- Le suivi du statut d'une commande après paiement se fait via **Server-Sent Events** (`GET /api/commandes/:id/statut/stream`).
- Les factures PDF sont générées à la volée (`pdfkit`) et stockées sur disque (`server/uploads/factures`), servies uniquement via une route authentifiée. Les images produits (`server/uploads/produits`) sont servies en statique public.

Voir le [diagramme de déploiement](docs/diagrams/DiagrammeDeploiement_V2.drawio) pour le détail des nœuds et protocoles, et le [diagramme de classes](docs/diagrams/DiagrammeClasses_V2.drawio) pour le modèle de données.

## Stack technique

| Côté | Techno |
|---|---|
| Frontend | React 19, React Router 6, Tailwind CSS, react-icons |
| Backend | Node.js ≥ 18, Express 4, mysql2, JWT (jsonwebtoken), bcryptjs, multer (upload d'images), pdfkit (factures), nodemailer (OTP) |
| Base de données | MySQL 8 |
| Outils | Create React App (react-scripts), migrations SQL maison (`server/migrations`) |

## Structure du dépôt

```
hbeboutique/
├── src/                      # Frontend React
│   ├── api/client.js         # Client HTTP centralisé (fetch + JWT)
│   ├── components/           # Navbar, SkeletonCard...
│   ├── contexts/             # PanierContext, ToastContext
│   ├── constants/roles.js
│   └── ecrans/
│       ├── Authentification/ # Connexion, Inscription, OTP
│       ├── Boutique/         # Accueil, DetailProduit, Panier, MesCommandes, MesReclamations, MonProfil
│       └── Admin/            # Une vue par rôle pro (Produits, Commandes, Entrepôt, Livraisons, SAV, Paiements, Signalements, Utilisateurs)
│
├── server/                   # Backend Express
│   ├── src/
│   │   ├── routes/           # Déclaration des endpoints par domaine
│   │   ├── controllers/      # Adaptation HTTP ↔ services
│   │   ├── services/         # Logique métier
│   │   ├── repositories/     # Accès SQL (mysql2)
│   │   ├── middleware/       # auth, role, upload, errorHandler
│   │   └── constants/        # roles.js, commandeStatuts.js
│   ├── migrations/           # Scripts SQL versionnés + runner (migrations/run.js)
│   └── uploads/               # Fichiers générés/uploadés (produits, factures)
│
├── docs/
│   ├── diagrams/              # Diagrammes draw.io (.drawio)
│   ├── FONCTIONNALITES.md
│   └── ROLES.md
│
└── HBE_Boutique.postman_collection.json   # Collection Postman pour tester l'API
```

## Démarrage rapide

Prérequis : **Node.js ≥ 18**, **MySQL 8** (ou compatible), un compte SMTP pour l'envoi des OTP (ex. Gmail avec mot de passe d'application).

### 1. Base de données

```bash
mysql -u root -p -e "CREATE DATABASE hbeboutique CHARACTER SET utf8mb4;"
```

> Les migrations créent les tables `produits`, `commandes`, `commande_lignes`, `panier_items`, `produit_likes`, `signalements`, `factures`, `livraisons`, `tickets_sav`. La table `utilisateurs` doit exister au préalable (colonnes `id`, `email`, `username`, `mdp`, `etat`, `date`, `token`, `otp_code`, `otp_expiry`, `email_verifie`, `role`) — les migrations `004`/`009` ne font qu'y ajouter/élargir la colonne `role`.

### 2. Backend

```bash
cd server
npm install
cp .env.example .env       # renseigner DB_*, JWT_SECRET, SMTP_*
npm run migrate            # exécute server/migrations dans l'ordre
npm run dev                # démarre l'API sur http://localhost:5000 (--watch)
```

### 3. Frontend

```bash
# à la racine du dépôt
npm install
cp .env.example .env       # REACT_APP_API_URL=http://localhost:5000/api
npm start                  # démarre l'app sur http://localhost:3000
```

### 4. Tester l'API

Importer [`HBE_Boutique.postman_collection.json`](HBE_Boutique.postman_collection.json) dans Postman.

## Variables d'environnement

**`server/.env`**

| Variable | Description |
|---|---|
| `PORT` | Port d'écoute de l'API (défaut `5000`) |
| `CORS_ORIGIN` | Origine autorisée pour le frontend (défaut `http://localhost:3000`) |
| `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Connexion MySQL |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Signature et durée de validité des tokens |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Envoi des emails OTP |

**`.env`** (racine, frontend)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | URL de base de l'API (ex. `http://localhost:5000/api`) |

## Base de données

Le schéma complet (entités, attributs, relations et cardinalités) est documenté dans le [diagramme de classes](docs/diagrams/DiagrammeClasses_V2.drawio). Entités principales :

- **Utilisateur** — compte + rôle (`Role`), vérification OTP
- **Produit** — catalogue, stock, likes, signalements
- **Commande** / **CommandeLigne** — panier figé au moment de la commande
- **Facture** — générée à la validation d'une commande (1-1)
- **Livraison** — attribution d'un livreur à une commande validée (1-1)
- **TicketSav** — réclamation liée à une commande livrée (1-1)

Les migrations SQL numérotées (`server/migrations/001_*.sql` → `014_*.sql`) tracent l'évolution du schéma ; `server/migrations/run.js` les rejoue dans l'ordre via `npm run migrate`.

## API — vue d'ensemble

Toutes les routes sont préfixées par `/api` et protégées par JWT (`Authorization: Bearer <token>`) sauf mention contraire.

| Base | Domaine |
|---|---|
| `/api/utilisateur` | Inscription, connexion, vérification/renvoi OTP (publics), profil (`/moi`) |
| `/api/produits` | Catalogue, détail produit (lecture publique), likes, signalements |
| `/api/panier` | Panier du client connecté + `/checkout` (crée la commande à partir du panier) |
| `/api/commandes` | Côté client : mes commandes, suivi de statut (SSE), téléchargement de facture |
| `/api/sav` | Côté client : ouvrir une réclamation, lister mes réclamations |
| `/api/admin` | Espace pro, un sous-chemin par rôle : `produits`, `commandes` (+`valider`/`rejeter`), `utilisateurs`, `signalements`, `paiements`, `livraisons` (+`a-expedier`, `livreurs`, `mes-livraisons`), `sav` |

Le détail des scénarios (requêtes/réponses, ordre des appels) est dans le [diagramme de séquence](docs/diagrams/DiagrammeSequence_V2.drawio) (4 pages : Authentification, Commande/Paiement/Validation, Livraison, SAV).

## Diagrammes

Tous les diagrammes sont au format **draw.io** (`.drawio`, éditables avec [app.diagrams.net](https://app.diagrams.net) ou l'extension VS Code *Draw.io Integration*), dans `docs/diagrams/` :

| Fichier | Contenu |
|---|---|
| `DiagrammeClasses_V2.drawio` | Modèle de données (entités, attributs, méthodes, relations, énumérations de statuts) |
| `DiagrammeSequence_V2.drawio` | 4 scénarios : Authentification (OTP), Commande/Paiement/Validation, Attribution & suivi de livraison, Réclamation SAV |
| `DiagrammeDeploiement_V2.drawio` | Nœuds physiques/logiques (poste client, hébergement front, serveur d'application, base de données, SMTP) et protocoles |
| `DiagrammeActivite_V2.drawio` | Diagramme d'activité multi-couloirs (un couloir par rôle) |
| `UserStoryMapping_V2.drawio` | User story mapping par module fonctionnel |

## Documentation complémentaire

- [`docs/ROLES.md`](docs/ROLES.md) — détail des 7 rôles + admin, vues réservées, règles d'accès
- [`docs/FONCTIONNALITES.md`](docs/FONCTIONNALITES.md) — fonctionnalités par module, statut MVP/V2
