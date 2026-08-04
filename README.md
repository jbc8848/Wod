# Opportuniste — PWA

Séances opportunistes, WOD & benchmarks, programmes évolutifs (HSPU, traction 1 bras),
minuteurs guidés. Fonctionne entièrement hors ligne une fois installée — refuge, avion, cave.

## Déployer sur GitHub Pages

1. Crée un dépôt sur GitHub (par ex. `opportuniste`), public.
2. Dépose **tous les fichiers de ce dossier à la racine** du dépôt :
   `index.html`, `manifest.webmanifest`, `sw.js`, les 4 icônes `icon-*.png`.
   - En ligne : bouton **Add file → Upload files**, glisse tout, **Commit**.
   - Ou en ligne de commande :
     ```
     git init && git add . && git commit -m "Opportuniste PWA"
     git branch -M main
     git remote add origin https://github.com/TON-COMPTE/opportuniste.git
     git push -u origin main
     ```
3. Dans le dépôt : **Settings → Pages → Source : Deploy from a branch**,
   branche `main`, dossier `/ (root)` → **Save**.
4. Après ~1 minute, l'app est en ligne sur
   `https://TON-COMPTE.github.io/opportuniste/`
   (HTTPS fourni par GitHub — indispensable au service worker : c'est bon d'office).

## Installer sur le téléphone

- **iPhone (Safari)** : ouvre l'URL → bouton Partager → **Sur l'écran d'accueil**.
- **Android (Chrome)** : ouvre l'URL → menu ⋮ → **Installer l'application**
  (ou la bannière d'installation qui apparaît).

L'app s'ouvre ensuite plein écran, sans navigateur, et marche sans réseau.
L'écran reste allumé pendant une séance (Wake Lock).

## Données

Historique des temps et niveaux des programmes sont stockés dans le navigateur
(localStorage, clé `oppo:`). Ils survivent hors ligne mais restent **liés à l'appareil** :
pas de synchronisation entre téléphone et ordinateur.

## Mettre à jour l'app

1. Remplace `index.html` dans le dépôt (commit).
2. Dans `sw.js`, incrémente la version du cache : `oppo-v1` → `oppo-v2` (commit).
3. Sur le téléphone, rouvre l'app deux fois : la première télécharge la nouvelle
   version en arrière-plan, la seconde l'affiche.

Sans l'étape 2, les appareils peuvent rester longtemps sur l'ancienne version en cache.
