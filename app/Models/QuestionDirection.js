'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class QuestionDirection extends Model {

    static get hidden() {
        return ['id', 'created_at', 'updated_at']
    }

    questions() {
        return this.hasMany('App/Models/Question')
    }

    images() {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .where('type', 'questionDirection')
    }

    createImage(obj) {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .create(Object.assign(obj, {type : 'questionDirection'}));
    }
}

module.exports = QuestionDirection
