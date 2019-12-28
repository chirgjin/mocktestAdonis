'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");

class UserExam extends Model {
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

    exam() {
        return this
            .belongsTo('App/Models/Exam');
    }

    user() {
        return this
            .belongsTo('App/Models/User');
    }

    tests() {
        return this
            .hasMany('App/Models/Test', 'exam_id', 'exam_id');
    }

    sections() {
        return this
            .belongsToMany('App/Models/ExamSection', 'exam_id', 'exam_section_id', 'exam_id', 'id')
            .pivotTable('exam_section_list');
    }
}

module.exports = UserExam;
