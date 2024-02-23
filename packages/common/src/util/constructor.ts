export type Constructor<T = object> = new (...args: any[]) => T;

export type NoArgsConstructor<T = object> = new () => T;
