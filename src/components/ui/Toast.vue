<script setup>
import { useToast } from '@/composables/useToast'
const { toastState } = useToast()
</script>

<template>
  <div
    :class="[
      'fixed bottom-6 left-1/2 -translate-x-1/2 bg-panel border border-line border-l-[3px] border-l-ok rounded-[11px] px-[18px] py-[13px] text-txt text-[13px] z-[90] shadow-[0_18px_40px_rgba(0,0,0,0.4)] flex items-center gap-[10px] transition-all duration-[250ms]',
      toastState.show
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-5 pointer-events-none',
    ]"
  >
    <svg viewBox="0 0 24 24" width="16" fill="none" stroke="#46CBA2" stroke-width="2.4">
      <path d="M20 6 9 17l-5-5" />
    </svg>
    <span>{{ toastState.msg }}</span>
  </div>
</template>
