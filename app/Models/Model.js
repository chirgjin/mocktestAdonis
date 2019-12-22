'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const _Model = use('Model');

const _ = require("lodash")

const getName = prop => prop.substr(0,1).toUpperCase() + prop.substr(1);

class Model extends _Model {

    /**
     * @returns {Object} Key => value pair of datatypes
     */
    static get dataTypes() {
        return {}
    }

    static boot() {
        super.boot()

        
        if(this.dataTypes) {
            
            for(let key in this.dataTypes) {
                const camelCaseName = _.camelCase("get_" + key)

                const originalFn = this[camelCaseName]

                this[camelCaseName] = data => {
                    if(typeof(this.dataTypes[key]) === 'function') {
                        this.dataTypes[key].call(this, data)
                    }
                    else {
                        switch(this.dataTypes[key].toLowerCase()) {
                            case "string":
                            case "str":
                                data = _.toString(data)
                                break;
                            case "int":
                            case "integer":
                                data = _.toInteger(data)
                                break;
                            case "float":
                            case "double":
                            case "number":
                                data = _.toNumber(data)
                                break;
                            case "bool":
                            case "boolean":
                                data = !!data
                                break;
                            // case "parsejson":
                            //     data = data && typeof data == 'object' ? data : JSON.parse(data)
                        }
                    }

                    return typeof originalFn === 'function' ? originalFn.call(this, data) : data
                }
            }
        }
    }
}

module.exports = Model;