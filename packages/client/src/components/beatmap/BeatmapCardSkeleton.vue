<template>
  <div class="bg-gray-300 rounded overflow-hidden flex group">
    <div
      class="w-30 h-30 rounded overflow-hidden bg-gray-400 shadow-right shrink-0"
    />
    <div class="flex flex-col px-3 py-2">
      <div class="flex-1 min-w-0">
        <div class="flex gap-2">
          <a class="flex-1 font-500">
            <span class="skeleton-text w-50" />
          </a>
        </div>
        <div class="font-400 text-4">
          <span class="skeleton-text w-30" />
        </div>
      </div>
      <div class="grow" />
      <div class="skeleton-text rounded w-20" />
    </div>
  </div>
</template>
