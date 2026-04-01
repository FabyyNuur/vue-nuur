import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { isAxiosError } from 'axios';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';
import { isTicketSaleActivityActive } from '../types/ticketing';

export type Activity = {
  id: number;
  name: string;
  registration_fee: number;
  daily_ticket_price: number;
  weekly_price?: number | null;
  monthly_price: number | null;
  quarterly_price: number | null;
  semester_price: number | null;
  yearly_price: number | null;
  subscription_only: boolean | number;
  is_active?: boolean | number;
  color?: string | null;
};

export type Client = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  subscription_status?: string;
};

export type DeactivateImpactRow = {
  subscription_id: number;
  client_id: number;
  first_name: string;
  last_name: string;
  start_date: string;
  end_date: string;
  amount_paid: number;
  estimated_refund_fcfa: number;
  note?: string | null;
};

export type DeactivateImpactData = {
  affected_subscriptions: DeactivateImpactRow[];
  total_estimated_refund_fcfa: number;
  affected_count: number;
  disclaimer: string;
};

export function useActivitiesLogic() {
  const fallbackColor = '#F36F6F';
  const colorPresets = ['#F36F6F', '#4F46E5', '#63D1BE', '#D9A05B', '#22C55E', '#0EA5E9'];

  const loading = ref(true);
  const activities = ref<Activity[]>([]);
  const clients = ref<Client[]>([]);
  const route = useRoute();
  const router = useRouter();

  const isActivityModalOpen = ref(false);
  const editingActivityId = ref<number | null>(null);

  const activityForm = ref({
    name: '',
    registration_fee: 0,
    daily_ticket_price: 0,
    monthly_price: 0,
    quarterly_price: 0,
    semester_price: 0,
    yearly_price: 0,
    subscription_only: false,
    is_active: true,
    color: fallbackColor,
  });

  const isSubscriptionModalOpen = ref(false);
  const selectedActivityId = ref<number | null>(null);
  const subscriptionForm = ref({
    clientMode: 'existing' as 'existing' | 'new',
    client_id: 0,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    subscription_type: 'monthly',
    payment_method: 'CASH',
    only_registration_today: false,
    include_registration_fee: true,
    waive_registration_fee: false,
    discount_percent: 0,
  });

  const formatNumber = (num: number | null | undefined) => Number(num || 0).toLocaleString('fr-FR');

  const isSubscriptionOnly = (activity: Activity) => Boolean(activity.subscription_only);

  const activityColor = (activity: Activity) => {
    if (activity.color && activity.color.trim()) {
      return activity.color;
    }
    return fallbackColor;
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const normalized = hex.replace('#', '');
    const value = normalized.length === 3
      ? normalized.split('').map((char) => char + char).join('')
      : normalized;
    const intValue = parseInt(value, 16);
    const r = (intValue >> 16) & 255;
    const g = (intValue >> 8) & 255;
    const b = intValue & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const activityBadgeStyle = (activity: Activity) => {
    const color = activityColor(activity);
    return {
      backgroundColor: hexToRgba(color, 0.15),
      border: `1px solid ${hexToRgba(color, 0.35)}`,
    };
  };

  const selectedActivity = computed(() => activities.value.find((item) => item.id === selectedActivityId.value) || null);
  const selectedClient = computed(() => clients.value.find(c => c.id === subscriptionForm.value.client_id) || null);

  const subscriptionTypeOptions = computed(() => {
    if (!selectedActivity.value) {
      return [{ value: 'monthly', label: 'Mensuel', price: 0 }];
    }

    const options = [
      { value: 'monthly', label: 'Mensuel', price: Number(selectedActivity.value.monthly_price || 0) },
      { value: 'quarterly', label: 'Trimestriel', price: Number(selectedActivity.value.quarterly_price || 0) },
      { value: 'semester', label: 'Semestriel', price: Number(selectedActivity.value.semester_price || 0) },
      { value: 'yearly', label: 'Annuel', price: Number(selectedActivity.value.yearly_price || 0) },
    ].filter((option) => option.price > 0);

    return options.length ? options : [{ value: 'monthly', label: 'Mensuel', price: 0 }];
  });

  const selectedSubscriptionPrice = computed(() => {
    const selectedType = subscriptionTypeOptions.value.find((option) => option.value === subscriptionForm.value.subscription_type);
    return selectedType ? selectedType.price : 0;
  });

  const registrationFeeDue = computed(() => {
    if (!selectedActivity.value || subscriptionForm.value.waive_registration_fee) {
      return 0;
    }
    return Number(selectedActivity.value.registration_fee || 0);
  });

  const totalDue = computed(() => {
    let raw = 0;
    if (subscriptionForm.value.only_registration_today) {
      raw = registrationFeeDue.value;
    } else {
      const includeRegistration = subscriptionForm.value.include_registration_fee && !subscriptionForm.value.waive_registration_fee;
      raw = selectedSubscriptionPrice.value + (includeRegistration ? registrationFeeDue.value : 0);
    }
    const discount = Math.min(Math.max(subscriptionForm.value.discount_percent || 0, 0), 100);
    return Math.round(raw * (1 - discount / 100));
  });

  watch(selectedActivity, (activity) => {
    if (!activity) {
      return;
    }

    const hasSelectedType = subscriptionTypeOptions.value.some((option) => option.value === subscriptionForm.value.subscription_type);
    if (!hasSelectedType) {
      subscriptionForm.value.subscription_type = subscriptionTypeOptions.value[0].value;
    }
  });

  watch(() => subscriptionForm.value.waive_registration_fee, (waive) => {
    if (waive) {
      subscriptionForm.value.include_registration_fee = false;
    }
  });

  watch(() => subscriptionForm.value.only_registration_today, (onlyRegistration) => {
    if (onlyRegistration) {
      subscriptionForm.value.include_registration_fee = true;
    }
  });

  watch(() => activityForm.value.subscription_only, (isOnlySubscription) => {
    if (isOnlySubscription) {
      activityForm.value.daily_ticket_price = 0;
    }
  });

  const resetActivityForm = () => {
    activityForm.value = {
      name: '',
      registration_fee: 0,
      daily_ticket_price: 0,
      monthly_price: 0,
      quarterly_price: 0,
      semester_price: 0,
      yearly_price: 0,
      subscription_only: false,
      is_active: true,
      color: fallbackColor,
    };
  };

  const resetSubscriptionForm = () => {
    subscriptionForm.value = {
      clientMode: 'existing',
      client_id: 0,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      subscription_type: subscriptionTypeOptions.value[0]?.value || 'monthly',
      payment_method: 'CASH',
      only_registration_today: false,
      include_registration_fee: true,
      waive_registration_fee: false,
      discount_percent: 0,
    };
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      activities.value = response.data.data;
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      clients.value = response.data.data;
    } catch (error) {
      console.error(error);
    }
  };

  const openSubscriptionModal = (activity: Activity) => {
    if (!isTicketSaleActivityActive(activity)) {
      alert(
        "Cette activité est désactivée. Aucun abonnement n'est possible tant qu'elle n'est pas réactivée.",
      );
      return;
    }
    selectedActivityId.value = activity.id;
    resetSubscriptionForm();
    isSubscriptionModalOpen.value = true;
  };

  const openSubscriptionFromQuery = async () => {
    const subscribeActivityId = Number(route.query.subscribeActivityId);
    if (!subscribeActivityId) {
      return;
    }

    const found = activities.value.find((item) => item.id === subscribeActivityId);
    if (!found) {
      return;
    }

    if (!isTicketSaleActivityActive(found)) {
      alert(
        "Cette activité est désactivée. Aucun abonnement n'est possible tant qu'elle n'est pas réactivée.",
      );
      await router.replace({ path: '/activities', query: {} });
      return;
    }

    openSubscriptionModal(found);
    await router.replace({ path: '/activities' });
  };

  onMounted(async () => {
    await Promise.all([fetchActivities(), fetchClients()]);
    await openSubscriptionFromQuery();
  });

  const openActivityModal = () => {
    editingActivityId.value = null;
    resetActivityForm();
    isActivityModalOpen.value = true;
  };

  const handleEdit = (activity: Activity) => {
    editingActivityId.value = activity.id;
    activityForm.value = {
      name: activity.name,
      registration_fee: Number(activity.registration_fee || 0),
      daily_ticket_price: Number(activity.daily_ticket_price || 0),
      monthly_price: Number(activity.monthly_price || 0),
      quarterly_price: Number(activity.quarterly_price || 0),
      semester_price: Number(activity.semester_price || 0),
      yearly_price: Number(activity.yearly_price || 0),
      subscription_only: Boolean(activity.subscription_only),
      is_active: Boolean(activity.is_active ?? true),
      color: activity.color || fallbackColor,
    };
    isActivityModalOpen.value = true;
  };

  const handleActivitySubmit = async () => {
    const payload = {
      ...activityForm.value,
      color: (activityForm.value.color || fallbackColor).trim(),
      registration_fee: Number(activityForm.value.registration_fee || 0),
      daily_ticket_price: Number(activityForm.value.daily_ticket_price || 0),
      monthly_price: Number(activityForm.value.monthly_price || 0),
      quarterly_price: Number(activityForm.value.quarterly_price || 0),
      semester_price: Number(activityForm.value.semester_price || 0),
      yearly_price: Number(activityForm.value.yearly_price || 0),
      is_active: Boolean(activityForm.value.is_active),
    };

    try {
      if (editingActivityId.value) {
        await api.put(`/activities/${editingActivityId.value}`, payload);
      } else {
        await api.post('/activities', payload);
      }

      await fetchActivities();
      isActivityModalOpen.value = false;
      resetActivityForm();
    } catch (error) {
      const err = error as any;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erreur lors de l'enregistrement de l'activité";
      alert(message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer cette activité ?')) {
      return;
    }

    try {
      await api.delete(`/activities/${id}`);
      await fetchActivities();
    } catch (error) {
      const err = error as any;
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Erreur lors de la suppression';
      alert(message);
    }
  };

  const pendingDeactivateActivity = ref<Activity | null>(null);
  const deactivateImpact = ref<DeactivateImpactData | null>(null);
  const impactLoading = ref(false);
  const impactError = ref<string | null>(null);

  const toggleActivityStatus = async (activity: Activity) => {
    try {
      await api.put(`/activities/${activity.id}`, {
        name: activity.name,
        registration_fee: Number(activity.registration_fee || 0),
        daily_ticket_price: Number(activity.daily_ticket_price || 0),
        weekly_price: Number(activity.weekly_price || 0),
        monthly_price: Number(activity.monthly_price || 0),
        quarterly_price: Number(activity.quarterly_price || 0),
        semester_price: Number(activity.semester_price || 0),
        yearly_price: Number(activity.yearly_price || 0),
        subscription_only: Boolean(activity.subscription_only),
        color: activity.color || fallbackColor,
        is_active: !Boolean(activity.is_active ?? true),
      });
      await fetchActivities();
    } catch (error) {
      const err = error as any;
      alert(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Impossible de changer le statut de l'activité",
      );
    }
  };

  watch(pendingDeactivateActivity, async (activity) => {
    if (!activity) {
      deactivateImpact.value = null;
      impactError.value = null;
      return;
    }
    impactLoading.value = true;
    impactError.value = null;
    deactivateImpact.value = null;
    try {
      const res = await api.get(`/activities/${activity.id}/deactivate-impact`);
      deactivateImpact.value = res.data.data as DeactivateImpactData;
    } catch (error) {
      let msg = "Impossible de charger l'estimation des remboursements.";
      if (isAxiosError(error)) {
        const data = error.response?.data;
        if (data && typeof data === "object") {
          if ("message" in data && typeof data.message === "string")
            msg = data.message;
          else if ("error" in data && typeof data.error === "string")
            msg = data.error;
        } else if (
          error.code === "ERR_NETWORK" ||
          error.message === "Network Error"
        ) {
          msg =
            "Serveur injoignable. Vérifiez que l'API tourne (ex. port 4000) et l'URL dans api.ts.";
        }
      }
      impactError.value = msg;
    } finally {
      impactLoading.value = false;
    }
  });

  const handleToggleStatusClick = async (activity: Activity) => {
    if (!isTicketSaleActivityActive(activity)) {
      await toggleActivityStatus(activity);
      return;
    }
    pendingDeactivateActivity.value = activity;
  };

  const cancelDeactivateActivity = () => {
    pendingDeactivateActivity.value = null;
    deactivateImpact.value = null;
    impactError.value = null;
  };

  const confirmDeactivateActivity = async () => {
    const a = pendingDeactivateActivity.value;
    if (!a) return;
    pendingDeactivateActivity.value = null;
    deactivateImpact.value = null;
    impactError.value = null;
    await toggleActivityStatus(a);
  };

  const goToActivityDetails = (activityId: number) => {
    router.push(`/activities/${activityId}`);
  };

  const handleSubscriptionSubmit = async () => {
    if (!selectedActivity.value) {
      alert("Aucune activité sélectionnée.");
      return;
    }

    const amountPaid = Number(totalDue.value || 0);
    const paymentMethod = subscriptionForm.value.payment_method;

    try {
      if (subscriptionForm.value.clientMode === 'existing') {
        if (!subscriptionForm.value.client_id) {
          alert('Veuillez sélectionner un client existant.');
          return;
        }

        await api.post(`/clients/${subscriptionForm.value.client_id}/subscribe`, {
          activity_id: selectedActivity.value.id,
          amount_paid: amountPaid,
          payment_method: paymentMethod,
          subscription_type: subscriptionForm.value.subscription_type,
        });
      } else {
        if (!subscriptionForm.value.first_name || !subscriptionForm.value.last_name) {
          alert('Le prénom et le nom sont obligatoires.');
          return;
        }

        await api.post('/clients', {
          first_name: subscriptionForm.value.first_name,
          last_name: subscriptionForm.value.last_name,
          email: subscriptionForm.value.email || null,
          phone: subscriptionForm.value.phone || null,
          address: subscriptionForm.value.address || null,
          activity_id: selectedActivity.value.id,
          amount_paid: amountPaid,
          payment_method: paymentMethod,
          subscription_type: subscriptionForm.value.subscription_type,
          include_registration_fee: subscriptionForm.value.include_registration_fee && !subscriptionForm.value.waive_registration_fee,
        });
      }

      await fetchClients();
      isSubscriptionModalOpen.value = false;
      resetSubscriptionForm();
      alert('Abonnement enregistré avec succès.');
    } catch (error) {
      alert("Erreur lors de l'enregistrement de l'abonnement");
    }
  };

  const authStore = useAuthStore();
  const isAdmin = computed(() => authStore.user?.role?.toUpperCase() === 'ADMIN');
  const isCashierOrAdmin = computed(() => {
    const role = authStore.user?.role?.toUpperCase();
    return role === 'ADMIN' || role === 'CAISSIER';
  });

  return {
    loading, activities, clients, isAdmin, isCashierOrAdmin,
    isActivityModalOpen, editingActivityId, activityForm,
    isSubscriptionModalOpen, selectedActivityId, subscriptionForm,
    colorPresets,
    formatNumber, isSubscriptionOnly, activityColor, hexToRgba, activityBadgeStyle,
    selectedActivity, selectedClient, subscriptionTypeOptions,
    selectedSubscriptionPrice, registrationFeeDue, totalDue,
    openActivityModal, handleEdit, handleActivitySubmit, handleDelete,
    openSubscriptionModal, goToActivityDetails, handleSubscriptionSubmit,
    toggleActivityStatus,
    pendingDeactivateActivity,
    deactivateImpact,
    impactLoading,
    impactError,
    handleToggleStatusClick,
    cancelDeactivateActivity,
    confirmDeactivateActivity,
  };
}
