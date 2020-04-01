const C_HTTP_ERROR_CHECKER = Symbol('HttpError');
const C_HTTP_ERROR_CHECK_VALUE = 'HttpError';

export default class HttpError extends Error {
    public readonly status: number;
    public readonly response?: any;
    public readonly errors?: any[];

    constructor(opts: {
        name?: string,
        message: string,
        status: number,
        response?: any,
        errors?: any[]
    }) {
        super(opts.message);

        Object.defineProperty(this, C_HTTP_ERROR_CHECKER, {value: C_HTTP_ERROR_CHECK_VALUE});

        this.status = opts.status;
        this.name = opts.name ? opts.name : 'HttpError';
        this.response = opts.response;
        this.errors = opts.errors;
    }
}

function checkInstanceOf(obj: any) {
    return obj[C_HTTP_ERROR_CHECKER] === C_HTTP_ERROR_CHECK_VALUE;
}

Object.defineProperty(HttpError, Symbol.hasInstance, {
    value: checkInstanceOf
});
