<script setup lang="ts">
import {Graphics, Text, TextStyle} from "pixi.js";
import {computed, onMounted, ref, shallowRef, watch, watchEffect} from "vue";

const props = defineProps<{
  name: string
  active: boolean
}>();

const background = shallowRef<Graphics>();
const text = shallowRef<Text>();

onMounted(() => {
  if (!text.value) return;
  const style = text.value.style;
  style.fill = 0xffffff;
  style.align = "center";

  text.value.updateText(true);
  width.value = text.value.width;
  height.value = text.value.height;
});

watch(() => props.name, () => {
  if (!text.value) return;
  text.value.updateText(false);
  width.value = text.value.width;
  height.value = text.value.height;
});

const width = ref(0);
const height = ref(0);

const padding = ref(5);

watchEffect(() => {
  if (!background.value) return;
  const g = background.value;

  g.clear();
  g.beginFill(0xffffff);
  g.drawRoundedRect(-padding.value - width.value / 2, -padding.value - height.value / 2, width.value + padding.value * 2, height.value + padding.value * 2, 5);
  g.endFill();
});

watchEffect(() => {
  if (background.value)
    background.value.alpha = props.active ? 1 : 0.5;
  if (text.value) {
    text.value.tint = props.active ? 0x63E2B7 : 0xffffff;
    text.value.position.set(-width.value / 2, -height.value / 2);
  }
});

defineExpose({
  width,
  height,
  text,
});


</script>

<template>
  <pixi-container>
    <pixi-graphics ref="background" :tint="0x1A1A20"/>
    <pixi-text :text="name" ref="text" :scale="0.35"/>
  </pixi-container>
</template>