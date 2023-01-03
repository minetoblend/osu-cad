export type Alternating<T extends readonly any[], A, B> =
    T extends readonly [] ? T
        : T extends readonly [A] ? T
            : T extends readonly [A, B, ...infer T2]
                ? T2 extends Alternating<T2, A, B> ? T : never
                : never


