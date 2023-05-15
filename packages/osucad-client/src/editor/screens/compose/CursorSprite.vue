<script setup lang="ts">
import { Vec2 } from "@osucad/common";
import { computed } from "vue";
import { TransitionPresets, useTransition } from "@vueuse/core";
import { IClient, IUser } from "@osucad/unison";
import { useConnectedUsers } from "@/editor/connectedUsers";
import { useEditor } from "@/editor/createEditor";

const props = defineProps<{
  position: Vec2;
  user: number
}>();

const { container } = useEditor()!

const user = computed(() => container.users.getUser(props.user))

const options = {
  transition: TransitionPresets.easeOutQuad,
  duration: 100,
} as const

const x = useTransition(computed(() => props.position.x), options)
const y = useTransition(computed(() => props.position.y), options)

</script>

<template>
  <pixi-sprite
    :x="x"
    :y="y"
    texture="@/assets/icons/select.png"
    :scale="0.25"
    :tint="user?.data?.color ?? 0xffffff"
  />
</template>
