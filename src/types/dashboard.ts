export type DashboardPeriodId = "day" | "week" | "month" | "year" | "all";

export interface DashboardScanLog {
  is_valid?: boolean;
  details?: string;
  scanned_at?: string;
}

/** Stats renvoyées par l’API dashboard (champs utilisés dans Dashboard.vue) */
export interface DashboardStats {
  periodIncome?: number;
  periodExpense?: number;
  ticketsSold?: number;
  newMembers?: number;
  activeMembers?: number;
  totalIncome?: number;
  caisseBalance?: number;
  recentLogs?: DashboardScanLog[];
}

export interface DashboardChartPayload {
  labels?: string[];
  revenues?: number[];
  values?: number[];
  expenses?: number[];
}

/** Réponse JSON brute de GET /dashboard?period=… */
export interface DashboardApiPayload {
  stats?: DashboardStats | null;
  chart?: DashboardChartPayload;
  recentLogs?: unknown[];
}

export interface DashboardChartVm {
  labels: string[];
  datasets: {
    fill?: boolean;
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension?: number;
    pointRadius?: number;
    pointBackgroundColor?: string;
    pointBorderWidth?: number;
    borderWidth?: number;
  }[];
}
