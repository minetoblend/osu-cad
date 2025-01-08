import type { GameHost, IKeyBindingHandler, KeyBindingAction, KeyBindingPressEvent, ReadonlyDependencyContainer } from 'osucad-framework';
import type { DrawableManiaHitObject } from '../objects/drawables/DrawableManiaHitObject';
import { type DrawableHitObject, ISkinSource, type JudgementResult, ScrollingPlayfield, SkinnableDrawable } from '@osucad/common';
import { Axes, Bindable, Container, GAME_HOST, provide, resolved, Vec2 } from 'osucad-framework';
import { Color } from 'pixi.js';
import { LegacyManiaSkinConfigurationLookups } from '../skinning/LegacyManiaSkinConfigurationLookups';
import { ManiaSkinComponentLookup } from '../skinning/ManiaSkinComponentLookup';
import { ManiaSkinComponents } from '../skinning/ManiaSkinComponents';
import { ManiaSkinConfigurationLookup } from '../skinning/ManiaSkinConfigurationLookup';
import { ColumnHitObjectArea } from './ColumnHitObjectArea';
import { DefaultColumnBackground } from './DefaultColumnBackground';
import { DefaultKeyArea } from './DefaultKeyArea';
import { BindableManiaAction, ManiaAction } from './ManiaAction';
import { OrderedHitPolicy } from './OrderedHitPolicy';
import { Stage } from './Stage';

export class Column extends ScrollingPlayfield implements IKeyBindingHandler<ManiaAction> {
  static readonly COLUMN_WIDTH = 80;
  static readonly SPECIAL_COLUMN_WIDTH = 70;

  readonly index: number;

  @provide(BindableManiaAction)
  readonly action = new Bindable<ManiaAction>(ManiaAction.Key1);

  readonly hitObjectArea: ColumnHitObjectArea;

  readonly backgroundContainer = new Container({ relativeSizeAxes: Axes.Both });

  readonly topLevelContainer = new Container({ relativeSizeAxes: Axes.Both });

  readonly #hitPolicy: OrderedHitPolicy;

  // TODO: underlayElements

  readonly isSpecial: boolean;

  readonly accentColor = new Bindable<Color>(new Color(0x000000));

  constructor(index: number, isSpecial: boolean) {
    super();

    this.index = index;
    this.isSpecial = isSpecial;

    this.relativeSizeAxes = Axes.Y;
    this.width = Column.COLUMN_WIDTH;

    this.#hitPolicy = new OrderedHitPolicy();
    this.hitObjectArea = new ColumnHitObjectArea(this.hitObjectContainer, { relativeSizeAxes: Axes.Both });
  }

  @resolved(ISkinSource)
  private skin!: ISkinSource;

  protected override load(dependencies: ReadonlyDependencyContainer) {
    super.load(dependencies);

    let keyArea: SkinnableDrawable;

    this.skin.sourceChanged.addListener(this.#onSourceChanged, this);
    this.#onSourceChanged();

    this.internalChildren = [
      this.hitObjectArea,
      keyArea = new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.KeyArea), () => new DefaultKeyArea()).with({
        relativeSizeAxes: Axes.Both,
      }),
      this.backgroundContainer,
      this.topLevelContainer,
    ];

    const background = new SkinnableDrawable(new ManiaSkinComponentLookup(ManiaSkinComponents.ColumnBackground), () => new DefaultColumnBackground()).with({
      relativeSizeAxes: Axes.Both,
    });

    background.clock = this.host.clock;
    background.processCustomClock = false;

    keyArea.clock = this.host.clock;
    keyArea.processCustomClock = false;

    this.backgroundContainer.add(background);
  }

  @resolved(GAME_HOST)
  host!: GameHost;

  #onSourceChanged() {
    this.accentColor.value = this.skin.getConfig(new ManiaSkinConfigurationLookup(LegacyManiaSkinConfigurationLookups.ColumnBackgroundColour, this.index)) ?? new Color(0x000000);
  }

  protected override loadComplete() {
    super.loadComplete();

    this.newResult.addListener(this.#onNewResult, this);
  }

  override dispose(isDisposing: boolean = true) {
    super.dispose(isDisposing);

    this.newResult.removeListener(this.#onNewResult, this);

    this.skin.sourceChanged.removeListener(this.#onSourceChanged, this);
  }

  protected override onNewDrawableHitObject(drawable: DrawableHitObject) {
    super.onNewDrawableHitObject(drawable);

    const maniaObject = drawable as DrawableManiaHitObject;

    maniaObject.accentColor.bindTo(this.accentColor);
    // TODO: maniaObject.checkHittable = this.hitPolicy.isHittable;
  }

  #onNewResult([hitObject, result]: [DrawableHitObject, JudgementResult]) {
    this.onNewResult(hitObject, result);
  }

  onNewResult(judgedObject: DrawableHitObject, result: JudgementResult) {
    if (result.isHit)
      this.#hitPolicy.handleHit(judgedObject);

    // TODO: display judgement result
  }

  readonly isKeyBindingHandler = true;

  canHandleKeyBinding(binding: KeyBindingAction): boolean {
    return binding instanceof ManiaAction;
  }

  onKeyBindingPressed(e: KeyBindingPressEvent<ManiaAction>): boolean {
    if (e.pressed !== this.action.value)
      return false;

    // sampleTriggerSource.play()
    return true;
  }

  override receivePositionalInputAt(screenSpacePosition: Vec2): boolean {
    return this.drawRectangle.inflate(new Vec2(Stage.COLUMN_SPACING / 2, 0)).contains(this.toLocalSpace(screenSpacePosition));
  }
}
