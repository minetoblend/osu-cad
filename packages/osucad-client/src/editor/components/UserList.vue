<script setup lang="ts">
import {computed, shallowRef} from "vue";
import {useContainer} from "@/composables/useContainer";

const { users } = useContainer()!;

const userList = shallowRef([...users.others]);

users.on("userJoined", () => {
  userList.value = [...users.others];
});

users.on("userLeft", () => {
  userList.value = [...users.others];
});

</script>

<template>
  <div class="user-list">
    <div class="user" style="margin-bottom: 0.5rem">
      <div class="display-name">{{ users.me.user.name }}</div>
      <div class="avatar"><img v-if="users.me.data.avatarUrl" :src="users.me.data.avatarUrl" alt=""></div>
    </div>
    <div class="user" v-for="user in userList" :key="user.clientId">
      <div class="display-name" :style="{ color: user.data.color ?? 'white' }">{{ user.user.name }}</div>
      <div class="avatar"><img v-if="user.data.avatarUrl" :src="user.data.avatarUrl" alt=""></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-list {
  position: absolute;
  right: 1rem;
  top: 1rem;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;

  .user {
    display: flex;
    gap: 0.5rem;

    .avatar {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 100%;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>