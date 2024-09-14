import type {
  ClickEvent,
  DragStartEvent,
  IKeyBindingHandler,
  KeyBindingPressEvent,
  MouseDownEvent,
  ValueChangedEvent,
  Vec2,
} from 'osucad-framework';
import { Anchor, dependencyLoader, MouseButton, RoundedBox } from 'osucad-framework';
import { EditorAction } from '../../../EditorAction';
import type { HitObject } from '../../../../beatmap/hitObjects/HitObject';
import type { OsuHitObject } from '../../../../beatmap/hitObjects/OsuHitObject';
import { Slider } from '../../../../beatmap/hitObjects/Slider';
import { UpdateHitObjectCommand } from '../../../commands/UpdateHitObjectCommand';
import { DeleteHitObjectCommand } from '../../../commands/DeleteHitObjectCommand';
import { Additions } from '../../../../beatmap/hitSounds/Additions';
import { DrawableComposeTool } from './DrawableComposeTool';
import { SelectBoxInteraction } from './interactions/SelectBoxInteraction';
import { MoveSelectionInteraction } from './interactions/MoveSelectionInteraction';
import { SliderPathVisualizer } from './SliderPathVisualizer';
import { DistanceSnapProvider } from './DistanceSnapProvider';
import { SliderUtils } from './SliderUtils';
import { InsertControlPointInteraction } from './interactions/InsertControlPointInteraction';
import { RotateSelectionInteraction } from './interactions/RotateSelectionInteraction';
import { ScaleSelectionInteraction } from './interactions/ScaleSelectionInteraction';
import { HitSoundStateChangeEvent } from '../../../../beatmap/hitSounds/BindableHitSound.ts';
import { SampleSet } from '../../../../beatmap/hitSounds/SampleSet.ts';
import { SliderSelectionType } from '../../../../beatmap/hitObjects/SliderSelection.ts';

export class DrawableSelectTool extends DrawableComposeTool implements IKeyBindingHandler<EditorAction> {
  constructor() {
    super();

    this.addAll(
      this.#sliderPathVisualizer,
      this.#snapProvider,
      this.#sliderInsertPointVisualizer,
    );
  }

  #snapProvider = new DistanceSnapProvider();

  #sliderPathVisualizer = new SliderPathVisualizer();

  #sliderUtils!: SliderUtils;

  override onMouseDown(e: MouseDownEvent): boolean {
    this.#canCycleSelection = false;

    if (e.button === MouseButton.Left) {
      if (e.controlPressed && this.#sliderInsertPoint && this.activeSlider) {
        this.selection.select([this.activeSlider], true);

        this.beginInteraction(
          new InsertControlPointInteraction(
            this.activeSlider,
            this.#sliderInsertPoint.position,
            this.#sliderInsertPoint.index,
          ),
        );
        return true;
      }

      const hovered = this.hoveredHitObjects(e.mousePosition);

      if (hovered.length === 0) {
        this.beginInteraction(new SelectBoxInteraction(e.mousePosition));
        return true;
      }

      const candidate = this.getSelectionCandidate(hovered)!;
      if (e.controlPressed) {
        if (
          this.selection.length <= 1
          || !this.selection.isSelected(candidate)
        ) {
          this.selection.select([candidate], true);
          return true;
        }

        this.selection.deselect(candidate);
        return true;
      }

      if (!this.selection.isSelected(candidate) && hovered.every(it => !it.isSelected)) {
        this.selection.select([candidate]);
      } else if (!this.#trySelectSliderEdges(candidate, e.mousePosition)) {
        this.#canCycleSelection = true;
      }

      return true;
    } else if (e.button === MouseButton.Right) {
      const hovered = this.hoveredHitObjects(e.mousePosition);

      if (hovered.length === 0) {
        return false;
      }

      const candidate = this.getSelectionCandidate(hovered)!;

      if (candidate.isSelected) {
        for (const object of this.selection.selectedObjects) {
          this.submit(new DeleteHitObjectCommand(object), false);
        }
        this.commit();
      } else {
        this.submit(new DeleteHitObjectCommand(candidate));
      }

      return true;
    }

    return false;
  }

