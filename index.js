'use strict';
const util = require('util');

class NonError extends Error {
	constructor(message) {
		super(util.inspect(message));
		this.name = 'NonError';
		Error.captureStackTrace(this, NonError);
	}
}

module.exports = input => {
	if (!(input instanceof Error)) {
		return new NonError(input);
	}

	const error = input;

	if (!error.name) {
		error.name = (error.constructor && error.constructor.name) || 'Error';
	}

	if (!error.message) {
		error.message = '<No error message>';
	}

	if (!error.stack) {
		error.stack = (new Error(error.message)).stack.replace(/\n {4}at /, '\n<Original stack missing>$&');
	}

	return error;
};
