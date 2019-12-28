'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class WaitTimeException extends LogicalException {
    /**
    * Handle this exception by itself
    */
    // handle () {}
    
    constructor(timeLeft=-1) {
        super(null, 400, 'E_WAIT_TIME');
        this.message = {
            message : `You must wait for ${timeLeft} seconds`,
            waitTime : timeLeft,
        };
    }
}

module.exports = WaitTimeException;
