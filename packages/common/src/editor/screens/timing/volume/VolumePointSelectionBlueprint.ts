import type { Drawable } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { VolumePoint } from '../../../../controlPoints/VolumePoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import type { KeyframePiece } from '../KeyframePiece';
import { Anchor, Bindable, BindableNumber, dependencyLoader } from 'osucad-framework';
import { VolumeCurveType } from '../../../../controlPoints/VolumePoint';
import { KeyframeSelectionBlueprint } from '../KeyframeSelectionBlueprint';
import { CurvatureAdjustmentPiece } from './CurvatureAdjustmentPiece';
import { VolumeEnvelope } from './VolumeEnvelope';
import { VolumePointKeyframePiece } from './VolumePointKeyframePiece';

export class VolumePointSelectionBlueprint extends KeyframeSelectionBlueprint<VolumePoint> {
  constructor() {
    super();
  }

  override keyframeColor = new Bindable<ColorSource>(0x4763ED);

  readonly volumeBindable = new BindableNumber(100)
    .withMinValue(5)
    .withMaxValue(100);

  readonly endVolumeBindable = new BindableNumber(100)
    .withMinValue(5)
    .withMaxValue(100);

  readonly curveTypeBindable = new Bindable(VolumeCurveType.Constant);

  readonly curvatureBindable = new BindableNumber(0)
    .withMinValue(-1)
    .withMaxValue(1);

  #envelope!: VolumeEnvelope;

  #curvatureAdjustmentPiece!: CurvatureAdjustmentPiece;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.#envelope = new VolumeEnvelope(this),
      this.#curvatureAdjustmentPiece = new CurvatureAdjustmentPiece(this),
    );
  }

  #curveTypeButton!: Drawable;

  protected override onApply(entry: ControlPointLifetimeEntry<VolumePoint>) {
    super.onApply(entry);

    this.volumeBindable.bindTo(entry.start.volumeBindable);
    this.curveTypeBindable.bindTo(entry.start.curveTypeBindable);
    this.curvatureBindable.bindTo(entry.start.curvatureBindable);

    entry.invalidated.addListener(this.#onInvalidated, this);

    this.#onInvalidated();
  }

  protected override onFree(entry: ControlPointLifetimeEntry<VolumePoint>) {
    super.onFree(entry);

    this.volumeBindable.unbindFrom(entry.start.volumeBindable);
    this.curveTypeBindable.unbindFrom(entry.start.curveTypeBindable);
    this.curvatureBindable.unbindFrom(entry.start.curvatureBindable);

    entry.invalidated.removeListener(this.#onInvalidated, this);
  }

  #nextControlPoint: VolumePoint | null = null;

  #onInvalidated() {
    if (this.entry!.end !== this.#nextControlPoint) {
      if (this.#nextControlPoint)
        this.endVolumeBindable.unbindFrom(this.#nextControlPoint.volumeBindable);

      if (this.entry!.end)
        this.endVolumeBindable.bindTo(this.entry!.end.volumeBindable);
    }

    if (!this.entry?.end)
      this.endVolumeBindable.value = this.volumeBindable.value;

    this.#nextControlPoint = this.entry!.end ?? null;
    this.#envelope.invalidateGraphics();
    this.#curvatureAdjustmentPiece.updatePosition();
  }

  protected override createKeyframePiece(): KeyframePiece {
    return new VolumePointKeyframePiece(this, {
      anchor: Anchor.TopLeft,
      origin: Anchor.Center,
    });
  }
}
