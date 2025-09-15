import test from 'ava';
import ensureError from './index.js';

test('error', t => {
	const error = new Error('🦄');
	const result = ensureError(error);
	t.is(result.name, 'Error');
	t.is(result.message, '🦄');
	t.regex(result.stack, /🦄/);
	t.regex(result.stack, / at /);
});

test('error - missing name', t => {
	const error = new TypeError('🦄');
	error.name = '';
	const result = ensureError(error);
	t.is(result.name, 'TypeError');
	t.is(result.message, '🦄');
	t.regex(result.stack, / at /);
});

test('error - missing message', t => {
	const error = new Error('🦄');
	error.message = '';
	const result = ensureError(error);
	t.is(result.name, 'Error');
	t.is(result.message, '<No error message>');
	t.regex(result.stack, / at /);
});

test('error - missing stack', t => {
	const error = new Error('🦄');
	error.stack = '';
	const result = ensureError(error);
	t.is(result.name, 'Error');
	t.is(result.message, '🦄');
	t.true(result.stack.startsWith('Error: 🦄\n<Original stack missing>\n    at '), result.stack); // eslint-disable-line ava/assertion-arguments
});

test('number', t => {
	const result = ensureError(5);
	t.is(result.name, 'NonError');
	t.is(result.message, '5');
	t.regex(result.stack, / at /);
});

test('string', t => {
	const result = ensureError('🌈');
	t.is(result.name, 'NonError');
	t.is(result.message, '\'🌈\'');
	t.regex(result.stack, / at /);
});

test('object', t => {
	const result = ensureError({foo: true});
	t.is(result.name, 'NonError');
	t.is(result.message, '{"foo":true}');
	t.regex(result.stack, / at /);
});

test('undefined', t => {
	const result = ensureError(undefined);
	t.is(result.name, 'NonError');
	t.is(result.message, 'undefined');
	t.regex(result.stack, / at /);
});

test('error with cause property is preserved', t => {
	const causeError = new Error('Original error');
	const error = new Error('High-level error', {cause: causeError});
	const result = ensureError(error);
	t.is(result.name, 'Error');
	t.is(result.message, 'High-level error');
	t.is(result.cause, causeError);
	t.regex(result.stack, / at /);
});

test('error with non-error cause is converted to error', t => {
	const error = new Error('High-level error');
	error.cause = 'string cause';
	const result = ensureError(error);
	t.is(result.name, 'Error');
	t.is(result.message, 'High-level error');
	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '\'string cause\'');
});

test('error with number cause is converted to error', t => {
	const error = new Error('High-level error');
	error.cause = 42;
	const result = ensureError(error);
	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '42');
});

test('error with object cause is converted to error', t => {
	const error = new Error('High-level error');
	error.cause = {foo: 'bar'};
	const result = ensureError(error);
	t.is(result.cause.name, 'NonError');
	t.true(result.cause.message.includes('foo'));
});

test('error with broken cause error is fixed', t => {
	const brokenCauseError = new Error('Broken cause');
	brokenCauseError.name = '';
	brokenCauseError.message = '';
	brokenCauseError.stack = '';

	const error = new Error('High-level error');
	error.cause = brokenCauseError;

	const result = ensureError(error);
	t.is(result.cause.name, 'Error');
	t.is(result.cause.message, '<No error message>');
	t.truthy(result.cause.stack);
});

test('deeply nested cause chain is fully ensured', t => {
	const error = new Error('Top level');
	error.cause = new Error('Middle level');
	error.cause.cause = 'string at bottom';

	const result = ensureError(error);
	t.is(result.message, 'Top level');
	t.is(result.cause.message, 'Middle level');
	t.is(result.cause.cause.name, 'NonError');
	t.is(result.cause.cause.message, '\'string at bottom\'');
});

