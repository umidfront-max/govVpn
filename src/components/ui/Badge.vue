<script setup>
defineProps({
  variant: { type: String, default: 'mut' }, // ok | warn | err | mut | info
})

const bg = {
  ok: 'bg-ok/[0.13] text-ok',
  warn: 'bg-warn/[0.13] text-warn',
  err: 'bg-err/[0.14] text-err',
  mut: 'bg-txt2/[0.12] text-txt2',
  info: 'bg-sites/[0.13] text-sites',
}
const dot = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  err: 'bg-err',
  mut: 'bg-txt2',
  info: 'bg-sites',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 text-[11.5px] font-medium px-[9px] py-1 rounded-full whitespace-nowrap',
      bg[variant],
    ]"
  >
    <span v-if="!$slots.dot" :class="['w-1.5 h-1.5 rounded-full', dot[variant]]" />
    <slot name="dot" />
    <slot />
  </span>
</template>
