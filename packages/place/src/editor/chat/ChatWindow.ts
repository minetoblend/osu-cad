import type { ClickEvent, HoverEvent, HoverLostEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import { OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, BindableBoolean, Box, CompositeDrawable, Container, DrawableSprite, EasingFunction, FillDirection, FillFlowContainer, Vec2 } from '@osucad/framework';
import { getIcon } from '@osucad/resources';
import { Chat } from './Chat';

const storageKey = 'chat-expanded';

export class ChatWindow extends CompositeDrawable {
  constructor() {
    super();

    this.expanded.value = localStorage.getItem(storageKey) === 'true';

    this.autoSizeAxes = Axes.X;
    this.relativeSizeAxes = Axes.Y;
    this.autoSizeDuration = 400;
    this.autoSizeEasing = EasingFunction.OutExpo;

    this.internalChildren = [
      this.#chat = new Chat(),
      new ChatToggleButton(this.expanded),
    ];
  }

  readonly #chat: Chat;

  readonly expanded = new BindableBoolean(false);

  protected load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
  }

  protected loadComplete() {
    super.loadComplete();

    this.expanded.bindValueChanged((expanded) => {
      if (expanded.value)
        this.popIn();
      else
        this.popOut();

      localStorage.setItem(storageKey, expanded.value.toString());
    }, true);

    this.parent!.schedule(() => this.finishTransforms(true));
  }

  popIn() {
    this.#chat.bypassAutoSizeAxes = Axes.None;
  }

  popOut() {
    this.#chat.bypassAutoSizeAxes = Axes.X;
  }
}

class ChatToggleButton extends CompositeDrawable {
  constructor(expanded: BindableBoolean) {
    super();

    this.autoSizeAxes = Axes.Both;
    this.anchor = Anchor.BottomLeft;
    this.origin = Anchor.BottomCenter;
    this.bypassAutoSizeAxes = Axes.Both;
    this.rotation = -Math.PI / 2;
    this.masking = true;
    this.cornerRadius = 4;
    this.x = 4;
    this.y = -100;

    this.internalChildren = [
      new Box({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
      }),
      new FillFlowContainer({
        direction: FillDirection.Horizontal,
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 10, bottom: 6, top: 2 },
        spacing: new Vec2(2),
        children: [
          new OsucadSpriteText({
            text: 'chat',
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            fontSize: 14,
          }),
          new Container({
            size: 12,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            children: [
              this.#toggleIcon = new DrawableSprite({
                texture: getIcon('caret-left'),
                size: 12,
                anchor: Anchor.Center,
                origin: Anchor.Center,
                rotation: -Math.PI / 2,
                color: OsucadColors.text,
                y: 1,
              }),
            ],
          }),
        ],
      }),
      this.#hoverHighlight = new Container({
        relativeSizeAxes: Axes.Both,
        padding: { bottom: 4 },
        alpha: 0,
        child: new Box({
          relativeSizeAxes: Axes.Both,
        }),
      }),
    ];

    this.state = expanded.getBoundCopy();
  }

  readonly state: BindableBoolean;

  readonly #toggleIcon: DrawableSprite;
  readonly #hoverHighlight: Container;

  protected loadComplete() {
    super.loadComplete();

    this.state.bindValueChanged((expanded) => {
      this.#toggleIcon.rotateTo(
        Math.PI / 2 * (expanded.value ? -1 : 1),
        500,
        EasingFunction.OutElasticHalf,
      );
    }, true);
  }

  onClick(e: ClickEvent): boolean {
    this.state.toggle();

    return true;
  }

  onHover(e: HoverEvent): boolean {
    this.#hoverHighlight.fadeTo(0.2).fadeTo(0.1, 400);

    return true;
  }

  onHoverLost(e: HoverLostEvent) {
    this.#hoverHighlight.clearTransforms();
    this.#hoverHighlight.fadeOut(200);
  }
}
