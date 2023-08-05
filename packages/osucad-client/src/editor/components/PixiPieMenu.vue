<script setup lang="ts">
import PieMenuOption from "@/editor/components/PieMenuOption.vue";
import {computed, ref, shallowRef, watchEffect} from "vue";
import {FederatedMouseEvent, Graphics} from "pixi.js";
import {globalHitArea} from "@/editor/screens/compose/tools/hitArea";
import {useTransition, useVModel, whenever} from "@vueuse/core";

const props = defineProps<{
  visible: boolean,
  options: { name: string, value: any }[]
}>();


const emit = defineEmits<{
  (event: "select", value: any): void,
  (event: "update:visible", value: boolean): void,
}>();

const visible = useVModel(props, "visible", emit);

const active = useTransition(computed(() => props.visible ? 1 : 0), {
  duration: 100,
});

const radius = computed(() => active.value * 45);

const positions = computed(() => props.options.map((option, index) => {
  const angle = index / props.options.length * Math.PI * 2 - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius.value,
    y: Math.sin(angle) * radius.value,
    name: option.name,
    value: option.value,
  };
}));

const activeIndex = ref(0);

const innerCircle = shallowRef<Graphics>();

const innerRadius = ref(10);

whenever(() => props.visible, () => activeIndex.value = -1);

watchEffect(() => {
  if (!innerCircle.value) return;

  const g = innerCircle.value;
  g.clear();
  g.lineStyle(3, 0x1A1A20, 0.5);
  g.drawCircle(0, 0, innerRadius.value);
});

function onMouseMove(event: FederatedMouseEvent) {
  event.preventDefault();
  event.stopPropagation();
  const position = event.getLocalPosition(event.currentTarget);
  const distance = Math.sqrt(position.x ** 2 + position.y ** 2);
  if (distance < innerRadius.value) {
    activeIndex.value = -1;
    return;
  }
  const angle = Math.atan2(position.y, position.x) - Math.PI / 2;

  let index = Math.round((angle + Math.PI) / (Math.PI * 2) * positions.value.length);
  if (index < 0) index += positions.value.length;
  if (index >= positions.value.length) index -= positions.value.length;

  activeIndex.value = index;
}

function onMouseDown(evt: FederatedMouseEvent) {
  if (!visible.value) return;
  if (evt.button === 0) {
    evt.preventDefault();
    evt.stopPropagation();
    if (activeIndex.value >= 0)
      emit("select", positions.value[activeIndex.value].value);
    visible.value = false;
  }
}

function onMouseUp(event: FederatedMouseEvent) {
  if (!visible.value) return;
  if (event.button === 0 && activeIndex.value >= 0) {
    emit("select", positions.value[activeIndex.value].value);
    visible.value = false;
  }
}

</script>

<template>
  <pixi-container :hit-area="globalHitArea" @mousemove="onMouseMove" :alpha="active" :visible="active > 0"
                  @mousedown="onMouseDown"
                  @mouseup="onMouseUp"
  >
    <pixi-graphics ref="innerCircle" :scale="0.5 + active * 0.5"/>
    <PieMenuOption
        v-for="(option, index) in positions"
        :key="option.value"
        :name="option.name"
        :x="option.x"
        :y="option.y"
        :active="activeIndex === index"
    />
  </pixi-container>
</template>