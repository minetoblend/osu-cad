import { Bindable } from '@osucad/framework';
import { TimingScreenTool } from './TimingScreenTool';

export class TimingScreenDependencies {
  readonly activeTool = new Bindable<TimingScreenTool>(TimingScreenTool.Select);
}
