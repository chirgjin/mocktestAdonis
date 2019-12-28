'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");

class TestSectionQuestion extends Model {
    // static get primaryKey() {
    //     return 'name';
    // }
    // static get incrementing () {
    //     return false
    // }

    static boot() {
        super.boot();

        this.addTrait('NoTimestamp');
    }

    question() {
        return this
            .belongsTo('App/Models/Question');
    }

    section() {
        return this
            .belongsTo('App/Models/TestSection');
    }

    tests() {
        return this
            .belongsToMany('App/Models/Test', 'id', 'test_id', 'test_section_id', 'id')
            .pivotTable('test_sections');
    }

    exams() {
        return this
            .manyThrough('App/Models/TestSection', 'exams', 'test_section_id', 'id');
    }

    answers() {
        return this
            .hasMany('App/Models/UserAnswer', 'question_id', 'question_id');
    }
}

module.exports = TestSectionQuestion;
