import { Anchor } from '@/framework/drawable/Anchor';
import { Axes } from '@/framework/drawable/Axes';
import { CompositeDrawable } from '@/framework/drawable/CompositeDrawable';
import {
  ContainerDrawable,
  ContainerDrawableOptions,
} from '@/framework/drawable/ContainerDrawable';
import { MarginPadding } from '@/framework/drawable/MarginPadding';
import { RoundedBox } from '@/framework/drawable/RoundedBox';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { Graphics } from 'pixi.js';
import { MenuContainer } from './MenuContainer';
import { MenuItem } from './MenuItem';
import { Menu } from './Menu';

export class DropdownSelect extends ContainerDrawable {
  constructor(options: ContainerDrawableOptions = {}) {
    super(options);

    this.background = this.addInternal(
      new RoundedBox({
        relativeSizeAxes: Axes.Both,
        fillAlpha: 0,
        cornerRadius: 4,
        outlines: [
          {
            color: 0xffffff,
            alpha: 0.1,
          },
        ],
      }),
    );

    this.addInternal(
      new ContainerDrawable({
        width: 27,
        relativeSizeAxes: Axes.Y,
        margin: new MarginPadding({
          horizontal: 4,
          vertical: 4,
        }),
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            cornerRadius: 5,
            color: 0xec4ec0,
          }),
          new DrawableText({
            text: '5.6*',
            fontSize: 9,
            color: 0xffffff,
            anchor: Anchor.Centre,
            origin: Anchor.Centre,
          }),
        ],
      }),
    );

    this.label = this.addInternal(
      new DrawableText({
        text: 'Expert',
        fontSize: 11,
        color: 0xb6b6c3,
        anchor: Anchor.CentreLeft,
        origin: Anchor.CentreLeft,
        fontFamily: 'nunito-sans-700',
        margin: new MarginPadding({
          left: 36,
          right: 4,
        }),
      }),
    );

    const caret = this.addInternal(
      new CompositeDrawable({
        anchor: Anchor.CentreRight,
        origin: Anchor.CentreRight,
        margin: new MarginPadding({ right: 8 }),
      }),
    );

    caret.drawNode.addChild(
      new Graphics().roundPoly(0, 0, 3, 3, 1, Math.PI).fill({
        color: 0xb6b6c3,
      }),
    );
  }

  background: RoundedBox;
  label: DrawableText;

  onHover() {
    this.background.fillAlpha = 0.05;
    return true;
  }

  onHoverLost() {
    this.background.fillAlpha = 0;
    return true;
  }

  menu?: Menu;

  onMouseDown(event: MouseDownEvent) {
    if (event.left) {
      const menuContainer = this.dependencies.resolve(MenuContainer);
      console.log(menuContainer.hasMenu(this));
      if (this.menu && !this.menu.destroyed) {
        menuContainer.hideAll();
      } else {
        this.menu = menuContainer.show(this, [
          new MenuItem({
            text: 'Hard',
            shortcut: '3.6*',
            action: () => {
              this.label.text = 'Hard';
            },
          }),
          new MenuItem({
            text: 'Insane',
            shortcut: '4.4*',
            action: () => {
              this.label.text = 'Insane';
            },
          }),
          new MenuItem({
            text: 'Expert',
            shortcut: '5.6*',
            action: () => {
              this.label.text = 'Expert';
            },
          }),
        ]);
      }
    }
    return true;
  }
}
