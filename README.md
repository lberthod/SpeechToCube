# ThreeApp: Contrôleur Interactif de Cubes 3D

ThreeApp est une application interactive qui permet de manipuler des cubes (et futurs objets 3D) dans une scène Three.js. Elle combine plusieurs technologies pour offrir un contrôle avancé et extensible, tout en laissant place à de nombreuses pistes d'amélioration.

---

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

---

## Présentation

ThreeApp repose principalement sur :
- **Three.js** pour le rendu 3D et l'animation.
- **Vue 3** et **Pinia** pour la gestion de l'état et la structure de l'interface.
- **Express** en backend pour traiter les commandes reçues.
- **OpenAI** pour l'interprétation intelligente des commandes (via des agents dédiés).

Cette application se veut modulaire et évolutive : de nouvelles fonctionnalités ou nouveaux types d'objets (sphère, plane, modèles Mixamo, etc.) peuvent être intégrés progressivement.

---

## Fonctionnalités

- **Rendu 3D Dynamique :**  
  - Affichage d'un cube principal et de ses clones dans une scène Three.js.  
  - Possibilité de modifier la couleur, la rotation, l'échelle, la visibilité et la texture du cube.

- **Contrôle par Commande Textuelle :**  
  - Une interface de chat permet l'envoi de commandes textuelles.  
  - Les commandes sont transmises au serveur pour déclencher des actions (déplacer, dupliquer, supprimer, etc.).

- **Traitement Intelligent des Commandes :**  
  - Architecture en deux étapes (triage et agents spécifiques) via OpenAI.  
  - Chaque commande renvoie un JSON décrivant l'action à effectuer (ex. `moveDirection`, `changeColor`, etc.).

- **Gestion d'État avec Pinia :**  
  - Synchronisation en temps réel des propriétés (position, couleur, etc.) entre les composants Vue.  
  - Suivi des animations (spin, bounce, pulse, flip).

> **Note :** La reconnaissance vocale (Web Speech API) et d'autres fonctionnalités avancées (ex. text-to-speech) sont abordées dans la [Roadmap](#roadmap).

---

## Structure du Projet

```
threeApp/
├── frontend/
│   ├── public/
│   │   ├── textures/
│   │   │   └── (vos_fichiers_texture.jpg)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ThreeScene.vue    # Scène Three.js et gestion des cubes
│   │   │   └── Chat.vue          # Interface de chat (commandes textuelles)
│   │   └── store/
│   │       └── cubeStore.js      # Gestion d'état (Pinia) pour les cubes
│   └── ... (configurations Vite/Vue)
└── server/
    ├── server.js                 # Serveur Express pour le traitement des commandes
    ├── .env                      # Fichier d'environnement (clé OpenAI, etc.)
    ├── dico.json                 # Dictionnaire des commandes et agents
    └── cube_agents/
        ├── triage.js             # Agent de triage pour orienter la commande
        ├── specific.js           # Agents spécialisés pour chaque action
        └── processor.js          # Combine triage et agents spécifiques
```

## Installation

### Prérequis
- Node.js (version 14 ou supérieure recommandée)
- npm ou yarn

### Étapes

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
   - Créez un fichier `.env` dans le dossier server et ajoutez-y votre clé OpenAI :
     ```env
     OPENAI_API_KEY=sk-...
     ```
   - Assurez-vous de ne pas versionner ce fichier (ajoutez-le au `.gitignore`).

5. **Lancement :**
   - Front-end :
     ```bash
     cd ../frontend/speechtocube
     npm run dev
     ```
   - Back-end :
     ```bash
     cd ../../server
     npm start
     ```
   - Rendez-vous sur l'URL fournie par Vite (généralement http://localhost:5173).

---

## Utilisation

### Interface de Chat :
- Saisissez votre commande (ex. `déplace le cube de 3 vers la droite`) dans la zone de texte.
- Appuyez sur Envoyer. Le serveur renvoie alors un JSON qui déclenche l'action dans la scène.

### Exemples de Commandes :

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

