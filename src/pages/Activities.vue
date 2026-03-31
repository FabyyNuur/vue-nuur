<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-[#2C3E3A]">Activités Sportives</h1>
        <p class="text-muted-foreground mt-1">Gérez le catalogue d'activités de Nuur GYM</p>
      </div>
      <button
        v-if="isAdmin"
        @click="openActivityModal()"
        class="inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#3E524D] text-white hover:bg-[#32423E] h-11 px-5 shadow-sm"
      >
        <Plus class="h-4 w-4 mr-2" />
        Nouvelle Activité
      </button>
    </div>

    <div v-if="loading" class="rounded-xl border bg-white p-8 text-center text-muted-foreground">Chargement des activités...</div>

    <div v-else class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="rounded-3xl border border-[#D7E0DD] bg-[#F8FBFA] p-5 shadow-[0_8px_20px_rgba(44,62,58,0.08)]"
        :style="{ borderTop: `6px solid ${activityColor(activity)}` }"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <div class="mt-1 w-11 h-11 rounded-full flex items-center justify-center" :style="activityBadgeStyle(activity)">
              <HeartPulse class="h-5 w-5" :style="{ color: activityColor(activity) }" />
            </div>
            <div>
              <h3 class="text-[32px] leading-8 font-semibold text-[#31423E] tracking-tight">{{ activity.name }}</h3>
              <div class="flex items-center gap-2 mt-3">
                <span v-if="isSubscriptionOnly(activity)" class="rounded-full bg-[#F8E6CF] text-[#C88732] px-3 py-1 text-xs font-semibold">Abonnés uniquement</span>
                <span class="rounded-full border border-[#30B167] text-[#1D9C56] px-3 py-1 text-xs font-semibold bg-[#ECFFF4]">Active</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            class="w-9 h-9 rounded-full bg-white text-[#5B8A8A] border border-[#D7E0DD] hover:text-[#3E524D] hover:bg-[#EFF4F2] flex items-center justify-center"
            @click="goToActivityDetails(activity.id)"
            title="Détails"
          >
            <Info class="h-4 w-4" />
          </button>
        </div>

        <div class="mt-5 rounded-2xl bg-[#EFF4F2] px-4 py-3 divide-y divide-[#DEE8E4] text-sm">
          <div class="flex justify-between py-1.5">
            <span class="text-[#637772]">Inscription:</span>
            <span class="font-bold text-[#3F5550]">{{ formatNumber(activity.registration_fee) }} FCFA</span>
          </div>
          <div v-if="!isSubscriptionOnly(activity)" class="flex justify-between py-1.5">
            <span class="text-[#637772]">Ticket jour:</span>
            <span class="font-bold text-[#3F5550]">{{ formatNumber(activity.daily_ticket_price) }} FCFA</span>
          </div>
          <div v-if="Number(activity.monthly_price) > 0" class="flex justify-between py-1.5">
            <span class="text-[#637772]">Mensuel:</span>
            <span class="font-bold text-[#D9A05B]">{{ formatNumber(activity.monthly_price) }} FCFA</span>
          </div>
          <div v-if="Number(activity.quarterly_price) > 0" class="flex justify-between py-1.5">
            <span class="text-[#637772]">Trimestriel:</span>
            <span class="font-bold text-[#3F5550]">{{ formatNumber(activity.quarterly_price) }} FCFA</span>
          </div>
          <div v-if="Number(activity.semester_price) > 0" class="flex justify-between py-1.5">
            <span class="text-[#637772]">Semestriel:</span>
            <span class="font-bold text-[#3F5550]">{{ formatNumber(activity.semester_price) }} FCFA</span>
          </div>
          <div v-if="Number(activity.yearly_price) > 0" class="flex justify-between py-1.5">
            <span class="text-[#637772]">Annuel:</span>
            <span class="font-bold text-[#3F5550]">{{ formatNumber(activity.yearly_price) }} FCFA</span>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <button
            v-if="isCashierOrAdmin"
            @click="openSubscriptionModal(activity)"
            class="w-full rounded-full bg-[#3E524D] text-white hover:bg-[#32423E] h-10 flex items-center justify-center font-semibold"
          >
            Abonnement
          </button>
          <div class="flex items-center gap-2" v-if="isAdmin">
            <button
              @click="handleEdit(activity)"
              class="flex-1 rounded-full bg-[#E8EFED] text-[#334641] h-9 flex items-center justify-center gap-2 font-semibold hover:bg-[#DDE7E4]"
            >
              <Edit2 class="h-4 w-4" />
              Modifier
            </button>
            <button
              @click="handleDelete(activity.id)"
              class="w-9 h-9 rounded-full bg-[#FFEDEF] text-[#FA6F6F] hover:bg-[#FFDDE1] flex items-center justify-center"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isActivityModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="fixed inset-0 bg-black/70" @click="isActivityModalOpen = false"></div>
      <div class="z-50 bg-background rounded-3xl shadow-lg border w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div class="p-6 border-b flex items-start justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-[#2F413D]">{{ editingActivityId ? "Modifier l'activité" : 'Nouvelle activité' }}</h2>
            <p class="text-sm text-muted-foreground mt-1">Configurez les tarifs et la couleur de la card</p>
          </div>
          <button @click="isActivityModalOpen = false" class="text-muted-foreground hover:text-foreground">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6 overflow-y-auto">
          <form @submit.prevent="handleActivitySubmit" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="text-sm font-semibold">Nom de l'activité</label>
                <input v-model="activityForm.name" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" required />
              </div>

              <div>
                <label class="text-sm font-semibold">Frais d'inscription (FCFA)</label>
                <input v-model.number="activityForm.registration_fee" type="number" min="0" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
              </div>
              <div>
                <label class="text-sm font-semibold" :class="{ 'opacity-60': activityForm.subscription_only }">Ticket journalier (FCFA)</label>
                <input
                  v-model.number="activityForm.daily_ticket_price"
                  type="number"
                  min="0"
                  :disabled="activityForm.subscription_only"
                  class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3 disabled:opacity-60"
                />
              </div>
              <div>
                <label class="text-sm font-semibold">Abonnement mensuel (FCFA)</label>
                <input v-model.number="activityForm.monthly_price" type="number" min="0" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
              </div>
              <div>
                <label class="text-sm font-semibold">Abonnement trimestriel (FCFA)</label>
                <input v-model.number="activityForm.quarterly_price" type="number" min="0" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
              </div>
              <div>
                <label class="text-sm font-semibold">Abonnement semestriel (FCFA)</label>
                <input v-model.number="activityForm.semester_price" type="number" min="0" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
              </div>
              <div>
                <label class="text-sm font-semibold">Abonnement annuel (FCFA)</label>
                <input v-model.number="activityForm.yearly_price" type="number" min="0" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
              </div>

              <div class="md:col-span-2 rounded-2xl bg-[#EEF4F2] p-4 space-y-3">
                <label class="text-sm font-semibold block">Couleur de la card</label>
                <div class="flex items-center gap-3">
                  <input v-model="activityForm.color" type="color" class="h-11 w-14 rounded-lg border border-input bg-white p-1" />
                  <div class="flex items-center gap-2 flex-wrap">
                    <button
                      v-for="preset in colorPresets"
                      :key="preset"
                      type="button"
                      class="h-7 w-7 rounded-full border-2"
                      :style="{ backgroundColor: preset, borderColor: activityForm.color === preset ? '#24342F' : '#ffffff' }"
                      @click="activityForm.color = preset"
                    ></button>
                  </div>
                </div>
                <label class="flex items-center gap-2 text-sm">
                  <input v-model="activityForm.subscription_only" type="checkbox" class="accent-[#3E524D]" />
                  Réservé aux abonnés uniquement (pas de ticket journalier)
                </label>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 border-t">
              <button type="button" @click="isActivityModalOpen = false" class="h-10 px-4 rounded-full border border-input">Annuler</button>
              <button type="submit" class="h-10 px-5 rounded-full bg-[#3E524D] text-white font-semibold hover:bg-[#32423E]">
                {{ editingActivityId ? 'Mettre à jour' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="isSubscriptionModalOpen" class="fixed inset-0 z-60 flex items-center justify-center p-4 sm:p-6">
      <div class="fixed inset-0 bg-black/70" @click="isSubscriptionModalOpen = false"></div>
      <div class="z-50 bg-background rounded-3xl shadow-lg border w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        <div class="p-6 border-b flex items-start justify-between gap-4">
          <div>
            <h2 class="text-[42px] leading-10 font-bold text-[#2F413D]">Nouvel Abonnement</h2>
            <p class="text-base text-muted-foreground mt-2">
              Inscrire un membre à l'activité : <span class="font-semibold text-[#D49A50]">{{ selectedActivity?.name }}</span>
            </p>
          </div>
          <button @click="isSubscriptionModalOpen = false" class="text-muted-foreground hover:text-foreground">
            <X class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="handleSubscriptionSubmit" class="p-6 overflow-y-auto space-y-5">
          <div class="rounded-2xl bg-[#EEF4F2] p-3 flex gap-2">
            <button
              type="button"
              @click="subscriptionForm.clientMode = 'existing'"
              class="flex-1 h-11 rounded-xl font-semibold transition-colors"
              :class="subscriptionForm.clientMode === 'existing' ? 'bg-[#3E524D] text-white' : 'bg-white text-[#354844]'"
            >
              Client existant
            </button>
            <button
              type="button"
              @click="subscriptionForm.clientMode = 'new'"
              class="flex-1 h-11 rounded-xl font-semibold transition-colors"
              :class="subscriptionForm.clientMode === 'new' ? 'bg-[#3E524D] text-white' : 'bg-white text-[#354844]'"
            >
              Nouveau client
            </button>
          </div>

          <div v-if="subscriptionForm.clientMode === 'existing'">
            <label class="text-sm font-semibold">Choisir un membre</label>
            <select v-model.number="subscriptionForm.client_id" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" required>
              <option :value="0" disabled>Sélectionnez un membre</option>
              <option v-for="client in clients" :key="client.id" :value="client.id">
                {{ client.first_name }} {{ client.last_name }}{{ client.phone ? ` - ${client.phone}` : '' }}
                {{ client.subscription_status === 'ACTIVE' ? '(ACTIF)' : '' }}
              </option>
            </select>
            
            <div v-if="selectedClient?.subscription_status === 'ACTIVE'" class="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <Info class="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p class="text-sm font-bold text-amber-900">Ce membre est déjà actif</p>
                <p class="text-xs text-amber-700 italic">Un nouvel abonnement prolongera ou remplacera l'actuel.</p>
              </div>
            </div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold">Prénom</label>
              <input v-model="subscriptionForm.first_name" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" required />
            </div>
            <div>
              <label class="text-sm font-semibold">Nom</label>
              <input v-model="subscriptionForm.last_name" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" required />
            </div>
            <div>
              <label class="text-sm font-semibold">Email</label>
              <input v-model="subscriptionForm.email" type="email" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
            </div>
            <div>
              <label class="text-sm font-semibold">Téléphone</label>
              <input v-model="subscriptionForm.phone" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
            </div>
            <div class="md:col-span-2">
              <label class="text-sm font-semibold">Adresse (optionnelle)</label>
              <input v-model="subscriptionForm.address" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold">Type d'abonnement</label>
              <select v-model="subscriptionForm.subscription_type" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3">
                <option v-for="option in subscriptionTypeOptions" :key="option.value" :value="option.value">
                  {{ option.label }} ({{ formatNumber(option.price) }} FCFA)
                </option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold">Mode de paiement</label>
              <select v-model="subscriptionForm.payment_method" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3">
                <option value="CASH">Espèces</option>
                <option value="CARD">Carte</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
              </select>
            </div>
          </div>

          <div class="rounded-2xl bg-[#EFF2F1] p-4 space-y-3">
            <label class="flex items-center gap-3 text-base font-medium text-[#31423E]">
              <input v-model="subscriptionForm.only_registration_today" type="checkbox" class="accent-[#3E524D] h-5 w-5" />
              Facturer uniquement les frais d'inscription aujourd'hui
            </label>
            <label class="flex items-center gap-3 text-base font-medium text-[#31423E]">
              <input
                v-model="subscriptionForm.include_registration_fee"
                type="checkbox"
                class="accent-[#3E524D] h-5 w-5"
                :disabled="subscriptionForm.only_registration_today || subscriptionForm.waive_registration_fee"
              />
              Inclure les frais d'inscription dans le paiement
            </label>
            <label class="flex items-center gap-3 text-base font-medium text-[#31423E]">
              <input v-model="subscriptionForm.waive_registration_fee" type="checkbox" class="accent-[#3E524D] h-5 w-5" />
              Offrir les frais d'inscription
            </label>
          </div>

          <div class="rounded-2xl border border-[#D8E3DF] bg-[#F7FBF9] p-4 text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Abonnement choisi:</span>
              <span class="font-semibold">{{ formatNumber(subscriptionForm.only_registration_today ? 0 : selectedSubscriptionPrice) }} FCFA</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Frais d'inscription:</span>
              <span class="font-semibold">{{ formatNumber(registrationFeeDue) }} FCFA</span>
            </div>
            <div class="flex justify-between pt-2 border-t text-base">
              <span class="font-bold">Total à encaisser:</span>
              <span class="font-bold text-[#D49A50]">{{ formatNumber(totalDue) }} FCFA</span>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-3 border-t">
            <button type="button" @click="isSubscriptionModalOpen = false" class="h-10 px-6 rounded-full border border-input">Annuler</button>
            <button type="submit" class="h-10 px-7 rounded-full bg-[#D9A05B] text-white font-semibold hover:bg-[#C69152]">Valider l'abonnement</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit2, HeartPulse, Info, Plus, Trash2, X } from 'lucide-vue-next';
import { useActivitiesLogic } from '../hooks/useActivitiesLogic';

const {
  loading, activities, clients, isAdmin, isCashierOrAdmin,
  isActivityModalOpen, editingActivityId, activityForm,
  isSubscriptionModalOpen, subscriptionForm,
  colorPresets, formatNumber, isSubscriptionOnly, 
  activityColor, activityBadgeStyle,
  selectedActivity, selectedClient, subscriptionTypeOptions,
  selectedSubscriptionPrice, registrationFeeDue, totalDue,
  openActivityModal, handleEdit, handleActivitySubmit, handleDelete,
  openSubscriptionModal, goToActivityDetails, handleSubscriptionSubmit
} = useActivitiesLogic();
</script>
