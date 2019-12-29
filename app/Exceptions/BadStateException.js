'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class BadStateException extends LogicalException {
    /**
   * Handle this exception by itself
   */
    // handle () {}

    constructor(prop, message='The action could not be performed as the resource integrity would be compromised') {
        super(message, 400, 'E_BAD_STATE');
        this.field = prop;
    }
}

module.exports = BadStateException;
