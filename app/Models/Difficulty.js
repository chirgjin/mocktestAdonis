'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");

class Difficulty extends Model {
    static get primaryKey() {
        return 'name';
    }
    static get incrementing () {
        return false;
    }

    static boot() {
        super.boot();

        this.addTrait('NoTimestamp');
    }
}

module.exports = Difficulty;
