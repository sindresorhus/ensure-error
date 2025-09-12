export interface NonError extends Error {
	name: 'NonError';
	stack: string;
}

// IfAny<T, ThenType, ElseType> resolves to ThenType if T is `any` and resolves to ElseType otherwise
// https://stackoverflow.com/a/49928360/4135063
type IfAny<T, ThenType, ElseType> = 0 extends (1 & T) ? ThenType : ElseType;

type ErrorWithStack<T> = T & {stack: string};

// Transform individual items (for cause or array elements)
type TransformItem<T> = T extends Error
	? ErrorWithStack<T>
	// eslint-disable-next-line @typescript-eslint/ban-types
	: T extends null | undefined
		? T
		: NonError;

// Transform arrays of items (for AggregateError.errors)
type TransformErrors<T> = T extends ReadonlyArray<infer Item>
	? ReadonlyArray<TransformItem<Item>>
	: T;

// Apply transformation recursively to error and its properties
type EnsuredError<T> = T extends Error
	? ErrorWithStack<T> & (
		T extends {cause: infer C}
			? {cause?: TransformItem<C>}
			: unknown
	) & (
		T extends AggregateError
			? T extends {errors: infer E}
				? {errors: TransformErrors<E>}
				: unknown
			: unknown
	)
	: NonError;

/**
Ensures a value is a valid error by making it one if not.

If `input` is an `Error`, any missing `Error` properties will be added. If the error has a `.cause` property, it will be recursively ensured to be a valid error too. If the error is an `AggregateError`, all items in the errors array will also be recursively ensured to be valid errors.
If it's not an `Error`, `input` is converted to an `Error`.

@example
```
import ensureError from 'ensure-error';

const error = new TypeError('🦄');
error.name = '';

console.log(error.name);
//=> ''

console.log(ensureError(error).name);
//=> 'TypeError'

console.log(ensureError(10));
//=> [NonError: 10]

const errorWithCause = new Error('Something went wrong');
errorWithCause.cause = 'A string cause'; // Not a proper error

const result = ensureError(errorWithCause);
console.log(result.cause);
//=> [NonError: 'A string cause']

const aggregateError = new AggregateError(['error1', 42], 'Multiple errors');
const aggregateResult = ensureError(aggregateError);
console.log(aggregateResult.errors[0]);
//=> [NonError: 'error1']
console.log(aggregateResult.errors[1]);
//=> [NonError: 42]
```
*/
export default function ensureError<T>(input: T): IfAny<T, ErrorWithStack<Error>, EnsuredError<T>>;
