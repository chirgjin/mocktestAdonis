const { hooks } = require('@adonisjs/ignitor')

hooks.after.preloading(() => {

    const proxy = require("@adonisjs/lucid/src/Lucid/Model/proxyHandler");
    const get = proxy.get;
    const Model = use("Model");

    proxy.get = function (target, name) {
        
        if(target && target instanceof Model && typeof name == 'string' && name !== 'inspect') {

            const fn = 'get' + name.substr(0,1).toUpperCase() + name.substr(1);
            if(typeof target[fn] == 'function') {
                return target[fn]( Array.isArray(target.constructor.computed) && target.constructor.computed.indexOf(name) != -1 ? target.$attributes : get(target, name));
            }
        }

        return get(target, name);
    };
});

hooks.after.providersBooted(() => {

    const Response = use('Adonis/Src/Response')

    Response.macro('error', function (errors, status=400) {
        if(!Array.isArray(errors)) {
            if(typeof errors == 'string' || typeof errors == 'number') {
                errors = { message: errors };
            }

            errors = typeof errors == 'boolean' || !errors ? errors : [errors];
        }

        return this.status(status).json({
            success: false,
            errors: errors,
            status : status,
        });

    });

    Response.macro('success', function (data) {

        return this.json({
            success: true,
            data: data,
        });

    });
});