<template>
    <div ref="sceneContainer" class="three-container"></div>
</template>

<script setup>
import { ref, onMounted, watch, defineExpose } from 'vue'
import * as THREE from 'three'
import { useCubeStore } from '../store/cubeStore'

const sceneContainer = ref(null)
const cubeStore = useCubeStore()

let scene, camera, renderer
let mainCube // Cube principal
const cubes = [] // Stocke le cube principal et ses clones
const balls = [] // Stocke les balles lancées
const textureLoader = new THREE.TextureLoader()

// Tableau global pour les particules de trail
const trailParticles = []

onMounted(() => {
    // Initialisation de la scène Three.js
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / 400, 0.1, 1000)
    camera.position.z = 5

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, 400)
    sceneContainer.value.appendChild(renderer.domElement)

    // Création du cube principal
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: cubeStore.cubeColor })
    mainCube = new THREE.Mesh(geometry, material)
    mainCube.position.set(0, 0, 0)
    scene.add(mainCube)
    cubes.push(mainCube)

    // Mises à jour réactives grâce aux watchers de Pinia
    watch(() => cubeStore.cubeColor, (newColor) => {
        if (mainCube?.material) {
            mainCube.material.color.setHex(newColor)
        }
    })
    watch(() => cubeStore.cubeRotationY, (newRotationY) => {
        if (mainCube) {
            mainCube.rotation.y = newRotationY
        }
    })
    watch(() => cubeStore.cubeScale, (newScale) => {
        if (mainCube) {
            mainCube.scale.set(newScale, newScale, newScale)
        }
    })
    watch(() => cubeStore.cubeVisible, (visible) => {
        if (mainCube) {
            mainCube.visible = visible
        }
    })
    watch(() => cubeStore.cubeTexture, (textureName) => {
        if (mainCube) {
            if (textureName) {
                textureLoader.load(`textures/${textureName}.jpg`, (texture) => {
                    mainCube.material.map = texture
                    mainCube.material.needsUpdate = true
                })
            } else {
                mainCube.material.map = null
                mainCube.material.needsUpdate = true
            }
        }
    })
    watch(() => cubeStore.cubeRemoved, (removed) => {
        if (removed && mainCube) {
            scene.remove(mainCube)
        }
    })

    // Enregistrement des fonctions dans le store pour être appelées depuis le Chat
    cubeStore.setAddCube(addCubeClone)
    cubeStore.setUpdateCube(updateCube)
    cubeStore.setLaunchBall(launchBall)
    cubeStore.setSceneMounted(true)
    console.log("La scène est montée.")

    animate()
})

