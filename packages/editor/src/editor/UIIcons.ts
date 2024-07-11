import { Assets, Texture } from 'pixi.js';

import circle from '../assets/icons/circle.png';
import cog from '../assets/icons/cog.png';
import minus from '../assets/icons/minus.png';
import pen from '../assets/icons/pen.png';
import plus from '../assets/icons/plus.png';
import redo from '../assets/icons/redo.png';
import reverse from '../assets/icons/reverse.png';
import select from '../assets/icons/select.png';
import sizeEw from '../assets/icons/size-ew.png';
import sizeNs from '../assets/icons/size-ns.png';
import slider from '../assets/icons/slider.png';
import spinner from '../assets/icons/spinner.png';
import undo from '../assets/icons/undo.png';
import newCombo from '../assets/icons/new-combo.png';

export class UIIcons {
  async load() {
    Assets.addBundle('icons', [
      { src: circle, alias: 'icon-circle' },
      { src: cog, alias: 'icon-cog' },
      { src: minus, alias: 'icon-minus' },
      { src: pen, alias: 'icon-pen' },
      { src: plus, alias: 'icon-plus' },
      { src: redo, alias: 'icon-redo' },
      { src: reverse, alias: 'icon-reverse' },
      { src: select, alias: 'icon-select' },
      { src: sizeEw, alias: 'icon-size-ew' },
      { src: sizeNs, alias: 'icon-size-ns' },
      { src: slider, alias: 'icon-slider' },
      { src: spinner, alias: 'icon-spinner' },
      { src: undo, alias: 'icon-undo' },
      { src: newCombo, alias: 'icon-new-combo' },
    ]);
    await Assets.loadBundle('icons');

    this.circle = Assets.get('icon-circle');
    this.cog = Assets.get('icon-cog');
    this.minus = Assets.get('icon-minus');
    this.pen = Assets.get('icon-pen');
    this.plus = Assets.get('icon-plus');
    this.redo = Assets.get('icon-redo');
    this.reverse = Assets.get('icon-reverse');
    this.select = Assets.get('icon-select');
    this.sizeEw = Assets.get('icon-size-ew');
    this.sizeNs = Assets.get('icon-size-ns');
    this.slider = Assets.get('icon-slider');
    this.spinner = Assets.get('icon-spinner');
    this.undo = Assets.get('icon-undo');
    this.newCombo = Assets.get('icon-new-combo');
  }

  circle!: Texture;
  cog!: Texture;
  minus!: Texture;
  pen!: Texture;
  plus!: Texture;
  redo!: Texture;
  reverse!: Texture;
  select!: Texture;
  sizeEw!: Texture;
  sizeNs!: Texture;
  slider!: Texture;
  spinner!: Texture;
  undo!: Texture;
  newCombo!: Texture;
}
