<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { fmt, tStr, rnd, PERIOD_WORD, PERIOD_MULT } from '@/utils/format'
import { ctxGrad, lineOpts, barOpts } from '@/utils/chart'
import { ERRTYPES } from '@/data/mock'
import { exportXLSX } from '@/utils/xlsx'
import StatCard from '@/components/ui/StatCard.vue'
import Badge from '@/components/ui/Badge.vue'
import Segmented from '@/components/ui/Segmented.vue'
import ChartCanvas from '@/components/ui/ChartCanvas.vue'

const data = useDataStore()
const ui = useUiStore()
const { period, globalSearch } = storeToRefs(ui)
const { toast } = useToast()

// ---- KPI ----
const sessTotal = computed(() => fmt(Math.round(48920 * PERIOD_MULT[period.value])))
const errCount = computed(() => fmt(Math.round(126 * PERIOD_MULT[period.value])))
const sessLabel = computed(() => 'Сессий · ' + PERIOD_WORD[period.value])
const errLabel = computed(() => 'Ошибок · ' + PERIOD_WORD[period.value])

// ---- sessions chart ----
const sessMode = ref('24h')
const sessSub = computed(() =>
  sessMode.value === '24h' ? 'Подключения за последние 24 часа' : 'Сессии по дням за последнюю неделю',
)
const sessConfig = computed(() => {
  let labels = []
  let vals = []
  if (sessMode.value === '24h') {
    const now = new Date()
    for (let i = 23; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000)
      labels.push(('0' + d.getHours()).slice(-2) + ':00')
      const h = d.getHours()
      vals.push(rnd(900, 2200) + (h >= 9 && h <= 22 ? 900 : 0))
    }
  } else {
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    const today = new Date().getDay()
    for (let i = 6; i >= 0; i--) {
      const idx = (((today - 1 - i) % 7) + 7) % 7
      labels.push(days[idx])
      vals.push(rnd(38000, 62000))
    }
  }
  return {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          data: vals,
          borderColor: '#4FC3D9',
          backgroundColor: ctxGrad('#4FC3D9'),
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: sessMode.value === 'week' ? 3 : 0,
          pointBackgroundColor: '#4FC3D9',
        },
      ],
    },
    options: lineOpts(false),
  }
})

// ---- errors bar (built once) ----
const errConfig = {
  type: 'bar',
  data: {
    labels: ERRTYPES,
    datasets: [
      {
        data: ERRTYPES.map((t) => data.errors.filter((e) => e.type === t).length * rnd(2, 5)),
        backgroundColor: ['#F2706B', '#F5984B', '#54C0E6', '#6F86E0', '#4FC3D9'],
        borderRadius: 6,
        maxBarThickness: 46,
      },
    ],
  },
  options: barOpts(),
}

// ---- error log ----
const fType = ref('')
const fSrv = ref('')
const fLvl = ref('')

const errFiltered = computed(() => {
  const q = globalSearch.value.trim().toLowerCase()
  return data.errors.filter((e) => {
    if (fType.value && e.type !== fType.value) return false
    if (fSrv.value && e.srv !== fSrv.value) return false
    if (fLvl.value && e.lvl !== fLvl.value) return false
    if (q && !(e.type + e.srv + e.user + e.msg).toLowerCase().includes(q)) return false
    return true
  })
})

function resetFilters() {
  fType.value = fSrv.value = fLvl.value = ''
}
function doExport() {
  const aoa = [['Время', 'Тип', 'Сервер', 'Пользователь', 'Сообщение', 'Уровень']]
  errFiltered.value.forEach((e) =>
    aoa.push([tStr(e.time), e.type, e.srv, e.user, e.msg, e.lvl === 'error' ? 'Error' : 'Warning']),
  )
  exportXLSX('govpn_sessions_log.xlsx', aoa, 'Журнал')
  toast('Экспортировано: govpn_sessions_log.xlsx')
}
</script>

