import { EventEmitter } from "events";
import { onKeyStroke } from "@vueuse/core";
import { provide } from "vue";

const shortcutList = {
  'select.all': "ctrl+a",
  'hitObject.copy': "ctrl+c",
  'hitObject.paste': "ctrl+v",
  'hitObject.delete': "del",
  'hitObject.move': 'g',
  'hitObject.rotate': 'r',
  'hitObject.scale': 's',
} satisfies {
  [key: string]: string;
};

export function createShortcutListener() {
  const shortcutMap = new Map<string, string[]>();
  for (const [key, value] of Object.entries(shortcutList)) {
    if (!shortcutMap.has(key)) shortcutMap.set(key, []);
    shortcutMap.get(key)!.push(value);
  }

  const shortcutEmitter = new EventEmitter();

  onKeyStroke((evt) => {
    const isLetter = evt.key.length === 1;
    if (!isLetter) return;

    const key = evt.key.toLowerCase();
    const modifiers = [];
  });

  provide("shortcuts", shortcutEmitter);
}

export function onShortcut(
  name: keyof typeof shortcutList,
  callback: () => void
) {}
