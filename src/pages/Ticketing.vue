<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-[#2C3E3A]">Billetterie</h1>
        <p class="text-muted-foreground mt-1">
          Vente de tickets journaliers
        </p>
      </div>
      <button 
        @click="openModal()" 
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-[#3E524D] text-primary-foreground hover:bg-[#2d3d39] h-10 py-2 px-4"
      >
        <Plus class="h-4 w-4 mr-2" />
        Vendre un Ticket
      </button>
    </div>

    <!-- Modal Vente de Ticket -->
    <div v-if="isDialogOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        @click="isDialogOpen = false"
      ></div>
      
      <div class="z-50 bg-background rounded-lg shadow-lg border w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex flex-col space-y-1.5 p-6 border-b">
          <h2 class="text-lg font-semibold leading-none tracking-tight">Nouvelle vente de ticket</h2>
          <p class="text-sm text-muted-foreground">Générez des tickets d'accès journaliers</p>
        </div>
        
        <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium leading-none">Activité</label>
              <select
                v-model="formData.activity_id"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
                required
              >
                <option value="" disabled>Sélectionnez une activité</option>
                <option v-for="activity in availableActivities" :key="activity.id" :value="activity.id">
                  {{ activity.name }} - {{ activity.daily_ticket_price }} FCFA
                </option>
              </select>
              <p v-if="availableActivities.length === 0" class="text-sm text-red-500 mt-1">
                Aucune activité disponible pour la vente de tickets
              </p>
            </div>

            <div>
              <label class="text-sm font-medium leading-none">Quantité</label>
              <input
                type="number"
                min="1"
                max="100"
                v-model.number="formData.quantity"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
                required
              />
              <p class="text-sm text-muted-foreground mt-1">
                Génération en masse de tickets
              </p>
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

            <div>
              <label class="text-sm font-medium leading-none">Validité du ticket</label>
              <select
                v-model="formData.validity_option"
                class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2"
              >
                <option value="end_of_day">Fin de journée (23:59)</option>
                <option value="24h">24 heures</option>
                <option value="3d">3 jours</option>
                <option value="7d">7 jours</option>
                <option value="30d">30 jours</option>
              </select>
            </div>

            <div v-if="formData.activity_id && selectedActivityObj" class="p-4 bg-blue-50 text-blue-900 rounded-lg border border-blue-100 mt-4">
              <p class="text-sm font-medium text-blue-800">Montant total:</p>
              <p class="text-2xl font-bold">
                {{ (selectedActivityObj.daily_ticket_price * formData.quantity).toLocaleString() }} FCFA
              </p>
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
              :disabled="availableActivities.length === 0 || issuing"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#3E524D] text-primary-foreground hover:bg-[#2d3d39] h-10 px-4 py-2 disabled:opacity-50"
            >
              <component :is="issuing ? RefreshCw : ''" class="w-4 h-4 mr-2 animate-spin" v-if="issuing" />
              Générer {{ formData.quantity > 1 ? `${formData.quantity} tickets` : 'le ticket' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Statistiques -->
    <div class="grid gap-4 md:grid-cols-4">
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Tickets du jour</h3>
        <p class="text-2xl font-bold">{{ todayTickets.length }}</p>
      </div>
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Tickets utilisés</h3>
        <p class="text-2xl font-bold">{{ todayTickets.filter(t => isTicketUsed(t)).length }}</p>
      </div>
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Tickets valides</h3>
        <p class="text-2xl font-bold">{{ todayTickets.filter(t => !isTicketUsed(t) && !isTicketExpired(t)).length }}</p>
      </div>
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
        <h3 class="tracking-tight text-sm font-medium mb-2">Revenus tickets</h3>
        <p class="text-2xl font-bold">{{ totalRevenue.toLocaleString() }} FCFA</p>
      </div>
    </div>

    <!-- Liste des tickets -->
    <div class="rounded-xl border bg-card text-card-foreground shadow-lg">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b gap-3">
        <div class="shrink-0">
          <h3 class="text-lg font-semibold leading-none tracking-tight text-[#2C3E3A]">Tickets</h3>
          <p class="text-sm text-muted-foreground mt-1">Consultez les tickets du jour, tous les tickets ou uniquement les expirés</p>
        </div>
        <!-- Recherche + filtre date -->
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher..."
              class="flex h-10 w-48 rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div class="flex items-center gap-1.5">
            <CalendarDays class="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              v-model="dateFrom"
              type="date"
              class="h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <button
            v-if="dateFrom"
            @click="dateFrom = ''"
            class="inline-flex items-center gap-1 h-10 px-3 rounded-md border text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 transition-colors"
          >
            <XCircle class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div class="px-6 pt-4 flex gap-2 flex-wrap">
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border transition-colors"
          :class="ticketFilter === 'today' ? 'bg-[#2C3E3A] text-white border-[#2C3E3A]' : 'bg-white text-[#2C3E3A] hover:bg-slate-50'"
          @click="ticketFilter = 'today'"
        >
          Aujourd'hui ({{ todayTickets.length }})
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border transition-colors"
          :class="ticketFilter === 'all' ? 'bg-[#2C3E3A] text-white border-[#2C3E3A]' : 'bg-white text-[#2C3E3A] hover:bg-slate-50'"
          @click="ticketFilter = 'all'"
        >
          Tous ({{ tickets.length }})
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border transition-colors"
          :class="ticketFilter === 'active' ? 'bg-[#3E524D] text-white border-[#3E524D]' : 'bg-white text-[#3E524D] border-[#8FABA6] hover:bg-[#EAF1F1]'"
          @click="ticketFilter = 'active'"
        >
          Actifs ({{ activeTickets.length }})
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border transition-colors"
          :class="ticketFilter === 'used' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
          @click="ticketFilter = 'used'"
        >
          Utilisés ({{ usedTickets.length }})
        </button>
        <button
          class="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 border transition-colors"
          :class="ticketFilter === 'expired' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-red-700 border-red-200 hover:bg-red-50'"
          @click="ticketFilter = 'expired'"
        >
          Expirés ({{ expiredTickets.length }})
        </button>
      </div>
      <div class="p-6">
        <div class="space-y-2">
          <div v-if="displayedTickets.length === 0" class="text-center text-muted-foreground py-8">
            {{ emptyStateText }}
          </div>
          
          <div
            v-else
            v-for="ticket in displayedTickets"
            :key="ticket.id"
            class="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div class="flex items-center gap-4">
              <div
                class="p-3 rounded-full"
                :class="isTicketUsed(ticket) ? 'bg-slate-100 text-slate-400' : isTicketExpired(ticket) ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'"
              >
                <TicketIcon class="h-5 w-5" />
              </div>
              <div>
                <p class="font-medium text-[#2C3E3A]">{{ ticket.qr_code.split('-')[0] }}</p>
                <p class="text-sm text-muted-foreground">{{ getActivityName(ticket.activity_id) }}</p>
                <p class="text-xs text-muted-foreground/70">
                  Créé à {{ new Date(ticket.created_at).toLocaleTimeString('fr-FR') }}
                </p>
                <p class="text-xs text-muted-foreground/70">
                  Valide jusqu'au {{ new Date(ticket.valid_until).toLocaleString('fr-FR') }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="text-right">
                <p class="font-bold text-[#2C3E3A]">
                  {{ ticket.price ? ticket.price.toLocaleString() : '0' }} FCFA
                </p>
                <div 
                  v-if="isTicketUsed(ticket)" 
                  class="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none bg-slate-100 text-slate-800"
                >
                  <CheckCircle2 class="h-3 w-3 mr-1" />
                  Utilisé
                </div>
                <div 
                  v-else-if="isTicketExpired(ticket)" 
                  class="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none bg-red-100 text-red-800"
                >
                  <XCircle class="h-3 w-3 mr-1" />
                  Expiré
                </div>
                <div 
                  v-else 
                  class="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold focus:outline-none bg-[#2C3E3A] text-white"
                >
                  Valide
                </div>
              </div>

              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-transparent hover:bg-slate-100 h-9 w-9 text-[#2C3E3A]"
                :title="copiedId === ticket.id ? 'Copié !' : 'Copier le code'"
                @click="copyCode(ticket)"
              >
                <CopyCheck v-if="copiedId === ticket.id" class="h-4 w-4 text-[#3E524D]" />
                <Copy v-else class="h-4 w-4" />
              </button>
              <button
                class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border bg-transparent hover:bg-slate-100 h-9 w-9 text-[#2C3E3A]"
                @click="openQRModal(ticket)"
              >
                <QrCode class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Dialog -->
    <div v-if="selectedTicketData" class="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
      <div 
        class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        @click="selectedTicketData = null"
      ></div>
      
      <div class="z-50 bg-background rounded-lg shadow-lg border w-full max-w-sm flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex flex-col space-y-1.5 p-6 border-b text-center relative">
          <button @click="selectedTicketData = null" class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle class="w-5 h-5" />
          </button>
          <h2 class="text-xl font-bold leading-none tracking-tight mt-2">QR Code Ticket</h2>
          <p class="text-xs font-mono mt-2 text-[#2C3E3A] bg-slate-100 rounded px-2 py-1 break-all select-all">{{ selectedTicketData.qr_code }}</p>
          <button
            @click="copyQrCode(selectedTicketData.qr_code)"
            class="mt-1 text-xs text-[#3E524D] underline hover:text-[#2d3d39] transition-colors"
          >
            {{ copied ? '✅ Copié !' : '📋 Copier le code' }}
          </button>
        </div>
        
        <div class="p-6 flex flex-col items-center gap-6">
          <div class="bg-white p-4 rounded-xl border shadow-sm">
            <qrcode-vue :value="selectedTicketData.qr_code" :size="200" level="H" :render-as="'svg'" />
          </div>
          
          <div class="text-center">
            <p class="font-bold text-lg text-[#2C3E3A]">
              {{ getActivityName(selectedTicketData.activity_id) }}
            </p>
            <p class="text-sm text-muted-foreground font-medium mt-1">
              Expire le {{ new Date(selectedTicketData.valid_until).toLocaleString('fr-FR') }}
            </p>
          </div>
          
          <div class="flex w-full gap-3 pt-4 border-t">
            <button
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-bold bg-[#3E524D] text-white hover:bg-[#2d3d39] h-10 px-4 py-2"
              @click="printQR"
            >
              Imprimer
            </button>
            <button
              class="flex-1 inline-flex items-center justify-center rounded-md text-sm font-bold border border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors h-10 px-4 py-2"
              @click="sendWhatsApp"
            >
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { 
  Plus, 
  Ticket as TicketIcon, 
  QrCode, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  Copy,
  CopyCheck,
  Search,
  CalendarDays
} from 'lucide-vue-next';
import { useTicketingLogic } from '../hooks/useTicketingLogic';

const {
  tickets, isDialogOpen, issuing, selectedTicketData, copied, copiedId,
  formData, ticketFilter, searchQuery, dateFrom, availableActivities,
  selectedActivityObj, todayTickets, totalRevenue, expiredTickets,
  activeTickets, usedTickets, displayedTickets, emptyStateText,
  copyCode, copyQrCode, openModal, isTicketUsed, getActivityName,
  isTicketExpired, openQRModal, printQR, sendWhatsApp, handleSubmit
} = useTicketingLogic();
</script>
