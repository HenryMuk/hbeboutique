# Fonctionnalités par module — HBE Boutique (V2)

Ce document liste les fonctionnalités de la version 2 de l'application, regroupées par module (cf. `docs/diagrams/UserStoryMapping_V2.drawio`), avec le ou les rôles concernés et le statut d'implémentation actuel.

Légende statut : ✅ implémenté · 🕓 prévu en V2 (non implémenté)

---

## Module Authentification

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Inscription / Connexion (+ vérification par OTP) | Client (et tous les rôles pour se connecter) | MVP | ✅ |
| Vérification des accès (rôle requis par route) | Tous | MVP | ✅ |
| Authentification 2FA | Tous | V2 | 🕓 |
| Connexion via réseaux sociaux | Tous | V2 | 🕓 |

> La réinitialisation de mot de passe et la gestion des rôles, présentes dans la V1, ont été retirées de ce module : la gestion des rôles est désormais une fonctionnalité du **module Admin**.

## Module Client

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| CRUD Client (inscription, compte) | Client | MVP | ✅ |
| Voir profil | Client | MVP | ✅ |
| Voir historique (mes commandes) | Client | MVP | ✅ |
| Programme fidélité | Client | V2 | 🕓 |
| Score client | Client | V2 | 🕓 |
| Analyse comportementale | Client | V2 | 🕓 |

## Module Catalogue

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Consulter le catalogue | Client | MVP | ✅ |
| Rechercher un produit | Client | MVP | ✅ |
| Ajouter au panier (plafonné au stock disponible) | Client | MVP | ✅ |
| Voir le détail d'un produit (+ stock disponible) | Client | MVP | ✅ |
| Recommandation de produits | Client | V2 | 🕓 |
| Filtres avancés | Client | V2 | 🕓 |
| Avis & notations | Client | V2 | 🕓 |

## Module Commandes

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Passer commande | Client | MVP | ✅ |
| Valider / rejeter une commande (avec revérification du stock) | Gestionnaire de boutique | MVP | ✅ |
| Suivi du statut de la commande | Client, Gestionnaire de boutique, Livreur | MVP | ✅ |
| Génération automatique d'échéances | — | V2 | 🕓 |
| Calendrier de livraison | — | V2 | 🕓 |
| Détection de commande risquée | Gestionnaire de boutique | V2 | 🕓 |

## Module Paiement

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Simuler le paiement | Client (système) | MVP | ✅ |
| Vérifier le stock et générer la facture PDF si la commande passe | Gestionnaire de boutique | MVP | ✅ |
| Refuser la commande si le stock est insuffisant | Gestionnaire de boutique | MVP | ✅ |
| Voir l'historique des paiements | Client, Caissier | MVP | ✅ |
| Mobile Money | Client | V2 | 🕓 |
| Paiement fractionné | Client | V2 | 🕓 |
| Gestion des remboursements automatiques | Caissier | V2 | 🕓 |

## Module Livraison

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Attribuer un livreur à une commande validée | Entrepôt | MVP | ✅ |
| Suivi de livraison (attribuée → en cours → livrée) | Client, Gestionnaire de boutique, Livreur | MVP | ✅ |
| Partenaire logistique externe | Entrepôt | V2 | 🕓 |
| Optimisation des tournées | Livreur | V2 | 🕓 |
| Supervision centralisée | Entrepôt | V2 | 🕓 |

> La réception en point relais et la remise au client via un tiers ont été retirées : toute livraison est désormais directe, du livreur au client.

## Module SAV

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Ouvrir une réclamation (uniquement sur une commande livrée) | Client | MVP | ✅ |
| Traiter la réclamation avec le détail de la livraison concernée | SAV | MVP | ✅ |
| Validation des retours produit | SAV | V2 | 🕓 |
| Remboursement client | SAV | V2 | 🕓 |
| Chatbot SAV | Client | V2 | 🕓 |
| Escalade automatique | SAV | V2 | 🕓 |
| Évaluation des agents SAV | Admin | V2 | 🕓 |

## Module Admin

| Fonctionnalité | Rôle(s) | MVP/V2 | Statut |
|---|---|---|---|
| Gestion des utilisateurs & attribution des rôles (7 rôles) | Admin | MVP | ✅ |
| Gestion des produits (stock, image, prix) | Admin (accès à la vue Gestionnaire de boutique) | MVP | ✅ |
| Statistiques | Admin | MVP | 🕓 |
| Sécurité de la plateforme | Admin | MVP | ✅ (JWT + contrôle d'accès par rôle) |
| Responsable régional | Admin | V2 | 🕓 |
| Responsable expansion | Admin | V2 | 🕓 |
| Tableaux de bord avancés | Admin | V2 | 🕓 |

---

## Synthèse par rôle

| Rôle | Modules où il intervient |
|---|---|
| Client | Authentification, Client, Catalogue, Commandes, Paiement, SAV |
| Caissier | Paiement |
| Gestionnaire de boutique | Catalogue, Commandes, Livraison (suivi), Signalements (module Catalogue) |
| Entrepôt | Livraison |
| Livraison | Commandes (suivi), Livraison |
| SAV | SAV |
| Admin | Tous les modules |
