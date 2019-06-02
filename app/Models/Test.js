'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Test extends Model {
    static get hidden() {
        return ['enabled', 'options', 'created_by'];
    }

    exam() {
        return this.belongsTo('App/Models/Exam');
    }

    examSection() {
        return this.belongsTo('App/Models/ExamSection');
    }

    createdBy() {
        return this.belongsTo('App/Models/User', 'created_by');
    }

    sections() {
        return this.hasMany('App/Models/TestSection');
    }
}

module.exports = Test
