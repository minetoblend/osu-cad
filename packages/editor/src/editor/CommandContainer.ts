import { Container, resolved } from 'osucad-framework';
import type { OsuHitObject } from '../beatmap/hitObjects/OsuHitObject';
import { CommandManager } from './context/CommandManager';
import type { EditorCommand } from './commands/EditorCommand';
import type { CommandProxy } from './commands/CommandProxy';
import { createCommandProxy } from './commands/CommandProxy';

export class CommandContainer extends Container {
  @resolved(CommandManager)
  protected readonly commandManager!: CommandManager;

  protected submit(
    command: EditorCommand,
    commit = false,
  ) {
    return this.commandManager.submit(command, commit);
  }

  protected commit() {
    this.commandManager.commit();
  }

  #proxies = new Map<OsuHitObject, CommandProxy<any>>();

  protected createProxy<T extends OsuHitObject>(object: T) {
    let proxy = this.#proxies.get(object);
    if (proxy)
      return proxy;

    proxy = createCommandProxy(this.commandManager, object);

    this.#proxies.set(object, proxy);

    proxy.onDispose.addListener(() => this.#proxies.delete(object));

    return proxy;
  }

  updateAfterChildren() {
    super.updateAfterChildren();

    for (const proxy of this.#proxies.values()) {
      proxy.flush();
    }
  }
}
