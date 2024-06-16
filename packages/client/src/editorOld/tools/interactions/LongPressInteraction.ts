import { ToolInteraction } from '@/editorOld/tools/interactions/ToolInteraction.ts';
import { Graphics } from 'pixi.js';
import { Vec2 } from '@osucad/common';
import { clamp } from '@vueuse/core';
import { ComposeTool } from '@/editorOld/tools/ComposeTool.ts';

interface LongPressInteractionOptions {
  action: () => void;
  duration?: number;
  onMoveCancel?: () => void;
  onMouseUpCancel?: () => void;
}

export class LongPressInteraction extends ToolInteraction {
  constructor(tool: ComposeTool, options: LongPressInteractionOptions) {
    super(tool);
    this.addChild(this.overlay);
    this.action = options.action;
    this.duration = options.duration ?? 750;
    this.onMoveCancel = options.onMoveCancel;
    this.onMouseUpCancel = options.onMouseUpCancel;
    this.sizeReference = document.querySelector('#dpi');

    addEventListener(
      'pointerup',
      () => {
        this.cancel();
        this.onMouseUpCancel?.();
      },
      { once: true },
    );
  }

  private readonly action: () => void;
  private readonly duration: number;
  private readonly onMoveCancel?: () => void;
  private readonly onMouseUpCancel?: () => void;
  readonly overlay = new Graphics();
  readonly startTime = performance.now();
  readonly sizeReference: HTMLElement | null;

  startPos!: Vec2;

  onLoad() {
    this.startPos = this.mousePos;
    this.overlay.position.copyFrom(this.startPos);
  }

  onTick() {
    if (this.mousePos.distanceTo(this.startPos) > 10) {
      this.cancel();
      this.onMoveCancel?.();
      return;
    }

    const elapsed = performance.now() - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);

    if (progress === 1) {
      try {
        this.action();
      } finally {
        this.complete();
      }
      return;
    }

    const visibleProgress = clamp(progress * 2 - 0.75, 0.0, 1.0);

    const startAngle = Math.PI * 1.5;
    const endAngle = Math.PI * 1.5 + Math.PI * 2 * visibleProgress;

    const radius =
      (1.25 / this.worldTransform.a) *
      (this.sizeReference?.getBoundingClientRect().width ?? 50);

    this.overlay
      .clear()
      .beginPath()
      .arc(0, 0, radius, startAngle, endAngle, false)
      .stroke({
        color: 0xffffff,
        width: 5,
      });
  }
}
