<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import { fmt, rnd } from '@/utils/format'
import { lineOpts } from '@/utils/chart'
import { AVC } from '@/data/mock'
import Badge from '@/components/ui/Badge.vue'
import Segmented from '@/components/ui/Segmented.vue'
import ChartCanvas from '@/components/ui/ChartCanvas.vue'

const data = useDataStore()
const ui = useUiStore()
const { globalSearch } = storeToRefs(ui)

const fStatus = ref('')
const fRegion = ref('')
const fSearch = ref('')

const STATUS = {
  online: { variant: 'ok', label: 'Online', color: '#46CBA2' },
  degraded: { variant: 'warn', label: 'Degraded', color: '#F5984B' },
  offline: { variant: 'err', label: 'Offline', color: '#F2706B' },
}

function upStr(d) {
  if (!d) return '—'
  const mo = Math.floor(d / 30)
  return mo > 0 ? `${mo} мес ${d % 30} дн` : `${d} дн`
}
function loadPct(s) {
  return s.cap ? Math.min(100, Math.round((s.load / s.cap) * 100)) : 0
}
function loadColor(p) {
  return p > 80 ? '#F2706B' : p > 55 ? '#F5984B' : '#46CBA2'
}

const filtered = computed(() => {
  const q = (fSearch.value + ' ' + globalSearch.value).trim().toLowerCase()
  const term = q.split(' ').filter(Boolean)[0] || ''
  return data.servers.filter((s) => {
    if (fStatus.value && s.status !== fStatus.value) return false
    if (fRegion.value && s.reg !== fRegion.value) return false
    if (term && !(s.n + s.lo + s.ip).toLowerCase().includes(term)) return false
    return true
  })
})

function resetFilters() {
  fStatus.value = fRegion.value = fSearch.value = ''
}

// ---- outbound channel chart ----
const obMode = ref('now')
const obSub = computed(() =>
  obMode.value === 'now'
    ? 'Текущая нагрузка и пропускная способность · Mbps'
    : 'Нагрузка по часам за день · Mbps',
)
const obConfig = computed(() => {
  const active = data.servers.filter((s) => s.status !== 'offline')
  if (obMode.value === 'now') {
    const labels = active.map((s) => s.n.split('-')[0] + (s.n.match(/\d+$/) || ''))
    return {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Текущая нагрузка',
            data: active.map((s) => s.load),
            backgroundColor: '#F5984B',
            borderRadius: 6,
            maxBarThickness: 42,
            order: 2,
          },
          {
            type: 'line',
            label: 'Пропускная способность',
            data: active.map((s) => s.cap),
            borderColor: '#54C0E6',
            backgroundColor: '#54C0E6',
            borderWidth: 2,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#54C0E6',
            order: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: { boxWidth: 10, boxHeight: 10, usePointStyle: true, padding: 14 },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: '#1C2741' }, beginAtZero: true },
        },
      },
    }
  }
  const labels = Array.from({ length: 24 }, (_, i) => i + ':00')
  const datasets = active.slice(0, 5).map((s, i) => ({
    label: s.n,
    data: labels.map(() => rnd(40, s.cap / 2)),
    borderColor: AVC[i],
    backgroundColor: 'transparent',
    tension: 0.4,
    borderWidth: 2,
    pointRadius: 0,
  }))
  return { type: 'line', data: { labels, datasets }, options: lineOpts(true) }
})
</script>

<template>
  <div class="animate-fade">
    <!-- filters -->
    <div class="flex flex-wrap items-end gap-3 mb-[18px]">
      <div class="w-[150px]">
        <label class="lbl-cap">Статус</label>
        <select v-model="fStatus" class="fld">
          <option value="">Все</option>
          <option value="online">Online</option>
          <option value="degraded">Degraded</option>
          <option value="offline">Offline</option>
        </select>
      </div>
      <div class="w-[170px]">
        <label class="lbl-cap">Регион</label>
        <select v-model="fRegion" class="fld">
          <option value="">Все регионы</option>
          <option>Europe</option>
          <option>Asia</option>
          <option>America</option>
        </select>
      </div>
      <div class="flex-1 min-w-[180px]">
        <label class="lbl-cap">Поиск</label>
        <input v-model="fSearch" class="fld" placeholder="Название узла…" />
      </div>
      <button class="btn-ghost btn-sm" @click="resetFilters">Сбросить</button>
      <div class="text-[12px] text-txt2 ml-auto whitespace-nowrap">
        Узлов: <b class="text-txt">{{ fmt(filtered.length) }}</b>
      </div>
    </div>

    <!-- server cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[14px] mb-[18px]">
      <div v-for="s in filtered" :key="s.id" class="card">
        <div class="flex items-center gap-2.5">
          <span class="text-[22px] leading-none flex-none">{{ s.c }}</span>
          <div class="flex-1 min-w-0">
            <div class="font-medium font-mono text-[13px] truncate">{{ s.n }}</div>
            <div class="text-[11.5px] text-txt3 truncate">{{ s.lo }}</div>
          </div>
          <Badge :variant="STATUS[s.status].variant">{{ STATUS[s.status].label }}</Badge>
        </div>

        <div class="grid grid-cols-2 gap-2.5 mt-3.5">
          <div class="rounded-[10px] border border-lineSoft bg-panel p-2.5">
            <div class="text-[11px] text-txt3 uppercase tracking-[0.5px]">Подключений</div>
            <div class="font-mono text-[18px] font-semibold mt-0.5" :style="{ color: STATUS[s.status].color }">
              {{ fmt(s.conns) }}
            </div>
          </div>
          <div class="rounded-[10px] border border-lineSoft bg-panel p-2.5">
            <div class="text-[11px] text-txt3 uppercase tracking-[0.5px]">Аптайм</div>
            <div class="font-mono text-[15px] font-semibold mt-1">
              {{ upStr(s.upDays) }}
              <small v-if="s.upPct" class="text-txt3 font-normal">· {{ s.upPct }}%</small>
            </div>
          </div>
        </div>

        <div class="mt-3.5">
          <div class="flex justify-between text-[12px] mb-1.5">
            <span class="text-txt2">Пропускная способность</span>
            <b>{{ fmt(s.cap) }} Mbps</b>
          </div>
          <div class="flex justify-between text-[12px] mb-1.5">
            <span class="text-txt2">Текущая нагрузка</span>
            <b :style="{ color: loadColor(loadPct(s)) }">{{ fmt(s.load) }} Mbps · {{ loadPct(s) }}%</b>
          </div>
          <div class="h-1.5 rounded-full bg-panel2 overflow-hidden">
            <i
              class="block h-full rounded-full transition-all"
              :style="{ width: loadPct(s) + '%', background: loadColor(loadPct(s)) }"
            />
          </div>
        </div>
      </div>

      <div v-if="!filtered.length" class="empty-row col-span-full">Серверов не найдено.</div>
    </div>

    <!-- outbound chart -->
    <div class="card">
      <div class="panel-h">
        <div class="mr-auto">
          <h3>Канал Outbound</h3>
          <div class="text-[12.5px] text-txt2 mt-0.5">{{ obSub }}</div>
        </div>
        <Segmented
          v-model="obMode"
          :options="[
            { value: 'now', label: 'Текущие' },
            { value: 'day', label: 'За день' },
          ]"
        />
      </div>
      <div class="h-[320px]"><ChartCanvas :config="obConfig" /></div>
    </div>
  </div>
</template>
