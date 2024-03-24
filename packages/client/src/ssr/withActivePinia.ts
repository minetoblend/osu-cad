import { Pinia, setActivePinia } from 'pinia';

export function withActivePinia<T>(pinia: Pinia, fn: () => T): T {
  try {
    setActivePinia(pinia);
    return fn();
  } finally {
    setActivePinia(undefined);
  }
}
