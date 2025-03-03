import type { IFile } from '../../../beatmap/io/IFile';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { IRenderer, loadTexture, MenuItem, resolved } from '@osucad/framework';
import { Sprite } from 'pixi.js';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Resources/CheckBgResolution.cs
export class CheckBgResolution extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Resources',
      message: 'Too high or low background resolution.',
      author: 'Naxess',
    };
  }

  override templates = {
    tooHigh: new IssueTemplate('problem', '"{0}" greater than 2560 x 1440 ({1} x {2})', 'file name')
      .withCause('A background file has a width exceeding 2560 pixels or a height exceeding 1440 pixels.'),
    veryLow: new IssueTemplate('warning', '"{0}" lower than 1024 x 640 ({1} x {2})', 'file name', 'width', 'height')
      .withCause('A background file has a width lower than 1024 pixels or a height lower than 640 pixels.'),
    fileSize: new IssueTemplate('problem', '"{0}" has a file size exceeding 2.5 MB ({1} MB)', 'file name', 'file size')
      .withCause('A background file has a file size greater than 2.5 MB.'),
  };

  override async* getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const bgFilenames = new Set<string>();
    for (const beatmap of mapset.beatmaps) {
      const filename = beatmap.metadata.backgroundFile?.trim() ?? '';
      if (filename.length === 0)
        continue;

      bgFilenames.add(filename);
    }

    const issues: Issue[] = [];

    await Promise.all([...bgFilenames].map(async (filename) => {
      const file = mapset.fileStore.getFile(filename);
      if (!file)
        return;

      const data = await file.getData();

      const megaBytes = data.byteLength / 1024 ** 2;

      const texture = await loadTexture(data);

      if (megaBytes > 2.5) {
        issues.push(this.createIssue(this.templates.fileSize, null, filename, megaBytes).withActions(
          ...(texture
            ? [
                new MenuItem({
                  text: 'Generate compressed background',
                  action: () => {
                    const ratio = Math.min(2560 / texture.width, 1440 / texture.height);
                    this.createResizedImage(filename, file, Math.min(ratio, 1));
                  },
                }),
              ]
            : []),
        ));
      }

      if (!texture)
        return;

      const { width, height } = texture;

      if (width > 2560 || height > 1440) {
        const ratio = Math.min(2560 / texture.width, 1440 / texture.height);

        issues.push(this.createIssue(this.templates.tooHigh, null, filename, texture.width, texture.height)
          .withActions(
            new MenuItem({
              text: 'Download resized image',
              action: () => this.createResizedImage(filename, file, ratio),
            }),
          ));
      }

      if (texture.width < 1024 || texture.height < 640) {
        issues.push(this.createIssue(this.templates.veryLow, null, filename, texture.width, texture.height));
      }

      texture.destroy(true);
    }));

    yield * issues;
  }

  @resolved(IRenderer)
  renderer!: IRenderer;

  async createResizedImage(filename: string, file: IFile, ratio: number) {
    const data = await file.getData();
    const texture = await loadTexture(data);
    if (!texture)
      // TODO: display error message
      return;

    let sprite: Sprite;

    const canvas = this.renderer.extract.canvas({
      target: sprite = new Sprite({
        texture,
        width: texture.width * ratio,
        height: texture.height * ratio,
      }),
      antialias: true,
      filename,
      resolution: ratio,
    });

    if (!canvas)
      return;

    const link = document.createElement('a');

    filename = `${filename.split('.').slice(0, -1).join('.')}.jpg`;

    link.download = filename;
    link.href = canvas.toDataURL!('image/jpeg', 0.9);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    texture.destroy(true);
    sprite.destroy();
  }
}
