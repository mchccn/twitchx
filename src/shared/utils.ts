/**
 * Amazingly useful to create readable code for parameterizing API requests.
 * @param object Object to snake-casify.
 */
export function snakeCasify<T extends { [key: string]: string | undefined }>(object: T): T {
    return Object.fromEntries(
        Object.entries(object)
            .map(([k, v]) => [
                k
                    .split(/(?=[A-Z])/)
                    .map((str) => str.toLowerCase())
                    .join("_"),
                v,
            ])
            .filter(([, v]) => typeof v !== "undefined")
    ) as T;
}
