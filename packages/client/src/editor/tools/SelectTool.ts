import {ComposeTool} from "./ComposeTool.ts";
import {SelectBoxInteraction} from "./interactions/SelectBoxInteraction.ts";
import {SelectToolSliderPathVisualizer} from "./SelectToolSliderPathVisualizer.ts";
import {
  Additions,
  EditorCommand,
  HitCircle,
  HitObject,
  hitObjectId,
  HitSound,
  IVec2,
  PathType,
  Preferences,
  Rect,
  SampleSet,
  Slider,
  updateHitObject,
  Vec2,
} from "@osucad/common";
import {RotateHitObjectsInteraction} from "./interactions/RotateHitObjectsInteration.ts";
import {Assets, FederatedPointerEvent} from "pixi.js";
import {MoveHitObjectsInteraction} from "./interactions/MoveHitObjectsInteraction.ts";
import {InsertControlPointInteraction} from "./interactions/InsertControlPointInteraction.ts";
import {ScaleHitObjectsInteraction} from "./interactions/ScaleHitObjectsInteration.ts";
import {Inject} from "../drawables/di";
import {PopoverContainer} from "../drawables/menu/PopoverContainer.ts";
import {Menu} from "../drawables/menu/Menu.ts";
import {MenuItemOptions} from "../drawables/menu/MenuItem.ts";
import {reverseHitObjects} from "../interaction/reverseHitObjects.ts";
import {InsertAxisInteraction} from "./interactions/InsertAxisInteraction.ts";
import {PathApproximator, Vector2} from "osu-classes";
import {clamp} from "@vueuse/core";
import {usePreferences} from "@/composables/usePreferences.ts";
import {LongPressInteraction} from "@/editor/tools/interactions/LongPressInteraction.ts";
import {ButtonPanelButton} from "@/editor/drawables/buttonPanel.ts";
import {mirrorHitObjects} from "@/editor/interaction/mirrorHitObjects.ts";
import {getHitObjectPositions} from "@/editor/tools/snapping/HitObjectSnapProvider.ts";
import {transformHitObjects} from "@/editor/tools/interactions/TransformHitObjects.ts";

export class SelectTool extends ComposeTool {

  preferences: Preferences

  constructor() {
    super();
    const {preferences} = usePreferences()
    this.preferences = preferences

    this.overlay.addChild(this.sliderVisualizer);
  }

  private sliderVisualizer = new SelectToolSliderPathVisualizer(this);
  private canCycleSelection = false;

  @Inject(PopoverContainer)
  private popoverContainer!: PopoverContainer;

  protected onMouseDown(evt: FederatedPointerEvent) {
    super.onMouseDown(evt);
    if (evt.propagationImmediatelyStopped) return;

    const isDoubleTap =
      this.lastTap &&
      performance.now() - this.lastTap.time < 300 &&
      Vec2.distance(this.lastTap.position, this.mousePos) < 10;
    this.recognizeDoubleTap()


    if (this.hasInteraction) return;
    if (evt.button === 0) {
      if (
        (evt.ctrlKey || (evt.pointerType === 'touch' && isDoubleTap)) &&
        this.sliderVisualizer.slider &&
        this.insertControlPoint(this.sliderVisualizer.slider, evt)
      ) {
        return;
      }

      this.canCycleSelection = !this.trySelectOnMousedown(evt);
      if (this.hoveredHitObjects.length > 0) {
        if (evt.pointerType === 'touch') {
          this.beginInteraction(LongPressInteraction, {
            action: () => this.showContextMenu(this.toGlobal(this.mousePos)),
            onMoveCancel: () => {
              this.beginInteraction(MoveHitObjectsInteraction, this.selectedObjects);
            }
          });
        } else
          this.beginInteraction(MoveHitObjectsInteraction, this.selectedObjects);
      }

    } else if (evt.button === 2) {
      let action: 'delete' | 'contextmenu' = 'delete';
      if (this.preferences.behavior.rightClickBehavior === 'contextMenu') {
        if (!evt.shiftKey)
          action = 'contextmenu';
      } else {
        if (evt.shiftKey)
          action = 'contextmenu';
      }

      if (action === 'delete') {
        this.deleteHoveredHitObjects();
      } else {
        this.trySelectOnMousedown(evt);
        evt.stopImmediatePropagation();
        this.showContextMenu(evt.global);
      }
    }
  }

