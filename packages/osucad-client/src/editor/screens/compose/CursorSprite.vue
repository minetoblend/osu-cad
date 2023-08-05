<script setup lang="ts">
import {Vec2} from "@osucad/common";
import {computed, onMounted, shallowRef, watchEffect} from "vue";
import {TransitionPresets, useTransition} from "@vueuse/core";
import {useEditor} from "@/editor/createEditor";
import {Container, Text} from "pixi.js";
import {animate} from "@/utils/animate";

const props = defineProps<{
  position: Vec2;
  user: number
}>();

const { container, clock } = useEditor()!;

const user = computed(() => container.users.getUser(props.user));

const options = {
  transition: TransitionPresets.easeOutQuad,
  duration: 100,
} as const;

const x = useTransition(computed(() => props.position.x), options);
const y = useTransition(computed(() => props.position.y), options);

const textContainer = shallowRef<Container>();

onMounted(() => {
  const text = new Text();
  textContainer.value!.addChild(text);
  text.scale.set(0.5);
  text.position.set(10, 10);

  watchEffect(() => {
    if (user.value) {
      text.text = user.value.user.name;
      text.style.fill = user.value?.data?.color ?? 0xffffff;
    }
  });
});

const alpha = computed(() => {
  if (!user.value) return 0;

  const time = clock.currentTimeAnimated;
  const userTime = container.users.getClientState(user.value.clientId, "currentTime")?.time;

  if (userTime !== undefined) {
    const difference = Math.abs(userTime - time);

    return animate(difference, 1000, 3000, 1, 0);
  }
});

watchEffect(() => console.log(alpha.value));

</script>

<template>
  <pixi-container
      :x="x"
      :y="y"
      :alpha="alpha"
  >
    <pixi-sprite
        texture="@/assets/icons/select.png"
        :scale="0.25"
        :tint="user?.data?.color ?? 0xffffff"
    />
    <pixi-container ref="textContainer"/>
  </pixi-container>
</template>
