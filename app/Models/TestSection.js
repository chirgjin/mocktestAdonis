'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class TestSection extends Model {

    static get hidden() {
        return [];
    }

    static get computed() {
        return ['isLocked']
    }

    test() {
        return this.belongsTo("App/Models/Test");
    }

    questions() {
        return this
        .belongsToMany("App/Models/Question")
        .pivotTable('test_section_questions')
    }

    getIsLocked({duration}) {
        duration = parseFloat(duration);
        return duration && duration > 0;
    }
}

module.exports = TestSection
