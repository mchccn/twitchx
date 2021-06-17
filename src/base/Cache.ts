import lt from "long-timeout";
import { MILLISECONDS } from "../shared";
import type { Awaited } from "../types";

/**
 * Implements some sort of LFU cache with a few utility methods.
 * Built specifically for entity managers.
 * @class
 * @template Value
 */
export default class Cache<Value extends { update(): Awaited<unknown> }> extends Map<string, Value> {
    private timeouts = new Map<string, { timeout: lt.Timeout; timestamp: number }>();
    private intervals = new Map<string, { interval: lt.Interval; timestamp: number }>();

    /**
     * Creates a new cache.
     * @param {CacheOptions} options Options to configure the caching behaviour.
     */
    constructor(public readonly options: { update: number; ttl: number }) {
        super();
    }

    /**
     * Clears the entire cache.
     * @returns {void} Nothing.
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
     * @param {string} key Key to retrieve.
     * @returns {Value | undefined} The retrieved value, if any.
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
     * @param {string} key Key to set or update.
     * @param {Value} value New value to store.
     * @returns {this} The newly updated cache.
     */
    public set(key: string, value: Value) {
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
     * @param {string} key Key to delete
     * @returns {Value} The deleted value.
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
     * @param {string} key Key to check.
     * @returns {boolean} True if the cache has the key.
     */
    public has(key: string) {
        return super.has(key);
    }

    /**
     * Performs a search operation on the cache's values.
     * @param {Function} predicate Callback function to execute.
     * @param {any | undefined} thisArg Optional `this` context for the callback.
     * @returns {Value | undefined} The found value, if any.
     */
    public find(predicate: (item: Value, index: number, array: Value[]) => unknown, thisArg?: any) {
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

/**
 * Options to configure the cache.
 * @typedef {object} CacheOptions
 * @prop {number} update How long in milliseconds until each update.
 * @prop {number} ttl How long the entity will last in the cache.
 */
