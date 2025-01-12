import type { ClickEvent, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import { getIcon } from '@osucad/resources';
import { Anchor, Axes, Bindable, Container, DrawableSprite, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../../drawables/OsucadSpriteText';
import { EditorBeatmap } from '../../../../editor/EditorBeatmap';
import { EditorButton } from '../../../../editor/screens/compose/EditorButton';
import { OsucadColors } from '../../../../OsucadColors';

export class GridSizeButton extends EditorButton {
  constructor(readonly gridSize: number) {
    super();
  }

  @resolved(EditorBeatmap)
  beatmap!: EditorBeatmap;

  activeGridSize = new Bindable(0);

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.activeGridSize.bindTo(this.beatmap.beatmapInfo.gridSizeBindable);

    this.activeGridSize.bindValueChanged(gridSize => this.active.value = gridSize.value === this.gridSize, true);
  }

  protected override createContent(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.Both,
      children: [
        new DrawableSprite({
          texture: getIcon(this.gridSize === 0 ? 'grid_empty' : 'grid-alternative'),
          relativeSizeAxes: Axes.Both,
          size: 0.65,
          anchor: Anchor.Center,
          origin: Anchor.Center,
          color: OsucadColors.text,
        }),
        new Container({
          relativeSizeAxes: Axes.Both,
          padding: { horizontal: 4, vertical: 2 },
          child: new OsucadSpriteText({
            text: `${this.gridSize.toString()}px`,
            anchor: Anchor.BottomRight,
            origin: Anchor.BottomRight,
            fontSize: 8,
            color: OsucadColors.primary,
          }),
        }),
      ],
    });
  }

  override onClick(e: ClickEvent): boolean {
    this.activeGridSize.value = this.gridSize;
    return true;
  }
}
