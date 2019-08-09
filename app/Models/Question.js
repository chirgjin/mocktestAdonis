'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class Question extends Model {

    static scopeWithAll(query, ) {
        return query
        .with('direction')
        .with('options')
        // .with('images')
    }

    static get QUESTION_TYPES() {
        return {
            "1" : "MCQ",
            "2" : "Order",
            MCQ : 1,
            Order : 2,
            ORDER : 2,
        }
    }


    static get computed() {
        return ['prettyType'];
    }

    static get hidden() {
        return [];
    }

    getPrettyType({type}) {
        return Question.QUESTION_TYPES[type];
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
        // .pivotTable('test_section_questions')
        .pivotModel('App/Models/TestSectionQuestion')
    }

    tests() {
        return this
        .manyThrough('App/Models/TestSectionQuestion', 'tests', 'id', 'question_id')
    }

    // exams() {
    //     return this
    //     .manyThrough('App/Models/TestSectionQuestion', 'exams', 'id', 'question_id')
    // }

    images() {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .where('images.type', 'question')
    }

    createImage(obj) {
        return this
        .hasMany('App/Models/Image', 'id', 'reference_id')
        .create(Object.assign(obj, {type : 'question'}));
    }
}

module.exports = Question
