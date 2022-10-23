<template>
  <div class="user-list">
    <h4>Connected</h4>
    <div>
      <p v-if="self">
        {{ self.username }}
      </p>
      <transition-group name="users">
        <p class="user" v-for="user in users" :key="user.sessionId"
           :style="{color: `rgb(${user.color.r * 255}, ${user.color.g * 255}, ${user.color.b * 255})`}"
           @click="ctx.clock.seek(user.currentTime, true)">
          {{ user.username }}
        </p>
      </transition-group>
    </div>
  </div>
</template>


<script setup lang="ts">

import {useContext} from "@/editor";
import {computed} from "vue";

const ctx = useContext()

const users = computed(() => {
      return ctx.users.filter(it => {
        return it.sessionId !== ctx.users.sessionId
      })
    }
)

const self = computed(() =>
    ctx.users.find(it => it.sessionId === ctx.users.sessionId)
)
</script>

<style lang="scss">
.user-list {
  text-align: right;

  .n-list {
    background: none !important;

  }

  .user {
    pointer-events: all;
    cursor: pointer;
  }
}

.users-enter-active,
.users-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.users-enter-from,
.users-leave-to {
  opacity: 0;
  transform: translateX(30px);
}


</style>