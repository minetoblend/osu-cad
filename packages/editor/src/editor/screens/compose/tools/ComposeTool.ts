import { Beatmap, HitObjectManager } from '@osucad/common';
import {
  Axes,
  Container,
  InputManager,
  resolved,
  UIEvent,
} from 'osucad-framework';
import { CommandContainer } from '../../../CommandContainer';
import { EditorClock } from '../../../EditorClock';
import { ComposeToolInteraction } from './interactions/ComposeToolInteraction';
import { EditorSelection } from '../EditorSelection';

export abstract class ComposeTool extends CommandContainer {
  protected constructor() {
    super({
      relativeSizeAxes: Axes.Both,
    });

    this.addAllInternal(
      (this.#content = new Container({
        relativeSizeAxes: Axes.Both,
      })),
      (this.#interactionContainer = new Container({
        relativeSizeAxes: Axes.Both,
      })),
    );
  }

  receivePositionalInputAt(): boolean {
    return true;
  }

  readonly #content: Container;

  override get content() {
    return this.#content;
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

  get beatSnapDivisor() {
    return this.editorClock.beatSnapDivisor.value;
  }

  @resolved(Beatmap)
  protected readonly beatmap!: Beatmap;

  @resolved(HitObjectManager)
  protected readonly hitObjects!: HitObjectManager;

  @resolved(EditorClock)
  protected readonly editorClock!: EditorClock;

  @resolved(EditorSelection)
  protected readonly selection!: EditorSelection;

  #currentInteraction: ComposeToolInteraction | null = null;

  #interactionContainer: Container;

  beginInteraction(interaction: ComposeToolInteraction) {
    this.cancelCurrentInteraction();

    this.withScope(() => {
      interaction.completed.addListener(() => {
        console.debug('Interaction completed', interaction);
        if (this.#currentInteraction === interaction) {
          this.#currentInteraction = null;
        }
      });
      interaction.cancelled.addListener(() => {
        console.debug('Interaction cancelled', interaction);
        if (this.#currentInteraction === interaction) {
          this.#currentInteraction = null;
        }
      });
    });

    this.#currentInteraction = interaction;
    this.#interactionContainer.add(interaction);

    // making sure that the interaction has correct transforms
    this.#interactionContainer.updateChildrenLife();
    interaction.updateDrawNodeTransform();

    console.debug('Interaction started', interaction);
  }

  cancelCurrentInteraction(): boolean {
    if (this.#currentInteraction) {
      this.#currentInteraction.cancel();
      return true;
    }

    return false;
  }

  triggerEvent(e: UIEvent): boolean {
    if (this.#currentInteraction && this.#currentInteraction.triggerEvent(e)) {
      return true;
    }

    return super.triggerEvent(e);
  }
}
