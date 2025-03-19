// src/managers/BallManager.js
import * as THREE from 'three';

export class BallManager {
  constructor(scene) {
    // Dépendance : la scène Three.js où ajouter les balles
    this.scene = scene;
    // Tableau pour stocker les balles lancées
    this.balls = [];
  }

  // Méthode pour lancer une balle
  launchBall(params) {
    const speed = params.speed || 0.1;
    let direction;
    // Détermination de la direction selon le paramètre
    switch (params.direction) {
      case 'droite':
        direction = new THREE.Vector3(1, 0, 0);
        break;
      case 'gauche':
        direction = new THREE.Vector3(-1, 0, 0);
        break;
      case 'haut':
        direction = new THREE.Vector3(0, 1, 0);
        break;
      case 'bas':
        direction = new THREE.Vector3(0, -1, 0);
        break;
      default:
        direction = new THREE.Vector3(1, 0, 0);
    }
    
    // Création de la balle
    const geometry = new THREE.SphereGeometry(0.2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 0, 0);
    ball.userData = { speed, direction };

    // Ajout de la balle à la scène et au tableau interne
    this.scene.add(ball);
    this.balls.push(ball);
  }

  // Méthode pour mettre à jour la position de toutes les balles
  updateBalls() {
    this.balls.forEach((ball) => {
      ball.position.addScaledVector(ball.userData.direction, ball.userData.speed);
    });
  }
}
