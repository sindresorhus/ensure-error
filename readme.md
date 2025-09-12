# ensure-error

> Ensures a value is a valid error by making it one if not

Pass it any value and you are guaranteed to get back an `Error` with `name`, `message`, and `stack` properties.

If the error has a `.cause` property, it will be recursively ensured to be a valid error too. If the error is an `AggregateError`, all items in the errors array will also be recursively ensured to be valid errors.

Can be useful when you don't control all the places an error can be thrown or rejected. A user could for example throw a string or an error without a `stack` property.

## Install

```sh
npm install ensure-error
```

## Usage

```js
import ensureError from 'ensure-error';

const error = new TypeError('🦄');
error.name = '';

console.log(error.name);
//=> ''

console.log(ensureError(error).name);
//=> 'TypeError'
```

```js
import ensureError from 'ensure-error';

console.log(ensureError(10));
//=> [NonError: 10]
```

```js
import ensureError from 'ensure-error';

const error = new Error('Something went wrong');
error.cause = 'A string cause'; // Not a proper error

const result = ensureError(error);
console.log(result.cause);
//=> [NonError: 'A string cause']
```

```js
import ensureError from 'ensure-error';

const aggregateError = new AggregateError(['error1', 42], 'Multiple errors');

const result = ensureError(aggregateError);
console.log(result.errors[0]);
//=> [NonError: 'error1']
console.log(result.errors[1]);
//=> [NonError: 42]
```

## API

### ensureError(input)

Ensures the input is a valid error.

If `input` is an `Error`, any missing `Error` properties will be added. If the error has a `.cause` property, it will be recursively ensured to be a valid error too. If the error is an `AggregateError`, all items in the errors array will also be recursively ensured to be valid errors. If it's not an `Error`, `input` is converted to an `Error`.

#### input

Type: `unknown`
