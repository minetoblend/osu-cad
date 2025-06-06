import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { AudioManager, Game, provide, resolved } from "@osucad/framework";
import { IResourcesProvider } from "./io/IResourcesProvider";

@provide(IResourcesProvider)
export class OsucadGameBase extends Game implements IResourcesProvider
{
  constructor()
  {
    super();
  }

  @resolved(AudioManager)
  audioManager!: AudioManager;

  protected override load(dependencies: ReadonlyDependencyContainer)
  {
    super.load(dependencies);
  }
}
