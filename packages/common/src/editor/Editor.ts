import type { DependencyContainer, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, MenuItem, ReadonlyDependencyContainer, ScreenExitEvent, ScreenTransitionEvent } from 'osucad-framework';
import type { BackgroundScreen } from '../screens/BackgroundScreen';
import { UpdateHandler } from '@osucad/multiplayer';
import { EasingFunction, PlatformAction, provide } from 'osucad-framework';
import { IBeatmap } from '../beatmap/IBeatmap';
import { ControlPointInfo } from '../controlPoints/ControlPointInfo';
import { PlayfieldClock } from '../gameplay/PlayfieldClock';
import { IResourcesProvider } from '../io/IResourcesProvider';
import { EditorRuleset } from '../rulesets/EditorRuleset';
import { Ruleset } from '../rulesets/Ruleset';
import { OsucadScreen } from '../screens/OsucadScreen';
import { BeatmapSkin } from '../skinning/BeatmapSkin';
import { RulesetSkinProvidingContainer } from '../skinning/RulesetSkinProvidingContainer';
import { EditorBackground } from './EditorBackground';
import { EditorBeatmap } from './EditorBeatmap';
import { EditorClock } from './EditorClock';
import { EditorLayout } from './EditorLayout';
import { EditorNavigation } from './EditorNavigation';
import { ComposeScreen } from './screens/compose/ComposeScreen';
import { EditorScreenManager } from './screens/EditorScreenManager';
import { ModdingScreen } from './screens/modding/ModdingScreen';
import { SetupScreen } from './screens/setup/SetupScreen';
import { TimingScreen } from './screens/timing/TimingScreen';

@provide(Editor)
export class Editor extends OsucadScreen implements IKeyBindingHandler<PlatformAction> {
  constructor(readonly editorBeatmap: EditorBeatmap) {
    super();

    this.beatmap = editorBeatmap.beatmap;
  }

  readonly beatmap: IBeatmap;

  #screenManager = new EditorScreenManager();

  protected override get hasAsyncLoader(): boolean {
    return true;
  }

  protected override async loadAsync(dependencies: ReadonlyDependencyContainer): Promise<void> {
    await super.loadAsync(dependencies);

    await this.loadComponentAsync(this.editorBeatmap);

    if (!this.editorBeatmap.beatmapInfo.ruleset) {
      // TODO: display message
      this.exit();
      return;
    }

    this.addInternal(this.editorBeatmap);

    const ruleset = this.editorBeatmap.beatmapInfo.ruleset.createInstance();

    this.#dependencies.provide(Ruleset, ruleset);
    this.#dependencies.provide(EditorRuleset, ruleset.createEditorRuleset());

    this.#dependencies.provide(EditorBeatmap, this.editorBeatmap);
    this.#dependencies.provide(IBeatmap, this.beatmap);
    this.#dependencies.provide(ControlPointInfo, this.editorBeatmap.controlPoints);
    this.#dependencies.provide(UpdateHandler, this.editorBeatmap.updateHandler);

    this.addInternal(this.#editorClock = new EditorClock(this.editorBeatmap.track.value));
    this.#dependencies.provide(EditorClock, this.#editorClock);
    this.#dependencies.provide(PlayfieldClock, this.#editorClock);

    this.registerScreens(this.#screenManager);
    this.#dependencies.provide(EditorScreenManager, this.#screenManager);

    const resources = dependencies.resolve(IResourcesProvider);

    for (const h of this.beatmap.hitObjects)
      h.applyDefaults(this.beatmap.controlPoints, this.beatmap.difficulty);

    ruleset.postProcessBeatmap(this.beatmap);

    const beatmapSkin = new BeatmapSkin(resources, this.editorBeatmap.beatmap, this.editorBeatmap.fileStore);

    await beatmapSkin.load();

    this.addAllInternal(
      new EditorNavigation(),
      new RulesetSkinProvidingContainer(
        ruleset,
        this.beatmap,
        beatmapSkin,
      ).with({
        child: this.#layout = new EditorLayout(),
      }),
    );

    for (const processor of ruleset.createEditorBeatmapProcessors())
      this.addInternal(processor);

    if (this.beatmap.hitObjects.length > 0)
      this.#editorClock.seek(this.beatmap.hitObjects.first!.startTime, false);
  }

  protected registerScreens(screenManager: EditorScreenManager) {
    screenManager.register(SetupScreen);
    screenManager.register(ComposeScreen);
    screenManager.register(TimingScreen);
    screenManager.register(ModdingScreen);

    screenManager.setCurrentScreen(ComposeScreen);
  }

  #dependencies!: DependencyContainer;

  #editorClock!: EditorClock;

  protected override createChildDependencies(parentDependencies: ReadonlyDependencyContainer): DependencyContainer {
    return this.#dependencies = super.createChildDependencies(parentDependencies);
  }

  override onEntering(e: ScreenTransitionEvent) {
    super.onEntering(e);

    this.fadeInFromZero(300);

    this.#layout.show();
  }

  override onExiting(e: ScreenExitEvent): boolean {
    this.#layout.hide();
    this.fadeOut(200, EasingFunction.OutQuad).expire();

    return super.onExiting(e);
  }

  readonly isKeyBindingHandler = true;

  #layout!: EditorLayout;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof PlatformAction;
  }

  onKeyBindingPressed?(e: KeyBindingPressEvent<PlatformAction>): boolean {
    switch (e.pressed) {
      case PlatformAction.Undo:
        this.undo();
        break;
      case PlatformAction.Redo:
        this.redo();
        break;
      default:
        return false;
    }

    return true;
  }

  override update() {
    super.update();

    this.editorBeatmap.applyDefaultsWhereNeeded(this.#editorClock.currentTime - 2000, this.#editorClock.currentTime + 2000);
  }

  undo() {
    this.editorBeatmap.updateHandler.undo();
  }

  redo() {
    this.editorBeatmap.updateHandler.redo();
  }

  createMenuItems(): MenuItem[] {
    return [];
  }

  override createBackground(): BackgroundScreen | null {
    return new EditorBackground(this.editorBeatmap);
  }
}
