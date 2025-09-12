import {expectAssignable, expectType} from 'tsd';
import ensureError, {NonError} from './index.js';

type ErrorWithStack<T> = T & {stack: string};

const error = new TypeError('🦄');

expectAssignable<Error>(ensureError(10 as any));
expectAssignable<TypeError>(ensureError(error));

expectType<ErrorWithStack<Error>>(ensureError(10 as any));
expectType<ErrorWithStack<TypeError>>(ensureError(error));
expectType<NonError>(ensureError(10));

// Ensure stack property
expectType<string>(ensureError(10).stack);
expectType<string>(ensureError(10 as any).stack);
expectType<string>(ensureError(error).stack);

// Test cause transformation - verify we can access properly typed cause properties
const errorWithStringCause = new Error('message') as Error & {cause: string};
errorWithStringCause.cause = 'string cause';
const result1 = ensureError(errorWithStringCause);

// After transformation, the cause should be typed as NonError when accessed
if (result1.cause) {
	expectAssignable<NonError>(result1.cause);
}

const errorWithErrorCause = new Error('message') as Error & {cause: Error};
errorWithErrorCause.cause = new Error('nested');
const result2 = ensureError(errorWithErrorCause);

// Error causes should remain as ErrorWithStack<Error>
if (result2.cause) {
	expectAssignable<ErrorWithStack<Error>>(result2.cause);
}

// Test that AggregateError and errors property transformation works at runtime
// (Comprehensive runtime tests in test.js verify all transformation behavior)
