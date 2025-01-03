import { BindableBoolean } from 'osucad-framework';

export class SnapSettings {
  readonly snapToObjectCenters = new BindableBoolean(false);
  readonly snapToCircleBorders = new BindableBoolean(false);
  readonly snapToVisualSpacing = new BindableBoolean(false);
  readonly snapToSliderPath = new BindableBoolean(false);
  readonly snapToSliderBorders = new BindableBoolean(false);
}
