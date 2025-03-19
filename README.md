# ThreeApp: Contrôleur Interactif de Cubes 3D

ThreeApp est une application interactive qui permet de contrôler et manipuler des cubes en 3D via des commandes textuelles ou vocales. Le projet combine les technologies suivantes :

- **Three.js** pour le rendu 3D et l'animation des cubes.
- **Vue 3** avec **Pinia** pour la gestion de l'état et l'interface utilisateur.
- **Express** pour le serveur backend qui traite les commandes.
- **OpenAI API** pour l'interprétation des commandes via des agents spécialisés.

---

## Table des Matières

- [Fonctionnalités](#fonctionnalités)
- [Structure du Projet](#structure-du-projet)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Architecture et Traitement des Commandes](#architecture-et-traitement-des-commandes)
- [Contribuer](#contribuer)
- [Licence](#licence)
- [Remerciements](#remerciements)

---

## Fonctionnalités

- **Rendu 3D Dynamique :**
  - Une scène Three.js affiche un cube principal et ses clones.
  - Possibilité de modifier la couleur, la rotation, l’échelle, la visibilité et la texture du cube.
  - Animations intégrées (spin, bounce, pulse, flip).

- **Contrôle par Commande Textuelle ou Vocale :**
  - Interface de chat pour envoyer des commandes.
  - Utilisation de la Web Speech API pour la reconnaissance vocale.

- **Traitement Intelligent des Commandes :**
  - Un serveur Express reçoit les commandes et utilise l’API OpenAI pour déterminer l’action à réaliser.
  - Architecture en deux étapes avec un agent de triage et des agents spécifiques pour chaque type d’action (déplacer, changer de couleur, dupliquer, lancer une balle, etc.).

- **Gestion d’État avec Pinia :**
  - Synchronisation des propriétés du cube (position, couleur, rotation, échelle, etc.) entre les différents composants Vue.

---

## Structure du Projet

```plaintext
threeApp/
├── my-three-app/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ThreeScene.vue       # Scène Three.js et gestion des cubes
│   │   │   └── Chat.vue             # Interface de chat et commandes vocales/textuelles
│   │   └── store/
│   │       └── cubeStore.js         # Gestion d'état avec Pinia pour les cubes
│   └── ... (autres fichiers de configuration Vue)
└── server/
    ├── server.js                    # Serveur Express pour le traitement des commandes
    ├── config.json                  # Configuration (API keys, etc.)
    ├── dico.json                    # Dictionnaire des commandes et agents
    └── cube_agents/
        ├── triage.js                # Agent de triage pour orienter la commande
        ├── specific.js              # Agents spécialisés pour chaque action
        └── processor.js             # Combine triage et agents spécifiques pour traiter la commande
