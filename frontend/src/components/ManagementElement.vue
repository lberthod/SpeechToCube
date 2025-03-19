<template>
    <div class="management-container">
      <h2>Gestion des éléments 3D</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Position (x, y, z)</th>
            <th>Couleur</th>
            <th>Animation</th>
            <th>Texture</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(el, index) in elements" :key="el.id || index">
            <td>{{ el.id || index + 1 }}</td>
            <td>{{ el.type || 'Cube' }}</td>
            <td>
              {{ el.position.x.toFixed(2) }}, 
              {{ el.position.y.toFixed(2) }}, 
              {{ el.position.z.toFixed(2) }}
            </td>
            <td>
              <span :style="{ color: '#' + (el.color ? el.color.toString(16).padStart(6, '0') : '000000') }">
                #{{ el.color ? el.color.toString(16).padStart(6, '0') : '000000' }}
              </span>
            </td>
            <td>{{ el.animation || 'Aucune' }}</td>
            <td>{{ el.texture || 'None' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { useCubeStore } from '../store/cubeStore'
  
  const cubeStore = useCubeStore()
  const elements = computed(() => cubeStore.elements || [])
  </script>
  
  <style scoped>
  .management-container {
    margin: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    padding: 8px;
    border: 1px solid #ccc;
    text-align: left;
  }
  </style>
  