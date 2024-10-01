import type { FillFlowContainer } from 'osucad-framework';
import { resolved } from 'osucad-framework';
import { Beatmap } from '../../../beatmap/Beatmap.ts';
import { UpdateMetadataCommand } from '../../commands/UpdateMetadataCommand.ts';
import { LabelledTextBox } from '../timing/properties/LabelledTextBox.ts';
import { SetupScreenSection } from './SetupScreenSection.ts';

export class MetadataSection extends SetupScreenSection {
  constructor() {
    super('Metadata');
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  protected createContent(container: FillFlowContainer) {
    const metadata = this.beatmap.metadata;

    container.addAll(
      new LabelledTextBox('Title')
        .bindWithCommandManager(metadata.titleUnicodeBindable, value => new UpdateMetadataCommand({ titleUnicode: value })),

      new LabelledTextBox('Title Romanised')
        .asciiOnly()
        .adjust(it => it.margin = { bottom: 8 })
        .bindWithCommandManager(metadata.titleBindable, value => new UpdateMetadataCommand({ title: value })),

      new LabelledTextBox('Artist')
        .bindWithCommandManager(metadata.artistUnicodeBindable, value => new UpdateMetadataCommand({ artistUnicode: value })),

      new LabelledTextBox('Artist Romanised')
        .bindWithCommandManager(metadata.artistBindable, value => new UpdateMetadataCommand({ artist: value }))
        .asciiOnly()
        .adjust(it => it.margin = { bottom: 8 }),

      new LabelledTextBox('Difficulty Name')
        .bindWithCommandManager(metadata.difficultyNameBindable, value => new UpdateMetadataCommand({ difficultyName: value })),

      new LabelledTextBox('Creator')
        .bindWithCommandManager(metadata.creatorBindable, value => new UpdateMetadataCommand({ creator: value })),

      new LabelledTextBox('Source')
        .bindWithCommandManager(metadata.sourceBindable, value => new UpdateMetadataCommand({ source: value })),
    );
  }
}
