<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { fmt, dStr, ini, PERIOD_WORD, PERIOD_MULT } from '@/utils/format'
import { exportXLSX } from '@/utils/xlsx'
import StatCard from '@/components/ui/StatCard.vue'
import Badge from '@/components/ui/Badge.vue'
import UserDrawer from '@/components/UserDrawer.vue'
import BlockModal from '@/components/BlockModal.vue'

const data = useDataStore()
const ui = useUiStore()
const { period, globalSearch } = storeToRefs(ui)
const { toast } = useToast()

// ---- KPI ----
const usersNew = computed(() => fmt(Math.round(214 * PERIOD_MULT[period.value])))
const newLabel = computed(() => 'Новые · ' + PERIOD_WORD[period.value])

// ---- filters ----
const fSearch = ref('')
const fStatus = ref('')
const fPlan = ref('')
const fReg = ref('')

// ---- sorting / paging ----
const sort = ref({ key: 'reg', dir: 'desc' })
const page = ref(1)
const size = ref(15)

const SORT_COLS = [
  { key: 'name', label: 'Пользователь' },
  { key: 'id', label: 'ID' },
  { key: 'plan', label: 'Тариф' },
  { key: 'reg', label: 'Регистрация' },
  { key: 'last', label: 'Последний вход' },
  { key: 'devices', label: 'Устройств' },
  { key: 'status', label: 'Статус' },
]

const filtered = computed(() => {
  const q = (fSearch.value + ' ' + globalSearch.value).trim().toLowerCase()
  const term = q.split(' ').filter(Boolean)[0] || ''
  let list = data.users.filter((u) => {
    if (fStatus.value && u.status !== fStatus.value) return false
    if (fPlan.value && u.plan !== fPlan.value) return false
    if (fReg.value && (Date.now() - u.reg) / 86400000 > +fReg.value) return false
    if (term && !(u.name + u.email + u.id).toLowerCase().includes(term)) return false
    return true
  })
  const k = sort.value.key
  const dir = sort.value.dir === 'asc' ? 1 : -1
  const planOrder = { Free: 0, Pro: 1, Premium: 2 }
  list = [...list].sort((a, b) => {
    let av, bv
    if (k === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase() }
    else if (k === 'plan') { av = planOrder[a.plan]; bv = planOrder[b.plan] }
    else if (k === 'devices') { av = a.devices.length; bv = b.devices.length }
    else { av = a[k]; bv = b[k] }
    if (av < bv) return -dir
    if (av > bv) return dir
    return 0
  })
  return list
})

const pages = computed(() => Math.max(1, Math.ceil(filtered.value.length / size.value)))
const paged = computed(() => {
  const start = (page.value - 1) * size.value
  return filtered.value.slice(start, start + size.value)
})
const rangeFrom = computed(() => (filtered.value.length ? (page.value - 1) * size.value + 1 : 0))
const rangeTo = computed(() => (page.value - 1) * size.value + paged.value.length)

const pageNums = computed(() => {
  const arr = []
  const win = 2
  const p = page.value
  const tot = pages.value
  for (let i = 1; i <= tot; i++) {
    if (i === 1 || i === tot || (i >= p - win && i <= p + win)) arr.push(i)
    else if (i === p - win - 1 || i === p + win + 1) arr.push('…')
  }
  return arr
})

// сброс на первую страницу при изменении фильтров/размера
watch([fSearch, fStatus, fPlan, fReg, globalSearch, size], () => {
  page.value = 1
})
watch(pages, (p) => {
  if (page.value > p) page.value = p
})

function setSort(k) {
  if (sort.value.key === k) sort.value.dir = sort.value.dir === 'asc' ? 'desc' : 'asc'
  else sort.value = { key: k, dir: 'asc' }
  page.value = 1
}
function goPage(g) {
  if (g === 'prev') page.value = Math.max(1, page.value - 1)
  else if (g === 'next') page.value = Math.min(pages.value, page.value + 1)
  else if (typeof g === 'number') page.value = g
}
function resetFilters() {
  fSearch.value = fStatus.value = fPlan.value = fReg.value = ''
  page.value = 1
}

