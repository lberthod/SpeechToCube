<template>
  <div id="app">
    <h1>ThreeApp - Gestion Interactive de Cubes</h1>
    <div class="container">
      <!-- La scène Three.js -->
      <ThreeScene ref="threeSceneRef" />
      <!-- Une sidebar regroupant le Chat et la gestion des éléments -->
      <div class="sidebar">
        <Chat />
        <ManagementElement />
      </div>
    </div>
  </div>
</template>

<script setup>
import ThreeScene from './components/ThreeScene.vue'
import Chat from './components/Chat.vue'
import ManagementElement from './components/ManagementElement.vue'
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
}
.container {
  display: flex;
  flex-wrap: wrap;
}
.sidebar {
  margin-left: 20px;
  width: 400px;
}
</style>
