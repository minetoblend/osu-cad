import type { HotkeyEvent } from "./HotkeyEvent";
import type { Drawable } from "@osucad/framework";

export interface HotkeyHandler
{
  test(event: HotkeyEvent): boolean

  onPress(this: Drawable, event: HotkeyEvent): boolean

  onRelease(this: Drawable, event: HotkeyEvent): void
}

export type HotKeyHandlerOptions = Pick<HotkeyHandler, "test"> & Partial<Omit<HotkeyHandler, "test">>;

export function defineHotkeyHandler(options: HotKeyHandlerOptions): HotkeyHandler
{
  return {
    onPress: (event: HotkeyEvent) => false,
    onRelease: (event: HotkeyEvent) =>
    {},
    ...options,
  };
}
