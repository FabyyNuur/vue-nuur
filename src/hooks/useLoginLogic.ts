import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

export function useLoginLogic() {
  const email = ref('admin@nuurgym.com');
  const password = ref('admin123');
  const error = ref('');
  const loading = ref(false);
  const authStore = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    loading.value = true;
    error.value = '';
    try {
      const success = await authStore.login({ email: email.value, password: password.value });
      if (success) {
        router.push('/');
      } else {
        error.value = "Email ou mot de passe incorrect";
      }
    } catch (err: any) {
      error.value = "Email ou mot de passe incorrect";
    } finally {
      loading.value = false;
    }
  };

  const showPassword = ref(false);

  return {
    email, password, error, loading, showPassword, handleLogin
  };
}
