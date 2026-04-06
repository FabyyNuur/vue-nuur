import type { TicketFilter, TicketGenerateForm } from "../types/ticketing";

export const DEFAULT_TICKET_GENERATE_FORM: TicketGenerateForm = {
  activity_id: "",
  quantity: 1,
  payment_method: "cash",
  validity_option: "end_of_day",
};

export const DEFAULT_TICKET_FILTER: TicketFilter = "today";

export const UNKNOWN_ACTIVITY_LABEL = "Activité Inconnue";

export const TICKET_EMPTY_STATE_LABELS: Record<TicketFilter, string> = {
  expired: "Aucun ticket expiré",
  all: "Aucun ticket trouvé",
  active: "Aucun ticket actif",
  used: "Aucun ticket utilisé",
  today: "Aucun ticket vendu aujourd'hui",
};

export const COPY_FEEDBACK_MS = 2000;

export const TICKET_ISSUE_ERROR_PREFIX =
  "Erreur lors de l'émission du ticket";
