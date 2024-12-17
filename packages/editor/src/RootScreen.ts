import { OsucadScreen } from '../../common/src/screens/OsucadScreen';
import { BeatmapSelect } from './beatmapSelect/BeatmapSelect';

export class RootScreen extends OsucadScreen {
  onResuming() {
    this.screenStack.push(new BeatmapSelect());
  }
}
