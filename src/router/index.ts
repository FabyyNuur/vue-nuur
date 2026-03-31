import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("../layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("../pages/Dashboard.vue"),
        meta: { roles: ['ADMIN', 'CAISSIER', 'CONTROLLER', 'CONTROLEUR'] },
      },
      {
        path: "activities",
        name: "Activities",
        component: () => import("../pages/Activities.vue"),
        meta: { roles: ['ADMIN', 'CAISSIER', 'CONTROLLER', 'CONTROLEUR'] },
      },
      {
        path: "activities/:id",
        name: "ActivityDetails",
        component: () => import("../pages/ActivityDetails.vue"),
        meta: { roles: ['ADMIN', 'CAISSIER', 'CONTROLLER', 'CONTROLEUR'] },
      },
      {
        path: "clients",
        name: "Clients",
        component: () => import("../pages/Clients.vue"),
        meta: { roles: ['ADMIN', 'CAISSIER'] },
      },
      {
        path: "ticketing",
        name: "Ticketing",
        component: () => import("../pages/Ticketing.vue"),
        meta: { roles: ['ADMIN', 'CAISSIER'] },
      },
      {
        path: "scanner",
        name: "Scanner",
        component: () => import("../pages/Scanner.vue"),
        meta: { roles: ['ADMIN', 'CONTROLLER', 'CONTROLEUR'] },
      },
      {
        path: "treasury",
        name: "Treasury",
        component: () => import("../pages/Treasury.vue"),
        meta: { roles: ['ADMIN', 'CAISSIER'] },
      },
      {
        path: "users",
        name: "Users",
        component: () => import("../pages/Users.vue"),
        meta: { roles: ['ADMIN'] },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login");
  } else if (to.meta.requiresAuth && authStore.isAuthenticated) {
    const userRole = authStore.user?.role?.toUpperCase() || '';
    
    // Check if route has roles restricted and user is not authorized
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
        if (!to.meta.roles.includes(userRole)) {
            next("/"); // Redirect to dashboard if not authorized
            return;
        }
    }
    next();
  } else {
    next();
  }
});

export default router;
