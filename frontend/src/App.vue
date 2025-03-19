<template>
  <div id="app">
    <h1>ThreeApp: Contrôle de Cubes 3D</h1>
    <Chat />
    <ThreeScene />
  </div>
</template>

<script setup>
import Chat from './components/Chat.vue'
import ThreeScene from './components/ThreeScene.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  margin-top: 20px;
}
</style>
