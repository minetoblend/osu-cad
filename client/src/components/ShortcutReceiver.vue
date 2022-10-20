<template>
  <div @mouseenter="onEnter" @mouseleave="onLeave" class="shortcut-receiver">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, onBeforeUnmount} from "vue";

let active = false

const emit = defineEmits(['shortcut'])

function onEnter() {
  active = true
}

function onLeave() {
  active = false
}

function onKeyDown(evt: KeyboardEvent) {
  let notEditing =
      evt.target === document.body

  if (evt.target instanceof HTMLDivElement) {
    if (!evt.target.isContentEditable) {
      notEditing = true
    }
  }


  if (active && notEditing) {

    if (evt.key.length === 1 || ['Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(evt.key)) {

      let shortcut = []
      if (evt.ctrlKey)
        shortcut.push('ctrl');
      if (evt.shiftKey)
        shortcut.push('shift');
      if (evt.altKey)
        shortcut.push('alt');


      let key = evt.key.toLowerCase()
      if (key === ' ')
        key = 'space'
      shortcut.push(key)

      const event = new CustomEvent('shortcut', {
        cancelable: true,
        detail: shortcut.join('+')
      })
      emit('shortcut', event)
      if (event.defaultPrevented) {
        evt.preventDefault()
        evt.stopPropagation()
      }
    }
  }
}


document.addEventListener('keydown', onKeyDown)
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown);
})

</script>

<style lang="scss">
.shortcut-receiver {
  width: 100%;
  height: 100%;
}
</style>