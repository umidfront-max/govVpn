<script setup>
defineProps({
  value: { type: [String, Number], default: '' },
  glow: { type: String, default: '#54C0E6' },
  iconColor: { type: String, default: '#54C0E6' },
})
</script>

<template>
  <div class="card">
    <div
      class="absolute -right-[30px] -top-[30px] w-[120px] h-[120px] rounded-full blur-[34px] opacity-[0.16]"
      :style="{ background: glow }"
    />
    <div class="text-[12px] text-txt2 flex items-center gap-[7px] font-medium">
      <span
        class="w-[30px] h-[30px] rounded-[8px] grid place-items-center flex-none"
        :style="{ background: iconColor + '24' }"
      >
        <slot name="icon" />
      </span>
      <slot name="label" />
    </div>
    <div class="font-mono text-[30px] font-semibold mt-[9px] mb-1 tracking-[-0.5px]">
      {{ value }}
    </div>
    <div class="text-[11.5px] flex items-center gap-[5px]">
      <slot name="trend" />
    </div>
  </div>
</template>
