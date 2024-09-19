import { BeatmapSelect } from './beatmapSelect/BeatmapSelect';
import { OsucadScreen } from './OsucadScreen';

export class RootScreen extends OsucadScreen {
  onResuming() {
    this.screenStack.push(new BeatmapSelect());
  }
}
