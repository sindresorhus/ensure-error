import {expectAssignable, expectType} from 'tsd';
import ensureError = require('.');

type ErrorWithStack<T> = T & {stack: string};

const error = new TypeError('🦄');

expectAssignable<Error>(ensureError(10 as any));
expectAssignable<TypeError>(ensureError(error));

expectType<ErrorWithStack<Error>>(ensureError(10 as any));
expectType<ErrorWithStack<TypeError>>(ensureError(error));
expectType<ensureError.NonError>(ensureError(10));

// Ensure stack property
expectType<string>(ensureError(10).stack);
expectType<string>(ensureError(10 as any).stack);
expectType<string>(ensureError(error).stack);
