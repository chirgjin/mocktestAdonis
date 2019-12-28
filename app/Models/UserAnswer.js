'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");

class UserAnswer extends Model {

    static get hidden() {
        return ['correct'];
    }
    
    static get getters() {
        return ['time_taken'];
    }

    getTimeTaken(time) {
        return parseFloat(time) || 0;
    }

    question() {
        return this.belongsTo('App/Models/Question');
    }

    userTest() {
        return this.belongsTo('App/Models/UserTest');
    }

    user() {
        return this
            .manyThrough('App/Models/UserTest', 'user');
    }

    tests() {
        return this
            .manyThrough('App/Models/UserTest', 'test');
    }

    
}

module.exports = UserAnswer;
