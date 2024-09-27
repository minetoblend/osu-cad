import type {
  Action,
  DependencyContainer,
  InputManager,
  UIEvent,
} from 'osucad-framework';
import type { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import type { HitSoundState, HitSoundStateChangeEvent } from '../../../../beatmap/hitSounds/BindableHitSound';
import type { ComposeToolInteraction } from './interactions/ComposeToolInteraction';
import {
  Axes,
  BindableBoolean,
  clamp,
  Container,
  dependencyLoader,
  resolved,
  Vec2,
} from 'osucad-framework';
import { Beatmap } from '../../../../beatmap/Beatmap';
import { CommandContainer } from '../../../CommandContainer';
import { EditorClock } from '../../../EditorClock';
import { EditorDependencies } from '../../../EditorDependencies.ts';
import { OsuPlayfield } from '../../../hitobjects/OsuPlayfield';
import { EditorSelection } from '../EditorSelection';
import { HitObjectComposer } from '../HitObjectComposer';

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

  protected newCombo = new BindableBoolean();

  protected newComboApplied!: Action<boolean>;

  protected hitSoundState!: HitSoundState;

  receivePositionalInputAtLocal(): boolean {
    return true;
  }

  readonly #content: Container;

  override get content() {
    return this.#content;
  }

  protected inputManager!: InputManager;

  @dependencyLoader()
  [Symbol('load')](dependencies: DependencyContainer) {
    const { newCombo, newComboApplied, hitSound } = dependencies.resolve(EditorDependencies);

    this.newComboApplied = newComboApplied;

    this.newCombo.bindTo(newCombo);
    this.hitSoundState = hitSound;

    this.newComboApplied.addListener(this.applyNewComboState, this);
    this.hitSoundState.changed.addListener(this.applyHitSoundState, this);
  }

  protected loadComplete(): void {
    super.loadComplete();

    this.inputManager = this.getContainingInputManager()!;
    this.composer = this.findClosestParentOfType(HitObjectComposer)!;

    if (!this.composer) {
      throw new Error('ComposeTool must be a child oif HitObjectComposer');
    }
  }

  protected applyNewComboState(newCombo: boolean): void {
  }

  protected applyHitSoundState(event: HitSoundStateChangeEvent): void {
  }

  protected get mousePosition() {
    return this.toLocalSpace(this.inputManager.currentState.mouse.position);
  }

  get beatSnapDivisor() {
    return this.editorClock.beatSnapDivisor.value;
  }

  @resolved(Beatmap)
  protected readonly beatmap!: Beatmap;

  protected get hitObjects() {
    return this.beatmap.hitObjects;
  }

  @resolved(EditorClock)
  protected readonly editorClock!: EditorClock;

  @resolved(EditorSelection)
  protected readonly selection!: EditorSelection;

  protected composer!: HitObjectComposer;

  #currentInteraction: ComposeToolInteraction | null = null;

  #interactionContainer: Container;

  protected beginInteraction(interaction: ComposeToolInteraction) {
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

  protected cancelCurrentInteraction(): boolean {
    if (this.#currentInteraction) {
      this.#currentInteraction.cancel();
      return true;
    }

    return false;
  }

  protected completeCurrentInteraction(): boolean {
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

  @resolved(OsuPlayfield)
  protected playfield!: OsuPlayfield;

  protected get visibleObjects(): OsuHitObject[] {
    const entries = this.playfield.hitObjectContainer.aliveEntries.keys();

    return [...entries].map(it => it.hitObject).filter(it => it.isVisibleAtTime(this.editorClock.currentTime)) as OsuHitObject[];
  }

  protected hoveredHitObjects(position: Vec2): OsuHitObject[] {
    return this.visibleObjects.filter(it => it.contains(position));
  }

  protected getSelectionCandidate(hitObjects: OsuHitObject[]) {
    const selected = hitObjects.find(it => it.isSelected);
    if (selected)
      return selected;

    let min = Infinity;
    let candidate: OsuHitObject | null = null;

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
