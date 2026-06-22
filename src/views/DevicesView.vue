<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import { fmt } from '@/utils/format'
import StatCard from '@/components/ui/StatCard.vue'
import Badge from '@/components/ui/Badge.vue'

const data = useDataStore()
const ui = useUiStore()
const { globalSearch } = storeToRefs(ui)

const TYPE = {
  phone: { label: 'Телефон', color: '#6F86E0' },
  desktop: { label: 'Компьютер', color: '#4FC3D9' },
  router: { label: 'Роутер', color: '#46CBA2' },
}
const typeColor = (t) => TYPE[t]?.color || '#94A0B8'
const typeLabel = (t) => TYPE[t]?.label || t

// ---- period ----
const stPeriod = ref('today')
const stFrom = ref('')
const stTo = ref('')
const fType = ref('')
const fSearch = ref('')

const isoDaysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10)

watch(stPeriod, (v) => {
  if (v === 'custom') {
    if (!stFrom.value) stFrom.value = isoDaysAgo(7)
    if (!stTo.value) stTo.value = isoDaysAgo(0)
  }
})

const mult = computed(() => {
  const p = stPeriod.value
  if (p === 'today') return 1
  if (p === '24h') return 1.15
  if (p === '7d') return 6.4
  if (p === 'month') return Math.max(1, new Date().getDate() * 0.92)
  if (p === 'custom') {
    if (stFrom.value && stTo.value) {
      const days = Math.max(1, Math.round((new Date(stTo.value) - new Date(stFrom.value)) / 86400000) + 1)
      return days * 0.9
    }
    return 1
  }
  return 1
})

// ---- table ----
const list = computed(() => {
  const q = (fSearch.value + ' ' + globalSearch.value).trim().toLowerCase()
  const term = q.split(' ').filter(Boolean)[0] || ''
  const m = mult.value
  return data.devices
    .filter((d) => {
      if (fType.value && d.type !== fType.value) return false
      if (term && !d.os.toLowerCase().includes(term)) return false
      return true
    })
    .map((d) => ({
      ...d,
      sessions: Math.round(d.sessions * m),
      traffic: +(d.traffic * m).toFixed(1),
    }))
})
const totalDev = computed(() => list.value.reduce((a, d) => a + d.devices, 0) || 1)
const maxDev = computed(() => Math.max(...list.value.map((d) => d.devices), 1))

// ---- KPI ----
const kTotal = computed(() => fmt(list.value.reduce((a, d) => a + d.devices, 0)))
const kTop = computed(() => list.value[0]?.os || '—')
const kMobile = computed(() => {
  const tot = list.value.reduce((a, d) => a + d.devices, 0) || 1
  const mob = list.value.filter((d) => d.type === 'phone').reduce((a, d) => a + d.devices, 0)
  return ((mob / tot) * 100).toFixed(0) + '%'
})

function resetFilters() {
  fType.value = fSearch.value = ''
  stPeriod.value = 'today'
}
</script>

