import type { AudioBufferTrack, DrawableOptions } from 'osucad-framework';
import type { PointData } from 'pixi.js';
import {
  Axes,
  CompositeDrawable,
  Drawable,
  Invalidation,
  LayoutMember,
  PIXIContainer,
  PIXIGraphics,
  resolved,
} from 'osucad-framework';
import { Timeline } from '../../ui/timeline/Timeline';

export class DrawableWaveform extends CompositeDrawable {
  constructor(readonly track: AudioBufferTrack, options: DrawableOptions = {}) {
    super();

    this.with({
      relativeSizeAxes: Axes.Both,
      alpha: 0.25,
      ...options,
    });
  }

  @resolved(Timeline)
  timeline!: Timeline;

  #chunks: DrawableWaveformChunk[] = [];

  #createWaveformChunk(startTime: number, endTime: number) {
    const buffer = this.track.buffer;
    const amplitudes: number[] = [];

    startTime = Math.max(startTime, 0);
    endTime = Math.min(endTime, buffer.duration * 1000);

    const sampleDuration = 1;
    const stepSize = 4;

    const samplesPerPoint = Math.floor(buffer.sampleRate * sampleDuration * 0.001);

    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(buffer.numberOfChannels - 1);

    const startIndex = Math.floor(startTime / sampleDuration) * samplesPerPoint;
    const endIndex = Math.ceil(endTime / sampleDuration) * samplesPerPoint;

    for (let i = startIndex; i < endIndex; i += samplesPerPoint) {
      if (i < 0) {
        amplitudes.push(0);
        continue;
      }

      const point = new Point();
      for (let j = i; j < i + samplesPerPoint; j += stepSize) {
        if (j >= buffer.length)
          break;

        point.leftAmplitude = Math.max(point.leftAmplitude, Math.abs(leftChannel[j]));
        point.rightAmplitude = Math.max(point.rightAmplitude, Math.abs(rightChannel[j]));
      }

      point.leftAmplitude = Math.min(point.leftAmplitude, 1);
      point.rightAmplitude = Math.min(point.rightAmplitude, 1);

      amplitudes.push((point.leftAmplitude + point.rightAmplitude) / 2);
    }

    return new DrawableWaveformChunk(startTime, endTime, amplitudes);
  }

  override update() {
    super.update();

    const chunkDuration = 1000;

    const firstChunkStartTime = Math.max(Math.floor(this.timeline.startTime / chunkDuration) * chunkDuration, 0);
    const lastChunkEndTime = Math.min(Math.ceil(this.timeline.endTime / chunkDuration) * chunkDuration, this.track.length);

    if (this.#chunks.length === 0) {
      for (let i = firstChunkStartTime; i < lastChunkEndTime; i += chunkDuration) {
        this.#addChunk(this.#createWaveformChunk(i, i + chunkDuration));
      }
    }
    else {
      const firstChunk = this.#chunks[0];
      const lastChunk = this.#chunks[this.#chunks.length - 1];

      for (let i = firstChunkStartTime; i < firstChunk.startTime; i += chunkDuration) {
        this.#addChunk(this.#createWaveformChunk(i, i + chunkDuration));
      }

      for (let i = lastChunk.endTime; i < lastChunkEndTime; i += chunkDuration) {
        this.#addChunk(this.#createWaveformChunk(i, i + chunkDuration));
      }
    }

    this.#chunks.sort((a, b) => a.startTime - b.startTime);

    for (const chunk of this.#chunks) {
      if (chunk.endTime < this.timeline.startTime || chunk.startTime > this.timeline.endTime) {
        this.removeInternal(chunk);
        this.#chunks.splice(this.#chunks.indexOf(chunk), 1);
      }
    }
  }

  #addChunk(chunk: DrawableWaveformChunk) {
    this.addInternal(chunk);
    this.#chunks.push(chunk);
  }
}

class Point {
  leftAmplitude = 0;
  rightAmplitude = 0;
}

class DrawableWaveformChunk extends Drawable {
  constructor(
    readonly startTime: number,
    readonly endTime: number,
    readonly amplitudes: number[],
  ) {
    super();

    this.relativeSizeAxes = Axes.Y;

    this.addLayout(this.#drawSizeBacking);

    this.updateGraphics();
  }

  @resolved(Timeline)
  timeline!: Timeline;

  #graphics = new PIXIGraphics();

  #drawSizeBacking = new LayoutMember(Invalidation.DrawSize);

  updateGraphics() {
    const points: PointData[] = [];

    for (let i = 0; i < this.amplitudes.length; i++) {
      points.push({
        x: i,
        y: 0.5 - this.amplitudes[i] * 0.5,
      });
    }

    for (let i = points.length - 1; i >= 0; i--) {
      points.push({
        x: i,
        y: 0.5 + this.amplitudes[i] * 0.5,
      });
    }

    this.#graphics
      .clear()
      .poly(points, true)
      .fill({ color: 0xFFFFFF });
  }

  override createDrawNode(): PIXIContainer {
    return new PIXIContainer({
      children: [this.#graphics],
    });
  }

  override update() {
    super.update();

    this.x = this.timeline.timeToPosition(this.startTime - 31);
    this.width = this.timeline.durationToSize(this.endTime - this.startTime);

    if (!this.#drawSizeBacking.isValid) {
      this.#graphics.scale.set(
        this.drawSize.x / (this.amplitudes.length - 1),
        this.drawSize.y,
      );

      this.#drawSizeBacking.validate();
    }
  }
}
