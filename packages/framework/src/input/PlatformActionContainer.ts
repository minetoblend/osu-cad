import type { GameHost } from '../platform';
import type { IKeyBinding } from './bindings/IKeyBinding';
import type { PlatformAction } from './PlatformAction';
import { resolved } from '../di';
import { GAME_HOST } from '../injectionTokens';
import { KeyBindingContainer, SimultaneousBindingMode } from './bindings/KeyBindingContainer';
import { KeyCombinationMatchingMode } from './bindings/KeyCombination';

export class PlatformActionContainer extends KeyBindingContainer<PlatformAction> {
  @resolved(GAME_HOST)
  protected host!: GameHost;

  constructor() {
    super(SimultaneousBindingMode.None, KeyCombinationMatchingMode.Modifiers);
  }

  override get defaultKeyBindings(): IKeyBinding[] {
    return this.host.platformKeyBindings;
  }
}
