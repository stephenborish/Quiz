<script setup lang="ts">
defineProps<{
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}>();
</script>

<template>
  <div class="glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10 hover:border-white/20">
    <div v-if="title || $slots.header" class="px-8 py-6 border-b border-white/5 bg-white/5 backdrop-blur-md flex justify-between items-center">
      <div>
        <h3 v-if="title" class="text-xl font-black text-white tracking-tight uppercase">{{ title }}</h3>
        <p v-if="subtitle" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{{ subtitle }}</p>
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
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.1);
}
</style>
