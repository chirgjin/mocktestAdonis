'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class PermissionDeniedException extends LogicalException {
    /**
    * Handle this exception by itself
    */
    // handle () {}
    
    constructor(message='You do not have permission to access this resource') {
        super(message, 403, 'E_PERIMSSION_DENIED');
    }
}

module.exports = PermissionDeniedException;
