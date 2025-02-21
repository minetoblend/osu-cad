import type { DrawableOptions, ReadonlyDependencyContainer, SpriteText } from '@osucad/framework';
import type { BindableBeatDivisor } from '../../../BindableBeatDivisor';
import { Anchor, Axes, CompositeDrawable, Container, FillDirection, FillFlowContainer, resolved, Vec2 } from '@osucad/framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { OsucadColors } from '../../../../OsucadColors';
import { SliderBar } from '../../../../overlays/preferencesV2/SliderBar';
import { EditorClock } from '../../../EditorClock';

export class BeatSnapSelector extends CompositeDrawable {
  constructor() {
    super();

    this.relativeSizeAxes = Axes.Both;

    this.internalChildren = [
      new FillFlowContainer({
        autoSizeAxes: Axes.Both,
        direction: FillDirection.Horizontal,
        spacing: new Vec2(20),
        anchor: Anchor.TopRight,
        origin: Anchor.TopRight,
        children: [
          this.#beatSnapText = new OsucadSpriteText({
            text: '1/1',
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
            color: OsucadColors.text,
            fontSize: 14,
          }),
          new OsucadSpriteText({
            text: 'Beat Snap',
            color: OsucadColors.text,
            fontWeight: 600,
            fontSize: 12,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: { top: 15 },
        child: new BeatSnapSlider({
          relativeSizeAxes: Axes.Both,
        }),
      }),
    ];
  }

  @resolved(() => EditorClock)
  editorClock!: EditorClock;

  #beatSnapText!: SpriteText;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.editorClock.beatSnapDivisor.addOnChangeListener(
      (e) => {
        this.#beatSnapText.text = `1/${e.value}`;
      },
      { immediate: true },
    );
  }
}

class BeatSnapSlider extends SliderBar {
  constructor(options: DrawableOptions = {}) {
    super();
  }

  beatSnapDivisor!: BindableBeatDivisor;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.beatSnapDivisor = this.currentNumber = this.editorClock.beatSnapDivisor.getBoundCopy();
  }
}