test('circular cause references are handled', t => {
	const error1 = new Error('Error 1');
	const error2 = new Error('Error 2');
	error1.cause = error2;
	error2.cause = error1;

	const result = ensureError(error1);
	t.is(result.message, 'Error 1');
	t.is(result.cause.message, 'Error 2');
	t.is(result.cause.cause.message, 'Error 1');
	// Should not infinite loop
	t.pass();
});

test('null and undefined causes are preserved', t => {
	const errorWithNull = new Error('Error with null cause');
	errorWithNull.cause = null;
	const resultNull = ensureError(errorWithNull);
	t.is(resultNull.cause, null);

	const errorWithUndefined = new Error('Error with undefined cause');
	errorWithUndefined.cause = undefined;
	const resultUndefined = ensureError(errorWithUndefined);
	t.is(resultUndefined.cause, undefined);
});

test('custom error class cause is preserved', t => {
	class CustomError extends Error {
		constructor(message) {
			super(message);
			this.name = 'CustomError';
		}
	}

	const customCause = new CustomError('Custom cause');
	const error = new Error('Main error');
	error.cause = customCause;

	const result = ensureError(error);
	t.is(result.cause.name, 'CustomError');
	t.is(result.cause.message, 'Custom cause');
	t.true(result.cause instanceof CustomError);
});

test('error with empty string properties', t => {
	const error = new Error('Test error');
	error.name = '';
	error.message = '';
	error.stack = '';
	const result = ensureError(error);
	t.is(result.name, 'Error');
	t.is(result.message, '<No error message>');
	t.truthy(result.stack);
	t.regex(result.stack, /<Original stack missing>/);
});

test('custom error class extending Error', t => {
	class CustomError extends Error {
		constructor(message) {
			super(message);
			this.name = 'CustomError';
		}
	}

	const error = new CustomError('Custom message');
	const result = ensureError(error);
	t.is(result.name, 'CustomError');
	t.is(result.message, 'Custom message');
	t.true(result instanceof CustomError);
});

test('error with symbol cause', t => {
	const error = new Error('Main error');
	error.cause = Symbol('symbol cause');
	const result = ensureError(error);
	t.is(result.cause.name, 'NonError');
	t.true(result.cause.message.includes('Symbol'));
});

test('error with function cause', t => {
	const error = new Error('Main error');
	error.cause = () => {};
	const result = ensureError(error);
	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '[Function (anonymous)]');
});

test('error with bigint cause', t => {
	const error = new Error('Main error');
	error.cause = 123n;
	const result = ensureError(error);
	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '123n');
});

test('ensured properties are non-enumerable', t => {
	const error = new Error('Test');
	error.name = '';
	error.message = '';
	error.stack = '';
	const result = ensureError(error);

	const ownKeys = Object.getOwnPropertyNames(result);
	t.true(ownKeys.includes('name'));
	t.true(ownKeys.includes('message'));
	t.true(ownKeys.includes('stack'));

	// Properties should not be enumerable
	const enumerableKeys = Object.keys(result);
	t.false(enumerableKeys.includes('name'));
	t.false(enumerableKeys.includes('message'));
	t.false(enumerableKeys.includes('stack'));
});

test('very deep cause nesting does not cause stack overflow', t => {
	let error = new Error('Level 0');

	// Create 1000 levels of nesting
	for (let i = 1; i < 1000; i++) {
		const nextError = new Error(`Level ${i}`);
		nextError.cause = error;
		error = nextError;
	}

	// This should not throw or hang
	const result = ensureError(error);
	t.is(result.message, 'Level 999');
	t.truthy(result.cause);
});

test('mixed cause chain (error -> non-error -> error)', t => {
	const bottomError = new Error('Bottom');
	const middleNonError = 'middle string';
	const topError = new Error('Top');

	bottomError.cause = middleNonError;
	topError.cause = bottomError;

	const result = ensureError(topError);
	t.is(result.message, 'Top');
	t.is(result.cause.message, 'Bottom');
	t.is(result.cause.cause.name, 'NonError');
	t.is(result.cause.cause.message, '\'middle string\'');
});

