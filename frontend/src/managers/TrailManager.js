// src/managers/TrailManager.js
import * as THREE from 'three';

export const trailManager = {
  particles: [],
  updateTrails(scene) {
    const nowTime = performance.now();
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const age = nowTime - p.userData.creationTime;
      const lifetime = p.userData.lifetime;
      if (age >= lifetime) {
        scene.remove(p);
        this.particles.splice(i, 1);
      } else {
        p.material.opacity = 1 - (age / lifetime);
      }
    }
  },
  spawnTrail(scene, cube) {
    if (!cube.userData.trail) {
      cube.userData.trail = {
        intensity: cube.userData.trailIntensity || 1,
        duration: cube.userData.trailDuration || 2000,
        lastSpawn: 0
      };
    }
    const now = performance.now();
    if (now - cube.userData.trail.lastSpawn > 500 / cube.userData.trail.intensity) {
      const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
      const particle = new THREE.Mesh(particleGeometry, particleMaterial);
      particle.position.copy(cube.position);
      particle.userData.creationTime = now;
      particle.userData.lifetime = cube.userData.trail.duration;
      scene.add(particle);
      this.particles.push(particle);
      cube.userData.trail.lastSpawn = now;
    }
  }
};
