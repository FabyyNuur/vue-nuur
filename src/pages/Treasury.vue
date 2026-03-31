<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-[#2C3E3A]">Module de Caisse</h1>
        <p class="text-muted-foreground mt-1">
          Suivi de la trésorerie de Nuur GYM
        </p>
      </div>
      <div class="flex gap-2">
        <button 
          @click="exportData" 
          class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
        >
          <Download class="h-4 w-4 mr-2" />
          Exporter
        </button>
        <button 
          @click="openModal" 
          class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#3E524D] text-primary-foreground hover:bg-[#2d3d39] h-10 px-4 py-2"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nouvelle Transaction
        </button>
      </div>
    </div>

    <!-- Modal Transaction -->
    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        @click="isDialogOpen = false"
      ></div>
      
      <div class="z-50 bg-background rounded-lg shadow-lg border w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex flex-col space-y-1.5 p-6 border-b">
          <h2 class="text-lg font-semibold leading-none tracking-tight">Ajouter une transaction</h2>
          <p class="text-sm text-muted-foreground">Enregistrez une recette ou une dépense</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium leading-none">Type</label>
              <select
                v-model="formData.type"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
              >
                <option value="INCOME">Recette</option>
                <option value="EXPENSE">Dépense</option>
              </select>
            </div>

            <div>
              <label class="text-sm font-medium leading-none">Montant (FCFA)</label>
              <input
                type="number"
                min="0"
                v-model.number="formData.amount"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
                required
              />
            </div>

            <div>
              <label class="text-sm font-medium leading-none">Description</label>
              <input
                type="text"
                v-model="formData.description"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
                required
              />
            </div>

            <div>
              <label class="text-sm font-medium leading-none">Mode de paiement</label>
              <select
                v-model="formData.payment_method"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte</option>
                <option value="transfer">Virement</option>
              </select>
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-6 border-t mt-6">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              @click="isDialogOpen = false"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#3E524D] text-primary-foreground hover:bg-[#2d3d39] h-10 px-4 py-2 disabled:opacity-50"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid gap-4 md:grid-cols-4">
      <div class="rounded-xl border shadow-sm p-6 bg-gradient-to-br from-[#3E524D] to-[#5B8A8A] text-white">
        <h3 class="tracking-tight text-sm font-medium opacity-90 mb-2">Solde de Caisse</h3>
        <div class="flex items-center gap-2">
          <Wallet class="h-6 w-6" />
          <p class="text-3xl font-bold">{{ stats.cashBalance.toLocaleString() }} FCFA</p>
        </div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Recettes</h3>
        <div class="flex items-center gap-2 text-green-600">
          <TrendingUp class="h-6 w-6" />
          <p class="text-2xl font-bold">{{ stats.totalIncome.toLocaleString() }} FCFA</p>
        </div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Dépenses</h3>
        <div class="flex items-center gap-2 text-red-600">
          <TrendingDown class="h-6 w-6" />
          <p class="text-2xl font-bold">{{ stats.totalExpense.toLocaleString() }} FCFA</p>
        </div>
      </div>

      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Bilan Période</h3>
        <div class="flex items-center gap-2">
          <DollarSign class="h-6 w-6" />
          <p class="text-2xl font-bold" :class="stats.net >= 0 ? 'text-green-600' : 'text-red-600'">
            {{ stats.net >= 0 ? '+' : '' }}{{ stats.net.toLocaleString() }} FCFA
          </p>
        </div>
      </div>
    </div>

    <!-- Filtres -->
    <div class="rounded-xl border bg-card text-card-foreground shadow-lg">
      <div class="flex flex-col sm:flex-row items-center justify-between p-6 border-b gap-4">
        <h3 class="text-lg font-semibold leading-none tracking-tight text-[#2C3E3A]">Flux financiers</h3>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <!-- Barre de recherche -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une transaction..."
              class="flex h-10 w-full sm:w-64 rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <select
            v-model="filterPeriod"
            class="flex h-10 w-full sm:w-37.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="today">Aujourd'hui</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="all">Tout</option>
          </select>
          <select
            v-model="filterType"
            class="flex h-10 w-full sm:w-37.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">Tous types</option>
            <option value="INCOME">Recettes</option>
            <option value="EXPENSE">Dépenses</option>
          </select>
        </div>
      </div>
      
      <div class="p-6">
        <div class="space-y-2 max-h-150 overflow-y-auto">
          <div v-if="filteredTransactions.length === 0" class="text-center text-muted-foreground py-8">
            Aucune transaction pour cette période
          </div>
          
          <div
            v-else
            v-for="transaction in filteredTransactions"
            :key="transaction.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-full"
                :class="transaction.type === 'INCOME' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'"
              >
                <Plus v-if="transaction.type === 'INCOME'" class="h-5 w-5" />
                <Minus v-else class="h-5 w-5" />
              </div>
              <div>
                <p class="font-medium text-[#2C3E3A]">{{ transaction.description }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <p class="text-sm text-muted-foreground">
                    {{ new Date(transaction.created_at).toLocaleString('fr-FR') }}
                  </p>
                  <span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-900 uppercase text-[10px] tracking-wider">
                  {{ transaction.type === 'INCOME' ? 'Recette' : 'Dépense' }}
                  </span>
                </div>
              </div>
            </div>

            <div class="text-right">
              <p
                class="text-xl font-bold"
                :class="transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'"
              >
                {{ transaction.type === 'INCOME' ? '+' : '-' }}
                {{ (transaction.amount || 0).toLocaleString() }} FCFA
              </p>
              <p class="text-sm text-muted-foreground capitalize">
                {{ transaction.payment_method === 'cash' ? 'Espèces' : transaction.payment_method === 'card' ? 'Carte' : transaction.payment_method === 'transfer' ? 'Virement' : 'Espèces' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Plus,
  Minus,
  Search
} from 'lucide-vue-next';
import { useTreasuryLogic } from '../hooks/useTreasuryLogic';

const {
  isDialogOpen, filterPeriod, filterType, searchQuery,
  saving, formData, filteredTransactions, stats,
  openModal, handleSubmit, exportData
} = useTreasuryLogic();
</script>
