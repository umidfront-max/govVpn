import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', {
  state: () => ({
    globalSearch: '',
    period: 'day', // 'day' | 'week' | 'month'
    sidebarOpen: false,
  }),
})