  protected onClick(evt: FederatedPointerEvent) {
    super.onClick(evt);
    if (evt.button === 0 && this.canCycleSelection) {
      if (this.selection.selectedObjects.size === 1 && this.hoveredHitObjects.length > 1) {
        this.cycleSelection();
      }
    }
  }

  protected onKeyDown(evt: KeyboardEvent, shortcut: string) {
    super.onKeyDown(evt, shortcut);
    switch (shortcut) {
      case "ctrl+a":
        this.selectAllHitObjects();
        break;
      case "q":
        this.toggleNewCombo();
        break;
      case "ctrl+shift+r":
        this.beginInteraction(RotateHitObjectsInteraction, [...this.selection.selectedObjects]);
        break;
      case "ctrl+shift+s":
        this.beginInteraction(ScaleHitObjectsInteraction, [...this.selection.selectedObjects]);
        break;
      case "ctrl+shift+f":
        this.sliderToStream();
        break;
      case "ctrl+shift+e":
        this.beginInteraction(InsertAxisInteraction);
        break;
      case "j":
        this.shiftSelection(-1);
        break;
      case "k":
        this.shiftSelection(1);
        break;
      case "ctrl+o":
        this.increaseSv();
        break;
      case "ctrl+p":
        this.decreaseSv();
        break;


      // case "w":
      //   this.toggleAddition(Additions.Whistle);
      //   break;
      // case "e":
      //   this.toggleAddition(Additions.Finish);
      //   break;
      // case "r":
      //   this.toggleAddition(Additions.Clap);
      //   break;
      //
      // case "shift+w":
      //   this.setSampleSet(SampleSet.Auto);
      //   break;
      // case "shift+e":
      //   this.setSampleSet(SampleSet.Normal);
      //   break;
      // case "shift+r":
      //   this.setSampleSet(SampleSet.Soft);
      //   break;
      // case "shift+t":
      //   this.setSampleSet(SampleSet.Drum);
      //   break;
      //
      // case "ctrl+w":
      //   this.setAdditionSet(SampleSet.Auto);
      //   break;
      // case "ctrl+e":
      //   this.setAdditionSet(SampleSet.Normal);
      //   break;
      // case "ctrl+r":
      //   this.setAdditionSet(SampleSet.Soft);
      //   break;
      // case "ctrl+t":
      //   this.setAdditionSet(SampleSet.Drum);
      //   break;
      default:
        return;
    }
    evt.preventDefault();
  }

  private getHitsoundSelection(): HitSoundSelection[] {
    return this.selectedObjects.flatMap(hitObject => {
      const mainHitSound: HitSoundSelection = {
        type: "main",
        hitObject: hitObject,
        hitSound: {...hitObject.hitSound},
      };

      if (hitObject instanceof Slider) {
        const edgeHitSounds: HitSoundSelection[] = hitObject.hitSounds.map<HitSoundSelection>((hitSound, index) => ({
          type: "edge",
          hitObject: hitObject,
          hitSound: {...hitSound},
          index: index,
        }));
        return [mainHitSound, ...edgeHitSounds];
      }

      return [mainHitSound];
    });
  }


  private updateHitSounds(hitSounds: HitSoundSelection[]) {
    const mainUpdates = new Map<HitObject, HitSound>();
    const edgeUpdates = new Map<Slider, HitSound[]>();

    for (const hitSound of hitSounds) {
      if (hitSound.type === "main") {
        mainUpdates.set(hitSound.hitObject, hitSound.hitSound);
      } else {
        const edgeHitSounds = edgeUpdates.get(hitSound.hitObject) ?? [...hitSound.hitObject.hitSounds];
        edgeHitSounds[hitSound.index] = hitSound.hitSound;
        edgeUpdates.set(hitSound.hitObject, edgeHitSounds);
      }
    }

    for (const [hitObject, hitSound] of mainUpdates) {
      this.submit(updateHitObject(hitObject, {
        hitSound: hitSound,
      }));
    }

    for (const [hitObject, hitSounds] of edgeUpdates) {
      this.submit(updateHitObject(hitObject, {
        hitSounds: hitSounds,
      }));
    }

    this.editor.commandManager.commit();
  }


