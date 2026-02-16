<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from './store'

const store = useStore()

onMounted(async () => {
  await store.initializeAuth()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30">
    <router-view />
  </div>
</template>

<style>
body {
  margin: 0;
  background: #020617;
}
</style>
