export type Constructor<T = {}> = new (...args: any[]) => T;

export type NoArgsConstructor<T = {}> = new () => T;