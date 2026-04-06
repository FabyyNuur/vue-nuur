import { ref, onMounted, computed } from "vue";
import api from "../services/api";
import type {
  DashboardApiPayload,
  DashboardChartVm,
  DashboardPeriodId,
  DashboardScanLog,
  DashboardStats,
} from "../types/dashboard";
import {
  DASHBOARD_CHART_OPTIONS,
  DASHBOARD_PERIODS,
  DASHBOARD_PERIOD_SUBLABELS,
  INITIAL_CHART_DATA,
  INITIAL_WEEKLY_STATS,
} from "../constants/dashboard";

export function useDashboardLogic() {
  const stats = ref<DashboardStats | null>(null);
  const loading = ref(true);
  const selectedPeriod = ref<DashboardPeriodId>("day");

  const chartData = ref<DashboardChartVm>({
    labels: [...INITIAL_CHART_DATA.labels],
    datasets: [...INITIAL_CHART_DATA.datasets],
  });

  const weeklyStats = ref<number[]>([...INITIAL_WEEKLY_STATS]);

  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await api.get(`/dashboard?period=${selectedPeriod.value}`);
      const data = response.data as DashboardApiPayload;
      stats.value = data.stats ?? null;

      if (data.chart && data.chart.labels && data.chart.labels.length > 0) {
        const labels = data.chart.labels;
        const revenues = data.chart.revenues ?? data.chart.values ?? [];
        const expenses = data.chart.expenses ?? [];

        chartData.value = {
          labels,
          datasets: [
            {
              fill: true,
              label: "Revenus",
              data: revenues,
              borderColor: "#D9A05B",
              backgroundColor: "rgba(217, 160, 91, 0.15)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#fff",
              pointBorderWidth: 2,
              borderWidth: 3,
            },
            {
              fill: true,
              label: "Dépenses",
              data: expenses,
              borderColor: "#E87A5B",
              backgroundColor: "rgba(232, 122, 91, 0.1)",
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: "#fff",
              pointBorderWidth: 2,
              borderWidth: 3,
            },
          ],
        };

        if (selectedPeriod.value === "week" && revenues.length === 7) {
          const maxVal = Math.max(...revenues, 1);
          weeklyStats.value = revenues.map((v: number) =>
            Math.round((v / maxVal) * 100),
          );
        }
      }

      if (data.recentLogs?.length && stats.value) {
        stats.value.recentLogs = data.recentLogs as DashboardScanLog[];
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const changePeriod = (id: string) => {
    selectedPeriod.value = id as DashboardPeriodId;
    void fetchStats();
  };

  onMounted(() => {
    void fetchStats();
  });

  const currentDate = computed(() =>
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  const periodLabel = computed(
    () => DASHBOARD_PERIOD_SUBLABELS[selectedPeriod.value] ?? "",
  );

  const chartOptions = DASHBOARD_CHART_OPTIONS;

  const formatCFA = (val: number) =>
    new Intl.NumberFormat("fr-FR").format(val) + " FCFA";

  const formatDate = (date?: string) => {
    if (!date) return "";
    const d = new Date(date);
    const day = d.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
    const time = d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} • ${time}`;
  };

  return {
    stats,
    loading,
    selectedPeriod,
    periods: DASHBOARD_PERIODS,
    chartData,
    weeklyStats,
    currentDate,
    periodLabel,
    chartOptions,
    formatCFA,
    formatDate,
    changePeriod,
  };
}
