import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/views/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/users' },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UsersView.vue'),
        meta: { title: 'Пользователи', sub: 'Статистика и управление учётными записями' },
      },
      {
        path: 'sessions',
        name: 'sessions',
        component: () => import('@/views/SessionsView.vue'),
        meta: { title: 'Сессии', sub: 'Текущие подключения, ошибки и журнал' },
      },
      {
        path: 'servers',
        name: 'servers',
        component: () => import('@/views/ServersView.vue'),
        meta: { title: 'Сервера', sub: 'Статус узлов, нагрузка и аптайм' },
      },
      {
        path: 'pay',
        name: 'pay',
        component: () => import('@/views/PaymentsView.vue'),
        meta: { title: 'Оплата', sub: 'Транзакции, подписки и доход' },
      },
      {
        path: 'devices',
        name: 'devices',
        component: () => import('@/views/DevicesView.vue'),
        meta: { title: 'Устройства', sub: 'Статистика по платформам устройств' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/users' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'login' && auth.isAuthenticated) {
    return { path: '/users' }
  }
})

export default router
