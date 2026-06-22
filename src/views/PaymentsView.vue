<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import { fmt, dStr, ini, PERIOD_WORD, PERIOD_MULT } from '@/utils/format'
import { PAYMETHODS, PAYPLANS } from '@/data/mock'
import StatCard from '@/components/ui/StatCard.vue'
import Badge from '@/components/ui/Badge.vue'

const data = useDataStore()
const ui = useUiStore()
const { period, globalSearch } = storeToRefs(ui)

// ---- KPI (доход и успешные зависят от периода) ----
const payRev = computed(() => (14.2 * PERIOD_MULT[period.value]).toFixed(1) + 'M')
const revLabel = computed(() => 'Доход · ' + PERIOD_WORD[period.value])
const paySucc = computed(() => fmt(Math.round(1842 * PERIOD_MULT[period.value])))

const PAY = {
  paid: { variant: 'ok', label: 'Оплачено' },
  pending: { variant: 'warn', label: 'В ожидании' },
  failed: { variant: 'err', label: 'Отклонено' },
  refund: { variant: 'info', label: 'Возврат' },
}

// ---- filters ----
const fStatus = ref('')
const fMethod = ref('')
const fPlan = ref('')
const fSearch = ref('')

const filtered = computed(() => {
  const q = (fSearch.value + ' ' + globalSearch.value).trim().toLowerCase()
  const term = q.split(' ').filter(Boolean)[0] || ''
  return data.payments.filter((p) => {
    if (fStatus.value && p.status !== fStatus.value) return false
    if (fMethod.value && p.method !== fMethod.value) return false
    if (fPlan.value && p.plan !== fPlan.value) return false
    if (term && !(p.id + p.user + p.uid).toLowerCase().includes(term)) return false
    return true
  })
})

const sum = computed(() =>
  filtered.value.filter((p) => p.status === 'paid').reduce((a, p) => a + p.amount, 0),
)

function resetFilters() {
  fStatus.value = fMethod.value = fPlan.value = fSearch.value = ''
}
</script>

<template>
  <div class="animate-fade">
    <!-- KPI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px] mb-[18px]">
      <StatCard :value="payRev" glow="#6F86E0" icon-color="#6F86E0">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#6F86E0" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" />
          </svg>
        </template>
        <template #label>{{ revLabel }}</template>
        <template #trend><span class="text-ok">▲ 6.8% · сум</span></template>
      </StatCard>

      <StatCard :value="paySucc" glow="#46CBA2" icon-color="#46CBA2">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#46CBA2" stroke-width="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </template>
        <template #label>Успешных платежей</template>
        <template #trend><span class="text-ok">94.1% конверсия</span></template>
      </StatCard>

      <StatCard value="63" glow="#F5984B" icon-color="#F5984B">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#F5984B" stroke-width="2">
            <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
          </svg>
        </template>
        <template #label>В ожидании</template>
        <template #trend><span class="text-txt3">ожидают подтверждения</span></template>
      </StatCard>

      <StatCard value="52" glow="#F2706B" icon-color="#F2706B">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#F2706B" stroke-width="2">
            <circle cx="12" cy="12" r="9" /><path d="m15 9-6 6M9 9l6 6" />
          </svg>
        </template>
        <template #label>Отклонённых</template>
        <template #trend><span class="text-err">5.9%</span></template>
      </StatCard>
    </div>

    <!-- transactions -->
    <div class="card">
      <div class="panel-h">
        <div>
          <h3>Транзакции</h3>
          <div class="text-[12.5px] text-txt2 mt-0.5">История оплат и подписок</div>
        </div>
      </div>

      <div class="flex flex-wrap items-end gap-3 mb-3.5">
        <div class="w-[150px]">
          <label class="lbl-cap">Статус</label>
          <select v-model="fStatus" class="fld">
            <option value="">Все</option>
            <option value="paid">Оплачено</option>
            <option value="pending">В ожидании</option>
            <option value="failed">Отклонено</option>
            <option value="refund">Возврат</option>
          </select>
        </div>
        <div class="w-[150px]">
          <label class="lbl-cap">Метод</label>
          <select v-model="fMethod" class="fld">
            <option value="">Все методы</option>
            <option v-for="m in PAYMETHODS" :key="m">{{ m }}</option>
          </select>
        </div>
        <div class="w-[170px]">
          <label class="lbl-cap">Тариф</label>
          <select v-model="fPlan" class="fld">
            <option value="">Все</option>
            <option v-for="p in PAYPLANS" :key="p">{{ p }}</option>
          </select>
        </div>
        <div class="flex-1 min-w-[170px]">
          <label class="lbl-cap">Поиск</label>
          <input v-model="fSearch" class="fld" placeholder="ID транзакции, юзер…" />
        </div>
        <button class="btn-ghost btn-sm" @click="resetFilters">Сбросить</button>
        <div class="text-[12px] text-txt2 ml-auto whitespace-nowrap">
          Сумма: <b class="text-txt">{{ fmt(sum) }} сум</b>
        </div>
      </div>

      <div class="tbl-wrap overflow-x-auto">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th class="th">Транзакция</th>
              <th class="th">Пользователь</th>
              <th class="th">Тариф</th>
              <th class="th">Метод</th>
              <th class="th">Сумма</th>
              <th class="th">Дата</th>
              <th class="th">Статус</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in filtered" :key="p.id" class="hover:bg-panel/60 transition">
              <td class="td mono">{{ p.id }}</td>
              <td class="td">
                <div class="flex items-center gap-2.5">
                  <span
                    class="w-[26px] h-[26px] rounded-[7px] grid place-items-center text-[10px] font-semibold flex-none bg-[#2A3654] text-txt"
                  >{{ ini(p.user) }}</span>
                  <div class="min-w-0">
                    <div class="text-[12.5px] font-medium truncate">{{ p.user }}</div>
                    <div class="text-[11.5px] text-txt3 truncate">{{ p.uid }}</div>
                  </div>
                </div>
              </td>
              <td class="td">{{ p.plan }}</td>
              <td class="td">{{ p.method }}</td>
              <td class="td mono">{{ fmt(p.amount) }} сум</td>
              <td class="td mono muted">{{ dStr(p.date) }}</td>
              <td class="td"><Badge :variant="PAY[p.status].variant">{{ PAY[p.status].label }}</Badge></td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="7" class="empty-row">Транзакций не найдено.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
