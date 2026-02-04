<script setup lang="ts">
import { ref } from 'vue'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { Image as ImageIcon, Plus, Trash2, CheckCircle2, ChevronLeft, Save } from 'lucide-vue-next'

const questions = ref([
  {
    id: 'q1',
    text: 'What is the limit of (sin x)/x as x approaches 0?',
    imageUrl: null,
    options: [
      { id: 'a', text: '0', isCorrect: false },
      { id: 'b', text: '1', isCorrect: true },
      { id: 'c', text: 'Infinity', isCorrect: false },
      { id: 'd', text: 'Undefined', isCorrect: false },
    ]
  }
])

const activeQuestionIndex = ref(0)
const activeQuestion = ref(questions.value[0])

const addQuestion = () => {
  const newQ = {
    id: Date.now().toString(),
    text: '',
    imageUrl: null,
    options: [
      { id: 'a', text: '', isCorrect: true },
      { id: 'b', text: '', isCorrect: false },
      { id: 'c', text: '', isCorrect: false },
      { id: 'd', text: '', isCorrect: false },
    ]
  }
  questions.value.push(newQ)
  activeQuestionIndex.value = questions.value.length - 1
  activeQuestion.value = newQ
}

const selectQuestion = (idx: number) => {
  activeQuestionIndex.value = idx
  activeQuestion.value = questions.value[idx]
}

const handleImageUpload = (e: Event) => {
  // Placeholder for real upload logic
  console.log('Image upload triggered')
}
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] gap-8 animate-in fade-in zoom-in-95 duration-500">
    <!-- Question Sidebar -->
    <aside class="w-80 flex flex-col gap-4">
      <PremiumButton @click="addQuestion" class="w-full">
        <Plus :size="18" /> Append Element
      </PremiumButton>
      
      <div class="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <div 
          v-for="(q, idx) in questions" 
          :key="q.id"
          @click="selectQuestion(idx)"
          class="p-4 rounded-2xl cursor-pointer transition-all duration-300 border flex gap-4 group"
          :class="[
            activeQuestionIndex === idx ? 'bg-indigo-600/10 border-indigo-500/30 shadow-lg shadow-indigo-500/5' : 'bg-white/5 border-white/5 hover:border-white/10'
          ]"
        >
          <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black" :class="activeQuestionIndex === idx ? 'text-indigo-400' : 'text-slate-500'">
            {{ idx + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-black text-white truncate uppercase tracking-widest">{{ q.text || 'Empty Element' }}</p>
            <p class="text-[8px] font-bold text-slate-500 uppercase tracking-tighter mt-1">{{ q.imageUrl ? '🖼️ Visual Attached' : 'Standard Text' }}</p>
          </div>
        </div>
      </div>

      <div class="pt-4 border-t border-white/5">
        <PremiumButton variant="secondary" class="w-full">
           <Save :size="16" /> Commit Changes
        </PremiumButton>
      </div>
    </aside>

    <!-- Editor Main -->
    <main class="flex-1">
      <GlassCard class="h-full flex flex-col" noPadding>
        <template #header>
           <div class="flex items-center gap-4">
              <PremiumButton variant="ghost" size="sm">
                <ChevronLeft :size="16" />
              </PremiumButton>
              <h3 class="text-xs font-black text-white uppercase tracking-[0.2em]">Editing Element {{ Number(activeQuestionIndex) + 1 }}</h3>
           </div>
        </template>
        <template #header-action>
           <PremiumButton variant="danger" size="sm">
             <Trash2 :size="14" />
           </PremiumButton>
        </template>

        <div class="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
           <!-- Content Area -->
           <section class="space-y-6">
              <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Question Narrative</label>
              <textarea 
                v-model="activeQuestion.text"
                class="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-white text-xl font-bold focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all min-h-[150px]"
                placeholder="Enter the core prompt here..."
              ></textarea>
           </section>

           <section class="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <!-- Visual Assets -->
              <div class="space-y-6">
                 <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Asset Integration</label>
                 <div 
                   @click="$refs.fileInput.click()"
                   class="aspect-video rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group overflow-hidden relative"
                 >
                    <input type="file" ref="fileInput" class="hidden" @change="handleImageUpload" accept="image/*" />
                    <template v-if="!activeQuestion.imageUrl">
                      <ImageIcon :size="48" class="text-slate-700 group-hover:text-indigo-500 mb-4 transition-colors" />
                      <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Drop Image or Click to Browse</p>
                    </template>
                    <img v-else :src="activeQuestion.imageUrl" class="w-full h-full object-cover" />
                 </div>
              </div>

              <!-- Options Logic -->
              <div class="space-y-6">
                 <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Response Architecture</label>
                 <div class="space-y-4">
                    <div v-for="(opt, idx) in activeQuestion.options" :key="opt.id" class="flex items-center gap-4">
                       <button 
                         @click="activeQuestion.options.forEach((o: any) => o.isCorrect = false); opt.isCorrect = true"
                         class="w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0"
                         :class="opt.isCorrect ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-600 border border-white/10 hover:border-white/20'"
                       >
                         <CheckCircle2 :size="20" />
                       </button>
                       <div class="flex-1 relative group">
                          <input 
                            v-model="opt.text"
                            type="text" 
                            class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            :placeholder="`Enter option ${String.fromCharCode(65 + idx)}...`"
                          />
                          <div class="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 text-[10px] font-black uppercase tracking-tighter">{{ String.fromCharCode(64 + Number(idx) + 1) }}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </GlassCard>
    </main>
  </div>
</template>
