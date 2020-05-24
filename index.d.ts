declare namespace ensureError {
	interface NonError extends Error {
		name: 'NonError';
		stack: string;
	}
}

// IfAny<T, ThenType, ElseType> resolves to ThenType if T is `any` and resolves to ElseType otherwise
// https://stackoverflow.com/a/49928360/4135063
type IfAny<T, ThenType, ElseType> = 0 extends (1 & T) ? ThenType : ElseType;

type ErrorWithStack<T> = T & {stack: string};

/**
Ensures a value is a valid error by making it one if not.

If `input` is an `Error`, any missing `Error` properties will be added.
If it's not an `Error`, `input` is converted to an `Error`.

@example
```
import ensureError = require('ensure-error');

const error = new TypeError('🦄');
error.name = '';

console.log(error.name);
//=> ''

console.log(ensureError(error).name);
//=> 'TypeError'

console.log(ensureError(10));
//=> [NonError: 10]
```
*/
declare function ensureError<T>(input: T): IfAny<T, ErrorWithStack<Error>, T extends Error ? ErrorWithStack<T> : ensureError.NonError>;

export = ensureError;
