import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

export function useTicketingLogic() {
  const activities = ref<any[]>([]);
  const tickets = ref<any[]>([]);
  const isDialogOpen = ref(false);
  const issuing = ref(false);
  const selectedTicketData = ref<any>(null);
  const copied = ref(false);
  const copiedId = ref<string | number | null>(null);

  const copyCode = (ticket: any) => {
    navigator.clipboard.writeText(ticket.qr_code).then(() => {
      copiedId.value = ticket.id;
      setTimeout(() => { copiedId.value = null; }, 2000);
    });
  };

  const copyQrCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
    });
  };

  const formData = ref({
    activity_id: '',
    quantity: 1,
    payment_method: 'cash',
    validity_option: 'end_of_day'
  });

  const ticketFilter = ref<'today' | 'all' | 'active' | 'used' | 'expired'>('today');
  const searchQuery = ref('');
  const dateFrom = ref('');

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      activities.value = response.data.data;
    } catch (error) {
      console.error("Erreur activités", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets');
      tickets.value = response.data.data || [];
    } catch (error) {
      console.error("Erreur tickets", error);
    }
  };

  onMounted(() => {
    fetchActivities();
    fetchTickets();
  });

  const availableActivities = computed(() => {
    return activities.value.filter(a => !a.subscription_only && a.daily_ticket_price > 0);
  });

  const selectedActivityObj = computed(() => {
    return activities.value.find(a => a.id === formData.value.activity_id);
  });

  const openModal = () => {
    formData.value = {
      activity_id: '',
      quantity: 1,
      payment_method: 'cash',
      validity_option: 'end_of_day'
    };
    isDialogOpen.value = true;
  };

  const todayTickets = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return tickets.value.filter(t => (t.created_at || '').startsWith(today));
  });

  const totalRevenue = computed(() => {
    return todayTickets.value.reduce((sum, t) => sum + (t.price || 0), 0);
  });

  const isTicketUsed = (ticket: any) => {
    return ticket.status === 'USED' || Boolean(ticket.used);
  };

  const getActivityName = (id: string | number) => {
    if (!id) return 'Activité Inconnue';
    const act = activities.value.find(a => String(a.id) === String(id));
    return act ? act.name : 'Activité Inconnue';
  };

  const isTicketExpired = (ticket: any) => {
    if (isTicketUsed(ticket)) return false;
    if (ticket.status === 'EXPIRED') return true;
    if (!ticket.valid_until) return false;
    return new Date(ticket.valid_until).getTime() < Date.now();
  };

  const expiredTickets = computed(() => {
    return tickets.value.filter((ticket) => isTicketExpired(ticket));
  });

  const activeTickets = computed(() => {
    return tickets.value.filter((ticket) => !isTicketUsed(ticket) && !isTicketExpired(ticket));
  });

  const usedTickets = computed(() => {
    return tickets.value.filter((ticket) => isTicketUsed(ticket));
  });

  const displayedTickets = computed(() => {
    let base: any[];
    if (ticketFilter.value === 'expired') base = expiredTickets.value;
    else if (ticketFilter.value === 'all') base = tickets.value;
    else if (ticketFilter.value === 'active') base = activeTickets.value;
    else if (ticketFilter.value === 'used') base = usedTickets.value;
    else base = todayTickets.value;

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      base = base.filter((t) =>
        (t.qr_code || '').toLowerCase().includes(q) ||
        getActivityName(t.activity_id).toLowerCase().includes(q)
      );
    }

    if (dateFrom.value) {
      base = base.filter((t) => (t.created_at || '').startsWith(dateFrom.value));
    }

    return base;
  });

  const emptyStateText = computed(() => {
    if (ticketFilter.value === 'expired') return 'Aucun ticket expiré';
    if (ticketFilter.value === 'all') return 'Aucun ticket trouvé';
    if (ticketFilter.value === 'active') return 'Aucun ticket actif';
    if (ticketFilter.value === 'used') return 'Aucun ticket utilisé';
    return "Aucun ticket vendu aujourd'hui";
  });

  const openQRModal = (ticket: any) => {
    selectedTicketData.value = ticket;
  };

  const printQR = () => {
    alert("Impression du ticket...");
  };

  const sendWhatsApp = () => {
    alert("QR Code envoyé par WhatsApp");
  };

  const handleSubmit = async () => {
    if (!formData.value.activity_id) return;
    issuing.value = true;
    
    try {
      const response = await api.post('/tickets/generate', { 
        activity_id: formData.value.activity_id,
        quantity: formData.value.quantity,
        payment_method: formData.value.payment_method,
        validity_option: formData.value.validity_option
      });
      
      await fetchTickets();
      isDialogOpen.value = false;
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        selectedTicketData.value = response.data.data[0];
      } else if(todayTickets.value.length > 0) {
        selectedTicketData.value = todayTickets.value[0]; 
      }
      
    } catch (error: any) {
      alert("Erreur lors de l'émission du ticket: " + (error.response?.data?.message || error.message));
    } finally {
      issuing.value = false;
    }
  };

  return {
    tickets, isDialogOpen, issuing, selectedTicketData, copied, copiedId,
    formData, ticketFilter, searchQuery, dateFrom, availableActivities,
    selectedActivityObj, todayTickets, totalRevenue, expiredTickets,
    activeTickets, usedTickets, displayedTickets, emptyStateText,
    copyCode, copyQrCode, openModal, isTicketUsed, getActivityName,
    isTicketExpired, openQRModal, printQR, sendWhatsApp, handleSubmit
  };
}
