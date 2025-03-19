// src/managers/CloneManager.js
import * as THREE from 'three';
import { generateUniqueId } from '../utils';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class CloneManager {
  constructor(scene, cubeStore) {
    this.scene = scene;
    this.cubeStore = cubeStore;
    this.cubes = [];
    this.textureLoader = new THREE.TextureLoader();
  }

  addCubeClone(cloneState) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: cloneState.cubeColor || 0xff00ff });
    const clone = new THREE.Mesh(geometry, material);

    const offset = 2 * (this.cubes.length + 1);
    clone.position.set(
      cloneState.targetPosition.x + offset,
      cloneState.targetPosition.y,
      cloneState.targetPosition.z
    );
    clone.rotation.y = cloneState.cubeRotationY;
    clone.scale.set(cloneState.cubeScale, cloneState.cubeScale, cloneState.cubeScale);
    clone.visible = true;

    if (cloneState.cubeTexture) {
      this.textureLoader.load(`textures/${cloneState.cubeTexture}.jpg`, (texture) => {
        clone.material.map = texture;
        clone.material.needsUpdate = true;
      });
    }

    const id = generateUniqueId('clone_');
    clone.userData.id = id;

    this.scene.add(clone);
    this.cubes.push(clone);

    this.cubeStore.addElement({
      id: id,
      type: 'cube',
      position: { x: clone.position.x, y: clone.position.y, z: clone.position.z },
      color: clone.material.color.getHex(),
      rotation: clone.rotation.y,
      scale: clone.scale.x,
      visible: clone.visible,
      texture: clone.material.map ? 'nomDeVotreTexture' : null,
      animation: clone.userData.cubeAnimation || null
    });
  }

  updateCube(mainCube, cubeIndex, property, value) {
    // Le cube principal a cubeIndex === 1, les clones sont stockés à l'indice cubeIndex - 2
    const targetCube = (cubeIndex === 1) ? mainCube : this.cubes[cubeIndex - 2];
    if (!targetCube) {
      console.error(`Cube numéro ${cubeIndex} non trouvé.`);
      return;
    }

    switch (property) {
      case 'color':
      case 'changeColor': {
        targetCube.material.color.setHex(value);
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { color: value });
        }
        break;
      }
      case 'rotation':
      case 'rotateCube': {
        const angleInRadians = value * (Math.PI / 180);
        targetCube.rotation.y += angleInRadians;
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { rotation: targetCube.rotation.y });
        }
        break;
      }
      case 'scale':
      case 'scaleCube': {
        targetCube.scale.set(value, value, value);
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { scale: value });
        }
        break;
      }
      case 'flipCube': {
        const duration = value.duration || 1;
        targetCube.userData.flip = {
          startTime: performance.now(),
          duration: duration * 1000,
          startRotation: targetCube.rotation.x,
          targetRotation: targetCube.rotation.x + Math.PI
        };
        break;
      }
      case 'moveDirection': {
        const delta = { x: 0, y: 0, z: 0 };
        if (value.direction === 'droite') delta.x = 1;
        else if (value.direction === 'gauche') delta.x = -1;
        else if (value.direction === 'haut') delta.y = 1;
        else if (value.direction === 'bas') delta.y = -1;
        targetCube.position.x += delta.x * value.magnitude;
        targetCube.position.y += delta.y * value.magnitude;
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, {
            position: {
              x: targetCube.position.x,
              y: targetCube.position.y,
              z: targetCube.position.z
            }
          });
        }
        break;
      }
      case 'moveDepth': {
        const deltaZ = (value.direction === 'forward') ? -1 : 1;
        targetCube.position.z += deltaZ * value.magnitude;
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, {
            position: {
              x: targetCube.position.x,
              y: targetCube.position.y,
              z: targetCube.position.z
            }
          });
        }
        break;
      }
      case 'toggleVisibility': {
        targetCube.visible = !targetCube.visible;
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { visible: targetCube.visible });
        }
        break;
      }
      case 'texture': {
        if (value) {
          this.textureLoader.load(`textures/${value}.jpg`, (texture) => {
            targetCube.material.map = texture;
            targetCube.material.needsUpdate = true;
          });
        } else {
          targetCube.material.map = null;
          targetCube.material.needsUpdate = true;
        }
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { texture: value });
        }
        break;
      }
      case 'startAnimation': {
        if (typeof value === 'object' && value !== null) {
          targetCube.userData.cubeAnimation = value.animationType;
          if (value.animationType === 'rhythmic' && value.duration) {
            targetCube.userData.rhythmicDuration = value.duration;
          }
          if (value.duration) {
            setTimeout(() => {
              targetCube.userData.cubeAnimation = null;
              if (targetCube.userData.id) {
                this.cubeStore.updateElement(targetCube.userData.id, { animation: null });
              }
            }, value.duration * 1000);
          }
        } else {
          targetCube.userData.cubeAnimation = value;
        }
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { animation: targetCube.userData.cubeAnimation });
        }
        break;
      }
      case 'stopAnimation': {
        targetCube.userData.cubeAnimation = null;
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { animation: null });
        }
        break;
      }
      case 'glide': {
        const duration = value.duration ? value.duration * 1000 : 1000;
        // Calculer le vecteur d'offset final selon la direction et la magnitude
        const finalOffset = new THREE.Vector3();
        switch (value.direction) {
          case 'droite':
            finalOffset.set(value.magnitude, 0, 0);
            break;
          case 'gauche':
            finalOffset.set(-value.magnitude, 0, 0);
            break;
          case 'haut':
            finalOffset.set(0, value.magnitude, 0);
            break;
          case 'bas':
            finalOffset.set(0, -value.magnitude, 0);
            break;
          default:
            finalOffset.set(0, 0, 0);
        }
        // Sauvegarder la position d'origine et calculer la position finale
        const currentPos = targetCube.position.clone();
        const finalPos = currentPos.clone().add(finalOffset);
        targetCube.userData.glide = {
          startTime: performance.now(),
          duration: duration,
          originalPosition: currentPos, // position de départ
          finalPosition: finalPos,      // position d'arrivée
          direction: value.direction,
          magnitude: value.magnitude,
          speed: value.speed
        };
        targetCube.userData.cubeAnimation = 'glide';
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { animation: 'glide' });
        }
        break;
      }
      
      
      case 'decline': {
        const duration = value.duration ? value.duration * 1000 : 3000;
        targetCube.userData.decline = {
          startTime: performance.now(),
          duration: duration,
          originalScale: targetCube.scale.x
        };
        targetCube.userData.cubeAnimation = 'decline';
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { animation: 'decline' });
        }
        break;
      }
      case 'trail': {
        targetCube.userData.trail = {
          intensity: value.intensity || 1,
          duration: value.duration ? value.duration * 1000 : 2000,
          lastSpawn: 0
        };
        targetCube.userData.cubeAnimation = 'trail';
        if (targetCube.userData.id) {
          this.cubeStore.updateElement(targetCube.userData.id, { animation: 'trail' });
        }
        break;
      }
      case 'morphing': {
        const modelType = value.model ? value.model.toLowerCase() : 'sphere';
        if (modelType === 'cube') {
          const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
          if (targetCube.isMesh) {
            if (targetCube.geometry) targetCube.geometry.dispose();
            targetCube.geometry = cubeGeometry;
          } else {
            this.scene.remove(targetCube);
            const newCube = new THREE.Mesh(cubeGeometry, new THREE.MeshBasicMaterial({ color: this.cubeStore.cubeColor }));
            newCube.position.copy(targetCube.position);
            newCube.rotation.copy(targetCube.rotation);
            newCube.scale.copy(targetCube.scale);
            this.cubes[cubeIndex - 2] = newCube;
            this.scene.add(newCube);
          }
        } else if (modelType === 'sphere') {
          const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
          if (targetCube.geometry) targetCube.geometry.dispose();
          targetCube.geometry = sphereGeometry;
        } else {
          const glbDictionary = {
            "manette": "models/voiture.glb",
            "avion": "models/plane.glb",
            "maison": "models/house.glb"
          };
          const url = glbDictionary[modelType];
          if (url) {
            const loader = new GLTFLoader();
            loader.load(
              url,
              (gltf) => {
                const container = new THREE.Group();
                container.add(gltf.scene);
                container.position.copy(targetCube.position);
                container.rotation.copy(targetCube.rotation);
                container.scale.copy(targetCube.scale);
                container.userData.isGLB = true;
                this.scene.remove(targetCube);
                this.cubes[cubeIndex - 2] = container;
                this.scene.add(container);
              },
              undefined,
              (error) => {
                console.error("Erreur lors du chargement du modèle GLTF:", error);
              }
            );
          } else {
            console.warn("Modèle GLB inconnu :", value.model);
          }
        }
        break;
      }
      case 'moveElementCloseToElement': {
        const sourceCubeIndex = value.sourceCube;
        const sourceCube = (sourceCubeIndex === 1) ? mainCube : this.cubes[sourceCubeIndex - 2];
        if (!sourceCube) {
          console.error(`Cube source numéro ${sourceCubeIndex} non trouvé.`);
          break;
        }
        const placement = value.placement ? value.placement.toLowerCase() : 'droite';
        const offset = 1.2;
        let newPosition = new THREE.Vector3();
        if (placement === 'droite')
          newPosition.set(sourceCube.position.x + offset, sourceCube.position.y, sourceCube.position.z);
        else if (placement === 'gauche')
          newPosition.set(sourceCube.position.x - offset, sourceCube.position.y, sourceCube.position.z);
        else if (placement === 'dessus' || placement === 'au-dessus')
          newPosition.set(sourceCube.position.x, sourceCube.position.y + offset, sourceCube.position.z);
        else if (placement === 'dessous' || placement === 'en dessous')
          newPosition.set(sourceCube.position.x, sourceCube.position.y - offset, sourceCube.position.z);
        else {
          console.warn(`Placement inconnu: ${placement}. Utilisation de "droite" par défaut.`);
          newPosition.set(sourceCube.position.x + offset, sourceCube.position.y, sourceCube.position.z);
        }
        targetCube.position.copy(newPosition);
        if (cubeIndex === 1) {
          this.cubeStore.setTargetPosition({
            x: newPosition.x,
            y: newPosition.y,
            z: newPosition.z
          });
        }
        break;
      }
      default:
        console.warn(`Propriété inconnue : ${property}`);
    }
  }
}
