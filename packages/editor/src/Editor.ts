import type { Skin } from "@osucad/core";
import { ISkinSource, PlayfieldClock, Ruleset, SkinProvidingContainer } from "@osucad/core";
import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer } from "@osucad/framework";
import { asyncDependencyLoader, DependencyContainer, PlatformAction, provide, resolved, Screen } from "@osucad/framework";
import { BindableBeatDivisor } from "./BindableBeatDivisor";
import { DefaultsApplier } from "./DefaultsApplier";
import { EditorClock } from "./EditorClock";
import { EditorRuleset } from "./EditorRuleset";
import { ComposeScreen } from "./compose";
import { EditorBeatmap, EditorHistory, EditorRuntime } from "./runtime";

import { Document } from "@osucad/multiplayer-client";
import { IAudience } from "./injectionTokens";

export interface EditorOptions
{
  readonly document: Document
}

export class Editor extends Screen implements IKeyBindingHandler<PlatformAction>
{
  public constructor(options: EditorOptions)
  {
    super();

    this.document = options.document;
    this.runtime = this.document.runtime as EditorRuntime;
    this.editorClock = new EditorClock(this.editorBeatmap.controlPointInfo);
  }


  @provide(Document)
  protected readonly document: Document;

  @provide(EditorRuntime)
  protected readonly runtime: EditorRuntime;

  @provide(EditorBeatmap)
  protected get editorBeatmap()
  {
    return this.runtime.root;
  }

  @provide(IAudience)
  protected get audience(): IAudience
  {
    return this.document.audience;
  }

  @provide(Ruleset)
  protected get ruleset()
  {
    return this.runtime.ruleset;
  }

  @provide(EditorRuleset)
  protected get editorRuleset()
  {
    return this.runtime.editorRuleset;
  }

  @resolved(ISkinSource)
  accessor #skinSource!: ISkinSource

  @provide(PlayfieldClock)
  @provide(EditorClock)
  protected readonly editorClock: EditorClock;

  @provide(BindableBeatDivisor)
  protected readonly beatDivisor = new BindableBeatDivisor(4);

  @provide(EditorHistory)
  protected get history()
  {
    return this.runtime.history;
  }

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(dependencies: ReadonlyDependencyContainer)
  {
    return this.#dependencies = new DependencyContainer(dependencies);
  }

  @asyncDependencyLoader()
  async #load()
  {
    this.editorRuleset.setupEditor(this);

    for (const hitObject of this.editorBeatmap.hitObjects)
      hitObject.applyDefaults(this.editorBeatmap.difficulty, this.editorBeatmap.controlPointInfo);

    // TODO: fix whatever the fuck this is
    const skin = (this.#skinSource as any).skin as Skin;

    const skinTransformer = await this.ruleset.createSkinTransformer?.(skin);

    const beatmapProcessors = [
      new DefaultsApplier(),
      ...this.editorRuleset.createBackgroundProcessors(),
    ];

    for (const processor of beatmapProcessors)
      this.#dependencies.provide(processor);

    this.addRangeInternal([
      ...beatmapProcessors,
      this.editorClock.with({ depth: Number.MIN_VALUE }),
      new SkinProvidingContainer({
        skin: skinTransformer ?? skin,
        children: [
          new ComposeScreen(),
        ],
      }),
    ]);
  }

  public readonly isKeyBindingHandler = true;

  public canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return binding instanceof PlatformAction;
  }

  public onKeyBindingPressed?(e: KeyBindingPressEvent<PlatformAction>): boolean
  {
    switch (e.pressed)
    {
    case PlatformAction.Undo:
      this.history.undo();
      return true;
    case PlatformAction.Redo:
      this.history.undo();
      return true;
    }
    return false;
  }
}
