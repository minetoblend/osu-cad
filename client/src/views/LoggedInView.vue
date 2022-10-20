<template>
  <div></div>
</template>

<script setup lang="ts">

import {useRouter} from "vue-router";

const redirectUrl = localStorage.getItem('auth-redirect')
const router = useRouter()

if (redirectUrl) {
  router.replace(redirectUrl)
  localStorage.removeItem('auth-redirect')
} else {
  router.replace('/')
}

</script>