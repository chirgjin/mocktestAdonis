'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")
const calculateMarks = use("App/Helpers/calculateMarks");
class UserTest extends Model {

    static boot () {
        super.boot()
        
        /**
        * A hook to hash the user password before saving
        * it to the database.
        */

        this.addHook('beforeSave', async (userTest) => {

            if (userTest.dirty.status == UserTest.COMPLETED) {
                
                userTest.completed_at = new Date()

                const answers = await userTest.answers().fetch();
                const test = userTest.getRelated('test') || await userTest.test().first();

                userTest.marks_obtained = calculateMarks(test, answers)

                // answers.rows.forEach(answer => {
                //     userTest.marks_obtained += calculateMarks(test, answer)
                // });

            }
        })
    }

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

    testSection() {
        return this.belongsTo('App/Models/TestSection');
    }

    sectionsAttempted() {
        return this
        .belongsToMany('App/Models/TestSection')
        .pivotTable('user_test_sections');
    }

    answers() {
        return this.hasMany('App/Models/UserAnswer');
    }


    static async attemptOrFail(userTest, testSection) {

        const { PermissionDeniedException, BadRequestException} = use("App/Exceptions")

        if(userTest.status != UserTest.ONGOING) {
            throw new BadRequestException('user_test', `This test has been marked as paused/completed`)
        }

        if(!testSection) {
            throw new PermissionDeniedException(`This question does not belong to given test id`)
        }

        if(!userTest.$relations.sectionsAttempted) {
            await userTest.load('sectionsAttempted')
        }

        if(!userTest.$relations.test) {
            await userTest.load('test')
        }

        const sectionsAttempted = userTest.getRelated('sectionsAttempted')
        const test = userTest.getRelated('test')
        const hasAttempted = sectionsAttempted.rows.filter(section => section.id == testSection.id).length > 0

        if(testSection.isLocked) {
            if(userTest.test_section_id && testSection.id != userTest.test_section_id && hasAttempted) {
                throw new BadRequestException('test_section', `This section has been locked and questions from this test can not be answered any longer`)
            }
        }

        if(userTest.time_taken >= test.duration) {
            throw new PermissionDeniedException(`The test time has been taken up`)
        }

        if(!hasAttempted) {
            await userTest.sections().attach(testSection)
        }

        userTest.test_section_id = testSection.id;

        return { hasAttempted }

    }
}

module.exports = UserTest
