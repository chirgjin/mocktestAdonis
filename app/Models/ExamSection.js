'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class ExamSection extends Model {

    static get hidden() {
        return [];
    }

    exams() {
        return this
        .belongsToMany('App/Models/Exam')
        .pivotTable('exam_section_list')
    }
}

module.exports = ExamSection
