# SAJA — Conciergerie de Livraison de Luxe

> Projet académique Ynov · Ydays 2025

SAJA est une plateforme e-commerce haut de gamme dédiée à la livraison de produits de luxe. Elle connecte deux types d'acteurs : les **clients** et les **coursiers**.

> **Note :** L'espace commerçant a été conçu et intégré à l'architecture, mais n'a pas été finalisé dans le cadre de ce projet académique. Il représente une évolution naturelle si le projet venait à se poursuivre.

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture](#architecture)
- [Installation et lancement](#installation-et-lancement)
- [Base de données](#base-de-données)
- [Variables d'environnement](#variables-denvironnement)
- [API — Endpoints principaux](#api--endpoints-principaux)
- [Difficultés rencontrées](#difficultés-rencontrées)
- [Équipe](#équipe)

---

## Présentation

L'application repose sur **trois espaces distincts**, chacun avec son propre parcours d'authentification et ses propres interfaces :

| Espace | URL | Rôle |
|---|---|---|
| Client | `/` | Parcourir les boutiques, commander, suivre les livraisons |
| Coursier | `/coursier/...` | Accepter et gérer les missions de livraison |

---

## Fonctionnalités

### Côté Client
- Page d'accueil avec sélection de boutiques et produits mis en avant
- Catalogue produits avec filtrage par catégorie
- Fiche produit détaillée avec produits similaires
- Panier persistant et processus de commande (checkout)
- Suivi de commande en temps réel (`/order-tracking/:id`)
- Compte utilisateur (historique, adresses, moyens de paiement)

### Côté Coursier
- Inscription et connexion coursier indépendantes
- Dashboard en temps réel avec :
  - Statut de disponibilité (En ligne / Hors ligne)
  - Géolocalisation GPS envoyée en continu quand disponible
  - Liste des missions disponibles
  - Mission active avec timeline de progression
- Progression du statut de livraison : `courier_assigned → picked_up → on_the_way → delivered`
- Confirmation de livraison avec vérification d'identité client
- Statistiques : gains totaux, nombre de livraisons, note
- Historique des livraisons effectuées

---

## Stack technique

**Frontend**
- React 19 + React Router v7
- Tailwind CSS
- Framer Motion (animations)
- Lucide React (icônes)
- Supabase JS (authentification client)
- @react-google-maps/api (carte)
- Vite + vite-plugin-pwa (PWA)

**Backend**
- Node.js (ES Modules) + Express.js
- Supabase (base de données PostgreSQL + authentification)

**Déploiement**
- Configuration nixpacks (Railway-compatible)
- Le backend sert les fichiers statiques du frontend en production (SPA fullstack)

---

## Architecture

```
/
├── backend/
│   ├── controllers/          # Logique métier
│   │   ├── cartController.js
│   │   ├── checkoutController.js
│   │   ├── deliveryController.js
│   │   ├── productsController.js
│   │   └── shopsController.js
│   ├── routes/               # Définition des routes API
│   │   ├── index.js          # Router principal (/api)
│   │   ├── cart.js
│   │   ├── checkout.js
│   │   ├── delivery.js
│   │   ├── products.js
│   │   └── shops.js
│   ├── services/             # Appels Supabase
│   ├── utils/
│   ├── supabaseClient.js
│   └── server.js             # Point d'entrée, sert aussi le frontend
│
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── ShopList.jsx / ShopDetail.jsx
│       │   ├── ProductCatalogue.jsx / ProductDetail.jsx
│       │   ├── CartPage.jsx / Checkout.jsx
│       │   ├── OrderTracking.jsx
│       │   ├── CompteUser.jsx
│       │   └── coursier/     # Dashboard coursier
│       ├── components/       # Composants réutilisables
│       ├── context/          # Auth, Panier, Livraison, Thème
│       ├── hooks/            # Hooks custom (useShops, useOrders, etc.)
│       ├── routes/           # Config routeur + routes protégées
│       └── services/         # Appels API
│
├── nixpacks.toml             # Config déploiement
└── package.json              # Scripts racine
```

---

## Installation et lancement

### Prérequis
- Node.js >= 22.0.0
- Un projet Supabase configuré (voir [Variables d'environnement](#variables-denvironnement))

### Développement local

```bash
# 1. Installer les dépendances (frontend + backend)
npm run install:all

# 2. Lancer le backend (port 4000 par défaut)
cd backend
npm start

# 3. Lancer le frontend (dans un second terminal)
cd frontend
npm run dev
```

Le frontend est accessible sur `http://localhost:5173` et communique avec le backend sur `http://localhost:4000`.

> Avant le premier lancement, initialise ta base Supabase avec [`database/schema.sql`](#base-de-données).

### Production (build)

```bash
# Build du frontend
npm run build

# Lancer le serveur (sert aussi le frontend compilé)
npm start
```

Le serveur Express sert les fichiers buildés depuis `frontend/dist/`. Un seul port suffit en production.

---

## Base de données

La base de données est hébergée sur **Supabase (PostgreSQL)**. Après avoir créé un projet Supabase, initialise la base avec le schéma fourni :

1. Ouvre ton projet sur [supabase.com](https://supabase.com) → **SQL Editor** → **New query**
2. Copie-colle le contenu de [`database/schema.sql`](database/schema.sql)
3. Clique sur **Run**

Ce script crée l'ensemble du schéma (tables, types ENUM, index, triggers et politiques de sécurité RLS) et insère un jeu de données de démonstration pour le catalogue (11 boutiques + produits associés).

> ⚠️ **Attention :** le script commence par supprimer les tables existantes (`DROP TABLE ... CASCADE`) avant de tout recréer. À exécuter sur un **projet Supabase neuf** ou en connaissance de cause — il efface les données présentes.

> **Note :** seules les boutiques et produits sont pré-remplis. Les données transactionnelles et personnelles (commandes, paniers, profils, coursiers) se créent à l'usage de l'application via l'authentification Supabase.

---

## Variables d'environnement

### `backend/.env`

```env
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
```

### `frontend/.env`

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## API — Endpoints principaux

Tous les endpoints sont préfixés par `/api`.

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Vérification de l'état du serveur |
| `GET` | `/api/products` | Liste des produits |
| `GET` | `/api/shops` | Liste des boutiques |
| `GET` | `/api/cart` | Contenu du panier |
| `POST` | `/api/checkout` | Passer une commande |
| `GET` | `/api/delivery/missions/available` | Missions disponibles pour les coursiers |
| `POST` | `/api/delivery/accept/:orderId` | Accepter une mission |
| `GET` | `/api/delivery/missions/courier/:courierId` | Missions d'un coursier |
| `PATCH` | `/api/delivery/status/:orderId` | Mettre à jour le statut d'une livraison |
| `PATCH` | `/api/delivery/courier/:courierId/availability` | Disponibilité du coursier |
| `PATCH` | `/api/delivery/courier/:courierId/location` | Position GPS du coursier |
| `GET` | `/api/delivery/track/:orderId` | Tracking d'une commande |
| `GET` | `/api/delivery/courier/:courierId/stats` | Statistiques du coursier |

---

## Difficultés rencontrées

Ce projet a soulevé plusieurs défis techniques, principalement liés à la dimension **temps réel** et **géolocalisation** de la livraison.

### 1. Suivi de livraison « temps réel »
Le suivi de commande et la mise à jour des missions côté coursier devaient paraître instantanés. Plutôt que de mettre en place des WebSockets / Supabase Realtime (lourds à sécuriser et à maintenir dans le temps imparti), nous avons opté pour du **polling** côté client (`setInterval` dans `OrderTracking.jsx`). Le compromis : simplicité de mise en œuvre, mais latence et nombre de requêtes à calibrer pour ne pas surcharger l'API.

### 2. Géolocalisation GPS du coursier
L'envoi continu de la position du coursier (`navigator.geolocation.watchPosition`) a demandé de gérer :
- les **permissions navigateur** et l'obligation d'un contexte **HTTPS** (la géolocalisation est bloquée en HTTP),
- la **consommation batterie / fréquence** des envois de position (`PATCH /delivery/courier/:id/location`),
- les cas où l'utilisateur refuse la localisation ou passe hors ligne.

### 3. Géocodage des adresses de livraison
La conversion d'une adresse texte en coordonnées (Google Maps Geocoding API, côté backend) échoue sur certaines adresses mal formées ou introuvables. Il a fallu prévoir un **fallback** (`buildFallbackDropoffFromShop`) qui estime un point de dépôt à partir de la boutique, ainsi qu'un **calcul de distance / ETA maison** (formule de Haversine + vitesse moyenne) faute d'API de routing dédiée.

### 4. Gestion des rôles et authentification multi-espaces
Faire cohabiter trois parcours d'authentification (client, coursier, commerçant) avec Supabase a posé un problème de **source de vérité du rôle** : le rôle existe à la fois dans `user_metadata` (Supabase Auth) et dans la table `profiles`. Un bug de synchronisation « rétrogradait » par erreur un coursier en client lors du rafraîchissement de session — corrigé en priorisant le rôle déjà connu (`AuthProvider.jsx`).

### 5. Routing SPA en production
React Router gère la navigation côté client, mais en production un rafraîchissement sur une URL profonde (ex. `/order-tracking/42`) renvoyait un **404**. Il a fallu configurer un **fallback SPA** à deux endroits selon l'hébergeur : `app.get('*')` côté Express (le backend sert le build du frontend) et un `vercel.json` dédié pour le déploiement sur Vercel.

### 6. Sécurité des données (RLS Supabase)
La mise en place des **politiques Row Level Security** a demandé de bien séparer les accès : clé `anon` côté frontend (accès restreint par l'utilisateur connecté) et `service_role` côté backend (accès élargi). Mal réglées, les policies bloquaient des lectures légitimes ou, à l'inverse, exposaient trop de données.

### 7. Contrainte de périmètre
Enfin, dans le temps imparti, l'**espace commerçant** a été architecturé (routes protégées, place dans le modèle de données) mais pas finalisé, afin de livrer des parcours client et coursier complets et fonctionnels.

---

## Équipe

Projet réalisé dans le cadre des **Ydays Ynov 2025** par une équipe pluridisciplinaire composée de chefs de projet, créatifs et développeurs.
