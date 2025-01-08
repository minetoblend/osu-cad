import { Anchor, AudioBufferTrack, Axes, Box, dependencyLoader, ProxyContainer, resolved } from 'osucad-framework';
import { EditorBeatmap } from '../../../EditorBeatmap';
import { DrawableWaveform } from '../DrawableWaveform';
import { TimingScreenTimelineLayer } from '../TimingScreenTimelineLayer';
import { TimingPointBlueprintContainer } from './TimingPointBlueprintContainer';
import { TimingPointPlacementBlueprint } from './TimingPointPlacementBlueprint';

export class TimingPointLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('Timing');
  }

  override get layerColor() {
    return 0xFF265A;
  }

  @resolved(EditorBeatmap)
  editorBeatmap!: EditorBeatmap;

  @dependencyLoader()
  [Symbol('load')]() {
    this.height = 100;

    this.add(new Box({
      relativeSizeAxes: Axes.Both,
      alpha: 0.02,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
    }));
    this.add(new TimingPointPlacementBlueprint());
    this.add(new TimingPointBlueprintContainer());
  }

  protected override loadComplete() {
    super.loadComplete();

    const track = this.editorBeatmap.track.value;

    if (track instanceof AudioBufferTrack) {
      this.timeline.add(new ProxyContainer(this.content).with({
        depth: 1,
        children: [
          new DrawableWaveform(track, {
            relativeSizeAxes: Axes.Both,
          }),
        ],
      }));
    }
  }
}
