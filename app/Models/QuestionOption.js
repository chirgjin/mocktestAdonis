'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");

class QuestionOption extends Model {
    static get hidden() {
        return [];
    }

    question() {
        return this.belongsTo('App/Models/Question');
    }

    images() {
        return this
            .hasMany('App/Models/Image', 'id', 'reference_id')
            .where('type', 'questionOption');
    }

    createImage(obj) {
        return this
            .hasMany('App/Models/Image', 'id', 'reference_id')
            .create(Object.assign(obj, {type : 'questionOption'}));
    }
}

module.exports = QuestionOption;
