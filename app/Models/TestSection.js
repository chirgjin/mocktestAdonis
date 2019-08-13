'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class TestSection extends Model {

    static scopeOrderByNum(query) {
        return query.orderBy('number', 'ASC');
    }
    
    static get hidden() {
        return [];
    }

    static get computed() {
        return ['isLocked']
    }

    test() {
        return this.belongsTo("App/Models/Test");
    }

    exams() {
        return this
        .manyThrough('App/Models/Test', 'exam', 'test_id', 'id')
    }

    questions() {
        return this
        .belongsToMany("App/Models/Question")
        .pivotTable('test_section_questions')
    }

    answers() {
        return this
        .manyThrough('App/Models/TestSectionQuestion', 'answers')
    }

    getIsLocked({duration}) {
        duration = parseFloat(duration);
        return !!(duration && duration > 0);
    }
}

module.exports = TestSection
