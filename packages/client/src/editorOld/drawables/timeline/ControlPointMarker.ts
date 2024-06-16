import { Drawable } from '@/editorOld/drawables/Drawable.ts';
import {
  Assets,
  DestroyOptions,
  FederatedPointerEvent,
  Rectangle,
  Sprite,
  Text,
} from 'pixi.js';
import { Inject } from '@/editorOld/drawables/di';
import { TimelinePositionManager } from '@/editorOld/drawables/timeline/timelinePositionManager.ts';
import {
  ControlPoint,
  ControlPointUpdateFlags,
  EditorCommand,
} from '@osucad/common';
import { EditorContext } from '@/editorOld/editorContext.ts';
import { BeatInfo } from '@/editorOld/beatInfo.ts';
import { usePixiPopover } from '@/editorOld/components/popover';
import ControlPointPopover from '@/editorOld/components/popover/ControlPointPopover.vue';

export class ControlPointMarker extends Drawable {
  sprite = new Sprite({
    texture: Assets.get('timeline-marker'),
    scale: { x: 0.2, y: 0.2 },
    anchor: { x: 0.5, y: 0.35 },
  });

  @Inject(EditorContext)
  private editor!: EditorContext;

  constructor(readonly controlPoint: ControlPoint) {
    super();
    this.addChild(this.sprite, this.text);
    this.x = 200;
    this.hitArea = new Rectangle(-10, -10, 20, 20);
    this.eventMode = 'dynamic';
    this.on('mouseenter', this.onMouseEnter, this);
    this.on('mouseleave', this.onMouseLeave, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.controlPoint.onUpdate.addListener(this._onControlPointUpdate);
    this._onControlPointUpdate(controlPoint, ControlPointUpdateFlags.All);
  }

  private _onControlPointUpdate = (
    controlPoint: ControlPoint,
    flags: ControlPointUpdateFlags,
  ) => {
    if (
      flags & ControlPointUpdateFlags.Timing ||
      flags & ControlPointUpdateFlags.Velocity
    ) {
      let text: string | null = null;

      if (controlPoint.timing) {
        text = `bpm: ${Math.round(60_000 / controlPoint.timing.beatLength)}`;
      } else if (controlPoint.velocityMultiplier !== null) {
        text = `sv: ${controlPoint.velocityMultiplier.toFixed(1)}`;
      }

      if (text) {
        this.text.visible = true;
        this.text.text = text;
      } else {
        this.text.visible = false;
      }
    }

    if (controlPoint.timing) {
      this.sprite.tint = 0xea2463;
    } else if (controlPoint.velocityMultiplier !== undefined) {
      this.sprite.tint = 0x52cca3;
    }
  };

  @Inject(TimelinePositionManager)
  private positionManager!: TimelinePositionManager;

  @Inject(BeatInfo)
  private beatInfo!: BeatInfo;

  onTick() {
    this.x = this.positionManager.getPositionForTime(this.controlPoint.time);
  }

  private onMouseEnter() {
    this.sprite.scale.set(0.23);
  }

  private onMouseLeave() {
    this.sprite.scale.set(0.2);
  }
  private onPointerDown(evt: FederatedPointerEvent) {
    if (evt.button === 2) {
      evt.stopPropagation();
      this.editor.commandManager.submit(
        EditorCommand.deleteControlPoint({
          id: this.controlPoint.id,
        }),
      );
      this.editor.commandManager.commit();
    } else if (evt.button === 0) {
      let moved = false;
      let lastTime = this.positionManager.getTimeAtPosition(
        evt.getLocalPosition(this.parent).x,
      );
      let unsnappedTime = this.controlPoint.time;
      this.canDiscard = false;
      this.onglobalpointermove = (evt: FederatedPointerEvent) => {
        const time = this.positionManager.getTimeAtPosition(
          evt.getLocalPosition(this.parent).x,
        );
        if (time !== lastTime) moved = true;

        unsnappedTime += time - lastTime;
        const shouldSnap = !evt.shiftKey && !this.controlPoint.timing;

        this.editor.commandManager.submit(
          EditorCommand.updateControlPoint({
            controlPoint: this.controlPoint.id,
            update: {
              time: shouldSnap
                ? this.beatInfo.snap(unsnappedTime)
                : unsnappedTime,
            },
          }),
        );

        lastTime = time;
      };
      addEventListener(
        'pointerup',
        () => {
          this.onglobalpointermove = null;
          this.canDiscard = true;
          this.editor.commandManager.commit();
          if (!moved) {
            usePixiPopover().showPopover({
              position: {
                x: this.worldTransform.tx + 10,
                y: this.worldTransform.ty - 10,
              },
              component: ControlPointPopover,
              props: {
                controlPoint: this.controlPoint,
                positionManager: this.positionManager,
              },
              anchor: 'top right',
            });
          }
        },
        { once: true },
      );
    }
  }

  canDiscard = true;

  text = new Text({
    visible: false,
    text: 'sv: 1.0',
    style: {
      fontFamily: 'Nunito Sans',
      fontSize: 12,
      fill: 0xffffff,
    },
    position: { x: 13, y: -1 },
  });

  destroy(options?: DestroyOptions) {
    super.destroy(options);
    this.controlPoint.onUpdate.removeListener(this._onControlPointUpdate);
  }
}
