import type { APIBeatmapSet } from '@osucad/core';
import type { ClickEvent, HoverEvent, HoverLostEvent } from '@osucad/framework';
import { APIProvider, OsucadColors, OsucadSpriteText } from '@osucad/core';
import { Anchor, Axes, BetterBackdropBlurFilter, CompositeDrawable, FillDirection, FillFlowContainer, resolved, RoundedBox, Vec2 } from '@osucad/framework';

export class ImportCard extends CompositeDrawable {
  constructor(
    readonly onImport: (beatmapSet: APIBeatmapSet) => void,
  ) {
    super();

    this.relativeSizeAxes = Axes.X;
    this.autoSizeAxes = Axes.Y;

    this.filters = [
      new BetterBackdropBlurFilter({
        strength: 15,
        quality: 3,
      }),
    ];

    this.internalChildren = [
      this.#background = new RoundedBox({
        relativeSizeAxes: Axes.Both,
        cornerRadius: 8,
        fillColor: OsucadColors.translucent,
        fillAlpha: 0.5,
        outline: {
          color: 0xB9C6DD,
          width: 0.75,
          alpha: 0.2,
          alignment: 0,
        },
      }),
      new FillFlowContainer({
        direction: FillDirection.Vertical,
        relativeSizeAxes: Axes.X,
        autoSizeAxes: Axes.Y,
        padding: { horizontal: 20, vertical: 30 },
        spacing: new Vec2(4),
        children: [
          new OsucadSpriteText({
            text: 'Create new beatmap',
            fontSize: 16,
            anchor: Anchor.TopCenter,
            origin: Anchor.TopCenter,
          }),
          new OsucadSpriteText({
            text: 'You can also drag files here to import them',
            fontSize: 12,
            alpha: 0.5,
            anchor: Anchor.TopCenter,
            origin: Anchor.TopCenter,
          }),
        ],
      }),
    ];
  }

  #background!: RoundedBox;

  override onHover(e: HoverEvent): boolean {
    this.#background.transformTo('fillAlpha', 0.75, 100);

    return true;
  }

  override onHoverLost(e: HoverLostEvent) {
    this.#background.transformTo('fillAlpha', 0.5, 100);
  }

  override onClick(e: ClickEvent): boolean {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.osz';
    input.multiple = false;
    input.click();

    input.addEventListener('input', () => {
      const file = input.files?.item(0);
      if (!file || !file.name.endsWith('.osz'))
        return;

      this.#uploadOszFile(file);
    });

    return true;
  }

  @resolved(APIProvider)
  api!: APIProvider;

  async #uploadOszFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.api.apiEndpoint}/beatmapsets/import/osz`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      // TODO: display error
      return;
    }

    this.onImport(await response.json());
  }
}
