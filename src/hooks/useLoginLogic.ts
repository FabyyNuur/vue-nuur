import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import {
  LOGIN_DEFAULT_EMAIL,
  LOGIN_DEFAULT_PASSWORD,
  LOGIN_ERROR_INVALID,
} from '../constants/login';

export function useLoginLogic() {
  const email = ref(LOGIN_DEFAULT_EMAIL);
  const password = ref(LOGIN_DEFAULT_PASSWORD);
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
        error.value = LOGIN_ERROR_INVALID;
      }
    } catch (_err: unknown) {
      error.value = LOGIN_ERROR_INVALID;
    } finally {
      loading.value = false;
    }
  };

  const showPassword = ref(false);

  return {
    email, password, error, loading, showPassword, handleLogin
  };
}
