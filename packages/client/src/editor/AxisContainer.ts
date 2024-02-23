import { Drawable } from './drawables/Drawable.ts';
import { Vec2 } from '@osucad/common';
import { Point, Rectangle, Sprite, Texture } from 'pixi.js';
import { Inject } from './drawables/di';
import { PopoverContainer } from './drawables/menu/PopoverContainer.ts';
import { MenuItemOptions } from './drawables/menu/MenuItem.ts';
import { Menu } from './drawables/menu/Menu.ts';
import { mirrorAlongAxis } from './interaction/mirrorAlongAxis.ts';
import { EditorContext } from '@/editor/editorContext.ts';

export class AxisContainer extends Drawable {}

export class AxisDrawable extends Drawable {
  @Inject(EditorContext)
  editor!: EditorContext;

  @Inject(PopoverContainer)
  popoverContainer!: PopoverContainer;

  private lineSprite = new Sprite({
    texture: Texture.WHITE,
    scale: new Point(2000, 1),
    anchor: new Point(0.5, 0.5),
  });

  constructor(
    public position0: Vec2,
    public position1: Vec2,
  ) {
    super();

    this.onAxisUpdate();

    this.eventMode = 'static';
    this.hitArea = new Rectangle(-10000, -3, 20000, 6);

    this.onpointerenter = () => {
      this.lineSprite.scale.y = 2;
    };
    this.onpointerleave = () => {
      this.lineSprite.scale.y = 1;
    };
    this.onpointerdown = (evt) => {
      if (evt.button === 2) {
        evt.stopImmediatePropagation();
        const items: MenuItemOptions[] = [
          {
            text: 'Delete',
            tint: 0xea2463,
            action: () => {
              this.destroy();
            },
          },
        ];

        if (this.editor.selection.size > 0) {
          items.push({
            text: 'Mirror along axis',
            action: () => {
              mirrorAlongAxis(
                [...this.editor.selection.selectedObjects],
                this.position0,
                this.position1,
                this.editor,
              );
            },
          });
        }

        this.popoverContainer.show(evt.global, new Menu({ items }));
      } else if (evt.button === 0) {
        let lastPos = Vec2.from(evt.getLocalPosition(this.parent));
        this.onglobalpointermove = (evt) => {
          evt.stopImmediatePropagation();
          const pos = Vec2.from(evt.getLocalPosition(this.parent));
          const delta = pos.sub(lastPos);
          lastPos = pos;

          this.position0 = this.position0.add(delta);
          this.position1 = this.position1.add(delta);
          this.onAxisUpdate();
        };
        addEventListener(
          'pointerup',
          () => {
            this.onglobalpointermove = null;
          },
          { once: true },
        );
      }
    };
  }

  onAxisUpdate() {
    const position0 = this.position0;
    const position1 = this.position1;
    this.position = position0.add(position1).scale(0.5);
    this.rotation = Math.atan2(
      position1.y - position0.y,
      position1.x - position0.x,
    );
    this.addChild(this.lineSprite);
  }
}
