import type { IBeatmap } from '../../../beatmap/IBeatmap';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { trimIndent } from '../../../utils/stringUtils';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

const collabChars = /[,&|/]/g;
const possessorRegex = /(.+)(?:'s|(s)')/gi;

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Metadata/CheckGuestTags.cs
export class CheckGuestTags extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Metadata',
      message: 'Missing GDers in tags',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: 'Ensuring that the set can be found by searching for any of its guest difficulty creators',
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              If you're looking for beatmaps of a specific user, it'd make sense if sets containing their
              guest difficulties would appear, and not only sets they hosted.
          `),
        },
      ],
    };
  }

  override templates = {
    warning: new IssueTemplate('warning', '"{0}" is possessive but "{1}" isn\'t in the tags, ignore if not a user.', 'guest\'s diff', 'guest').withCause('A difficulty name is prefixed by text containing an apostrophe (\') before or after ' + 'the character "s", which is not in the tags.'),
  };

  override async * getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    for (const beatmap of mapset.beatmaps) {
      for (const possessor of this.getAllPossessors(beatmap.beatmapInfo.difficultyName)) {
        if (possessor === null)
          continue;

        if (this.isCoveredByTags(possessor, beatmap) || beatmap.metadata.creator.toLowerCase() === possessor.toLowerCase())
          continue;

        yield this.createIssue(this.templates.warning, null, beatmap.beatmapInfo.difficultyName, possessor.toLowerCase().replaceAll(' ', '_'))
        ;
      }
    }
  }

  getCoveringTag(searchWord: string, beatmap: IBeatmap) {
    for (const tag of beatmap.metadata.tags.split(' ')) {
      if (tag.includes(searchWord.toLowerCase()))
        return tag;
    }
    return null;
  }

  isCoveredByTags(possessor: string, beatmap: IBeatmap) {
    for (const searchWord of possessor.split(' ')) {
      if (this.getCoveringTag(searchWord, beatmap) === null)
        return false;
    }

    return true;
  }

  * getAllPossessors(text: string) {
    for (const possessor of text.split(collabChars))
      yield this.getPossessor(possessor);
  }

  getPossessor(text: string) {
    const match = text.match(possessorRegex);

    if (match === null)
      return null;

    // e.g. "Alphabet" in "Alphabet's Normal"
    let possessor = match[1];

    if (match.length > 2)
      // If e.g. "Naxess' Insane", group 1 is "Naxes" and group 2 is the remaining "s".
      possessor += match[2];

    return possessor?.trim() ?? null;
  }
}
