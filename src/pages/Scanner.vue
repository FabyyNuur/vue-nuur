<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-3xl font-bold text-[#2C3E3A]">Contrôle d'Accès QR</h1>
      <p class="text-muted-foreground mt-1">Scanner les QR codes des membres et tickets</p>
    </div>

    <!-- Statistiques globales -->
    <div class="grid gap-4 md:grid-cols-3">
      <div class="rounded-xl bg-gradient-to-br from-[#5B8A8A] to-[#8FABA6] border-none shadow-lg text-white relative overflow-hidden p-6">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider">Total Scans</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Activity class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-bold">{{ pagination.total }}</div>
          <p class="text-xs text-white/80 mt-1">Tous les accès</p>
        </div>
      </div>

      <div class="rounded-xl bg-gradient-to-br from-[#3E524D] to-[#5B8A8A] border-none shadow-lg text-white relative overflow-hidden p-6">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider">Autorisés</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <CheckCircle2 class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-bold">{{ statsValid }}</div>
          <p class="text-xs text-white/80 mt-1">Accès validés</p>
        </div>
      </div>

      <div class="rounded-xl bg-gradient-to-br from-[#D9A05B] to-[#E8C79A] border-none shadow-lg text-white relative overflow-hidden p-6">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full"></div>
        <div class="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 mb-2">
          <h3 class="text-sm font-semibold uppercase tracking-wider">Refusés</h3>
          <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <XCircle class="h-5 w-5" />
          </div>
        </div>
        <div class="relative z-10">
          <div class="text-3xl font-bold">{{ statsRefused }}</div>
          <p class="text-xs text-white/80 mt-1">Accès refusés</p>
        </div>
      </div>
    </div>

    <!-- Layout : scanner 1/3 + historique 2/3 -->
    <div class="grid gap-6 lg:grid-cols-3">

      <!-- Scanner (col 1/3) -->
      <div class="space-y-4">
        <div class="rounded-xl border bg-card text-card-foreground shadow-lg">
          <div class="flex flex-col space-y-1.5 p-5">
            <h3 class="text-lg font-semibold leading-none tracking-tight text-[#2C3E3A]">Scanner QR Code</h3>
            <p class="text-sm text-muted-foreground">Saisissez ou scannez le code</p>
          </div>
          <div class="p-5 pt-0 space-y-4">
            <!-- WebCam View -->
            <div class="relative bg-slate-100 rounded-2xl overflow-hidden border">
              <div id="qr-reader" class="w-full !rounded-2xl overflow-hidden" :class="{'h-56': !scannerActive, 'h-auto': scannerActive}"></div>
              
              <!-- Placeholder when inactive -->
              <div v-if="!scannerActive" class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-[#2C3E3A]/5">
                <Camera class="h-10 w-10 mx-auto mb-2 text-[#5B8A8A]" />
                <p class="text-xs font-medium text-center px-4 mb-3">Placez le QR Code devant la caméra</p>
                
                <button 
                  @click="startCamera" 
                  class="bg-[#3E524D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#32423E] transition-colors shadow-sm"
                >
                  Activer la caméra
                </button>
              </div>

              <!-- Stop Camera Button -->
              <button 
                v-if="scannerActive && !scanResult"
                @click="stopCamera"
                class="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 backdrop-blur-sm transition-all"
                title="Arrêter la caméra"
              >
                <XCircle class="w-5 h-5" />
              </button>
              
              <!-- Error message -->
              <div v-if="permissionError" class="absolute bottom-2 left-2 right-2 bg-red-100/90 text-red-700 text-xs p-2 rounded-lg backdrop-blur-sm text-center font-medium border border-red-200">
                {{ permissionError }}
              </div>
            </div>

            <!-- Saisie manuelle -->
            <form @submit.prevent="handleManualScan" class="space-y-3">
              <div>
                <label class="text-sm font-medium leading-none">Code QR</label>
                <input
                  v-model="manualCode"
                  class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  placeholder="UUID complet du ticket/membre"
                  :disabled="scanning"
                />
                <p class="text-xs text-muted-foreground mt-1">Collez le QR code complet copié depuis la billetterie.</p>
              </div>
              <button 
                type="submit" 
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors disabled:opacity-50 bg-[#3E524D] text-white hover:bg-[#2d3d39] h-10 px-4 py-2 w-full"
                :disabled="scanning || !manualCode.trim()"
              >
                <RefreshCw v-if="scanning" class="w-4 h-4 mr-2 animate-spin" />
                <Zap v-else class="w-4 h-4 mr-2" />
                {{ scanning ? 'Vérification...' : "Valider l'accès" }}
              </button>
            </form>
          </div>
        </div>

        <!-- Résultat du scan -->
        <transition name="fade">
          <div 
            v-if="scanResult" 
            class="rounded-xl border-2 shadow-lg"
            :class="scanResult.valid
              ? 'border-[#5B8A8A] bg-gradient-to-br from-emerald-50 to-teal-50'
              : 'border-red-400 bg-gradient-to-br from-red-50 to-orange-50'"
          >
            <div class="p-5">
              <div class="flex items-center gap-3">
                <div 
                  class="w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0"
                  :class="scanResult.valid ? 'bg-[#5B8A8A]' : 'bg-red-500'"
                >
                  <CheckCircle2 v-if="scanResult.valid" class="h-7 w-7" />
                  <XCircle v-else class="h-7 w-7" />
                </div>
                <div>
                  <p class="font-bold text-base" :class="scanResult.valid ? 'text-[#2C3E3A]' : 'text-red-900'">
                    {{ scanResult.valid ? 'ACCÈS AUTORISÉ' : 'ACCÈS REFUSÉ' }}
                  </p>
                  <p class="text-sm" :class="scanResult.valid ? 'text-[#5B8A8A]' : 'text-red-700'">
                    {{ scanResult.message }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Historique (col 2/3) -->
      <div class="lg:col-span-2 rounded-xl border bg-card text-card-foreground shadow-lg flex flex-col">
        <!-- Header + filtres -->
        <div class="p-5 border-b space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold leading-none tracking-tight text-[#2C3E3A]">Historique des accès</h3>
              <p class="text-sm text-muted-foreground mt-1">{{ pagination.total }} entrée(s) au total</p>
            </div>
            <button
              @click="fetchLogs"
              class="inline-flex items-center justify-center rounded-md border h-8 w-8 hover:bg-slate-50 transition-colors"
              :disabled="loadingLogs"
            >
              <RefreshCw class="h-4 w-4 text-[#3E524D]" :class="{ 'animate-spin': loadingLogs }" />
            </button>
          </div>
          <!-- Filtres -->
          <div class="flex gap-2">
            <button
              v-for="f in filters"
              :key="f.value"
              @click="setFilter(f.value)"
              class="inline-flex items-center gap-1.5 justify-center rounded-md text-xs font-medium h-8 px-3 border transition-colors"
              :class="activeFilter === f.value ? f.activeClass : 'bg-white text-[#2C3E3A] hover:bg-slate-50'"
            >
              <component :is="f.icon" class="h-3.5 w-3.5" />
              {{ f.label }}
            </button>
          </div>
        </div>

        <!-- Liste des logs -->
        <div class="p-4 overflow-y-auto flex-1 max-h-[520px]">
          <div class="space-y-2">
            <div v-if="loadingLogs" class="text-center text-muted-foreground py-12">
              <RefreshCw class="h-6 w-6 animate-spin mx-auto mb-2 text-[#3E524D]" />
              Chargement...
            </div>
            <div v-else-if="logs.length === 0" class="text-center text-muted-foreground py-12">
              <ShieldOff class="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p class="font-medium">Aucun accès enregistré</p>
              <p class="text-xs mt-1">Les scans apparaîtront ici après validation d'un ticket ou membre.</p>
            </div>
            
            <div
              v-else
              v-for="log in logs"
              :key="log.id"
              class="flex items-center justify-between p-3 border rounded-xl hover:bg-[#EAF1F1] transition-colors"
            >
              <div class="flex items-center gap-3">
                <div
                  class="p-2 rounded-full text-white shrink-0"
                  :class="log.is_valid ? 'bg-gradient-to-br from-[#5B8A8A] to-[#8FABA6]' : 'bg-gradient-to-br from-red-400 to-red-500'"
                >
                  <CheckCircle2 v-if="log.is_valid" class="h-4 w-4" />
                  <XCircle v-else class="h-4 w-4" />
                </div>
                <div>
                  <p class="font-semibold text-[#2C3E3A] text-sm">{{ log.details || 'Scan QR' }}</p>
                  <p class="text-xs text-muted-foreground font-mono truncate max-w-[280px]">
                    {{ log.qr_code_scanned }}
                  </p>
                </div>
              </div>
              <div class="text-right text-xs text-muted-foreground font-medium shrink-0 ml-3">
                <p class="font-semibold">{{ formatTime(log.scanned_at) }}</p>
                <p>{{ formatDate(log.scanned_at) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="p-4 border-t flex items-center justify-between">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="inline-flex items-center gap-1 justify-center rounded-md text-sm font-medium h-8 px-3 border transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft class="h-4 w-4" /> Précédent
          </button>
          <span class="text-sm text-muted-foreground">
            Page {{ pagination.page }} / {{ pagination.totalPages }}
          </span>
          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.totalPages"
            class="inline-flex items-center gap-1 justify-center rounded-md text-sm font-medium h-8 px-3 border transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Suivant <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  CheckCircle2, 
  XCircle, 
  Activity,
  Camera,
  Zap,
  RefreshCw,
  ShieldOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-vue-next';
import { useScannerLogic } from '../hooks/useScannerLogic';

const {
  manualCode, scanResult, scanning, loadingLogs, logs, activeFilter,
  statsValid, statsRefused, pagination, filters,
  scannerActive, permissionError,
  startCamera, stopCamera,
  setFilter, changePage, formatTime, formatDate, handleManualScan, fetchLogs
} = useScannerLogic();
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
