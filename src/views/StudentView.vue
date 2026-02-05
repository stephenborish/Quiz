<script setup lang="ts">
import { ref, computed } from 'vue'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { ShieldCheck, Loader2, ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import { useStudentStore } from '../store/studentStore'

const studentStore = useStudentStore()
const { state: studentState } = studentStore

const sessionCode = ref('')
const studentName = ref('')
const showMetacognition = ref(false)
const tempSelection = ref<string | null>(null)

const handleJoin = async () => {
    if (!sessionCode.value || !studentName.value) return
    await studentStore.joinSession(sessionCode.value, studentName.value)
}

const selectOption = (optId: string) => {
    tempSelection.value = optId
    showMetacognition.value = true
}

const confirmAnswer = (confidence: number) => {
    if (tempSelection.value && studentStore.activeQuestion.value) {
        studentStore.submitAnswer(studentStore.activeQuestion.value.id, tempSelection.value, confidence)
        showMetacognition.value = false
        tempSelection.value = null
    }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-slate-900">
    
    <!-- IDLE / JOIN SCREEN -->
    <div v-if="studentState.status === 'IDLE' || studentState.status === 'JOINING'" class="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div class="text-center space-y-2">
            <h1 class="text-3xl font-black text-slate-900 tracking-tight">Veritas Live</h1>
            <p class="text-sm font-bold text-slate-400 uppercase tracking-widest">Secure Assessment Environment</p>
        </div>

        <GlassCard>
            <div class="space-y-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Session Code</label>
                    <input 
                        v-model="sessionCode" 
                        type="text" 
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-center text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all uppercase"
                        placeholder="CODE"
                    />
                </div>
                 <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input 
                         v-model="studentName"
                        type="text" 
                        class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                        placeholder="Your Name"
                    />
                </div>
                <PremiumButton 
                    class="w-full py-4 text-lg" 
                    @click="handleJoin"
                    :disabled="!sessionCode || !studentName || studentState.status === 'JOINING'"
                >
                    <Loader2 v-if="studentState.status === 'JOINING'" class="animate-spin mr-2" />
                    {{ studentState.status === 'JOINING' ? 'Connecting...' : 'Join Session' }}
                </PremiumButton>
            </div>
        </GlassCard>
    </div>

    <!-- SUBMITTED SCREEN -->
    <div v-else-if="studentState.status === 'SUBMITTED'" class="text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
         <div class="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 :size="48" />
         </div>
         <h2 class="text-3xl font-black text-slate-900">Assessment Complete</h2>
         <p class="text-slate-500 font-medium">Your responses have been securely recorded.</p>
         <PremiumButton variant="secondary" @click="studentState.status = 'IDLE'">Return Home</PremiumButton>
    </div>

    <!-- ACTIVE QUIZ -->
    <div v-else class="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500 relative z-10 pb-32">
       
       <!-- Header -->
       <header class="flex justify-between items-end border-b border-slate-200 pb-6">
          <div>
            <h1 class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">{{ studentState.quizData?.title }}</h1>
            <p class="text-3xl font-black text-slate-900 tracking-tight uppercase tabular-nums">Question {{ studentState.currentQuestionIndex + 1 }} <span class="text-slate-300 text-xl align-top">/ {{ studentStore.totalQuestions.value }}</span></p>
          </div>
          <div class="text-right">
             <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
             <div class="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-wider">
                 <span class="relative flex h-2 w-2">
                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 Live
             </div>
          </div>
       </header>

       <!-- Content -->
       <section class="space-y-8" v-if="studentStore.activeQuestion.value">
          <div class="text-2xl font-bold text-slate-800 leading-relaxed">
             {{ studentStore.activeQuestion.value.text }}
          </div>

          <div v-if="studentStore.activeQuestion.value.imageUrl" class="rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-white">
             <img :src="studentStore.activeQuestion.value.imageUrl" class="w-full max-h-[400px] object-contain" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <button 
               v-for="(opt, idx) in studentStore.activeQuestion.value.options" 
               :key="opt.id"
               @click="selectOption(opt.id)"
               class="p-6 rounded-2xl border transition-all duration-200 flex items-center gap-4 group text-left hover:border-indigo-300 hover:shadow-md hover:scale-[1.01] bg-white border-slate-200"
             >
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-lg text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                   {{ String.fromCharCode(65 + idx) }}
                </div>
                <span class="text-lg font-bold text-slate-700 group-hover:text-slate-900">{{ opt.text }}</span>
             </button>
          </div>
       </section>
    </div>

    <!-- Metacognition Overlay -->
    <div v-if="showMetacognition" class="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
       <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-white/50 animate-in zoom-in-95 duration-200">
             <div class="text-center mb-8">
                 <h3 class="text-xl font-black text-slate-900 mb-2">Confidence Check</h3>
                 <p class="text-sm font-medium text-slate-500">How certain are you about this answer?</p>
             </div>
             
             <div class="grid grid-cols-3 gap-3 mb-8">
                <button v-for="i in 3" :key="i" @click="confirmAnswer(i)" class="p-4 rounded-xl bg-slate-50 border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center gap-2 group">
                   <div class="text-2xl group-hover:scale-110 transition-transform">{{ ['😕', '🤔', '🔥'][i-1] }}</div>
                   <span class="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600">{{ ['Unsure', 'Likely', 'Certain'][i-1] }}</span>
                </button>
             </div>

             <PremiumButton variant="ghost" @click="showMetacognition = false" class="w-full">Cancel</PremiumButton>
       </div>
    </div>
  </div>
</template>
