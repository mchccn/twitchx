export class HTTPError extends Error {
    public name = this.constructor.name;
    public constructor(public message: string) {
        super(message);
    }
}

export class InternalError extends Error {
    public name = this.constructor.name;
    public constructor(public message: string) {
        super(message);
    }
}

export class TwitchAPIError extends Error {
    public name = this.constructor.name;
    public constructor(public message: string) {
        super(message);
    }
}

export class AssertionError extends Error {
    public name = this.constructor.name;
    public constructor(public message: string) {
        super(message);
    }
}
