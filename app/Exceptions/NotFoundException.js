'use strict'

const { LogicalException } = require('@adonisjs/generic-exceptions')

class NotFoundException extends LogicalException {
    /**
    * Handle this exception by itself
    */
    // handle () {}

    constructor(prop) {
        super(`${prop} was not found`, 404, 'E_NOT_FOUND');
        this.field = prop;
    }
}

module.exports = NotFoundException
