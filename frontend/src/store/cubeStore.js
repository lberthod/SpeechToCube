import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'

export const useCubeStore = defineStore('cubeStore', () => {
  const targetPosition = reactive({ x: 0, y: 0, z: 0 })
  const cubeColor = ref(0x00ff00)
  const cubeRotationY = ref(0)
  const cubeScale = ref(1)
  const cubeVisible = ref(true)
  const cubeTexture = ref(null)
  const cubeRemoved = ref(false)
  const cubeAnimation = ref(null)
  const cubeFlip = ref(null)

  let addCubeFn = null
  function setAddCube(fn) {
    addCubeFn = fn
  }
  function addCube(cloneState) {
    if (typeof addCubeFn === 'function') {
      addCubeFn(cloneState)
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
    setLaunchBall
  }
})