test('error with custom properties are preserved', t => {
	const error = new Error('Test message');
	error.code = 'ERR_CUSTOM';
	error.statusCode = 404;
	error.customData = {foo: 'bar'};

	const result = ensureError(error);
	t.is(result.code, 'ERR_CUSTOM');
	t.is(result.statusCode, 404);
	t.deepEqual(result.customData, {foo: 'bar'});
});

test('AggregateError with non-error items', t => {
	const aggregateError = new AggregateError(['string error', 42, {foo: 'bar'}], 'Multiple errors');
	const result = ensureError(aggregateError);

	t.is(result.name, 'AggregateError');
	t.is(result.message, 'Multiple errors');
	t.is(result.errors.length, 3);

	t.is(result.errors[0].name, 'NonError');
	t.is(result.errors[0].message, '\'string error\'');

	t.is(result.errors[1].name, 'NonError');
	t.is(result.errors[1].message, '42');

	t.is(result.errors[2].name, 'NonError');
	t.true(result.errors[2].message.includes('foo'));
});

test('AggregateError with broken Error objects', t => {
	const brokenError = new Error('Original message');
	brokenError.name = '';
	brokenError.message = '';
	brokenError.stack = '';

	const aggregateError = new AggregateError([brokenError, 'string error'], 'Mixed errors');
	const result = ensureError(aggregateError);

	t.is(result.errors[0].name, 'Error');
	t.is(result.errors[0].message, '<No error message>');
	t.truthy(result.errors[0].stack);

	t.is(result.errors[1].name, 'NonError');
	t.is(result.errors[1].message, '\'string error\'');
});

test('nested AggregateErrors', t => {
	const innerAggregate = new AggregateError(['inner error'], 'Inner aggregate');
	const outerAggregate = new AggregateError([innerAggregate, 'outer error'], 'Outer aggregate');

	const result = ensureError(outerAggregate);

	t.is(result.errors.length, 2);
	t.is(result.errors[0].name, 'AggregateError');
	t.is(result.errors[0].errors.length, 1);
	t.is(result.errors[0].errors[0].name, 'NonError');
	t.is(result.errors[0].errors[0].message, '\'inner error\'');

	t.is(result.errors[1].name, 'NonError');
	t.is(result.errors[1].message, '\'outer error\'');
});

test('AggregateError with cause property', t => {
	const aggregateError = new AggregateError(['error1', 'error2'], 'Multiple errors');
	aggregateError.cause = 'string cause';

	const result = ensureError(aggregateError);

	t.is(result.errors.length, 2);
	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '\'string cause\'');
});

test('regular error with errors array (not AggregateError)', t => {
	const error = new Error('Regular error with errors array');
	error.errors = ['error1', 42];

	const result = ensureError(error);

	t.is(result.name, 'Error');
	t.is(result.errors.length, 2);
	t.is(result.errors[0], 'error1'); // Should remain unchanged
	t.is(result.errors[1], 42); // Should remain unchanged
});

test('AggregateError with empty errors array', t => {
	const aggregateError = new AggregateError([], 'No errors');
	const result = ensureError(aggregateError);

	t.is(result.name, 'AggregateError');
	t.is(result.message, 'No errors');
	t.is(result.errors.length, 0);
});

test('AggregateError with null and undefined items', t => {
	const aggregateError = new AggregateError([null, undefined, 'error'], 'Mixed with nullish');
	const result = ensureError(aggregateError);

	t.is(result.errors.length, 3);
	t.is(result.errors[0].name, 'NonError');
	t.is(result.errors[0].message, 'null');
	t.is(result.errors[1].name, 'NonError');
	t.is(result.errors[1].message, 'undefined');
	t.is(result.errors[2].name, 'NonError');
	t.is(result.errors[2].message, '\'error\'');
});

