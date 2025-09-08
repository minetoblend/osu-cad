import type { Document, DocumentStorageService } from "@osucad/multiplayer-client";
import { Anchor, dependencyLoader, Screen, type ScreenTransitionEvent } from "@osucad/framework";
import { LoadingSpinner } from "./LoadingSpinner";

const editorRuntimeFactory = async (storage: DocumentStorageService) =>
{
  const { EditorRuntime } = await import("@osucad/editor");

  return new EditorRuntime(storage);
};

export class EditorLoader extends Screen
{
  #document!: Document;

  #loadingSpinner!: LoadingSpinner;

  @dependencyLoader()
  #load()
  {
    this.addInternal(this.#loadingSpinner = new LoadingSpinner({
      size: 80,
      anchor: Anchor.Center,
      origin: Anchor.Center,
    }));

    this.#loadingSpinner.fadeInFromZero(150);
  }

  protected override loadComplete()
  {
    super.loadComplete();

    void this.loadEditor().catch((e) =>
    {
      while(this.screenStack)
      {
        this.screenStack.exit(this.screenStack.currentScreen!);
      }

      console.error(e);

      // TODO: display error notification
    });
  }

  protected async loadEditor()
  {
    const { MultiplayerClient } = await import("@osucad/multiplayer-client");

    const client = new MultiplayerClient({
      endpoint: "http://localhost:3000",
    });

    this.#document = await client.load("beatmap", { runtimeFactory: editorRuntimeFactory });

    await new Promise<void>(resolve => setTimeout(resolve, 1000));

    await this.pushEditor();
  }

  protected async pushEditor()
  {
    const { Editor } = await import("@osucad/editor");

    this.screenStack?.push(new Editor({ document: this.#document }));
  }

  public override onSuspending(e: ScreenTransitionEvent)
  {
    super.onSuspending(e);

    this.#loadingSpinner.fadeOut(150);
    this.delay(150).fadeOut();
  }
}
