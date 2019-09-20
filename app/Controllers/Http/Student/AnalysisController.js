'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const {UserTest, Test, TestSection, UserAnswer, Question} = use("App/Models");

const { PermissionDeniedException, NotFoundException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with analyses
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
    async test ({ params, request, response, auth }) {
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
                    .with('solution')
                })
                // .with('answers', builder => {
                //     builder
                //     .where('user_answers.user_test_id', params.user_test_id)
                // })
            })
        })
        .first();

        if(!userTest) {
            throw new NotFoundException('UserTest')
        }
        else if(userTest.status != UserTest.COMPLETED) {
            throw new PermissionDeniedException(`Test must first be marked as completed!`)
        }

        const test = userTest.getRelated('test')

        const sections = test.getRelated('sections').rows

        for(let section of sections) {

            //now calculate marks, incorrect, correct stats etc
            const baseQuery = () => section.answers().where('user_answers.user_test_id', params.user_test_id);

            const stats = {
                answers : {
                    incorrect : await baseQuery().where('user_answers.correct', false).whereNot('user_answers.answer', null).getCount(),
                    correct : await baseQuery().where('user_answers.correct', true).getCount(),
                    unattempted : await baseQuery().where('user_answers.answer', null).getCount(),
                },
                average_time : {
                    incorrect : (await baseQuery().where('user_answers.correct', false).whereNot('user_answers.answer', null).avg('time_taken as avg_time'))[0].avg_time,
                    correct : (await baseQuery().where('user_answers.correct', true).avg('time_taken as avg_time'))[0].avg_time,
                    unattempted : (await baseQuery().where('user_answers.answer', null).avg('time_taken as avg_time'))[0].avg_time,
                },
                total_time : (await baseQuery().sum('time_taken as total_time'))[0].total_time,
            }

            section.$relations.stats = stats;
        }


        const rankQuery = await UserTest.query().where('test_id', test.id).where('marks_obtained', '>', userTest.marks_obtained).getCount()

        userTest.rank = rankQuery + 1

        response.success(userTest)
    }
}

module.exports = AnalysisController
