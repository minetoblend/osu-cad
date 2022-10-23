import {ref} from "vue";


const focused = ref(false)


window.addEventListener('focus', () => focused.value = true)
window.addEventListener('focus', () => focused.value = false)


export const windowIsInFocus = () => focused.value
