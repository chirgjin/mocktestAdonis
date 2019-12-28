'use strict';

const { LogicalException } = require('@adonisjs/generic-exceptions');

class FieldException extends LogicalException {
    /**
     * Handle this exception by itself
     */
    // handle () {}
    
    constructor(field, message='', extra=null) {
        // super()
        super(message, 400, 'E_FIELD');

        this.message = message;
        this.field = field;

        this.extra = extra || {};
    }

    toJSON() {
        return Object.assign(this.extra, {
            message : this.message,
            field : this.field,
        });
    }
}

FieldException.Many = FieldException.many = class ManyFieldException extends LogicalException {
    constructor(obj) {
        if(!(obj instanceof Object)) {
            throw new LogicalException('Argument must be of type object', 500, 'E_ARG_TYPE');
        }

        super('', 400, 'E_MANY_FIELD');

        this.messages = [];

        Object.keys(obj).forEach(key => {
            this.messages.push({
                field : key,
                message : obj[key],
            });
        });
    }
};

module.exports = FieldException;
