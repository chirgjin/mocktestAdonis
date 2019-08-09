'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class UserTest extends Model {

    static get hidden() {
        return [];
    }

    static get computed() {
        return ['prettyStatus']
    }

    static get ONGOING() {
        return 0;
    }

    static get SAVED() {
        return 1;
    }

    static get COMPLETED() {
        return 2;
    }

    static get statusCodes() {
        return [
            'OnGoing',
            'Saved',
            'Completed'
        ];
    }

    getPrettyStatus({status}) {
        return UserTest.statusCodes[status];
    }

    user() {
        return this.belongsTo('App/Models/User');
    }

    test() {
        return this.belongsTo('App/Models/Test');
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
