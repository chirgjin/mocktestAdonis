'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class Exam extends Model {

    static get hidden() {
        return []
    }
    
    sections() {
        return this
        .belongsToMany('App/Models/ExamSection')
        .pivotTable('exam_section_list')
    }

    tests() {
        return this.hasMany('App/Models/Test')
    }

    users() {
        return this
        .belongsToMany('App/Models/User')
        // .pivotTable('user_exams')
        .pivotModel('App/Models/UserExam')
    }

}

module.exports = Exam
