'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class UserAnswer extends Model {

    static get hidden() {
        return ['correct'];
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

    test() {
        return this
        .manyThrough('App/Models/UserTest', 'test');
    }

    
}

module.exports = UserAnswer
