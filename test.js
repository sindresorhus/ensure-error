import test from 'ava';
import ensureError from '.';

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
	t.true(result.stack.startsWith('Error: 🦄\n<Original stack missing>\n    at '), result.stack);
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
	t.is(result.message, '{ foo: true }');
	t.regex(result.stack, / at /);
});

test('undefined', t => {
	const result = ensureError(undefined);
	t.is(result.name, 'NonError');
	t.is(result.message, 'undefined');
	t.regex(result.stack, / at /);
});
