import {Drawable} from "./Drawable.ts";
import {AlphaFilter, BitmapText, BlurFilter, Circle, Graphics, Point, Ticker} from "pixi.js";
import {Inject} from "./di";
import {VIEWPORT_SIZE} from "./injectionKeys.ts";
import {ISize} from "@osucad/common";
import {AudioManager} from "../audio/AudioManager.ts";
import {clamp} from "@vueuse/core";
import gsap from "gsap";

export class VolumeControlOverlay extends Drawable {

  private background = new Graphics()
    .circle(0, 0, 75)
    .stroke({ color: 0xFFFFFF, width: 10, alpha: 0.2 });
  private glow = new Graphics();
  private arc = new Graphics();
  private alphaFilter = new AlphaFilter({ alpha: 0 });

  private volumeText = new BitmapText({
    text: "0%",
    style: {
      fontFamily: "Nunito Sans",
      fontSize: 26,
    },
    anchor: new Point(0.5, 0.5),
    position: new Point(0, -12),
  });
  private titleText = new BitmapText({
    text: "Volume",
    style: {
      fontFamily: "Nunito Sans",
      fontSize: 22,
      fontWeight: "bold",
    },
    anchor: new Point(0.5, 0.5),
    position: new Point(0, 15),
    alpha: 0.5,
  });

  constructor() {
    super();

    this.addChild(this.background, this.arc, this.glow, this.titleText, this.volumeText);

    this.hitArea = new Circle(0, 0, 100);
    this.eventMode = "dynamic";
    this.filters = [this.alphaFilter];

    this.glow.filters = [
      new BlurFilter({ strength: 10, blendMode: "add" }),
    ];
    this.glow.tint = 0x63E2B7;
  }

  @Inject(VIEWPORT_SIZE)
  private readonly viewportSize!: ISize;

  private _hideTimeout: number | null = null;

  onLoad() {
    watch(this.viewportSize, () => this.update(), { immediate: true });
    this._animatedVolume = this.audioManager.volume;

    this.on("wheel", (evt) => {
      if (evt.altKey) {
        evt.stopImmediatePropagation();

        this.show();

        this.audioManager.volume = clamp(this.audioManager.volume - Math.sign(evt.deltaY) * 0.05, 0, 1);

        if (this._hideTimeout) clearTimeout(this._hideTimeout);
        this._hideTimeout = setTimeout(() => {
          this._hideTimeout = null;
          this.hide();
        }, 1000) as unknown as number;
      }
    });
  }

  @Inject(AudioManager)
  private readonly audioManager!: AudioManager;

  private _animatedVolume = 1;

  private drawArc(graphics: Graphics) {
    graphics.clear();
    const volume = Math.max(this._animatedVolume, 0.001);

    graphics.moveTo(0, -75)
      .arc(0, 0, 75, Math.PI * 1.5, Math.PI * (1.5 + volume * 2.0), false)
      .stroke({
        color: 0xFFFFFF,
        width: 10,
        cap: "round",
        join: "round",
      });
  }

  update() {
    this.position.set(this.viewportSize.width - 120, this.viewportSize.height - 220);
    this.drawArc(this.arc);
    this.drawArc(this.glow);

    this.volumeText.text = `${Math.round(this._animatedVolume * 100)}%`;
  }

  onTick() {
    this.visible = this.alphaFilter.alpha > 0.01;
    const delta = Ticker.shared.deltaTime;

    if (Math.abs(this._animatedVolume - this.audioManager.volume) > 0.01) {
      this._animatedVolume = this._animatedVolume + (this.audioManager.volume - this._animatedVolume) * Math.min(1, delta * 0.25);
      this.update();
    } else if (this._animatedVolume !== this.audioManager.volume) {
      this._animatedVolume = this.audioManager.volume;
      this.update();
    }
  }

  private _showing = false;

  show() {
    if (this._showing) return;
    this._showing = true;
    this.scale.set(0.5);

    this.alphaFilter.alpha = 0;
    gsap.to(this.alphaFilter, { alpha: 1, duration: 0.125 });
    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.125,
      ease: "back.out",
    });
  }

  hide() {
    if (!this._showing) return;
    this._showing = false;

    gsap.to(this.alphaFilter, { alpha: 0, duration: 0.125 });
    gsap.to(this.scale, { x: 0.9, y: 0.9, duration: 0.125, ease: "none" });
  }

}