<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="h-10 px-4 rounded-full border border-input bg-white hover:bg-[#EFF4F2] text-[#3E524D]"
          @click="goBack"
        >
          Retour
        </button>
        <div>
          <h1 class="text-3xl font-bold text-[#2C3E3A]">{{ activity?.name || 'Détail activité' }}</h1>
          <p class="text-muted-foreground mt-1">Inscrits, expirations et derniers accès QR membre/ticket</p>
        </div>
      </div>
      <button
        v-if="activity && isCashierOrAdmin"
        type="button"
        class="h-10 px-5 rounded-full bg-[#3E524D] text-white hover:bg-[#32423E] font-semibold"
        @click="goToNewSubscription"
      >
        Nouvel abonnement
      </button>
    </div>

    <div v-if="loading" class="rounded-xl border bg-white p-8 text-center text-muted-foreground">
      Chargement des détails...
    </div>

    <div v-else-if="!activity" class="rounded-xl border bg-white p-8 text-center text-muted-foreground">
      Activité introuvable.
    </div>

    <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="rounded-2xl border bg-white p-4">
          <p class="text-xs uppercase text-muted-foreground">Inscrits</p>
          <p class="text-2xl font-bold text-[#2C3E3A] mt-1">{{ metrics.subscribers_count }}</p>
        </div>
        <div class="rounded-2xl border bg-white p-4">
          <p class="text-xs uppercase text-muted-foreground">Abonnés actifs</p>
          <p class="text-2xl font-bold text-[#1D9C56] mt-1">{{ metrics.active_subscribers_count }}</p>
        </div>
        <div class="rounded-2xl border bg-white p-4">
          <p class="text-xs uppercase text-muted-foreground">Tickets générés</p>
          <p class="text-2xl font-bold text-[#3F5550] mt-1">{{ metrics.tickets_count }}</p>
        </div>
      </div>

      <div class="rounded-2xl border bg-white overflow-hidden">
        <div class="px-4 py-3 border-b bg-[#F7FBF9]">
          <h2 class="text-lg font-semibold text-[#2C3E3A]">Liste des inscrits</h2>
        </div>

        <div v-if="subscriptions.length === 0" class="p-5 text-sm text-muted-foreground">
          Aucun inscrit pour cette activité.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-190 text-sm">
            <thead class="bg-[#F9FCFB] text-[#637772]">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Membre</th>
                <th class="text-left px-4 py-3 font-semibold">Contact</th>
                <th class="text-left px-4 py-3 font-semibold">Expiration</th>
                <th class="text-left px-4 py-3 font-semibold">Statut</th>
                <th class="text-left px-4 py-3 font-semibold">Dernier accès (QR membre)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sub in subscriptions" :key="sub.subscription_id" class="border-t">
                <td class="px-4 py-3 font-medium text-[#2C3E3A]">
                  {{ sub.first_name }} {{ sub.last_name }}
                </td>
                <td class="px-4 py-3 text-[#4C625D]">
                  {{ sub.phone || sub.email || 'N/A' }}
                </td>
                <td class="px-4 py-3 text-[#4C625D]">{{ formatDate(sub.end_date) }}</td>
                <td class="px-4 py-3">
                  <span
                    class="rounded-full px-2.5 py-1 text-xs font-semibold"
                    :class="isSubActive(sub) ? 'bg-[#ECFFF4] text-[#1D9C56]' : 'bg-[#FFEDEF] text-[#D14646]'"
                  >
                    {{ isSubActive(sub) ? 'Actif' : 'Expiré' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-[#4C625D]">{{ formatDateTime(sub.last_access_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="rounded-2xl border bg-white overflow-hidden">
        <div class="px-4 py-3 border-b bg-[#F7FBF9]">
          <h2 class="text-lg font-semibold text-[#2C3E3A]">Derniers accès tickets</h2>
        </div>

        <div v-if="tickets.length === 0" class="p-5 text-sm text-muted-foreground">
          Aucun ticket pour cette activité.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-190 text-sm">
            <thead class="bg-[#F9FCFB] text-[#637772]">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Ticket</th>
                <th class="text-left px-4 py-3 font-semibold">Prix</th>
                <th class="text-left px-4 py-3 font-semibold">Validité</th>
                <th class="text-left px-4 py-3 font-semibold">Statut</th>
                <th class="text-left px-4 py-3 font-semibold">Dernier accès (QR ticket)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ticket in tickets" :key="ticket.ticket_id" class="border-t">
                <td class="px-4 py-3 font-medium text-[#2C3E3A]">#{{ ticket.ticket_id }}</td>
                <td class="px-4 py-3 text-[#4C625D]">{{ formatNumber(ticket.price) }} FCFA</td>
                <td class="px-4 py-3 text-[#4C625D]">{{ formatDateTime(ticket.valid_until) }}</td>
                <td class="px-4 py-3">
                  <span 
                    class="rounded-full px-2.5 py-1 text-xs font-semibold" 
                    :class="ticket.status === 'USED' ? 'bg-[#E9F2FF] text-[#3562C8]' : (isTicketValid(ticket) ? 'bg-[#ECFFF4] text-[#1D9C56]' : 'bg-[#FFEDEF] text-[#D14646]')"
                  >
                    {{ ticket.status === 'USED' ? 'Utilisé' : (isTicketValid(ticket) ? 'Valide' : 'Expiré') }}
                  </span>
                </td>
                <td class="px-4 py-3 text-[#4C625D]">{{ formatDateTime(ticket.last_access_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useActivityDetailsLogic } from '../hooks/useActivityDetailsLogic';

const {
  loading, activity, subscriptions, tickets, metrics, isCashierOrAdmin,
  formatNumber, formatDate, formatDateTime,
  isSubActive, isTicketValid,
  goBack, goToNewSubscription
} = useActivityDetailsLogic();
</script>
