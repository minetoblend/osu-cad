import { dependencyLoader, Game } from 'osucad-framework';

export class OsucadGameBase extends Game {
  @dependencyLoader()
  async load() {
  }
}
