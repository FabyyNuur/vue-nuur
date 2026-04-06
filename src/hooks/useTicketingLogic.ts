import { ref, onMounted, computed } from "vue";
import api from "../services/api";
import { getApiErrorMessage } from "../lib/apiError";
import type {
  TicketingActivity,
  TicketFilter,
  TicketGenerateForm,
  TicketRecord,
} from "../types/ticketing";
import {
  COPY_FEEDBACK_MS,
  DEFAULT_TICKET_FILTER,
  DEFAULT_TICKET_GENERATE_FORM,
  TICKET_EMPTY_STATE_LABELS,
  TICKET_ISSUE_ERROR_PREFIX,
  UNKNOWN_ACTIVITY_LABEL,
} from "../constants/ticketing";

export function useTicketingLogic() {
  const activities = ref<TicketingActivity[]>([]);
  const tickets = ref<TicketRecord[]>([]);
  const isDialogOpen = ref(false);
  const issuing = ref(false);
  const selectedTicketData = ref<TicketRecord | null>(null);
  const copied = ref(false);
  const copiedId = ref<string | number | null>(null);

  const copyCode = (ticket: TicketRecord) => {
    navigator.clipboard.writeText(ticket.qr_code).then(() => {
      copiedId.value = ticket.id;
      setTimeout(() => {
        copiedId.value = null;
      }, COPY_FEEDBACK_MS);
    });
  };

  const copyQrCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, COPY_FEEDBACK_MS);
    });
  };

  const formData = ref<TicketGenerateForm>({ ...DEFAULT_TICKET_GENERATE_FORM });

  const ticketFilter = ref<TicketFilter>(DEFAULT_TICKET_FILTER);
  const searchQuery = ref("");
  const dateFrom = ref("");

  const fetchActivities = async () => {
    try {
      const response = await api.get("/activities");
      activities.value = response.data.data ?? [];
    } catch (error) {
      console.error("Erreur activités", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await api.get("/tickets");
      tickets.value = response.data.data ?? [];
    } catch (error) {
      console.error("Erreur tickets", error);
    }
  };

  onMounted(() => {
    void fetchActivities();
    void fetchTickets();
  });

  const availableActivities = computed(() =>
    activities.value.filter(
      (a) =>
        Boolean(a.is_active ?? true) &&
        !a.subscription_only &&
        (a.daily_ticket_price ?? 0) > 0,
    ),
  );

  const selectedActivityObj = computed(() =>
    activities.value.find(
      (a) => String(a.id) === String(formData.value.activity_id),
    ),
  );

  const openModal = () => {
    formData.value = { ...DEFAULT_TICKET_GENERATE_FORM };
    isDialogOpen.value = true;
  };

  const todayTickets = computed(() => {
    const today = new Date().toISOString().split("T")[0];
    return tickets.value.filter((t) => (t.created_at || "").startsWith(today));
  });

  const totalRevenue = computed(() =>
    todayTickets.value.reduce((sum, t) => sum + (t.price || 0), 0),
  );

  const isTicketUsed = (ticket: TicketRecord) =>
    ticket.status === "USED" || Boolean(ticket.used);

  const getActivityName = (id?: string | number | null) => {
    if (id === "" || id === null || id === undefined)
      return UNKNOWN_ACTIVITY_LABEL;
    const act = activities.value.find((a) => String(a.id) === String(id));
    return act ? act.name : UNKNOWN_ACTIVITY_LABEL;
  };

  const isTicketExpired = (ticket: TicketRecord) => {
    if (isTicketUsed(ticket)) return false;
    if (ticket.status === "EXPIRED") return true;
    if (!ticket.valid_until) return false;
    return new Date(ticket.valid_until).getTime() < Date.now();
  };

  const expiredTickets = computed(() =>
    tickets.value.filter((ticket) => isTicketExpired(ticket)),
  );

  const activeTickets = computed(() =>
    tickets.value.filter(
      (ticket) => !isTicketUsed(ticket) && !isTicketExpired(ticket),
    ),
  );

  const usedTickets = computed(() =>
    tickets.value.filter((ticket) => isTicketUsed(ticket)),
  );

  const displayedTickets = computed(() => {
    let base: TicketRecord[];
    if (ticketFilter.value === "expired") base = expiredTickets.value;
    else if (ticketFilter.value === "all") base = tickets.value;
    else if (ticketFilter.value === "active") base = activeTickets.value;
    else if (ticketFilter.value === "used") base = usedTickets.value;
    else base = todayTickets.value;

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase();
      base = base.filter(
        (t) =>
          (t.qr_code || "").toLowerCase().includes(q) ||
          getActivityName(t.activity_id).toLowerCase().includes(q),
      );
    }

    if (dateFrom.value) {
      base = base.filter((t) => (t.created_at || "").startsWith(dateFrom.value));
    }

    return base;
  });

  const emptyStateText = computed(
    () => TICKET_EMPTY_STATE_LABELS[ticketFilter.value],
  );

  const openQRModal = (ticket: TicketRecord) => {
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
      const response = await api.post("/tickets/generate", {
        activity_id: formData.value.activity_id,
        quantity: formData.value.quantity,
        payment_method: formData.value.payment_method,
        validity_option: formData.value.validity_option,
      });

      await fetchTickets();
      isDialogOpen.value = false;

      const payload = response.data?.data as TicketRecord[] | undefined;
      if (payload && payload.length > 0) {
        selectedTicketData.value = payload[0] ?? null;
      } else if (todayTickets.value.length > 0) {
        selectedTicketData.value = todayTickets.value[0] ?? null;
      }
    } catch (error: unknown) {
      alert(
        `${TICKET_ISSUE_ERROR_PREFIX}: ${getApiErrorMessage(
          error,
          "Une erreur inconnue est survenue.",
        )}`,
      );
    } finally {
      issuing.value = false;
    }
  };

  return {
    tickets,
    isDialogOpen,
    issuing,
    selectedTicketData,
    copied,
    copiedId,
    formData,
    ticketFilter,
    searchQuery,
    dateFrom,
    availableActivities,
    selectedActivityObj,
    todayTickets,
    totalRevenue,
    expiredTickets,
    activeTickets,
    usedTickets,
    displayedTickets,
    emptyStateText,
    copyCode,
    copyQrCode,
    openModal,
    isTicketUsed,
    getActivityName,
    isTicketExpired,
    openQRModal,
    printQR,
    sendWhatsApp,
    handleSubmit,
  };
}
