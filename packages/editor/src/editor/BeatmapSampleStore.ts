import type { Sample } from 'osucad-framework';
import type { HitSample } from '../beatmap/hitSounds/HitSample';
import { asyncDependencyLoader, AudioManager, Component, resolved } from 'osucad-framework';
import { SampleSet } from '../beatmap/hitSounds/SampleSet';
import { SampleType } from '../beatmap/hitSounds/SampleType';
import { ISkinSource } from '../skinning/ISkinSource';
import { EditorContext } from './context/EditorContext';
import { EditorMixer } from './EditorMixer';

export class BeatmapSampleStore extends Component {
  @resolved(AudioManager)
  audioManager!: AudioManager;

  @resolved(EditorMixer)
  mixer!: EditorMixer;

  @resolved(ISkinSource)
  skin!: ISkinSource;

  @resolved(EditorContext)
  editorContext!: EditorContext;

  beatmapSamples = new Map<string, Sample>();

  @asyncDependencyLoader()
  async load() {
    await Promise.all([
      this.#loadBeatmapSamples(),
    ]);
  }

  async #loadBeatmapSamples() {
    const found = new Set<string>();

    const resources = this.editorContext.resources.getAvailableResources();

    const audioFilename = /((?:soft|normal|drum)-((?:hitnormal|hitwhistle|hitfinish|hitclap|sliderslide|sliderwhistle)\d*))\.wav$/i;

    const promises: Promise<any>[] = [];

    for (const asset of resources) {
      const match = asset.match(audioFilename);

      if (!match)
        continue;

      const [, key] = match;

      if (!key)
        continue;

      const data = this.editorContext.getResource(asset);
      if (!data)
        continue;

      found.add(key);

      promises.push(
        this.audioManager
          .createSampleFromArrayBuffer(this.mixer.hitsounds, data)
          .then((sample) => {
            console.log(`Loaded beatmap sample "${key}"`);
            this.beatmapSamples.set(key, sample);
          })
          .catch(err => console.warn(`Failed to decode audio for "${key}"`, err)),
      );
    }

    await Promise.all(promises);
  }

  getSample(
    sample: HitSample,
  ): Sample | null {
    let key = '';
    switch (sample.sampleSet) {
      case SampleSet.Soft:
        key = 'soft';
        break;
      case SampleSet.Normal:
        key = 'normal';
        break;
      case SampleSet.Drum:
        key = 'drum';
        break;
      default:
        return null;
    }

    switch (sample.sampleType) {
      case SampleType.Normal:
        key += '-hitnormal';
        break;
      case SampleType.Whistle:
        key += '-hitwhistle';
        break;
      case SampleType.Finish:
        key += '-hitfinish';
        break;
      case SampleType.Clap:
        key += '-hitclap';
        break;
      case SampleType.SliderSlide:
        key += '-sliderslide';
        break;
      case SampleType.SliderWhistle:
        key += '-sliderwhistle';
        break;
    }

    if (sample.index === 1) {
      const sample = this.beatmapSamples.get(key) ?? this.skin.getSample(this.mixer.hitsounds, key);
      if (sample)
        return sample;
    }

    return this.beatmapSamples.get(key + sample.index) ?? this.skin.getSample(this.mixer.hitsounds, key) ?? null;
  }
}
