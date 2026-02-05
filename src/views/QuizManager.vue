import { ref } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { Plus, Book, MoreVertical, LayoutGrid } from 'lucide-vue-next'

const router = useRouter()

const quizzes = ref([
  { id: '1', title: 'Calculus BC - Unit 4 Test', status: 'DRAFT', questions: 12, version: '1.2' },
  { id: '2', title: 'Differential Equations Basics', status: 'LIVE', questions: 8, version: '2.0' },
])

const isCreating = ref(false)

const createQuiz = () => {
    // In a real app, this would call an API/Store
    const newId = Date.now().toString()
    router.push({ name: 'QuizEditor', params: { id: newId } })
}

<template>
  <div class="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight uppercase">Curriculum Inventory</h2>
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Manage and deploy secure assessments</p>
      </div>
      <PremiumButton @click="isCreating = true">
        <Plus :size="18" /> Generate Assessment
      </PremiumButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <GlassCard v-for="quiz in quizzes" :key="quiz.id">
        <div class="flex justify-between items-start mb-8">
          <div class="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-slate-100 group-hover:bg-indigo-50 transition-all">
            <Book :size="24" />
          </div>
          <div class="flex items-center gap-3">
             <span class="text-[9px] font-black px-3 py-1 rounded-full border tracking-widest uppercase"
                :class="quiz.status === 'LIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'">
               {{ quiz.status }}
             </span>
             <button class="text-slate-400 hover:text-slate-900 transition-colors">
               <MoreVertical :size="18" />
             </button>
          </div>
        </div>

        <h3 class="text-xl font-black text-slate-900 mb-2 leading-tight tracking-tight uppercase">{{ quiz.title }}</h3>
        <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Version {{ quiz.version }} • Created by You</p>
        
        <div class="flex items-center justify-between pt-8 border-t border-slate-100">
           <div class="flex items-center gap-4">
             <LayoutGrid :size="14" class="text-slate-500" />
             <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">{{ quiz.questions }} Questions</span>
           </div>
           <PremiumButton size="sm" variant="secondary">Launch Editor</PremiumButton>
        </div>
      </GlassCard>
    </div>

    <!-- Create Modal Placeholder -->
    <div v-if="isCreating" class="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300">
       <div class="max-w-2xl w-full">
         <GlassCard title="Initialize New Assessment" subtitle="Define the scope of your secure quiz">
            <template #header-action>
              <button @click="isCreating = false" class="text-slate-400 hover:text-slate-900 text-2xl">&times;</button>
            </template>
            <div class="space-y-8 mt-4">
               <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Assessment Title</label>
                  <input type="text" class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="e.g. Calculus BC Midterm" />
               </div>
               <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Roster (Optional)</label>
                  <select class="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-900 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none">
                    <option value="">No Roster Assigned</option>
                    <option value="1">Period 1 - AP Calculus</option>
                  </select>
               </div>
               <div class="flex justify-end gap-4 pt-4">
                  <PremiumButton variant="ghost" @click="isCreating = false">Discard</PremiumButton>
                  <PremiumButton @click="createQuiz">Create & Edit</PremiumButton>
               </div>
            </div>
         </GlassCard>
       </div>
    </div>
  </div>
</template>
