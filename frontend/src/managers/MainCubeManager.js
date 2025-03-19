// src/managers/MainCubeManager.js
import * as THREE from 'three';

export class MainCubeManager {
  constructor(scene, cubeStore) {
    this.scene = scene;
    this.cubeStore = cubeStore;
  }

  initMainCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: this.cubeStore.cubeColor });
    const mainCube = new THREE.Mesh(geometry, material);
    mainCube.position.set(0, 0, 0);
    mainCube.userData.id = 'mainCube';
    this.scene.add(mainCube);
    
    this.cubeStore.addElement({
      id: 'mainCube',
      type: 'cube',
      position: { x: mainCube.position.x, y: mainCube.position.y, z: mainCube.position.z },
      color: mainCube.material.color.getHex(),
      rotation: mainCube.rotation.y,
      scale: mainCube.scale.x,
      visible: mainCube.visible,
      texture: mainCube.material.map ? 'nomDeVotreTexture' : null,
      animation: null
    });
    
    return mainCube;
  }
}
