import type { CommandContext } from '../editor/commands/CommandContext';
import type { Patchable } from '../editor/commands/Patchable';
import { Bindable } from 'osucad-framework';
import { PatchUtils } from '../editor/commands/PatchUtils';

export interface BeatmapMetadataPatch {
  artist: string;
  artistUnicode: string;
  title: string;
  titleUnicode: string;
  source: string;
  creator: string;
  difficultyName: string;
  previewTime: number;
}

export class BeatmapMetadata implements Patchable<BeatmapMetadataPatch> {
  artistBindable = new Bindable('');

  get artist() {
    return this.artistBindable.value;
  }

  set artist(value) {
    this.artistBindable.value = value;
  }

  artistUnicodeBindable = new Bindable('');

  get artistUnicode() {
    return this.artistUnicodeBindable.value;
  }

  set artistUnicode(value) {
    this.artistUnicodeBindable.value = value;
  }

  titleBindable = new Bindable('');

  get title() {
    return this.titleBindable.value;
  }

  set title(value) {
    this.titleBindable.value = value;
  }

  titleUnicodeBindable = new Bindable('');

  get titleUnicode() {
    return this.titleUnicodeBindable.value;
  }

  set titleUnicode(value) {
    this.titleUnicodeBindable.value = value;
  }

  sourceBindable = new Bindable('');

  get source() {
    return this.sourceBindable.value;
  }

  set source(value) {
    this.sourceBindable.value = value;
  }

  tagsBindable = new Bindable('');

  get tags() {
    return this.tagsBindable.value;
  }

  set tags(value) {
    this.tagsBindable.value = value;
  }

  previewTimeBindable = new Bindable(0);

  get previewTime() {
    return this.previewTimeBindable.value;
  }

  set previewTime(value) {
    this.previewTimeBindable.value = value;
  }

  creatorBindable = new Bindable('');

  get creator() {
    return this.creatorBindable.value;
  }

  set creator(value) {
    this.creatorBindable.value = value;
  }

  difficultyNameBindable = new Bindable('');

  get difficultyName() {
    return this.difficultyNameBindable.value;
  }

  set difficultyName(value) {
    this.difficultyNameBindable.value = value;
  }

  osuWebId = 0;

  osuWebSetId = 0;

  applyPatch(patch: Partial<BeatmapMetadataPatch>, ctx: CommandContext) {
    PatchUtils.applyPatch(patch, this);
  }

  asPatch(): BeatmapMetadataPatch {
    const {
      artist,
      artistUnicode,
      title,
      titleUnicode,
      source,
      creator,
      difficultyName,
      previewTime,
    } = this;

    return {
      artist,
      artistUnicode,
      title,
      titleUnicode,
      source,
      creator,
      difficultyName,
      previewTime,
    };
  }

  get displayName() {
    return `${this.artist} - ${this.title} [${this.difficultyName}]`;
  }
}
