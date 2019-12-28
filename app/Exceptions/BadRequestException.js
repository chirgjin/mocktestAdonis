'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class BadRequestException extends LogicalException {
    /**
    * Handle this exception by itself
    */
    // handle () {}

    constructor(prop, message='The request data was insufficient or invalid') {
        super(message, 400, 'E_BAD_REQUEST');
        this.field = prop;
    }
}

module.exports = BadRequestException;
