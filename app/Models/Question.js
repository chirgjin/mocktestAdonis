'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Question extends Model {

    static get hidden() {
        return ['answer', 'avg_time'];
    }

    direction() {
        return this.belongsTo('App/Models/QuestionDirection');
    }

    options() {
        return this.hasMany('App/Models/QuestionOption');
    }

    solution() {
        return this.hasOne('App/Models/QuestionSolution');
    }

    sections() {
        return this
        .belongsToMany('App/Models/TestSection')
        .pivotTable('test_section_questions')
    }

    images() {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .where('type', 'question')
    }

    createImage(obj) {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .create(Object.assign(obj, {type : 'question'}));
    }
}

module.exports = Question
