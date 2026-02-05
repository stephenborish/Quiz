<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { Play, Users, Clock, AlertTriangle } from 'lucide-vue-next'
import { useProctoringStore } from '../store/proctoringStore'

const router = useRouter()
const proctoringStore = useProctoringStore()
const { state: proctoringState } = proctoringStore

// Mock monitoring for demo purposes if no active quiz
// In production, this would be triggered by a "live" quiz context
onMounted(() => {
    // proctoringStore.startMonitoring('demo-quiz-id')
})

onUnmounted(() => {
    proctoringStore.stopMonitoring()
})

const stats = computed(() => [
  { label: 'Active Sessions', value: proctoringState.activeSessions.length.toString(), icon: Play, color: 'text-emerald-500' },
  { label: 'Total Students', value: '124', icon: Users, color: 'text-indigo-500' },
  { label: 'Avg. Latency', value: '142ms', icon: Clock, color: 'text-blue-500' },
  { label: 'Integrity Alerts', value: proctoringState.activeSessions.filter(s => s.integrityAlerts > 0).length.toString(), icon: AlertTriangle, color: 'text-red-500' },
])
</script>

<template>
  <div class="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <GlassCard v-for="stat in stats" :key="stat.label">
        <div class="flex items-center gap-6">
          <div class="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm" :class="stat.color">
            <component :is="stat.icon" :size="24" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">{{ stat.label }}</p>
            <p class="text-3xl font-black text-slate-900 tracking-tight">{{ stat.value }}</p>
          </div>
        </div>
      </GlassCard>
    </div>

    <!-- Active Sessions Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <GlassCard title="Live Proctoring Grid" subtitle="Real-time student activity monitor">
          <template #header-action>
            <PremiumButton size="sm" variant="secondary">Global Control</PremiumButton>
          </template>
          
          <div v-if="proctoringState.activeSessions.length === 0" class="p-12 text-center">
             <p class="text-sm font-bold text-slate-400">No active sessions detected.</p>
             <PremiumButton variant="ghost" size="sm" class="mt-4" @click="router.push('/teacher/quizzes')">Launch a Quiz</PremiumButton>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            <!-- Student Tiles -->
            <div v-for="student in proctoringState.activeSessions" :key="student.id" class="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-500/30 transition-all group relative overflow-hidden shadow-sm">
               <div class="absolute top-0 left-0 w-full h-1" :class="student.integrityAlerts > 0 ? 'bg-red-500' : 'bg-emerald-500/50'"></div>
               <div class="flex justify-between items-start mb-4">
                  <div class="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                    <img :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`" alt="Avatar" />
                  </div>
                  <span 
                    class="text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter"
                    :class="student.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'"
                  >
                    {{ student.status }}
                  </span>
               </div>
               <p class="text-[10px] font-black text-slate-900 truncate uppercase tracking-widest">{{ student.name || student.email }}</p>
               <div class="flex items-center justify-between mt-4">
                 <div class="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div class="bg-indigo-500 h-full" :style="{ width: student.progress + '%' }"></div>
                 </div>
                 <span class="text-[8px] font-bold text-slate-500 ml-2">Q{{ student.currentQuestion }}</span>
               </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div class="space-y-8">
        <GlassCard title="Security Events" subtitle="Sub-second integrity logs">
           <div class="space-y-4">
             <div v-for="i in 3" :key="i" class="flex gap-4 p-4 rounded-2xl bg-red-50 border border-red-100">
                <AlertTriangle :size="16" class="text-red-500 shrink-0" />
                <div>
                   <p class="text-[10px] font-black text-slate-900 uppercase tracking-tight">Focus Lost (Tab-Switch)</p>
                   <p class="text-[9px] font-bold text-red-600 mt-1 uppercase tracking-widest">Student {{ i + 2 }} • Blocked 2m ago</p>
                </div>
             </div>
           </div>
        </GlassCard>

        <GlassCard title="Quick Actions">
           <div class="grid grid-cols-2 gap-4">
             <PremiumButton size="sm" class="flex-1" @click="router.push('/teacher/quizzes')">Deploy New Quiz</PremiumButton>
             <PremiumButton size="sm" variant="secondary" class="flex-1" @click="router.push('/teacher/roster')">Sync Rosters</PremiumButton>
             <PremiumButton size="sm" variant="ghost" class="col-span-2">System Audit Report</PremiumButton>
           </div>
        </GlassCard>
      </div>
    </div>
  </div>
</template>
