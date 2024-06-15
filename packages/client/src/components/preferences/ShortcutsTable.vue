<script setup lang="ts">
import { shortcuts, ShortcutId } from '@/editorOld/shortcuts';

const shortcutTitles: {
  [key in ShortcutId]: string;
} = {
  'hitobject.shift-forward': 'Shift Forward',
  'hitobject.shift-backward': 'Shift Backward',
  'hitobject.scale': 'Scale Selected Hit Objects',
  'hitobject.rotate': 'Rotate Selected Hit Objects',
  'hitobject.flip-horizontal': 'Flip Selected Hit Objects Horizontally',
  'hitobject.flip-horizontal.local':
    'Flip Selected Hit Objects Horizontally (Around Selection Center)',
  'hitobject.flip-vertical': 'Flip Selected Hit Objects Vertically',
  'hitobject.flip-vertical.local':
    'Flip Selected Hit Objects Vertically (Around Selection Center)',
  'hitobject.delete': 'Delete Selected Hit Objects',
  'hitobject.select-all': 'Select All Hit Objects',
  'axis.create': 'Create Axis',
  'clock.seek-backward': 'Seek Backwards',
  'clock.seek-backward-fast': 'Seek Backwards (Fast)',
  'clock.seek-end': 'Seek to End',
  'clock.seek-forward': 'Seek Forward',
  'clock.seek-forward-fast': 'Seek Forward (Fast)',
  'clock.seek-start': 'Seek to Start',
  'clock.toggle-play': 'Start/Stop Playback',
  'hitobject.convert-to-stream': 'Convert to Stream',
  'hitobject.reverse': 'Reverse Selected Hit Objects',
  'hitobject.rotate-clockwise': 'Rotate Clockwise (90°)',
  'hitobject.rotate-counter-clockwise': 'Rotate Counter-Clockwise (90°)',
  'hitobject.toggle-newcombo': 'Toggle New Combo',
  'controlpoint.create-inherited':
    'Create Inherited Control Point (Green line)',
  'controlpoint.create-uninherited':
    'Create Uninherited Control Point (Red line)',
};

const categories = new Map<string, ShortcutId[]>();
for (const action in shortcuts) {
  const category = action.split('.')[0];
  if (!categories.has(category)) {
    categories.set(category, []);
  }
  categories.get(category)?.push(action as ShortcutId);
}

const categoryTitles = {
  hitobject: 'Hit Objects',
  clock: 'Playback',
  axis: 'Axis',
  controlpoint: 'Control Points',
} as Record<string, string>;

const keySymbols: Record<string, string> = {
  ' ': 'Space',
  ArrowUp: 'Arrow up',
  ArrowDown: 'Arrow down',
  ArrowLeft: 'Arrow left',
  ArrowRight: 'Arrow right',
  Escape: 'Esc',
  Backspace: 'Backspace',
  Delete: 'Del',
  Enter: 'Enter',
  Tab: 'Tab',
};

function formatKey(key: string) {
  if (key.length === 1) return key.toUpperCase();
  return keySymbols[key] ?? key;
}
</script>

<template>
  <div class="not-prose">
    <section
      class="mt-4"
      v-for="[category, categoryShortcuts] in categories"
      :key="category"
    >
      <div colspan="2" class="font-bold py-2">
        {{ categoryTitles[category] ?? category }}
      </div>
      <div class="rounded bg-gray-200 b b-gray-400">
        <div
          v-for="action in categoryShortcuts"
          :key="action"
          class="flex py-3 px-4 hover:bg-gray-300 b-t first:b-t-0 b-gray-400"
        >
          <div class="flex-1 px-2">{{ shortcutTitles[action] ?? action }}</div>
          <div class="w-40 whitespace-nowrap px-2">
            <span v-if="shortcuts[action].ctrl" class="modifier">Ctrl</span>
            <span v-if="shortcuts[action].shift" class="modifier">Shift</span>
            <span v-if="shortcuts[action].alt" class="modifier">Alt</span>
            <span v-if="shortcuts[action].meta" class="modifier">Meta</span>
            <span>{{ formatKey(shortcuts[action].key) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="postcss">
.modifier {
  @apply px-1 rounded mr-1 bg-gray-400;
}

td {
  @apply p-2;
}
</style>
