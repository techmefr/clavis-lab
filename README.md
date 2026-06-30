# clavis-lab

Éditeur de disposition de clavier pour le Cheapino V2 — 36 touches, split ergonomique.

Conçu pour [Ergo-L](https://ergol.org), supporte aussi AZERTY, BÉPO, QWERTY et une variante Joystick.

## Fonctionnalités

- Visualisation des 8 couches (base, shift, accents, AltGr, num, nav, fn, média)
- Édition de chaque touche : caractère principal, shift, AltGr, accent mort, hold
- Home-row mods GACS préconfigurés
- Encodeur rotatif configurable
- Variante Joystick 8 directions avec modes
- Légendes complètes (shift, AltGr, accent) sur la couche base
- Déclencheurs de couche personnalisables (hold, combo, dead key)
- Export PDF (impression toutes les couches)
- Export / import JSON
- Persistance localStorage
- FR / EN

## Stack

- [Nuxt 4](https://nuxt.com) — SPA (`ssr: false`)
- Vue 3 + TypeScript strict
- Zéro dépendance UI externe

## Démarrage

```bash
npm install
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run preview
```

## Structure

```
app/
├── assets/        # CSS global
├── components/    # KeyTile, TheKeyboard, TheKeyEditor, TheLayerRail, TheTopBar, ModalHost, ThePrintView
├── composables/   # useConfig (store singleton), useFit (ResizeObserver)
├── data/          # geometry.ts, config.ts, i18n.ts
├── pages/         # index.vue
└── types/         # interfaces TypeScript
```

## Matériel

[Cheapino V2](https://github.com/tompi/cheapino) — 36 touches (3×5 matrix + 3 pouces par main + encodeur rotatif).
