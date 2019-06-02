'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserTest extends Model {

    static get hidden() {
        return [];
    }

    user() {
        return this.belongsTo('App/Models/User');
    }

    exam() {
        return this.belongsTo('App/Models/Exam');
    }

    examSection() {
        return this.belongsTo('App/Models/ExamSection');
    }

    sectionsAttempted() {
        return this
        .belongsToMany('App/Models/TestSection')
        .pivotTable('user_test_sections');
    }

    answers() {
        return this.hasMany('App/Models/UserAnswer');
    }
}

module.exports = UserTest
