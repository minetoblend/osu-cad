import type { DragEvent, DragStartEvent, MenuItem, MouseDownEvent, ReadonlyDependencyContainer } from '@osucad/framework';
import type { ModPostObject } from './ModPostObject';
import { Bindable, BindableBoolean, CompositeDrawable, MouseButton, resolved, Vec2 } from '@osucad/framework';
import { ContextMenuContainer } from '../../../../userInterface/ContextMenuContainer';
import { OsucadMenuItem } from '../../../../userInterface/OsucadMenuItem';
import { ModPost } from './ModPost';

export abstract class ModPostBlueprint<T extends ModPostObject = any> extends CompositeDrawable {
  protected constructor(readonly object: T) {
    super();
  }

  @resolved(ModPost)
  protected modPost!: ModPost;

  readonly positionBindable = new Bindable(new Vec2());

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);
    this.positionBindable.bindTo(this.object.positionBindable);

    this.positionBindable.addOnChangeListener(position => this.position = position.value, { immediate: true });
  }

  protected override loadComplete() {
    super.loadComplete();

    this.selected.addOnChangeListener((selected) => {
      if (selected.value)
        this.onSelected();
      else
        this.onDeselected();
    }, { immediate: true });
  }

  selected = new BindableBoolean();

  override onMouseDown(e: MouseDownEvent): boolean {
    if (e.button === MouseButton.Left) {
      this.selected.value = true;
      return true;
    }

    if (e.button === MouseButton.Right) {
      this.selected.value = true;
      this.findClosestParentOfType(ContextMenuContainer)
        ?.showMenu([
          ...this.createContextMenuItems(),
          new OsucadMenuItem({
            text: 'Delete',
            type: 'destructive',
            action: () => this.modPost.remove(this.object),
          }),
        ], e);

      return true;
    }

    return false;
  }

  override onDragStart(e: DragStartEvent): boolean {
    return true;
  }

  override onDrag(e: DragEvent): boolean {
    this.object.position = this.object.position.add(e.parentSpaceDelta(this));

    return true;
  }

  protected onSelected() {

  }

  protected onDeselected() {

  }

  protected createContextMenuItems(): MenuItem[] {
    return [];
  }
}