test('deeply nested AggregateError chain', t => {
	const level3 = new AggregateError(['deep error'], 'Level 3');
	const level2 = new AggregateError([level3, 'middle error'], 'Level 2');
	const level1 = new AggregateError([level2, 'top error'], 'Level 1');

	const result = ensureError(level1);

	t.is(result.errors.length, 2);
	t.is(result.errors[0].name, 'AggregateError');
	t.is(result.errors[0].errors.length, 2);
	t.is(result.errors[0].errors[0].name, 'AggregateError');
	t.is(result.errors[0].errors[0].errors.length, 1);
	t.is(result.errors[0].errors[0].errors[0].name, 'NonError');
	t.is(result.errors[0].errors[0].errors[0].message, '\'deep error\'');
});

test('AggregateError with both cause and errors', t => {
	const aggregateError = new AggregateError(['error1', 'error2'], 'Multiple issues');
	aggregateError.cause = 'root cause';

	const result = ensureError(aggregateError);

	t.is(result.errors.length, 2);
	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '\'root cause\'');
});

test('custom error with both cause and errors properties', t => {
	class CustomError extends Error {
		constructor(message) {
			super(message);
			this.name = 'CustomError';
		}
	}

	const error = new CustomError('Custom error with both');
	error.cause = 'string cause';
	error.errors = ['error1', 42];

	const result = ensureError(error);

	t.is(result.name, 'CustomError');
	t.is(result.cause.name, 'NonError');
	t.is(result.errors.length, 2);
	t.is(result.errors[0], 'error1'); // Should remain unchanged (not AggregateError)
	t.is(result.errors[1], 42); // Should remain unchanged (not AggregateError)
});

test('AggregateError with circular reference in errors array', t => {
	const error1 = new Error('Error 1');
	const error2 = new Error('Error 2');
	error1.cause = error2;
	error2.cause = error1;

	const aggregateError = new AggregateError([error1, 'string error'], 'Circular in errors');
	const result = ensureError(aggregateError);

	t.is(result.errors.length, 2);
	t.is(result.errors[0].message, 'Error 1');
	t.is(result.errors[0].cause.message, 'Error 2');
	t.is(result.errors[0].cause.cause.message, 'Error 1');
	// Should not infinite loop
	t.pass();
});

test('error with errors property that is not an array', t => {
	const error = new Error('Error with invalid errors property');
	error.errors = 'not an array';

	const result = ensureError(error);

	t.is(result.name, 'Error');
	t.is(result.errors, 'not an array'); // Should be preserved as-is
});

test('error with .cause being an AggregateError', t => {
	const aggregateCause = new AggregateError(['nested error1', 'nested error2'], 'Aggregate cause');
	const error = new Error('Main error');
	error.cause = aggregateCause;

	const result = ensureError(error);

	t.is(result.name, 'Error');
	t.is(result.message, 'Main error');
	t.is(result.cause.name, 'AggregateError');
	t.is(result.cause.message, 'Aggregate cause');
	t.is(result.cause.errors.length, 2);
	t.is(result.cause.errors[0].name, 'NonError');
	t.is(result.cause.errors[0].message, '\'nested error1\'');
	t.is(result.cause.errors[1].name, 'NonError');
	t.is(result.cause.errors[1].message, '\'nested error2\'');
});

test('AggregateError.errors[0].cause being a string', t => {
	const errorWithStringCause = new Error('Error with string cause');
	errorWithStringCause.cause = 'string cause value';

	const aggregateError = new AggregateError([errorWithStringCause, 'simple error'], 'Aggregate with nested causes');
	const result = ensureError(aggregateError);

	t.is(result.errors.length, 2);
	t.is(result.errors[0].name, 'Error');
	t.is(result.errors[0].message, 'Error with string cause');
	t.is(result.errors[0].cause.name, 'NonError');
	t.is(result.errors[0].cause.message, '\'string cause value\'');
	t.is(result.errors[1].name, 'NonError');
	t.is(result.errors[1].message, '\'simple error\'');
});

