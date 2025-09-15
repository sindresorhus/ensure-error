function toErrorMessage(value) {
	if (value === undefined) {
		return 'undefined';
	}

	if (typeof value === 'string') {
		return `'${value}'`;
	}

	if (typeof value === 'bigint') {
		return `${value}n`;
	}

	if (typeof value === 'symbol') {
		return value.toString();
	}

	if (typeof value === 'function') {
		return `[Function${value.name ? ` ${value.name}` : ' (anonymous)'}]`;
	}

	try {
		return JSON.stringify(value);
	} catch {
		try {
			return String(value);
		} catch {
			return '<Unserializable value>';
		}
	}
}

class NonError extends Error {
	name = 'NonError';

	constructor(message) {
		super(toErrorMessage(message));
	}
}

function ensureErrorInternal(input, seen) {
	if (!(input instanceof Error)) {
		return new NonError(input);
	}

	// Prevent infinite recursion with circular references
	if (seen.has(input)) {
		return input;
	}

	seen.add(input);

	// Helper to ensure properties exist with correct descriptors
	const ensureProperty = (property, defaultValue) => {
		if (!input[property]) {
			Object.defineProperty(input, property, {
				value: defaultValue,
				configurable: true,
				writable: true,
				enumerable: false,
			});
		}
	};

	ensureProperty('name', input.constructor?.name || 'Error');
	ensureProperty('message', '<No error message>');
	ensureProperty('stack', (new Error(input.message)).stack.replace(/\n {4}at /, '\n<Original stack missing>$&'));

	// Recursively ensure cause is also a proper error
	if (input.cause !== undefined && input.cause !== null) {
		input.cause = ensureErrorInternal(input.cause, seen);
	}

	// Recursively ensure AggregateError.errors are also proper errors
	if (input instanceof AggregateError && Array.isArray(input.errors)) {
		input.errors = input.errors.map(error => ensureErrorInternal(error, seen));
	}

	return input;
}

export default function ensureError(input) {
	return ensureErrorInternal(input, new WeakSet());
}
