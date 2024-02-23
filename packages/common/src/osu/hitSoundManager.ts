import { HitSoundLayer, SerializedHitSoundLayer } from './hitSoundLayer';
import { SampleSet, SampleType } from './hitSound';
import { Envelope, SerializedEnvelope } from './envelope';

export class HitSoundManager {
  constructor(options: SerializedHitSounds) {
    this.layers = (options.layers ?? []).map(
      (layer) => new HitSoundLayer(layer),
    );
    if (options.volume) {
      this.volume = new Envelope(options.volume);
    } else {
      this.volume = new Envelope({ controlPoints: [] });
    }
  }

  readonly layers: HitSoundLayer[] = [];

  readonly volume: Envelope;

  serialize(): SerializedHitSounds {
    return {
      layers: this.layers.map((layer) => layer.serialize()),
      volume: this.volume.serialize(),
    };
  }
}

export interface SerializedHitSounds {
  layers: SerializedHitSoundLayer[];
  volume?: SerializedEnvelope;
}

export function defaultHitSoundLayers(): HitSoundLayer[] {
  const types = [
    SampleType.Normal,
    SampleType.Whistle,
    SampleType.Finish,
    SampleType.Clap,
  ];
  const sampleSets = [SampleSet.Normal, SampleSet.Soft, SampleSet.Drum];
  const layers: HitSoundLayer[] = [];
  for (const sampleSet of sampleSets) {
    for (const type of types) {
      layers.push(
        new HitSoundLayer({
          name: null,
          sampleSet,
          type,
          customFilename: null,
          samples: [],
          volume: 1,
          enabled: true,
        }),
      );
    }
  }
  return layers;
}
