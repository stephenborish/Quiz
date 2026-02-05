<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}>();
</script>

<template>
  <div class="glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-100 bg-white">
    <div v-if="title || $slots.header" class="px-8 py-6 border-b border-slate-100 bg-white/50 backdrop-blur-md flex justify-between items-center">
      <div>
        <h3 v-if="title" class="text-xl font-black text-slate-900 tracking-tight uppercase">{{ title }}</h3>
        <p v-if="subtitle" class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{{ subtitle }}</p>
      </div>
      <slot name="header-action" />
    </div>
    <div :class="[noPadding ? '' : 'p-8']">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.8); /* slate-200 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}
</style>