  onTick() {
    super.onTick();
    this.updateSliderVisualizer();
  }

  private selectAllHitObjects() {
    this.selection.selectAll(this.allHitObjects);
  }

  private toggleNewCombo() {
    const selection = [...this.selection.selectedObjects];

    if (selection.every(it => it.isNewCombo)) {
      for (const hitObject of selection) {
        hitObject.isNewCombo = false;
        this.submit(updateHitObject(hitObject, {
          newCombo: false,
        }));
      }
    } else {
      for (const hitObject of selection) {
        hitObject.isNewCombo = true;
        this.submit(updateHitObject(hitObject, {
          newCombo: true,
        }));
      }
    }
    this.editor.commandManager.commit();
  }

  private trySelectOnMousedown(evt: FederatedPointerEvent) {
    if (!this.hoveredHitObjects.some(it => it.isSelected) || evt.ctrlKey) {
      const closest = this.getClosestToClock(this.hoveredHitObjects)!;

      if (closest)
        if (evt.ctrlKey) {
          if (this.selection.size > 1 && this.selection.isSelected(closest)) {
            this.selection.remove(closest)
          } else {
            this.selection.add(closest);
          }
        } else
          this.selection.select(closest);
      else {
        this.selection.clear();
        this.beginInteraction(SelectBoxInteraction, this.mousePos);
      }
      return true;
    }
    return false;
  }

  private cycleSelection() {
    const currentSelection = [...this.selection.selectedObjects];
    const index = this.hoveredHitObjects.indexOf(currentSelection[0]);
    if (index !== -1) {
      this.selection.select(
        this.hoveredHitObjects[(index + 1) % this.hoveredHitObjects.length],
      );
    }
  }

  private deleteHoveredHitObjects() {
    if (this.hoveredHitObjects.some(it => it.isSelected)) {
      this.selection.selectedObjects.forEach(it => this.submit(
        EditorCommand.deleteHitObject({id: it.id}),
      ));
      this.editor.commandManager.commit();
    } else if (this.hoveredHitObjects.length > 0) {
      const closest = this.getClosestToClock(this.hoveredHitObjects)!;
      this.submit(
        EditorCommand.deleteHitObject({id: closest.id}),
        true,
      );
    }
  }

  private updateSliderVisualizer() {
    const selection = [...this.selection.selectedObjects];
    if (selection.length === 1 && selection[0] instanceof Slider) {
      this.sliderVisualizer.slider = selection[0];
    } else if (this.hoveredHitObjects.every(it => !it.isSelected)) {
      const slider = this.hoveredHitObjects.find(it => it instanceof Slider) as Slider | undefined;
      this.sliderVisualizer.slider = slider ?? null;
    } else {
      this.sliderVisualizer.slider = null;
    }
  }

  private insertControlPoint(slider: Slider, evt: FederatedPointerEvent) {
    const closest = this.getInsertPoint(slider, Vec2.from(evt.getLocalPosition(this)));
    if (closest) {
      const controlPoints = slider.path.controlPoints.map(it => ({...it}));
      controlPoints.splice(closest.index, 0, {
        x: closest.position.x,
        y: closest.position.y,
        type: null,
      });
      this.submit(updateHitObject(slider, {
        path: controlPoints,
      }));
      this.beginInteraction(InsertControlPointInteraction, slider, closest.index);
      return true;
    }
    return false;
  }