<template>
  <div class="animate-fade">
    <!-- KPI -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[14px] mb-[18px]">
      <StatCard value="3 184" glow="#4FC3D9" icon-color="#4FC3D9">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#4FC3D9" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </template>
        <template #label>Текущие сессии</template>
        <template #trend><span class="text-ok">▲ онлайн сейчас</span></template>
      </StatCard>

      <StatCard :value="sessTotal" glow="#54C0E6" icon-color="#54C0E6">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#54C0E6" stroke-width="2">
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" /><circle cx="12" cy="12" r="4" />
          </svg>
        </template>
        <template #label>{{ sessLabel }}</template>
        <template #trend><span class="text-ok">▲ 5.4%</span></template>
      </StatCard>

      <StatCard :value="errCount" glow="#F2706B" icon-color="#F2706B">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#F2706B" stroke-width="2">
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
        </template>
        <template #label>{{ errLabel }}</template>
        <template #trend><span class="text-err">▼ 12% к вчера</span></template>
      </StatCard>

      <StatCard value="99.74%" glow="#46CBA2" icon-color="#46CBA2">
        <template #icon>
          <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#46CBA2" stroke-width="2">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </template>
        <template #label>Успешных</template>
        <template #trend><span class="text-txt3">SLA в норме</span></template>
      </StatCard>
    </div>

    <!-- charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-[14px] mb-[18px]">
      <div class="card">
        <div class="panel-h">
          <div class="mr-auto">
            <h3>Сессии</h3>
            <div class="text-[12.5px] text-txt2 mt-0.5">{{ sessSub }}</div>
          </div>
          <Segmented
            v-model="sessMode"
            :options="[
              { value: '24h', label: '24 часа' },
              { value: 'week', label: 'Неделя' },
            ]"
          />
        </div>
        <div class="h-[300px]"><ChartCanvas :config="sessConfig" /></div>
      </div>

      <div class="card">
        <div class="panel-h">
          <div>
            <h3>Ошибки — количество по типам</h3>
            <div class="text-[12.5px] text-txt2 mt-0.5">Последние сутки</div>
          </div>
        </div>
        <div class="h-[300px]"><ChartCanvas :config="errConfig" /></div>
      </div>
    </div>

    <!-- error log -->
    <div class="card">
      <div class="panel-h">
        <div class="mr-auto">
          <h3>Журнал ошибок</h3>
          <div class="text-[12.5px] text-txt2 mt-0.5">Лог последних событий</div>
        </div>
        <button class="btn-ghost btn-sm" @click="doExport">
          <svg viewBox="0 0 24 24" width="15" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" />
          </svg>
          Экспорт в Excel
        </button>
      </div>

      <div class="flex flex-wrap items-end gap-3 mb-3.5">
        <div class="w-[160px]">
          <label class="lbl-cap">Тип</label>
          <select v-model="fType" class="fld">
            <option value="">Все типы</option>
            <option v-for="t in ERRTYPES" :key="t">{{ t }}</option>
          </select>
        </div>
        <div class="w-[190px]">
          <label class="lbl-cap">Сервер</label>
          <select v-model="fSrv" class="fld">
            <option value="">Все сервера</option>
            <option v-for="s in data.servers" :key="s.id">{{ s.n }}</option>
          </select>
        </div>
        <div class="w-[140px]">
          <label class="lbl-cap">Уровень</label>
          <select v-model="fLvl" class="fld">
            <option value="">Все</option>
            <option value="error">Error</option>
            <option value="warn">Warning</option>
          </select>
        </div>
        <button class="btn-ghost btn-sm" @click="resetFilters">Сбросить</button>
        <div class="text-[12px] text-txt2 ml-auto whitespace-nowrap">
          Записей: <b class="text-txt">{{ fmt(errFiltered.length) }}</b>
        </div>
      </div>

      <div class="tbl-wrap overflow-x-auto">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th class="th">Время</th>
              <th class="th">Тип</th>
              <th class="th">Сервер</th>
              <th class="th">Пользователь</th>
              <th class="th">Сообщение</th>
              <th class="th">Уровень</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(e, i) in errFiltered" :key="i" class="hover:bg-panel/60 transition">
              <td class="td mono muted whitespace-nowrap">{{ tStr(e.time) }}</td>
              <td class="td"><Badge :variant="e.lvl === 'error' ? 'err' : 'warn'">{{ e.type }}</Badge></td>
              <td class="td mono">{{ e.srv }}</td>
              <td class="td mono muted">{{ e.user }}</td>
              <td class="td muted">{{ e.msg }}</td>
              <td class="td">
                <Badge :variant="e.lvl === 'error' ? 'err' : 'warn'">
                  {{ e.lvl === 'error' ? 'Error' : 'Warning' }}
                </Badge>
              </td>
            </tr>
            <tr v-if="!errFiltered.length">
              <td colspan="6" class="empty-row">Ошибок не найдено.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
