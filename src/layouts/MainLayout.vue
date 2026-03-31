<template>
  <div class="min-h-screen bg-[#EAF1F1] relative overflow-hidden">
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#5B8A8A]/10 blur-3xl"></div>
      <div class="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#D9A05B]/10 blur-3xl"></div>
    </div>

    <!-- Mobile Header -->
    <div class="lg:hidden bg-white/80 backdrop-blur-md border-b border-white/40 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-2">
        <Dumbbell class="h-6 w-6 text-[#3E524D]" />
        <span class="font-bold text-lg text-[#3E524D]">Nuur GYM</span>
      </div>
      <button
        class="text-[#3E524D] p-2 hover:bg-white/50 rounded-md transition-colors"
        @click="isSidebarOpen = !isSidebarOpen"
      >
        <X v-if="isSidebarOpen" class="h-6 w-6" />
        <Menu v-else class="h-6 w-6" />
      </button>
    </div>

    <div class="flex relative z-10">
      <aside class="hidden lg:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col items-center justify-between w-[88px] py-6 bg-white/40 backdrop-blur-xl border border-white/50 rounded-[44px] shadow-[0_8px_32px_rgba(0,0,0,0.08)] z-40 max-h-[96vh]">
        <div class="flex flex-col items-center gap-6 w-full flex-1 overflow-hidden">
          <div class="text-[#3E524D] mb-1 flex items-center justify-center relative flex-shrink-0">
            <div class="absolute inset-0 bg-gradient-to-tr from-[#D9A05B] to-[#E8C79A] rounded-full blur-sm opacity-50"></div>
            <Dumbbell class="w-8 h-8 relative z-10 text-[#D9A05B]" :stroke-width="2.5" />
          </div>

          <nav class="flex flex-col gap-3 w-full px-4 overflow-y-auto no-scrollbar pb-2">
            <button
              v-for="item in visibleMenuItems"
              :key="item.path"
              :title="item.label"
              @click="navigate(item.path)"
              class="relative w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-[18px] transition-all duration-300 mx-auto group"
              :class="isActive(item.path) ? 'bg-[#D9A05B] text-white shadow-lg shadow-[#D9A05B]/40 scale-105' : 'text-[#5B8A8A] hover:bg-white/60 hover:text-[#3E524D]'"
            >
              <component :is="item.icon" class="w-5 h-5" :stroke-width="isActive(item.path) ? 2.5 : 2" />
              
              <!-- Tooltip on hover -->
              <div class="absolute left-full ml-4 px-3 py-1.5 bg-[#3E524D] text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
                {{ item.label }}
              </div>
            </button>
          </nav>
        </div>

        <div class="flex flex-col gap-3 w-full px-4 mt-4 flex-shrink-0">
          <div class="w-10 h-[1px] bg-white/50 mx-auto mb-1"></div>
          
          <!-- Profile Button -->
          <button 
            title="Profil"
            @click="isProfileModalOpen = true" 
            class="w-12 h-12 flex items-center justify-center rounded-[18px] mx-auto text-[#5B8A8A] hover:bg-[#D9A05B]/10 hover:text-[#D9A05B] transition-all group relative border border-transparent hover:border-[#D9A05B]/30"
          >
            <div class="w-8 h-8 rounded-full bg-[#EAF1F1] flex items-center justify-center font-bold text-sm">
              {{ userInitials }}
            </div>
            <div class="absolute left-full ml-4 px-3 py-1.5 bg-[#3E524D] text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
              Voir mon profil
            </div>
          </button>

          <button 
            title="Déconnexion"
            @click="handleLogout" 
            class="w-12 h-12 flex items-center justify-center rounded-[18px] mx-auto text-red-400 hover:bg-red-50 hover:text-red-500 transition-all group relative"
          >
            <LogOut class="w-5 h-5" :stroke-width="2" />
            <div class="absolute left-full ml-4 px-3 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-xl z-50">
              Déconnexion
            </div>
          </button>
        </div>
      </aside>

      <!-- Mobile Sidebar -->
      <aside
        class="fixed top-0 left-0 h-screen bg-[#EAF1F1]/95 backdrop-blur-xl border-r border-white/50 w-72 z-40 transition-transform duration-300 lg:hidden shadow-2xl flex flex-col"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      >
        <div class="p-6 border-b border-white/50 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="bg-gradient-to-br from-[#D9A05B] to-[#E8C79A] p-2.5 rounded-xl shadow-md">
              <Dumbbell class="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 class="font-bold text-xl text-[#3E524D]">Nuur GYM</h1>
              <p class="text-xs text-[#5B8A8A] font-medium">Gestion Sportive</p>
            </div>
          </div>
        </div>

        <div class="p-5 border-b border-white/50 flex-shrink-0 cursor-pointer hover:bg-white/30 transition-colors" @click="isProfileModalOpen = true; isSidebarOpen = false">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-white/60">
              <span class="text-[#D9A05B] font-bold text-lg">
                {{ userInitials }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-bold truncate text-[#3E524D]">{{ userName }}</p>
              <p class="text-sm text-[#5B8A8A] capitalize font-medium">{{ userRole }}</p>
            </div>
          </div>
        </div>

        <nav class="p-4 space-y-2 flex-1 overflow-y-auto pb-32">
          <button
            v-for="item in visibleMenuItems"
            :key="item.path"
            @click="navigateMobile(item.path)"
            class="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
            :class="isActive(item.path) ? 'bg-[#D9A05B] text-white shadow-md' : 'text-[#5B8A8A] hover:bg-white/60 hover:text-[#3E524D] font-medium'"
          >
            <component :is="item.icon" class="h-5 w-5" :stroke-width="isActive(item.path) ? 2.5 : 2" />
            <span>{{ item.label }}</span>
          </button>
        </nav>

        <div class="absolute bottom-0 left-0 w-full p-5 border-t border-white/50 bg-[#EAF1F1]/90 backdrop-blur-md flex flex-col gap-2">

          <button
            class="w-full flex items-center justify-start text-red-500 hover:text-red-600 hover:bg-red-50/50 font-medium py-3 px-4 rounded-xl transition-colors"
            @click="handleLogout"
          >
            <LogOut class="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- Overlay for mobile -->
      <div
        v-if="isSidebarOpen"
        class="fixed inset-0 bg-[#3E524D]/20 backdrop-blur-sm z-30 lg:hidden"
        @click="isSidebarOpen = false"
      ></div>

      <!-- Main Content -->
      <div class="flex-1 lg:pl-[120px] transition-all">
        <main class="p-4 md:p-6 lg:p-8 lg:pr-12 max-w-[1600px] mx-auto w-full min-h-screen">
          <router-view></router-view>
        </main>
      </div>

      <!-- Profile Modal -->
      <div v-if="isProfileModalOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-[#3E524D]/60 backdrop-blur-sm" @click="isProfileModalOpen = false"></div>
        <div class="z-50 bg-white rounded-3xl shadow-2xl border border-[#EAF1F1] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
          <div class="bg-gradient-to-br from-[#3E524D] to-[#2C3E3A] p-6 text-center relative">
            <button @click="isProfileModalOpen = false" class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
              <X class="w-5 h-5" />
            </button>
            <div class="w-20 h-20 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center mt-2 mb-4">
              <span class="text-3xl font-bold text-[#D9A05B]">{{ userInitials }}</span>
            </div>
            <h2 class="text-xl font-bold text-white">{{ userName }}</h2>
            <p class="text-[#D9A05B] text-sm font-medium mt-1">{{ userRole === 'ADMIN' ? 'Administrateur' : (userRole === 'CAISSIER' ? 'Caissier' : 'Contrôleur') }}</p>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Adresse e-mail</p>
              <p class="text-[#2C3E3A] font-medium">{{ authStore.user?.email || 'Non renseignée' }}</p>
            </div>
            <div class="pt-4 border-t border-[#F0F4F2]">
              <p class="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Droits d'accès</p>
              <p class="text-[#5B8A8A] text-sm font-medium" v-if="userRole === 'ADMIN'">Accès total et configuration.</p>
              <p class="text-[#5B8A8A] text-sm font-medium" v-else-if="userRole === 'CAISSIER'">Gestion de la trésorerie et facturation membres.</p>
              <p class="text-[#5B8A8A] text-sm font-medium" v-else>Contrôle des accès des membres.</p>
            </div>
          </div>
          <div class="p-4 bg-[#F9FBFA] border-t border-[#F0F4F2] flex justify-end">
            <button @click="isProfileModalOpen = false" class="px-5 py-2.5 rounded-full bg-[#EAF1F1] text-[#3E524D] font-semibold hover:bg-[#D7E0DD] transition-colors text-sm">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { 
  LayoutDashboard,
  Activity,
  Ticket,
  ScanLine,
  Wallet,
  Users,
  UserCog,
  LogOut,
  Menu,
  X,
  Dumbbell
} from 'lucide-vue-next';

const isSidebarOpen = ref(false);
const isProfileModalOpen = ref(false);
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const userName = computed(() => authStore.user?.name || '');
const userRole = computed(() => authStore.user?.role?.toUpperCase() || '');
const userInitials = computed(() => (userName.value ? userName.value.charAt(0).toUpperCase() : 'U'));

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: LayoutDashboard, roles: ['ADMIN', 'CAISSIER', 'CONTROLLER', 'CONTROLEUR'] },
  { path: '/activities', label: 'Activités', icon: Activity, roles: ['ADMIN', 'CAISSIER', 'CONTROLLER', 'CONTROLEUR'] },
  { path: '/ticketing', label: 'Billetterie', icon: Ticket, roles: ['ADMIN', 'CAISSIER'] },
  { path: '/scanner', label: 'Contrôle QR', icon: ScanLine, roles: ['ADMIN', 'CONTROLLER', 'CONTROLEUR'] },
  { path: '/treasury', label: 'Caisse', icon: Wallet, roles: ['ADMIN', 'CAISSIER'] },
  { path: '/clients', label: 'Clients', icon: Users, roles: ['ADMIN', 'CAISSIER'] },
  { path: '/users', label: 'Utilisateurs', icon: UserCog, roles: ['ADMIN'] },
];

const visibleMenuItems = computed(() => 
  menuItems.filter((item) => item.roles.includes(userRole.value))
);

const isActive = (path: string) => route.path === path;

const navigate = (path: string) => {
  router.push(path);
};

const navigateMobile = (path: string) => {
  router.push(path);
  isSidebarOpen.value = false;
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
