import { Component } from '@/editor/drawables/Component.ts';
import { BitmapText, Graphics } from 'pixi.js';
import { usePreferences } from '@/composables/usePreferences.ts';
import { frameStats } from '@/editor/drawables/DrawableSystem.ts';
import { clamp } from '@vueuse/core';

export class FrameStatsOverlayDrawable extends Component {
  frameTimeList: number[] = [];
  updateTimeList: number[] = [];

  constructor() {
    super();
    this.eventMode = 'none';
  }

  graph = new Graphics({
    x: -200,
    y: -150,
    scale: {
      x: 2,
      y: 2,
    },
  });

  fpsText = new BitmapText({
    text: '0',
    style: {
      fontFamily: 'Nunito Sans',
      fontSize: 24,
      fill: 0xffffff,
    },
    anchor: { x: 1, y: 1 },
    y: -24,
  });

  frameTimeText = new BitmapText({
    text: '0',
    style: {
      fontFamily: 'Nunito Sans',
      fontSize: 24,
      fill: 0xffffff,
    },
    anchor: { x: 1, y: 1 },
    scale: { x: 0.9, y: 0.9 },
  });

  onLoad() {
    this.addChild(this.fpsText, this.frameTimeText, this.graph);

    watchEffect(() => {
      const { preferences } = usePreferences();
      this.visible = preferences.graphics.showFps;
    });
  }

  lastDraw = performance.now();
  drawTimes: number[] = [];

  onTick() {
    const now = performance.now();
    this.drawTimes.push(now - this.lastDraw);
    if (this.drawTimes.length > 50) this.drawTimes.shift();
    this.lastDraw = now;

    const averageDrawTime =
      this.drawTimes.reduce((a, b) => a + b, 0) / this.drawTimes.length;

    console.log(averageDrawTime);

    this.fpsText.text = Math.round(1000 / averageDrawTime) + 'fps';

    this.frameTimeText.text = frameStats.frameTime.toFixed(1) + 'ms';

    this.updateTimeList.push(frameStats.updateTime);
    if (this.updateTimeList.length > 100) this.updateTimeList.shift();

    this.frameTimeList.push(frameStats.frameTime);
    if (this.frameTimeList.length > 100) this.frameTimeList.shift();

    this.graph.clear();

    if (this.updateTimeList.length === 0) return;

    this.graph.rect(0, 0, 100, 50).fill({ color: 0xffffff, alpha: 0.1 });

    const maxValue = Math.max(...this.frameTimeList, 10);

    function getY(value: number) {
      return clamp(50 - (value / maxValue) * 50, 0, 50);
    }

    this.graph.beginPath().moveTo(0, getY(this.updateTimeList[0]) - 1);
    for (let i = 0; i < this.frameTimeList.length; i++) {
      this.graph.lineTo(i, getY(this.updateTimeList[i]) - 1);
    }
    this.graph.stroke({ color: 0x52cca3, alpha: 0.75 });

    this.graph.beginPath().moveTo(0, getY(this.frameTimeList[0]) - 1);
    for (let i = 0; i < this.frameTimeList.length; i++) {
      this.graph.lineTo(i, getY(this.frameTimeList[i]) - 1);
    }
    this.graph.stroke(0xffffff);
  }
}
