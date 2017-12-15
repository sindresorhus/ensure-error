import test from 'ava';
import m from '.';

test('error', t => {
	const err = new Error('🦄');
	const f = m(err);
	t.is(f.name, 'Error');
	t.is(f.message, '🦄');
	t.regex(f.stack, /🦄/);
	t.regex(f.stack, / at /);
});

test('error - missing name', t => {
	const err = new TypeError('🦄');
	err.name = '';
	const f = m(err);
	t.is(f.name, 'TypeError');
	t.is(f.message, '🦄');
	t.regex(f.stack, / at /);
});

test('error - missing message', t => {
	const err = new Error('🦄');
	err.message = '';
	const f = m(err);
	t.is(f.name, 'Error');
	t.is(f.message, '<No error message>');
	t.regex(f.stack, / at /);
});

test('error - missing stack', t => {
	const err = new Error('🦄');
	err.stack = '';
	const f = m(err);
	t.is(f.name, 'Error');
	t.is(f.message, '🦄');
	t.true(f.stack.startsWith('Error: 🦄\n<Original stack missing>\n    at '), f.stack);
});

test('number', t => {
	const f = m(5);
	t.is(f.name, 'NonError');
	t.is(f.message, '5');
	t.regex(f.stack, / at /);
});

test('string', t => {
	const f = m('🌈');
	t.is(f.name, 'NonError');
	t.is(f.message, '\'🌈\'');
	t.regex(f.stack, / at /);
});

test('object', t => {
	const f = m({foo: true});
	t.is(f.name, 'NonError');
	t.is(f.message, '{ foo: true }');
	t.regex(f.stack, / at /);
});

test('undefined', t => {
	const f = m(undefined);
	t.is(f.name, 'NonError');
	t.is(f.message, 'undefined');
	t.regex(f.stack, / at /);
});
