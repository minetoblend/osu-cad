import { Bindable } from 'osucad-framework';
import type { BeatmapItemInfo } from './BeatmapItemInfo';
import lunr from 'lunr';

export class BeatmapSelectFilter {
  constructor(
    readonly beatmaps: Bindable<BeatmapItemInfo[]>,
  ) {
    this.index = lunr(function () {
      this.ref('id');
      this.field('title');
      this.field('artist');
      this.field('author');
      this.field('version');

      for (const beatmap of beatmaps.value) {
        this.add({
          id: beatmap.id,
          title: beatmap.title,
          artist: beatmap.artist,
          author: beatmap.authorName,
          version: beatmap.difficultyName,
        });
      }
    });

    this.searchTerm.addOnChangeListener(() => this.updateFilter());

    this.updateFilter();
  }


  readonly index: lunr.Index;

  searchTerm = new Bindable('');

  beatmapMap = new Map<string, BeatmapItemInfo>();

  readonly visibleBeatmaps = new Bindable<Set<string> | null>(null);

  updateFilter() {
    const term = this.searchTerm.value.trim();

    const words = term.split(' ')
      .filter(word => word.length > 1)
      .map(word => {
        let field: string | undefined;

        if (word.includes('=')) {
          const [fieldName, value] = word.split('=');
          field = fieldName;
          word = value;
        }

        if (!word.startsWith('+') && !word.startsWith('-') && !word.includes(':')) {
          word = '+' + word;
        }

        if (!word.endsWith('*') && !word.endsWith('insane')) {
          word = word + '*';
        }

        if (field)
          return `${field}:${word}`;

        return word;
      });

    if (words.length === 0) {
      this.visibleBeatmaps.value = null;
      return;
    }

    try {
      const result = this.index.search(words.join(' '));

      this.visibleBeatmaps.value = new Set(result.flatMap(it => it.ref)) as Set<string>;
    } catch (e) {
      console.warn(e);
      this.visibleBeatmaps.value = null;
    }
  }
}
