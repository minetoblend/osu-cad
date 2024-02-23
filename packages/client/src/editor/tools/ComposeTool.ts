import { Drawable } from '../drawables/Drawable.ts';
import { Inject } from '../drawables/di';
import { EditorCommand, HitObject, Vec2 } from '@osucad/common';
import { Container, FederatedPointerEvent } from 'pixi.js';
import { HitObjectContainer } from '../drawables/hitObjects/HitObjectContainer.ts';
import { BeatInfo } from '../beatInfo.ts';
import { ToolInteraction } from './interactions/ToolInteraction.ts';
import { SelectTool } from './SelectTool.ts';
import { EditorContext } from '@/editor/editorContext.ts';
import { ButtonPanelButton } from '@/editor/drawables/buttonPanel.ts';
import { Ref } from 'vue';
import {
  onEditorKeyDown,
  onEditorKeyUp,
} from '@/composables/onEditorKeyDown.ts';

export class ComposeTool extends Drawable {
  private interactionContainer = new Container();

  readonly panelButtons: Ref<ButtonPanelButton[][]> = shallowRef([]);

  readonly overlay = new Container();

  constructor() {
    super();
    this.hitArea = { contains: () => true };
    this.eventMode = 'static';
    this.addChild(this.interactionContainer);
  }

  @Inject(EditorContext)
  editor!: EditorContext;

  @Inject(BeatInfo)
  beatInfo!: BeatInfo;

  submit(command: EditorCommand, commit = false) {
    this.editor.commandManager.submit(command);
    if (commit) this.editor.commandManager.commit();
  }

  private _altDown = false;
  private _ctrlDown = false;
  private _shiftDown = false;

  get altDown() {
    return this._altDown;
  }

  get ctrlDown() {
    return this._ctrlDown;
  }

  get shiftDown() {
    return this._shiftDown;
  }

  onLoad() {
    this.on('pointerdown', this._onPointerDown, this);
    this.on('pointerup', this._onPointerUp, this);
    this.on('pointerupoutside', this._onPointerUp, this);

    this.on('globalpointermove', this._onPointerMove, this);
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'AltLeft':
        case 'AltRight':
          this._altDown = true;
          e.preventDefault();
          break;
        case 'ControlLeft':
        case 'ControlRight':
          this._ctrlDown = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this._shiftDown = true;
          break;
      }

