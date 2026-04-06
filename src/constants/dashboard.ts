import type { ChartOptions } from "chart.js";
import type { DashboardPeriodId } from "../types/dashboard";

export const DASHBOARD_PERIODS: ReadonlyArray<{
  id: DashboardPeriodId;
  label: string;
}> = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
  { id: "all", label: "Global" },
];

export const DASHBOARD_PERIOD_SUBLABELS: Record<DashboardPeriodId, string> = {
  day: "aujourd'hui",
  week: "de la semaine",
  month: "du mois",
  year: "de l'année",
  all: "depuis le début",
};

export const INITIAL_WEEKLY_STATS: number[] = [0, 0, 0, 0, 0, 0, 0];

export const INITIAL_CHART_DATA = {
  labels: [] as string[],
  datasets: [] as {
    fill: boolean;
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
    pointRadius: number;
    pointBackgroundColor: string;
    pointBorderWidth: number;
    borderWidth: number;
  }[],
};

export const DASHBOARD_CHART_OPTIONS: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        font: { size: 10, weight: "bold" },
      },
    },
    tooltip: {
      mode: "index",
      intersect: false,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      titleColor: "#2C3E3A",
      bodyColor: "#2C3E3A",
      borderColor: "#eee",
      borderWidth: 1,
      padding: 10,
      boxPadding: 5,
    },
  },
  scales: {
    y: {
      display: true,
      grid: { color: "rgba(0,0,0,0.03)" },
      ticks: { font: { size: 9 } },
    },
    x: {
      grid: { display: false },
      ticks: { font: { size: 10, weight: "bold" } },
    },
  },
};
