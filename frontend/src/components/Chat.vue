<template>
  <div class="chat-container">
    <h2>Contrôle via commande</h2>
    <textarea v-model="userMessage" placeholder="Parlez votre commande ou tapez-la..." rows="3"></textarea>
    <br />
    <button @click="toggleRecording">
      {{ recording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement" }}
    </button>
    <button @click="sendMessage" style="margin-left: 10px;">Envoyer</button>
    <div v-if="reply" class="reply">
      <h3>Commande interprétée :</h3>
      <pre>{{ formattedReply }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useCubeStore } from '../store/cubeStore'

const userMessage = ref('')
const reply = ref(null)
const recording = ref(false)
const cubeStore = useCubeStore()

const directionVectors = {
  droite: { x: 1, y: 0, z: 0 },
  gauche: { x: -1, y: 0, z: 0 },
  haut: { x: 0, y: 1, z: 0 },
  bas: { x: 0, y: -1, z: 0 }
}

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

async function sendMessage() {
  if (!userMessage.value.trim()) return
  try {
    const response = await axios.post('http://localhost:3000/api/chat', {
      message: userMessage.value
    })
    reply.value = response.data.reply
    userMessage.value = ''
    console.log(reply.value);

    let parsed
    try {
      parsed = typeof reply.value === 'string' ? JSON.parse(reply.value) : reply.value
    } catch (e) {
      console.error('Erreur lors du parsing du JSON:', e)
      return
    }
    const actions = Array.isArray(parsed) ? parsed : [parsed]
    console.log(parsed);

    actions.forEach((actionObj) => {
      const targetCubeNumber = actionObj.cube || 1
      console.log(actionObj.action);
      if (actionObj.action === 'moveDirection') {
        const magnitude = parseFloat(actionObj.magnitude)
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'moveDirection', {
            direction: actionObj.direction,
            magnitude: magnitude
          })
        } else {
          const vec = directionVectors[actionObj.direction]
          if (vec) {
            cubeStore.setTargetPosition({
              x: cubeStore.targetPosition.x + vec.x * magnitude,
              y: cubeStore.targetPosition.y + vec.y * magnitude,
              z: cubeStore.targetPosition.z + vec.z * magnitude
            })
          }
        }
      } else if (actionObj.action === 'moveDepth') {
        const magnitude = parseFloat(actionObj.magnitude)
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'moveDepth', {
            direction: actionObj.direction,
            magnitude: magnitude
          })
        } else {
          const deltaZ = actionObj.direction === 'forward' ? -1 : 1
          cubeStore.setTargetPosition({
            x: cubeStore.targetPosition.x,
            y: cubeStore.targetPosition.y,
            z: cubeStore.targetPosition.z + deltaZ * magnitude
          })
        }
      } else if (actionObj.action === 'changeColor') {
        let newColor
        const key = typeof actionObj.color === 'string' ? actionObj.color.toLowerCase() : ''
        if (colorMapping[key]) {
          newColor = colorMapping[key]
        } else if (typeof actionObj.color === 'string' && /^#?[0-9A-Fa-f]{6}$/.test(actionObj.color)) {
          newColor = parseInt(actionObj.color.replace('#', ''), 16)
        }
        if (newColor !== undefined) {
          if (targetCubeNumber > 1) {
            cubeStore.updateCubeFn(targetCubeNumber, 'color', newColor)
          } else {
            cubeStore.setCubeColor(newColor)
          }
        }
      } else if (actionObj.action === 'rotateCube') {
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'rotation', actionObj.angle)
        } else {
          cubeStore.updateCubeFn(1, 'rotation', actionObj.angle)
        }
      } else if (actionObj.action === 'scaleCube') {
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'scale', actionObj.factor)
        } else {
          cubeStore.setCubeScale(actionObj.factor)
        }
      } else if (actionObj.action === 'resetCube') {
        cubeStore.resetCube()
      } else if (actionObj.action === 'toggleVisibility') {
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'toggleVisibility', null)
        } else {
          cubeStore.toggleVisibility()
        }
      } else if (actionObj.action === 'changeTexture') {
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'texture', actionObj.texture)
        } else {
          cubeStore.changeCubeTexture(actionObj.texture)
        }
      } else if (actionObj.action === 'createCube') {
        if (!cubeStore.sceneMounted) {
          console.error("La scène n'est pas encore prête, createCube annulée.")
          reply.value = "Erreur : La scène n'est pas encore prête, createCube annulée."
          return
        }
        const cloneState = cubeStore.duplicateCube()
        cubeStore.addCube(cloneState)
      } else if (actionObj.action === 'removeCube') {
        cubeStore.removeCube()
      } else if (actionObj.action === 'startAnimation') {
        const payload = { animationType: actionObj.animationType }
        if (actionObj.duration) payload.duration = actionObj.duration
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'startAnimation', payload)
        } else {
          cubeStore.updateCubeFn(1, 'startAnimation', payload)
        }
      } else if (actionObj.action === 'stopAnimation') {
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'stopAnimation', null)
        } else {
          cubeStore.updateCubeFn(1, 'stopAnimation', null)
        }
      } else if (actionObj.action === 'flipCube') {
        const duration = actionObj.duration || 1
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'flipCube', { duration })
        } else {
          cubeStore.updateCubeFn(1, 'flipCube', { duration })
        }
      } else if (actionObj.action === 'launchBall') {
        const speed = actionObj.speed ? parseFloat(actionObj.speed) : 0.1
        const direction = actionObj.direction || 'droite'
        cubeStore.launchBall({ speed, direction })
      } else if (actionObj.action === 'glide') {
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
      } else if (actionObj.action === 'rhythmic') {
        const payload = { animationType: 'rhythmic' }
        if (actionObj.duration) payload.duration = actionObj.duration
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'startAnimation', payload)
        } else {
          cubeStore.updateCubeFn(1, 'startAnimation', payload)
        }
      } else if (actionObj.action === 'decline') {
        const payload = { duration: actionObj.duration }
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'decline', payload)
        } else {
          cubeStore.updateCubeFn(1, 'decline', payload)
        }
      } else if (actionObj.action === 'trail') {
        const payload = { intensity: parseFloat(actionObj.intensity) }
        if (actionObj.duration) payload.duration = actionObj.duration
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'trail', payload)
        } else {
          cubeStore.updateCubeFn(1, 'trail', payload)
        }
      } else if (actionObj.action === 'morphing') {
        const modelType = actionObj.model ? actionObj.model : 'sphere'
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'morphing', { model: modelType })
        } else {
          cubeStore.updateCubeFn(1, 'morphing', { model: modelType })
        }
      } else if (actionObj.action === 'moveElementCloseToElement') {
        const sourceCubeNumber = actionObj.sourceCube
        if (targetCubeNumber > 1) {
          cubeStore.updateCubeFn(targetCubeNumber, 'moveElementCloseToElement', { sourceCube: sourceCubeNumber })
        } else {
          cubeStore.updateCubeFn(1, 'moveElementCloseToElement', { sourceCube: sourceCubeNumber })
        }
      } else {
        console.warn(`Action inconnue: ${actionObj.action}`)
      }
    })
  } catch (error) {
    console.error('Erreur lors de l’envoi du message :', error)
    reply.value = 'Une erreur est survenue.'
  }
}

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
  width: 400px;
  margin: 20px auto;
  text-align: center;
}

textarea {
  width: 100%;
  font-size: 16px;
}

button {
  margin-top: 10px;
  padding: 8px 16px;
  font-size: 16px;
  cursor: pointer;
}

.reply {
  margin-top: 20px;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
  text-align: left;
}
</style>
