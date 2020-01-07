'use strict';
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Sentry = require('@sentry/node');
const Env = use("Env");
const exceptionHandler = new (use("App/Exceptions/Handler"));

Sentry.init({ dsn: Env.get('SENTRY_DSN') });

class SentryMiddleware {
    /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
    async handle ({ request, response, auth }, next) {
        // call next to advance the request

        try {
            await next();
        }
        catch (e) {
            // console.log(e);

            if(!e || !e.status || e.status != 401 && e.status != 200 ) {
                Sentry.withScope(scope => {
                    if(auth && auth.user) {
                        scope.setUser(auth.user.toJSON());
                    }
                    else {
                        scope.setUser(null);
                    }
    
                    scope.setContext('request', {
                        'url' : request.url(),
                        'host' : request.hostname(),
                        'ip' : request.ip(),
                        'method' : request.method(),
                        'body' : request.post(),
                    });

                    if(e.status < 500) {
                        scope.setLevel(Sentry.Severity.Info);
                    }

                    // console.log(scope);

                    Sentry.captureException(e);
                });
            }

            return exceptionHandler.handle(e, arguments[0]);
        }
    }
}

module.exports = SentryMiddleware;
