<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-[#2C3E3A]">Membres</h1>
        <p class="text-muted-foreground mt-1">Gestion des clients de Nuur GYM</p>
      </div>
      <button
        @click="openModal()"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#3E524D] text-primary-foreground hover:bg-[#2d3d39] h-10 py-2 px-4"
      >
        <Plus class="h-4 w-4 mr-2" />
        Nouveau Membre
      </button>
    </div>

    <!-- Search -->
    <div class="flex gap-4">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher un membre..."
          class="flex h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" @click="isModalOpen = false"></div>
      <div class="z-50 bg-background rounded-lg shadow-lg border w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex flex-col space-y-1.5 p-6 border-b">
          <h2 class="text-lg font-semibold leading-none tracking-tight">Inscription d'un nouveau membre</h2>
          <p class="text-sm text-muted-foreground">Enregistrez les informations et configurez l'abonnement</p>
        </div>
        <div class="p-6 overflow-y-auto flex-1">
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium leading-none">Prénom</label>
                <input v-model="formData.first_name" type="text" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2" required />
              </div>
              <div>
                <label class="text-sm font-medium leading-none">Nom</label>
                <input v-model="formData.last_name" type="text" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2" required />
              </div>
              <div>
                <label class="text-sm font-medium leading-none">Email</label>
                <input v-model="formData.email" type="email" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2" />
              </div>
              <div>
                <label class="text-sm font-medium leading-none">Téléphone</label>
                <input v-model="formData.phone" type="text" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2" required />
              </div>
              <div class="col-span-2">
                <label class="text-sm font-medium leading-none">Adresse</label>
                <input v-model="formData.address" type="text" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2" required placeholder="Quartier, Ville/Région" />
              </div>
              <div class="col-span-2 space-y-4 pt-2 border-t">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold">Type de souscription</label>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" v-model="formData.subscription_mode" value="pack" class="accent-[#3E524D]" />
                      <span class="text-sm font-medium">Pack Complet</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" v-model="formData.subscription_mode" value="custom" class="accent-[#3E524D]" />
                      <span class="text-sm font-medium">Par activité(s)</span>
                    </label>
                  </div>
                </div>

                <div v-if="formData.subscription_mode === 'pack'" class="p-3 bg-[#EAF1F1] rounded-lg border border-[#8FABA6] text-[#3E524D]">
                  <p class="text-xs">Accès à <strong>toutes les activités</strong> du club.</p>
                  <p class="text-xs mt-1">Frais: 15 000 FCFA (Inscription) + 30 000 FCFA / mois</p>
                </div>

                <div v-else class="space-y-2">
                  <label class="text-sm font-medium">Sélectionner les activités</label>
                  <div class="grid grid-cols-2 gap-2 mt-2">
                    <label v-for="a in activities.filter(act => act.name !== 'Pack Complet')" :key="a.id" class="flex items-center gap-2 p-2 rounded border hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" :value="a.id" v-model="formData.selected_activity_ids" class="accent-[#3E524D]" />
                      <span class="text-xs">{{ a.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-sm font-medium leading-none">Durée</label>
                    <select v-model="formData.duration_months" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2">
                      <option value="1">1 mois</option>
                      <option value="3">Trimestre (3 mois)</option>
                      <option value="6">Semestre (6 mois)</option>
                      <option value="12">Année (12 mois)</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-sm font-medium leading-none">Mode de paiement</label>
                    <select v-model="formData.payment_method" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2">
                      <option value="CASH">Espèces</option>
                      <option value="CARD">Carte</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>
                  </div>
                </div>

                <div class="p-4 rounded-xl border bg-slate-50 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Frais d'inscription:</span>
                    <span class="font-medium">{{ formatNumberLocal(calculatedRegFee) }} FCFA</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Abonnement ({{ formData.duration_months }} mois):</span>
                    <span class="font-medium">{{ formatNumberLocal(calculatedSubFee) }} FCFA</span>
                  </div>
                  <div class="flex justify-between pt-2 border-t text-lg font-bold text-[#2C3E3A]">
                    <span>Total à payer:</span>
                    <span>{{ formatNumberLocal(formTotalDue) }} FCFA</span>
                  </div>
                  <div class="flex justify-between text-[11px] text-muted-foreground pt-1">
                    <span>Date d'expiration prévue:</span>
                    <span class="font-semibold text-[#D9A05B]">{{ formExpirationDate }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-6 border-t mt-6">
              <button type="button" @click="isModalOpen = false" class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent hover:bg-accent h-10 px-4 py-2">Annuler</button>
              <button type="submit" class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-[#3E524D] text-primary-foreground hover:bg-[#2d3d39] h-10 px-4 py-2">Inscrire</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <div v-if="qrClient" class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div class="fixed inset-0 bg-black/85 backdrop-blur-md" @click="qrClient = null"></div>
      
      <div class="z-[70] bg-[#1A1A1A] w-full max-w-[340px] rounded-[24px] shadow-2xl relative border border-white/10 animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
        
        <div class="bg-gradient-to-br from-[#3E524D] to-[#2C3E3A] p-6 text-center border-b border-white/5 relative">
          <div class="absolute top-0 right-0 p-4">
             <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <p class="text-xs font-bold text-[#D9A05B] tracking-[4px] uppercase mb-1">Pass Membre</p>
          <h2 class="text-2xl font-black text-white tracking-tight">NUUR <span class="text-[#D9A05B]">GYM</span></h2>
        </div>

        <div class="p-8 flex flex-col items-center">
          <div class="relative group">
            <div class="absolute -inset-4 bg-[#D9A05B]/10 rounded-[28px] blur-xl group-hover:bg-[#D9A05B]/20 transition-all"></div>
            
            <div class="p-5 bg-white rounded-2xl shadow-xl relative border-4 border-[#3E524D]/10">
              <qrcode-vue :value="qrClient.qr_code || qrClient.client_code" :size="180" level="H" :render-as="'svg'" />
            </div>
          </div>

          <div class="mt-8 text-center space-y-2 flex flex-col items-center">
            <h3 class="text-xl font-bold text-white">{{ qrClient.first_name }} {{ qrClient.last_name }}</h3>
            <div class="flex items-center gap-2 bg-white/5 py-1 px-3 rounded-full border border-white/10 group/id cursor-pointer" @click="copyToClipboard(qrClient.qr_code || qrClient.client_code)">
              <p class="text-[11px] font-mono text-slate-400 tracking-widest uppercase">ID: {{ (qrClient.qr_code || qrClient.client_code || '').substring(0, 8).toUpperCase() }}</p>
              <Copy v-if="!copied" class="w-3 h-3 text-slate-600 group-hover/id:text-[#D9A05B] transition-colors" />
              <Check v-else class="w-3 h-3 text-emerald-500 animate-in zoom-in" />
            </div>
          </div>

          <div class="w-full mt-8 grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
            <div class="text-center border-r border-white/5">
              <p class="text-[9px] text-slate-500 uppercase tracking-tighter mb-1">Abonnement</p>
              <p class="text-xs font-bold text-white truncate max-w-[120px]">{{ qrClient.activity_name || 'Tout accès' }}</p>
            </div>
            <div class="text-center">
              <p class="text-[9px] text-slate-500 uppercase tracking-tighter mb-1">Expire le</p>
              <p class="text-xs font-bold text-[#D9A05B]">{{ formatDate(qrClient.subscription_end_date) }}</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-black/40 flex flex-col gap-2">
          <button
            class="flex items-center justify-center gap-2 rounded-xl text-sm font-bold bg-[#25D366] text-white hover:bg-[#1fb855] h-12 transition-all shadow-lg active:scale-95"
            @click="sendWhatsapp(qrClient)"
          >
            <Phone class="w-4 h-4" /> Partager sur WhatsApp
          </button>
          <button 
            @click="qrClient = null"
            class="text-[11px] text-slate-500 hover:text-white transition-colors py-2 font-medium uppercase tracking-widest"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>

    <div v-if="editClient" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" @click="editClient = null"></div>
      <div class="z-50 bg-background rounded-lg shadow-lg border w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center justify-between p-6 border-b">
          <div>
            <h2 class="text-lg font-semibold leading-none tracking-tight">Modifier le membre</h2>
            <p class="text-sm text-muted-foreground mt-1">{{ editClient.first_name }} {{ editClient.last_name }}</p>
          </div>
          <button @click="editClient = null" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        <form @submit.prevent="handleSave" class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium leading-none">Prénom</label>
              <input v-model="editForm.first_name" type="text" required class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label class="text-sm font-medium leading-none">Nom</label>
              <input v-model="editForm.last_name" type="text" required class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label class="text-sm font-medium leading-none">Email</label>
              <input v-model="editForm.email" type="email" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div>
              <label class="text-sm font-medium leading-none">Téléphone</label>
              <input v-model="editForm.phone" type="text" required class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div class="col-span-2">
              <label class="text-sm font-medium leading-none">Adresse</label>
              <input v-model="editForm.address" type="text" required class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>

            <div class="col-span-2 space-y-4 pt-4 border-t">
                <div class="flex items-center justify-between">
                  <div>
                    <label class="text-sm font-semibold">Type d'abonnement</label>
                    <p class="text-[10px] text-muted-foreground">Modifier réinitialisera l'expiration</p>
                  </div>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" v-model="editForm.subscription_mode" value="pack" class="accent-[#3E524D]" />
                      <span class="text-sm font-medium">Pack Complet</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer">
                      <input type="radio" v-model="editForm.subscription_mode" value="custom" class="accent-[#3E524D]" />
                      <span class="text-sm font-medium">Par activité(s)</span>
                    </label>
                  </div>
                </div>

                <div v-if="editForm.subscription_mode === 'pack'" class="p-3 bg-[#EAF1F1] rounded-lg border border-[#8FABA6] text-[#3E524D]">
                  <p class="text-xs">Accès à <strong>toutes les activités</strong>.</p>
                  <p class="text-xs mt-1">Frais: 15 000 FCFA (Inscription) + 30 000 FCFA / mois</p>
                </div>

                <div v-else class="space-y-2">
                  <label class="text-sm font-medium">Activités sélectionnées</label>
                  <div class="grid grid-cols-2 gap-2 mt-2">
                    <label v-for="a in activities.filter(act => act.name !== 'Pack Complet')" :key="a.id" class="flex items-center gap-2 p-2 rounded border hover:bg-slate-50 cursor-pointer">
                      <input type="checkbox" :value="a.id" v-model="editForm.selected_activity_ids" class="accent-[#3E524D]" />
                      <span class="text-xs">{{ a.name }}</span>
                    </label>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label class="block mb-1.5 uppercase tracking-wider text-muted-foreground">Durée</label>
                    <select v-model="editForm.duration_months" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="1">1 mois</option>
                      <option value="3">Trimestre</option>
                      <option value="6">Semestre</option>
                      <option value="12">Année</option>
                    </select>
                  </div>
                  <div>
                    <label class="block mb-1.5 uppercase tracking-wider text-muted-foreground">Paiement</label>
                    <select v-model="editForm.payment_method" class="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      <option value="CASH">Espèces</option>
                      <option value="CARD">Carte</option>
                      <option value="MOBILE_MONEY">Mobile Money</option>
                    </select>
                  </div>
                </div>

                <div class="p-3 rounded-xl border bg-slate-50 flex justify-between items-center">
                  <div class="text-[11px] text-muted-foreground">
                    <p>Total estimé (incl. Inscription si modifiée):</p>
                    <p class="font-bold text-[#D9A05B] text-base">{{ formatNumberLocal(editTotalDue) }} FCFA</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[10px] text-muted-foreground leading-tight">Nouvelle fin prévue :</p>
                    <p class="text-sm font-semibold text-[#2C3E3A] whitespace-nowrap">{{ editExpirationDate }}</p>
                  </div>
                </div>
            </div>
          </div>
          <p v-if="saveError" class="text-sm text-red-600">{{ saveError }}</p>
          <p v-if="saveSuccess" class="text-sm text-emerald-600">✓ Modifications enregistrées !</p>
          <div class="flex justify-end gap-2 pt-4 border-t">
            <button type="button" @click="editClient = null" class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-input bg-transparent hover:bg-accent h-10 px-4 py-2">Annuler</button>
            <button type="submit" :disabled="saving" class="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium bg-[#3E524D] text-white hover:bg-[#2d3d39] h-10 px-4 py-2 disabled:opacity-50">
              <RefreshCw v-if="saving" class="w-4 h-4 animate-spin" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="client in filteredClients"
        :key="client.id"
        class="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
        :class="detailClient?.id === client.id ? 'ring-2 ring-[#3E524D]' : ''"
        @click="selectDetail(client)"
      >
        <div class="p-6 pb-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md bg-gradient-to-br shrink-0"
                :class="isSubscriptionValid(client.subscription_end_date) ? 'from-[#5B8A8A] to-[#8FABA6]' : 'from-gray-400 to-gray-500'"
              >
                <User class="h-6 w-6" />
              </div>
              <div>
                <h3 class="text-lg font-semibold leading-tight text-[#2C3E3A]">
                  {{ client.first_name }} {{ client.last_name }}
                </h3>
                <div
                  class="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-transparent text-white"
                  :class="isSubscriptionValid(client.subscription_end_date) ? 'bg-[#5B8A8A]' : 'bg-red-500'"
                >
                  {{ isSubscriptionValid(client.subscription_end_date) ? 'Actif' : 'Expiré' }}
                </div>
              </div>
            </div>
            <div class="flex gap-1.5 shrink-0" @click.stop>
              <button
                @click="openEdit(client)"
                class="inline-flex items-center justify-center h-8 w-8 rounded-md border text-[#2C3E3A] hover:bg-[#EAF1F1] transition-colors"
                title="Modifier"
              >
                <Pencil class="h-3.5 w-3.5" />
              </button>
              <button
                @click="qrClient = client"
                class="inline-flex items-center justify-center h-8 w-8 rounded-md border border-[#D9A05B] text-[#D9A05B] hover:bg-[#D9A05B] hover:text-white transition-colors"
                title="QR Code"
              >
                <QrCode class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div class="px-6 pb-5 space-y-2 text-sm">
          <div class="flex items-center gap-2 text-muted-foreground" v-if="client.email">
            <Mail class="h-4 w-4 shrink-0" />
            <span class="truncate">{{ client.email }}</span>
          </div>
          <div class="flex items-center gap-2 text-muted-foreground" v-if="client.phone">
            <Phone class="h-4 w-4 shrink-0" />
            <span>{{ client.phone }}</span>
          </div>
          <div class="pt-2 border-t space-y-1">
            <div class="flex justify-between">
              <span class="text-muted-foreground">Activité:</span>
              <span class="font-semibold text-[#2C3E3A]">{{ client.activity_name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">Expire le:</span>
              <span class="font-semibold" :class="isSubscriptionValid(client.subscription_end_date) ? 'text-[#2C3E3A]' : 'text-red-600'">
                {{ formatDate(client.subscription_end_date) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="slide-fade">
      <div v-if="detailClient" class="rounded-xl border bg-card text-card-foreground shadow-lg">
        <div class="flex items-center justify-between p-6 border-b">
          <div class="flex items-center gap-4">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg bg-gradient-to-br"
              :class="isSubscriptionValid(detailClient.subscription_end_date) ? 'from-[#3E524D] to-[#5B8A8A]' : 'from-gray-400 to-gray-500'"
            >
              <User class="h-8 w-8" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-[#2C3E3A]">{{ detailClient.first_name }} {{ detailClient.last_name }}</h3>
              <p class="text-sm text-muted-foreground mt-0.5">{{ detailClient.email || 'Pas d\'email' }}</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="openEdit(detailClient)"
              class="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-medium bg-[#3E524D] text-white hover:bg-[#2d3d39] transition-colors"
            >
              <Pencil class="h-4 w-4" /> Modifier
            </button>
            <button
              @click="detailClient = null"
              class="inline-flex items-center justify-center h-9 w-9 rounded-md border hover:bg-slate-50 transition-colors"
            >
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <div class="p-6 grid md:grid-cols-3 gap-6">
          <div class="space-y-3">
            <h4 class="text-xs font-semibold text-[#2C3E3A] uppercase tracking-wider">Informations</h4>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <User class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-xs text-muted-foreground">Nom complet</p>
                <p class="text-sm font-medium text-[#2C3E3A]">{{ detailClient.first_name }} {{ detailClient.last_name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50" v-if="detailClient.email">
              <Mail class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-xs text-muted-foreground">Email</p>
                <p class="text-sm font-medium text-[#2C3E3A]">{{ detailClient.email }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50" v-if="detailClient.phone">
              <Phone class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-xs text-muted-foreground">Téléphone</p>
                <p class="text-sm font-medium text-[#2C3E3A]">{{ detailClient.phone }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-semibold text-[#2C3E3A] uppercase tracking-wider">Abonnement</h4>
              <button 
                @click="openHistory(detailClient.id)"
                class="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#3E524D] hover:text-[#2d3d39] transition-colors uppercase tracking-wider"
              >
                <History class="w-3 h-3" /> Voir l'historique
              </button>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <Activity class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-xs text-muted-foreground">Activité</p>
                <p class="text-sm font-medium text-[#2C3E3A]">{{ detailClient.activity_name || 'N/A' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <CalendarDays class="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p class="text-xs text-muted-foreground">Date d'expiration</p>
                <p class="text-sm font-medium" :class="isSubscriptionValid(detailClient.subscription_end_date) ? 'text-[#2C3E3A]' : 'text-red-600'">
                  {{ formatDate(detailClient.subscription_end_date) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3 p-3 rounded-lg" :class="isSubscriptionValid(detailClient.subscription_end_date) ? 'bg-emerald-50' : 'bg-red-50'">
              <CheckCircle2 v-if="isSubscriptionValid(detailClient.subscription_end_date)" class="h-4 w-4 text-emerald-500 shrink-0" />
              <XCircle v-else class="h-4 w-4 text-red-500 shrink-0" />
              <div>
                <p class="text-xs text-muted-foreground">Statut</p>
                <p class="text-sm font-medium" :class="isSubscriptionValid(detailClient.subscription_end_date) ? 'text-emerald-700' : 'text-red-700'">
                  {{ isSubscriptionValid(detailClient.subscription_end_date) ? 'Abonnement actif' : 'Abonnement expiré' }}
                </p>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-xs font-semibold text-[#2C3E3A] uppercase tracking-wider">Code d'accès</h4>
            <div class="flex flex-col items-center gap-3 p-4 rounded-lg bg-slate-50">
              <div class="bg-white p-3 rounded-xl border shadow-sm">
                <qrcode-vue :value="detailClient.client_code" :size="120" level="H" :render-as="'svg'" />
              </div>
              <div class="flex items-center gap-2">
                <p class="text-xs font-mono text-muted-foreground break-all">{{ detailClient.qr_code || detailClient.client_code }}</p>
                <button 
                  @click="copyToClipboard(detailClient.qr_code || detailClient.client_code)"
                  class="p-1.5 rounded-md hover:bg-slate-200 transition-colors"
                  :title="copied ? 'Copié !' : 'Copier le code'"
                >
                  <Check v-if="copied" class="w-3.5 h-3.5 text-emerald-600" />
                  <Copy v-else class="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
              <button
                @click="qrClient = detailClient"
                class="inline-flex items-center gap-2 h-9 px-3 rounded-md text-xs font-medium border border-[#D9A05B] text-[#D9A05B] hover:bg-[#D9A05B] hover:text-white transition-colors w-full justify-center"
              >
                <QrCode class="h-3.5 w-3.5" /> Voir le QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="isHistoryOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/80 backdrop-blur-sm" @click="isHistoryOpen = false"></div>
        <div class="z-[80] bg-white rounded-2xl shadow-2xl border w-full max-w-xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between p-6 border-b">
            <div>
              <h2 class="text-lg font-bold text-[#2C3E3A]">Historique des abonnements</h2>
              <p class="text-xs text-muted-foreground mt-1">Liste chronologique des souscriptions</p>
            </div>
            <button @click="isHistoryOpen = false" class="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            <div v-if="loadingHistory" class="text-center py-10 text-muted-foreground">Chargement...</div>
            <div v-else-if="currentHistory.length === 0" class="text-center py-10 text-muted-foreground text-sm italic">Aucun historique disponible</div>
            <div v-else class="space-y-4">
              <div 
                v-for="sub in currentHistory" 
                :key="sub.id"
                class="relative pl-6 pb-6 border-l-2 last:pb-0"
                :class="isSubscriptionValid(sub.end_date) ? 'border-emerald-500' : 'border-slate-200'"
              >
                <div 
                  class="absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm"
                  :class="isSubscriptionValid(sub.end_date) ? 'bg-emerald-500' : 'bg-slate-300'"
                ></div>
                
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-sm text-[#2C3E3A]">{{ sub.activity_name }}</h4>
                    <span 
                      class="text-[10px] uppercase font-black px-2 py-0.5 rounded"
                      :class="isSubscriptionValid(sub.end_date) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'"
                    >
                      {{ isSubscriptionValid(sub.end_date) ? 'Actif' : 'Terminé' }}
                    </span>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-y-2 text-[11px]">
                    <div>
                      <p class="text-muted-foreground uppercase tracking-tighter text-[9px]">Début</p>
                      <p class="font-semibold">{{ formatDate(sub.start_date) }}</p>
                    </div>
                    <div>
                      <p class="text-muted-foreground uppercase tracking-tighter text-[9px]">Fin</p>
                      <p class="font-semibold">{{ formatDate(sub.end_date) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="p-4 bg-slate-50 border-t flex justify-end">
            <button @click="isHistoryOpen = false" class="px-6 py-2 rounded-xl text-sm font-bold bg-[#3E524D] text-white hover:bg-[#2d3d39] transition-all">Fermer</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import {
  Plus,
  Search,
  QrCode,
  User,
  Mail,
  Phone,
  Pencil,
  X,
  RefreshCw,
  CalendarDays,
  Activity,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  History
} from 'lucide-vue-next';
import { useClientsLogic } from '../hooks/useClientsLogic';

const {
  activities, isModalOpen, searchQuery, qrClient, detailClient,
  editClient, saving, saveError, saveSuccess, isHistoryOpen, currentHistory, loadingHistory,
  formData, editForm, copied, calculatedRegFee, calculatedSubFee, formTotalDue, formExpirationDate,
  editTotalDue, editExpirationDate, filteredClients,
  formatNumberLocal, copyToClipboard, openModal, selectDetail, openEdit, openHistory,
  isSubscriptionValid, formatDate, sendWhatsapp, handleSubmit, handleSave
} = useClientsLogic();
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