<template>
  <div class="animate-fade">
    <!-- KPI -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mb-[18px]">
      <StatCard :value="kTotal" glow="#54C0E6" icon-color="#54C0E6">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#54C0E6" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" /><path d="M11 18h2" />
          </svg>
        </template>
        <template #label>Всего устройств</template>
        <template #trend><span class="text-ok">за период</span></template>
      </StatCard>

      <StatCard :value="kTop" glow="#6F86E0" icon-color="#6F86E0">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#6F86E0" stroke-width="2">
            <path d="M12 2l2.4 6.9H22l-6 4.3 2.3 7-6.3-4.4L5.7 20l2.3-7-6-4.3h7.6z" />
          </svg>
        </template>
        <template #label>Самая популярная</template>
        <template #trend><span class="text-txt3">лидер по числу устройств</span></template>
      </StatCard>

      <StatCard :value="kMobile" glow="#46CBA2" icon-color="#46CBA2">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#46CBA2" stroke-width="2">
            <rect x="7" y="2" width="10" height="20" rx="2" /><path d="M11 18h2" />
          </svg>
        </template>
        <template #label>Доля мобильных</template>
        <template #trend><span class="text-txt3">телефоны от всех</span></template>
      </StatCard>
    </div>

    <!-- table -->
    <div class="card">
      <div class="panel-h">
        <div>
          <h3>Устройства пользователей</h3>
          <div class="text-[12.5px] text-txt2 mt-0.5">
            Какие платформы используются чаще (агрегированная статистика)
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3 mb-3.5">
        <div class="w-[180px]">
          <label class="lbl-cap">Период</label>
          <select v-model="stPeriod" class="fld">
            <option value="today">За сегодня</option>
            <option value="24h">За 24 часа</option>
            <option value="7d">За 7 дней</option>
            <option value="month">С начала месяца</option>
            <option value="custom">Произвольный диапазон…</option>
          </select>
        </div>
        <div v-if="stPeriod === 'custom'" class="w-[150px]">
          <label class="lbl-cap">С</label>
          <input v-model="stFrom" type="date" class="fld" />
        </div>
        <div v-if="stPeriod === 'custom'" class="w-[150px]">
          <label class="lbl-cap">По</label>
          <input v-model="stTo" type="date" class="fld" />
        </div>
        <div class="w-[160px]">
          <label class="lbl-cap">Тип</label>
          <select v-model="fType" class="fld">
            <option value="">Все</option>
            <option value="phone">Телефон</option>
            <option value="desktop">Компьютер</option>
            <option value="router">Роутер</option>
          </select>
        </div>
        <div class="flex-1 min-w-[160px]">
          <label class="lbl-cap">Поиск платформы</label>
          <input v-model="fSearch" class="fld" placeholder="Android, Windows…" />
        </div>
        <button class="btn-ghost btn-sm" @click="resetFilters">Сбросить</button>
        <div class="text-[12px] text-txt2 ml-auto whitespace-nowrap">
          Платформ: <b class="text-txt">{{ fmt(list.length) }}</b>
        </div>
      </div>

      <div class="tbl-wrap overflow-x-auto">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th class="th">Платформа</th>
              <th class="th">Тип</th>
              <th class="th">Устройств</th>
              <th class="th">Пользователей</th>
              <th class="th">Сессий</th>
              <th class="th min-w-[170px]">Доля</th>
              <th class="th">Трафик</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in list" :key="d.os" class="hover:bg-panel/60 transition">
              <td class="td">
                <div class="flex items-center gap-2.5">
                  <span class="w-2 h-2 rounded-[3px] flex-none" :style="{ background: typeColor(d.type) }" />
                  <b class="font-medium">{{ d.os }}</b>
                </div>
              </td>
              <td class="td">
                <Badge variant="mut">
                  <template #dot>
                    <span class="w-1.5 h-1.5 rounded-full" :style="{ background: typeColor(d.type) }" />
                  </template>
                  {{ typeLabel(d.type) }}
                </Badge>
              </td>
              <td class="td mono">{{ fmt(d.devices) }}</td>
              <td class="td mono muted">{{ fmt(d.users) }}</td>
              <td class="td mono muted">{{ fmt(d.sessions) }}</td>
              <td class="td">
                <div class="flex items-center gap-2.5">
                  <div class="flex-1 min-w-[70px] h-1.5 rounded-full bg-panel2 overflow-hidden">
                    <i
                      class="block h-full rounded-full"
                      :style="{ width: ((d.devices / maxDev) * 100).toFixed(0) + '%', background: typeColor(d.type) }"
                    />
                  </div>
                  <span class="mono muted text-[11.5px] whitespace-nowrap">
                    {{ ((d.devices / totalDev) * 100).toFixed(1) }}%
                  </span>
                </div>
              </td>
              <td class="td mono muted">{{ d.traffic }} GB</td>
            </tr>
            <tr v-if="!list.length">
              <td colspan="7" class="empty-row">Устройств не найдено.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
