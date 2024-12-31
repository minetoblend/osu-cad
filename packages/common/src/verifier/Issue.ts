import type { ClickEvent } from 'osucad-framework';
import type { HitObject } from '../hitObjects/HitObject';
import { Axes, BindableBoolean, Container, FastRoundedBox, FillDirection, FillFlowContainer, resolved, Vec2 } from 'osucad-framework';

import { OsucadSpriteText } from '../drawables/OsucadSpriteText';
import { TextBlock } from '../drawables/TextBlock';
import { EditorClock } from '../editor/EditorClock';
import { HitObjectSelectionManager } from '../editor/screens/compose/HitObjectSelectionManager';
import { OsucadColors } from '../OsucadColors';

export interface IssueOptions {
  title: string;
  description: string;
  hitObjects?: HitObject[];
  timestamp?: number;
}

export enum IssueType {
  Suggestion,
  Warning,
  Error,
}

export class Issue extends Container {
  readonly selected = new BindableBoolean();

  readonly title: string;
  readonly description: string;
  readonly hitObjects: HitObject[];
  readonly timestamp?: number;

  constructor(
    options: IssueOptions,
  ) {
    super();

    const { title, description, hitObjects, timestamp } = options;

    this.title = title;
    this.description = description;
    this.hitObjects = hitObjects ?? [];
    this.timestamp = timestamp;

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.addAllInternal(
      new Container({
        relativeSizeAxes: Axes.Both,
        padding: -2,
        child: this.#selectionOutline = new FastRoundedBox({
          relativeSizeAxes: Axes.Both,
          color: OsucadColors.primary,
          cornerRadius: 6,
          alpha: 0,
        }),
      }),
      new FastRoundedBox({
        relativeSizeAxes: Axes.Both,
        color: OsucadColors.translucent,
        cornerRadius: 4,
      }),
      new FillFlowContainer({
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: 10,
        direction: FillDirection.Vertical,
        spacing: new Vec2(2),
        children: [
          new OsucadSpriteText({
            text: title,
            color: OsucadColors.text,
          }),
          new TextBlock({
            text: description,
            color: OsucadColors.text,
            fontSize: 14,
          }),
        ],
      }),
    );

    this.selected.addOnChangeListener((selected) => {
      if (selected.value)
        this.#selectionOutline.show();
      else
        this.#selectionOutline.hide();
    });
  }

  #selectionOutline!: FastRoundedBox;

  @resolved(HitObjectSelectionManager)
  protected selectionManager!: HitObjectSelectionManager;

  @resolved(EditorClock)
  editorClock!: EditorClock;

  override onClick(e: ClickEvent): boolean {
    this.selected.toggle();

    this.selectionManager.setSelection(...this.hitObjects);

    if (this.timestamp !== undefined || this.hitObjects.length > 0)
      this.editorClock.seek(this.timestamp ?? this.hitObjects[0].startTime);

    return true;
  }
}