function doExport() {
  const aoa = [
    ['Пользователь', 'Email', 'ID', 'Тариф', 'Регистрация', 'Последний вход', 'Устройств', 'Статус', 'Причина блокировки'],
  ]
  filtered.value.forEach((u) =>
    aoa.push([
      u.name, u.email, u.id, u.plan, dStr(u.reg), dStr(u.last), u.devices.length,
      u.status === 'active' ? 'Активен' : 'Заблокирован', u.blockReason || '',
    ]),
  )
  exportXLSX('govpn_users.xlsx', aoa, 'Пользователи')
  toast('Экспортировано: govpn_users.xlsx')
}

// ---- drawer / block ----
const selectedId = ref(null)
const drawerOpen = ref(false)
const blockOpen = ref(false)
const selectedUser = computed(() => data.users.find((u) => u.id === selectedId.value) || null)

function openUser(id) {
  selectedId.value = id
  drawerOpen.value = true
}
function onToggleBlock() {
  if (!selectedUser.value) return
  if (selectedUser.value.status === 'active') {
    blockOpen.value = true
  } else {
    data.unblockUser(selectedUser.value.id)
    toast('Пользователь разблокирован')
  }
}
function onConfirmBlock(reason) {
  data.blockUser(selectedId.value, reason)
  toast('Пользователь заблокирован')
}
</script>

