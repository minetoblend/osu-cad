<script setup lang="ts">
import {Application, ObservablePoint} from "pixi.js";
import "../editor/drawables/DrawableSystem.ts";
import "../editor/drawables/layout/LayoutSystem.ts";
import {AlignType, HBox} from "../editor/drawables/layout/HBox.ts";
import {Component} from "../editor/drawables/Component.ts";
import {Box} from "../editor/drawables/Box.ts";

const app = new Application();
const container = ref();

class Foo extends Component {

  background = new Box({
    width: 0,
    height: 0,
    fill: 0xffffff,
    alpha: 0.2,
  });

  constructor() {
    super();
    this.addChild(this.background);
    this.preferredWidth = 100;
    this.preferredHeight = 100;
  }

  _onUpdate(point?: ObservablePoint) {
    super._onUpdate(point);
    this.background.setSize(this.size.x, this.size.y);
  }
}

onMounted(async () => {
  await app.init({});
  container.value.appendChild(app.canvas);

  const box = new HBox();
  box.gap = 10;

  app.stage = box;

  const foo1 = new Foo();
  const foo2 = new Foo();

  foo2.margin = 20;

  foo1.preferredWidth = 200;
  foo2.preferredHeight = 200;

  box.verticalAlign = AlignType.Center;

  app.stage.addChild(foo1, foo2);

  console.log(app.stage);
});

</script>

<template>
  <div ref="container">

  </div>
</template>