  private getInsertPoint(slider: Slider, mousePos: Vec2) {
    let last = slider.path.controlPoints[0];
    let closest: { position: Vec2; index: number } | undefined = undefined;
    let closestDistance: number = Infinity;
    for (let i = 1; i < slider.path.controlPoints.length; i++) {
      const current = slider.path.controlPoints[i];

      const A = last;
      const B = current;
      const P = Vec2.sub(mousePos, slider.position);
      const AB = Vec2.sub(B, A);
      const AP = Vec2.sub(P, A);

      const lengthSquaredAB = Vec2.lengthSquared(AB);
      let t = (AP.x * AB.x + AP.y * AB.y) / lengthSquaredAB;
      t = Math.max(0, Math.min(1, t));

      let position = Vec2.add(A, Vec2.scale(AB, t));

      const distance = Vec2.distance(position, P);
      if (distance < 35) {
        if (distance < closestDistance) {
          closest = {
            position,
            index: i,
          };
          closestDistance = distance;
        }
      }
      last = current;
    }

    return closest;
  }

  private sliderToStream() {
    const selection = [...this.selection.selectedObjects];
    const ids: string[] = [];
    if (selection.length === 1 && selection[0] instanceof Slider) {
      const slider = selection[0];
      this.submit(EditorCommand.deleteHitObject({id: slider.id}));
      const timingPoint = this.editor.beatmapManager.controlPoints.timingPointAt(slider.startTime);
      const step = timingPoint.beatLength / this.beatInfo.beatSnap;
      for (let time = slider.startTime; time <= slider.startTime + slider.spanDuration; time += step) {
        const position = slider.positionAt(time).add(slider.position);

        const id = hitObjectId();

        this.submit(EditorCommand.createHitObject({
          hitObject: {
            type: "circle",
            id,
            startTime: time,
            position,
            newCombo: time === slider.startTime && slider.isNewCombo,
            comboOffset: time === slider.startTime ? slider.comboOffset : 0,
          },
        }));

        ids.push(id);
      }
    }
    this.editor.commandManager.commit();

    const objects = ids
      .map(id => this.editor.beatmapManager.hitObjects.getById(id))
      .filter(it => it !== undefined) as HitObject[];

    this.selection.selectAll(objects);
  }

