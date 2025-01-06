import type { CheckMetadata } from '../../BeatmapCheck';
import type { Issue } from '../../Issue';
import type { VerifierBeatmapSet } from '../../VerifierBeatmapSet';
import { trimIndent } from '../../../utils/stringUtils';
import { GeneralCheck } from '../../GeneralCheck';
import { IssueTemplate } from '../../template/IssueTemplate';

// Ported from https://github.com/Naxesss/MapsetVerifier/blob/main/src/Checks/AllModes/General/Files/CheckZeroBytes.cs
export class CheckZeroBytes extends GeneralCheck {
  override get metadata(): CheckMetadata {
    return {
      category: 'Files',
      message: '0-byte files.',
      author: 'Naxess',
      documentation: [
        {
          title: 'Purpose',
          description: 'Ensuring all files can be uploaded properly during the submission process.',
        },
        {
          title: 'Reasoning',
          description: trimIndent(`
              0-byte files prevent other files in the song folder from properly uploading. Mappers sometimes attempt to silence
              certain hit sound files by completely removing its audio data, but this often results in a file completely devoid
              of any data which makes it 0-byte. Instead, use <a href="https://up.ppy.sh/files/blank.wav">this 44-byte file</a>
              which osu provides to mute hit sound files.
              <image>
                  https://i.imgur.com/Qb9z95T.png
                  A 0-byte slidertick hit sound file.
              </image>"
          `),
        },
      ],
    };
  }

  override templates = {
    zeroByte: new IssueTemplate('problem', '"{0}"', 'path').withCause('A file in the song folder contains no data; consists of 0 bytes.'),
  };

  override async* getIssues(mapset: VerifierBeatmapSet): AsyncGenerator<Issue, void, undefined> {
    for (const file of mapset.fileStore.files) {
      const data = await file.getData();
      if (data.byteLength === 0) {
        yield this.createIssue(this.templates.zeroByte, null, file.name);
      }
    }
  }
}
