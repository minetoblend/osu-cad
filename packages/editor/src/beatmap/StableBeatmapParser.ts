import { Beatmap } from './Beatmap';

enum BeatmapSection {
  General = 'General',
  Editor = 'Editor',
  Metadata = 'Metadata',
  Difficulty = 'Difficulty',
  Events = 'Events',
  TimingPoints = 'TimingPoints',
  Colours = 'Colours',
  HitObjects = 'HitObjects',
}

export class StableBeatmapParser {
  parse(fileContent: string): Beatmap {
    const lines = fileContent.split('\n').map(it => it.trim());

    let currentSection: BeatmapSection | null = null;

    const versionHeader = lines.shift();
    if (!versionHeader)
      throw new Error('Invalid beatmap file');

    const version = versionHeader.match(/osu file format v(\d+)/)?.[1];
    if (!version) {
      throw new Error('Invalid beatmap file. Could not find version header.');
    }

    const beatmap = new Beatmap();

    for (const line of lines) {
      const newSection = this.#tryParseSectionHeader(line);
      if (newSection) {
        currentSection = newSection;
        continue;
      }

      if (currentSection) {
        this.#parseLine(beatmap, currentSection, line);
      }
    }

    return beatmap;
  }

  #tryParseSectionHeader(line: string): BeatmapSection | null {
    if (line.startsWith('[') && line.endsWith(']')) {
      const section = line.substring(1, line.length - 1);
      if (section in BeatmapSection) {
        return section as BeatmapSection;
      }
    }
    return null;
  }

  #parseLine(beatmap: Beatmap, section: BeatmapSection, line: string) {
    switch (section) {
      case BeatmapSection.General:
        this.#parseGeneral(beatmap, line);
        break;
      case BeatmapSection.Metadata:
        this.#parseMetadata(beatmap, line);
        break;
      case BeatmapSection.Editor:
        this.#parseEditor(beatmap, line);
        break;
    }
  }

  #parseMetadata(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

    switch (key) {
      case 'Title':
        beatmap.beatmapInfo.metadata.title = value;
        break;
      case 'TitleUnicode':
        beatmap.beatmapInfo.metadata.titleUnicode = value;
        break;
      case 'Artist':
        beatmap.beatmapInfo.metadata.artist = value;
        break;
      case 'ArtistUnicode':
        beatmap.beatmapInfo.metadata.artistUnicode = value;
        break;
      case 'Creator':
        beatmap.beatmapInfo.metadata.author = {
          onlineId: null,
          username: value,
          avatarUrl: null,
        };
        break;
      case 'Version':
        beatmap.beatmapInfo.difficultyName = value;
        break;
      case 'Source':
        beatmap.beatmapInfo.metadata.source = value;
        break;
      case 'Tags':
        beatmap.beatmapInfo.metadata.tags = value;
        break;
      case 'BeatmapID':
        beatmap.beatmapInfo.osuWebId = Number.parseInt(value);
        break;
      case 'BeatmapSetID':
        beatmap.beatmapInfo.beatmapSetInfo.osuWebId = Number.parseInt(value);
        break;
    }
  }

  #parseGeneral(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

    switch (key) {
      case 'AudioFilename':
        beatmap.beatmapInfo.audioFilename = value;
        break;
      case 'AudioLeadIn':
        beatmap.beatmapInfo.audioLeadIn = Number.parseInt(value);
        break;
      case 'AudioHash':
        beatmap.beatmapInfo.audioHash = value;
        break;
      case 'PreviewTime':
        beatmap.beatmapInfo.previewTime = Number.parseInt(value);
        break;
      case 'Countdown':
        beatmap.beatmapInfo.countdown = Number.parseInt(value);
        break;
      case 'SampleSet':
        beatmap.beatmapInfo.sampleSet = value;
        break;
      case 'StackLeniency':
        beatmap.beatmapInfo.stackLeniency = Number.parseFloat(value);
        break;
      case 'Mode':
        beatmap.beatmapInfo.mode = Number.parseInt(value);
        break;
      case 'LetterboxInBreaks':
        beatmap.beatmapInfo.letterboxInBreaks = value === '1';
        break;
      case 'UseSkinSprites':
        beatmap.beatmapInfo.useSkinSprites = value === '1';
        break;
      case 'AlwaysShowPlayfield':
        beatmap.beatmapInfo.alwaysShowPlayfield = value === '1';
        break;
      case 'OverlayPosition':
        beatmap.beatmapInfo.overlayPosition = value;
        break;
      case 'SkinPreference':
        beatmap.beatmapInfo.skinPreference = value;
        break;
      case 'EpilepsyWarning':
        beatmap.beatmapInfo.epilepsyWarning = value === '1';
        break;
      case 'CountdownOffset':
        beatmap.beatmapInfo.countdownOffset = Number.parseInt(value);
        break;
      case 'SpecialStyle':
        beatmap.beatmapInfo.specialStyle = value === '1';
        break;
      case 'WidescreenStoryboard':
        beatmap.beatmapInfo.widescreenStoryboard = value === '1';
        break;
      case 'SamplesMatchPlaybackRate':
        beatmap.beatmapInfo.samplesMatchPlaybackRate = value === '1';
        break;
    }
  }

  #parseEditor(beatmap: Beatmap, line: string) {
    const [key, value] = line.split(':').map(it => it.trim());

    switch (key) {
      case 'Bookmarks':
        beatmap.beatmapInfo.editor.bookmarks = value.split(',').map(it => Number.parseInt(it));
        break;
      case 'DistanceSpacing':
        beatmap.beatmapInfo.editor.distanceSpacing = Number.parseFloat(value);
        break;
      case 'BeatDivisor':
        beatmap.beatmapInfo.editor.beatDivisor = Number.parseInt(value);
        break;
      case 'GridSize':
        beatmap.beatmapInfo.editor.gridSize = Number.parseInt(value);
        break;
      case 'TimelineZoom':
        beatmap.beatmapInfo.editor.timelineZoom = Number.parseFloat(value);
        break;
    }
  }
}
