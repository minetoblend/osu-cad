import { ControlPointInfo } from "@osucad/core";
import { IBeatSyncProvider } from "@osucad/editor";
import { dependencyLoader, provide } from "@osucad/framework";
import { TestScene } from "@osucad/visual-tests";
import { TimingInfoDisplay } from "../../bottomBar/TimingInfoDisplay";
import { EditorClock } from "../../EditorClock";

export default class CurrentTimeDisplayTestScene extends TestScene
{
  readonly #controlPoints = new ControlPointInfo();

  @provide(IBeatSyncProvider)
  readonly #editorClock = new EditorClock(this.#controlPoints);

  #timeDisplay!: TimingInfoDisplay;

  @dependencyLoader()
  #load()
  {
    this.add(this.#editorClock);
    this.add(new TimingInfoDisplay());
  }
}
