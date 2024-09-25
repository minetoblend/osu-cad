import {
  Anchor,
  Axes,
  BindableBoolean,
  Container,
  dependencyLoader,
  EasingFunction,
  FillDirection,
  FillFlowContainer,
  Vec2,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../../OsucadSpriteText';
import { Toggle } from '../../../../userInterface/Toggle';

export abstract class ControlPointPropertiesSection extends Container {
  protected constructor(readonly title: string) {
    super();
  }

  active = new BindableBoolean(true);

  @dependencyLoader()
  load() {
    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addInternal(new FillFlowContainer({
      autoSizeAxes: Axes.Y,
      relativeSizeAxes: Axes.X,
      direction: FillDirection.Vertical,
      padding: 12,
      spacing: new Vec2(8),
      children: [
        new FillFlowContainer({
          relativeSizeAxes: Axes.X,
          autoSizeAxes: Axes.Y,
          spacing: new Vec2(8),
          children: [
            new Toggle({ bindable: this.active }).with({
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
            this.#title = new OsucadSpriteText({
              text: this.title,
              fontSize: 16,
              anchor: Anchor.CenterLeft,
              origin: Anchor.CenterLeft,
            }),
          ],
        }),
        this.#content,
      ],
    }));

    this.masking = true;

    this.createContent();

    this.active.valueChanged.addListener(this.applyState, this);

    this.applyState();
  }

  protected loadComplete() {
    super.loadComplete();

    this.schedule(() => {
      this.autoSizeDuration = 400;
      this.autoSizeEasing = EasingFunction.OutExpo;
    });
  }

  #title!: OsucadSpriteText;

  abstract createContent(): void;

  #content = new Container({
    relativeSizeAxes: Axes.X,
    autoSizeAxes: Axes.Y,
  });

  get content() {
    return this.#content;
  }

  applyState() {
    this.#title.fadeTo(this.active.value ? 1 : 0.5, 200, EasingFunction.OutExpo);

    this.#content.bypassAutoSizeAxes = this.active.value ? Axes.None : Axes.Y;
    if (this.active.value)
      this.#content.fadeIn(200, EasingFunction.OutExpo);
    else
      this.#content.fadeOut(200, EasingFunction.OutExpo);
  }
}
