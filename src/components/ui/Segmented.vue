<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  options: { type: Array, default: () => [] }, // [{ value, label }]
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="inline-flex bg-panel border border-line rounded-[9px] p-[3px] gap-[2px]">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      @click="$emit('update:modelValue', o.value)"
      :class="[
        'border-0 font-body text-[12.5px] font-medium px-3 py-1.5 rounded-[6px] cursor-pointer transition whitespace-nowrap',
        modelValue === o.value
          ? 'bg-panel2 text-accent shadow-[inset_0_0_0_1px_#243047]'
          : 'bg-transparent text-txt2 hover:text-txt',
      ]"
    >
      {{ o.label }}
    </button>
  </div>
</template>
