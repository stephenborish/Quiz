<script setup lang="ts">
import { ref } from 'vue'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { ShieldCheck, Loader2 } from 'lucide-vue-next'

const isInitializing = ref(false)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref<string | null>(null)
const showMetacognition = ref(false)

const question = {
  text: 'Find the derivative of f(x) = e^(2x) * cos(x).',
  imageUrl: null,
  options: [
    { id: 'a', text: 'e^(2x) (2 cos x - sin x)' },
    { id: 'b', text: 'e^(2x) (cos x - 2 sin x)' },
    { id: 'c', text: '2e^(2x) cos x' },
    { id: 'd', text: '-e^(2x) sin x' },
  ]
}

const handleSelect = (id: string) => {
  selectedAnswer.value = id
  showMetacognition.value = true
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Security Mesh Gradient -->
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05),transparent_50%)]"></div>
    
    <!-- Top Progress Bar -->
    <div class="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
       <div class="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all duration-1000" style="width: 35%;"></div>
    </div>

    <!-- Initialization Screen -->
    <div v-if="isInitializing" class="text-center space-y-8 animate-in fade-in duration-1000">
       <div class="relative w-24 h-24 mx-auto">
          <Loader2 :size="96" class="text-indigo-500 animate-spin opacity-20" />
          <ShieldCheck :size="48" class="text-indigo-500 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2" />
       </div>
       <h2 class="text-2xl font-black text-white tracking-widest uppercase">Securing Session...</h2>
       <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">Veritas High-Performance Environment</p>
    </div>

    <!-- Active Assessment -->
    <div v-else class="max-w-4xl w-full space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700 relative z-10">
       <header class="flex justify-between items-end border-b border-white/5 pb-8">
          <div>
            <h1 class="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] mb-2">Assessment in Progress</h1>
            <p class="text-4xl font-black text-white tracking-tighter uppercase tabular-nums">Question {{ Number(currentQuestionIndex) + 1 }} of 12</p>
          </div>
          <div class="text-right">
             <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Elapsed</p>
             <p class="text-xl font-mono text-white">04:12</p>
          </div>
       </header>

       <section class="space-y-12">
          <!-- Question Content -->
          <div class="text-3xl font-bold text-white leading-tight">
             {{ question.text }}
          </div>

          <!-- Question Image Placeholder if any -->
          <div v-if="question.imageUrl" class="rounded-[2.5rem] overflow-hidden border border-white/10 aspect-video bg-white/5">
             <img :src="question.imageUrl" class="w-full h-full object-contain" />
          </div>

          <!-- Options Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
             <button 
               v-for="(opt, idx) in question.options" 
               :key="opt.id"
               @click="handleSelect(opt.id)"
               class="p-8 rounded-[2rem] border transition-all duration-300 flex items-center gap-6 group relative overflow-hidden text-left"
               :class="[
                 selectedAnswer === opt.id ? 'bg-indigo-600 border-indigo-400 shadow-2xl shadow-indigo-500/40 scale-[1.02]' : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
               ]"
             >
                <div class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-black text-xl transition-all group-hover:bg-white/20">
                   {{ String.fromCharCode(65 + idx) }}
                </div>
                <span class="text-lg font-bold" :class="selectedAnswer === opt.id ? 'text-white' : 'text-slate-300'">{{ opt.text }}</span>
             </button>
          </div>
       </section>

       <footer class="flex justify-center pt-8">
          <p class="text-[9px] font-black text-slate-600 uppercase tracking-[0.5em] flex items-center gap-4">
             <ShieldCheck :size="12" /> Active Proctoring Guard Persistent
          </p>
       </footer>
    </div>

    <!-- Metacognition Overlay -->
    <div v-if="showMetacognition" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-2xl animate-in fade-in duration-300">
       <div class="max-w-md w-full">
          <GlassCard title="Metacognitive Anchor" subtitle="Calibrate your confidence level" class="shadow-[0_0_100px_rgba(99,102,241,0.2)]">
             <div class="space-y-10 mt-6">
                <p class="text-sm font-medium text-slate-300 text-center px-4">How certain are you that your response to the previous prompt is mathematically sound?</p>
                
                <div class="grid grid-cols-3 gap-4">
                   <button v-for="i in 3" :key="i" class="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all flex flex-col items-center gap-4 group">
                      <div class="text-2xl">{{ ['😕', '🤔', '🔥'][i-1] }}</div>
                      <span class="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">{{ ['Low', 'Mid', 'High'][i-1] }} Confidence</span>
                   </button>
                </div>

                <div class="flex flex-col gap-4 mt-8">
                   <PremiumButton @click="showMetacognition = false" class="w-full">Anchor Response & Continue</PremiumButton>
                   <PremiumButton variant="ghost" @click="showMetacognition = false" class="w-full">Revise Selection</PremiumButton>
                </div>
             </div>
          </GlassCard>
       </div>
    </div>
  </div>
</template>
