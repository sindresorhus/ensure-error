import {expectType} from 'tsd';
import ensureError = require('.');

const error = new TypeError('🦄');

expectType<TypeError>(ensureError(error));
expectType<ensureError.NonError>(ensureError(10));
