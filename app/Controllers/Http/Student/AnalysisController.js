'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const {UserTest, Test, TestSection, UserAnswer, Question} = use("App/Models");

const { PermissionDeniedException, NotFoundException, FieldException } = use("App/Exceptions");

const analysis = use("App/Helpers/analysis");

/**
* Resourceful controller for interacting with analysis
*/
class AnalysisController {
    
    /**
    * Display a single test analysis.
    * GET userTest/:user_test_id/analysis
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async test ({ params, response, auth }) {
        //

        const userTest = await auth.user
            .userTests()
            .where('user_tests.id', params.user_test_id)
            .with('test', builder => {
                builder.with('sections', builder => {
                    builder
                        .with('questions', builder => {
                            builder
                                .withAll()
                                .with('solution');
                        });
                // .with('answers', builder => {
                //     builder
                //     .where('user_answers.user_test_id', params.user_test_id)
                // })
                });
            })
            .first();

        if(!userTest) {
            throw new NotFoundException('UserTest');
        }
        else if(userTest.status != UserTest.COMPLETED) {
            throw new PermissionDeniedException(`Test must first be marked as completed!`);
        }

        const test = userTest.getRelated('test');

        const sections = test.getRelated('sections').rows;

        for(let section of sections) {

            //now calculate marks, incorrect, correct stats etc
            

            section.$relations.stats = await analysis(section, params.user_test_id);
        }


        const rankQuery = await UserTest.query().where('test_id', test.id).where('marks_obtained', '>', userTest.marks_obtained).getCount();

        userTest.rank = rankQuery + 1;

        response.success(userTest);
    }
}

module.exports = AnalysisController;
