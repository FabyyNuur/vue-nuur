import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: JSON.parse(localStorage.getItem('nuurgym_user') || 'null'),
        token: localStorage.getItem('nuurgym_token') || null,
        loading: false,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login(credentials: any) {
            this.loading = true;
            try {
                const response = await api.post('/users/login', credentials);
                this.token = response.data.token;
                this.user = response.data.user;
                localStorage.setItem('nuurgym_token', this.token!);
                localStorage.setItem('nuurgym_user', JSON.stringify(this.user));
                return true;
            } catch (error) {
                console.error('Login failed', error);
                throw error;
            } finally {
                this.loading = false;
            }
        },
        logout() {
            this.user = null;
            this.token = null;
            localStorage.removeItem('nuurgym_token');
            localStorage.removeItem('nuurgym_user');
        },
        async fetchUser() {
            if (!this.token) return;
            try {
                // If there's an endpoint to get the current user, call it here
                // For now, if we have a token, we assume the persisted user is valid
                // or we could add a verify token endpoint
            } catch (error) {
                this.logout();
            }
        }
    }
});
