import type { ClickEvent, HoverEvent, HoverLostEvent, MouseDownEvent, MouseUpEvent } from "@osucad/framework";
import { EasingFunction } from "@osucad/framework";
import { Anchor, Axes, Bindable, CompositeDrawable, Container, dependencyLoader, resolved, Vec2 } from "@osucad/framework";
import { EditorClock } from "../EditorClock";
import { LazyIcon } from "../graphics";
import { EditorIcons } from "../assets";

export class PlayButton extends CompositeDrawable
{
  @resolved(EditorClock)
  accessor #editorClock!: EditorClock

  private readonly isRunning = new Bindable(false);

  #content!: Container;
  #playIcon!: LazyIcon;
  #pauseIcon!: LazyIcon;

  @dependencyLoader()
  #load()
  {
    this.size = new Vec2(36);

    this.internalChild = this.#content = new Container({
      relativeSizeAxes: Axes.Both,
      anchor: Anchor.Center,
      origin: Anchor.Center,
      alpha: 0.8,
      children: [
        this.#playIcon = new LazyIcon({
          url: EditorIcons.play,
          size: 36,
        }),
        this.#pauseIcon = new LazyIcon({
          url: EditorIcons.pause,
          size: 36,
        }),
      ],
    });
  }

  protected override loadComplete()
  {
    super.loadComplete();

    this.isRunning.bindValueChanged(e =>
    {
      if (e.value)
      {
        this.#playIcon.hide();
        this.#pauseIcon.show();
      }
      else
      {
        this.#playIcon.show();
        this.#pauseIcon.hide();
      }
    }, true);
  }

  protected override update()
  {
    super.update();

    this.isRunning.value = this.#editorClock.isRunning;
  }

  protected override onMouseDown(e: MouseDownEvent): boolean
  {
    this.#content.scaleTo(0.85, 400, EasingFunction.OutExpo);

    return true;
  }

  protected override onMouseUp(e: MouseUpEvent)
  {
    super.onMouseUp(e);

    this.#content.scaleTo(1, 400, EasingFunction.OutElasticHalf);
  }

  protected override onClick(e: ClickEvent): boolean
  {
    if (!this.isRunning.value)
      this.#editorClock.start();
    else
      this.#editorClock.stop();

    return true;
  }

  protected override onHover(e: HoverEvent): boolean
  {
    this.#content.fadeTo(1);
    return true;
  }

  protected override onHoverLost(e: HoverLostEvent)
  {
    super.onHoverLost(e);

    this.#content.fadeTo(0.8);
  }
}
