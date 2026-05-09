# EduPlanet — Prototype UI 3D

Interface de navigation pédagogique en 3D, basée sur une constellation de satellites orbitaux. Chaque satellite représente une matière scolaire ; un clic révèle les activités associées sous forme de gemmes cristallines.

## Aperçu

- **4 matières** : Mathématiques, Français, Anglais, Géographie
- **Navigation** : drag souris / touch avec inertie, ou clavier (←/→ pour changer de satellite, Entrée pour valider, Échap pour revenir)
- **Seul le satellite le plus proche de la caméra est cliquable** (les autres sont atténués)
- **Transitions** : fondu entre la vue accueil et la vue activité
- **Gemmes cristallines** pour les sous-activités (octaèdres allongés, 50 % de transparence)

## Stack

- [Three.js 0.160](https://threejs.org/) via importmap CDN
- Vanilla JS / HTML / CSS — fichier unique, aucun bundler

## Lancer le projet

Ouvrir `index.html` directement dans un navigateur moderne (Chrome, Firefox, Edge).

> Aucune dépendance à installer, aucun serveur requis.

## Structure

```
ui3d/
├── index.html   # application complète
└── ressources/  # modèles .glb et textures (non versionnés)
```

## Feuille de route

- [ ] Remplacer les formes placeholder par des modèles `.glb` Blender
- [ ] Appliquer les textures PNG sur les sphères
- [ ] Ajouter des effets sonores et de particules
- [ ] Connecter les gemmes à de vraies pages de jeu
