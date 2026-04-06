export type TicketFilter = "today" | "all" | "active" | "used" | "expired";

export interface TicketingActivity {
  id: number;
  name: string;
  subscription_only?: boolean;
  is_active?: boolean | number | string;
  daily_ticket_price?: number;
}

export interface TicketRecord {
  id: string | number;
  qr_code: string;
  activity_id?: string | number;
  activity_name?: string;
  status?: string;
  used?: boolean;
  valid_until?: string;
  created_at?: string;
  price?: number;
  payment_method?: string;
}

export interface TicketGenerateForm {
  activity_id: string;
  quantity: number;
  payment_method: string;
  validity_option: string;
}

/** Activité pour laquelle on peut vendre un abonnement (même règle que billetterie). */
export function isTicketSaleActivityActive(
  a: Pick<TicketingActivity, "is_active">,
): boolean {
  const v: unknown = a.is_active;
  if (v === undefined || v === null) return true;
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t === "1" || t === "true";
  }
  return false;
}
