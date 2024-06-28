import {
  Axes,
  Container,
  ContainerOptions,
  IVec2,
  Invalidation,
  LayoutMember,
  Vec2,
} from "osucad-framework";

export interface ScalingContainerOptions extends ContainerOptions {
  desiredSize: IVec2;
  fit?: Fit;
}

export class ScalingContainer extends Container {
  #desiredSize: Vec2;
  #fit: Fit;

  get desiredSize(): Vec2 {
    return this.#desiredSize;
  }

  set desiredSize(value: Vec2) {
    if (this.#desiredSize.equals(value)) {
      return;
    }

    this.#desiredSize = Vec2.from(value);

    this.#drawSizeBacking.invalidate();
  }

  #content = new Container();

  override get content() {
    return this.#content;
  }

  constructor(options: ScalingContainerOptions) {
    super();
    this.addLayout(this.#drawSizeBacking);
    this.addInternal(this.#content);

    
    this.#desiredSize = Vec2.from(options.desiredSize);
    this.#fit = options.fit ?? Fit.Contain;
    

    this.apply({
      ...options,
      relativeSizeAxes: Axes.Both,
    });
  }

  #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  update(): void {
    super.update();

    if (!this.#drawSizeBacking.isValid) {
      let scale: Vec2;

      switch (this.#fit) {
        case Fit.Contain:
        case Fit.Fill:
          scale = new Vec2(
            Math.min(
              this.drawSize.x / this.#desiredSize.x,
              this.drawSize.y / this.#desiredSize.y
            )
          );
          break;
        case Fit.Cover:
          scale = new Vec2(
            Math.max(
              this.drawSize.x / this.#desiredSize.x,
              this.drawSize.y / this.#desiredSize.y
            )
          );
          break;
      }

      if (this.#fit === Fit.Fill) {
        this.#content.scale = scale;
        const size = this.#desiredSize.clone();
        if (
          this.drawSize.x / this.drawSize.y >
          this.#desiredSize.x / this.#desiredSize.y
        ) {
          size.x = this.drawSize.x * (this.#desiredSize.y / this.drawSize.y);
        } else {
          size.y = this.drawSize.y * (this.#desiredSize.x / this.drawSize.x);
        }

        this.#content.size = size;
        this.#content.position = new Vec2();
      } else {
        this.#content.scale = scale;
        this.#content.size = this.#desiredSize;
        this.#content.position = new Vec2(
          (this.drawSize.x - this.#desiredSize.x * scale.x) / 2,
          (this.drawSize.y - this.#desiredSize.y * scale.y) / 2
        );
      }

      this.#drawSizeBacking.validate();
    }
  }
}

export enum Fit {
  Contain,
  Cover,
  Fill,
}
