import type { BeatmapItemInfo } from './BeatmapItemInfo.ts';
import { SortedList } from '../../../framework/src';
import { compare } from 'fast-string-compare'

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
  }

  #allEntries = new Set<BeatmapItemInfo>();

  #entryBuilder = new Map<string, BeatmapItemInfo[]>();

  #getWords(str: string) {
    return str.toLowerCase().trim().split(' ').filter(it => it.length > 0);
  }

  #addString(beatmap: BeatmapItemInfo, str: string) {
    const words = this.#getWords(str);

    for (const word of words) {
      if (word.length === 0)
        continue;

      const entry = this.#entryBuilder.get(word);
      if (entry) {
        entry.push(beatmap);
        continue;
      }

      this.#entryBuilder.set(word, [beatmap]);
    }
  }

  build() {
    const entries = [...this.#entryBuilder.entries()].sort((a, b) => a[0].localeCompare(b[0]));

    for (const [word, items] of entries) {
      this.#index.add({ term: word, entries: items });
    }
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

    const filters: ((entry: BeatmapItemInfo) => boolean)[] = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const match = starsRegex.exec(word);
      if (match) {
        const [_, operator, value] = match;

        const parsed = Number.parseFloat(value);
        if (Number.isNaN(parsed))
          continue;

        if (operator === '<')
          filters.push(entry => entry.starRating < parsed);
        else if (operator === '>')
          filters.push(entry => entry.starRating > parsed);

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
