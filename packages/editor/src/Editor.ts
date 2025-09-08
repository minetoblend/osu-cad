import { IResourcesProvider, ISamplePlaybackDisabler, ISkinSource, PlayfieldClock, Ruleset, Skin, SkinProvidingContainer } from "@osucad/core";
import type { IKeyBindingHandler, KeyBindingAction, ReadonlyDependencyContainer, ScheduledDelegate } from "@osucad/framework";
import { asyncDependencyLoader, AudioManager, Bindable, DependencyContainer, keyBindingHandler, PlatformAction, provide, provideSelf, resolved, Screen } from "@osucad/framework";
import { BindableBeatDivisor } from "./BindableBeatDivisor";
import { ComposeScreen } from "./compose";
import { DefaultsApplier } from "./DefaultsApplier";
import { EditorClock } from "./EditorClock";
import { EditorRuleset } from "./EditorRuleset";
import { EditorBeatmap, EditorHistory, EditorRuntime } from "./runtime";

import { Document } from "@osucad/multiplayer-client";
import { EditorActionContainer } from "./EditorActionContainer";
import { EditorBackground } from "./EditorBackground";
import { IAudience } from "./injectionTokens";
import { TrackLoader } from "./TrackLoader";

export interface EditorOptions
{
  readonly document: Document
}

@provideSelf(ISamplePlaybackDisabler)
export class Editor extends Screen implements IKeyBindingHandler<PlatformAction>, ISamplePlaybackDisabler
{
  public constructor(options: EditorOptions)
  {
    super();

    this.document = options.document;
    this.runtime = this.document.runtime as EditorRuntime;
  }

  public readonly samplePlaybackDisabled = new Bindable(false);

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

  protected editorClock!: EditorClock;

  @provide(BindableBeatDivisor)
  protected readonly beatDivisor = new BindableBeatDivisor(4);

  @provide(EditorHistory)
  protected get history()
  {
    return this.runtime.history;
  }

  #trackLoader!: TrackLoader;

  #dependencies!: DependencyContainer;

  protected override createChildDependencies(dependencies: ReadonlyDependencyContainer)
  {
    return this.#dependencies = new DependencyContainer(dependencies);
  }

  @asyncDependencyLoader()
  async #load()
  {
    this.addInternal(new EditorBackground());

    this.editorRuleset.setupEditor(this);

    for (const hitObject of this.editorBeatmap.hitObjects)
      hitObject.applyDefaults(this.editorBeatmap.difficulty, this.editorBeatmap.controlPointInfo);

    this.#trackLoader = new TrackLoader(this.editorBeatmap, this.dependencies.resolve(AudioManager));

    await this.#trackLoader.load();


    this.editorClock = new EditorClock(this.editorBeatmap.controlPointInfo, this.#trackLoader.track.value!);

    this.#dependencies.provide(EditorClock, this.editorClock);
    this.#dependencies.provide(PlayfieldClock, this.editorClock);

    // TODO: fix whatever the fuck this is
    const skin = (this.#skinSource as any).skin as Skin;

    const skinTransformer = await this.ruleset.createSkinTransformer?.(skin);

    const beatmapSkin = new Skin(this.editorBeatmap.fileSystem, this.dependencies.resolve(IResourcesProvider));

    const beatmapSkinTransformer = await this.ruleset.createSkinTransformer?.(skin);

    const beatmapProcessors = [
      new DefaultsApplier(),
      ...this.editorRuleset.createBackgroundProcessors(),
    ];

    for (const processor of beatmapProcessors)
      this.#dependencies.provide(processor);

    this.addRangeInternal([
      ...beatmapProcessors,
      this.editorClock.with({ depth: Number.MIN_VALUE }),
      new EditorActionContainer({
        child: new SkinProvidingContainer({
          skin: skinTransformer ?? skin,
          children: [
            new SkinProvidingContainer({
              skin: beatmapSkinTransformer ?? beatmapSkin,
              child: new ComposeScreen(),
            }),
          ],
        }),
      }),
    ]);

    this.editorClock.seekingOrStopped.bindValueChanged(() => this.#updateSampleDisabledState(), true);
  }

  protected override loadComplete(): void
  {
    super.loadComplete();

    const time = this.editorBeatmap.hitObjects.first?.startTime;
    if (time)
      this.editorClock.seek(time);
  }

  public readonly isKeyBindingHandler = true;

  public canHandleKeyBinding(binding: KeyBindingAction): boolean
  {
    return binding instanceof PlatformAction;
  }

  @keyBindingHandler(PlatformAction.Undo)
  public undo()
  {
    this.history.undo();
    return true;
  }

  @keyBindingHandler(PlatformAction.Redo)
  public redo()
  {
    this.history.redo();
    return true;
  }

  #playbackDisabledDebounce?: ScheduledDelegate;

  #updateSampleDisabledState()
  {
    const shouldDisableSamples = this.editorClock.seekingOrStopped.value;

    this.#playbackDisabledDebounce?.cancel();

    if (shouldDisableSamples)
    {
      this.samplePlaybackDisabled.value = true;
    }
    else
    {
      // Debounce re-enabling arbitrarily high enough to avoid flip-flopping during beatmap updates
      // or rapid user seeks.
      this.#playbackDisabledDebounce = this.scheduler.addDelayed(() => this.samplePlaybackDisabled.value = false, 50);
    }
  }
}
