import type { Skin } from "@osucad/core";
import { ISkinSource, PlayfieldClock, Ruleset, SkinProvidingContainer } from "@osucad/core";
import type { IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, KeyBindingReleaseEvent, KeyBindingScrollEvent } from "@osucad/framework";
import { PlatformAction, ScrollEvent } from "@osucad/framework";
import { asyncDependencyLoader, provide, resolved, Screen } from "@osucad/framework";
import { BindableBeatDivisor } from "./BindableBeatDivisor";
import { DefaultsApplier } from "./DefaultsApplier";
import { EditorClock } from "./EditorClock";
import { EditorRuleset } from "./EditorRuleset";
import { ComposeScreen } from "./compose";
import { EditorBeatmap, EditorHistory, EditorRuntime } from "./runtime";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { Document } from "@osucad/multiplayer-client";
import { IAudience } from "./injectionTokens";

export interface EditorOptions
{
  readonly document: Document
}

export class Editor extends Screen implements IKeyBindingHandler<PlatformAction>
{
  constructor(options: EditorOptions)
  {
    super();

    this.document = options.document;
    this.runtime = this.document.runtime as EditorRuntime;
    this.editorClock = new EditorClock(this.editorBeatmap.controlPointInfo);
  }


  @provide(Document)
  readonly document: Document;

  @provide(EditorRuntime)
  readonly runtime: EditorRuntime;

  @provide(EditorBeatmap)
  get editorBeatmap()
  {
    return this.runtime.root;
  }

  @provide(IAudience)
  get audience(): IAudience
  {
    return this.document.audience;
  }

  @provide(Ruleset)
  get ruleset()
  {
    return this.runtime.ruleset;
  }

  @provide(EditorRuleset)
  get editorRuleset()
  {
    return this.runtime.editorRuleset;
  }

  @resolved(ISkinSource)
  accessor #skinSource!: ISkinSource

  @provide(PlayfieldClock)
  @provide(EditorClock)
  readonly editorClock: EditorClock;

  @provide(BindableBeatDivisor)
  readonly beatDivisor = new BindableBeatDivisor(4);

  @provide(EditorHistory)
  get history()
  {
    return this.runtime.history;
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

    this.addRangeInternal([
      new DefaultsApplier(),
      ...this.editorRuleset.createBackgroundProcessors(),
      this.editorClock.with({ depth: Number.MIN_VALUE }),
      new SkinProvidingContainer({
        skin: skinTransformer ?? skin,
        children: [
          new ComposeScreen(),
        ],
      }),
    ]);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed?(e: KeyBindingPressEvent<PlatformAction>): boolean
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
