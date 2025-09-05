import { AudioManager, Game, provideSelf, resolved } from "@osucad/framework";
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
