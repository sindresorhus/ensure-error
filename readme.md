# ensure-error

> Ensures a value is a valid error by making it one if not

Pass it any value and you're are guaranteed to get back an `Error` with `name`, `message`, and `stack` properties.

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

## API

### ensureError(input)

If `input` is an `Error`, any missing `Error` properties will be added. If it's not an `Error`, `input` is converted to an `Error`.

#### input

Type: `unknown`
