<template>
  <div class="space-y-6 pb-8">
    <!-- En-tête avec Filtre Global -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-[#2C3E3A]">Tableau de Bord</h1>
        <p class="text-muted-foreground mt-1">
          Vue d'ensemble de Nuur GYM — {{ currentDate }}
        </p>
      </div>
      
      <!-- Filtres de période -->
      <div class="bg-white/50 backdrop-blur-sm border rounded-2xl p-1 flex items-center shadow-sm self-start md:self-auto">
        <button 
          v-for="p in periods" 
          :key="p.id"
          @click="changePeriod(p.id)"
          class="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
          :class="selectedPeriod === p.id 
            ? 'bg-[#3E524D] text-white shadow-md' 
            : 'text-slate-500 hover:bg-slate-100'"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Cartes de statistiques - Rangée 1: Vision Globale -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <!-- Revenus de la période -->
      <div class="rounded-2xl bg-gradient-to-br from-[#D9A05B] to-[#E8C79A] border-none shadow-lg text-white relative overflow-hidden p-6 group transition-transform hover:scale-[1.02]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-110"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-xs font-semibold uppercase tracking-widest opacity-90">Revenus {{ periodLabel }}</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <DollarSign class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-2xl font-bold">
            {{ formatCFA(stats?.periodIncome || 0) }}
          </div>
          <div class="flex items-center mt-1 text-white/80">
            <TrendingUp class="w-3 h-3 mr-1" />
            <p class="text-[10px]">Entrées d'argent</p>
          </div>
        </div>
      </div>

      <!-- Dépenses de la période -->
      <div class="rounded-2xl bg-gradient-to-br from-[#E87A5B] to-[#F1A28A] border-none shadow-lg text-white relative overflow-hidden p-6 group transition-transform hover:scale-[1.02]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-110"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-xs font-semibold uppercase tracking-widest opacity-90">Dépenses {{ periodLabel }}</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Receipt class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-2xl font-bold">
            {{ formatCFA(stats?.periodExpense || 0) }}
          </div>
          <div class="flex items-center mt-1 text-white/80">
            <TrendingDown class="w-3 h-3 mr-1" />
            <p class="text-[10px]">Sorties d'argent</p>
          </div>
        </div>
      </div>

      <!-- Tickets vendus -->
      <div class="rounded-2xl bg-gradient-to-br from-[#3E524D] to-[#5B8A8A] border-none shadow-lg text-white relative overflow-hidden p-6 group transition-transform hover:scale-[1.02]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-110"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-xs font-semibold uppercase tracking-widest opacity-90">Tickets {{ periodLabel }}</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <Ticket class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-2xl font-bold">{{ stats?.ticketsSold || 0 }}</div>
          <div class="flex items-center mt-1 text-white/80">
            <Activity class="w-3 h-3 mr-1" />
            <p class="text-[10px]">Pass journaliers vendus</p>
          </div>
        </div>
      </div>

      <!-- Nouveaux Membres -->
      <div class="rounded-2xl bg-gradient-to-br from-[#5B8A8A] to-[#8FABA6] border-none shadow-lg text-white relative overflow-hidden p-6 group transition-transform hover:scale-[1.02]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full transition-transform group-hover:scale-110"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-xs font-semibold uppercase tracking-widest opacity-90">Inscriptions {{ periodLabel }}</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
            <UserPlus class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-2xl font-bold">{{ stats?.newMembers || 0 }}</div>
          <div class="flex items-center mt-1 text-white/80">
            <Users class="w-3 h-3 mr-1" />
            <p class="text-[10px]">Nouveaux clients inscrits</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rangée 2: Stats Globales et Solde -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="md:col-span-1 p-6 bg-white border rounded-2xl shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-[#2C3E3A] mb-4">ÉTAT DE LA CAISSE</h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center py-2 border-b border-dashed">
              <span class="text-xs text-slate-500">Membres Actifs (Total)</span>
              <span class="font-bold text-[#5B8A8A]">{{ stats?.activeMembers || 0 }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-dashed">
              <span class="text-xs text-slate-500">Recettes Totales</span>
              <span class="font-bold text-emerald-600">{{ formatCFA(stats?.totalIncome || 0) }}</span>
            </div>
          </div>
        </div>
        <div class="mt-6 pt-4 border-t">
          <p class="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Solde Actuel Global</p>
          <p class="text-3xl font-black text-[#2C3E3A]">{{ formatCFA(stats?.caisseBalance || 0) }}</p>
        </div>
      </div>

      <!-- Dernières Visites - Tableau -->
      <div class="md:col-span-2 rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
        <div class="p-6 pb-2 flex justify-between items-center">
          <div>
            <h3 class="text-lg font-bold text-[#2C3E3A]">Dernières Entrées</h3>
            <p class="text-[10px] text-muted-foreground uppercase tracking-widest">Flux temps réel</p>
          </div>
          <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center animate-pulse">
            <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
        </div>
        <div class="p-6 flex-1 overflow-y-auto">
          <div class="space-y-3">
            <div v-for="(log, idx) in stats?.recentLogs || []" :key="idx" class="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 px-2 rounded-lg transition-colors">
              <div class="flex items-center gap-3">
                <div 
                  class="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm"
                  :class="log.is_valid ? 'bg-[#5B8A8A]' : 'bg-red-400'"
                >
                  <Activity v-if="log.is_valid" class="w-4 h-4" />
                  <AlertCircle v-else class="w-4 h-4" />
                </div>
                <div>
                  <p class="font-bold text-sm text-[#2C3E3A] leading-tight">{{ log.details || 'Accès Scanné' }}</p>
                  <p class="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock class="w-2.5 h-2.5" />
                    {{ formatDate(log.scanned_at) }}
                  </p>
                </div>
              </div>
              <div>
                <span v-if="log.is_valid" class="text-[10px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded uppercase tracking-tighter">OK</span>
                <span v-else class="text-[10px] font-black px-2 py-0.5 bg-red-50 text-red-600 rounded uppercase tracking-tighter">X</span>
              </div>
            </div>
            
            <div v-if="!stats?.recentLogs || stats.recentLogs.length === 0" class="text-center py-6 text-sm text-slate-400">
              Aucun mouvement aujourd'hui
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques et graphiques -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Tendances Mensuelles -->
      <div class="rounded-2xl border bg-white shadow-sm flex flex-col group">
        <div class="p-6 pb-2">
          <h3 class="text-lg font-bold text-[#2C3E3A]">Vue Mensuelle</h3>
          <p class="text-[10px] text-muted-foreground uppercase tracking-widest">Revenus & Adhésions</p>
        </div>
        <div class="p-6 pt-2 flex-1">
          <div class="h-[240px] w-full">
            <Line 
              v-if="!loading"
              :data="chartData" 
              :options="chartOptions" 
            />
            <div v-else class="h-full w-full flex items-center justify-center text-slate-400">
              <Loader2 class="animate-spin w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Graphique Hebdomadaire -->
      <div class="rounded-2xl border bg-white shadow-sm flex flex-col">
        <div class="p-6 pb-2">
          <h3 class="text-lg font-bold text-[#2C3E3A]">Performance Hebdomadaire</h3>
          <p class="text-[10px] text-muted-foreground uppercase tracking-widest">Revenus par jour</p>
        </div>
        <div class="p-6 pt-4 flex-1 flex flex-col justify-end">
          <div class="h-[200px] w-full flex items-end justify-between px-2 gap-3">
            <div 
              v-for="(h, idx) in weeklyStats" 
              :key="idx" 
              class="w-full bg-[#D9A05B] rounded-t-lg transition-all duration-500 hover:opacity-100 hover:brightness-110" 
              :class="selectedPeriod === 'week' ? 'opacity-100' : 'opacity-40'"
              :style="`height: ${h}%`"
            >
               <div class="w-full h-full bg-white/10 rounded-t-lg"></div>
            </div>
          </div>
          <div class="flex justify-between w-full mt-3 text-[10px] font-bold text-slate-400 px-2 uppercase tracking-tighter">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mer</span>
            <span>Jeu</span>
            <span>Ven</span>
            <span>Sam</span>
            <span>Dim</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  DollarSign, 
  Ticket, 
  Users, 
  Activity, 
  AlertCircle,
  Receipt,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2
} from 'lucide-vue-next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { useDashboardLogic } from '../hooks/useDashboardLogic';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, ChartTooltip, Filler, Legend);

const {
  stats, loading, selectedPeriod, periods, chartData, weeklyStats,
  currentDate, periodLabel, chartOptions, formatCFA, formatDate, changePeriod
} = useDashboardLogic();
</script>

<style scoped>
/* Effet de fondu lors du chargement des perfs hebdomadaires */
.transition-all {
  transition: all 0.5s ease-out;
}
</style>
