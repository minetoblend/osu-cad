import { usePreferences } from '@/composables/usePreferences';
import { dependencyLoader } from '@/framework/di/DependencyLoader';
import { Anchor } from '@/framework/drawable/Anchor';
import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { DrawableOptions } from '@/framework/drawable/Drawable';
import { Invalidation } from '@/framework/drawable/Invalidation';
import { DrawableText } from '@/framework/drawable/SpriteText';
import { MouseDownEvent } from '@/framework/input/events/MouseEvent';
import { UIWheelEvent } from '@/framework/input/events/UIWheelEvent';
import { AudioPreferences, Vec2 } from '@osucad/common';
import { clamp } from '@vueuse/core';
import gsap from 'gsap';
import { DropShadowFilter } from 'pixi-filters';
import { Container, Graphics, Sprite, Texture } from 'pixi.js';

export class VolumeKnob extends ContainerDrawable {
  constructor(
    options: DrawableOptions & {
      label: string;
      channel: keyof AudioPreferences;
    },
  ) {
    super(options);

    this.innerContainer.addChild(
      this.graphics,
      this.spriteContainer,
      this.activeContainer,
    );
    this.drawNode.addChild(this.innerContainer);

    this.activeContainer.filters = [
      new DropShadowFilter({
        color: 0x32d2ac,
        alpha: 1,
        offset: { x: 0, y: 0 },
        resolution: devicePixelRatio,
      }),
    ];

    this.createSprites();

    this.activeContainer.blendMode = 'add';

    this.label = this.add(
      new DrawableText({
        text: options.label,
        fontSize: 7,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
        color: 0xb6b6c3,
        alpha: 0.75,
        y: -4,
      }),
    );

    this.secondaryLabel = this.add(
      new DrawableText({
        text: '100%',
        fontSize: 5,
        anchor: Anchor.Centre,
        origin: Anchor.Centre,
        color: 0xb6b6c3,
        alpha: 0.75,
        y: 5,
      }),
    );

    this.channel = options.channel;

    const { preferences } = usePreferences();

    watch(
      () => preferences.audio[options.channel],
      (volume) => {
        this.updateState(volume / 100);
      },
      { immediate: true },
    );
  }

  innerContainer = new Container();
  graphics = new Graphics();
  spriteContainer = new Container();
  activeContainer = new Container();
  label: DrawableText;
  secondaryLabel: DrawableText;
  channel: keyof AudioPreferences;

  handleInvalidations(): void {
    super.handleInvalidations();
    if (this._invalidations & Invalidation.DrawSize) {
      this.innerContainer.position.set(
        this.drawSize.x / 2,
        this.drawSize.y / 2,
      );
      this.innerContainer.scale.set(this.drawSize.x / 64, this.drawSize.y / 64);
    }
  }

  sprites: Sprite[] = [];

  @dependencyLoader()
  load() {
    this.graphics
      .beginPath()
      .arc(0, 0, 26, Math.PI * 0.75, Math.PI * 0.25)
      .stroke({
        color: 0x222228,
        alpha: 0.5,
        width: 6,
        join: 'round',
        cap: 'round',
      });
  }

  createSprites() {
    const total = 48;
    for (let i = 0; i < total; i++) {
      const startAngle = -Math.PI * 1.25;
      const endAngle = Math.PI * 0.25;
      const angle = startAngle + (endAngle - startAngle) * (i / (total - 1));

      this.spriteContainer.addChild(
        new Sprite({
          texture: Texture.WHITE,
          width: 1.5,
          height: 4,
          tint: 0x0a0e17,
          alpha: 0.75,
          x: Math.cos(angle) * 26,
          y: Math.sin(angle) * 26,
          anchor: { x: 0.5, y: 0.5 },
          rotation: angle + Math.PI / 2,
        }),
      );

      this.activeContainer.addChild(
        new Sprite({
          texture: Texture.WHITE,
          width: 1,
          height: 4,
          tint: 0x32d2ac,
          x: Math.cos(angle) * 26,
          y: Math.sin(angle) * 26,
          anchor: { x: 0.5, y: 0.5 },
          rotation: angle + Math.PI / 2,
          alpha: 0,
        }),
      );
    }
  }

  updateState(volume: number) {
    const total = this.spriteContainer.children.length;
    const active = Math.floor(volume * total);

    for (let i = 0; i < total; i++) {
      const isActive = i < active;

      const sprite = this.activeContainer.children[i];
      gsap.to(sprite, {
        alpha: i < active ? 1 : 0,
        duration: 0.1,
        ease: isActive ? 'power2.out' : 'power2.out',
      });
    }

    this.secondaryLabel.text = `${Math.round(volume * 100)}%`;
  }

  receivePositionalInputAt(screenSpacePos: Vec2): boolean {
    const local = this.toLocalSpace(screenSpacePos);
    const distance = Math.sqrt(
      (local.x - this.drawSize.x / 2) ** 2 +
        (local.y - this.drawSize.y / 2) ** 2,
    );
    return distance < this.drawSize.x / 2;
  }

  onHover(): boolean {
    this.updateLabel();
    return true;
  }

  onHoverLost(): boolean {
    this.updateLabel();
    return true;
  }

  dragging = false;

  onMouseDown(event: MouseDownEvent): boolean {
    if (event.left) {
      this.dragging = true;
      event.capture();
      this.updateLabel();
      this.onMouseMove(event);
    }
    return true;
  }

  onMouseUp(): boolean {
    this.dragging = false;
    this.updateLabel();
    return true;
  }

  onMouseMove(event: MouseDownEvent): boolean {
    if (this.dragging) {
      const local = this.toLocalSpace(event.screenSpacePosition).sub({
        x: this.drawSize.x / 2,
        y: this.drawSize.y / 2,
      });
      const startAngle = -Math.PI * 1.25;
      const endAngle = Math.PI * 0.25;
      let angle = Math.atan2(local.y, local.x);
      if (angle < Math.PI && angle > Math.PI / 2) {
        angle -= Math.PI * 2;
      }
      const volume = (angle - startAngle) / (endAngle - startAngle);

      this.volume = clamp(volume, 0, 1);
    }
    return true;
  }

  updateLabel() {
    if (this.hovered || this.dragging) {
      gsap.to(this.label, {
        alpha: 1,
        duration: 0.1,
      });
    } else {
      gsap.to(this.label, {
        alpha: 0.75,
        duration: 0.1,
      });
    }
  }

  get volume() {
    const { preferences } = usePreferences();
    return preferences.audio[this.channel] / 100;
  }

  set volume(value: number) {
    const { preferences } = usePreferences();
    preferences.audio[this.channel] = value * 100;
    console.log(preferences.audio[this.channel]);
  }

  onWheel(event: UIWheelEvent): boolean {
    if (!event.alt) {
      let delta = event.deltaY / 100;
      if (event.shift) {
        delta /= 10;
      }
      this.volume = clamp(this.volume + delta, 0, 1);
      return true;
    }
    return false;
  }
}