  private showContextMenu(position: IVec2) {
    let items: MenuItemOptions[] = [];

    if (this.selection.size > 0) items.push({
        text: "Delete",
        tint: 0xEA2463,
        action: () => {
          this.selection.selectedObjects.forEach(object => {
            this.submit(EditorCommand.deleteHitObject({id: object.id}));
          });
          this.editor.commandManager.commit();
        },
      },
      {
        text: "Reverse",
        action: () => {
          const hitObjects = [...this.selection.selectedObjects].sort((a, b) => a.startTime - b.startTime);
          reverseHitObjects(hitObjects, this.editor);
        },
      },
      {
        text: "Randomize",
        action: () => {
          const hitObjects = [...this.selection.selectedObjects].sort((a, b) => a.startTime - b.startTime);
          for (const hitObject of hitObjects) {
            const position = hitObject.position.add({
              x: Math.random() * 30 - 15,
              y: Math.random() * 30 - 15,
            });
            this.submit(updateHitObject(hitObject, {position}));
          }
          this.editor.commandManager.commit();
        },
      });

    if (this.selection.size === 1 && this.selectedObjects[0] instanceof Slider) {
      const slider = this.selectedObjects[0]
      const insertPoint = this.getInsertPoint(slider, this.mousePos);
      if (insertPoint) {
        const {position, index} = insertPoint;
        items.push({
          text: "Insert control point",
          action: () => {
            const path = slider.path.controlPoints.map(it => ({...it}));
            path.splice(index, 0, {
              x: position.x,
              y: position.y,
              type: null,
            });
            this.submit(updateHitObject(slider, {
              path
            }), true);
          },
        });
      }


    }

    if (this.selection.size === 2 && this.selectedObjects.every(it => it instanceof HitCircle)) {
      items.push({
        text: "Create clockwise square",
        action: () => {
          const [first, second] = [...this.selection.selectedObjects].sort((a, b) => a.startTime - b.startTime);
          const offset = second.position.sub(first.position);
          const interval = second.startTime - first.startTime;

          const idA = hitObjectId();
          this.submit(EditorCommand.createHitObject({
            hitObject: {
              id: idA,
              type: "circle",
              startTime: second.startTime + interval,
              position: second.position.add(offset.rotate(Math.PI / 2)),
              newCombo: false,
            },
          }));
          const idB = hitObjectId();
          this.submit(EditorCommand.createHitObject({
            hitObject: {
              id: idB,
              type: "circle",
              startTime: second.startTime + interval * 2,
              position: first.position.add(offset.rotate(Math.PI / 2)),
              newCombo: false,
            },
          }), true);
          const objectA = this.editor.beatmapManager.hitObjects.getById(idA);
          const objectB = this.editor.beatmapManager.hitObjects.getById(idB);
          if (objectA && objectB) {
            this.selection.add(objectA);
            this.selection.add(objectB);
          }
        },

      });
      items.push({
        text: "Create counter-clockwise square",
        action: () => {
          const [first, second] = [...this.selection.selectedObjects].sort((a, b) => a.startTime - b.startTime);
          const offset = second.position.sub(first.position);
          const interval = second.startTime - first.startTime;

          const idA = hitObjectId();
          this.submit(EditorCommand.createHitObject({
            hitObject: {
              id: idA,
              type: "circle",
              startTime: second.startTime + interval,
              position: second.position.add(offset.rotate(-Math.PI / 2)),
              newCombo: false,
            },
          }));
          const idB = hitObjectId();
          this.submit(EditorCommand.createHitObject({
            hitObject: {
              id: idB,
              type: "circle",
              startTime: second.startTime + interval * 2,
              position: first.position.add(offset.rotate(-Math.PI / 2)),
              newCombo: false,
            },
          }), true);
          const objectA = this.editor.beatmapManager.hitObjects.getById(idA);
          const objectB = this.editor.beatmapManager.hitObjects.getById(idB);
          if (objectA && objectB) {
            this.selection.add(objectA);
            this.selection.add(objectB);
          }
        },
      });
    }

    if (this.selection.size === 2) {
      const [first, second] = [...this.selection.selectedObjects];
      let circle: HitCircle | undefined;
      let slider: Slider | undefined;
      if (first instanceof HitCircle)
        circle = first;
      else if (first instanceof Slider)
        slider = first;
      if (second instanceof HitCircle)
        circle = second;
      else if (second instanceof Slider)
        slider = second;

      if (circle && slider && slider.path.controlPoints.length === 3 && slider.path.controlPoints[0].type === PathType.PerfectCurve) {
        items.push({
          text: "Create perfect blanket",
          action: () => {
            if (!slider || !circle) return;

            const arcProperties = PathApproximator._circularArcProperties(slider.path.controlPoints.map(it => new Vector2(it.x, it.y)));
            if (arcProperties.isValid) {
              this.submit(updateHitObject(circle, {
                position: slider.position.add(arcProperties.centre),
              }), true);

            }
          },
        });
      }
    }

    if (this.selection.size === 1 && this.selectedObjects[0] instanceof Slider) {
      items.push({
        text: "Convert to stream",
        action: () => {
          this.sliderToStream();
        },
      });
    }

    if (items.length > 0) {
      this.popoverContainer.show(position, new Menu({
        minWidth: 100,
        items,
      }));
    }
  }

  private shiftSelection(offset: number) {
    if (this.selection.size === 0) return;
    const hitObjects = [...this.selection.selectedObjects].sort((a, b) => a.startTime - b.startTime);
    const timingPoint = this.editor.beatmapManager.controlPoints.timingPointAt(hitObjects[0].startTime);

    for (const hitObject of hitObjects) {
      const startTime = hitObject.startTime + offset * timingPoint.beatLength / this.beatInfo.beatSnap;
      this.submit(updateHitObject(hitObject, {startTime}));
    }
    this.editor.commandManager.commit();
  }

