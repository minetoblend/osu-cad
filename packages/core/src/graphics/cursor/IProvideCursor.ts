import type { CursorContainer } from '@osucad/framework';
import { injectionToken } from '@osucad/framework';

export interface IProvideCursor {
  readonly providesCursor: true;

  get cursor(): CursorContainer;

  get providingUserCursor(): boolean;
}

// eslint-disable-next-line ts/no-redeclare
export const IProvideCursor = injectionToken<IProvideCursor>();

export function providesCursor(value: any): value is IProvideCursor {
  return !!(value?.providesCursor);
}
