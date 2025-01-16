import type { IHitSound } from '@osucad/core';
import type { Drawable, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { OsuSelectionManager, SliderSelectionType } from './OsuSelectionManager';
import { Additions, DrawableComposeTool, EditorAction, hasComboInformation, HitSound, TernaryState } from '@osucad/core';
import { Bindable, Direction, PlatformAction, resolved, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { OsuHitObject } from '../hitObjects/OsuHitObject';
import { Slider } from '../hitObjects/Slider';
import { Spinner } from '../hitObjects/Spinner';
import { GlobalHitSoundState } from './GlobalHitSoundState';
import { GlobalNewComboBindable } from './GlobalNewComboBindable';
import { HitSoundStateBuilder } from './HitSoundStateBuilder';
import { MobileControlButton } from './MobileEditorControls';
import { ConvertToStreamOperator } from './operators/ConvertToStreamOperator';
import { MoveInteraction } from './operators/MoveInteraction';
import { RotateInteraction } from './operators/RotateInteraction';
import { RotateOperator } from './operators/RotateOperator';
import { OsuHitObjectComposer } from './OsuHitObjectComposer';

export class DrawableOsuSelectTool extends DrawableComposeTool implements IKeyBindingHandler<PlatformAction | EditorAction> {
  @resolved(() => OsuHitObjectComposer)
  composer!: OsuHitObjectComposer;

  @resolved(GlobalNewComboBindable)
  newCombo!: GlobalNewComboBindable;

  @resolved(GlobalHitSoundState)
  hitSounds!: GlobalHitSoundState;

  whistleAddition = new Bindable(TernaryState.Indeterminate);
  finishAddition = new Bindable(TernaryState.Indeterminate);
  clapAddition = new Bindable(TernaryState.Indeterminate);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.whistleAddition.bindTo(this.hitSounds.whistle);
    this.finishAddition.bindTo(this.hitSounds.finish);
    this.clapAddition.bindTo(this.hitSounds.clap);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.newCombo.bindValueChanged(this.#applyNewCombo, this);

    this.whistleAddition.bindValueChanged(evt => this.#applyHitSoundsToSelection((it) => {
      if (evt.value === TernaryState.Active)
        it.additions |= Additions.Whistle;
      else if (evt.value === TernaryState.Inactive)
        it.additions &= ~Additions.Whistle;
    }));
    this.finishAddition.bindValueChanged(evt => this.#applyHitSoundsToSelection((it) => {
      if (evt.value === TernaryState.Active)
        it.additions |= Additions.Finish;
      else if (evt.value === TernaryState.Inactive)
        it.additions &= ~Additions.Finish;
    }));
    this.clapAddition.bindValueChanged(evt => this.#applyHitSoundsToSelection((it) => {
      if (evt.value === TernaryState.Active)
        it.additions |= Additions.Clap;
      else if (evt.value === TernaryState.Inactive)
        it.additions &= ~Additions.Clap;
    }));

    this.selection.selectionChanged.addListener(this.#selectionChanged, this);
  }

  #selectionChanged() {
    this.scheduler.addOnce(this.#updateFromSelectionChange, this);
  }

  #updateFromSelectionChange() {
    this.#updateNewComboFromSelection(true);
    this.#updateHitSoundsFromSelection(true);
  }

  #applyNewCombo() {
    if (this.newCombo.value === TernaryState.Indeterminate)
      return;

    for (const object of this.selection.selectedObjects) {
      if (hasComboInformation(object))
        object.newCombo = this.newCombo.value === TernaryState.Active;
    }

    this.commit();
  }

  override update() {
    super.update();

    this.#updateNewComboFromSelection();
    this.#updateHitSoundsFromSelection();
  }

  override createMobileControls(): Drawable[] {
    return [
      new MobileControlButton(getIcon('size-ew'), () => {
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Horizontal);
        this.commit();
      }),
      new MobileControlButton(getIcon('size-ns'), () => {
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Vertical);
        this.commit();
      }),
    ];
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return true;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof PlatformAction || binding instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<PlatformAction | EditorAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.Delete:
      case PlatformAction.DeleteBackwardChar:
        if (e.repeat)
          return false;

        for (const hitObject of [...this.selection.selectedObjects])
          this.hitObjects.remove(hitObject);
        this.commit();
        return true;

      case EditorAction.NudgeUp:
        this.moveSelection(new Vec2(0, -1));
        return true;
      case EditorAction.NudgeDown:
        this.moveSelection(new Vec2(0, 1));
        return true;
      case EditorAction.NudgeLeft:
        this.moveSelection(new Vec2(-1, 0));
        return true;
      case EditorAction.NudgeRight:
        this.moveSelection(new Vec2(1, 0));
        return true;
      case EditorAction.RotateCW:
        this.rotateSelection(90);
        return true;
      case EditorAction.RotateCCW:
        this.rotateSelection(-90);
        return true;
      case EditorAction.Move: {
        const objects = this.selectedNonSpinnerObjects;
        if (objects.length > 0)
          this.playfieldOverlay.add(new MoveInteraction(objects));
        return true;
      }
      case EditorAction.Rotate: {
        const objects = this.selectedNonSpinnerObjects;
        if (objects.length > 0)
          this.playfieldOverlay.add(new RotateInteraction(objects));
        return true;
      }

      case EditorAction.ConvertToStream:
        this.convertToStream();
        return true;
      case EditorAction.FlipHorizontal:
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Horizontal);
        this.commit();
        return true;
      case EditorAction.FlipVertical:
        this.composer.mirrorHitObjects([...this.selection.selectedObjects], Direction.Vertical);
        this.commit();
        return true;
    }

    return false;
  }

  get selectedNonSpinnerObjects(): OsuHitObject[] {
    return [...this.selection.selectedObjects].filter(it => !(it instanceof Spinner)) as OsuHitObject[];
  }

  rotateSelection(angle: number) {
    const selection = [...this.selection.selectedObjects]
      .filter(it => !(it instanceof Spinner)) as OsuHitObject[];

    const operator = this.composer.activeOperator;

    if (operator instanceof RotateOperator) {
      if (operator.hitObjects.every((it, index) => it === selection[index])) {
        angle = operator.angle.value + angle;

        while (angle >= 360)
          angle -= 360;

        while (angle <= -360)
          angle += 360;

        operator.angle.value = angle;
        return;
      }
    }

    this.composer.beginOperator(
      new RotateOperator(selection, angle),
    );
  }

  moveSelection(delta: Vec2) {
    const hitObjects = [...this.selection.selectedObjects] as OsuHitObject[];

    for (const hitObject of hitObjects)
      hitObject.moveBy(delta);

    this.moveIntoBounds(hitObjects);

    this.commit();
  }

  protected convertToStream() {
    const [slider] = [...this.selection.selectedObjects];
    if (slider && slider instanceof Slider) {
      if (slider.spanDuration <= 0)
        return;

      this.composer.beginOperator(new ConvertToStreamOperator(slider));
    }
  }

  protected moveIntoBounds(hitObjects: OsuHitObject[]) {
    const overflow = {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };

    for (const object of hitObjects) {
      const start = object.position;
      let end = start;
      if (object instanceof Slider)
        end = end.add(object.path.endPosition);

      const min = start.componentMin(end);
      const max = start.componentMax(end);

      if (min.x < 0)
        overflow.left = Math.max(overflow.left, -min.x);
      if (max.x > 512)
        overflow.right = Math.max(overflow.right, max.x - 512);

      if (min.y < 0)
        overflow.top = Math.max(overflow.top, -min.y);
      if (max.y > 384)
        overflow.bottom = Math.max(overflow.bottom, max.y - 384);
    }

    const offset = new Vec2();

    if (overflow.left && !overflow.right)
      offset.x = overflow.left;
    else if (overflow.right && !overflow.left)
      offset.x = -overflow.right;

    if (overflow.top && !overflow.bottom)
      offset.y = overflow.top;
    else if (overflow.bottom && !overflow.top)
      offset.y = -overflow.bottom;

    if (!offset.isZero) {
      for (const object of hitObjects)
        object.position = object.position.add(offset);
    }
  }

  #updateNewComboFromSelection(force = false) {
    if (this.selection.length === 0 && !force)
      return;

    let newCombo: TernaryState | null = null;

    for (const hitObject of this.selection.selectedObjects) {
      if (!hasComboInformation(hitObject))
        continue;

      const state = hitObject.newCombo ? TernaryState.Active : TernaryState.Inactive;

      if (newCombo === null)
        newCombo = state;
      else if (state !== newCombo)
        newCombo = TernaryState.Indeterminate;
    }

    this.newCombo.value = newCombo ?? TernaryState.Inactive;
  }

  #getSelectedEdges(slider: Slider, selectionType: SliderSelectionType): number[] {
    if (selectionType === 'body')
      return [];

    if (typeof selectionType === 'number')
      return [selectionType];

    const edges: number[] = [];

    if (selectionType === 'default') {
      for (let i = 0; i <= slider.spanCount; i++)
        edges.push(i);
      return edges;
    }

    switch (selectionType) {
      case 'head':
        for (let i = 0; i <= slider.spanCount; i += 2)
          edges.push(i);
        break;
      case 'tail':
        for (let i = 1; i <= slider.spanCount; i += 2)
          edges.push(i);
        break;
    }

    return edges;
  }

  #applyHitSoundsToSelection(updateFn: (hitSound: IHitSound) => void) {
    const updateHitSound = (hitSound: HitSound) => {
      const result: IHitSound = {
        sampleSet: hitSound.sampleSet,
        additionSampleSet: hitSound.additionSampleSet,
        additions: hitSound.additions,
      };

      updateFn(result);

      return new HitSound(result.sampleSet, result.additionSampleSet, result.additions);
    };

    for (const hitObject of this.selection.selectedObjects) {
      if (!(hitObject instanceof OsuHitObject))
        continue;

      if (hitObject instanceof Slider) {
        const selectionType = (this.selection as unknown as OsuSelectionManager).getSelectionType(hitObject);

        hitObject.ensureHitSoundsAreValid();

        if (selectionType === 'body' || selectionType === 'default')
          hitObject.hitSound = updateHitSound(hitObject.hitSound);

        const edges = this.#getSelectedEdges(hitObject, selectionType);

        if (edges.length > 0) {
          const hitSounds = [...hitObject.hitSounds];
          for (const edge of edges)
            hitSounds[edge] = updateHitSound(hitSounds[edge]);

          hitObject.hitSounds = hitSounds;
        }
      }
      else {
        hitObject.hitSound = updateHitSound(hitObject.hitSound);
      }
    }
    this.commit();
  }

  #updateHitSoundsFromSelection(force = false) {
    if (this.selection.length === 0 && !force)
      return;

    const hitSounds = new HitSoundStateBuilder();

    for (const hitObject of this.selection.selectedObjects) {
      if (!(hitObject instanceof OsuHitObject))
        continue;

      if (hitObject instanceof Slider) {
        const selectionType = (this.selection as unknown as OsuSelectionManager).getSelectionType(hitObject);

        hitObject.ensureHitSoundsAreValid();

        if (selectionType === 'body' || selectionType === 'default')
          hitSounds.add(hitObject.hitSound);

        const edges = this.#getSelectedEdges(hitObject, selectionType);

        for (const edge of edges)
          hitSounds.add(hitObject.hitSounds[edge]);
      }
      else {
        hitSounds.add(hitObject.hitSound);
      }
    }

    this.hitSounds.whistle.value = hitSounds.getAdditionTernary(Additions.Whistle);
    this.hitSounds.finish.value = hitSounds.getAdditionTernary(Additions.Finish);
    this.hitSounds.clap.value = hitSounds.getAdditionTernary(Additions.Clap);

    this.hitSounds.sampleSet.value = hitSounds.sampleSet;
    this.hitSounds.additionsSampleSet.value = hitSounds.additionSampleSet;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.selection.selectionChanged.removeListener(this.#selectionChanged, this);
  }
}
