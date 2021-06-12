export type Awaited<T> = T | Promise<T>;

export type SinglePartial<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
