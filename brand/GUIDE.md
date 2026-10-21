# Kommando — usage du logo

Une page, pour quelqu’un qui n’est pas designer. Le signe s’appelle Intervalle : une hampe et un chevron à 30°, séparés par une pause. Cette pause est le silence avant de répondre. Elle est le détail à protéger.

## 1. Versions

| Usage | Fichier |
|---|---|
| Principal, horizontal | `kit/horizontal.svg` |
| Empilé, quand la largeur manque | `kit/stacked.svg` |
| Symbole seul | `kit/symbol.svg` |
| Nom seul | `kit/wordmark.svg` |
| Symbole sous 32 px (favicon) | `kit/symbol-small.svg` |
| Symbole blanc sur fond sombre | `kit/symbol-reversed.svg` |
| Verrouillages blancs | `kit/horizontal-white.svg`, `kit/stacked-white.svg`, `kit/wordmark-white.svg` |

Écran : SVG, ou les PNG de `digital/`. Impression : le SVG noir (`kit/symbol-black.svg`, ou les fichiers `digital/*-black.svg`). Le blanc du symbole inversé est un dessin aminci, pas un simple remplissage. Ne le remplacez pas par `digital/symbol-white.svg`.

## 2. Zone de protection

Gardez, sur les quatre côtés, une zone vide égale à **la largeur de la hampe** du symbole, mesurée sur la version que vous posez. La zone grandit avec le logo. Rien d’autre dedans : pas de texte, pas de bord, pas d’autre signe.

## 3. Tailles minimales

| Version | Écran | Impression |
|---|---|---|
| Horizontal | 160 px de large | 36 mm de large |
| Empilé | 200 px de large | 42 mm de large |
| Symbole maître | 32 px | 8 mm |
| Symbole petite taille | 16 px | 5 mm |

En dessous de 32 px, seul `symbol-small.svg` (et l’icône qui en est tirée). Le maître se brise : le chevron devient des pixels séparés.

## 4. Couleur

| Nom | HEX | RGB | CMYK approximatif | Pantone proche |
|---|---|---|---|---|
| Encre | `#1C1C1E` | 28, 28, 30 | C7 M7 Y0 K88 | Black 6 C |
| Noir | `#000000` | 0, 0, 0 | C0 M0 Y0 K100 | Black |
| Blanc | `#FFFFFF` | 255, 255, 255 | C0 M0 Y0 K0 | — |
| Papier | `#F3F1EC` | 243, 241, 236 | C0 M1 Y3 K5 | — |

Les valeurs CMYK et Pantone sont des correspondances calculées, pas une épreuve. Papier est le fond de l’app, pas une encre du signe. Le bleu Signal `#0071E3` (R0 V113 B227, environ C100 M50 Y0 K11, proche du 2172 C) reste un signal d’interface. On ne repeint pas le logo avec.

Paires autorisées : Encre ou noir sur blanc ou Papier ; blanc sur Encre ou noir. Sur une photo, le blanc ou le noir, sur une zone calme, ou le symbole dans son carré Encre.

## 5. Lettres

Le mot « Kommando » est dessiné en contours, pas composé dans une police. On ne le retape pas pour « refaire le logo ». Dans l’interface, le texte courant est Geist.

## 6. À ne pas faire

Ne pas étirer. Ne pas tourner. Ne pas recolorer hors de la palette. Ne pas ajouter d’ombre, de contour, de dégradé. Ne pas resserrer la pause, ni rapprocher le symbole du nom. Ne pas déplacer les pièces d’un verrouillage. Ne pas poser le signe sur une image chargée sans contenir. Ne pas substituer un K de police.

## 7. Fichiers et suite

Maîtres : `brand/kit/`. Icônes web : `brand/digital/` (`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `maskable-512.png`). L’icône dans l’app est `app/icon.svg`.

La géométrie est originale. Un K fendu est un geste déjà vu ; ce qui est propre à Kommando, c’est la pause mesurée et les 30°. Ce guide ne vaut pas une recherche d’antériorité, et rien ici ne garantit qu’une marque soit libre.
