<template>
  <div class="min-h-screen relative flex items-center justify-center overflow-hidden font-sans bg-[#3E524D]">
    <!-- Background Image & Overlay -->
    <div class="absolute inset-0 z-0">
      <img src="../assets/bg-login.png" alt="Gym Background" class="w-full h-full object-cover grayscale-[20%]" />
      <div class="absolute inset-0 bg-gradient-to-br from-black/90 via-black/70 to-[#3E524D]/80"></div>
    </div>

    <!-- Top Navbar -->
    <div class="absolute top-0 left-0 w-full p-6 lg:px-12 flex justify-between items-center z-10">
      <div class="flex items-center gap-2">
        <Dumbbell class="h-6 w-6 text-[#D9A05B]" />
        <div class="text-[#EAF1F1] font-bold tracking-[0.2em] text-sm uppercase">Nuur Gym</div>
      </div>
    </div>

    <!-- Login Form Container inside a Card -->
    <div class="relative z-10 w-full max-w-md px-6">
      <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <!-- Subtle glow effect inside card -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#D9A05B] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

        <!-- Logo & Header -->
        <div class="flex flex-col items-center mb-10 relative z-10">
          <div class="mb-4 bg-white/10 p-4 rounded-2xl border border-white/10 shadow-inner">
            <Dumbbell class="h-10 w-10 text-[#D9A05B]" />
          </div>
          <h1 class="text-[#EAF1F1] text-2xl font-bold tracking-[0.1em] text-center uppercase">
            Espace Staff
          </h1>
          <p class="text-[#EAF1F1]/60 text-sm mt-2 text-center">
            Connectez-vous pour accéder à la gestion
          </p>
        </div>

        <form @submit.prevent="handleLogin" class="w-full relative z-10">
          <div v-if="error" class="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle class="h-5 w-5 flex-shrink-0 text-red-400" />
            <p>{{ error }}</p>
          </div>

          <div class="mb-6 space-y-1.5">
            <label class="block text-[#EAF1F1]/80 text-sm font-medium tracking-wide ml-1">
              Adresse e-mail
            </label>
            <input
              v-model="email"
              type="email"
              placeholder="admin@nuurgym.com"
              class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-[#EAF1F1] focus:ring-2 focus:ring-[#D9A05B]/50 focus:border-[#D9A05B]/50 outline-none transition-all placeholder:text-white/20 font-light"
              required
            />
          </div>

          <div class="mb-4 space-y-1.5">
            <label class="block text-[#EAF1F1]/80 text-sm font-medium tracking-wide ml-1">
              Mot de passe
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 pr-12 text-[#EAF1F1] focus:ring-2 focus:ring-[#D9A05B]/50 focus:border-[#D9A05B]/50 outline-none transition-all placeholder:text-white/20 font-light"
                required
              />
              <button 
                type="button" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="!showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="flex justify-end mb-8">
            <a href="#" class="text-[#D9A05B] text-sm hover:text-[#e4b57b] transition-colors font-medium">
              Mot de passe oublié ?
            </a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-[#D9A05B] hover:bg-[#c68f4d] text-white py-4 rounded-xl font-bold tracking-widest uppercase mb-6 shadow-[0_0_20px_rgba(217,160,91,0.3)] transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>
        
        <div class="mt-6 pt-6 border-t border-white/10 text-center relative z-10 flex flex-col items-center">
          <button 
            type="button"
            @click="showDemoAccounts = !showDemoAccounts"
            class="text-[#EAF1F1]/40 hover:text-[#D9A05B] text-xs font-medium transition-colors flex items-center gap-1.5"
          >
            <Info class="w-3.5 h-3.5" />
            {{ showDemoAccounts ? 'Masquer les identifiants de test' : 'Afficher les identifiants de test' }}
          </button>
          
          <div 
            v-if="showDemoAccounts"
            class="mt-4 flex flex-col gap-1.5 text-[#EAF1F1]/60 text-xs font-light bg-black/20 p-3.5 rounded-xl border border-white/5 w-full text-left"
          >
            <span class="font-medium text-[#EAF1F1]/80 mb-2 border-b border-white/10 pb-2">Comptes de démonstration :</span>
            <div class="flex justify-between items-center group">
               <span>Admin : <span class="text-[#D9A05B] font-mono ml-1">admin@nuurgym.com</span></span>
               <span class="text-white/40 font-mono">admin123</span>
            </div>
            <div class="flex justify-between items-center group">
               <span>Caissier : <span class="text-[#D9A05B] font-mono ml-1">nuur@nuurgym.com</span></span>
               <span class="text-white/40 font-mono">nuur123</span>
            </div>
            <div class="flex justify-between items-center group">
               <span>Contrôleur : <span class="text-[#D9A05B] font-mono ml-1">faby@nuurgym.com</span></span>
               <span class="text-white/40 font-mono">faby123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Dumbbell, AlertCircle, Eye, EyeOff, Info } from 'lucide-vue-next';
import { useLoginLogic } from '../hooks/useLoginLogic';

const { email, password, error, loading, showPassword, handleLogin } = useLoginLogic();
const showDemoAccounts = ref(false);
</script>
