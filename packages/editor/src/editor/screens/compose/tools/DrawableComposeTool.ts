import {
  Additions,
  Beatmap,
  type HitObject,
  HitObjectManager,
} from '@osucad/common';
import type {
  Bindable,
  InputManager,
  UIEvent,
} from 'osucad-framework';
import {
  Axes,
  Container,
  Vec2,
  clamp,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import { CommandContainer } from '../../../CommandContainer';
import { EditorClock } from '../../../EditorClock';
import { EditorSelection } from '../EditorSelection';
import {
  NEW_COMBO,
  SAMPLE_CLAP,
  SAMPLE_FINISH,
  SAMPLE_WHISTLE,
} from '../../../InjectionTokens';
import type { ToggleBindable } from '../ToggleBindable';
import { HitObjectComposer } from '../HitObjectComposer';
import type { ComposeToolInteraction } from './interactions/ComposeToolInteraction';

export abstract class DrawableComposeTool extends CommandContainer {
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

    this.inputManager = this.getContainingInputManager()!;
    this.composer = this.findClosestParentOfType(HitObjectComposer)!;

    if (!this.composer) {
      throw new Error('ComposeTool must be a child oif HitObjectComposer');
    }
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.newCombo.addOnChangeListener((newCombo) => {
      this.applyNewCombo(newCombo);
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

  protected composer!: HitObjectComposer;

  #currentInteraction: ComposeToolInteraction | null = null;

  #interactionContainer: Container;

  beginInteraction(interaction: ComposeToolInteraction) {
    this.completeCurrentInteraction();

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

  completeCurrentInteraction(): boolean {
    if (this.#currentInteraction) {
      this.#currentInteraction.complete();
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

  protected get visibleObjects(): HitObject[] {
    return this.hitObjects.hitObjects.filter((it) => {
      if (this.selection.isSelected(it))
        return true;

      return it.isVisibleAtTime(this.editorClock.currentTime);
    });
  }

  protected hoveredHitObjects(position: Vec2) {
    return this.visibleObjects.filter(it => it.contains(position));
  }

  protected findClosestToCurrentTime(hitObjects: HitObject[]) {
    let min = Infinity;
    let candidate: HitObject | null = null;

    for (const hitObject of hitObjects) {
      const distance = Math.min(
        Math.abs(hitObject.startTime - this.editorClock.currentTime),
        Math.abs(hitObject.endTime - this.editorClock.currentTime),
      );

      if (distance < min) {
        min = distance;
        candidate = hitObject;
      }
    }

    return candidate;
  }
}