function animate() {
    requestAnimationFrame(animate)

    // Animation du cube principal vers sa position cible (si aucune animation de flip ou glide n'est en cours)
    const target = new THREE.Vector3(
        cubeStore.targetPosition.x,
        cubeStore.targetPosition.y,
        cubeStore.targetPosition.z
    )
    if (mainCube && !mainCube.userData.flip && !mainCube.userData.glide) {
        mainCube.position.lerp(target, 0.1)
    }

    // Mise à jour des animations sur tous les cubes
    cubes.forEach((cub) => {
        // Animation de flip (rotation sur X)
        if (cub.userData.flip) {
            const { startTime, duration, startRotation, targetRotation } = cub.userData.flip
            const elapsed = performance.now() - startTime
            const t = Math.min(elapsed / duration, 1)
            cub.rotation.x = startRotation + (targetRotation - startRotation) * t
            if (t === 1) delete cub.userData.flip
        }
        // Gestion des animations existantes
        const anim = cub.userData.cubeAnimation
        if (anim === 'spin') {
            cub.rotation.y += 0.05
        } else if (anim === 'bounce') {
            const time = Date.now() * 0.005
            cub.position.y = Math.abs(Math.sin(time)) * 0.5
        } else if (anim === 'pulse') {
            const time = Date.now() * 0.005
            const s = 1 + 0.2 * Math.abs(Math.sin(time))
            cub.scale.set(s, s, s)
        } else if (anim === 'wiggle') {
            if (!cub.userData.originalPosition) {
                cub.userData.originalPosition = cub.position.clone()
            }
            const time = Date.now() * 0.005
            cub.position.x = cub.userData.originalPosition.x + Math.sin(time) * 0.2
        } else if (anim === 'shake') {
            if (!cub.userData.originalPosition) {
                cub.userData.originalPosition = cub.position.clone()
            }
            cub.position.x = cub.userData.originalPosition.x + (Math.random() - 0.5) * 0.1
            cub.position.y = cub.userData.originalPosition.y + (Math.random() - 0.5) * 0.1
        } else if (anim === 'swing') {
            if (cub.userData.originalRotationZ === undefined) {
                cub.userData.originalRotationZ = cub.rotation.z
            }
            const time = Date.now() * 0.005
            cub.rotation.z = cub.userData.originalRotationZ + Math.sin(time) * 0.3
        } else if (anim === 'glide') {
  if (cub.userData.glide) {
    let { startTime, duration, direction, magnitude, originalPosition, speed } = cub.userData.glide;
    let speedFactor = 1;
    if (speed) {
      if (speed.toLowerCase() === 'lent') speedFactor = 0.5;
      else if (speed.toLowerCase() === 'rapide') speedFactor = 1.5;
    }
    const elapsed = performance.now() - startTime;
    const progress = Math.min(elapsed / duration * speedFactor, 1);
    let dirVector = new THREE.Vector3(0, 0, 0);
    if (direction === 'droite') dirVector.set(1, 0, 0);
    else if (direction === 'gauche') dirVector.set(-1, 0, 0);
    else if (direction === 'haut') dirVector.set(0, 1, 0);
    else if (direction === 'bas') dirVector.set(0, -1, 0);
    const displacement = dirVector.multiplyScalar(magnitude * progress);
    cub.position.copy(originalPosition.clone().add(displacement));
    if (progress === 1) {
      // Une fois le glide terminé, on enregistre la position finale comme référence
      cub.userData.originalPosition = cub.position.clone();
      cub.userData.glide = null;
      // Met à jour la targetPosition dans le store pour éviter que le lerp ne modifie la position finale
      cubeStore.setTargetPosition({ x: cub.position.x, y: cub.position.y, z: cub.position.z });
    }
  }
}
 else if (anim === 'rhythmic') {
            // Gestion de l'effet rythmique variable
            if (!cub.userData.rhythmic) {
                cub.userData.rhythmic = { startTime: performance.now(), duration: (cub.userData.rhythmicDuration || 5) * 1000 };
                cub.userData.originalY = cub.position.y;
            }
            const { startTime, duration } = cub.userData.rhythmic;
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const baseFrequency = 2; // en Hz
            const baseAmplitude = 0.2;
            const frequency = baseFrequency * (1 + progress);
            const amplitude = baseAmplitude * (1 + progress);
            const timeSec = performance.now() / 1000;
            const offset = Math.sin(2 * Math.PI * frequency * timeSec) * amplitude;
            cub.position.y = cub.userData.originalY + offset;
            if (progress === 1) {
                delete cub.userData.rhythmic;
                cub.userData.cubeAnimation = null;
            }
        } else if (anim === 'decline') {
            // Gestion de l'animation de diminution progressive
            if (!cub.userData.decline) {
                cub.userData.decline = {
                    startTime: performance.now(),
                    duration: (cub.userData.declineDuration || 3) * 1000,
                    originalScale: cub.scale.x
                };
            }
            const { startTime, duration, originalScale } = cub.userData.decline;
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const intenseScale = originalScale * 1.5;
            const currentScale = intenseScale - (intenseScale - originalScale) * progress;
            cub.scale.set(currentScale, currentScale, currentScale);
            if (progress === 1) {
                delete cub.userData.decline;
                cub.userData.cubeAnimation = null;
            }
        } else if (anim === 'trail') {
            // Gestion de l'effet de traînée de particules
            if (!cub.userData.trail) {
                cub.userData.trail = {
                    intensity: cub.userData.trailIntensity || 1, // Par défaut 1 (peut être augmenté)
                    duration: cub.userData.trailDuration || 2000,   // Durée en ms par particule (par défaut 2000 ms)
                    lastSpawn: 0
                };
            }
            const now = performance.now();
            const intensity = cub.userData.trail.intensity;
            // Intervalle de spawn : 500/intensity ms pour plus de fréquence
            if (now - cub.userData.trail.lastSpawn > 500 / intensity) {
                // Création d'une particule plus grande
                const particleGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const particleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
                const particle = new THREE.Mesh(particleGeometry, particleMaterial);
                particle.position.copy(cub.position);
                particle.userData.creationTime = now;
                particle.userData.lifetime = cub.userData.trail.duration;
                scene.add(particle);
                trailParticles.push(particle);
                cub.userData.trail.lastSpawn = now;
            }
        }
    })

    // Mise à jour des particules de trail
    const now = performance.now();
    for (let i = trailParticles.length - 1; i >= 0; i--) {
        const p = trailParticles[i];
        const age = now - p.userData.creationTime;
        const lifetime = p.userData.lifetime;
        if (age >= lifetime) {
            scene.remove(p);
            trailParticles.splice(i, 1);
        } else {
            p.material.opacity = 1 - (age / lifetime);
        }
    }

    // Mise à jour du déplacement des balles
    balls.forEach((ball) => {
        ball.position.addScaledVector(ball.userData.direction, ball.userData.speed);
    });

    renderer.render(scene, camera);
}

