<template>
  <!-- Le conteneur prend toute la place allouée par son parent -->
  <div ref="sceneContainer" class="three-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineExpose } from 'vue';
import * as THREE from 'three';
import { useCubeStore } from '../store/cubeStore';
import { MainCubeManager } from '../managers/MainCubeManager';
import { CloneManager } from '../managers/CloneManager';
import { BallManager } from '../managers/BallManager';
import { trailManager } from '../managers/TrailManager';

const sceneContainer = ref(null);
const cubeStore = useCubeStore();

// Variables de scène et instances des managers
let scene, camera, renderer, mainCube;
let mainCubeManager, cloneManagerInstance, ballManager;

function onWindowResize() {
  if (!sceneContainer.value) return;
  const width = sceneContainer.value.clientWidth;
  const height = sceneContainer.value.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  const pos = cubeStore.targetPosition || { x: 0, y: 0, z: 0 };
  const target = new THREE.Vector3(pos.x, pos.y, pos.z);
  if (mainCube && !mainCube.userData.flip && !mainCube.userData.glide) {
    mainCube.position.lerp(target, 0.1);
  }
  // Mise à jour de la position du mainCube dans le store
  cubeStore.updateElement('mainCube', {
    position: {
      x: mainCube.position.x,
      y: mainCube.position.y,
      z: mainCube.position.z,
    }
  });

  // Gestion des animations sur mainCube et les clones
  [mainCube, ...cloneManagerInstance.cubes].forEach(cube => {
    // Animation flip
    if (cube.userData.flip) {
      const { startTime, duration, startRotation, targetRotation } = cube.userData.flip;
      const elapsed = performance.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      cube.rotation.x = startRotation + (targetRotation - startRotation) * t;
      if (t === 1) delete cube.userData.flip;
    }
    // Spin
    if (cube.userData.cubeAnimation === 'spin') {
      cube.rotation.y += 0.05;
    }
    // Pulse
    if (cube.userData.cubeAnimation === 'pulse') {
      const scale = 1 + 0.3 * Math.sin(performance.now() / 200);
      cube.scale.set(scale, scale, scale);
    }
    // Bounce
    if (cube.userData.cubeAnimation === 'bounce') {
      if (cube.userData.baseY === undefined) {
        cube.userData.baseY = cube.position.y;
      }
      const bounceHeight = 0.5;
      cube.position.y = cube.userData.baseY + Math.abs(Math.sin(performance.now() / 300)) * bounceHeight;
    }
    // Wiggle
    if (cube.userData.cubeAnimation === 'wiggle') {
      cube.rotation.x += 0.02 * Math.sin(performance.now() / 100);
      cube.rotation.z += 0.02 * Math.cos(performance.now() / 100);
    }
    // Shake
    if (cube.userData.cubeAnimation === 'shake') {
      const shakeIntensity = 0.05;
      cube.position.x += (Math.random() - 0.5) * shakeIntensity;
      cube.position.y += (Math.random() - 0.5) * shakeIntensity;
      cube.position.z += (Math.random() - 0.5) * shakeIntensity;
    }
    // Swing
    if (cube.userData.cubeAnimation === 'swing') {
      cube.rotation.z = 0.2 * Math.sin(performance.now() / 300);
    }
    // Glide
// Glide
if (cube.userData.glide) {
  const now = performance.now();
  const { startTime, duration, originalPosition, finalPosition } = cube.userData.glide;
  const t = Math.min((now - startTime) / duration, 1);
  const newPos = new THREE.Vector3().lerpVectors(originalPosition, finalPosition, t);
  cube.position.copy(newPos);
  if (t === 1) {
    cube.position.copy(finalPosition);
    // Mettre à jour le store pour conserver la position finale
    // Par exemple, pour le mainCube :
    cubeStore.setTargetPosition({
      x: finalPosition.x,
      y: finalPosition.y,
      z: finalPosition.z
    });
    delete cube.userData.glide;
  }
}



    // Decline
    if (cube.userData.decline) {
      const now = performance.now();
      const { startTime, duration, originalScale } = cube.userData.decline;
      const t = Math.min((now - startTime) / duration, 1);
      const newScale = originalScale + (1 - originalScale) * t;
      cube.scale.set(newScale, newScale, newScale);
      if (t === 1) delete cube.userData.decline;
    }
    // Trail
    if (cube.userData.trail) {
      trailManager.spawnTrail(scene, cube);
    }
    // Rhythmic
    if (cube.userData.cubeAnimation === 'rhythmic') {
      const rhythm = 0.3 * Math.sin(performance.now() / 150);
      cube.scale.set(1 + rhythm, 1 + rhythm, 1 + rhythm);
      cube.rotation.y += 0.02;
    }
  });

  trailManager.updateTrails(scene);
  if (ballManager) ballManager.updateBalls();
  renderer.render(scene, camera);
}

onMounted(() => {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    sceneContainer.value.clientWidth / sceneContainer.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  sceneContainer.value.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Instanciation du MainCubeManager et création du mainCube
  mainCubeManager = new MainCubeManager(scene, cubeStore);
  mainCube = mainCubeManager.initMainCube();

  // Watchers pour synchroniser les propriétés du mainCube avec le store
  watch(() => cubeStore.cubeRotationY, (newRotationY) => {
    if (mainCube) mainCube.rotation.y = newRotationY;
  });
  watch(() => cubeStore.cubeScale, (newScale) => {
    if (mainCube) mainCube.scale.set(newScale, newScale, newScale);
  });
  watch(() => cubeStore.cubeVisible, (visible) => {
    if (mainCube) mainCube.visible = visible;
  });
  watch(() => cubeStore.cubeTexture, (textureName) => {
    if (mainCube) {
      const textureLoader = new THREE.TextureLoader();
      if (textureName) {
        textureLoader.load(`textures/${textureName}.jpg`, (texture) => {
          mainCube.material.map = texture;
          mainCube.material.needsUpdate = true;
        });
      } else {
        mainCube.material.map = null;
        mainCube.material.needsUpdate = true;
      }
    }
  });
  watch(() => cubeStore.cubeRemoved, (removed) => {
    if (removed && mainCube) scene.remove(mainCube);
  });
  watch(() => cubeStore.cubeColor, (newColor) => {
    [mainCube, ...cloneManagerInstance.cubes].forEach(cube => {
      if (cube && cube.material) {
        cube.material.color.setHex(newColor);
      }
    });
  });

  // Instanciation du CloneManager
  cloneManagerInstance = new CloneManager(scene, cubeStore);
  cubeStore.setAddCube(cloneManagerInstance.addCubeClone.bind(cloneManagerInstance));
  cubeStore.setUpdateCube((cubeIndex, property, value) => {
    cloneManagerInstance.updateCube(mainCube, cubeIndex, property, value);
  });

  // Instanciation du BallManager
  ballManager = new BallManager(scene);
  cubeStore.setLaunchBall((params) => ballManager.launchBall(params));

  cubeStore.setSceneMounted(true);

  window.addEventListener('resize', onWindowResize);
  onWindowResize();

  animate();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize);
});

defineExpose({
  addCubeClone: (cloneState) => cloneManagerInstance.addCubeClone(cloneState),
  updateCube: (cubeIndex, property, value) => {
    cloneManagerInstance.updateCube(mainCube, cubeIndex, property, value);
  },
  launchBall: (...args) => {
    if (ballManager) {
      ballManager.launchBall(...args);
    } else {
      console.error("BallManager n'est pas encore initialisé.");
    }
  }
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 450px;
  background-color: #000;
  border: 2px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.three-container canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100% !important;
  height: 100% !important;
}
</style>
