import type { Drawable } from "../graphics";

export interface IFocusManager 
{
  readonly isFocusManger: true;

  changeFocus: (potentialFocusTarget: Drawable | null) => void;
}

export function isFocusManager(value: any): value is IFocusManager 
{
  return value?.isFocusManger === true;
}
