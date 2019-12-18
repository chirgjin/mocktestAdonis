const { hooks } = require('@adonisjs/ignitor')
const {ioc} = require("@adonisjs/fold");
const VanillaSerializer = require("@adonisjs/lucid/src/Lucid/Serializers/Vanilla");
ioc.bind("VanillaSerializer", () => {
    return VanillaSerializer;
});

// hooks.after.preloading(() => {

//     const proxy = require("@adonisjs/lucid/src/Lucid/Model/proxyHandler");
//     const get = proxy.get;
//     const Model = use("Model");

//     proxy.get = function (target, name) {
        
//         if(target && target instanceof Model && typeof name == 'string' && name !== 'inspect') {

//             const fn = 'get' + name.substr(0,1).toUpperCase() + name.substr(1);
//             if(typeof target[fn] == 'function') {
//                 return target[fn]( Array.isArray(target.constructor.computed) && target.constructor.computed.indexOf(name) != -1 ? target.$attributes : get(target, name));
//             }
//         }

//         return get(target, name);
//     };
// });

hooks.after.preloading(() => {
    // return 
    const _ = require("lodash")

    const proxy = require("@adonisjs/lucid/src/Lucid/Model/proxyHandler");
    const proxyGet = require("@adonisjs/lucid/lib/proxyGet")

    proxy.get = proxyGet('$attributes', false, function (target, name) {
        if (typeof (target.$sideLoaded[name]) !== 'undefined') {
          return target.$sideLoaded[name]
        } else if (typeof (target.constructor.computed) === 'object' && Array.isArray(target.constructor.computed) && target.constructor.computed.indexOf(name) > -1) {
          /**
         * Check if name exists in computed properties
         * if it does then convert it to camelCase & call the getName($attributes) function
         */
          return target[_.camelCase('get_' + name)](target.$attributes)
        } else if (typeof (target.$attributes[name]) !== 'undefined' && typeof (target[_.camelCase('get_' + name)]) === 'function') {
          /**
           * Check if name exists in $attribute and function getName() exists
           * If it does then convert it to camelCase & call the getName(attributeValue) function
           */
          return target[_.camelCase('get_' + name)](target.$attributes[name])
        }
      })
      
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

        if(data instanceof VanillaSerializer) {
            removePivot(data);
        }
        else if(data instanceof use("Model")){
            removePivot({rows : [data]})
        }
        
        return this.json({
            success: true,
            data: data,
        });

    });

    const _ = require("lodash")

    const Worksheet = require("excel4node/distribution/lib/worksheet/worksheet")

    Worksheet.prototype.addFromKeys = function (obj, keys, {rowOff=0, colOff=0}) {
        // if(Array.isArray(obj)) {
        //     return obj.forEach( (ob,i) => {
        //         this.addFromKeys(ob, keys, rowOff+i, colOff)
        //     })
        // }

        keys.forEach( (key, col) => {
            const val = _.get(obj, key)
            const type = typeof val == 'number' ? 'number' : 'string'
            this
            .cell(rowOff+1, col+1+colOff)[type](typeof val == 'number' ? val : (val || ''))
        })
    }

    const xl = require("excel4node")

    xl.Workbook.prototype.send = async function (fileName, response) {
        const buff = await this.writeToBuffer()

        if(!fileName.match(/\.xlsx$/i)) {
            fileName += ".xlsx";
        }
        
        response.header('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"; filename*=utf-8\'\'' + encodeURIComponent(fileName) + ';')
        response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        // response.header('Content-Length', buff)

        response.send(buff)
    }
});

function removePivot(data) {

    data.rows.forEach(obj => {
        if(!obj.$relations) {
            return ;
        }

        if(obj.$relations.pivot) {
            delete obj.$relations.pivot;
        }

        for(let relation in obj.$relations) {
            if(obj.$relations[relation] instanceof VanillaSerializer) {
                removePivot(obj.$relations[relation])
            }
        }
    });
}