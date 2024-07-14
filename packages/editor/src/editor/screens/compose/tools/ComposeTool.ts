import {
  Additions,
  Beatmap,
  HitObjectManager,
  SampleType,
} from '@osucad/common';
import {
  Axes,
  Bindable,
  clamp,
  Container,
  dependencyLoader,
  InputManager,
  resolved,
  UIEvent,
  Vec2,
} from 'osucad-framework';
import { CommandContainer } from '../../../CommandContainer';
import { EditorClock } from '../../../EditorClock';
import { ComposeToolInteraction } from './interactions/ComposeToolInteraction';
import { EditorSelection } from '../EditorSelection';
import {
  NEW_COMBO,
  SAMPLE_CLAP,
  SAMPLE_FINISH,
  SAMPLE_WHISTLE,
} from '../../../InjectionTokens';
import { ToggleBindable } from '../ToggleBindable';

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

  @resolved(NEW_COMBO)
  protected newCombo!: ToggleBindable;

  @resolved(SAMPLE_WHISTLE)
  protected sampleWhistle!: ToggleBindable;

  @resolved(SAMPLE_FINISH)
  protected sampleFinish!: ToggleBindable;

  @resolved(SAMPLE_CLAP)
  protected sampleClap!: ToggleBindable;

  receivePositionalInputAt(): boolean {
    return true;
  }

  readonly #content: Container;

  override get content() {
    return this.#content;
  }

  protected inputManager!: InputManager;

  protected loadComplete(): void {
    super.loadComplete();
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.newCombo.addOnChangeListener((newCombo) => {
      if (this.newCombo.buttonPressed) this.applyNewCombo(newCombo);
    });
    this.sampleWhistle.addOnChangeListener(() => {
      if (this.sampleWhistle.buttonPressed)
        this.applySampleType(Additions.Whistle, this.sampleWhistle);
    });
    this.sampleFinish.addOnChangeListener(() => {
      if (this.sampleFinish.buttonPressed)
        this.applySampleType(Additions.Finish, this.sampleFinish);
    });
    this.sampleClap.addOnChangeListener(() => {
      if (this.sampleClap.buttonPressed)
        this.applySampleType(Additions.Clap, this.sampleClap);
    });
  }

  abstract applyNewCombo(newCombo: boolean): void;

  abstract applySampleType(
    addition: Additions,
    bindable: Bindable<boolean>,
  ): void;

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

  update() {
    super.update();

    this.inputManager ??= this.getContainingInputManager()!;
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

  protected clampToPlayfieldBounds(position: Vec2) {
    return new Vec2(clamp(position.x, 0, 512), clamp(position.y, 0, 384));
  }
}
