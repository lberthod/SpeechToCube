# ThreeApp: Contrôleur Interactif de Cubes 3D

ThreeApp est une application interactive qui permet de manipuler des cubes – et à terme d'autres objets 3D – dans une scène Three.js. Conçue pour être modulable et évolutive, l'application offre un contrôle précis sur divers aspects visuels et comportementaux grâce à une combinaison de technologies modernes.

## Table des Matières

1. [Présentation](#présentation)
2. [Fonctionnalités](#fonctionnalités)
3. [Structure du Projet](#structure-du-projet)
4. [Installation](#installation)
5. [Utilisation](#utilisation)
6. [Roadmap](#roadmap)
7. [Contribuer](#contribuer)
8. [Licence](#licence)
9. [Remerciements](#remerciements)

## Présentation

ThreeApp s'appuie sur plusieurs technologies clés :

- **Three.js** pour le rendu 3D et l'animation.
- **Vue 3** et **Pinia** pour la création d'une interface réactive et la gestion de l'état.
- **Express** pour le serveur backend qui reçoit et traite les commandes.
- **OpenAI** afin d'interpréter intelligemment les commandes émises par l'utilisateur grâce à des agents dédiés.

L'architecture de l'application a été pensée pour être évolutive. Ainsi, il est possible d'ajouter de nouvelles fonctionnalités, comme le support d'autres formes géométriques (sphères, plans, modèles importés, etc.) ou encore d'intégrer la reconnaissance vocale et le text-to-speech pour une expérience encore plus immersive.

## Fonctionnalités

- **Rendu 3D Dynamique :**  
  - Affichage d'un cube principal et de ses clones dans une scène Three.js.
  - Modification en temps réel de la couleur, de la rotation, de l'échelle, de la visibilité et de la texture des cubes.

- **Contrôle par Commande Textuelle :**  
  - Une interface de chat permet d'envoyer des commandes (par exemple : déplacer, dupliquer ou supprimer un cube).
  - Le serveur reçoit ces commandes, les interprète et renvoie un objet JSON décrivant l'action à effectuer.

- **Traitement Intelligent des Commandes :**  
  - Une architecture en deux étapes : d'abord un agent de triage qui détermine l'agent spécifique à utiliser, puis des agents dédiés pour chaque type d'action (ex. `moveDirection`, `changeColor`, etc.).
  - Les commandes complexes pouvant impliquer plusieurs actions sont renvoyées sous forme d'un tableau JSON.

- **Gestion d'État avec Pinia :**  
  - Synchronisation automatique des propriétés des cubes (position, couleur, etc.) entre les différents composants de l'application.
  - Suivi des animations comme le spin, le bounce, le pulse ou le flip.

> **Remarque :** Certaines fonctionnalités avancées, telles que la reconnaissance vocale via l'API Web Speech ou le text-to-speech, sont évoquées dans la roadmap.

## Structure du Projet

Le projet se divise principalement en deux parties : le front-end et le back-end.

### Front-end

```
threeApp/
├── frontend/
│   ├── public/
│   │   └── textures/     # Fichiers de textures (jpg, png, …)
│   ├── src/
│   │   ├── assets/       # Images, styles globaux, etc.
│   │   ├── components/
│   │   │   ├── ThreeScene.vue  # Scène Three.js et gestion des cubes
│   │   │   └── Chat.vue        # Interface de chat pour saisir des commandes
│   │   ├── store/
│   │   │   └── cubeStore.js    # Gestion de l'état des cubes avec Pinia
│   │   └── utils/        # Fonctions utilitaires, constantes, API, etc.
│   ├── index.html
│   └── vite.config.js
```

### Back-end

```
threeApp/
└── server/
    ├── server.js         # Serveur Express pour le traitement des commandes
    ├── .env              # Fichier de configuration (clé OpenAI, etc.)
    ├── dico.json         # Dictionnaire définissant les agents et formats attendus
    └── cube_agents/
        ├── triage.js     # Agent de triage pour orienter la commande vers le bon traitement
        ├── specific.js   # Agents spécifiques pour chaque action demandée
        └── processor.js  # Coordination entre triage et agents spécifiques
```

Une seconde organisation (par exemple dans un projet nommé "speech2cube") présente une structure plus détaillée pour le front-end et le back-end, avec notamment des composants dédiés à la scène, aux animations, à la gestion vocale, etc.

## Installation

### Prérequis

- Node.js (version 14 ou supérieure recommandée)
- npm ou yarn

### Étapes d'installation

1. **Cloner le dépôt :**

   ```bash
   git clone <repository_url>
   cd threeApp
   ```

2. **Installer le front-end :**

   ```bash
   cd frontend/speechtocube
   npm install
   ```

3. **Installer le back-end :**

   ```bash
   cd ../../server
   npm install
   ```

4. **Configuration :**

   Dans le dossier server, créez un fichier `.env` et ajoutez-y votre clé OpenAI :

   ```
   OPENAI_API_KEY=sk-...
   ```

   Veillez à ajouter ce fichier au .gitignore afin de ne pas le versionner.

5. **Lancement de l'application :**

   Front-end :
   ```bash
   cd ../frontend/speechtocube
   npm run dev
   ```

   Back-end :
   ```bash
   cd ../../server
   npm start
   ```

   Rendez-vous ensuite sur l'URL indiquée par Vite (par exemple, http://localhost:5173).

## Utilisation

### Interface de Chat

1. **Saisie de commandes :**
   - Dans l'interface de chat, tapez ou enregistrez votre commande (exemple : « déplace le cube de 3 vers la droite »).

2. **Envoi de la commande :**
   - Cliquez sur « Envoyer » pour transmettre votre commande au serveur. Ce dernier renverra une réponse JSON qui sera interprétée pour déclencher l'action dans la scène 3D.

### Exemples de Commandes

- Changer la couleur du cube :
  ```json
  { "action": "changeColor", "color": "#ff5733", "cube": 1 }
  ```

- Dupliquer le cube :
  ```json
  { "action": "duplicateCube", "cube": 1 }
  ```

- Lancer une balle :
  ```json
  { "action": "launchBall", "speed": 0.2, "direction": "droite", "cube": 1 }
  ```

### Mise à jour de la Scène

- Les propriétés du cube (position, couleur, rotation, etc.) sont mises à jour en temps réel.
- La boucle d'animation (via requestAnimationFrame) gère les animations comme le spin, le bounce, le pulse ou le flip.

## Roadmap

Le projet est en constante évolution. Voici quelques pistes d'amélioration prévues :

| ID | Fonctionnalité | Description | Points Clés d'Implémentation |
|----|----------------|-------------|------------------------------|
| 3  | Diminution progressive | Animation intense qui s'estompe progressivement pour revenir à l'état initial. | Ajouter une commande, utiliser un timer ou damping dans ThreeScene, passer la durée via le chat. |
| 4  | Traînée de particules | Création d'un effet de particules suivant le cube lors d'un déplacement rapide. | Utiliser Points et Particles de Three.js, définir l'intensité/durée via le chat. |
| 5  | Pulsation lumineuse | Variation d'intensité lumineuse synchronisée avec l'animation pour un effet de pulsation. | Modifier le matériau ou ajouter une source lumineuse avec modulation d'intensité. |
| 6  | Téléportation | Faire disparaître le cube et le faire réapparaître à un autre endroit avec un effet visuel de transition. | Implémenter une animation de fondu/distorsion et gérer les coordonnées cibles. |
| 7  | Morphing | Transformation progressive du cube en une autre forme (sphère, pyramide, etc.) par interpolation. | Utiliser morphTargets ou interpoler les géométries, suivre l'état dans le store. |
| 8  | Scission et recomposition | Division du cube en plusieurs petits cubes qui se dispersent puis se regroupent pour reformer l'original. | Gérer la dispersion synchronisée et la recomposition, coordonner via le store. |
| 9  | Animations synchronisées multi-cubes | Déclenchement simultané d'animations sur plusieurs cubes pour une chorégraphie interactive. | Implémenter une logique de synchronisation dans updateCube et via le store. |
| 10 | Réactions en chaîne environnementales | Déclencher des effets sur l'environnement (déformation du sol, changement de couleur) en réaction aux actions. | Modifier dynamiquement l'environnement via ThreeScene, transmettre des paramètres via le chat. |

Autres pistes d'amélioration :

- Support de nouveaux types d'objets (sphères, plans, modèles 3D importés).
- Intégration du text-to-speech et de la reconnaissance vocale pour une interaction plus naturelle.
- Ajout d'un moteur physique (ex. Cannon.js) pour des interactions réalistes.
- Possibilité de collaboration multi-utilisateur en temps réel.

## Contribuer

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le dépôt.
2. Créez une branche dédiée à votre fonctionnalité ou correction.
3. Soumettez une Pull Request en décrivant clairement vos modifications.

## Licence

Ce projet est distribué sous licence MIT. Pour plus de détails, consultez le fichier LICENSE.

## Remerciements

Un grand merci à :

- Three.js pour le moteur 3D.
- Vue.js et Pinia pour leur approche réactive.
- Express pour le serveur API.
- OpenAI pour l'interprétation des commandes.
- Tous les contributeurs et utilisateurs qui font évoluer ce projet !
