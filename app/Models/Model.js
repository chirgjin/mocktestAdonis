'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const _Model = use('Model');

const getName = prop => prop.substr(0,1).toUpperCase() + prop.substr(1);

class Model extends _Model {

    constructor() {

        const ret = super(...arguments);

        const computed = this.constructor.computed;
        const getters = this.constructor.getters;
        const setters = this.constructor.setters;

        if(Array.isArray(computed)) {
            computed.forEach(prop => {
                delete this[prop];
                Object.defineProperty(this, prop, {
                    get() {
                        return this["get" + getName(prop)](this.$attributes);
                    },
                    set(value) {
                        return typeof this["set" + getName(prop)] == 'function' ? this["set" + getName(prop)](this.$attributes, value) : null;
                    }
                });
            });
        }

        if(Array.isArray(getters)) {
            getters.forEach(prop => {

                delete this[prop];

                Object.defineProperty(this, prop, {
                    get() {
                        return this[`get${getName(prop)}`](this.$attributes[prop]);
                    },
                    set(value) {
                        if(typeof this[`set${getName(prop)}`] == 'function') {
                            value = this[`set${getName(prop)}`](value);
                        }

                        this.dirty[prop] = this.$attributes[prop] = value;
                    }
                });
            });
        }

        if(Array.isArray(setters)) {
            setters.forEach(prop => {

                if(getters.indexOf(prop) != -1) {
                    return ;
                }

                delete this[prop];

                Object.defineProperty(this, prop, {
                    get() {
                        return this.$attributes[prop];
                    },
                    set(value) {
                        this.dirty[prop] = this.$attributes[prop] = this[`set${getName(prop)}`](value);
                    }
                });

            });
        }


        return ret;
    }
}

module.exports = Model;