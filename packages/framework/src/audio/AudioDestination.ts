import { AudioComponent } from "./AudioComponent";
import type { IAudioSource } from "./IAudioSource";

export abstract class AudioDestination<T extends IAudioSource = IAudioSource> extends AudioComponent
{
  protected items: T[] = [];

  protected abstract get input(): AudioNode;

  connect(source: T): void
  {
    if (source.destination)
      source.destination.disconnect(source);

    source.destination = this;

    source.output.connect(this.input);
  }

  disconnect(source: T): boolean
  {
    const index = this.items.indexOf(source);
    if (index < 0)
      return false;

    console.assert(source.destination === this);

    source.destination = undefined;

    source.output.disconnect(this.input);

    return true;
  }

  protected override updateChildren()
  {
    super.updateChildren();

    for (let i = 0; i < this.items.length; i++)
    {
      const item = this.items[i];

      if (!item.isAlive)
      {
        console.assert(item.destination === this);

        item.output.disconnect(this.input);
        this.items.splice(i--, 1);
        continue;
      }

      item.update();
    }
  }

  public override dispose()
  {
    for (const item of this.items)
      item.dispose();

    super.dispose();
  }
}
