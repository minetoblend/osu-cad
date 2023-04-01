<script setup lang="ts">
if (window.opener) {
  window.opener.postMessage("authenticated", "*");
  window.close();
}
</script>

<template>
  <h1>Successfully Authenticated!</h1>
  <h2>You can close this window.</h2>
</template>
