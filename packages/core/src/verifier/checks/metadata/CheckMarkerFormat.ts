import type { BeatmapMetadata } from '../../../beatmap/BeatmapMetadata';
import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Metadata/CheckMarkerFormat.cs
export class CheckMarkerFormat extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Metadata',
      message: 'Incorrect marker format.',
      author: 'Naxess',
    };
  }

  override templates = {
    wrongFormat: new IssueTemplate('problem', 'Incorrect formatting of "{0}" marker in {1} {2} field, "{3}".', 'marker', 'Romanized/unicode', 'artist/title', 'field').withCause('The artist or title field of a difficulty includes an incorrect format of "CV:", "vs." or "feat.".'),
  };

  override async* getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    const refBeatmap = mapset.beatmaps[0];
    if (!refBeatmap)
      return;

    const markers = [
      new Marker('vs.', /( vs\.?[^A-Z0-9])/gi, /vs\./g),
      new Marker('CV:', /( cv(: ?)?[^A-Z0-9])/gi, /CV(: ?)/g),
      new Marker('feat.', /( (ft|feat)\.?[^A-Z0-9])/gi, /feat\./g),
    ];

    for (const marker of markers) {
      for (const issue of this.getFormattingIssues(refBeatmap.metadata, marker))
        yield issue;
    }
  }

  * getFormattingIssues(metadata: BeatmapMetadata, marker: Marker) {
    const cause = 'The artist or title field of a difficulty includes an incorrect format of "CV:", "vs." or "feat.".';

    if (marker.isSimilarButNotExact(metadata.artist))
      yield this.createIssue(this.templates.wrongFormat, null, marker.name, 'Romanized', 'artist', metadata.artist);

    if (metadata.artistUnicode.length > 0 && marker.isSimilarButNotExact(metadata.artistUnicode))
      yield this.createIssue(this.templates.wrongFormat, null, marker.name, 'Unicode', 'artist', metadata.artistUnicode);

    if (marker.isSimilarButNotExact(metadata.title))
      yield this.createIssue(this.templates.wrongFormat, null, marker.name, 'Romanized', 'title', metadata.title);

    if (metadata.titleUnicode.length > 0 && marker.isSimilarButNotExact(metadata.titleUnicode))
      yield this.createIssue(this.templates.wrongFormat, null, marker.name, 'Unicode', 'title', metadata.titleUnicode);
  }
}

class Marker {
  constructor(
    readonly name: string,
    readonly approxRegex: RegExp,
    readonly exactRegex: RegExp,
  ) {
  }

  isSimilarButNotExact(input: string) {
    return this.approxRegex.test(input) && !this.exactRegex.test(input);
  }
}
