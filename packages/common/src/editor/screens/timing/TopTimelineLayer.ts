import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, BindableBoolean, Box, dependencyLoader, FillDirection, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';
import { Toggle } from '../../../../../editor/src/userInterface/Toggle';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { BottomTimelineTickContainer } from '../../ui/timeline/BottomTimelineTickContainer';
import { Timeline } from '../../ui/timeline/Timeline';
import { TimelineLayer, TimelineLayerHeader } from '../../ui/timeline/TimelineLayer';

export class TopTimelineLayer extends TimelineLayer {
  constructor() {
    super('');
  }

  @dependencyLoader()
  [Symbol('load')]() {
    this.height = 22;
    this.addAll(new Box({
      relativeSizeAxes: Axes.Both,
      color: 0x222228,
    }), new BottomTimelineTickContainer().with({
      height: 0.5,
      anchor: Anchor.BottomLeft,
      origin: Anchor.BottomLeft,
    }));
  }

  override get layerColor(): ColorSource {
    return 0xFF0000;
  }

  protected override createHeader(): TimelineLayerHeader {
    return new TopTimelineLayerHeader();
  }
}

class TopTimelineLayerHeader extends TimelineLayerHeader {
  constructor() {
    super('', 0xFF0000);
  }

  readonly #syncTimeline = new BindableBoolean();

  @dependencyLoader()
  [Symbol('load')]() {
    this.padding = { vertical: -1, left: -1 };
    this.addAllInternal(
      new Box({
        relativeSizeAxes: Axes.Both,
        color: 0x222228,
      }),
      new FillFlowContainer({
        direction: FillDirection.Horizontal,
        autoSizeAxes: Axes.Both,
        padding: 4,
        spacing: new Vec2(4),
        children: [
          new OsucadSpriteText({
            text: 'Sync time',
            fontSize: 12,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
          new Toggle({
            bindable: this.#syncTimeline,
          }).with({
            scale: 0.65,
            anchor: Anchor.CenterLeft,
            origin: Anchor.CenterLeft,
          }),
        ],
      }),
    );

    this.#syncTimeline.addOnChangeListener(enabled =>
      this.timeline.syncWithEditorClock = enabled.value,
    );
  }

  @resolved(Timeline)
  timeline!: Timeline;
}
