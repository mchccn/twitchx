import lt from "long-timeout";
import { MILLISECONDS } from "../shared";
import type { Awaited } from "../types";

/**
 * Implements some sort of LFU cache with a few utility methods.
 * Built specifically for entity managers.
 * @class
 */
export default class Cache<V extends { update(): Awaited<void> }> extends Map<string, V> {
    private timeouts = new Map<string, { timeout: lt.Timeout; timestamp: number }>();
    private intervals = new Map<string, { interval: lt.Interval; timestamp: number }>();

    /**
     * Creates a new cache.
     * @param options Options to configure the caching behaviour.
     */
    constructor(public readonly options: { update: number; ttl: number }) {
        super();
    }

    /**
     * Clears the entire cache.
     */
    public clear() {
        super.clear();

        for (const [, { interval }] of this.intervals) this.clearInterval(interval);
        for (const [, { timeout }] of this.timeouts) this.clearTimeout(timeout);

        this.intervals.clear();
        this.timeouts.clear();
    }

    /**
     * Retrieves a value from the cache.
     * @param key Key to retrieve.
     */
    public get(key: string) {
        const value = super.get(key);

        if (typeof value !== "undefined") {
            if (this.timeouts.get(key)) this.clearTimeout(this.timeouts.get(key)!.timeout);

            this.timeouts.set(key, {
                timeout: this.setTimeout(
                    () => {},
                    this.timeouts.get(key)?.timestamp
                        ? Math.min(Date.now() - this.timeouts.get(key)!.timestamp + MILLISECONDS.HOUR, this.options.ttl)
                        : this.options.ttl
                ),
                timestamp: Date.now(),
            });

            return value;
        }

        return undefined;
    }

    /**
     * Sets or updates a key to a new value.
     * @param key Key to set or update.
     * @param value New value to store.
     */
    public set(key: string, value: V) {
        super.set(key, value);

        this.timeouts.set(key, {
            timeout: this.setTimeout(() => {
                this.delete(key);
            }, this.options.ttl),
            timestamp: Date.now(),
        });

        this.intervals.set(key, {
            interval: this.setInterval(() => {
                this.get(key)?.update();
            }, this.options.update),
            timestamp: Date.now(),
        });

        return this;
    }

    /**
     * Deletes a key from the cache.
     * @param key Key to delete
     */
    public delete(key: string) {
        const value = super.delete(key);

        if (value) {
            this.clearInterval(this.intervals.get(key)!.interval);
            this.clearTimeout(this.timeouts.get(key)!.timeout);

            this.intervals.delete(key);
            this.timeouts.delete(key);
        }

        return value;
    }

    /**
     * Returns true if the cache holds the key.
     * @param key Key to check.
     */
    public has(key: string) {
        return super.has(key);
    }

    /**
     * Performs a search operation on the cache's values.
     * @param predicate Callback function to execute.
     * @param thisArg Optional `this` context for the callback.
     */
    public find(predicate: (item: V, index: number, array: V[]) => unknown, thisArg?: any) {
        return [...this.values()].find(predicate, thisArg);
    }

    private setInterval(...args: Parameters<typeof lt.setInterval>) {
        return lt.setInterval(...args);
    }

    private clearInterval(...args: Parameters<typeof lt.clearInterval>) {
        return lt.clearInterval(...args);
    }

    private setTimeout(...args: Parameters<typeof lt.setTimeout>) {
        return lt.setTimeout(...args);
    }

    private clearTimeout(...args: Parameters<typeof lt.clearTimeout>) {
        return lt.clearTimeout(...args);
    }
}
