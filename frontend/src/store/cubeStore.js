import { defineStore } from 'pinia'
import { reactive, ref, watch } from 'vue'
import { generateUniqueId } from '../utils'  // ajustez le chemin selon votre organisation

export const useCubeStore = defineStore('cubeStore', () => {
  // État du cube principal
  const targetPosition = reactive({ x: 0, y: 0, z: 0 })
  const cubeColor = ref(0x00ff00)
  const cubeRotationY = ref(0)
  const cubeScale = ref(1)
  const cubeVisible = ref(true)
  const cubeTexture = ref(null)
  const cubeRemoved = ref(false)
  const cubeAnimation = ref(null)
  const cubeFlip = ref(null)

  // Liste des éléments de la scène
  const elements = ref([])

  // Chargement de l'état depuis localStorage s'il existe
  const savedState = localStorage.getItem('cubeState')
  if (savedState) {
    try {
      const state = JSON.parse(savedState)
      targetPosition.x = state.targetPosition?.x ?? 0
      targetPosition.y = state.targetPosition?.y ?? 0
      targetPosition.z = state.targetPosition?.z ?? 0
      cubeColor.value = state.cubeColor ?? 0x00ff00
      cubeRotationY.value = state.cubeRotationY ?? 0
      cubeScale.value = state.cubeScale ?? 1
      cubeVisible.value = state.cubeVisible !== undefined ? state.cubeVisible : true
      cubeTexture.value = state.cubeTexture ?? null
    } catch (err) {
      console.error("Erreur lors du chargement de l'état:", err)
    }
  }

  // Sauvegarde dans localStorage
  function saveState() {
    const state = {
      targetPosition: { ...targetPosition },
      cubeColor: cubeColor.value,
      cubeRotationY: cubeRotationY.value,
      cubeScale: cubeScale.value,
      cubeVisible: cubeVisible.value,
      cubeTexture: cubeTexture.value,
    }
    localStorage.setItem('cubeState', JSON.stringify(state))
  }
  watch(targetPosition, saveState, { deep: true })
  watch(cubeColor, saveState)
  watch(cubeRotationY, saveState)
  watch(cubeScale, saveState)
  watch(cubeVisible, saveState)
  watch(cubeTexture, saveState)

  // Fonctions de gestion des éléments
  function addElement(elementData) {
    // Si un id est déjà présent, on ne le modifie pas
    console.log("ide" + elementData.id);
    if (!elementData.id) {
      return; // Par défaut, le préfixe sera "id_"
    }
    elements.value.push(elementData)
  }
  function updateElement(id, newData) {
    const index = elements.value.findIndex(el => el.id === id)
    if (index !== -1) {
      elements.value[index] = { ...elements.value[index], ...newData }
    }
  }
  function removeElement(id) {
    const index = elements.value.findIndex(el => el.id === id)
    if (index !== -1) {
      elements.value.splice(index, 1)
    }
  }

  // Fonctions d'interfaçage avec la scène
  let addCubeFn = null
  function setAddCube(fn) {
    addCubeFn = fn
  }
  function addCube(cloneState) {
    if (typeof addCubeFn === 'function') {
      addCubeFn(cloneState)
      addElement({
        type: 'cube',
        position: { ...cloneState.targetPosition },
        color: cloneState.cubeColor || cubeColor.value,
        rotation: cloneState.cubeRotationY,
        scale: cloneState.cubeScale,
        visible: true,
        texture: cloneState.cubeTexture || cubeTexture.value,
        animation: null
      })
    } else {
      console.error("La fonction addCube n'est pas encore définie dans le store.")
    }
  }

  let launchBallFn = null
  function setLaunchBall(fn) {
    launchBallFn = fn
  }
  function launchBall(params) {
    if (typeof launchBallFn === 'function') {
      launchBallFn(params)
      addElement({
        type: 'ball',
        position: { x: 0, y: 0, z: 0 },
        color: 0xff0000,
        animation: null
      })
    } else {
      console.error("La fonction launchBall n'est pas encore définie dans le store.")
    }
  }

  const sceneMounted = ref(false)
  function setSceneMounted(value) {
    sceneMounted.value = value
  }

  const updateCubeFn = ref(null)
  function setUpdateCube(fn) {
    updateCubeFn.value = fn
  }

  // Fonctions de manipulation du cube principal
  function setTargetPosition(newPos) {
    targetPosition.x = newPos.x
    targetPosition.y = newPos.y
    targetPosition.z = newPos.z
  }
  function setCubeColor(newColor) {
    cubeColor.value = newColor
  }
  function rotateCube(angleInDegrees) {
    cubeRotationY.value += angleInDegrees * (Math.PI / 180)
  }
  function setCubeScale(factor) {
    cubeScale.value = factor
  }
  function toggleVisibility() {
    cubeVisible.value = !cubeVisible.value
  }
  function changeCubeTexture(textureName) {
    cubeTexture.value = textureName
  }
  function duplicateCube() {
    return {
      targetPosition: { ...targetPosition },
      cubeColor: cubeColor.value,
      cubeRotationY: cubeRotationY.value,
      cubeScale: cubeScale.value,
      cubeVisible: cubeVisible.value,
      cubeTexture: cubeTexture.value
    }
  }
  function removeCube() {
    cubeRemoved.value = true
  }
  function startAnimation(animationType) {
    cubeAnimation.value = animationType
  }
  function stopAnimation() {
    cubeAnimation.value = null
  }
  function resetCube() {
    targetPosition.x = 0
    targetPosition.y = 0
    targetPosition.z = 0
    cubeColor.value = 0x00ff00
    cubeRotationY.value = 0
    cubeScale.value = 1
    cubeVisible.value = true
    cubeTexture.value = null
    cubeRemoved.value = false
    cubeAnimation.value = null
    cubeFlip.value = null
  }
  function flipCube(duration = 1) {
    console.log("Exécution du flip")
    cubeFlip.value = {
      startTime: performance.now(),
      duration: duration * 1000,
      startRotation: 0,
      targetRotation: Math.PI
    }
  }

  return {
    targetPosition,
    setTargetPosition,
    cubeColor,
    setCubeColor,
    cubeRotationY,
    rotateCube,
    cubeScale,
    setCubeScale,
    cubeVisible,
    toggleVisibility,
    cubeTexture,
    changeCubeTexture,
    duplicateCube,
    cubeRemoved,
    removeCube,
    cubeAnimation,
    startAnimation,
    stopAnimation,
    resetCube,
    cubeFlip,
    flipCube,
    addCube,
    setAddCube,
    sceneMounted,
    setSceneMounted,
    updateCubeFn,
    setUpdateCube,
    launchBall,
    setLaunchBall,
    elements,
    addElement,
    updateElement,
    removeElement
  }
})
