import type {
  DependencyContainer,
  DragEndEvent,
  DragEvent,
  DragStartEvent,
  HoverEvent,
  MouseDownEvent,
} from 'osucad-framework';
import type { SamplePoint } from '../../../../beatmap/timing/SamplePoint';
import type { ControlPointLifetimeEntry } from '../ControlPointLifetimeEntry';
import {
  almostEquals,
  Anchor,
  Axes,
  Box,
  clamp,
  dependencyLoader,
  MouseButton,
  resolved,
  Vec2,
} from 'osucad-framework';
import { OsucadSpriteText } from '../../../../OsucadSpriteText';
import { UpdateControlPointCommand } from '../../../commands/UpdateControlPointCommand';
import { CommandManager } from '../../../context/CommandManager';
import { ThemeColors } from '../../../ThemeColors';
import { ControlPointAdjustmentBlueprint } from '../ControlPointAdjustmentBlueprint';
import { HitSoundControlPointBlueprintContainer } from '../HitSoundControlPointBlueprintContainer';
import { HitSoundsTimeline } from '../HitSoundsTimeline';

export class VolumeAdjustmentBlueprint extends ControlPointAdjustmentBlueprint<SamplePoint> {
  #timeline!: HitSoundsTimeline;

  #blueprintContainer!: HitSoundControlPointBlueprintContainer<any, any>;

  @dependencyLoader()
  load(dependencies: DependencyContainer) {
    const theme = dependencies.resolve(ThemeColors);

    this.relativeSizeAxes = Axes.Both;

    this.addAllInternal(
      this.#fill = new Box({
        relativeSizeAxes: Axes.Both,
        height: 1,
        anchor: Anchor.BottomLeft,
        origin: Anchor.BottomLeft,
        alpha: 0.1,
        color: theme.primary,
      }),
      this.#line = new Box({
        relativeSizeAxes: Axes.X,
        relativePositionAxes: Axes.Y,
        height: 1,
        anchor: Anchor.BottomLeft,
        origin: Anchor.CenterLeft,
        alpha: 0.3,
        color: theme.primary,
      }),
      this.#text = new OsucadSpriteText({
        anchor: Anchor.CenterLeft,
        origin: Anchor.Center,
        fontSize: 11,
        color: theme.text,
      }),
      this.#endLine = new Box({
        relativeSizeAxes: Axes.Y,
        relativePositionAxes: Axes.Y,
        width: 1,
        anchor: Anchor.BottomRight,
        origin: Anchor.BottomCenter,
        alpha: 0,
        color: theme.primary,
      }),
    );
  }

  protected loadComplete() {
    super.loadComplete();

    this.#timeline = this.findClosestParentOfType(HitSoundsTimeline)!;
    this.#blueprintContainer = this.findClosestParentOfType(HitSoundControlPointBlueprintContainer as any)!;
  }

  protected override onApply(entry: ControlPointLifetimeEntry<SamplePoint>) {
    entry.start.volumeBindable.valueChanged.addListener(this.#invalidated, this);

    entry.end?.volumeBindable.valueChanged.addListener(this.#invalidated, this);

    this.#invalidated();
  }

  protected override onFree(entry: ControlPointLifetimeEntry<SamplePoint>) {
    entry.start.volumeBindable.valueChanged.removeListener(this.#invalidated, this);

    entry.end?.volumeBindable.valueChanged.removeListener(this.#invalidated, this);
  }

  #invalidated() {
    const relativeVolume = this.entry!.start.volume / 100;

    this.#line.y = -relativeVolume;
    this.#fill.height = relativeVolume;

    this.#text.text = `${this.entry!.start.volume}%`;

    if (!this.entry?.end) {
      this.#endLine.alpha = 0;
    }
    else {
      // const startY = -relativeVolume;
      // const endY = -this.entry.end.volume / 100;
      //
      // this.#endLine.y = Math.max(startY, endY);
      // this.#endLine.height = Math.abs(startY - endY);
    }
  }

  #fill!: Box;

  #line!: Box;

  #endLine!: Box;

  #text!: OsucadSpriteText;

  contains(screenSpacePosition: Vec2): boolean {
    const pos = this.#line.toLocalSpace(screenSpacePosition, this._tempVec2);

    return pos.x >= 0 && pos.x <= this.drawWidth && almostEquals(pos.y, 0, 5);
  }

  onHover(e: HoverEvent): boolean {
    this.#line.alpha = 0.8;

    return true;
  }

  onHoverLost(e: HoverEvent): boolean {
    this.#line.alpha = 0.5;

    return true;
  }

  onMouseDown(e: MouseDownEvent): boolean {
    return e.button === MouseButton.Left;
  }

  onDragStart(e: DragStartEvent): boolean {
    return e.button === MouseButton.Left;
  }

  @resolved(CommandManager)
  private commandManager!: CommandManager;

  onDrag(e: DragEvent): boolean {
    if (!this.entry || this.isDisposed)
      return false;

    const position = e.mousePosition;

    let volume = 100 * (1 - (position.y / this.childSize.y));

    if (e.shiftPressed)
      volume = Math.round(volume / 5) * 5;

    if (volume === this.entry!.start.volume)
      return true;

    this.commandManager.submit(
      new UpdateControlPointCommand(this.entry.start.group!, { sample: { volume } }),
      false,
    );

    return true;
  }

  onDragEnd(e: DragEndEvent) {
    this.commandManager.commit();
  }

  update() {
    super.update();

    this.updateSubTreeTransforms();

    if (this.drawWidth <= 50) {
      this.#text.x = this.drawWidth * 0.5;
      return;
    }

    let minX = this.toLocalSpace(this.#blueprintContainer.toScreenSpace(new Vec2(0))).x;
    let maxX = this.toLocalSpace(this.#blueprintContainer.toScreenSpace(new Vec2(this.#blueprintContainer.drawWidth, 0))).x;

    minX += 20;
    maxX += 20;

    minX = Math.max(minX, 0);
    maxX = Math.min(maxX, this.drawWidth);

    this.#text.x = clamp((minX + maxX) * 0.5, 25, this.drawWidth - 25);
  }
}
