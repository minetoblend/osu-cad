import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { AudioManager, Game, provide, provideSelf } from "@osucad/framework";
import { IResourcesProvider } from "./io/IResourcesProvider";

@provideSelf(IResourcesProvider)
export class OsucadGameBase extends Game implements IResourcesProvider
{
  public constructor()
  {
    super();
  }

  @provide(AudioManager)
  public readonly audioManager!: AudioManager;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);
  }
}
