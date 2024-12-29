import type { ExtensionMetadata, PropertiesEntry, PropertiesExtension, StatsExtension } from '@pixi/devtools';
import type { Container, Renderer } from 'pixi.js';
import type { CompositeDrawable, Drawable } from '../graphics';
import type { UserInputManager } from '../input';
import { initDevtools } from '@pixi/devtools';

export function setupDevtools(root: CompositeDrawable, renderer: Renderer) {
  initDevtools({
    stage: root.drawNode,
    renderer,
    extensions: [
      new DrawablePropertiesExtension(),
      new DrawableStatsPlugin(),
    ],
  });
}

// eslint-disable-next-line dot-notation
const getDrawable = (container: any) => container['__drawable__'] as Drawable | undefined;

class DrawablePropertiesExtension implements PropertiesExtension {
  readonly extension: ExtensionMetadata = {
    type: 'sceneProperties',
    name: 'drawableProperties',
  };

  testNode(container: Container): boolean {
    return !!getDrawable(container);
  }

  testProp(prop: string): boolean {
    return prop !== 'type';
  }

  setProperty(container: Container, prop: string, value: any): void {
    const drawable = getDrawable(container)!;
    if (!drawable)
      return;

    drawable.setDevtoolValue(prop, value);
  }

  getProperties(container: Container): PropertiesEntry[] {
    const drawable = getDrawable(container);

    if (!drawable)
      return [];

    return drawable.devToolProps.reduce((result, property) => {
      const prop = property.prop;

      result.push({
        ...property,
        value: drawable.getDevtoolValue(prop),
      });

      return result;
    }, [] as PropertiesEntry[]);
  }
}

class DrawableStatsPlugin implements StatsExtension {
  extension: ExtensionMetadata = {
    type: 'stats',
    name: 'DrawableStats',
  };

  track(container: Container, state: Record<string, number>) {
    const drawable = getDrawable(container);

    if (!drawable)
      return;

    if (drawable.constructor.name === 'UserInputManager') {
      const inputManager = drawable as UserInputManager;

      // eslint-disable-next-line dot-notation
      state['positionalInputQueue'] = inputManager.positionalInputQueue.length;
      // eslint-disable-next-line dot-notation
      state['nonPositionalInputQueue'] = inputManager.nonPositionalInputQueue.length;
    }

    if ((drawable as CompositeDrawable).masking) {
      // eslint-disable-next-line dot-notation
      state['maskingContainers'] = (state['maskingContainers'] || 0) + 1;
    }

    drawable.trackDevtoolsValue(state);
  }

  getKeys() {
    return [
      'positionalInputQueue',
      'nonPositionalInputQueue',
    ];
  }
}
