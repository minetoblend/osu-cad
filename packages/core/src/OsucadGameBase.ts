import type { ReadonlyDependencyContainer } from "@osucad/framework";
import { AudioManager, Game, resolved, provideSelf } from "@osucad/framework";
import { IResourcesProvider } from "./io/IResourcesProvider";

@provideSelf(IResourcesProvider)
export class OsucadGameBase extends Game implements IResourcesProvider
{
  public constructor()
  {
    super();
  }

  @resolved(AudioManager)
  public accessor audioManager!: AudioManager;
}