  private toggleAddition(addition: Additions) {
    const hitSounds = this.getHitsoundSelection();
    const hasAddition = hitSounds.every(it => it.hitSound.additions & addition);

    for (const hitSound of hitSounds) {
      if (hasAddition)
        hitSound.hitSound.additions &= ~addition;
      else
        hitSound.hitSound.additions |= addition;
    }
    this.updateHitSounds(hitSounds);
  }

  private setSampleSet(sampleSet: SampleSet) {
    const hitSounds = this.getHitsoundSelection();
    for (const hitSound of hitSounds) {
      hitSound.hitSound.sampleSet = sampleSet;
    }
    this.updateHitSounds(hitSounds);
  }

  private setAdditionSet(sampleSet: SampleSet) {
    const hitSounds = this.getHitsoundSelection();
    for (const hitSound of hitSounds) {
      hitSound.hitSound.additionSet = sampleSet;
    }
    this.updateHitSounds(hitSounds);
  }

  private increaseSv() {
    for (const object of this.selectedObjects) {
      if (object instanceof Slider) {
        const velocity = clamp(object.velocity + 0.1, 0.1, 10);
        this.submit(updateHitObject(object, {velocity}));
      }
    }
    this.editor.commandManager.commit();
  }

  private decreaseSv() {
    for (const object of this.selectedObjects) {
      if (object instanceof Slider) {
        const velocity = clamp(object.velocity - 0.1, 0.1, 10);
        this.submit(updateHitObject(object, {velocity}));
      }
    }
    this.editor.commandManager.commit();
  }

  private lastTap?: {
    position: Vec2;
    time: number;
  };

  private recognizeDoubleTap() {
    this.lastTap = {
      position: this.mousePos,
      time: performance.now(),
    };
  }

  onLoad() {
    super.onLoad();
    this.initButtons();

    const canvas = document.querySelector('canvas')! as HTMLCanvasElement;
    useEventListener(canvas, 'touchstart', (evt: TouchEvent) => {
      if (evt.targetTouches.length === 2 && this._mouseDown !== undefined && this.selection.size > 0) {
        evt.preventDefault()
        this.interaction?.cancel()
        transformHitObjects(this.editor, this, this.beatInfo)
      }
    })
  }

  buttons = {
    flipHorizontal: new ButtonPanelButton({
      icon: Assets.get('icon-size-ew'),
      action: () => {
        if (this.selection.size === 0) return;
        const bounds = Rect.containingPoints(getHitObjectPositions([...this.selectedObjects]))!
        mirrorHitObjects(this.editor, "horizontal", bounds);
      },
    }),
    flipVertical: new ButtonPanelButton({
      icon: Assets.get('icon-size-ns'),
      action: () => {
        if (this.selection.size === 0) return;
        const bounds = Rect.containingPoints(getHitObjectPositions([...this.selectedObjects]))!
        mirrorHitObjects(this.editor, "vertical", bounds);
      },
    }),
    reverse: new ButtonPanelButton({
      icon: Assets.get('icon-reverse'),
      action: () => {
        if (this.selection.size === 0) return;
        reverseHitObjects([...this.selectedObjects], this.editor)
      },
    }),
  }

  initButtons() {
    this.panelButtons.value = [
      [
        this.buttons.flipHorizontal,
        this.buttons.flipVertical,
        this.buttons.reverse,
      ]
    ]

    const updateButtons = () => {
      const hasSelection = this.selection.size > 0
      this.buttons.flipHorizontal.disabled = !hasSelection
      this.buttons.flipVertical.disabled = !hasSelection
      this.buttons.reverse.disabled = !hasSelection
    }

    updateButtons()

    this.selection.hitObjectSelected.on(updateButtons)
    this.selection.hitObjectDeselected.on(updateButtons)

    this.addEventListener('destroy', () => {
      this.selection.hitObjectDeselected.off(updateButtons)
      this.selection.hitObjectDeselected.off(updateButtons)
    })
  }
}

type HitSoundSelection = {
  type: "main";
  hitObject: HitObject;
  hitSound: HitSound;
} | {
  type: "edge";
  hitObject: Slider;
  index: number;
  hitSound: HitSound;
}