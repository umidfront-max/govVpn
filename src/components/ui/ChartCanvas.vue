<script setup>
import { ref, onMounted, onBeforeUnmount, watch, toRaw } from 'vue'
import { Chart } from '@/utils/chart'

const props = defineProps({
  config: { type: Object, required: true },
})

const el = ref(null)
let chart = null

function render() {
  if (!el.value) return
  if (chart) chart.destroy()
  chart = new Chart(el.value, toRaw(props.config))
}

onMounted(render)
// Родитель отдаёт config через computed, который возвращает новый объект
// при изменении зависимостей — пересоздаём график по смене ссылки.
watch(() => props.config, render)
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>

<template>
  <canvas ref="el" />
</template>
