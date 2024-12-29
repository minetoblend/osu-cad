import type { Bindable, ClickEvent, Drawable, ReadonlyDependencyContainer } from 'osucad-framework';
import type { HitObject } from '../../../hitObjects/HitObject';
import { almostEquals, BindableBoolean, isMobile } from 'osucad-framework';
import { DrawableComposeTool } from './DrawableComposeTool';
import { EditorTextButton } from './EditorTextButton';
import { HitObjectComposerDependencies } from './HitObjectComposerDependencies';
import { SimpleEditorTextButton } from './SimpleEditorTextButton';

export abstract class DrawableHitObjectPlacementTool<T extends HitObject> extends DrawableComposeTool {
  protected abstract createHitObject(): T;

  readonly autoAdvance = new BindableBoolean();

  hitObject!: T;

  protected finishPlacingButton?: SimpleEditorTextButton;

  override createMobileControls(): Drawable[] {
    return [
      new AutoAdvanceButton(this.autoAdvance),
      this.finishPlacingButton = new SimpleEditorTextButton('Finish placing', () => this.endPlacement())
        .adjust(it => it.disabled.value = true),
    ];
  }

  protected get removeHitObjectsAtCurrentTime() {
    return true;
  }

  protected get showPreviewObject() {
    return !isMobile.any;
  }

  protected createPreviewObject() {
    this.hitObject = this.createHitObject();

    this.hitObject.transient = true;

    this.updateStartTime();

    if (this.showPreviewObject) {
      this.hitObjects.addUntracked(this.hitObject);

      this.updatePlayfield();
    }
  }

  protected updatePlayfield() {
    // the HitObject will flash unless we update the entire playfield tree at least twice
    // I have no clue why and I'd rather use this workaround than try to debug that hot mess
    for (let i = 0; i < 2; i++)
      this.playfield.updateSubTree();
  }

  protected updateStartTime() {
    if (!this.isPlacing)
      this.hitObject.startTime = this.editorClock.currentTime;
  }

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    const { autoAdvance } = dependencies.resolve(HitObjectComposerDependencies);
    this.autoAdvance.bindTo(autoAdvance);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selection.clear();

    this.hitObject = this.createHitObject();
    this.hitObject.transient = true;

    this.createPreviewObject();

    this.editorClock.currentTimeBindable.valueChanged.addListener(this.updateStartTime, this);
  }

  protected isPlacing = false;

  protected beginPlacement() {
    this.selection.clear();

    this.isPlacing = true;

    this.hitObjects.removeUntracked(this.hitObject);

    this.hitObject.transient = false;

    if (this.removeHitObjectsAtCurrentTime) {
      const hitObjectsAtTime = this.hitObjects.items
        .filter(it => almostEquals(it.startTime, this.hitObject.startTime));

      for (const h of hitObjectsAtTime)
        this.hitObjects.remove(h);
    }

    this.hitObject.startTime = this.editorClock.snap(this.editorClock.currentTime);

    this.hitObjects.add(this.hitObject);

    this.updatePlayfield();

    if (this.finishPlacingButton)
      this.finishPlacingButton.disabled.value = false;
  }

  protected endPlacement() {
    this.isPlacing = false;

    if (this.autoAdvance.value) {
      const endTime = this.hitObject.endTime;
      this.editorClock.seek(endTime);
      this.editorClock.seekForward(true);
    }

    this.commit();

    this.createPreviewObject();

    if (this.finishPlacingButton)
      this.finishPlacingButton.disabled.value = true;
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    if (!this.isPlacing)
      this.hitObjects.removeUntracked(this.hitObject);
    else
      this.commit();

    this.editorClock.currentTimeBindable.valueChanged.removeListener(this.updateStartTime, this);
  }
}

class AutoAdvanceButton extends EditorTextButton {
  constructor(bindable: Bindable<boolean>) {
    super('Auto-Advance');

    this.active.bindTo(bindable);
  }

  override onClick(e: ClickEvent): boolean {
    this.active.toggle();
    return true;
  }
}
