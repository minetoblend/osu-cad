import { Game, dependencyLoader } from "osucad-framework";
import { Editor } from "./editor/Editor";

export class OsucadGame extends Game {
  constructor() {
    super();
  }

  @dependencyLoader()
  init(): void {
    this.add(new Editor());
  }
}