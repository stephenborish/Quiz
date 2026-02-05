<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useRoute } from 'vue-router' // Import useRoute
import { useQuizStore } from '../store/quizStore'
import { useStore } from '../store/index'

const route = useRoute()
const store = useQuizStore()
const mainStore = useStore()
const { state: quizState } = store

// Initialize
onMounted(async () => {
   await mainStore.initializeAuth()
   if (route.params.id) {
       // If we have an ID, try to load it, otherwise treat as new draft using the ID
       if (route.params.id !== quizState.activeQuiz.id) {
           await store.loadQuiz(route.params.id as string)
           
           // If load failed or returned empty (meaning new), set ID
           if (!quizState.activeQuiz.id) {
               quizState.activeQuiz.id = route.params.id as string
           }
       }
   }
   
   // If no questions, add one
   if (quizState.activeQuiz.questions.length === 0) {
       store.addQuestion()
   }
   
   activeQuestion.value = quizState.activeQuiz.questions[0]
})

const activeQuestionIndex = ref(0)
const activeQuestion = ref<any>({}) // Fix type issue temporarily

// Watch for store changes to update active question reference if needed
watch(() => quizState.activeQuiz.questions, (newVal) => {
    if (newVal.length > 0 && !activeQuestion.value.id) {
        activeQuestion.value = newVal[0]
    }
}, { deep: true })
const isSidebarCollapsed = ref(false)

const addQuestion = () => {
  store.addQuestion()
  activeQuestionIndex.value = quizState.activeQuiz.questions.length - 1
  activeQuestion.value = quizState.activeQuiz.questions[activeQuestionIndex.value]
}

const selectQuestion = (idx: number) => {
  activeQuestionIndex.value = idx
  activeQuestion.value = quizState.activeQuiz.questions[idx]
}

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    activeQuestion.value.imageUrl = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const deleteQuestion = () => {
    if (quizState.activeQuiz.questions.length <= 1) return
    
    // Remove current
    quizState.activeQuiz.questions = quizState.activeQuiz.questions.filter(q => q.id !== activeQuestion.value.id)
    
    // Reset selection
    activeQuestionIndex.value = Math.max(0, activeQuestionIndex.value - 1)
    activeQuestion.value = quizState.activeQuiz.questions[activeQuestionIndex.value]
}

const saveChanges = async () => {
    await store.saveQuiz()
}
</script>

