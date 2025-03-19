<template>
  <div class="chat-container">
    <h2>Contrôle via commande</h2>

    <!-- Disposition horizontale : zone de saisie à gauche, retour commande à droite -->
    <div class="chat-row">
      <div class="chat-inputs">
        <textarea v-model="userMessage" placeholder="Parlez votre commande ou tapez-la..." rows="5"></textarea>

        <div class="chat-actions">
          <button @click="toggleRecording">
            {{ recording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement" }}
          </button>
          <button @click="sendMessage">Envoyer</button>
        </div>
      </div>

      <div v-if="reply" class="reply-panel">
        <h3>Commande interprétée :</h3>
        <pre>{{ formattedReply }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useCubeStore } from '../store/cubeStore'

// État local
const userMessage = ref('')
const reply = ref(null)
const recording = ref(false)

// Store Pinia
const cubeStore = useCubeStore()

// Vecteurs direction pour le déplacement
const directionVectors = {
  droite: { x: 1, y: 0, z: 0 },
  gauche: { x: -1, y: 0, z: 0 },
  haut: { x: 0, y: 1, z: 0 },
  bas: { x: 0, y: -1, z: 0 }
}

// Couleurs possibles
const colorMapping = {
  red: 0xff0000,
  blue: 0x0000ff,
  green: 0x00ff00,
  yellow: 0xffff00,
  black: 0x000000,
  white: 0xffffff,
  orange: 0xffa500,
  purple: 0x800080,
  pink: 0xffc0cb,
  cyan: 0x00ffff,
  magenta: 0xff00ff
}

// Reconnaissance vocale (Web Speech API) si dispo
let recognition
if ('webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'fr-FR'
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.addEventListener('result', (event) => {
    userMessage.value = event.results[0][0].transcript
  })

  recognition.addEventListener('end', () => {
    recording.value = false
    sendMessage()
  })
} else {
  console.warn("La reconnaissance vocale n'est pas supportée par ce navigateur.")
}

function toggleRecording() {
  if (!recognition) return
  if (recording.value) {
    recognition.stop()
    recording.value = false
  } else {
    recognition.start()
    recording.value = true
  }
}

// Envoi de la commande au serveur
async function sendMessage() {
  if (!userMessage.value.trim()) return
  try {
    const response = await axios.post('http://localhost:3000/api/chat', {
      message: userMessage.value
    })
    reply.value = response.data.reply
    userMessage.value = ''
    console.log('Réponse brute :', reply.value)

    let parsed
    try {
      parsed = typeof reply.value === 'string' ? JSON.parse(reply.value) : reply.value
    } catch (e) {
      console.error('Erreur lors du parsing du JSON:', e)
      return
    }

    const actions = Array.isArray(parsed) ? parsed : [parsed]
    console.log('Actions interprétées :', actions)

    // Pour chaque action, on exécute sur le store / la scène
    actions.forEach(actionObj => {
      const targetCubeNumber = actionObj.cube || 1
      switch (actionObj.action) {
        case 'moveDirection': {
          const magnitude = parseFloat(actionObj.magnitude)
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'moveDirection', {
              direction: actionObj.direction,
              magnitude
            })
          } else {
            // Sur le cube principal, on modifie la targetPosition
            const vec = directionVectors[actionObj.direction]
            if (vec) {
              cubeStore.setTargetPosition({
                x: cubeStore.targetPosition.x + vec.x * magnitude,
                y: cubeStore.targetPosition.y + vec.y * magnitude,
                z: cubeStore.targetPosition.z + vec.z * magnitude
              })
            }
          }
          break
        }
        case 'moveDepth': {
          const magnitude = parseFloat(actionObj.magnitude)
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'moveDepth', {
              direction: actionObj.direction,
              magnitude
            })
          } else {
            const deltaZ = actionObj.direction === 'forward' ? -1 : 1
            cubeStore.setTargetPosition({
              x: cubeStore.targetPosition.x,
              y: cubeStore.targetPosition.y,
              z: cubeStore.targetPosition.z + deltaZ * magnitude
            })
          }
          break
        }
        case 'changeColor': {
          let newColor;
          const key = typeof actionObj.color === 'string' ? actionObj.color.toLowerCase() : '';
          if (colorMapping[key]) {
            newColor = colorMapping[key];
          } else if (
            typeof actionObj.color === 'string' &&
            /^#?[0-9A-Fa-f]{6}$/.test(actionObj.color)
          ) {
            newColor = parseInt(actionObj.color.replace('#', ''), 16);
          }
          if (newColor !== undefined) {
            if (targetCubeNumber > 1) {
              // Pour les clones, on passe la propriété "changeColor" (alias de "color")
              cubeStore.updateCubeFn(targetCubeNumber, 'changeColor', newColor);
            } else {
              // Pour le cube principal, on utilise directement la méthode de mise à jour de la couleur
              cubeStore.setCubeColor(newColor);
            }
          }
          break;
        }

        case 'rotateCube': {
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'rotation', actionObj.angle)
          } else {
            cubeStore.updateCubeFn(1, 'rotation', actionObj.angle)
          }
          break
        }
        case 'scaleCube': {
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'scale', actionObj.factor)
          } else {
            cubeStore.setCubeScale(actionObj.factor)
          }
          break
        }
        case 'resetCube': {
          cubeStore.resetCube()
          break
        }
        case 'toggleVisibility': {
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'toggleVisibility', null)
          } else {
            cubeStore.toggleVisibility()
          }
          break
        }
        case 'changeTexture': {
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'texture', actionObj.texture)
          } else {
            cubeStore.changeCubeTexture(actionObj.texture)
          }
          break
        }
        case 'createCube': {
          if (!cubeStore.sceneMounted) {
            console.error("La scène n'est pas prête, createCube annulée.")
            reply.value = "Erreur : La scène n'est pas encore prête, createCube annulée."
            return
          }
          const cloneState = cubeStore.duplicateCube()
          cubeStore.addCube(cloneState)
          break
        }
        case 'removeCube': {
          cubeStore.removeCube()
          break
        }
        case 'startAnimation': {
          const payload = { animationType: actionObj.animationType }
          if (actionObj.duration) payload.duration = actionObj.duration
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'startAnimation', payload)
          } else {
            cubeStore.updateCubeFn(1, 'startAnimation', payload)
          }
          break
        }
        case 'stopAnimation': {
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'stopAnimation', null)
          } else {
            cubeStore.updateCubeFn(1, 'stopAnimation', null)
          }
          break
        }
        case 'flipCube': {
          const duration = actionObj.duration || 1
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'flipCube', { duration })
          } else {
            cubeStore.updateCubeFn(1, 'flipCube', { duration })
          }
          break
        }
        case 'launchBall': {
          const speed = actionObj.speed ? parseFloat(actionObj.speed) : 0.1
          const direction = actionObj.direction || 'droite'
          cubeStore.launchBall({ speed, direction })
          break
        }
        case 'glide': {
          const payload = {
            direction: actionObj.direction,
            magnitude: parseFloat(actionObj.magnitude)
          }
          if (actionObj.duration) payload.duration = actionObj.duration
          if (actionObj.speed) payload.speed = actionObj.speed.toLowerCase()
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'glide', payload)
          } else {
            cubeStore.updateCubeFn(1, 'glide', payload)
          }
          break
        }
        case 'rhythmic': {
          const payload = { animationType: 'rhythmic' }
          if (actionObj.duration) payload.duration = actionObj.duration
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'startAnimation', payload)
          } else {
            cubeStore.updateCubeFn(1, 'startAnimation', payload)
          }
          break
        }
        case 'decline': {
          const payload = { duration: actionObj.duration }
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'decline', payload)
          } else {
            cubeStore.updateCubeFn(1, 'decline', payload)
          }
          break
        }
        case 'trail': {
          const payload = { intensity: parseFloat(actionObj.intensity) }
          if (actionObj.duration) payload.duration = actionObj.duration
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'trail', payload)
          } else {
            cubeStore.updateCubeFn(1, 'trail', payload)
          }
          break
        }
        case 'morphing': {
          const modelType = actionObj.model ? actionObj.model : 'sphere'
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'morphing', { model: modelType })
          } else {
            cubeStore.updateCubeFn(1, 'morphing', { model: modelType })
          }
          break
        }
        case 'moveElementCloseToElement': {
          const sourceCubeNumber = actionObj.sourceCube
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'moveElementCloseToElement', { sourceCube: sourceCubeNumber })
          } else {
            cubeStore.updateCubeFn(1, 'moveElementCloseToElement', { sourceCube: sourceCubeNumber })
          }
          break
        }
        default:
          console.warn(`Action inconnue: ${actionObj.action}`)
      }
    })
  } catch (error) {
    console.error('Erreur lors de l’envoi du message :', error)
    reply.value = 'Une erreur est survenue.'
  }
}

