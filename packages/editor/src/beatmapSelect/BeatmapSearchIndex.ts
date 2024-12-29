import type { BeatmapItemInfo } from './BeatmapItemInfo';
import { compare } from 'fast-string-compare';
import { SortedList } from '../../../framework/src';

/**
 * An attempt at making a full text search index for the beatmap search.
 * Surprised this actually works
 */
export class BeatmapSearchIndex {
  add(beatmap: BeatmapItemInfo) {
    this.#addString(beatmap, beatmap.title);
    this.#addString(beatmap, beatmap.artist);
    this.#addString(beatmap, beatmap.authorName);
    this.#addString(beatmap, beatmap.difficultyName);

    this.#allEntries.add(beatmap);

    const creatorBeatmaps = this.#creators.get(beatmap.authorName.toLowerCase());
    if (creatorBeatmaps)
      creatorBeatmaps.push(beatmap);
    else
      this.#creators.set(beatmap.authorName.toLowerCase(), [beatmap]);
  }

  #allEntries = new Set<BeatmapItemInfo>();

  #entryMap: Map<string, BeatmapItemInfo[]> = new Map<string, BeatmapItemInfo[]>();

  built = false;

  #creators = new Map<string, BeatmapItemInfo[]>();

  #getWords(str: string) {
    return str.toLowerCase().trim().split(' ').filter(it => it.length > 0);
  }

  #addString(beatmap: BeatmapItemInfo, str: string) {
    const words = this.#getWords(str);

    for (const word of words) {
      if (word.length === 0)
        continue;

      const entry = this.#entryMap.get(word);
      if (entry) {
        entry.push(beatmap);
      }
      else if (this.built) {
        const item = { term: word, entries: [beatmap] };
        this.#index.add(item);
        this.#entryMap.set(word, item.entries);
      }
      else {
        this.#entryMap.set(word, [beatmap]);
      }
    }
  }

  build() {
    const entries = [...this.#entryMap!.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [word, items] of entries)
      this.#index.add({ term: word, entries: items });

    this.built = true;
  }

  #index = new SortedList<{
    term: string;
    entries: BeatmapItemInfo[];
  }>({
    compare: (a, b) => compare(a.term, b.term),
  });

  search(str: string) {
    const words = this.#getWords(str);

    if (words.length === 0)
      return [];

    const starsRegex = /stars([<>])([\d.]+)/i;
    const creatorRegex = /creator=(.+)/i;

    const filters: ((entry: BeatmapItemInfo) => boolean)[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const starsMatch = starsRegex.exec(word);
      if (starsMatch) {
        const [_, operator, value] = starsMatch;

        const parsed = Number.parseFloat(value);
        if (Number.isNaN(parsed))
          continue;

        if (operator === '<')
          filters.push(entry => entry.starRating < parsed);
        else if (operator === '>')
          filters.push(entry => entry.starRating > parsed);

        words.splice(i--, 1);
      }

      const creatorMatch = creatorRegex.exec(word);
      if (creatorMatch) {
        let [_, value] = creatorMatch;
        value = value.toLowerCase();

        const beatmapIds = new Set<string>();

        for (const creatorName of this.#creators.keys()) {
          if (creatorName.startsWith(value)) {
            const creatorBeatmaps = this.#creators.get(creatorName);
            if (creatorBeatmaps) {
              for (const beatmap of creatorBeatmaps)
                beatmapIds.add(beatmap.id);
            }
          }
        }

        if (beatmapIds.size === 0)
          return [];

        filters.push(entry => beatmapIds.has(entry.id));

        words.splice(i--, 1);
      }
    }

    let foundEntries: Set<BeatmapItemInfo> = new Set(this.#allEntries);

    for (const word of words) {
      let index = this.#index.binarySearch({ term: word } as any);

      if (index < 0)
        index = ~index;

      if (!this.#index.get(index)?.term.startsWith(word))
        return [];

      let start = index;
      let end = index;

      while (start > 0 && this.#index.get(start - 1)!.term.startsWith(word))
        start--;
      while (end < this.#index.length - 1 && this.#index.get(end)!.term.startsWith(word))
        end++;

      foundEntries = foundEntries.intersection(new Set(this.#index.items.slice(start, end).flatMap(it => it.entries)));
    }

    let entries = [...foundEntries];

    for (const filter of filters) {
      entries = entries.filter(filter);
    }

    return entries;
  }
}