function addCubeClone(cloneState) {
    if (!mainCube) return;
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: cloneState.cubeColor || 0xff00ff });
    const clone = new THREE.Mesh(geometry, material);
    const offset = 2 * cubes.length;
    clone.position.set(
        cloneState.targetPosition.x + offset,
        cloneState.targetPosition.y,
        cloneState.targetPosition.z
    );
    clone.rotation.y = cloneState.cubeRotationY;
    clone.scale.set(cloneState.cubeScale, cloneState.cubeScale, cloneState.cubeScale);
    clone.visible = true;
    if (cloneState.cubeTexture) {
        textureLoader.load(`textures/${cloneState.cubeTexture}.jpg`, (texture) => {
            clone.material.map = texture;
            clone.material.needsUpdate = true;
        });
    }
    scene.add(clone);
    cubes.push(clone);
}

function updateCube(cubeIndex, property, value) {
    const targetCube = cubes[cubeIndex - 1];
    if (!targetCube) {
        console.error(`Cube numéro ${cubeIndex} non trouvé.`);
        return;
    }
    switch (property) {
        case 'color':
            targetCube.material.color.setHex(value);
            break;
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
            targetCube.position.set(
                targetCube.position.x + delta.x * value.magnitude,
                targetCube.position.y + delta.y * value.magnitude,
                targetCube.position.z
            );
            break;
        }
        case 'moveDepth': {
            const deltaZ = (value.direction === 'forward') ? -1 : 1;
            targetCube.position.set(
                targetCube.position.x,
                targetCube.position.y,
                targetCube.position.z + deltaZ * value.magnitude
            );
            break;
        }
        case 'rotation': {
            const angleInRadians = value * (Math.PI / 180);
            targetCube.rotation.y += angleInRadians;
            break;
        }
        case 'scale': {
            targetCube.scale.set(value, value, value);
            break;
        }
        case 'toggleVisibility': {
            targetCube.visible = !targetCube.visible;
            break;
        }
        case 'texture': {
            if (value) {
                textureLoader.load(`textures/${value}.jpg`, (texture) => {
                    targetCube.material.map = texture;
                    targetCube.material.needsUpdate = true;
                });
            } else {
                targetCube.material.map = null;
                targetCube.material.needsUpdate = true;
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
                    }, value.duration * 1000);
                }
            } else {
                targetCube.userData.cubeAnimation = value;
            }
            break;
        }
        case 'stopAnimation':
            targetCube.userData.cubeAnimation = null;
            break;
        case 'glide': {
            const duration = value.duration ? value.duration * 1000 : 1000;
            targetCube.userData.glide = {
                startTime: performance.now(),
                duration: duration,
                direction: value.direction,
                magnitude: value.magnitude,
                originalPosition: targetCube.position.clone(),
                speed: value.speed // "lent" ou "rapide"
            };
            // IMPORTANT : Définir également le type d'animation pour déclencher l'effet
            targetCube.userData.cubeAnimation = 'glide';
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
            break;
        }
        case 'trail': {
            // Lancement de l'effet de trail avec intensité et durée
            targetCube.userData.trail = {
                intensity: value.intensity || 1,
                duration: value.duration ? value.duration * 1000 : 2000,
                lastSpawn: 0
            };
            targetCube.userData.cubeAnimation = 'trail';
            break;
        }
        default:
            console.warn(`Propriété inconnue : ${property}`);
    }
}

function launchBall(params) {
    const speed = params.speed || 0.1;
    const dirString = params.direction || 'droite';
    let direction;
    if (dirString === 'droite') direction = new THREE.Vector3(1, 0, 0);
    else if (dirString === 'gauche') direction = new THREE.Vector3(-1, 0, 0);
    else if (dirString === 'haut') direction = new THREE.Vector3(0, 1, 0);
    else if (dirString === 'bas') direction = new THREE.Vector3(0, -1, 0);
    else direction = new THREE.Vector3(1, 0, 0);

    const geometry = new THREE.SphereGeometry(0.2, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const ball = new THREE.Mesh(geometry, material);
    ball.position.set(0, 0, 0);
    ball.userData = { speed, direction };
    scene.add(ball);
    balls.push(ball);
}

defineExpose({ addCubeClone, updateCube, launchBall })
</script>

<style scoped>
.three-container {
    border: 1px solid #ccc;
    margin-top: 20px;
}
</style>