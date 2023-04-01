import {DrawableHitCircle} from './drawableHitCircle';
import {Container} from 'pixi.js';


export class PlayfieldObjectContainer extends Container {

  readonly hitObjectContainer = new Container<DrawableHitCircle>();
  readonly followPointContainer = new Container();


}
