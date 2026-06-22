<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({ email: 'admin@govpn.uz', password: '' })
const showPass = ref(false)
const loading = ref(false)
const error = ref('')

// Узлы для фоновой «живой» сети на левой панели.
const nodes = [
  { city: 'Amsterdam', code: 'NL', ok: true },
  { city: 'Frankfurt', code: 'DE', ok: true },
  { city: 'Singapore', code: 'SG', ok: true },
  { city: 'Tokyo', code: 'JP', ok: true },
  { city: 'New York', code: 'US', degraded: true },
]

async function submit() {
  error.value = ''
  if (!form.email.trim() || !form.password) {
    error.value = 'Введите email и пароль'
    return
  }
  loading.value = true
  const res = await auth.login(form.email, form.password)
  loading.value = false
  if (res.ok) {
    router.push(route.query.redirect || '/users')
  } else {
    error.value = res.error
  }
}
</script>

<template>
  <div class="min-h-screen grid grid-cols-1 nav:grid-cols-[1.05fr_1fr]">
    <!-- ============ BRAND / ATMOSPHERE ============ -->
    <div
      class="relative overflow-hidden hidden nav:flex flex-col justify-between p-12 border-r border-line"
      style="background: linear-gradient(160deg, #0f1726 0%, #0c1220 60%, #0a0f1b 100%)"
    >
      <!-- ambient glows -->
      <div
        class="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-[80px]"
        style="background: rgba(84, 192, 230, 0.12)"
      />
      <div
        class="pointer-events-none absolute bottom-0 -left-24 w-[360px] h-[360px] rounded-full blur-[80px]"
        style="background: rgba(70, 203, 162, 0.08)"
      />

      <!-- top brand -->
      <div class="relative flex items-center gap-3">
        <div
          class="w-11 h-11 rounded-[12px] grid place-items-center flex-none"
          style="
            background: linear-gradient(135deg, #46cba2, #54c0e6);
            box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.07), 0 10px 30px rgba(84, 192, 230, 0.3);
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#08111f"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-6 h-6"
          >
            <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div>
          <div class="font-disp font-bold text-[22px] tracking-[0.3px]">
            Go<span class="text-accent">VPN</span>
          </div>
          <div class="text-[10.5px] text-txt3 tracking-[1.6px] uppercase">Admin Console</div>
        </div>
      </div>

      <!-- centerpiece: shield in orbit + headline -->
      <div class="relative">
        <div class="relative w-[112px] h-[112px] mb-9">
          <!-- orbit ring -->
          <div
            class="absolute inset-0 rounded-full"
            style="
              background: conic-gradient(
                from 0deg,
                rgba(84, 192, 230, 0) 0deg,
                rgba(84, 192, 230, 0.55) 90deg,
                rgba(70, 203, 162, 0) 200deg
              );
              animation: orbit 6s linear infinite;
              mask: radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 2px));
              -webkit-mask: radial-gradient(
                farthest-side,
                transparent calc(100% - 2px),
                #000 calc(100% - 2px)
              );
            "
          />
          <div class="absolute inset-[10px] rounded-full border border-line/70" />
          <!-- shield -->
          <div
            class="absolute inset-[24px] rounded-[16px] grid place-items-center"
            style="
              background: linear-gradient(135deg, #141d30, #0f1726);
              box-shadow: inset 0 0 0 1px rgba(84, 192, 230, 0.25), 0 8px 30px rgba(0, 0, 0, 0.45);
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#54C0E6"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-8 h-8"
            >
              <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        <h2 class="font-disp text-[28px] font-semibold leading-[1.2] max-w-[420px]">
          Единая консоль управления<br />вашей VPN-сетью
        </h2>
        <p class="text-[14px] text-txt2 mt-3 max-w-[400px] leading-relaxed">
          Пользователи, сессии, узлы, платежи и трафик — в одном защищённом интерфейсе.
        </p>
      </div>

      <!-- live nodes -->
      <div class="relative">
        <div class="text-[10px] tracking-[1.4px] uppercase text-txt3 mb-3">Состояние узлов</div>
        <div class="grid grid-cols-2 gap-x-8 gap-y-2.5 max-w-[420px]">
          <div v-for="n in nodes" :key="n.code" class="flex items-center gap-2.5 text-[13px]">
            <span class="relative flex-none w-2 h-2">
              <span
                class="absolute inset-0 rounded-full"
                :class="n.degraded ? 'bg-warn' : 'bg-ok'"
              />
              <span
                class="absolute inset-0 rounded-full animate-ping-soft"
                :class="n.degraded ? 'bg-warn' : 'bg-ok'"
              />
            </span>
            <span class="text-txt">{{ n.city }}</span>
            <span class="font-mono text-[11px] text-txt3 ml-auto">{{ n.code }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ FORM ============ -->
    <div class="flex items-center justify-center p-6">
      <div class="w-full max-w-[380px]">
        <!-- mobile brand -->
        <div class="flex nav:hidden items-center gap-3 mb-9">
          <div
            class="w-10 h-10 rounded-[11px] grid place-items-center flex-none"
            style="background: linear-gradient(135deg, #46cba2, #54c0e6)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#08111f"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="w-[22px] h-[22px]"
            >
              <path d="M12 2L4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div class="font-disp font-bold text-[20px]">Go<span class="text-accent">VPN</span></div>
        </div>

        <h1 class="font-disp text-[24px] font-semibold">Вход в кабинет</h1>
        <p class="text-[13.5px] text-txt2 mt-1.5 mb-8">Авторизуйтесь, чтобы продолжить</p>

        <form @submit.prevent="submit" class="flex flex-col gap-[18px]">
          <div>
            <label class="lbl-cap" for="email">Email</label>
            <div class="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt3"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
              </svg>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="username"
                class="fld !pl-10 !py-[11px]"
                placeholder="admin@govpn.uz"
              />
            </div>
          </div>

          <div>
            <label class="lbl-cap" for="pass">Пароль</label>
            <div class="relative">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt3"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="pass"
                v-model="form.password"
                :type="showPass ? 'text' : 'password'"
                autocomplete="current-password"
                class="fld !pl-10 !pr-10 !py-[11px]"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-txt3 hover:text-txt2 transition"
                :aria-label="showPass ? 'Скрыть пароль' : 'Показать пароль'"
                @click="showPass = !showPass"
              >
                <svg
                  v-if="!showPass"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-[18px] h-[18px]"
                >
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="w-[18px] h-[18px]"
                >
                  <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-3 3.8M6.6 6.6A17 17 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 3.4-.5" />
                  <path d="m2 2 20 20M9.5 9.5a3 3 0 0 0 4.2 4.2" />
                </svg>
              </button>
            </div>
          </div>

          <transition
            enter-active-class="transition duration-150"
            enter-from-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="error"
              class="flex items-center gap-2 text-[12.5px] text-err bg-err/[0.08] border border-err/25 rounded-[9px] px-3 py-2.5"
            >
              <svg viewBox="0 0 24 24" width="15" fill="none" stroke="currentColor" stroke-width="2" class="flex-none">
                <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
              </svg>
              {{ error }}
            </div>
          </transition>

          <button type="submit" class="btn-primary !py-[12px] mt-1" :disabled="loading">
            <svg
              v-if="loading"
              class="w-[18px] h-[18px] animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="9" stroke="rgba(8,17,31,0.25)" stroke-width="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="#08111f" stroke-width="3" stroke-linecap="round" />
            </svg>
            <span>{{ loading ? 'Вход…' : 'Войти' }}</span>
          </button>
        </form>

        <div class="mt-6 px-3.5 py-3 rounded-[10px] bg-panel border border-lineSoft text-[12px] text-txt2 leading-relaxed">
          <span class="text-txt3">Демо-доступ:</span>
          <span class="font-mono text-txt"> admin@govpn.uz</span> /
          <span class="font-mono text-txt">govpn</span>
        </div>

        <p class="text-center text-[11.5px] text-txt3 mt-7">
          © {{ new Date().getFullYear() }} GoVPN · Защищённое соединение
        </p>
      </div>
    </div>
  </div>
</template>
