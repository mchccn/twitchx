import lt from "long-timeout";
import { MILLISECONDS } from "../shared/constants";
import { Awaited } from "../types/utils";

export default class Cache<V extends { update(): Awaited<void> }> extends Map<string, V> {
    private timeouts = new Map<string, { timeout: lt.Timeout; timestamp: number }>();
    private intervals = new Map<string, { interval: lt.Interval; timestamp: number }>();

    constructor(public readonly options: { update: number; ttl: number }) {
        super();
    }

    public clear() {
        super.clear();

        for (const [, { interval }] of this.intervals) this.clearInterval(interval);
        for (const [, { timeout }] of this.timeouts) this.clearTimeout(timeout);

        this.intervals.clear();
        this.timeouts.clear();
    }

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

    public has(key: string) {
        return super.has(key);
    }

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
