type CamelToSnakeCase<S extends string> = S extends `${infer T}${infer U}`
    ? T extends "_"
        ? `${Lowercase<T>}${CamelToSnakeCase<U>}`
        : `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnakeCase<U>}`
    : S;

type KeysToSnakeCase<T> = {
    [K in keyof T as CamelToSnakeCase<string & K>]: T[K];
};

type CamelToHyphenCase<S extends string> = S extends `${infer T}${infer U}`
    ? T extends "-"
        ? `${Lowercase<T>}${CamelToHyphenCase<U>}`
        : `${T extends Capitalize<T> ? "-" : ""}${Lowercase<T>}${CamelToHyphenCase<U>}`
    : S;

type KeysToHyphenCase<T> = {
    [K in keyof T as CamelToHyphenCase<string & K>]: T[K];
};

/**
 * Amazingly useful to create readable code for parameterizing API requests.
 * @param object Object to snake-casify.
 */
export function snakeCasify<T extends Partial<Record<string, unknown>>>(object: T): KeysToSnakeCase<T> {
    return Object.fromEntries(
        Object.entries(object)
            .map(([k, v]) => [
                k
                    .split(/(?=[A-Z])/)
                    .map((str) => str.toLowerCase())
                    .join("_")
                    .toString(),
                v,
            ])
            .filter(([, v]) => typeof v !== "undefined")
    ) as KeysToSnakeCase<T>;
}

/**
 * Amazingly useful to create readable code for Twitch API events.
 * @param object Object to hyphen-casify.
 */
export function hyphenCasify<T extends Partial<Record<string, unknown>>>(object: T): KeysToHyphenCase<T> {
    return Object.fromEntries(
        Object.entries(object)
            .map(([k, v]) => [
                k
                    .split(/(?=[A-Z])/)
                    .map((str) => str.toLowerCase())
                    .join("-")
                    .toString(),
                v,
            ])
            .filter(([, v]) => typeof v !== "undefined")
    ) as KeysToHyphenCase<T>;
}
