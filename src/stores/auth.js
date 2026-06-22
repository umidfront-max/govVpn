import { defineStore } from 'pinia'

// Демо-учётные данные (замените на реальный API).
const DEMO = { email: 'admin@govpn.uz', password: 'govpn' }

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem('govpn_user') || 'null')
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: loadUser(),
  }),
  getters: {
    isAuthenticated: (s) => !!s.user,
  },
  actions: {
    async login(email, password) {
      // Имитация сетевого запроса.
      await new Promise((r) => setTimeout(r, 650))
      const ok =
        email.trim().toLowerCase() === DEMO.email && password === DEMO.password
      if (!ok) {
        return { ok: false, error: 'Неверный email или пароль' }
      }
      this.user = {
        name: 'Mega Admin',
        email: DEMO.email,
        role: 'root',
        location: 'Tashkent',
      }
      localStorage.setItem('govpn_user', JSON.stringify(this.user))
      return { ok: true }
    },
    logout() {
      this.user = null
      localStorage.removeItem('govpn_user')
    },
  },
})
