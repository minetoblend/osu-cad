<script setup lang="ts">
import {usePreferencesVisible} from "@/composables/usePreferencesVisible.ts";
import {onEditorKeyDown} from "@/composables/onEditorKeyDown.ts";

const visible = usePreferencesVisible()

onEditorKeyDown((evt) => {
  if (evt.key === 'o' && evt.ctrlKey) {
    visible.value = !visible.value
    evt.preventDefault()
  }
})
</script>

<template>
  <Transition>
    <div v-if="visible" class="preferences-overlay" @click="visible=false">
      <div class="preferences-card" @click.stop>
        <PreferencesForm/>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.preferences-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(black, 0.5);

  .preferences-card {
    background-color: rgba($surface-50, 0.9);
    position: absolute;
    left: 10px;
    top: 10px;
    bottom: 10px;
    border-radius: 6px;
    width: 600px;
    overflow: hidden;
    box-shadow: 0 0 30px rgba(black, 0.75);
    backdrop-filter: blur(30px);

    > * {
      height: 100%;
    }
  }


}

.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.v-enter-active, .v-leave-active {
  .preferences-card {
    transition: all 0.3s;
  }

  transition: all 0.3s;
}

.v-enter-from, .v-leave-to {
  .preferences-card {
    transform: translateX(-100%);
  }

  opacity: 0;
}
</style>
