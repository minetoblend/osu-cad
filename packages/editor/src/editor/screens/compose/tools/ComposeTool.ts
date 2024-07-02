import { Beatmap, HitObjectManager } from '@osucad/common';
import { Axes, InputManager, resolved } from 'osucad-framework';
import { CommandContainer } from '../../../CommandContainer';
import { EditorClock } from '../../../EditorClock';

export abstract class ComposeTool extends CommandContainer {
  protected constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });
  }

  #inputManager: InputManager | null = null;

  get inputManager(): InputManager {
    if (!this.#inputManager) {
      this.#inputManager ??= this.getContainingInputManager();

      if (!this.#inputManager) throw new Error('InputManager not found');
    }

    return this.#inputManager;
  }

  get mousePosition() {
    return this.toLocalSpace(this.inputManager.currentState.mouse.position);
  }

  @resolved(Beatmap)
  protected readonly beatmap!: Beatmap;

  @resolved(HitObjectManager)
  protected readonly hitObjects!: HitObjectManager;

  @resolved(EditorClock)
  protected readonly editorClock!: EditorClock;
}
