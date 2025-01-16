import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { trimIndent } from '../../../utils/stringUtils';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Metadata/CheckGenreLanguage.cs
export class CheckGenreLanguage extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Metadata',
      message: 'Missing genre/language in tags.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: 'Consistent searching between web and in-game.',
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              Web's language/genre fields can be searched for on the web, but not in-game.
              They are therefore added to the tags for consistency.
              <image-right>
                  https://i.imgur.com/g6zlqhy.png
                  An example of web genre/language also in the tags.
              </image>
          `),
        },
      ],
    };
  }

  readonly genreTagCombinations = [
    ['Video', 'Game'],
    ['Anime'],
    ['Rock'],
    ['Pop'],
    ['Novelty'],
    ['Hip', 'Hop'],
    ['Electronic'],
    ['Metal'],
    ['Classical'],
    ['Folk'],
    ['Jazz'],
  ];

  readonly languageTagCombinations = [
    ['English'],
    ['Chinese'],
    ['French'],
    ['German'],
    ['Italian'],
    ['Japanese'],
    ['Korean'],
    ['Spanish'],
    ['Swedish'],
    ['Russian'],
    ['Polish'],
    ['Instrumental'],

    // Following are not web languages, but if we find these in the tags,
    // web would need to be "Other" anyway, so no point in warning.
    ['Conlang'],
    ['Hindi'],
    ['Arabic'],
    ['Portugese'],
    ['Turkish'],
    ['Vietnamese'],
    ['Persian'],
    ['Indonesian'],
    ['Ukrainian'],
    ['Romanian'],
    ['Dutch'],
    ['Thai'],
    ['Greek'],
    ['Somali'],
    ['Malay'],
    ['Hungarian'],
    ['Czech'],
    ['Norwegian'],
    ['Finnish'],
    ['Danish'],
    ['Latvia'],
    ['Lithuanian'],
    ['Estonian'],
    ['Punjabi'],
    ['Bengali'],
  ];

  override templates = {
    genre: new IssueTemplate('warning', 'Missing genre tag ("rock", "pop", "electronic", etc), ignore if none fit.').withCause(`None of the following tags were found (case insensitive):${this.toCause(this.genreTagCombinations)}`),
    language: new IssueTemplate('warning', 'Missing language tag ("english", "japanese", "instrumental", etc), ignore if none fit.').withCause(`None of the following tags were found (case insensitive):${this.toCause(this.languageTagCombinations)}`),
  };

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const refBeatmap = mapset.beatmaps[0];
    if (!refBeatmap)
      return;

    const tags = refBeatmap.metadata.tags.toLowerCase().split(' ');

    function hasAnyCombination(combinations: string[][], tags: string[]) {
      return combinations.some(combination => combination.every(word => tags.some(tag => tag.includes(word.toLowerCase()))));
    }

    if (!hasAnyCombination(this.genreTagCombinations, tags)) {
      yield this.createIssue(this.templates.genre, null);
    }

    if (!hasAnyCombination(this.languageTagCombinations, tags)) {
      yield this.createIssue(this.templates.language, null);
    }
  }

  toCause(tags: string[][]) {
    return tags.map(it => it.join('_').toLowerCase()).join(', ');
  }
}
