<script setup lang="ts">
defineProps<{
  modelValue: boolean;
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
}>()

const onChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}

</script>

<template>
  <div class="checkbox">
    <input type="checkbox" :checked="modelValue" @change="onChange"/>
    <span class="checkmark"></span>
  </div>
</template>

<style>
.checkbox {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;
  border-radius: 4px;
}

.checkbox input:checked ~ .checkmark {
  background-color: #2196F3;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox input:checked ~ .checkmark:after {
  display: block;
}

.checkbox .checkmark:after {
  left: 7px;
  top: 3px;
  width: 6px;
  height: 12px;
  border: solid white;
  border-width: 0 3px 3px 0;
  transform: rotate(45deg);
}
</style>