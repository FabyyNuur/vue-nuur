import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

export function useClientsLogic() {
  const clients = ref<any[]>([]);
  const activities = ref<any[]>([]);
  const isModalOpen = ref(false);
  const searchQuery = ref('');
  const qrClient = ref<any>(null);
  const detailClient = ref<any>(null);
  const editClient = ref<any>(null);
  const saving = ref<boolean>(false);
  const saveError = ref<string>('');
  const saveSuccess = ref(false);
  const isHistoryOpen = ref(false);
  const currentHistory = ref<any[]>([]);
  const loadingHistory = ref(false);
  const originalActivityIds = ref<number[]>([]); // Activités déjà souscrites

  const formData = ref({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    subscription_mode: 'pack' as 'pack' | 'custom',
    selected_activity_ids: [] as number[],
    duration_months: '1',
    payment_method: 'CASH',
    discount_percent: 0,
  });

  const editForm = ref({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    address: '',
    subscription_mode: 'pack' as 'pack' | 'custom',
    selected_activity_ids: [] as number[],
    duration_months: '1',
    payment_method: 'CASH',
    discount_percent: 0,
  });

  const formatNumberLocal = (num: number) => {
      return Number(num || 0).toLocaleString('fr-FR');
  };

  const copied = ref(false);
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  };

  const calculatedRegFee = computed(() => {
    if (formData.value.subscription_mode === 'pack') return 15000;
    
    return formData.value.selected_activity_ids.reduce((sum, id) => {
      const act = activities.value.find(a => a.id === id);
      return sum + (act?.registration_fee || 0);
    }, 0);
  });

  const calculatedSubFee = computed(() => {
    const months = Number(formData.value.duration_months);
    if (formData.value.subscription_mode === 'pack') return 30000 * months;

    return formData.value.selected_activity_ids.reduce((sum, id) => {
      const act = activities.value.find(a => a.id === id);
      let price = act?.monthly_price || 0;
      
      if (months >= 12 && act?.yearly_price) price = act.yearly_price / 12;
      else if (months >= 6 && act?.semester_price) price = act.semester_price / 6;
      else if (months >= 3 && act?.quarterly_price) price = act.quarterly_price / 3;

      return sum + (price * months);
    }, 0);
  });

  const formTotalDue = computed(() => {
    const raw = calculatedRegFee.value + calculatedSubFee.value;
    const discount = Math.min(Math.max(formData.value.discount_percent || 0, 0), 100);
    return Math.round(raw * (1 - discount / 100));
  });

  const formExpirationDate = computed(() => {
    const months = Number(formData.value.duration_months);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  });

  const editRegFee = computed(() => {
    // Pas de frais d'inscription au renouvellement
    if (editForm.value.subscription_mode === 'pack') return 0;
    const newIds = editForm.value.selected_activity_ids.filter(
      (id) => !originalActivityIds.value.includes(id)
    );
    return newIds.reduce((sum, id) => {
      const act = activities.value.find(a => a.id === id);
      return sum + (act?.registration_fee || 0);
    }, 0);
  });

  const editSubFee = computed(() => {
    const months = Number(editForm.value.duration_months);
    // Seulement les NOUVELLES activités
    const newIds = editForm.value.selected_activity_ids.filter(
      (id) => !originalActivityIds.value.includes(id)
    );
    if (editForm.value.subscription_mode === 'pack') return 30000 * months;
    return newIds.reduce((sum, id) => {
      const act = activities.value.find(a => a.id === id);
      let price = act?.monthly_price || 0;
      if (months >= 12 && act?.yearly_price) price = act.yearly_price / 12;
      else if (months >= 6 && act?.semester_price) price = act.semester_price / 6;
      else if (months >= 3 && act?.quarterly_price) price = act.quarterly_price / 3;
      return sum + (price * months);
    }, 0);
  });

  const editTotalDue = computed(() => {
    const raw = editRegFee.value + editSubFee.value;
    const discount = Math.min(Math.max(editForm.value.discount_percent || 0, 0), 100);
    return Math.round(raw * (1 - discount / 100));
  });

  const editExpirationDate = computed(() => {
    const months = Number(editForm.value.duration_months);
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  });

  const openModal = () => {
    formData.value = {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      address: '',
      subscription_mode: 'pack',
      selected_activity_ids: [],
      duration_months: '1',
      payment_method: 'CASH',
      discount_percent: 0,
    };
    isModalOpen.value = true;
  };

  const selectDetail = (client: any) => {
    detailClient.value = detailClient.value?.id === client.id ? null : client;
  };

  const openEdit = (client: any) => {
    editClient.value = client;
    
    const currentIds = client.activity_ids ? String(client.activity_ids).split(',').map(Number) : [];

    const hasPackName = client.activity_name?.toLowerCase().includes('pack');
    const hasAllActivities = currentIds.length > 0 && currentIds.length >= activities.value.length;
    const isPack = hasPackName || hasAllActivities;

    originalActivityIds.value = isPack ? [] : currentIds;
    editForm.value = {
      first_name: client.first_name,
      last_name: client.last_name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      subscription_mode: isPack ? 'pack' : 'custom',
      selected_activity_ids: isPack ? [] : currentIds,
      duration_months: '1',
      payment_method: 'CASH',
      discount_percent: 0,
    };
    saveError.value = '';
    saveSuccess.value = false;
  };

  const openHistory = async (clientId: number) => {
    isHistoryOpen.value = true;
    loadingHistory.value = true;
    try {
      const response = await api.get(`/clients/${clientId}/history`);
      currentHistory.value = response.data.data;
    } catch (error) {
      console.error(error);
    } finally {
      loadingHistory.value = false;
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      clients.value = [];
      clients.value = response.data.data;
      
      if (detailClient.value) {
          const updated = clients.value.find(c => c.id === detailClient.value.id);
          if (updated) detailClient.value = updated;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      activities.value = response.data.data;
    } catch (error) {
      console.error(error);
    }
  };

  onMounted(() => {
    fetchClients();
    fetchActivities();
  });

  const filteredClients = computed(() => {
    if (!searchQuery.value) return clients.value;
    const q = searchQuery.value.toLowerCase();
    return clients.value.filter(c =>
      c.first_name.toLowerCase().includes(q) ||
      c.last_name.toLowerCase().includes(q) ||
      (c.client_code || '').toLowerCase().includes(q)
    );
  });

  const isSubscriptionValid = (endDate: string) => {
    if (!endDate) return false;
    return new Date(endDate) > new Date();
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const sendWhatsapp = (client: any) => {
    alert(`QR Code envoyé par WhatsApp au ${client.phone}`);
  };

  const handleSubmit = async () => {
    try {
      if (formData.value.subscription_mode === 'custom' && formData.value.selected_activity_ids.length === 0) {
          alert("Veuillez sélectionner au moins une activité");
          return;
      }

      const activityIds = formData.value.subscription_mode === 'pack' 
          ? activities.value.map(a => a.id)
          : formData.value.selected_activity_ids;

      const payload = {
        first_name: formData.value.first_name,
        last_name: formData.value.last_name,
        email: formData.value.email,
        phone: formData.value.phone,
        address: formData.value.address,
        activity_id: activityIds,
        amount_paid: formTotalDue.value,
        payment_method: formData.value.payment_method,
        subscription_type: Number(formData.value.duration_months) === 3 ? 'quarterly' : 
                          Number(formData.value.duration_months) === 6 ? 'semester' :
                          Number(formData.value.duration_months) === 12 ? 'yearly' : 'monthly',
        include_registration_fee: true
      };

      await api.post('/clients', payload);
      await fetchClients();
      isModalOpen.value = false;
    } catch (error) {
      alert("Erreur lors de l'inscription");
    }
  };

  const handleSave = async () => {
    saving.value = true;
    saveError.value = '';
    saveSuccess.value = false;
    try {
      if (editForm.value.subscription_mode === 'custom' && editForm.value.selected_activity_ids.length === 0) {
          alert("Veuillez sélectionner au moins une activité");
          saving.value = false;
          return;
      }

      const activityIds = editForm.value.subscription_mode === 'pack'
          ? activities.value.map(a => a.id)
          : editForm.value.selected_activity_ids;

      const payload = {
        first_name: editForm.value.first_name,
        last_name: editForm.value.last_name,
        email: editForm.value.email,
        phone: editForm.value.phone,
        address: editForm.value.address,
        activity_id: activityIds,
        amount_paid: editTotalDue.value,
        payment_method: editForm.value.payment_method,
        subscription_type: Number(editForm.value.duration_months) === 3 ? 'quarterly' : 
                          Number(editForm.value.duration_months) === 6 ? 'semester' :
                          Number(editForm.value.duration_months) === 12 ? 'yearly' : 'monthly',
      };

      await api.put(`/clients/${editClient.value.id}`, payload);
      await fetchClients();

      saveSuccess.value = true;
      setTimeout(() => { editClient.value = null; }, 1200);
    } catch (err: any) {
      saveError.value = err?.response?.data?.message || 'Erreur lors de la sauvegarde.';
    } finally {
      saving.value = false;
    }
  };

  return {
    clients, activities, isModalOpen, searchQuery, qrClient, detailClient,
    editClient, saving, saveError, saveSuccess, isHistoryOpen, currentHistory, loadingHistory,
    formData, editForm, copied, calculatedRegFee, calculatedSubFee, formTotalDue, formExpirationDate,
    editRegFee, editSubFee, editTotalDue, editExpirationDate, filteredClients, originalActivityIds,
    formatNumberLocal, copyToClipboard, openModal, selectDetail, openEdit, openHistory,
    isSubscriptionValid, formatDate, sendWhatsapp, handleSubmit, handleSave
  };
}
