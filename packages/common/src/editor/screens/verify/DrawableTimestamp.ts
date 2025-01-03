import type { ClickEvent, HoverEvent, HoverLostEvent, ReadonlyDependencyContainer, SpriteText } from 'osucad-framework';
import type { HitObject } from '../../../hitObjects/HitObject';
import type { IHasComboInformation } from '../../../hitObjects/IHasComboInformation';
import { Axes, CompositeDrawable, Container, FastRoundedBox, resolved } from 'osucad-framework';
import { OsucadSpriteText } from '../../../drawables/OsucadSpriteText';
import { hasComboInformation } from '../../../hitObjects/IHasComboInformation';
import { OsucadColors } from '../../../OsucadColors';
import { EditorClock } from '../../EditorClock';
import { TimestampFormatter } from '../../TimestampFormatter';
import { HitObjectSelectionManager } from '../compose/HitObjectSelectionManager';

export class DrawableTimestamp extends CompositeDrawable {
  constructor(readonly timestamp: number, readonly hitObjects: HitObject[] = []) {
    super();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.autoSizeAxes = Axes.Both;

    let text = TimestampFormatter.formatTimestamp(this.timestamp);

    const hitObjects = this.hitObjects.filter(it => hasComboInformation(it)) as IHasComboInformation[];

    if (hitObjects.length > 0)
      text += ` (${hitObjects.map(it => it.indexInCombo + 1).join(', ')})`;

    this.internalChildren = [
      new FastRoundedBox({
        color: 0x343440,
        relativeSizeAxes: Axes.Both,
        cornerRadius: 4,
      }),
      new Container({
        autoSizeAxes: Axes.Both,
        padding: { horizontal: 4, vertical: 2 },
        child: this.#text = new OsucadSpriteText({
          text,
          color: OsucadColors.primary,
        }),
      }),
    ];
  }

  #text!: SpriteText;

  override onHover(e: HoverEvent): boolean {
    this.#text.color = OsucadColors.primaryHighlight;
    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#text.color = OsucadColors.primary;
  }

  @resolved(EditorClock)
  editorClock!: EditorClock;

  @resolved(HitObjectSelectionManager, true)
  selection?: HitObjectSelectionManager;

  override onClick(e: ClickEvent): boolean {
    this.editorClock.seek(this.timestamp, true);
    if (this.hitObjects.length > 0) {
      this.selection?.setSelection(...this.hitObjects);
    }

    return true;
  }
}
