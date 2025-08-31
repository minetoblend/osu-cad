import type { ContainerOptions, IKeyBinding } from "@osucad/framework";
import { InputKey, KeyBinding, KeyBindingContainer, KeyCombination, KeyCombinationMatchingMode, resolved, SimultaneousBindingMode } from "@osucad/framework";
import { EditorAction } from "./EditorAction";
import { EditorRuleset } from "./EditorRuleset";

export class EditorActionContainer extends KeyBindingContainer<EditorAction>
{
  @resolved(EditorRuleset)
  accessor #editorRuleset!: EditorRuleset

  public constructor(options: ContainerOptions = {})
  {
    super(SimultaneousBindingMode.None, KeyCombinationMatchingMode.Modifiers);

    this.with(options);
  }

  protected override get defaultKeyBindings(): IKeyBinding[]
  {
    const keyBindings = [
      keyBinding("Left", EditorAction.SeekBackward),
      keyBinding("Right", EditorAction.SeekForward),
      keyBinding("Z", EditorAction.SeekToStart),
      keyBinding("C", EditorAction.PlayFromStart),
      keyBinding("V", EditorAction.SeekToEnd),
    ];

    return [...keyBindings, ...this.#editorRuleset.getDefaultKeyBindings()];
  }

  protected override get prioritised(): boolean
  {
    return true;
  }
}

export type KeyCombinationString =
  | `${"Control+" | ""}${"Shift+" | ""}${"Alt+" | ""}${Exclude<keyof typeof InputKey, "Control" | "Shift" | "Alt">}`;

export function parseKeyCombination(keyCombination: KeyCombinationString)
{
  const keys: InputKey[] = [];

  for (const key of keyCombination.split("+"))
  {
    keys.push(InputKey[key as keyof typeof InputKey]);
  }
  console.assert(keys.length > 0);

  return KeyCombination.from(...keys);
}

export function keyBinding(keyCombination: KeyCombinationString, action: EditorAction | keyof typeof EditorAction)
{
  return new KeyBinding(
      parseKeyCombination(keyCombination),
      action instanceof EditorAction
        ? action
        : EditorAction[action],
  );
}
