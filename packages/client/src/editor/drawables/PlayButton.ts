import {Button} from "./Button.ts";
import {Assets, Container, ObservablePoint, Point, Sprite} from "pixi.js";
import {Inject} from "./di";
import {EditorClock} from "../clock.ts";
import {PopoverContainer} from "./menu/PopoverContainer.ts";
import {Menu} from "./menu/Menu.ts";
import {IVec2} from "@osucad/common";

export class PlayButton extends Button {

  private playTexture = Assets.get("play");
  private pauseTexture = Assets.get("pause");

  private readonly content = new Container();
  private readonly sprite = new Sprite({
    texture: this.playTexture,
    anchor: new Point(0.5, 0.5),
  });

  constructor() {
    super();
    this.addChild(this.content);
    this.content.addChild(this.sprite);
    this.onpointerdown = (evt) => {
      if (evt.button === 2) {
        this.showContextMenu(evt.global);
        evt.stopImmediatePropagation();
        return;
      }
      if (this.clock.isPlaying)
        this.clock.pause();
      else
        this.clock.play();
    };
    this.onpointerenter = () => this.content.scale.set(1.1);
    this.onpointerleave = () => this.content.scale.set(1);

  }

  @Inject(EditorClock)
  private readonly clock!: EditorClock;

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.content.position.set(this.size.x / 2, this.size.y / 2);
    this.sprite.scale.set(
      Math.min(
        this.size.x / this.sprite.texture.width,
        this.size.y / this.sprite.texture.height,
      ) * 0.6,
    );
  }

  onTick() {
    if (this.clock.isPlaying)
      this.sprite.texture = this.pauseTexture;
    else
      this.sprite.texture = this.playTexture;
  }

  @Inject(PopoverContainer)
  popoverContainer!: PopoverContainer;

  private showContextMenu(position: IVec2) {

    const playbackSpeeds = [0.25, 0.5, 0.75, 1, 1.5];

    this.popoverContainer.show(position, new Menu({
      items: [
        ...playbackSpeeds.map(speed => {
          return {
            text: speed + "x Playback",
            tint: this.clock.playbackRate === speed ? 0x63E2B7 : 0xFFFFFF,
            action: () => this.clock.playbackRate = speed,
          };
        }),

      ],
    }));
  }

}