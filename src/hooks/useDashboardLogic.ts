import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

export function useDashboardLogic() {
  const stats = ref<any>(null);
  const loading = ref(true);
  const selectedPeriod = ref('day');

  const periods = [
    { id: 'day', label: 'Jour' },
    { id: 'week', label: 'Semaine' },
    { id: 'month', label: 'Mois' },
    { id: 'year', label: 'Année' },
    { id: 'all', label: 'Global' }
  ];

  const chartData = ref<any>({
    labels: [],
    datasets: []
  });

  const weeklyStats = ref<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const fetchStats = async () => {
    loading.value = true;
    try {
      const response = await api.get(`/dashboard?period=${selectedPeriod.value}`);
      stats.value = response.data.stats;
      
      if (response.data.chartData) {
        chartData.value = {
          labels: response.data.chartData.monthly.labels,
          datasets: [
            {
              fill: true,
              label: 'Membres',
              data: response.data.chartData.monthly.members,
              borderColor: '#3E524D',
              backgroundColor: 'rgba(62, 82, 77, 0.05)',
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#fff',
              pointBorderWidth: 2,
              borderWidth: 3
            },
            {
              fill: true,
              label: 'Revenus',
              data: response.data.chartData.monthly.revenues,
              borderColor: '#D9A05B',
              backgroundColor: 'rgba(217, 160, 91, 0.1)',
              tension: 0.4,
              pointRadius: 4,
              pointBackgroundColor: '#fff',
              pointBorderWidth: 2,
              borderWidth: 3
            }
          ]
        };
        weeklyStats.value = response.data.chartData.weekly;
      }
      
      if (response.data.recentLogs) {
        stats.value.recentLogs = response.data.recentLogs;
      }
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const changePeriod = (id: string) => {
    selectedPeriod.value = id;
    fetchStats();
  };

  onMounted(() => {
    fetchStats();
  });

  const currentDate = computed(() => {
    return new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  });

  const periodLabel = computed(() => {
    switch (selectedPeriod.value) {
      case 'day': return "aujourd'hui";
      case 'week': return "de la semaine";
      case 'month': return "du mois";
      case 'year': return "de l'année";
      case 'all': return "depuis le début";
      default: return "";
    }
  });

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { 
        position: 'top',
        labels: {
          usePointStyle: true,
          font: { size: 10, weight: 'bold' }
        }
      }, 
      tooltip: { 
        mode: 'index', 
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#2C3E3A',
        bodyColor: '#2C3E3A',
        borderColor: '#eee',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5
      } 
    },
    scales: {
      y: { 
        display: true, 
        grid: { color: 'rgba(0,0,0,0.03)' },
        ticks: { font: { size: 9 } }
      },
      x: { 
        grid: { display: false }, 
        ticks: { font: { size: 10, weight: 'bold' } } 
      }
    }
  };

  const formatCFA = (val: number) => {
    return new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return {
    stats, loading, selectedPeriod, periods, chartData, weeklyStats,
    currentDate, periodLabel, chartOptions, formatCFA, formatDate, changePeriod
  };
}
