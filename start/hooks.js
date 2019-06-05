const { hooks } = require('@adonisjs/ignitor')

hooks.after.preloading(() => {

    const proxy = require("@adonisjs/lucid/src/Lucid/Model/proxyHandler");
    const get = proxy.get;

    proxy.get = function (target, name) {
        
        if(typeof name == 'string' && name !== 'inspect') {

            const fn = 'get' + name.substr(0,1).toUpperCase() + name.substr(1);
            if(typeof target[fn] == 'function') {
                return target[fn]( Array.isArray(target.computed) && target.computed.indexOf(name) != -1 ? target.$attributes : get(name));
            }
        }

        return get(target, name);
    };
});