'use strict';

const BaseExceptionHandler = use('BaseExceptionHandler');

/**
* This class handles all exceptions thrown during
* the HTTP request lifecycle.
*
* @class ExceptionHandler
*/
class ExceptionHandler extends BaseExceptionHandler {
    /**
    * Handle exception thrown during the HTTP lifecycle
    *
    * @method handle
    *
    * @param  {Object} error
    * @param  {Object} options.request
    * @param  {Object} options.response
    *
    * @return {void}
    */
    async handle (error, { request, response }) {

        if(error.code == 'E_ROUTE_NOT_FOUND') {
            return super.handle(error, {request, response});
        }
        else if(error.code == 'E_PASSWORD_MISMATCH' || error.code == 'E_USER_NOT_FOUND') {
            return super.handle.apply(this, arguments);
        }


        if(error.field) {
            error = {
                status : error.status,
                message : {
                    message : error.message,
                    field : error.field
                }
            };
        }
        
        return response.error(error.messages||error.message, error.status||400);
    }
    
    /**
    * Report exception for logging or debugging.
    *
    * @method report
    *
    * @param  {Object} error
    * @param  {Object} options.request
    *
    * @return {void}
    */
    async report (error, { request }) {
        // console.log(error);
    }
}

module.exports = ExceptionHandler;
