import {inspect} from 'node:util';

class NonError extends Error {
	constructor(message) {
		super(inspect(message));

		Object.defineProperty(this, 'name', {
			value: 'NonError',
			configurable: true,
			writable: true,
		});

		Error.captureStackTrace(this, NonError);
	}
}

export default function ensureError(input) {
	if (!(input instanceof Error)) {
		return new NonError(input);
	}

	const error = input;

	if (!error.name) {
		Object.defineProperty(error, 'name', {
			value: (error.constructor && error.constructor.name) || 'Error',
			configurable: true,
			writable: true,
		});
	}

	if (!error.message) {
		Object.defineProperty(error, 'message', {
			value: '<No error message>',
			configurable: true,
			writable: true,
		});
	}

	if (!error.stack) {
		Object.defineProperty(error, 'stack', {
			value: (new Error(error.message)).stack.replace(/\n {4}at /, '\n<Original stack missing>$&'),
			configurable: true,
			writable: true,
		});
	}

	return error;
}
