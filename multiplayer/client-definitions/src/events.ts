export type IEvents = object;

export interface ListenerFn<Args extends any[] = any[]>
{
  (...args: Args): void;
}

/**
 * `object` should be in either of the following forms:
 * ```
 * interface EventTypes {
 *   'event-with-parameters': any[]
 *   'event-with-example-handler': (...args: any[]) => void
 * }
 * ```
 */
export type ValidEventTypes = string | symbol | object;

export type EventNames<T extends ValidEventTypes> = T extends string | symbol
    ? T
    : keyof T;

export type ArgumentMap<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any[]) => void
      ? Parameters<T[K]>
      : T[K] extends any[]
          ? T[K]
          : any[];
};

export type EventListener<
  T extends ValidEventTypes,
  K extends EventNames<T>,
> = T extends string | symbol
    ? (...args: any[]) => void
    : (
      ...args: ArgumentMap<Exclude<T, string | symbol>>[Extract<K, keyof T>]
    ) => void;

export interface IEventEmitter<Events extends IEvents>
{
  on<Event extends EventNames<Events>>(event: Event, listener: EventListener<Events, Event>, context?: any): void
  off<Event extends EventNames<Events>>(event: Event, listener: EventListener<Events, Event>, context?: any): void
  once<Event extends EventNames<Events>>(event: Event, listener: EventListener<Events, Event>, context?: any): void
}

export interface IErrorEvent
{
  error(message: any): void
}
