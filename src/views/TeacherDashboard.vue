<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PremiumButton from '../components/ui/PremiumButton.vue'
import { LayoutDashboard, BookOpen, Users, LogOut, Settings, ShieldCheck } from 'lucide-vue-next'

const router = useRouter()
const activeTab = ref('dashboard')

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/teacher' },
  { id: 'quizzes', label: 'Curriculum', icon: BookOpen, path: '/teacher/quizzes' },
  { id: 'roster', label: 'Rosters', icon: Users, path: '/teacher/roster' },
  { id: 'faculty', label: 'Faculty', icon: ShieldCheck, path: '/teacher/faculty' },
]

const navigate = (item: any) => {
  activeTab.value = item.id
  router.push(item.path)
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <!-- Sidebar -->
    <aside class="w-72 border-r border-slate-200 bg-white flex flex-col items-stretch">
      <div class="p-8">
        <div class="flex items-center gap-3 mb-10">
          <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
            <span class="text-xl font-black">V</span>
          </div>
          <div>
            <h1 class="text-xl font-black text-slate-900 tracking-tighter uppercase">Veritas</h1>
            <p class="text-[9px] font-black text-indigo-600 tracking-[0.2em] uppercase">Teacher Edition</p>
          </div>
        </div>

        <nav class="space-y-2">
          <button
            v-for="item in navItems"
            :key="item.id"
            @click="navigate(item)"
            class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group"
            :class="[
              activeTab === item.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            ]"
          >
            <component :is="item.icon" :size="20" class="transition-transform group-hover:scale-110" />
            <span class="text-sm font-bold uppercase tracking-widest">{{ item.label }}</span>
          </button>
        </nav>
      </div>

      <div class="mt-auto p-8 border-t border-slate-200 space-y-2">
        <button class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all uppercase tracking-widest font-bold text-[10px]">
          <Settings :size="16" /> Account Security
        </button>
        <button class="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-700 transition-all uppercase tracking-widest font-bold text-[10px]">
          <LogOut :size="16" /> Terminate Session
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto relative custom-scrollbar">
      <!-- Top header -->
      <header class="sticky top-0 z-30 px-12 py-6 bg-white/80 backdrop-blur-md border-b border-slate-200 flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight uppercase">Dashboard Overview</h2>
          <p class="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Real-time synchronization active</p>
        </div>
        <div class="flex items-center gap-6">
          <div class="text-right">
            <p class="text-xs font-black text-slate-900 uppercase tracking-widest">Faculty Member</p>
            <p class="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Authorized Access</p>
          </div>
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 border border-white/20 shadow-xl overflow-hidden shadow-indigo-500/20">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher" alt="Avatar" />
          </div>
        </div>
      </header>

      <div class="p-12 max-w-7xl mx-auto">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
