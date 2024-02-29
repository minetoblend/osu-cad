import { ClientMessages } from '@osucad/common';
import { RoomUser } from '../room-user';

type Args<T> = T extends (...args: infer U) => any ? U : never;

export function OnMessage<T extends keyof ClientMessages>(key: T) {
  return function (
    target: any,
    propertyKey: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    descriptor: TypedPropertyDescriptor<
      (user: RoomUser, ...args: Args<ClientMessages[T]>) => void
    >,
  ): void {
    target.handlers ??= {};
    target.handlers[key] = propertyKey;
  };
}
