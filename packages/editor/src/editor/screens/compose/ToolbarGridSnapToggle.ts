import type { IKeyBindingHandler, KeyBindingPressEvent, KeyBindingReleaseEvent, KeyDownEvent } from 'osucad-framework';
import { Anchor, Axes, BindableNumber, ButtonTrigger, Container, dependencyLoader, Key, resolved } from 'osucad-framework';
import { Beatmap } from '../../../beatmap/Beatmap';
import { OsucadIcons } from '../../../OsucadIcons';
import { OsucadSpriteText } from '../../../OsucadSpriteText';
import { EditorAction } from '../../EditorAction';
import { ThemeColors } from '../../ThemeColors';
import { ComposeToggleButton } from './ComposeToggleButton';
import { ComposeToolbarButton } from './ComposeToolbarButton';
import { HitObjectComposer } from './HitObjectComposer';

export class ToolbarGridSnapToggle extends ComposeToggleButton implements IKeyBindingHandler<EditorAction> {
  constructor() {
    super(OsucadIcons.get('grid@2x'));
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  gridSize = new BindableNumber(4);

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addSubmenu([
      new GridSizeButton(0),
      new GridSizeButton(4),
      new GridSizeButton(8),
      new GridSizeButton(16),
      new GridSizeButton(32),
      new GridSizeButton(64),
    ]);
  }

  #actualValue = false;

  onKeyDown(e: KeyDownEvent): boolean {
    if (e.key === Key.ShiftLeft) {
      this.#actualValue = this.active.value;
      this.active.value = !this.active.value;
    }

    return false;
  }

  onKeyUp(e: KeyDownEvent) {
    if (e.key === Key.ShiftLeft)
      this.active.value = this.#actualValue;
  }

  protected loadComplete() {
    super.loadComplete();

    this.active.bindTo(this.findClosestParentOfType(HitObjectComposer)!.gridSnapEnabled);
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: EditorAction): boolean {
    return binding instanceof EditorAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<EditorAction>): boolean {
    if (e.pressed === EditorAction.ToggleGridSnap) {
      this.armed = true;
      this.triggerAction();
      return true;
    }

    if (e.pressed === EditorAction.ToggleGridSize) {
      this.armed = true;

      const gridSize = this.beatmap.settings.editor.gridSizeBindable.value;
      const availableGridSizes = [4, 8, 16, 32, 64];

      const index = (availableGridSizes.indexOf(gridSize) + 1) % availableGridSizes.length;

      this.beatmap.settings.editor.gridSizeBindable.value = availableGridSizes[index];

      return true;
    }

    return false;
  }

  onKeyBindingReleased(e: KeyBindingReleaseEvent<EditorAction>) {
    if (e.pressed === EditorAction.ToggleGridSnap || e.pressed === EditorAction.ToggleGridSize)
      this.armed = false;
  }
}

class GridSizeButton extends ComposeToolbarButton {
  constructor(
    readonly gridSize: number,
  ) {
    super(OsucadIcons.get(gridSize === 0 ? 'grid_empty@2x' : 'grid@2x'));
  }

  @resolved(Beatmap)
  beatmap!: Beatmap;

  @resolved(ThemeColors)
  colors!: ThemeColors;

  gridSizeBindable = new BindableNumber(4);

  @dependencyLoader()
  load() {
    this.gridSizeBindable.bindTo(this.beatmap.settings.editor.gridSizeBindable);

    if (this.gridSize > 0) {
      this.scaleContainer.add(new Container({
        relativeSizeAxes: Axes.Both,
        padding: { horizontal: 4, vertical: 2 },
        child: new OsucadSpriteText({
          text: `${this.gridSize.toString()}px`,
          anchor: Anchor.BottomRight,
          origin: Anchor.BottomRight,
          fontSize: 8,
          color: this.colors.primary,
        }),
      }));
    }

    this.gridSizeBindable.addOnChangeListener(e => this.active.value = this.gridSize === e.value, { immediate: true });

    this.action = () => this.gridSizeBindable.value = this.gridSize;

    this.trigger = ButtonTrigger.MouseDown;
  }
}
