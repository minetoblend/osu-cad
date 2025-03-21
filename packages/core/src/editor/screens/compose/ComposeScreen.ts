import type { Drawable, ReadonlyDependencyContainer } from '@osucad/framework';
import type { EditorSafeArea } from '../../EditorSafeArea';
import type { EditorCornerContent } from '../../ui/EditorCornerContent';
import type { HitObjectComposer } from './HitObjectComposer';
import { Axes, Box, Container, resolved } from '@osucad/framework';
import { OsucadColors } from '../../../OsucadColors';
import { Ruleset } from '../../../rulesets/Ruleset';
import { MultiplayerCursorArea } from '../../multiplayer/MultiplayerCursorArea';
import { EditorScreen } from '../EditorScreen';
import { editorScreen } from '../metadata';
import { ComposeScreenTimeline } from './ComposeScreenTimeline';
import { ComposeScreenTimelineControls } from './ComposeScreenTimelineControls';

@editorScreen({
  id: 'compose',
  name: 'Compose',
})
export class ComposeScreen extends EditorScreen {
  constructor() {
    super();
  }

  @resolved(Ruleset)
  ruleset!: Ruleset;

  protected get composer() {
    return this.#composer;
  }

  #composer!: HitObjectComposer;

  protected createHitObjectComposer(): HitObjectComposer {
    return this.ruleset.createHitObjectComposer();
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.addRange([
      this.#composer = this.createHitObjectComposer(),
    ]);

    this.#composer.overlayLayer.add(
      new MultiplayerCursorArea('compose').adjust(it => it.receivePositionalInputAt = () => true),
    );
  }

  protected override applySafeAreaPadding(safeArea: EditorSafeArea) {
    this.#composer.applySafeAreaPadding(safeArea);
  }

  override createTopBarContent(): Drawable {
    return new Container({
      relativeSizeAxes: Axes.X,
      height: ComposeScreenTimeline.HEIGHT,
      children: [
        new Box({
          relativeSizeAxes: Axes.Both,
          color: OsucadColors.translucent,
          alpha: 0.5,
        }),
        this.#composer.topBar,
      ],
    });
  }

  override createTopRightCornerContent(): EditorCornerContent {
    return new ComposeScreenTimelineControls();
  }
}
