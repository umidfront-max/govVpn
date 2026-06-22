<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import Segmented from '@/components/ui/Segmented.vue'

const route = useRoute()
const ui = useUiStore()
const { toast } = useToast()

const title = computed(() => route.meta.title || '')
const sub = computed(() => route.meta.sub || '')

const periods = [
  { value: 'day', label: 'За день' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
]

function setPeriod(p) {
  ui.period = p
  const label = periods.find((x) => x.value === p)?.label
  toast('Период статистики: ' + label)
}
</script>

<template>
  <div
    class="sticky top-0 z-20 border-b border-line px-[26px] py-4 flex items-center gap-4 flex-wrap"
    style="background: rgba(12, 18, 32, 0.82); backdrop-filter: blur(10px)"
  >
    <button
      class="icon-btn w-[38px] h-[38px] nav:hidden"
      aria-label="Меню"
      @click="ui.sidebarOpen = !ui.sidebarOpen"
    >
      <svg viewBox="0 0 24 24" width="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>

    <div class="flex flex-col gap-0.5 mr-auto">
      <h1 class="font-disp text-[21px] font-semibold flex items-center gap-2.5">
        <span class="w-[9px] h-[9px] rounded-[3px] bg-accent" />
        <span>{{ title }}</span>
      </h1>
      <p class="text-[12.5px] text-txt2">{{ sub }}</p>
    </div>

    <div class="relative flex-none">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        class="absolute left-[11px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-txt3"
      >
        <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
      </svg>
      <input
        v-model="ui.globalSearch"
        class="w-[230px] max-[860px]:w-[160px] bg-panel border border-line rounded-[9px] py-[9px] pl-[34px] pr-3 text-txt font-body text-[13px] outline-none transition focus:border-accent focus:shadow-[0_0_0_3px_rgba(84,192,230,0.14)]"
        placeholder="Поиск: юзер, IP, сервер…"
      />
    </div>

    <div class="flex flex-col gap-1 items-end">
      <span class="text-[9.5px] tracking-[1px] uppercase text-txt3">Период статистики</span>
      <Segmented :model-value="ui.period" :options="periods" @update:model-value="setPeriod" />
    </div>
  </div>
</template>
