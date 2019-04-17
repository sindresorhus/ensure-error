declare namespace ensureError {
	interface NonError extends Error {
		name: 'NonError';
	}
}

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
declare function ensureError<T>(input: T): T extends Error ? T : ensureError.NonError;

export = ensureError;