### Modifications dans la Scène :
- Les propriétés du cube (position, couleur, rotation, etc.) se mettent à jour en temps réel.
- Les animations (spin, bounce, pulse, flip) sont gérées par la boucle d'animation `requestAnimationFrame`.

---

## Roadmap

Le projet est conçu pour évoluer avec de nouvelles fonctionnalités et animations. Voici quelques pistes d'amélioration et leurs grandes lignes d'implémentation :

| ID | Fonctionnalité | Description | Implémentation Principale |
|----|---------------|-------------|---------------------------|
| 3 | Diminution progressive | Animation intense qui s'estompe progressivement après un temps défini pour revenir à l'état initial. | - Dico : Ajouter une commande pour l'animation.<br>- ThreeScene : Timer ou damping pour réduire l'intensité sur la durée.<br>- Chat : Transmission du paramètre durée. |
| 4 | Traînée de particules | Générer un effet de particules suivant le cube lors d'un déplacement rapide. | - Dico : Définir une commande trail.<br>- ThreeScene : Utiliser Points et Particles de Three.js.<br>- Chat : Indiquer intensité ou durée. |
| 5 | Pulsation lumineuse | Variation d'intensité lumineuse synchronisée avec l'animation, pour un effet de pulsation. | - Dico : Inclure une commande pulseLight.<br>- ThreeScene : Ajouter une source lumineuse ou modifier le matériau.<br>- Chat : Spécifier l'intensité. |
| 6 | Téléportation | Disparition du cube et réapparition instantanée à un autre endroit avec un effet visuel. | - Dico : Créer une commande teleport (coordonnées cibles).<br>- ThreeScene : Animation de fondu ou distorsion.<br>- Chat : Gérer coordonnées et durée éventuelle. |
| 7 | Morphing | Transformation progressive du cube en une autre forme (sphère, pyramide, etc.) avec interpolation. | - Dico : Commande morph avec forme cible.<br>- ThreeScene : Utiliser morphTargets ou interpolation de géométries.<br>- CubeStore : Suivre l'état de morphing. |
| 8 | Scission et recomposition | Division du cube en plusieurs petits cubes qui se dispersent, puis se regroupent pour reformer l'original. | - Dico : Commande splitReform.<br>- ThreeScene : Gérer la dispersion et la recomposition synchronisée.<br>- Chat : Vérifier passage de paramètres. |
| 9 | Animations synchronisées multi-cubes | Déclenchement simultané d'animations sur plusieurs cubes pour une chorégraphie interactive. | - Dico : Commande syncAnimation ciblant plusieurs cubes.<br>- ThreeScene : Logique de synchro dans updateCube.<br>- CubeStore : Fonction de coordination. |
| 10 | Réactions en chaîne environnementales | Déclenchement d'effets sur l'environnement (déformation du sol, changement de couleur) en réaction aux actions des cubes. | - Dico : Commande envReact avec paramètres.<br>- ThreeScene : Modification dynamique de l'environnement.<br>- Chat : Interface pour visualiser les changements. |

### Autres pistes :

- **Nouveaux styles d'objets** : gestion de sphères, de planes ou de modèles 3D (Mixamo, etc.).
- **Text-to-Speech et Reconnaissance Vocale** : pour rendre l'expérience encore plus immersive.
- **Collisions et Physique** : intégration d'un moteur physique (ex. Cannon.js) pour des interactions réalistes.
- **Multijoueur / Collaboration** : possibilité pour plusieurs utilisateurs de manipuler la scène en temps réel.

---

## Contribuer

Les contributions sont les bienvenues ! Pour proposer des améliorations ou corriger des bugs :

1. Forkez le dépôt.
2. Créez une branche pour vos modifications.
3. Soumettez une Pull Request avec une description claire.

---

## Licence

Ce projet est sous licence MIT. Consultez le fichier LICENSE pour plus de détails.

---

## Remerciements

- **Three.js** pour le rendu 3D.
- **Vue.js** et **Pinia** pour la gestion d'état réactive.
- **Express** pour la mise en place rapide d'un serveur API.
- **OpenAI** pour la compréhension intelligente des commandes.
- Et tous les contributeurs qui rendent ce projet possible !
