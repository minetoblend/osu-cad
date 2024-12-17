import { Json } from '@osucad/serialization';
import { expect } from 'vitest';
import { Beatmap } from '../Beatmap';
import { BeatmapSerializer } from './BeatmapSerializer';

describe('beatmapSerializer', () => {
  it('should be tested', () => {
    const beatmap = new Beatmap();

    const encoded = new Json().encode(new BeatmapSerializer(), beatmap);

    console.log(encoded);

    expect(encoded).toBe('');
  });
});
