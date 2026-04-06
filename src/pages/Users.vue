<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-[#2C3E3A]">Utilisateurs</h1>
        <p class="text-muted-foreground mt-1">
          Gestion des comptes utilisateurs du personnel
        </p>
      </div>
      <button
        @click="openUserModal()"
        class="inline-flex items-center justify-center rounded-full text-sm font-semibold bg-[#3E524D] text-white hover:bg-[#32423E] h-11 px-6 shadow-sm"
      >
        <Plus class="h-4 w-4 mr-2" />
        Nouvel Utilisateur
      </button>
    </div>

    <!-- Recherche et filtres -->
    <div class="flex flex-col sm:flex-row gap-4 mb-2">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Rechercher par nom ou email..." 
          class="h-11 w-full pl-10 pr-4 rounded-xl border border-input bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B8A8A] transition-all"
        />
      </div>
      <div class="relative sm:w-64">
        <Filter class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <select 
          v-model="filterRole"
          class="h-11 w-full pl-10 pr-10 appearance-none rounded-xl border border-input bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5B8A8A] transition-all cursor-pointer"
        >
          <option value="">Tous les rôles</option>
          <option value="ADMIN">Administrateurs</option>
          <option value="CAISSIER">Caissiers</option>
          <option value="CONTROLEUR">Contrôleurs</option>
        </select>
        <ChevronDown class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    </div>

    <div v-if="loading" class="rounded-xl border bg-white p-8 text-center text-muted-foreground">Chargement...</div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div v-for="user in displayUsers" :key="user.id" class="rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
        <div class="p-6 pb-4 flex items-start gap-4">
          <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0" :class="user.role === 'ADMIN' ? 'bg-[#EAF1F1]' : (user.role === 'CAISSIER' ? 'bg-[#FDF6ED]' : 'bg-[#F2F4F7]')">
            <User class="h-6 w-6" :class="user.role === 'ADMIN' ? 'text-[#3E524D]' : (user.role === 'CAISSIER' ? 'text-[#D9A05B]' : 'text-[#6B7280]')" />
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-lg text-[#2C3E3A] truncate">{{ user.name }}</h3>
            <p class="text-sm text-[#5B8A8A] truncate">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="px-6 py-4 bg-[#F9FBFA] border-t border-[#F0F4F2] flex items-center justify-between">
          <span 
            class="px-3 py-1 text-xs font-bold rounded-full"
            :class="getRoleBadgeClass(user.role)"
          >
            {{ formatRole(user.role) }}
          </span>
          <div class="flex gap-2">
            <button
              @click="handleToggleUserStatus(user)"
              class="rounded-full border px-3 text-[11px] font-semibold"
              :class="Boolean(user.is_active ?? true) ? 'border-[#E6A5A5] text-[#B24747] bg-[#FFF1F1] hover:bg-[#FFE5E5]' : 'border-[#9AD5BC] text-[#1D9C56] bg-[#ECFFF4] hover:bg-[#DFF8EB]'"
            >
              {{ Boolean(user.is_active ?? true) ? 'Suspendre l’accès' : 'Rétablir l’accès' }}
            </button>
            <button
              @click="handleEdit(user)"
              class="w-8 h-8 rounded-full bg-white text-[#5B8A8A] hover:text-[#3E524D] hover:bg-slate-100 flex items-center justify-center border shadow-sm transition-colors"
              title="Modifier"
            >
              <Edit2 class="h-4 w-4" />
            </button>
            <button
              @click="handleDelete(user)"
              class="w-8 h-8 rounded-full bg-white text-[#D14646] hover:text-white hover:bg-[#D14646] flex items-center justify-center border border-red-100 shadow-sm transition-colors"
              title="Supprimer"
            >
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation désactivation -->
    <div v-if="pendingDeactivateUser" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/70 backdrop-blur-[2px]" @click="cancelDeactivateConfirm"></div>
      <div
        class="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#F0E0E0] bg-white shadow-2xl animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deactivate-modal-title"
      >
        <div class="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FFF1F1] opacity-90 blur-2xl pointer-events-none"></div>
        <div class="relative p-8 text-center">
          <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-[#FFE5E5] to-[#FFF8F8] ring-1 ring-[#E6A5A5]/40">
            <UserX class="h-7 w-7 text-[#B24747]" />
          </div>
          <h2 id="deactivate-modal-title" class="text-xl font-bold text-[#2C3E3A]">
            Désactiver ce compte ?
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-[#5B8A8A]">
            <span class="font-semibold text-[#2C3E3A]">{{ pendingDeactivateUser.name }}</span>
            ne pourra plus se connecter jusqu'à ce que vous réactiviez l'accès depuis cette liste.
          </p>
          <div class="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              @click="cancelDeactivateConfirm"
              class="h-11 w-full rounded-full border border-input bg-white px-6 text-sm font-semibold text-[#2C3E3A] shadow-sm transition-colors hover:bg-slate-50 sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="button"
              @click="confirmDeactivateUser"
              class="h-11 w-full rounded-full bg-[#B24747] px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#962828] sm:w-auto"
            >
              Désactiver
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isUserModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/70" @click="isUserModalOpen = false"></div>
      <div class="z-50 bg-white rounded-3xl shadow-xl border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div class="p-6 border-b flex items-start justify-between">
          <div>
            <h2 class="text-2xl font-bold text-[#2C3E3A]">{{ editingUserId ? "Modifier l'utilisateur" : 'Nouvel utilisateur' }}</h2>
            <p class="text-sm text-muted-foreground mt-1">Créez ou modifiez un accès staff</p>
          </div>
          <button @click="isUserModalOpen = false" class="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X class="h-5 w-5" />
          </button>
        </div>

        <form @submit.prevent="handleUserSubmit" class="p-6 space-y-5">
          <div>
            <label class="text-sm font-semibold text-[#2C3E3A]">Nom complet</label>
            <input v-model="userForm.name" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3 focus:outline-none focus:ring-2 focus:ring-[#5B8A8A]" required />
          </div>

          <div>
            <label class="text-sm font-semibold text-[#2C3E3A]">Email de connexion</label>
            <input v-model="userForm.email" type="email" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3 focus:outline-none focus:ring-2 focus:ring-[#5B8A8A]" required />
          </div>

          <div>
            <label class="text-sm font-semibold text-[#2C3E3A]">Mot de passe <span v-if="editingUserId" class="text-xs font-normal text-muted-foreground">(laisser vide pour ne pas changer)</span></label>
            <div class="relative mt-2">
              <input v-model="userForm.password" :type="showPassword ? 'text' : 'password'" class="h-11 w-full rounded-xl border border-input bg-input-background px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#5B8A8A]" :required="!editingUserId" />
              <button 
                type="button" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="!showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label class="text-sm font-semibold text-[#2C3E3A]">Rôle / Profil</label>
            <select v-model="userForm.role" class="mt-2 h-11 w-full rounded-xl border border-input bg-input-background px-3 focus:outline-none focus:ring-2 focus:ring-[#5B8A8A]">
              <option value="ADMIN">Administrateur (accès total)</option>
              <option value="CAISSIER">Caissier (membres & paiements)</option>
              <option value="CONTROLEUR">Contrôleur (scanne & accueil)</option>
            </select>
          </div>
          <label class="flex items-center gap-2 text-sm font-medium text-[#2C3E3A]">
            <input v-model="userForm.is_active" type="checkbox" class="accent-[#3E524D]" />
            Autoriser la connexion
          </label>

          <div class="flex justify-end gap-3 pt-4 border-t">
            <button type="button" @click="isUserModalOpen = false" class="h-10 px-5 rounded-full border border-input text-sm font-medium hover:bg-slate-50 transition-colors">Annuler</button>
            <button type="submit" class="h-10 px-6 rounded-full bg-[#3E524D] text-white text-sm font-semibold hover:bg-[#32423E] transition-colors shadow-sm">
              {{ editingUserId ? 'Enregistrer les modifications' : 'Créer le compte' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { User, UserX, Plus, Edit2, Trash2, X, Eye, EyeOff, Search, Filter, ChevronDown } from 'lucide-vue-next';
import { useUsersLogic } from '../hooks/useUsersLogic';

const { 
    loading, displayUsers, formatRole, getRoleBadgeClass,
    isUserModalOpen, editingUserId, userForm, showPassword,
    searchQuery, filterRole, pendingDeactivateUser,
    openUserModal, handleEdit, handleUserSubmit, handleDelete,
    handleToggleUserStatus, confirmDeactivateUser, cancelDeactivateConfirm,
} = useUsersLogic();
</script>
