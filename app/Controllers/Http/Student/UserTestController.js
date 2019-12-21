'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models')} */
const {UserTest, Test, TestSection, UserAnswer, Question} = use("App/Models");

const validate = use("App/Helpers/validate")

const { PermissionDeniedException, NotFoundException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with usertests
*/
class UserTestController {
    /**
    * Show a list of all usertests.
    * GET usertests
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, auth }) {

        const q = auth.user.userTests();

        if(request.input('with_test', 1) == 1) {
            q.with('test', builder => {

                if(request.input('with_exam', 1) == 1) {
                    builder.with('exam');
                }

                if(request.input('with_exam_section', 1) == 1) {
                    builder.with('examSection');
                }
            });
        }

        const tests = await q.fetch();

        return response.success(tests);
    }
    
    /**
    * Create/save a new usertest.
    * POST usertests
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response, auth }) {
        const {test_id} = request.post();

        const v = await validate(request.post(), {
            test_id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const userTest = await UserTest
        .query()
        .where('user_id', auth.user.id)
        .where('test_id', test_id)
        .first();

        if(userTest) {
            return response.success(userTest);
        }

        //create user test instance if allowed
        const test = await auth.user.tests().where('tests.id', test_id).first();

        if(!test) {
            throw new PermissionDeniedException();
        }

        const usertest = await UserTest.create({
            user_id : auth.user.id,
            test_id,
        });

        return response.success(usertest);
    }
    
    /**
    * Display a single usertest.
    * GET usertests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, auth }) {

        const q = auth.user
        .userTests()
        .where('user_tests.id', params.id)
        // .first();

        if(request.input('with_test', 1) == 1) {
            q.with('test', builder => {

                if(request.input('with_exam', 1) == 1) {
                    builder.with('exam');
                }

                if(request.input('with_exam_section', 1) == 1) {
                    builder.with('examSection');
                }
            });
        }

        if(request.input('with_answers', 1) == 1) {
            q.with('answers');
        }

        if(request.input('with_sections_attempted', 1) == 1) {
            q.with('sectionsAttempted');
        }

        const userTest = await q.first();

        if(!userTest) {
            throw new NotFoundException('UserTest');
        }

        return response.success(userTest);
    }
    
    /**
    * Update usertest details.
    * PUT or PATCH usertests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {
        const v = await validate(request.post(), {
            status : "required|in:0,1,2"
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const userTest = await UserTest
        .query()
        .where('user_id', auth.user.id)
        .where('id', params.id)
        .first();

        if(!userTest) {
            throw new NotFoundException('UserTest');
        }

        if(userTest.status == UserTest.COMPLETED) {
            throw new PermissionDeniedException(`This test has already been marked as completed`);
        }

        userTest.status = request.post().status;

        await userTest.save();

        return response.success(userTest);
    }
}

module.exports = UserTestController
