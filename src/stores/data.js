import { defineStore } from 'pinia'
import { tStr } from '@/utils/format'
import { makeServers, makeUsers, makeErrors, makePayments, makeDevices } from '@/data/mock'

export const useDataStore = defineStore('data', {
  state: () => {
    const servers = makeServers()
    const users = makeUsers(servers)
    const errors = makeErrors(servers, users)
    const payments = makePayments(users)
    const devices = makeDevices(users)
    return { servers, users, errors, payments, devices }
  },
  getters: {
    serversTotal: (s) => s.servers.length,
    serversOnline: (s) => s.servers.filter((x) => x.status === 'online').length,
    serversOffline: (s) => s.servers.filter((x) => x.status === 'offline').length,
    serversDegraded: (s) => s.servers.filter((x) => x.status === 'degraded').length,
    networkHealth() {
      if (this.serversOffline > 0) return { color: '#F2706B', label: 'сбой узлов' }
      if (this.serversDegraded > 0) return { color: '#F5984B', label: 'деградация' }
      return { color: '#46CBA2', label: 'в норме' }
    },
    devicesTotal: (s) => s.devices.reduce((a, x) => a + x.devices, 0),
  },
  actions: {
    blockUser(id, reason) {
      const u = this.users.find((x) => x.id === id)
      if (u) {
        u.status = 'blocked'
        u.blockReason = reason
        u.blockedAt = tStr(new Date())
      }
    },
    unblockUser(id) {
      const u = this.users.find((x) => x.id === id)
      if (u) {
        u.status = 'active'
        u.blockReason = null
        u.blockedAt = null
      }
    },
  },
})