<template>
  <div class="flex h-[calc(100vh-120px)] overflow-hidden bg-slate-50 transition-all duration-500">
    <!-- Collapsible Sidebar -->
    <aside 
      class="flex flex-col border-r border-slate-200 bg-white transition-all duration-300 relative z-20 shadow-sm"
      :class="isSidebarCollapsed ? 'w-20' : 'w-80'"
    >
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 h-16">
            <h3 v-if="!isSidebarCollapsed" class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-in fade-in duration-300">Question Index</h3>
            <button 
                @click="isSidebarCollapsed = !isSidebarCollapsed" 
                class="p-2 -mr-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                :class="isSidebarCollapsed ? 'mx-auto mr-0' : ''"
            >
                <PanelLeftOpen v-if="isSidebarCollapsed" :size="20" />
                <PanelLeftClose v-else :size="20" />
            </button>
        </div>

        <!-- Question List -->
        <div class="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
             <div 
               v-for="(q, idx) in quizState.activeQuiz.questions" 
               :key="q.id"
               @click="selectQuestion(idx)"
               class="rounded-xl cursor-pointer transition-all duration-200 group relative border"
               :class="[
                   activeQuestionIndex === idx 
                   ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                   : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-md',
                   isSidebarCollapsed ? 'p-2 flex justify-center aspect-square items-center' : 'p-4 flex gap-3'
               ]"
             >
                <!-- Number Badge -->
                <div 
                    class="rounded-lg flex items-center justify-center font-black text-[10px] transition-colors shrink-0"
                    :class="[
                        activeQuestionIndex === idx ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500',
                        isSidebarCollapsed ? 'w-8 h-8 text-sm' : 'w-6 h-6'
                    ]"
                >
                    {{ idx + 1 }}
                </div>

                <!-- Content Preview (Hidden when collapsed) -->
                <div v-if="!isSidebarCollapsed" class="flex-1 min-w-0">
                    <p class="text-xs font-bold text-slate-700 truncate leading-tight">{{ q.text || 'Empty Question' }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                       <span v-if="q.imageUrl" class="text-[9px] font-black text-indigo-500 uppercase tracking-wider flex items-center gap-1">
                          <ImageIcon :size="10" /> IMG
                       </span>
                       <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{{ q.options.length }} Options</span>
                    </div>
                </div>
             </div>

             <!-- Add Button -->
             <button 
                @click="addQuestion"
                class="w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-400 hover:text-indigo-600 transition-all duration-200 flex items-center justify-center group"
                :class="isSidebarCollapsed ? 'aspect-square' : 'py-4'"
             >
                <Plus :size="20" class="group-hover:scale-110 transition-transform" />
                <span v-if="!isSidebarCollapsed" class="ml-2 text-xs font-black uppercase tracking-widest">Add New</span>
             </button>
        </div>
        
        <!-- Sidebar Footer -->
        <div class="p-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
             <PremiumButton v-if="!isSidebarCollapsed" variant="secondary" class="w-full" @click="saveChanges">
                <Save :size="16" /> Commit
             </PremiumButton>
             <button v-else @click="saveChanges" class="w-full aspect-square flex items-center justify-center rounded-xl bg-white border border-slate-200 hover:border-indigo-500 text-slate-500 shadow-sm transition-all pb-1">
                <Save :size="20" />
             </button>
        </div>
    </aside>

    <!-- Main Content Area - Document Style -->
    <main class="flex-1 overflow-y-auto bg-slate-50 relative">
        <div class="max-w-4xl mx-auto p-8 pb-32 space-y-8 animate-in slide-in-from-bottom-4 duration-500 delay-150">
            
            <!-- Editor Toolbar -->
            <div class="flex items-center justify-between sticky top-0 z-30 bg-slate-50/95 backdrop-blur-sm py-4 mb-8">
                <div class="flex items-center gap-4">
                    <PremiumButton variant="ghost" size="sm" @click="$router.push('/teacher/quizzes')">
                        <ChevronLeft :size="18" /> Back
                    </PremiumButton>
                    <div>
                        <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                           <span class="text-slate-300">#</span>{{ activeQuestionIndex + 1 }}
                           <span class="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                           <span class="text-slate-400 font-bold text-lg">Question Editor</span>
                        </h2>
                    </div>
                </div>
                <PremiumButton variant="danger" size="sm" @click="deleteQuestion" :disabled="quizState.activeQuiz.questions.length <= 1">
                     <Trash2 :size="16" /> <span class="hidden sm:inline ml-2">Delete</span>
                </PremiumButton>
            </div>

            <!-- 1. Question Stimulus -->
            <section class="space-y-4">
                 <div class="flex items-center justify-between">
                    <label class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <span class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-700">1</span>
                        Question Stimulus
                    </label>
                 </div>
                 <div class="p-1 rounded-[2rem] bg-gradient-to-br from-white to-slate-50 shadow-sm border border-slate-200 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-300">
                    <textarea 
                        v-model="activeQuestion.text" 
                        class="w-full bg-transparent border-0 rounded-[1.8rem] p-8 text-xl font-medium text-slate-900 placeholder:text-slate-300 focus:ring-0 min-h-[200px] resize-y leading-relaxed"
                        placeholder="Type your question here..."
                    ></textarea>
                 </div>
            </section>

            <!-- 2. Visual Asset (Full Width Banner) -->
            <section class="space-y-4">
                 <label class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-700">2</span>
                    Visual Context <span class="text-[9px] text-slate-400 font-normal normal-case tracking-normal ml-auto">(Optional)</span>
                 </label>
                 
                 <div 
                    @click="$refs.fileInput.click()"
                    class="relative group cursor-pointer transition-all duration-300"
                 > 
                    <input type="file" ref="fileInput" class="hidden" @change="handleImageUpload" accept="image/*" />
                    
                    <div 
                        v-if="!activeQuestion.imageUrl"
                        class="h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/5 flex items-center justify-center gap-4 transition-all"
                    >
                         <div class="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                             <ImageIcon :size="24" />
                         </div>
                         <div class="text-left">
                             <p class="text-sm font-bold text-slate-700">Click to upload visual</p>
                             <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Supports JPG, PNG, WEBP</p>
                         </div>
                    </div>

                    <div v-else class="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 group-hover:shadow-xl transition-all">
                        <img :src="activeQuestion.imageUrl" class="w-full max-h-[500px] object-contain bg-slate-100" />
                        <div class="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <p class="text-white font-bold p-4 rounded-xl bg-black/50 backdrop-blur-md">Click to replace</p>
                        </div>
                        <button 
                            @click.stop="activeQuestion.imageUrl = null"
                            class="absolute top-4 right-4 p-2 rounded-full bg-white text-rose-500 shadow-md hover:scale-110 transition-transform"
                        >
                            <Trash2 :size="18" />
                        </button>
                    </div>
                 </div>
            </section>

            <!-- 3. Answer Options -->
            <section class="space-y-6">
                 <label class="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <span class="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-slate-700">3</span>
                    Answer Choices
                 </label>

                 <div class="grid grid-cols-1 gap-4">
                     <div 
                        v-for="(opt, idx) in activeQuestion.options" 
                        :key="opt.id" 
                        class="flex gap-4 p-2 pr-4 rounded-2xl bg-white border transition-all duration-300 group focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500"
                        :class="opt.isCorrect ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20' : 'border-slate-200 shadow-sm'"
                     >
                        <button 
                            @click="activeQuestion.options.forEach((o: any) => o.isCorrect = false); opt.isCorrect = true"
                            class="w-14 shrink-0 rounded-xl flex items-center justify-center transition-all bg-slate-50 border border-slate-200 group-hover:border-slate-300"
                            :class="opt.isCorrect ? '!bg-emerald-500 !border-emerald-500 text-white' : 'text-slate-300 hover:text-slate-400'"
                        >
                            <span class="text-xl font-black">{{ String.fromCharCode(65 + idx) }}</span>
                        </button>

                        <div class="flex-1 py-1">
                             <input 
                                v-model="opt.text"
                                type="text"
                                class="w-full h-full bg-transparent border-0 p-0 text-lg font-medium text-slate-900 placeholder:text-slate-300 focus:ring-0"
                                :placeholder="`Option ${String.fromCharCode(65 + idx)} text...`"
                             />
                        </div>
                        
                        <div class="self-center">
                             <CheckCircle2 v-if="opt.isCorrect" :size="24" class="text-emerald-500" />
                        </div>
                     </div>
                 </div>
            </section>
        </div>
    </main>
  </div>
</template>
