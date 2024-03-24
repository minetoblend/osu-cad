<script setup lang="ts"></script>

<template>
  <header
    class="z-[50] fixed top-0 w-full bg-transparent border-b border-transparent"
  >
    <AppNavbar />
  </header>
  <div class="pt-20 flex flex-col items-center min-h-screen">
    <div class="flex-1 md:max-w-1200px 2xl:max-w-1400px">
      <slot />
    </div>
    <AppFooter class="mx-auto max-w-1280px w-full mt-4" />
  </div>
</template>
