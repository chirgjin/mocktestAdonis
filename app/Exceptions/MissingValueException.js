'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class MissingValueException extends LogicalException {
    /**
    * Handle this exception by itself
    */
    // handle () {}

    constructor(prop) {
        super(`${prop} is required`, 400, 'E_MISSING_VALUE');
        this.field = prop;
    }
}

module.exports = MissingValueException;
