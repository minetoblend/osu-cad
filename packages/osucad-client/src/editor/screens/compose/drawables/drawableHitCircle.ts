import {EditorInstance} from "@/editor/createEditor";
import {Circle} from "@osucad/common";
import {Sprite, Texture, Circle as PixiCircle} from "pixi.js";
import {animate} from "@/utils/animate";

import {DrawableCirclePiece} from "./drawableCirclePiece";

import approachcirclepng from "@/assets/skin/approachcircle@2x.png";
import hitcircleselectpng from "@/assets/skin/hitcircleselect@2x.png";
import {DrawableHitObject} from "./drawableHitObject";
import {IClient} from "@osucad/unison";

export class DrawableHitCircle extends DrawableHitObject<Circle> {
  readonly approachCircle = new Sprite(Texture.from(approachcirclepng));
  readonly circlePiece = new DrawableCirclePiece();
  readonly selectionOverlay = new Sprite(Texture.from(hitcircleselectpng));

  constructor(private circle: Circle, editor: EditorInstance) {
    super(circle, editor);
    this.init();
  }

  init() {
    this.hitArea = new PixiCircle(0, 0, 28);
    this.eventMode = "static";
    this.approachCircle.anchor.set(0.5);
    this.selectionOverlay.anchor.set(0.5);
    this.selectionOverlay.visible = false;
    this.addChild(this.circlePiece, this.approachCircle, this.selectionOverlay);
    this.scale.set(this.hitObject.scale);
  }

  bind(circle: Circle): void {
    if (circle.isGhost) this.cursor = "none";
  }

  update(): void {
    const currentTime = this.editor.clock.currentTimeAnimated;

    const comboColor = this.editor.container.document.objects.colors.getColor(
      this.circle.comboIndex,
    );

    const timeRelative = currentTime - this.circle.startTime;
    const timePreempt =
      this.editor.container.document.objects.difficulty.timePreempt;
    const timeFadeIn =
      this.editor.container.document.objects.difficulty.timeFadeIn;

    // approach circle
    this.approachCircle.tint = comboColor;

    this.approachCircle.scale.set(
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, 0, 4, 1)
        : animate(timeRelative, 0, 100, 1, 1.1),
    );

    this.circlePiece.tint = timeRelative <= 0 ? comboColor : 0xffffff;
    this.circlePiece.update();

    // alpha

    const fadeOut = timeRelative < 0 ? 1 : animate(timeRelative, 0, 700, 1, 0);

    this.circlePiece.alpha =
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, -timePreempt + timeFadeIn, 0, 1)
        : fadeOut;

    this.approachCircle.alpha =
      timeRelative < 0 ? animate(timeRelative, -timePreempt, 0, 0, 1) : fadeOut;
  }

  onSelected(selected: boolean, selectedBy: IClient[]): void {
    if (selected) this.selectionOverlay.visible = true;
    else this.selectionOverlay.visible = false;

    if (selectedBy.length > 0) {
      this.circlePiece.outlineTint = parseInt(
        selectedBy[0].data.color.slice(1),
        16,
      );
    } else {
      this.circlePiece.outlineTint = 0xffffff;
    }
  }
}
