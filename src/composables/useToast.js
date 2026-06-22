import { reactive } from 'vue'

const state = reactive({ msg: '', show: false, _t: null })

export function useToast() {
  function toast(m) {
    state.msg = m
    state.show = true
    clearTimeout(state._t)
    state._t = setTimeout(() => {
      state.show = false
    }, 2200)
  }
  return { toast, toastState: state }
}
