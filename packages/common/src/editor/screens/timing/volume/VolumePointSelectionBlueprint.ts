import type { Drawable } from 'osucad-framework';
import type { ColorSource } from 'pixi.js';
import type { VolumePoint } from '../../../../controlPoints/VolumePoint';
import type { ControlPointLifetimeEntry } from '../../../ui/timeline/ControlPointLifetimeEntry';
import type { KeyframePiece } from '../KeyframePiece';
import { Anchor, Bindable, BindableNumber, dependencyLoader, Vec2 } from 'osucad-framework';
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

  readonly p1Bindable = new Bindable(new Vec2());

  readonly p2Bindable = new Bindable(new Vec2());

  #envelope!: VolumeEnvelope;

  #p1AdjustmentPiece!: CurvatureAdjustmentPiece;
  #p2AdjustmentPiece!: CurvatureAdjustmentPiece;

  @dependencyLoader()
  [Symbol('load')]() {
    this.addAllInternal(
      this.#envelope = new VolumeEnvelope(this),
      this.#p1AdjustmentPiece = new CurvatureAdjustmentPiece(this, this.p1Bindable.getBoundCopy()),
      this.#p2AdjustmentPiece = new CurvatureAdjustmentPiece(this, this.p2Bindable.getBoundCopy(), true),
    );
  }

  #curveTypeButton!: Drawable;

  protected override onApply(entry: ControlPointLifetimeEntry<VolumePoint>) {
    super.onApply(entry);

    this.volumeBindable.bindTo(entry.start.volumeBindable);
    this.curveTypeBindable.bindTo(entry.start.curveTypeBindable);
    this.p1Bindable.bindTo(entry.start.p1Bindable);
    this.p2Bindable.bindTo(entry.start.p2Bindable);

    entry.invalidated.addListener(this.#onInvalidated, this);

    this.#onInvalidated();
  }

  protected override onFree(entry: ControlPointLifetimeEntry<VolumePoint>) {
    super.onFree(entry);

    this.volumeBindable.unbindFrom(entry.start.volumeBindable);
    this.curveTypeBindable.unbindFrom(entry.start.curveTypeBindable);
    this.p1Bindable.unbindFrom(entry.start.p1Bindable);
    this.p2Bindable.unbindFrom(entry.start.p2Bindable);

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
    this.#p1AdjustmentPiece.updatePosition();
    this.#p2AdjustmentPiece.updatePosition();
  }

  protected override createKeyframePiece(): KeyframePiece {
    return new VolumePointKeyframePiece(this, {
      anchor: Anchor.TopLeft,
      origin: Anchor.Center,
    });
  }
}
