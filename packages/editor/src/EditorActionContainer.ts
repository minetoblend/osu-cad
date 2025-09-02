import type { ContainerOptions, IKeyBinding, KeyCombinationString } from "@osucad/framework";
import { KeyBinding, KeyBindingContainer, KeyCombination, KeyCombinationMatchingMode, resolved, SimultaneousBindingMode } from "@osucad/framework";
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

export function keyBinding(keyCombination: KeyCombinationString, action: EditorAction | keyof typeof EditorAction)
{
  return new KeyBinding(
      KeyCombination.parse(keyCombination),
      action instanceof EditorAction
        ? action
        : EditorAction[action],
  );
}
