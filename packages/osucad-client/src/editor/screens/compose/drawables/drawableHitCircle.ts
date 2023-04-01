import {ref, watch} from "vue";
import {EditorInstance} from "../../../createEditor";
import {Circle} from "@osucad/common";
import {Container, IDestroyOptions, Sprite, Texture} from "pixi.js";
import {animate} from "@/utils/animate";

import approachcirclepng from "@/assets/skin/approachcircle@2x.png";
import {HitObjectSelectionManager} from "@/editor/selection";
import {DrawableCirclePiece} from "./drawableCirclePiece";

export class DrawableHitCircle extends Container {
  approachCircle: Sprite;
  circlePiece: DrawableCirclePiece;

  selection: HitObjectSelectionManager;

  constructor(private circle: Circle, private editor: EditorInstance) {
    super();

    this.circlePiece = new DrawableCirclePiece(editor);

    const approachCircle = new Sprite(Texture.from(approachcirclepng));
    approachCircle.anchor.set(0.5);
    this.approachCircle = approachCircle;

    this.addChild(this.circlePiece, this.approachCircle);

    this.scale.set(0.5);

    this.selection = editor.selection;

    this.bind(circle);
  }

  #isSelected = ref(false);

  bind(circle: Circle) {
    this.position.copyFrom(circle.position);
    circle.on("change", this.onCircleChange);

    watch(
      () => this.selection.isSelected(circle),
      (selected) => {
        if (selected) this.circlePiece.outlineTint = 0xf5d442;
        else this.circlePiece.outlineTint = 0xffffff;
      },
      { immediate: true }
    );
  }

  unbind() {
    this.circle?.off("change", this.onCircleChange);
  }

  onCircleChange = (key: string) => {
    if (key === "position") this.position.copyFrom(this.circle.position);
  };

  update() {
    const currentTime = this.editor.clock.currentTimeAnimated;

    const comboColor = this.editor.container.document.objects.colors.getColor(
      this.circle.comboIndex
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
        : animate(timeRelative, 0, 200, 1, 1.06)
    );

    this.approachCircle.alpha =
      timeRelative < 0 ? animate(timeRelative, -timePreempt, 0, 0, 1) : 1;

    this.circlePiece.tint = timeRelative <= 0 ? comboColor : 0xffffff;
    this.circlePiece.update();

    // hit circle

    const circlePieceAlpha =
      timeRelative < 0
        ? animate(timeRelative, -timePreempt, -timePreempt + timeFadeIn, 0, 1)
        : 1;

    this.circlePiece.alpha = circlePieceAlpha * circlePieceAlpha;

    const globalAlpha =
      timeRelative < 0 ? 1 : animate(timeRelative, 0, 800, 1, 0);

    // idk why but squaring this makes it look better
    this.alpha = globalAlpha * globalAlpha;
  }

  destroy(options?: boolean | IDestroyOptions | undefined): void {
    super.destroy(options);
    this.unbind();
  }
}
