<template>
  <div id="app">
    <header>
      <h1>ThreeApp - Gestion Interactive de Cubes</h1>
    </header>
    <main class="content">
      <section class="three-scene">
        <ThreeScene />
      </section>
      <section class="bottom-panel">
        <div class="left-column">
          <Chat />
        </div>
        <div class="right-column">
          <ManagementElement />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import ThreeScene from './components/ThreeScene.vue'
import Chat from './components/Chat.vue'
import ManagementElement from './components/ManagementElement.vue'
</script>

<!-- Ici, nous laissons le style spécifique à ce composant vide car la majorité des réglages globaux se trouve dans style.css -->
<style scoped>
/* Aucun style additionnel ici */
</style>
