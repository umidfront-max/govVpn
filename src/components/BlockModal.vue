<script setup>
import { ref, watch } from 'vue'
import { BLOCK_REASONS } from '@/data/mock'
import { useToast } from '@/composables/useToast'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open', 'confirm'])
const { toast } = useToast()

const reason = ref(BLOCK_REASONS[0])
const custom = ref('')

// Сбрасываем форму при каждом открытии.
watch(
  () => props.open,
  (v) => {
    if (v) {
      reason.value = BLOCK_REASONS[0]
      custom.value = ''
    }
  },
)

function close() {
  emit('update:open', false)
}
function confirm() {
  let r = reason.value
  if (r === '__custom') {
    r = custom.value.trim()
    if (!r) {
      toast('Укажите причину блокировки')
      return
    }
  }
  emit('confirm', r)
  close()
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-150"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-150"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-[80] grid place-items-center bg-[#060A12]/70 backdrop-blur-sm p-4"
      @click.self="close"
      @keydown.esc="close"
    >
      <div
        class="w-full max-w-[440px] border border-line rounded-[16px] p-[22px] animate-fade"
        style="background: linear-gradient(180deg, #141d30, #0f1726)"
      >
        <h3 class="font-disp text-[17px] font-semibold">Блокировка пользователя</h3>
        <p class="text-[12.5px] text-txt2 mt-1.5 mb-[18px] leading-relaxed">
          Укажите причину — она сохранится в профиле и будет видна другим администраторам.
        </p>

        <div class="mb-3">
          <label class="lbl-cap">Причина</label>
          <select v-model="reason" class="fld">
            <option v-for="r in BLOCK_REASONS" :key="r" :value="r">{{ r }}</option>
            <option value="__custom">Другое (указать)…</option>
          </select>
        </div>

        <div v-if="reason === '__custom'" class="mb-3">
          <label class="lbl-cap">Комментарий</label>
          <textarea
            v-model="custom"
            rows="3"
            placeholder="Опишите причину блокировки…"
            class="fld resize-none"
          />
        </div>

        <div class="flex justify-end gap-2.5 mt-[18px]">
          <button class="btn-ghost btn-sm" @click="close">Отмена</button>
          <button class="btn-danger btn-sm" @click="confirm">Заблокировать</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
