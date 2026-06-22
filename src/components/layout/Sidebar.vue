<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDataStore } from '@/stores/data'
import { useUiStore } from '@/stores/ui'
import { useToast } from '@/composables/useToast'
import { ini } from '@/utils/format'

const router = useRouter()
const auth = useAuthStore()
const data = useDataStore()
const ui = useUiStore()
const { toast } = useToast()

const menuOpen = ref(false)
const health = computed(() => data.networkHealth)
const user = computed(() => auth.user || { name: 'Admin', email: '', role: 'root', location: '' })
const initials = computed(() => ini(user.value.name))

const nav = [
  { to: '/users', label: 'Пользователи' },
  { to: '/sessions', label: 'Сессии' },
  { to: '/servers', label: 'Сервера', server: true },
  { to: '/pay', label: 'Оплата' },
  { to: '/devices', label: 'Устройства' },
]

function closeSidebar() {
  ui.sidebarOpen = false
}
function onProfile() {
  menuOpen.value = false
  toast('Открыт профиль администратора')
}
function onSettings() {
  menuOpen.value = false
  toast('Открыты настройки')
}
function logout() {
  menuOpen.value = false
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="side-grad border-r border-line flex flex-col w-[248px] h-screen z-50 fixed top-0 left-0 -translate-x-full transition-transform duration-200 nav:sticky nav:translate-x-0"
    :class="{ '!translate-x-0': ui.sidebarOpen }"
  >
    <!-- brand -->
    <div class="flex items-center gap-[11px] px-5 pt-5 pb-[18px]">
      <div
        class="w-[34px] h-[34px] rounded-[9px] flex-none grid place-items-center relative"
        style="
          background: linear-gradient(135deg, #46cba2, #54c0e6);
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 22px rgba(84, 192, 230, 0.28);
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#08111f"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="w-[19px] h-[19px]"
        >
          <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <div>
        <div class="font-disp font-bold text-[18px] tracking-[0.3px]">Go<b class="text-accent">VPN</b></div>
        <div class="text-[10.5px] text-txt3 tracking-[1.4px] uppercase mt-px">Admin Console</div>
      </div>
    </div>

    <!-- network status -->
    <div
      class="mx-4 mb-3.5 px-3 py-[9px] rounded-[10px] bg-panel border border-lineSoft flex items-center gap-[9px] text-[12px] text-txt2"
    >
      <span class="relative flex-none w-2 h-2">
        <span class="absolute inset-0 rounded-full" :style="{ background: health.color }" />
        <span class="absolute inset-0 rounded-full animate-ping-soft" :style="{ background: health.color }" />
      </span>
      Сеть: <b class="text-txt font-semibold">{{ health.label }}</b>
    </div>

    <!-- nav -->
    <nav class="px-3 flex flex-col gap-[3px] overflow-y-auto">
      <div class="text-[10px] tracking-[1.5px] uppercase text-txt3 px-3 pt-3.5 pb-1.5">Кабинет</div>
      <router-link
        v-for="n in nav"
        :key="n.to"
        :to="n.to"
        custom
        v-slot="{ isActive, navigate }"
      >
        <a
          :href="n.to"
          @click="navigate(); closeSidebar()"
          class="group flex items-center gap-[11px] px-3 py-2.5 rounded-[9px] font-medium text-[13.5px] border-l-[2.5px] transition cursor-pointer"
          :class="
            isActive
              ? 'bg-panel text-txt border-l-accent'
              : 'text-txt2 border-transparent hover:bg-panel hover:text-txt'
          "
        >
          <span
            class="w-2 h-2 rounded-[3px] flex-none transition"
            :class="
              isActive ? 'bg-accent shadow-[0_0_10px_#54C0E6]' : 'bg-txt3 group-hover:bg-txt2'
            "
          />
          <span>{{ n.label }}</span>
          <span
            v-if="n.server"
            class="ml-auto font-mono text-[12px] font-semibold flex items-center gap-1.5"
          >
            <span
              class="w-2 h-2 rounded-full"
              :style="{ background: health.color, boxShadow: '0 0 8px ' + health.color }"
            />
            <span :style="{ color: health.color }">{{ data.serversOnline }}/{{ data.serversTotal }}</span>
          </span>
        </a>
      </router-link>
    </nav>

    <!-- profile + menu -->
    <div class="mt-auto p-3 border-t border-lineSoft relative">
      <!-- backdrop to close menu -->
      <div v-if="menuOpen" class="fixed inset-0 z-30" @click="menuOpen = false" />

      <transition
        enter-active-class="transition duration-150"
        enter-from-class="opacity-0 translate-y-2"
        leave-active-class="transition duration-150"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="menuOpen"
          class="absolute left-3 right-3 bottom-16 z-40 bg-panel2 border border-line rounded-[12px] p-1.5 shadow-[0_18px_44px_rgba(0,0,0,0.5)]"
        >
          <div class="px-2.5 pt-[9px] pb-2.5 border-b border-lineSoft mb-1.5">
            <div class="font-semibold text-[13.5px]">{{ user.name }}</div>
            <div class="text-[11.5px] text-txt3">{{ user.email }} · {{ user.role }}</div>
          </div>
          <button
            class="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] cursor-pointer text-txt2 text-[13px] transition hover:bg-panel hover:text-txt"
            @click="onProfile"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-none">
              <circle cx="12" cy="8" r="4" /><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
            </svg>
            Профиль
          </button>
          <button
            class="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] cursor-pointer text-txt2 text-[13px] transition hover:bg-panel hover:text-txt"
            @click="onSettings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-none">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.3 1a7 7 0 0 0-1.7-1L14.5 2h-4l-.4 2.4a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.4h4l.4-2.4a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.6a7 7 0 0 0 .1-1z"
              />
            </svg>
            Настройки
          </button>
          <button
            class="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[8px] cursor-pointer text-err text-[13px] transition hover:bg-err/10"
            @click="logout"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 flex-none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" />
            </svg>
            Выйти
          </button>
        </div>
      </transition>

      <button
        class="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-[10px] bg-transparent border border-transparent cursor-pointer text-txt2 text-left transition hover:bg-panel hover:border-lineSoft"
        @click="menuOpen = !menuOpen"
      >
        <span
          class="w-[30px] h-[30px] rounded-[9px] grid place-items-center text-[12px] text-txt font-semibold border border-line flex-none"
          style="background: linear-gradient(135deg, #34415f, #26314e)"
        >
          {{ initials }}
        </span>
        <span class="flex-1 min-w-0 leading-[1.3]">
          <span class="block text-txt text-[13px] font-medium">{{ user.name }}</span>
          <span class="block text-[11px] text-txt3">{{ user.role }} · {{ user.location }}</span>
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="w-[15px] h-[15px] text-txt3 transition"
          :class="{ 'rotate-180': menuOpen }"
        >
          <path d="m6 15 6-6 6 6" />
        </svg>
      </button>
    </div>
  </aside>
</template>
