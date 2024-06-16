/* eslint-disable prettier/prettier */
export type ShortcutMap = {
  [key: string]: Keystroke | Keystroke[];
};

export type Modifier = 'ctrl' | 'shift' | 'alt' | 'meta';

export interface Keystroke {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
}

function keystroke(shortcut: string): Keystroke {
  const [...modifiers] = shortcut.split('+');
  const key = modifiers.pop() as string;
  const result: Keystroke = { key };
  for (const modifier of modifiers) {
    result[modifier as Modifier] = true;
  }
  return result;
}

export const shortcuts = {
  'clock.toggle-play': keystroke('space'),
  'clock.seek-start': keystroke('z'),
  'clock.seek-end': keystroke('v'),
  'clock.seek-backward': keystroke('ArrowLeft'),
  'clock.seek-backward-fast': keystroke('ctrl+ArrowLeft'),
  'clock.seek-forward': keystroke('ctrl+ArrowRight'),
  'clock.seek-forward-fast': keystroke('ArrowRight'),
  'hitobject.select-all': keystroke('ctrl+a'),
  'hitobject.delete': keystroke('delete'),
  'hitobject.rotate': keystroke('ctrl+shift+r'),
  'hitobject.scale': keystroke('ctrl+shift+s'),
  'hitobject.toggle-newcombo': keystroke('q'),
  'hitobject.convert-to-stream': keystroke('ctrl+shift+f'),
  'hitobject.shift-forward': keystroke('k'),
  'hitobject.shift-backward': keystroke('j'),
  'hitobject.reverse': keystroke('ctrl+g'),
  'hitobject.flip-horizontal': keystroke('ctrl+h'),
  'hitobject.flip-horizontal.local': keystroke('ctrl+shift+h'),
  'hitobject.flip-vertical': keystroke('ctrl+j'),
  'hitobject.flip-vertical.local': keystroke('ctrl+shift+j'),
  'hitobject.rotate-clockwise': keystroke('ctrl+shift+period'),
  'hitobject.rotate-counter-clockwise': keystroke('ctrl+shift+comma'),
  'controlpoint.create-uninherited': keystroke('ctrl+p'),
  'controlpoint.create-inherited': keystroke('ctrl+shift+p'),
  'axis.create': keystroke('ctrl+shift+e'),
} satisfies ShortcutMap;

export function isShortcutMatch(shortcut: Keystroke, event: KeyboardEvent): boolean {
  if (shortcut.key !== event.key) return false;
  if (shortcut.ctrl && !event.ctrlKey) return false;
  if (shortcut.shift && !event.shiftKey) return false;
  if (shortcut.alt && !event.altKey) return false;
  if (shortcut.meta && !event.metaKey) return false;
  return true;
}

const shortcutMap = new Map<string, ShortcutId>();

for (const [action, key] of Object.entries(shortcuts)) {
  if (Array.isArray(key)) {
    for (const k of key) {
      shortcutMap.set(formatShortcut(k), action as ShortcutId);
    }
  } else {
    shortcutMap.set(formatShortcut(key), action as ShortcutId);
  }
}

export function keyStrokeFromEvent(event: KeyboardEvent): Keystroke {
  let key = event.key;
  if (key.length === 1) {
    key = key.toLowerCase();
  }
  if(key === ' ') {
    key = 'space';
  }

  return {
    key: key,
    ctrl: event.ctrlKey,
    shift: event.shiftKey,
    alt: event.altKey,
    meta: event.metaKey
  };
}

export function formatShortcut({
                                 key,
                                 ctrl,
                                 alt,
                                 meta,
                                 shift
                               }: Keystroke): string {
  const keys: string[] = [];
  if (ctrl) keys.push('ctrl');
  if (shift) keys.push('shift');
  if (alt) keys.push('alt');
  if (meta) keys.push('meta');
  keys.push(key);

  return keys.join('+');
}

export type Shortcuts = typeof shortcuts;

export type ShortcutId = keyof Shortcuts;

export function resolveShortcut(event: KeyboardEvent): ShortcutId | undefined {
  const stroke = keyStrokeFromEvent(event);
  return shortcutMap.get(formatShortcut(stroke));
}
