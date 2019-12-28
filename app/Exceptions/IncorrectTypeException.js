'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class IncorrectTypeException extends LogicalException {
    /**
    * Handle this exception by itself
    */
    // handle () {}

    constructor(prop, expectedType, gotType) {
        let msg = `${prop} must be of type ${expectedType}`;
        if(gotType) {
            msg += ` but got ${gotType}`;
        }

        super(msg, 400, 'E_INCORRECT_TYPE');
        
        this.field = prop;
    }
}

module.exports = IncorrectTypeException;
