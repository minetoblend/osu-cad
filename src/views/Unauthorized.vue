<template>
  <h1>You need to log in</h1>
  <a :href="loginUrl">Login</a>
</template>

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  setup() {
    return {loginUrl: `${process.env.API_BASEURL}/auth/osu  `}
  }
})
</script>