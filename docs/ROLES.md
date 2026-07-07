# Rôles et permissions — HBE Boutique

## Principe général

L'application distingue **7 rôles métier** plus le rôle **admin**, qui a accès à l'intégralité des vues des 7 autres rôles en plus des siennes propres. Chaque rôle ne voit, dans l'espace professionnel (`/admin/*`), que les écrans qui lui sont réservés — la navigation (menu de gauche) et les routes de l'API sont toutes deux filtrées par rôle (`requireRole` côté serveur, `RoleRoute` côté client). La partie boutique (catalogue, panier, mes commandes, mes réclamations, mon profil) reste accessible à tout utilisateur connecté, quel que soit son rôle.

Le rôle d'un utilisateur est stocké en base (`utilisateurs.role`) et ne peut être modifié que par un **admin**, depuis `/admin/utilisateurs`.

---

## 1. Client (`client`)

Rôle attribué par défaut à l'inscription.

**Description** : utilisateur final de la boutique. Parcourt le catalogue, commande, suit ses commandes et peut ouvrir une réclamation après réception.

**Vues réservées** :
- Catalogue et fiche produit (avec stock disponible)
- Panier et validation de commande
- *Mes commandes* : suivi du statut, téléchargement de la facture
- *Mes réclamations* : ouverture d'une réclamation sur une commande livrée, suivi de son traitement
- *Mon profil*

---

## 2. Caissier (`caissier`)

**Description** : suit les paiements traités par la boutique (commandes validées ou rejetées), sans intervenir sur leur validation.

**Vue réservée** : `/admin/paiements` — historique des paiements (référence, client, montant, statut, téléchargement de la facture).

---

## 3. Gestionnaire de boutique (`gestionnaire_boutique`)

**Description** : pilote le catalogue et le cycle de vie des commandes. C'est lui qui décide si une commande peut être honorée (stock suffisant) ou doit être rejetée.

**Vues réservées** :
- `/admin/produits` — CRUD produits (nom, prix, description, **stock**, **image depuis la galerie**)
- `/admin/commandes` — file d'attente des commandes à valider/rejeter (revérification du stock, génération de la facture à la validation)
- `/admin/suivi-livraisons` — suivi en lecture seule de toutes les livraisons en cours
- `/admin/signalements` — traitement des signalements de produits (voir l'article, le modifier/supprimer, marquer traité sans le faire disparaître)

---

## 4. Entrepôt (`entrepot`)

**Description** : prépare l'expédition des commandes validées en attribuant un livreur disponible.

**Vue réservée** : `/admin/entrepot` — liste des commandes validées sans livreur assigné, attribution d'un livreur (parmi les comptes ayant le rôle `livraison`), et suivi de toutes les livraisons.

---

## 5. Livraison (`livraison`)

**Description** : livreur. Ne voit que les livraisons qui lui ont été attribuées.

**Vue réservée** : `/admin/livraisons` — « Mes livraisons » : passage du statut *attribuée* → *en cours* → *livrée* (ce qui clôture la commande correspondante).

---

## 6. SAV (`sav`)

**Description** : traite les réclamations ouvertes par les clients, avec une visibilité complète sur la livraison concernée (livreur, statut, dates) pour instruire le dossier.

**Vue réservée** : `/admin/sav` — liste des réclamations, détail (motif + informations de livraison), passage de *ouverte* → *en cours* → *résolue* avec une note de résolution renvoyée au client.

---

## 7. Admin (`admin`)

**Description** : administrateur général. Accède à **toutes** les vues des 6 autres rôles (aucune restriction ne s'applique à lui) et est le seul à pouvoir gérer les comptes et les rôles.

**Vue additionnelle réservée** : `/admin/utilisateurs` — liste des comptes, bannissement/réactivation, attribution d'un des 7 rôles.

---

## Récapitulatif

| Rôle | Vue(s) dans l'espace pro | Peut voir les autres vues ? |
|---|---|---|
| Client | Boutique + Mes commandes/réclamations/profil | Non (hors espace pro) |
| Caissier | Paiements | Non |
| Gestionnaire de boutique | Produits, Commandes, Suivi livraisons, Signalements | Non |
| Entrepôt | Entrepôt (expédition + attribution livreur) | Non |
| Livraison | Mes livraisons | Non |
| SAV | Réclamations SAV | Non |
| Admin | Toutes les vues ci-dessus | **Oui, systématiquement** |
