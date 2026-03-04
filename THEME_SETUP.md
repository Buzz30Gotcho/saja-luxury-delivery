# 🎨 Système de Thème Global (Dark/Light Mode)

## 📋 Configuration Actuelle

Le système de thème est maintenant **global** et fonctionne sur **toutes les pages** de votre application.

### Architecture

- **ThemeContext** (`src/context/ThemeContext.jsx`) : Gère l'état global du thème
- **useTheme hook** (`src/hooks/useTheme.jsx`) : Hook personnalisé pour accéder au contexte
- **ThemeProvider** : Wrap de l'application dans App.jsx
- **Styling** : CSS variables + Tailwind dark mode

## 🔧 Fonctionnalités

- ✅ Détection automatique de la préférence système (prefers-color-scheme)
- ✅ Sauvegarde en localStorage
- ✅ Basculement light/dark sur tous les composants
- ✅ Thème appliqué au niveau du `<html>` (affect toute la page)

## 💻 Comment Utiliser le Thème dans Vos Composants

### 1. Accéder au thème courant

```jsx
import { useTheme } from "../hooks/useTheme";

function MonComposant() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <>
      <p>Thème actuel: {theme}</p>
      <button onClick={toggleTheme}>
        Basculer vers {theme === 'light' ? 'dark' : 'light'}
      </button>
    </>
  );
}
```

### 2. Appliquer des styles spécifiques au thème avec Tailwind

Utilisez le préfixe `dark:` pour les styles en mode sombre :

```jsx
<div className="bg-background text-text-dark dark:bg-background dark:text-text-dark">
  {/* Automatiquement change quand le thème change */}
</div>
```

### 3. Appliquer des styles spécifiques avec CSS variables

Les variables CSS prédéfinies s'adaptent selon le thème :

```css
/* Automatiquement color-scheme: light ou dark */
--background
--card
--text-dark
--text-medium
--primary
--green
--danger
/* ... et plus */
```

## 📝 Variables CSS Disponibles

### Mode Clair
```css
--background: 245 246 247;
--card: 255 255 255;
--text-dark: 47 72 88;
--primary: 85 132 158;
--green: 27 122 58;
```

### Mode Sombre
```css
--background: 12 18 22;
--card: 20 28 34;
--text-dark: 226 232 240;
--primary: 136 184 210;
--green: 74 222 128;
```

## 🎯 Changements Effectués

1. ✅ Créé `ThemeContext.jsx` avec logique de thème global
2. ✅ Créé `useTheme` hook pour accès facile
3. ✅ Ajouté `ThemeProvider` dans `App.jsx`
4. ✅ Mis à jour `Header.jsx` pour utiliser le context global

## 🚀 Le Thème Fonctionne Maintenant

- **Header** : Le bouton de thème (☀️🌙) bascule pour toute l'application
- **Toutes les pages** : Les couleurs changent automatiquement
- **Pages merchant** : Héritent du thème global (pas besoin de configuration supplémentaire)
- **Persistance** : Le choix est sauvegardé dans localStorage

## 📱 Responsive Design

Le thème s'applique automatiquement sur :
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔍 Vérification

Testez en cliquant sur le bouton 🌙/☀️ dans le Header - le thème change sur **toute l'application** instantanément.
