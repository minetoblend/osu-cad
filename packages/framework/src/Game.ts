import type { Drawable } from "./graphics/drawables/Drawable";
import type { GameHost } from "./platform/GameHost";
import { Bindable } from "./bindables/Bindable";
import { provideSelf } from "./di/decorators";
import { Container } from "./graphics/containers/Container";
import { Anchor } from "./graphics/drawables/Anchor";
import { Axes } from "./graphics/drawables/Axes";

@provideSelf()
export class Game extends Container
{
  public constructor()
  {
    super();

    this.relativeSizeAxes = Axes.Both;

    super.addInternal(
        (this.#content = Container.create({
          relativeSizeAxes: Axes.Both,
          anchor: Anchor.Center,
          origin: Anchor.Center,
        })),
    );
  }

  public override addInternal<T extends Drawable>(child: T): T
  {
    throw new Error(`Cannot call addInternal on ${this.typeName}, use add() instead`);
  }

  readonly #content: Container;

  #host?: GameHost;

  public set host(host: GameHost)
  {
    this.#host = host;
  }

  public get host(): GameHost | undefined
  {
    return this.#host;
  }

  public override get content()
  {
    return this.#content;
  }

  public readonly isActive = new Bindable(false);
}
