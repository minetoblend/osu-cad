import type { ReadonlyDependencyContainer } from '@osucad/framework';
import type { ColorSource } from 'pixi.js';
import { Anchor, Axes, Container, resolved } from '@osucad/framework';
import { EditorRuleset } from '../../../../rulesets/EditorRuleset';
import { TimingScreenTimelineLayer } from '../TimingScreenTimelineLayer';

export class HitObjectTimelineLayer extends TimingScreenTimelineLayer {
  constructor() {
    super('Hit Objects');
  }

  override get layerColor(): ColorSource {
    return 0x666666;
  }

  @resolved(EditorRuleset)
  editorRuleset!: EditorRuleset;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    this.add(new Container({
      relativeSizeAxes: Axes.Both,
      height: 0.5,
      anchor: Anchor.CenterLeft,
      origin: Anchor.CenterLeft,
      child: this.editorRuleset.createTimelineHitObjectContainer(),
    }));
  }
}