// Affichage JSON formaté de la commande interprétée
const formattedReply = computed(() => {
  try {
    return JSON.stringify(
      typeof reply.value === 'string' ? JSON.parse(reply.value) : reply.value,
      null,
      2
    )
  } catch (e) {
    return reply.value
  }
})
</script>

<style scoped>
.chat-container {
  margin: 20px;
  padding: 10px;
  background: #222;
  border-radius: 8px;
  color: #fff;
}

.chat-container h2 {
  margin-top: 0;
  text-align: center;
}

/* Disposition horizontale */
.chat-row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

/* Zone de gauche */
.chat-inputs {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Boutons en ligne */
.chat-actions {
  display: flex;
  gap: 10px;
}

/* Zone de droite */
.reply-panel {
  flex: 1;
  background: #333;
  padding: 10px;
  border-radius: 6px;
  max-width: 300px;
  overflow: auto;
}

textarea {
  width: 100%;
  font-size: 16px;
  resize: vertical;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #666;
  color: #000;
}

button {
  border: none;
  border-radius: 6px;
  padding: 0.6em 1.2em;
  font-size: 1rem;
  font-weight: 500;
  background-color: #4f80ff;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #00c853;
}

button:focus {
  outline: 4px auto -webkit-focus-ring-color;
}

.reply-panel pre {
  white-space: pre-wrap;
  background: #222;
  color: #0f0;
  padding: 6px;
  border-radius: 4px;
}
</style>
