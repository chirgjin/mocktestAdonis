'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class UserExamAnalysis extends Model {

    static get hidden() {
        return ['id'];
    }

    user() {
        return this.belongsTo('App/Models/User');
    }

    exam() {
        return this.belongsTo('App/Models/Exam');
    }

    getRank() {
        return this
        .query()
        .where('avg_percentage', '>', this.avg_percentage)
        .getCount()
        .then(ct => ct+1);
    }
}

module.exports = UserExamAnalysis
