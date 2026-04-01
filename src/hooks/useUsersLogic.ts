import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import { useAuthStore } from '../stores/auth';

export function useUsersLogic() {
  const authStore = useAuthStore();
  const users = ref<any[]>([]);
  const loading = ref(true);
  
  const isUserModalOpen = ref(false);
  const editingUserId = ref<number | null>(null);
  
  const userForm = ref({
    name: '',
    email: '',
    password: '',
    role: 'CONTROLEUR',
    is_active: true,
  });

  const fetchUsers = async () => {
      loading.value = true;
      try {
          const response = await api.get('/users');
          if (response.data && response.data.data) {
              users.value = response.data.data;
          }
      } catch (error) {
          console.error("Erreur de récupération utilisateurs", error);
      } finally {
          loading.value = false;
      }
  };

  onMounted(fetchUsers);

  const searchQuery = ref('');
  const filterRole = ref('');

  const displayUsers = computed(() => {
      let result = users.value;
      
      if (searchQuery.value) {
          const query = searchQuery.value.toLowerCase();
          result = result.filter(user => 
              user.name.toLowerCase().includes(query) || 
              user.email.toLowerCase().includes(query)
          );
      }
      
      if (filterRole.value) {
          result = result.filter(user => user.role === filterRole.value);
      }
      
      return result;
  });

  const formatRole = (role: string) => {
      if (!role) return '';
      const r = role.toLowerCase();
      if (r === 'admin' || r === 'administrateur') return 'Administrateur';
      if (r === 'controller' || r === 'controleur') return 'Contrôleur';
      if (r === 'cashier' || r === 'caissier') return 'Caissier';
      return role;
  };

  const getRoleBadgeClass = (role: string) => {
      if (!role) return '';
      const r = role.toLowerCase();
      if (r === 'admin' || r === 'administrateur') return 'bg-[#3E524D] text-white';
      if (r === 'caissier' || r === 'cashier') return 'bg-[#D9A05B] text-white';
      return 'bg-[#EAF1F1] text-[#3E524D] border border-[#5B8A8A]';
  };

  const showPassword = ref(false);

  const openUserModal = () => {
    editingUserId.value = null;
    userForm.value = {
        name: '', email: '', password: '', role: 'CONTROLEUR', is_active: true
    };
    showPassword.value = false;
    isUserModalOpen.value = true;
  };

  const handleEdit = (user: any) => {
    editingUserId.value = user.id;
    userForm.value = {
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        is_active: Boolean(user.is_active ?? true),
    };
    showPassword.value = false;
    isUserModalOpen.value = true;
  };

  const handleUserSubmit = async () => {
    try {
        if (editingUserId.value) {
            await api.put(`/users/${editingUserId.value}`, userForm.value);
            // alert('Utilisateur mis à jour avec succès');
        } else {
            if (!userForm.value.password) {
                alert('Mot de passe requis pour un nouvel utilisateur');
                return;
            }
            await api.post('/users', userForm.value);
            // alert('Utilisateur créé avec succès');
        }
        isUserModalOpen.value = false;
        fetchUsers();
    } catch (error: any) {
        alert(error.response?.data?.error || error.response?.data?.message || 'Erreur');
    }
  };

  const handleDelete = async (user: any) => {
      if (user.id === authStore.user?.id) {
          alert('Vous ne pouvez pas supprimer votre propre compte.');
          return;
      }
      if (!confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.name} ?`)) return;
      try {
          await api.delete(`/users/${user.id}`);
          fetchUsers();
      } catch (error: any) {
          alert('Erreur lors de la suppression');
      }
  };

  const toggleUserStatus = async (user: any) => {
      if (user.id === authStore.user?.id) {
          alert('Vous ne pouvez pas désactiver votre propre compte.');
          return;
      }
      try {
          await api.put(`/users/${user.id}`, {
              name: user.name,
              email: user.email,
              role: user.role,
              is_active: !Boolean(user.is_active ?? true),
          });
          fetchUsers();
      } catch (error: any) {
          alert(error.response?.data?.error || error.response?.data?.message || 'Erreur');
      }
  };

  /** Utilisateur en attente de confirmation pour désactivation (modal). */
  const pendingDeactivateUser = ref<any | null>(null);

  const handleToggleUserStatus = (user: any) => {
      if (user.id === authStore.user?.id) {
          alert('Vous ne pouvez pas désactiver votre propre compte.');
          return;
      }
      const isActive = Boolean(user.is_active ?? true);
      if (isActive) {
          pendingDeactivateUser.value = user;
          return;
      }
      void toggleUserStatus(user);
  };

  const cancelDeactivateConfirm = () => {
      pendingDeactivateUser.value = null;
  };

  const confirmDeactivateUser = async () => {
      const user = pendingDeactivateUser.value;
      if (!user) return;
      pendingDeactivateUser.value = null;
      await toggleUserStatus(user);
  };

  return {
    loading, displayUsers, formatRole, getRoleBadgeClass,
    isUserModalOpen, editingUserId, userForm, showPassword,
    searchQuery, filterRole,
    pendingDeactivateUser,
    openUserModal, handleEdit, handleUserSubmit, handleDelete,
    handleToggleUserStatus, confirmDeactivateUser, cancelDeactivateConfirm,
  };
}