<template>
  <div class="animate-fade">
    <!-- KPI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px] mb-[18px]">
      <StatCard value="12 480" glow="#5AA9E6" icon-color="#5AA9E6">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#5AA9E6" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          </svg>
        </template>
        <template #label>Всего пользователей</template>
        <template #trend><span class="text-ok">▲ 4.2% к прошлой неделе</span></template>
      </StatCard>

      <StatCard :value="usersNew" glow="#46CBA2" icon-color="#46CBA2">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#46CBA2" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
          </svg>
        </template>
        <template #label>{{ newLabel }}</template>
        <template #trend><span class="text-ok">▲ 18 за последний час</span></template>
      </StatCard>

      <StatCard value="5 932" glow="#54C0E6" icon-color="#54C0E6">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#54C0E6" stroke-width="2">
            <path d="M3 3v18h18" /><path d="M7 14l3-3 3 2 5-6" />
          </svg>
        </template>
        <template #label>DAU</template>
        <template #trend><span class="text-ok">▲ 2.1%</span></template>
      </StatCard>

      <StatCard value="38 410" glow="#6F86E0" icon-color="#6F86E0">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#6F86E0" stroke-width="2">
            <rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18" />
          </svg>
        </template>
        <template #label>MAU</template>
        <template #trend><span class="text-err">▼ 0.6%</span></template>
      </StatCard>
    </div>

    <!-- table card -->
    <div class="card">
      <div class="panel-h">
        <div class="mr-auto">
          <h3>Поиск пользователя</h3>
          <div class="text-[12.5px] text-txt2 mt-0.5">
            Нажмите на строку, чтобы открыть историю подключений и устройства
          </div>
        </div>
        <button class="btn-ghost btn-sm" @click="doExport">
          <svg viewBox="0 0 24 24" width="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" />
          </svg>
          Экспорт в Excel
        </button>
      </div>

      <!-- filters -->
      <div class="flex flex-wrap items-end gap-3 mb-3.5">
        <div class="flex-1 min-w-[200px]">
          <label class="lbl-cap">Поиск</label>
          <input v-model="fSearch" class="fld" placeholder="Имя, email или ID…" />
        </div>
        <div class="w-[150px]">
          <label class="lbl-cap">Статус</label>
          <select v-model="fStatus" class="fld">
            <option value="">Все</option>
            <option value="active">Активен</option>
            <option value="blocked">Заблокирован</option>
          </select>
        </div>
        <div class="w-[130px]">
          <label class="lbl-cap">Тариф</label>
          <select v-model="fPlan" class="fld">
            <option value="">Все</option>
            <option value="Free">Free</option>
            <option value="Pro">Pro</option>
            <option value="Premium">Premium</option>
          </select>
        </div>
        <div class="w-[150px]">
          <label class="lbl-cap">Регистрация</label>
          <select v-model="fReg" class="fld">
            <option value="">Любая</option>
            <option value="7">За 7 дней</option>
            <option value="30">За 30 дней</option>
            <option value="90">За 90 дней</option>
          </select>
        </div>
        <button class="btn-ghost btn-sm" @click="resetFilters">Сбросить</button>
        <div class="text-[12px] text-txt2 ml-auto whitespace-nowrap">
          Найдено: <b class="text-txt">{{ fmt(filtered.length) }}</b>
        </div>
      </div>

      <!-- table -->
      <div class="tbl-wrap overflow-x-auto">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th
                v-for="c in SORT_COLS"
                :key="c.key"
                class="th cursor-pointer select-none hover:text-txt2"
                @click="setSort(c.key)"
              >
                <span class="inline-flex items-center gap-1">
                  {{ c.label }}
                  <span
                    :class="[
                      'text-[9px] transition',
                      sort.key === c.key ? 'text-accent opacity-100' : 'opacity-30',
                    ]"
                  >
                    {{ sort.key === c.key && sort.dir === 'desc' ? '▼' : '▲' }}
                  </span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="u in paged"
              :key="u.id"
              class="cursor-pointer hover:bg-panel/60 transition"
              @click="openUser(u.id)"
            >
              <td class="td">
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-[30px] h-[30px] rounded-[8px] grid place-items-center text-[11px] font-semibold text-[#0a1120] flex-none"
                    :style="{ background: u.av }"
                  >{{ ini(u.name) }}</span>
                  <div class="min-w-0">
                    <div class="font-medium truncate">{{ u.name }}</div>
                    <div class="text-[11.5px] text-txt3 truncate">{{ u.email }}</div>
                  </div>
                </div>
              </td>
              <td class="td mono muted">{{ u.id }}</td>
              <td class="td">
                <Badge :variant="{ Free: 'mut', Pro: 'info', Premium: 'warn' }[u.plan]">{{ u.plan }}</Badge>
              </td>
              <td class="td mono muted">{{ dStr(u.reg) }}</td>
              <td class="td mono muted">{{ dStr(u.last) }}</td>
              <td class="td mono">{{ u.devices.length }}</td>
              <td class="td">
                <Badge :variant="u.status === 'active' ? 'ok' : 'err'">
                  {{ u.status === 'active' ? 'Активен' : 'Заблокирован' }}
                </Badge>
              </td>
            </tr>
            <tr v-if="!paged.length">
              <td colspan="7" class="empty-row">Ничего не найдено. Измените фильтры.</td>
            </tr>
          </tbody>
        </table>

        <!-- pager -->
        <div
          v-if="filtered.length"
          class="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-line bg-panel"
        >
          <div class="text-[12px] text-txt2">{{ rangeFrom }}–{{ rangeTo }} из {{ fmt(filtered.length) }}</div>
          <div class="text-[12px] text-txt2 flex items-center gap-2">
            На странице
            <select v-model.number="size" class="fld !w-auto !py-1 !px-2 text-[12px]">
              <option :value="15">15</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>
          <div class="flex items-center gap-1 ml-auto">
            <button class="pg" :disabled="page === 1" @click="goPage('prev')">‹</button>
            <template v-for="(n, i) in pageNums" :key="i">
              <button v-if="typeof n === 'number'" class="pg" :class="{ 'pg-on': n === page }" @click="goPage(n)">
                {{ n }}
              </button>
              <span v-else class="text-txt3 px-0.5">…</span>
            </template>
            <button class="pg" :disabled="page === pages" @click="goPage('next')">›</button>
          </div>
        </div>
      </div>
    </div>

    <UserDrawer v-model:open="drawerOpen" :user="selectedUser" @toggle-block="onToggleBlock" />
    <BlockModal v-model:open="blockOpen" @confirm="onConfirmBlock" />
  </div>
</template>

<style scoped>
.pg {
  @apply min-w-[32px] h-8 px-2 grid place-items-center bg-panel2 border border-line rounded-[7px] text-txt2 text-[12.5px] cursor-pointer transition hover:border-accent hover:text-accent disabled:opacity-40 disabled:cursor-not-allowed;
}
.pg-on {
  @apply bg-accent text-[#08111f] border-accent font-semibold;
}
</style>
