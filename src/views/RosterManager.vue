<script setup lang="ts">
import { ref } from 'vue'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { Filter, Search, UserPlus, Download } from 'lucide-vue-next'

const rosters = ref([
  { id: '1', name: 'Period 1 - AP Calculus', students: 28, block: 'Morning' },
  { id: '2', name: 'Period 4 - Statistics', students: 32, block: 'Afternoon' },
])
</script>

<template>
  <div class="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-black text-white tracking-tight uppercase">Directory Governance</h2>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage student enrollment and block synchronization</p>
      </div>
      <div class="flex gap-4">
        <PremiumButton variant="secondary">
          <Download :size="18" /> Legacy CSV Import
        </PremiumButton>
        <PremiumButton>
          <UserPlus :size="18" /> New Roster
        </PremiumButton>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <GlassCard v-for="roster in rosters" :key="roster.id" :title="roster.name" :subtitle="`${roster.students} Verified Students`" noPadding>
        <template #header-action>
           <PremiumButton size="sm" variant="ghost">Edit</PremiumButton>
        </template>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
              <tr>
                <th class="px-8 py-4">Student Identity</th>
                <th class="px-8 py-4">Authentication</th>
                <th class="px-8 py-4">Performance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr v-for="i in 5" :key="i" class="group hover:bg-white/5 transition-colors">
                <td class="px-8 py-6">
                   <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">{{ i }}</div>
                      <span class="text-xs font-black text-white uppercase tracking-tight">Student Name {{ i }}</span>
                   </div>
                </td>
                <td class="px-8 py-6">
                   <span class="text-[10px] font-mono text-slate-400">student{{ i }}@school.edu</span>
                </td>
                <td class="px-8 py-6 text-right">
                   <span class="text-[10px] font-black text-indigo-400 tracking-widest">88.4%</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div class="p-6 text-center border-t border-white/5">
             <button class="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">View All 28 Students</button>
          </div>
        </div>
      </GlassCard>
    </div>
  </div>
</template>
