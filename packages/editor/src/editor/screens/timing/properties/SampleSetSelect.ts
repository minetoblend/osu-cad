import type { DrawableOptions } from 'osucad-framework';
import { SampleSet } from '@osucad/common';
import { ButtonGroupSelect } from '../../../../userInterface/ButtonGroupSelect';

export class SampleSetSelect extends ButtonGroupSelect<SampleSet> {
  constructor(options: DrawableOptions) {
    super({
      ...options,
      items: [
        {
          label: 'Auto',
          value: SampleSet.Auto,
        },
        {
          label: 'Normal',
          value: SampleSet.Normal,
        },
        {
          label: 'Soft',
          value: SampleSet.Soft,
        },
        {
          label: 'Drum',
          value: SampleSet.Drum,
        },
      ],
    });
  }
}
