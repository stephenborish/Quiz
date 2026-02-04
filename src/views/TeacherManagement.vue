<script setup lang="ts">
import { ref } from 'vue'
import GlassCard from '../components/ui/GlassCard.vue'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { ShieldCheck, UserPlus, Trash2, Mail } from 'lucide-vue-next'

const teachers = ref([
  { email: 'admin@school.edu', role: 'ADMIN', addedAt: '2024-01-10' },
  { email: 'teacher1@school.edu', role: 'TEACHER', addedAt: '2024-02-01' },
])

const newEmail = ref('')
const isAdding = ref(false)

const addTeacher = () => {
  if (!newEmail.value) return
  teachers.value.push({
    email: newEmail.value,
    role: 'TEACHER',
    addedAt: new Date().toISOString().split('T')[0]
  })
  newEmail.value = ''
  isAdding.value = false
}
</script>

<template>
  <div class="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div class="flex justify-between items-end">
      <div>
        <h2 class="text-3xl font-black text-white tracking-tight uppercase">Faculty Governance</h2>
        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Manage system-level educator authorizations</p>
      </div>
      <PremiumButton @click="isAdding = true">
        <UserPlus :size="18" /> Authorize Educator
      </PremiumButton>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <GlassCard title="Authorized Faculty" subtitle="Authenticated educator directory" noPadding>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead class="bg-white/5 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                <tr>
                  <th class="px-8 py-4">Educator Identity</th>
                  <th class="px-8 py-4">Security Role</th>
                  <th class="px-8 py-4">Authorized On</th>
                  <th class="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="t in teachers" :key="t.email" class="group hover:bg-white/5 transition-colors">
                  <td class="px-8 py-6">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                        <Mail :size="14" />
                      </div>
                      <span class="text-xs font-black text-white uppercase tracking-tight">{{ t.email }}</span>
                    </div>
                  </td>
                  <td class="px-8 py-6">
                    <span class="text-[9px] font-black px-2 py-1 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 tracking-tighter uppercase">{{ t.role }}</span>
                  </td>
                  <td class="px-8 py-6">
                    <span class="text-[10px] font-mono text-slate-400">{{ t.addedAt }}</span>
                  </td>
                  <td class="px-8 py-6 text-right">
                    <button class="w-8 h-8 rounded-lg text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 :size="14" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      <div class="space-y-8">
        <GlassCard title="Security Protocol" subtitle="RBAC Manifest">
           <div class="space-y-6 text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
             <div class="flex gap-4">
                <ShieldCheck :size="16" class="text-indigo-500 shrink-0" />
                <p>Only authorized faculty can initiate live proctoring sessions or review student metacognition metrics.</p>
             </div>
             <div class="flex gap-4">
                <ShieldCheck :size="16" class="text-indigo-500 shrink-0" />
                <p>New authorizations are logged to the global audit trail with sub-second timestamps.</p>
             </div>
           </div>
        </GlassCard>
      </div>
    </div>

    <!-- Add Modal -->
    <div v-if="isAdding" class="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
       <div class="max-w-md w-full">
         <GlassCard title="Authorize Educator" subtitle="Grant administrative curriculum access">
            <template #header-action>
              <button @click="isAdding = false" class="text-slate-400 hover:text-white text-2xl">&times;</button>
            </template>
            <div class="space-y-8 mt-4">
               <div>
                  <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Professional Email Address</label>
                  <input v-model="newEmail" type="email" class="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" placeholder="educator@school.edu" />
               </div>
               <div class="flex justify-end gap-4 pt-4">
                  <PremiumButton variant="ghost" @click="isAdding = false">Cancel</PremiumButton>
                  <PremiumButton @click="addTeacher">Grant Access</PremiumButton>
               </div>
            </div>
         </GlassCard>
       </div>
    </div>
  </div>
</template>
