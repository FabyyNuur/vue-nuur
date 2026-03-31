import { ref, onMounted, onUnmounted } from 'vue';
import api from '../services/api';
import { 
  CheckCircle2, 
  XCircle, 
  Activity,
} from 'lucide-vue-next';
import { Html5Qrcode } from 'html5-qrcode';

export function useScannerLogic() {
  const manualCode = ref('');
  const scanResult = ref<any>(null);
  const scanning = ref(false);
  const loadingLogs = ref(false);
  const logs = ref<any[]>([]);
  const activeFilter = ref<'all' | 'valid' | 'refused'>('all');
  const statsValid = ref(0);
  const statsRefused = ref(0);

  const scannerActive = ref(false);
  const permissionError = ref('');
  let html5QrCode: Html5Qrcode | null = null;

  const pagination = ref({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const filters = [
    { value: 'all' as const,     label: 'Tous',       icon: Activity,      activeClass: 'bg-[#2C3E3A] text-white border-[#2C3E3A]' },
    { value: 'valid' as const,   label: 'Autorisés',  icon: CheckCircle2,  activeClass: 'bg-emerald-600 text-white border-emerald-600' },
    { value: 'refused' as const, label: 'Refusés',    icon: XCircle,       activeClass: 'bg-red-600 text-white border-red-600' },
  ];

  const fetchLogs = async () => {
    loadingLogs.value = true;
    try {
      const response = await api.get('/tickets/logs', {
        params: {
          page: pagination.value.page,
          limit: pagination.value.limit,
          filter: activeFilter.value,
        }
      });
      logs.value = response.data.data || [];
      const p = response.data.pagination;
      if (p) {
        pagination.value = { ...pagination.value, ...p };
      }
    } catch (error) {
      console.error("Impossible de charger les logs", error);
    } finally {
      loadingLogs.value = false;
    }
  };

  const fetchStats = async () => {
    try {
      const [validRes, refusedRes] = await Promise.all([
        api.get('/tickets/logs', { params: { filter: 'valid', limit: 1 } }),
        api.get('/tickets/logs', { params: { filter: 'refused', limit: 1 } }),
      ]);
      statsValid.value = validRes.data.pagination?.total || 0;
      statsRefused.value = refusedRes.data.pagination?.total || 0;
    } catch (e) {
      console.error(e);
    }
  };

  const setFilter = (f: 'all' | 'valid' | 'refused') => {
    activeFilter.value = f;
    pagination.value.page = 1;
    fetchLogs();
  };

  const changePage = (p: number) => {
    pagination.value.page = p;
    fetchLogs();
  };

  onMounted(() => {
    fetchLogs();
    fetchStats();
  });

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const handleManualScan = async () => {
    if (!manualCode.value.trim()) return;
    scanning.value = true;
    scanResult.value = null;

    try {
      const response = await api.post('/tickets/scan', { qr_code: manualCode.value.trim() });
      scanResult.value = {
        valid: true,
        message: response.data.message,
      };
      fetchLogs();
      fetchStats();
      setTimeout(() => { scanResult.value = null; }, 4000);
      
      // Auto restart camera after successful scan
      if (!scannerActive.value) {
          setTimeout(startCamera, 1000);
      }
    } catch (err: any) {
      scanResult.value = {
        valid: false,
        message: err?.response?.data?.message || "Erreur de connexion serveur."
      };
      setTimeout(() => { scanResult.value = null; }, 4000);
      if (!scannerActive.value) {
          setTimeout(startCamera, 1000);
      }
    } finally {
      scanning.value = false;
      manualCode.value = '';
    }
  };

  // Camera integration methods
  const startCamera = async () => {
    try {
      permissionError.value = '';
      if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("qr-reader");
      }
      
      // Request permissions & start scanning
      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          manualCode.value = decodedText;
          stopCamera();
          handleManualScan();
        },
        (_errorMessage) => {
          // Ignore parse errors as it might just be trying to focus
        }
      );
      scannerActive.value = true;
    } catch (err: any) {
      permissionError.value = "Accès caméra refusé ou non supporté par votre appareil.";
      scannerActive.value = false;
      console.error("Camera error:", err);
    }
  };

  const stopCamera = async () => {
    if (html5QrCode && scannerActive.value) {
      try {
        await html5QrCode.stop();
        scannerActive.value = false;
      } catch (err) {
        console.error("Erreur arrêt caméra", err);
      }
    }
  };

  onUnmounted(() => {
    stopCamera();
    if (html5QrCode) {
        try {
            html5QrCode.clear();
        } catch(e){}
    }
  });

  return {
    manualCode, scanResult, scanning, loadingLogs, logs, activeFilter,
    statsValid, statsRefused, pagination, filters,
    scannerActive, permissionError,
    startCamera, stopCamera,
    setFilter, changePage, formatTime, formatDate, handleManualScan, fetchLogs
  };
}
