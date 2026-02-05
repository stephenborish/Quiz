<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
});
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="relative inline-flex items-center justify-center font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none overflow-hidden group"
    :class="[
      size === 'sm' ? 'px-4 py-2 text-[10px] rounded-xl' : '',
      size === 'md' ? 'px-6 py-3 text-xs rounded-2xl' : '',
      size === 'lg' ? 'px-10 py-4 text-sm rounded-[1.5rem]' : '',
      variant === 'primary' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 hover:shadow-indigo-500/30' : '',
      variant === 'secondary' ? 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm' : '',
      variant === 'danger' ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : '',
      variant === 'ghost' ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100' : '',
    ]"
  >
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-inherit">
      <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
    </div>
    <span :class="{ 'opacity-0': loading }" class="relative z-10 flex items-center gap-2">
      <slot />
    </span>
  </button>
</template>
