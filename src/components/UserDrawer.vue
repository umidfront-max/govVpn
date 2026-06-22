<script setup>
import { computed } from 'vue'
import Badge from '@/components/ui/Badge.vue'
import { ini, dStr, durStr } from '@/utils/format'

const props = defineProps({
  user: { type: Object, default: null },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'toggle-block'])

function close() {
  emit('update:open', false)
}

const planVariant = computed(() => {
  if (!props.user) return 'mut'
  return { Free: 'mut', Pro: 'info', Premium: 'warn' }[props.user.plan]
})

// SVG-иконки устройств по типу.
const devPaths = {
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
  desktop: '<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  router: '<rect x="3" y="11" width="18" height="9" rx="2"/><path d="M7 16h.01M11 16h.01M7 7l3 3M17 7l-3 3"/>',
}
</script>

<template>
  <Teleport to="body">
    <!-- scrim -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[70] bg-[#060A12]/60 backdrop-blur-[2px]"
        @click="close"
      />
    </Transition>

    <!-- panel -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-x-full"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="open && user"
        class="fixed top-0 right-0 z-[71] h-full w-[min(440px,100vw)] border-l border-line bg-bg2 flex flex-col"
      >
        <!-- head -->
        <div class="flex items-center gap-3 p-[18px] border-b border-line">
          <span
            class="w-[42px] h-[42px] rounded-[11px] grid place-items-center font-semibold text-[15px] text-[#0a1120] flex-none"
            :style="{ background: user.av }"
          >
            {{ ini(user.name) }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="font-disp text-[17px] font-semibold truncate">{{ user.name }}</div>
            <div class="text-[12.5px] text-txt3 truncate">{{ user.email }}</div>
          </div>
          <button class="icon-btn" @click="close">
            <svg viewBox="0 0 24 24" width="16" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- body -->
        <div class="flex-1 overflow-y-auto p-[18px] flex flex-col gap-[18px]">
          <!-- profile -->
          <div>
            <div class="lbl-cap mb-2.5">Профиль</div>
            <div class="flex flex-col gap-px">
              <div class="flex justify-between items-center py-[7px] border-b border-lineSoft">
                <span class="text-[12.5px] text-txt2">ID</span>
                <span class="mono">{{ user.id }}</span>
              </div>
              <div class="flex justify-between items-center py-[7px] border-b border-lineSoft">
                <span class="text-[12.5px] text-txt2">Тариф</span>
                <Badge :variant="planVariant">{{ user.plan }}</Badge>
              </div>
              <div class="flex justify-between items-center py-[7px] border-b border-lineSoft">
                <span class="text-[12.5px] text-txt2">Регистрация</span>
                <span class="mono">{{ dStr(user.reg) }}</span>
              </div>
              <div class="flex justify-between items-center py-[7px]">
                <span class="text-[12.5px] text-txt2">Статус</span>
                <Badge :variant="user.status === 'active' ? 'ok' : 'err'">
                  {{ user.status === 'active' ? 'Активен' : 'Заблокирован' }}
                </Badge>
              </div>
            </div>

            <!-- block reason -->
            <div
              v-if="user.status === 'blocked'"
              class="mt-3 rounded-[11px] border border-err/30 bg-err/[0.07] p-3"
            >
              <div class="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.5px] text-err font-semibold">
                <svg viewBox="0 0 24 24" width="13" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
                </svg>
                Причина блокировки
              </div>
              <div class="text-[13px] mt-1.5">{{ user.blockReason || 'Причина не указана' }}</div>
              <div v-if="user.blockedAt" class="text-[11.5px] text-txt3 mt-1">
                Заблокирован: {{ user.blockedAt }}
              </div>
            </div>
          </div>

          <!-- devices -->
          <div>
            <div class="lbl-cap mb-2.5 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="14" rx="2" /><path d="M8 20h8" />
              </svg>
              Устройства
            </div>
            <div class="flex flex-col gap-2">
              <div
                v-for="(d, i) in user.devices"
                :key="i"
                class="flex items-center gap-2.5 rounded-[10px] border border-lineSoft bg-panel p-2.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="text-txt2 flex-none"
                  v-html="devPaths[d.type]"
                />
                <div class="flex-1 min-w-0">
                  <div class="text-[13px] truncate">{{ d.name }}</div>
                  <div class="text-[11.5px] text-txt3">Последняя активность: {{ d.last }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- history -->
          <div>
            <div class="lbl-cap mb-2.5 flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" width="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 8v4l3 2" /><circle cx="12" cy="12" r="9" />
              </svg>
              История подключений
            </div>
            <div class="flex flex-col gap-2">
              <div
                v-for="(h, i) in user.history"
                :key="i"
                class="flex justify-between gap-3 rounded-[10px] border border-lineSoft bg-panel p-2.5"
              >
                <div class="min-w-0">
                  <b class="font-medium text-[13px]">{{ h.srv }}</b>
                  <div class="mono text-txt3 text-[11.5px]">{{ h.ip }}</div>
                  <div class="flex items-center gap-1.5 text-[11.5px] text-txt2 mt-1">
                    <svg viewBox="0 0 24 24" width="12" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" />
                    </svg>
                    Длительность: {{ durStr(h.dur) }}
                  </div>
                </div>
                <div class="muted mono text-[11.5px] whitespace-nowrap">{{ h.at }}</div>
              </div>
            </div>
          </div>

          <!-- action -->
          <div class="flex gap-2.5 mt-1">
            <button
              v-if="user.status === 'active'"
              class="btn-danger flex-1 justify-center"
              @click="emit('toggle-block')"
            >
              Заблокировать
            </button>
            <button
              v-else
              class="flex-1 justify-center bg-ok text-[#08111f] border-0 rounded-[9px] px-[14px] py-[9px] font-semibold text-[13px] cursor-pointer transition hover:brightness-110 inline-flex items-center gap-[7px]"
              @click="emit('toggle-block')"
            >
              Разблокировать
            </button>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
