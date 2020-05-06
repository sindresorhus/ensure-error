import {expectType} from 'tsd';
import ensureError = require('.');

const error = new TypeError('🦄');

expectType<Error>(ensureError(10 as any));
expectType<TypeError>(ensureError(error));
expectType<ensureError.NonError>(ensureError(10));
