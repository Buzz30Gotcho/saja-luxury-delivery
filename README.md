## Sommaire

* [Présentation du projet](#présentation-du-projet)

  * [Contexte et ambitions](#contexte-et-ambitions)
* [Objectifs du projet](#objectifs-du-projet)
* [Stack technique](#stack-technique)

  * [Technologies utilisées](#technologies-utilisées)
  * [Explications des technologies](#explications-des-technologies)
* [Architecture du projet](#architecture-du-projet)
* [Lancement du projet](#lancement-du-projet)
* [Illustration](#illustration)
* [Évolutions possibles](#évolutions-possibles)

---

## Présentation du projet

Le projet **Ydays 2025** a pour objectif de développer une **plateforme de livraison entre commerces de proximité**, exclusivement dédiée aux **magasins de luxe**.

L’application se veut **rapide, moderne, responsive et simple d’utilisation**, tant pour les commerçants que pour les coursiers et les administrateurs.

### Contexte et ambitions

Ce projet s’inscrit dans le cadre de la formation **Ynov**, où les étudiants doivent concevoir et développer un projet concret sur une période donnée (Ydays).
L’ambition est de créer une **solution de livraison haut de gamme**, permettant aux boutiques de luxe de proposer à leurs clients un service rapide et sécurisé, tout en favorisant le commerce local.

Nous cherchons à :

* Expérimenter des **technologies modernes** (React, Node.js, Supabase) dans un contexte réel
* Développer un **service premium de livraison locale**
* Fournir une **plateforme évolutive**, modulable et scalable
* Garantir une **expérience utilisateur haut de gamme** et sécurisée

---

## Objectifs du projet

* Créer une application web complète (front-end et back-end) pour gérer commandes et livraisons
* Permettre aux commerces de luxe de **recevoir, gérer et expédier leurs commandes** rapidement
* Mettre en place un **système de coursiers** optimisé pour le luxe
* Intégrer un **filtrage géographique** pour afficher les commerces et livraisons proches
* Assurer la **sécurité et la fiabilité des données sensibles**
* Prévoir une interface **ergonomique et élégante**, adaptée à une clientèle premium

---

## Stack technique

### Technologies utilisées

**Front-end :**

* React
* Tailwind CSS

**Back-end :**

* Node.js (Express.js)
* Supabase (base de données & authentification)

| **Front-end**                                                                                                                                                                                                                                            | **Back-end**                                                                                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" width="40"/> **React**  <br> <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" alt="Tailwind" width="40"/> **Tailwind CSS** | <img src="https://nodejs.org/static/images/logo.svg" alt="Node.js" width="45"/> **Node.js (Express.js)**  <br> <img src="https://logowik.com/content/uploads/images/supabase-icon1721342077.logowik.com.webp" alt="Supabase" width="40"/> **Supabase** |

---

### Explications des technologies

**React**
Bibliothèque JavaScript pour créer des interfaces modernes et dynamiques, idéale pour une application web responsive et modulable.

**Tailwind CSS**
Framework CSS utilitaire pour concevoir rapidement une interface élégante et cohérente, adaptée à un service haut de gamme.

**Node.js / Express.js**
Serveur rapide et scalable, parfait pour gérer les commandes et livraisons en temps réel.

**Supabase**
Base de données sécurisée et système d’authentification, permettant de protéger les informations des boutiques et clients.

---

## Architecture du projet

```text
Projet-Ydays-2025/
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── server.js
│   └── supabaseClient.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   └── vite.config.js
├── package-lock.json
└── README.md
```

---

## Lancement du projet

**Côté Front-end :**

```bash
cd frontend
npm install
npm run dev
```

**Côté Back-end :**

```bash
cd backend
npm install
npm start
```

---

## Illustration

*(Ajouter vos captures d’écran ou diagrammes illustrant le service premium et l’interface boutique / coursier)*

---

## Évolutions possibles

* Ajouter **latitude / longitude** pour chaque boutique et livraison
* Calculer **distances et itinéraires optimisés** pour les coursiers
* Débloquer plusieurs villes ou quartiers pour étendre le service
* **Système de paiement sécurisé** (Stripe, cartes premium)
* Application mobile pour les clients et les coursiers (**React Native**)
* Intégration avancée avec **Google Maps** pour un suivi temps réel
