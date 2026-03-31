import { ref, onMounted, computed } from 'vue';
import api from '../services/api';

export function useTreasuryLogic() {
  const transactions = ref<any[]>([]);
  const isDialogOpen = ref(false);
  const filterPeriod = ref('all');
  const filterType = ref('all');
  const searchQuery = ref('');
  const saving = ref(false);

  const normalizeType = (type: string | null | undefined) =>
    String(type || '').toUpperCase();

  const formData = ref({
      type: 'INCOME', // INCOME or EXPENSE
      amount: 0,
      description: '',
      payment_method: 'cash'
  });

  const fetchTreasury = async () => {
      try {
          const response = await api.get('/transactions');
      transactions.value = (response.data.data || []).map((t: any) => ({
        ...t,
        type: normalizeType(t.type)
      }));
      } catch (error) {
          console.error("Erreur de récupération trésorerie", error);
      }
  };

  onMounted(fetchTreasury);

  const openModal = () => {
      formData.value = {
        type: 'INCOME',
        amount: 0,
        description: '',
        payment_method: 'cash'
      };
      isDialogOpen.value = true;
  };

  const handleSubmit = async () => {
      if (formData.value.amount <= 0 || !formData.value.description) return;
      saving.value = true;
      try {
          const response = await api.post('/transactions', {
            type: normalizeType(formData.value.type),
              amount: formData.value.amount,
              description: formData.value.description,
              payment_method: formData.value.payment_method
          });
          
          if (response.data.data) {
            transactions.value.unshift({
              ...response.data.data,
              type: normalizeType(response.data.data.type)
            });
          } else {
              await fetchTreasury();
          }
          
          isDialogOpen.value = false;
      } catch (error: any) {
          const errorMsg = error.response?.data?.message || error.message || "Erreur lors de l'enregistrement de la transaction";
          alert(errorMsg);
          console.error("Erreur transaction:", error);
      } finally {
          saving.value = false;
      }
  };

  const filteredTransactions = computed(() => {
      let filtered = [...transactions.value];

      if (filterPeriod.value === 'today') {
        const now = new Date();
        filtered = filtered.filter((t) => {
          const created = new Date(t.created_at);
          return created.getFullYear() === now.getFullYear()
            && created.getMonth() === now.getMonth()
            && created.getDate() === now.getDate();
        });
      } else if (filterPeriod.value === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter((t) => new Date(t.created_at) >= weekAgo);
      } else if (filterPeriod.value === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter((t) => new Date(t.created_at) >= monthAgo);
      }

      if (filterType.value !== 'all') {
        filtered = filtered.filter((t) => t.type === filterType.value);
      }

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase();
        filtered = filtered.filter((t) =>
          (t.description || '').toLowerCase().includes(q)
        );
      }

      return filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  });

  const stats = computed(() => {
      const totalIncome = filteredTransactions.value
        .filter((t) => normalizeType(t.type) === 'INCOME')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const totalExpense = filteredTransactions.value
        .filter((t) => normalizeType(t.type) === 'EXPENSE')
        .reduce((sum, t) => sum + (t.amount || 0), 0);

      const cashBalance = transactions.value.reduce((balance, t) => {
        if (normalizeType(t.type) === 'INCOME') return balance + (t.amount || 0);
        if (normalizeType(t.type) === 'EXPENSE') return balance - (t.amount || 0);
        return balance;
      }, 0);

      return {
        totalIncome,
        totalExpense,
        cashBalance,
        net: totalIncome - totalExpense,
      };
  });

  const exportData = () => {
      const csvRows = [
        ['Date', 'Type', 'Catégorie', 'Montant', 'Description', 'Mode de paiement']
      ];

      filteredTransactions.value.forEach((t) => {
          csvRows.push([
              new Date(t.created_at).toLocaleString('fr-FR'),
              t.type === 'INCOME' ? 'Recette' : 'Dépense',
              t.type === 'INCOME' ? 'Recette' : 'Dépense',
              t.amount,
              `"${t.description.replace(/"/g, '""')}"`,
              t.payment_method || 'cash'
          ]);
      });

      const csvContent = csvRows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `caisse-nuur-gym-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  };

  return {
    transactions, isDialogOpen, filterPeriod, filterType, searchQuery,
    saving, formData, filteredTransactions, stats,
    openModal, handleSubmit, exportData, fetchTreasury
  };
}
