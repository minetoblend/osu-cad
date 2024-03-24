<script setup lang="ts"></script>

<template>
  <header
    class="z-[50] fixed top-0 w-screen bg-transparent border-b border-transparent px-4"
  >
    <AppNavbar />
  </header>
  <div class="w-screen pt-20 px-4">
    <div
      class="mx-auto md:max-w-1200px 2xl:max-w-1400px grid"
      :class="[
        !!$slots.sidebar &&
          'md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)]',
      ]"
    >
      <AppSidebar
        v-if="$slots.sidebar"
        class="sticky block top-20 self-start <sm:hidden pt-4"
        style="min-height: calc(100vh - 9.5rem)"
      >
        <slot name="sidebar" />
      </AppSidebar>
      <div class="flex-1 flex flex-col overflow-hidden">
        <main class="mx-auto max-w-1280px w-full flex-1 y-auto p-4">
          <slot>
            <RouterView />
          </slot>
        </main>
      </div>
    </div>
    <AppFooter class="mx-auto max-w-1280px w-full mt-4" />
  </div>
</template>
