import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { AudioManager, Game, provide, provideSelf } from "@osucad/framework";
import { IResourcesProvider } from "./io/IResourcesProvider";

@provideSelf(IResourcesProvider)
export class OsucadGameBase extends Game implements IResourcesProvider
{
  constructor()
  {
    super();
  }

  @provide(AudioManager)
  audioManager!: AudioManager;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);
  }
}