      let shortcut = '';
      if (e.ctrlKey) shortcut += 'ctrl+';
      if (e.shiftKey) shortcut += 'shift+';
      if (e.altKey) shortcut += 'alt+';
      shortcut += e.key.toLowerCase();
      this.onKeyDown(e, shortcut);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'AltLeft':
        case 'AltRight':
          this._altDown = false;
          break;
        case 'ControlLeft':
        case 'ControlRight':
          this._ctrlDown = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          this._shiftDown = false;
          break;
      }
    };

    onEditorKeyDown(onKeyDown);
    onEditorKeyUp(onKeyUp);
  }

  hoveredHitObjects: HitObject[] = [];

  protected _mousePos: Vec2 | null = null;
  protected _mouseDownPos: Vec2 | null = null;
  protected _isDragging = false;
  protected _mouseDown?: number;

  protected _mousePressed = false;

  protected interaction?: ToolInteraction;

  private _onPointerDown(e: FederatedPointerEvent) {
    this._mouseDownPos = Vec2.from(e.getLocalPosition(this));
    this._mousePos = this._mouseDownPos;
    this._mouseDown = e.button;
    this._mousePressed = true;
    this.hoveredHitObjects = this.visibleHitObjects
      .filter((it) => it.contains(this.mousePos))
      .reverse();
    this.onMouseDown(e);
  }

  private _onPointerUp(e: FederatedPointerEvent) {
    this._mousePressed = false;
    this.onMouseUp(e);
    if (this._mouseDownPos != null) {
      if (
        Vec2.closerThan(
          this._mouseDownPos,
          Vec2.from(e.getLocalPosition(this)),
          5,
        )
      ) {
        this.onClick(e);
      }
    }
    this._mouseDownPos = null;
    if (e.button === this._mouseDown) this._mouseDown = undefined;
    if (this._isDragging) {
      this._isDragging = false;
      this.onDragEnd(e);
    }
  }

  private _onPointerMove(e: FederatedPointerEvent) {
    this._mousePos = Vec2.from(e.getLocalPosition(this));
    this.onMouseMove(e);
    if (this._mouseDown != null) {
      if (!this._isDragging) {
        this._isDragging = true;
        this.onDragStart(e);
      }
      this.onDrag(e);
    }
  }

  get dragButton() {
    return this._mouseDown;
  }

  get mousePos() {
    return this._mousePos!;
  }

  set mousePos(pos: Vec2) {
    this._mousePos = pos;
  }

  get selection() {
    return this.editor.selection;
  }

  @Inject(HitObjectContainer)
  private _hitObjectContainer!: HitObjectContainer;

  private _visibleHitObjects: HitObject[] = [];

  get visibleHitObjects() {
    return this._visibleHitObjects;
  }

  get hitObjectDrawables() {
    return this._hitObjectContainer.hitObjectDrawables;
  }

  get currentTime() {
    return this.editor.clock.currentTime;
  }

  get acceptsNumberKeys() {
    if (this.interaction) return this.interaction.acceptsNumberKeys;
    return false;
  }

  onTick() {
    this._visibleHitObjects =
      this.editor.beatmapManager.hitObjects.hitObjects.filter(
        (it) =>
          (this.currentTime >= it.startTime - it.timePreempt &&
            this.currentTime <= it.endTime + 700) ||
          it.isSelected,
      );
    if (this._mousePos != null) {
      this.hoveredHitObjects = this.visibleHitObjects
        .filter((it) => it.contains(this.mousePos))
        .reverse();
    }
  }

  protected onMouseDown(evt: FederatedPointerEvent) {
    this.interaction?.onMouseDown?.(evt);
  }

  protected onMouseUp(evt: FederatedPointerEvent) {
    this.interaction?.onMouseUp?.(evt);
  }

  protected onMouseMove(evt: FederatedPointerEvent) {
    this.interaction?.onMouseMove?.(evt);
  }

  protected onClick(evt: FederatedPointerEvent) {
    this.interaction?.onClick?.(evt);
  }

  protected onDragStart(evt: FederatedPointerEvent) {
    this.interaction?.onDragStart?.(evt);
  }

  protected onDrag(evt: FederatedPointerEvent) {
    this.interaction?.onDrag?.(evt);
  }

  protected onDragEnd(evt: FederatedPointerEvent) {
    this.interaction?.onDragEnd?.(evt);
  }

  protected onKeyDown(evt: KeyboardEvent, shortcut: string) {
    if (this.interaction?.onKeyDown?.(evt, shortcut) === false) return;

    if (evt.key === 'Escape') {
      if (this.interaction) this.cancelInteraction();
      else if (!(this instanceof SelectTool))
        this.editor.tools.activeTool = new SelectTool();
    } else if (evt.key === 'Enter') {
      this.completeInteraction();
    }
  }

  protected getClosestToClock(hitObjects: HitObject[]): HitObject | undefined {
    if (hitObjects.length === 0) return undefined;
    let minDifference = Infinity;
    let minDifferenceIndex = -1;
    for (let i = 0; i < hitObjects.length; i++) {
      const difference = Math.abs(hitObjects[i].startTime - this.currentTime);
      if (difference < minDifference) {
        minDifference = difference;
        minDifferenceIndex = i;
      }
    }
    return hitObjects[minDifferenceIndex];
  }

  beginInteraction<Args extends any[]>(
    interactionType: new (tool: this, ...args: Args) => ToolInteraction,
    ...args: Args
  ): ToolInteraction {
    const interaction = new interactionType(this, ...args);
    console.log('begin interaction', interaction);
    this.interaction?.onDestroy?.();
    this.interactionContainer.removeChildren();
    this.interaction = interaction;
    this.interactionContainer.addChild(interaction);

    return interaction;
  }

  completeInteraction() {
    console.log('complete interaction', this.interaction);
    this.interaction?.onComplete?.();
    this.interaction?.onDestroy?.();
    this.interactionContainer.removeChildren();
    this.interaction = undefined;
  }

  cancelInteraction() {
    console.log('cancel interaction', this.interaction);
    this.interaction?.onCancel?.();
    this.interaction?.onDestroy?.();
    this.interactionContainer.removeChildren();
    this.interaction = undefined;
  }

  onRemoved() {
    this.cancelInteraction();
  }

  get hasInteraction() {
    return this.interaction != undefined;
  }

  get allHitObjects() {
    return this.editor.beatmapManager.hitObjects.hitObjects;
  }

  get selectedObjects() {
    return [...this.editor.selection.selectedObjects];
  }
}