test('complex nesting: Error → cause: AggregateError → errors[0]: Error → cause: string', t => {
	const deepError = new Error('Deep error');
	deepError.cause = 'deep string cause';

	const aggregateCause = new AggregateError([deepError, 42], 'Aggregate in cause chain');
	const mainError = new Error('Main error');
	mainError.cause = aggregateCause;

	const result = ensureError(mainError);

	t.is(result.message, 'Main error');
	t.is(result.cause.name, 'AggregateError');
	t.is(result.cause.errors.length, 2);
	t.is(result.cause.errors[0].name, 'Error');
	t.is(result.cause.errors[0].message, 'Deep error');
	t.is(result.cause.errors[0].cause.name, 'NonError');
	t.is(result.cause.errors[0].cause.message, '\'deep string cause\'');
	t.is(result.cause.errors[1].name, 'NonError');
	t.is(result.cause.errors[1].message, '42');
});

test('AggregateError with both errors containing causes and its own cause', t => {
	const error1 = new Error('First error');
	error1.cause = 'first cause';

	const error2 = new Error('Second error');
	error2.cause = 'second cause';

	const aggregateError = new AggregateError([error1, error2], 'Multiple errors with causes');
	aggregateError.cause = 'aggregate root cause';

	const result = ensureError(aggregateError);

	t.is(result.cause.name, 'NonError');
	t.is(result.cause.message, '\'aggregate root cause\'');
	t.is(result.errors.length, 2);
	t.is(result.errors[0].cause.name, 'NonError');
	t.is(result.errors[0].cause.message, '\'first cause\'');
	t.is(result.errors[1].cause.name, 'NonError');
	t.is(result.errors[1].cause.message, '\'second cause\'');
});

test('nested AggregateErrors with cross-referencing causes', t => {
	const innerAggregate = new AggregateError(['inner error'], 'Inner aggregate');
	const outerAggregate = new AggregateError([innerAggregate, 'outer error'], 'Outer aggregate');
	outerAggregate.cause = innerAggregate; // Cause points to one of its own errors

	const result = ensureError(outerAggregate);

	t.is(result.errors.length, 2);
	t.is(result.cause.name, 'AggregateError');
	t.is(result.cause.message, 'Inner aggregate');
	// The cause should be the same object as errors[0] due to circular reference handling
	t.is(result.cause, result.errors[0]);
});

test('AggregateError with errors that have both cause and errors properties', t => {
	const complexError = new Error('Complex error');
	complexError.cause = 'string cause';
	complexError.errors = ['nested error1', 'nested error2'];

	const aggregateError = new AggregateError([complexError, 'simple error'], 'Aggregate with complex error');
	const result = ensureError(aggregateError);

	t.is(result.errors.length, 2);
	t.is(result.errors[0].name, 'Error');
	t.is(result.errors[0].cause.name, 'NonError');
	t.is(result.errors[0].cause.message, '\'string cause\'');
	t.is(result.errors[0].errors.length, 2);
	t.is(result.errors[0].errors[0], 'nested error1'); // Should remain unchanged (not AggregateError)
	t.is(result.errors[0].errors[1], 'nested error2'); // Should remain unchanged (not AggregateError)
});

test('very deep AggregateError and cause chain mixture', t => {
	let currentError = new Error('Level 0');
	currentError.cause = 'level 0 cause';

	// Create 5 levels of mixed AggregateError and cause chains
	for (let i = 1; i <= 5; i++) {
		if (i % 2 === 1) {
			// Odd levels: use AggregateError
			const aggregate = new AggregateError([currentError, `level ${i} error`], `Level ${i} aggregate`);
			aggregate.cause = `level ${i} cause`;
			currentError = aggregate;
		} else {
			// Even levels: use regular error with cause
			const error = new Error(`Level ${i} error`);
			error.cause = currentError;
			currentError = error;
		}
	}

	const result = ensureError(currentError);
	t.truthy(result);
	t.is(result.name, 'AggregateError'); // Level 5 is odd, so AggregateError
	t.is(result.message, 'Level 5 aggregate');
	t.truthy(result.errors);
	t.truthy(result.cause);
	// Should not hang or throw - that's the main test
	t.pass();
});

