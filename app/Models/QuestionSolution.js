'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class QuestionSolution extends Model {

    static get hidden() {
        return ['id'];
    }

    static boot() {
        super.boot();

        this.addTrait('NoTimestamp');
    }

    question() {
        return this.belongsTo('App/Models/Question');
    }

    images() {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .where('type', 'questionSolution')
    }

    createImage(obj) {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .create(Object.assign(obj, {type : 'questionSolution'}));
    }

}

module.exports = QuestionSolution
