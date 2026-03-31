import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

export type SubscriptionDetail = {
  subscription_id: number;
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
  end_date: string;
  status: string;
  last_access_at?: string | null;
};

export type TicketDetail = {
  ticket_id: number;
  price: number;
  valid_until: string;
  status: string;
  last_access_at?: string | null;
};

export function useActivityDetailsLogic() {
  const route = useRoute();
  const router = useRouter();

  const loading = ref(true);
  const activity = ref<any>(null);
  const subscriptions = ref<SubscriptionDetail[]>([]);
  const tickets = ref<TicketDetail[]>([]);
  const metrics = ref({
    subscribers_count: 0,
    active_subscribers_count: 0,
    tickets_count: 0,
  });

  const activityId = computed(() => Number(route.params.id));

  const formatNumber = (num: number | null | undefined) => Number(num || 0).toLocaleString('fr-FR');

  const formatDate = (value?: string | null) => {
    if (!value) {
      return 'N/A';
    }
    return new Date(value).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) {
      return 'Aucun accès';
    }
    return new Date(value).toLocaleString('fr-FR');
  };

  const isSubActive = (item: SubscriptionDetail) => item.status === 'ACTIVE' && new Date(item.end_date) > new Date();

  const isTicketValid = (item: TicketDetail) => {
    if (item.status !== 'VALID') return false;
    return new Date(item.valid_until) > new Date();
  };

  const fetchDetails = async () => {
    if (!activityId.value) {
      loading.value = false;
      return;
    }

    try {
      const response = await api.get(`/activities/${activityId.value}/details`);
      activity.value = response.data.data.activity;
      subscriptions.value = response.data.data.subscriptions;
      tickets.value = response.data.data.tickets;
      metrics.value = response.data.data.metrics;
    } catch (error) {
      activity.value = null;
    } finally {
      loading.value = false;
    }
  };

  const goBack = () => {
    router.push('/activities');
  };

  const goToNewSubscription = () => {
    if (!activityId.value) {
      return;
    }

    router.push({
      path: '/activities',
      query: { subscribeActivityId: String(activityId.value) },
    });
  };

  onMounted(() => {
    fetchDetails();
  });

  const authStore = useAuthStore();
  const isCashierOrAdmin = computed(() => {
    const role = authStore.user?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'CAISSIER';
  });

  return {
    loading, activity, subscriptions, tickets, metrics, isCashierOrAdmin,
    formatNumber, formatDate, formatDateTime,
    isSubActive, isTicketValid,
    goBack, goToNewSubscription
  };
}