test('AggregateError with broken errors that have broken causes', t => {
	const brokenError1 = new Error('Broken 1');
	brokenError1.name = '';
	brokenError1.message = '';
	brokenError1.stack = '';
	brokenError1.cause = ''; // Empty string cause

	const brokenError2 = new Error('Broken 2');
	brokenError2.name = '';
	brokenError2.message = '';
	brokenError2.stack = '';
	brokenError2.cause = null;

	const aggregateError = new AggregateError([brokenError1, brokenError2], 'Aggregate with broken errors');
	const result = ensureError(aggregateError);

	t.is(result.errors.length, 2);

	// First error should be fixed
	t.is(result.errors[0].name, 'Error');
	t.is(result.errors[0].message, '<No error message>');
	t.truthy(result.errors[0].stack);
	t.is(result.errors[0].cause.name, 'NonError');
	t.is(result.errors[0].cause.message, '\'\''); // Empty string converted to NonError

	// Second error should be fixed
	t.is(result.errors[1].name, 'Error');
	t.is(result.errors[1].message, '<No error message>');
	t.truthy(result.errors[1].stack);
	t.is(result.errors[1].cause, null); // Null cause preserved
});

test('error with no constructor', t => {
	const error = new Error('Test');
	error.constructor = null;
	error.name = '';

	const result = ensureError(error);

	t.is(result.name, 'Error'); // Should default to 'Error' when constructor is null
	t.is(result.message, 'Test');
});

test('error with undefined cause vs missing cause property', t => {
	const errorWithUndefinedCause = new Error('Test 1');
	errorWithUndefinedCause.cause = undefined;

	const errorWithMissingCause = new Error('Test 2');
	// No cause property set

	const result1 = ensureError(errorWithUndefinedCause);
	const result2 = ensureError(errorWithMissingCause);

	t.is(result1.cause, undefined);
	t.false('cause' in result2 || result2.cause !== undefined);
});

test('large AggregateError performance', t => {
	// Create AggregateError with many items to test performance
	const largeArray = Array.from({length: 1000}, (_, i) => `error ${i}`);
	const aggregateError = new AggregateError(largeArray, 'Large aggregate');

	const start = Date.now();
	const result = ensureError(aggregateError);
	const duration = Date.now() - start;

	t.is(result.errors.length, 1000);
	t.true(duration < 1000); // Should complete in reasonable time (< 1 second)
	t.true(result.errors.every(error => error.name === 'NonError'));
});

test('AggregateError subclass with errors array', t => {
	class CustomAggregateError extends AggregateError {
		constructor(errors, message) {
			super(errors, message);
			this.name = 'CustomAggregateError';
		}
	}

	const customAggregate = new CustomAggregateError(['string error', 42], 'Custom aggregate error');
	const result = ensureError(customAggregate);

	t.is(result.name, 'CustomAggregateError');
	t.is(result.message, 'Custom aggregate error');
	t.is(result.errors.length, 2);
	t.is(result.errors[0].name, 'NonError');
	t.is(result.errors[0].message, '\'string error\'');
	t.is(result.errors[1].name, 'NonError');
	t.is(result.errors[1].message, '42');
	t.true(result instanceof CustomAggregateError);
	t.true(result instanceof AggregateError);
});

test('contrast: AggregateError vs regular Error with errors array', t => {
	// AggregateError: errors should be processed
	const aggregateError = new AggregateError(['raw string', 42], 'Aggregate');
	const aggregateResult = ensureError(aggregateError);

	t.is(aggregateResult.errors[0].name, 'NonError'); // Processed
	t.is(aggregateResult.errors[1].name, 'NonError'); // Processed

	// Regular Error with errors array: errors should NOT be processed
	const regularError = new Error('Regular error');
	regularError.errors = ['raw string', 42];
	const regularResult = ensureError(regularError);

	t.is(regularResult.errors[0], 'raw string'); // NOT processed
	t.is(regularResult.errors[1], 42); // NOT processed
});