  onClick(e: ClickEvent): boolean {
    if (e.button === MouseButton.Left && this.#canCycleSelection) {
      this.#cycleSelection(
        this.hoveredHitObjects(
          this.toLocalSpace(
            e.screenSpaceMouseDownPosition ?? e.screenSpaceMousePosition,
          ),
        ),
      );
    }

    return false;
  }

  #canCycleSelection = false;

  #cycleSelection(hitObjects: OsuHitObject[]) {
    const currentSelection = [...this.selection.selectedObjects];
    const index = hitObjects.indexOf(currentSelection[0]);
    if (index !== -1) {
      this.selection.select([hitObjects[(index + 1) % hitObjects.length]]);
    }
  }

  onDragStart(e: DragStartEvent): boolean {
    if (e.button === MouseButton.Left) {
      if (this.selection.length > 0) {
        const hovered = this.hoveredHitObjects(e.mousePosition);
        if (hovered.length === 0)
          return false;

        const startPosition = this.toLocalSpace(
          e.screenSpaceMouseDownPosition ?? e.screenSpaceMousePosition,
        );

        this.beginInteraction(
          new MoveSelectionInteraction(
            this.selection.selectedObjects,
            startPosition,
          ),
        );
      }
    }

    return false;
  }

  update() {
    super.update();

    this.#updateSliderPathVisualizer(
      this.hoveredHitObjects(this.mousePosition),
      this.inputManager.currentState.keyboard.controlPressed,
    );
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    this.#updateNewComboFromSelection();
  }

  #updateSliderPathVisualizer(
    hoveredHitObjects: HitObject[],
    controlPressed: boolean,
  ) {
    if (this.#isDragging) {
      return;
    }

    let slider: Slider | null = null;

    const selection = this.selection.selectedObjects;
    if (selection.length === 1 && selection[0] instanceof Slider) {
      slider = selection[0];
    } else if (hoveredHitObjects.every(it => !it.isSelected)) {
      slider = (hoveredHitObjects.find(it => it instanceof Slider)
        ?? null) as Slider | null;
    }

    this.activeSlider = slider;

    if (slider && controlPressed) {
      this.#sliderInsertPoint = this.#sliderUtils.getInsertPoint(
        slider,
        this.mousePosition,
      )?.position ?? null;
    } else {
      this.#sliderInsertPoint = null;
    }

    if (this.#sliderInsertPoint) {
      this.#sliderInsertPointVisualizer.alpha = 1;
      this.#sliderInsertPointVisualizer.position = slider!.stackedPosition.add(
        this.#sliderInsertPoint.position,
      );
    } else {
      this.#sliderInsertPointVisualizer.alpha = 0;
    }
  }

  #sliderInsertPoint: { position: Vec2; index: number } | null = null;

  #sliderInsertPointVisualizer: RoundedBox = new RoundedBox({
    width: 6,
    height: 6,
    cornerRadius: 2,
    origin: Anchor.Center,
    alpha: 0,
  });

  @dependencyLoader()
  load() {
    this.#sliderUtils = new SliderUtils(this.commandManager, this.#snapProvider);

    this.dependencies.provide(this.#snapProvider);

    this.#sliderPathVisualizer.onHandleMouseDown = this.#onHandleMouseDown;
    this.#sliderPathVisualizer.onHandleDragStarted = this.#onHandleDragStarted;
    this.#sliderPathVisualizer.onHandleDragged = this.#onHandleDragged;
    this.#sliderPathVisualizer.onHandleDragEnded = this.#onHandleDragEnded;

    this.selection.selectionChanged.addListener(this.#updateHitSoundsFromSelection, this);

    this.#updateHitSoundsFromSelection();
  }

  protected applyNewComboState(event: ValueChangedEvent<boolean>) {
    super.applyNewComboState(event);

    const objects = this.selection.selectedObjects;
    if (objects.length === 0)
      return;

    const newCombo = event.value;

    if (this.newComboEnabledForEntireSelection !== newCombo) {
      for (const object of objects) {
        this.commandManager.submit(
          new UpdateHitObjectCommand(object, { newCombo }),
          false,
        );
      }
    }

    this.commit();
  }

  protected applyHitSoundState(event: HitSoundStateChangeEvent) {
    super.applyHitSoundState(event);
    if (this.selection.length === 0)
      return;

    const type = event[0];

    if (type === 'additions') {
      const changed = event[1];

      for (const hitObject of this.selection) {
        if (hitObject instanceof Slider) {
          const patch = hitObject.subSelection.createAdditionsPatch(this.hitSoundState.additions, changed);

          if (patch)
            this.submit(new UpdateHitObjectCommand(hitObject, patch), false);

          continue;
        }

        const newAdditions = (hitObject.hitSound.additions & ~changed) | (this.hitSoundState.additions & changed);

        if (hitObject.hitSound.additions !== newAdditions) {
          this.submit(
            new UpdateHitObjectCommand(hitObject, {
              hitSound: hitObject.hitSound.withAdditions(newAdditions),
            }),
            false,
          );
        }
      }
    }

    if (type === 'sampleSet') {
      for (const hitObject of this.selection.selectedObjects) {
        if (hitObject instanceof Slider) {
          const patch = hitObject.subSelection.createSampleSetPatch(this.hitSoundState.sampleSet);

          if (patch)
            this.submit(new UpdateHitObjectCommand(hitObject, patch), false);

          continue;
        }

        if (hitObject.hitSound.sampleSet !== this.hitSoundState.sampleSet) {
          this.submit(
            new UpdateHitObjectCommand(hitObject, {
              hitSound: hitObject.hitSound.withSampleSet(this.hitSoundState.sampleSet),
            }),
            false,
          );
        }
      }
    }

    if (type === 'additionSampleSet') {
      for (const hitObject of this.selection.selectedObjects) {
        if (hitObject instanceof Slider) {
          const patch = hitObject.subSelection.createAdditionSampleSetPatch(this.hitSoundState.additionsSampleSet);

          if (patch)
            this.submit(new UpdateHitObjectCommand(hitObject, patch), false);

          continue;
        }

        const hitSound = hitObject.hitSound.withAdditionSampleSet(this.hitSoundState.additionsSampleSet);
        this.submit(
          new UpdateHitObjectCommand(hitObject, {
            hitSound,
          }),
          false,
        );
      }
    }


    this.commit();
  }

  #isDragging = false;

  #isCycleControlPointEvent(e: MouseDownEvent) {
    if (navigator.userAgent.includes('Mac')) {
      return e.metaPressed;
    }

    return e.controlPressed;
  }

  #onHandleMouseDown = (index: number, e: MouseDownEvent) => {
    const slider = this.activeSlider!;

    if (e.button === MouseButton.Right) {
      this.#sliderUtils.deleteControlPoint(slider, index);
      return true;
    }

    if (e.button === MouseButton.Left && this.#isCycleControlPointEvent(e)) {
      this.#sliderUtils.cycleControlPointType(slider, index);
      return true;
    }

    if (!slider.isSelected) {
      this.selection.select([slider]);
    }

    return true;
  };

  #onHandleDragStarted = (_: number, e: DragStartEvent) => {
    if (e.button === MouseButton.Left) {
      this.#isDragging = true;
      return true;
    }
    return false;
  };

  #onHandleDragged = (index: number, e: DragStartEvent) => {
    const slider = this.activeSlider;
    if (!slider)
      return false;

    const position = this.toLocalSpace(e.screenSpaceMousePosition);

    this.#sliderUtils.moveControlPoint(slider, index, position);

    return true;
  };

  #onHandleDragEnded = () => {
    this.commit();
    this.#isDragging = false;
  };

  #updateNewComboFromSelection() {
    if (this.selection.length === 0) {
      this.newCombo.value = false;
      return;
    }

    this.newCombo.value = this.newComboEnabledForEntireSelection;
  }

  get newComboEnabledForEntireSelection() {
    return this.selection.selectedObjects.every(
      it => it.newCombo || it === this.hitObjects.first,
    );
  }

  #updateHitSoundsFromSelection() {
    if (this.selection.length === 0) {
      this.hitSoundState.setAdditions(Additions.None, false);
      this.hitSoundState.setSampleSet(SampleSet.Auto, false);
      this.hitSoundState.setAdditionSampleSet(SampleSet.Auto, false);
      return;
    }

    let additions = Additions.All;

    for (const object of this.selection) {
      if (object instanceof Slider) {
        additions &= object.subSelection.getCombinedAdditions();
        continue;
      }

      additions &= object.hitSound.additions;
    }

    this.hitSoundState.setAdditions(additions, false);

    let sampleSet = null;

    for (const object of this.selection.selectedObjects) {
      if (object instanceof Slider) {
        const combinedSampleSet = object.subSelection.getCombinedSampleSet('sampleSet');

        if (sampleSet === null) {
          sampleSet = combinedSampleSet;
        } else if (combinedSampleSet !== sampleSet) {
          sampleSet = SampleSet.Auto;
          break;
        }
        continue;
      }

      if (sampleSet === null) {
        sampleSet = object.hitSound.sampleSet;
      } else if (object.hitSound.sampleSet !== sampleSet) {
        sampleSet = SampleSet.Auto;
        break;
      }
    }

    this.hitSoundState.setSampleSet(sampleSet ?? SampleSet.Auto, false);

    sampleSet = null;

    for (const object of this.selection.selectedObjects) {
      if (object instanceof Slider) {
        const combinedSampleSet = object.subSelection.getCombinedSampleSet('additionSampleSet');

        if (sampleSet === null) {
          sampleSet = combinedSampleSet;
        } else if (combinedSampleSet !== sampleSet) {
          sampleSet = SampleSet.Auto;
          break;
        }
        continue;
      }

      if (sampleSet === null) {
        sampleSet = object.hitSound.additionSampleSet;
      } else if (object.hitSound.additionSampleSet !== sampleSet) {
        sampleSet = SampleSet.Auto;
        break;
      }
    }

    this.hitSoundState.setAdditionSampleSet(sampleSet ?? SampleSet.Auto, false);
  }

  get activeSlider() {
    return this.#sliderPathVisualizer.slider;
  }

  set activeSlider(value: Slider | null) {
    this.#sliderPathVisualizer.slider = value;
  }

  #trySelectSliderEdges(hitObject: HitObject, position: Vec2) {
    if (!(hitObject instanceof Slider)) {
      return false;
    }

    const distanceToStart = position.distance(hitObject.stackedPosition);

    if (distanceToStart < hitObject.radius) {
      this.selection.setSliderSelection(hitObject, SliderSelectionType.Head);
      return true;
    }

    const distanceToEnd = position.distance(hitObject.stackedPosition.add(hitObject.path.endPosition));

    if (distanceToEnd < hitObject.radius) {
      this.selection.setSliderSelection(hitObject, SliderSelectionType.Tail);

      return true;
    }

    this.selection.setSliderSelection(hitObject, SliderSelectionType.Body);

    return true;
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding instanceof EditorAction;
  }

  onKeyBindingPressed?(e: KeyBindingPressEvent<EditorAction>): boolean {
    switch (e.pressed) {
      case EditorAction.Rotate:
        if (this.selection.length > 0) {
          this.beginInteraction(
            new RotateSelectionInteraction(this.selection.selectedObjects),
          );
        }
        return true;
      case EditorAction.Scale:
        if (this.selection.length > 0) {
          this.beginInteraction(
            new ScaleSelectionInteraction(this.selection.selectedObjects),
          );
        }
        return true;
    }
    return false;
  }
}
