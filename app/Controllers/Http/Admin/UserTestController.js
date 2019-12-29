'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const UserTest = use("App/Models/UserTest");
const { PermissionDeniedException, NotFoundException } = use("App/Exceptions");
const analysis = use("App/Helpers/analysis");
const validate = use("App/Helpers/validate");

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

        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = UserTest.query();

        if(request.input("user_id", null)) {
            q.where('user_id', request.input('user_id'));
        }
        if(request.input('test_id', null)) {
            q.where('test_id', request.input('test_id'));
        }

        q.with('user').with('test');

        const page = parseInt(request.input("page", 1)) || 1;
        return response.success(await q.paginate(page));
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
        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const userTest = await UserTest
            .query()
            .where('id', params.id)
            .with('user')
            .with('test', builder => {
                builder.with('sections');
            })
            .with('answers')
            .first();

        if(!userTest) {
            throw new NotFoundException('UserTest');
        }

        if(request.input('with_analysis', 0) == '1') {
            const sections = userTest.getRelated("test").getRelated('sections').rows;

            for(let section of sections) {

                //now calculate marks, incorrect, correct stats etc
                section.$relations.stats = await analysis(section, userTest.id);
            }
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
    // async update ({ params, request, response, auth }) {

    //     if(!await auth.user.canPerformAction('test', 'update')) {
    //         throw new PermissionDeniedException();
    //     }
        
    //     const userTest = await UserTest.findOrFail(params.id);
        
    //     const v = await validate(request.post(), {
            
    //     })
    // }

    /**
   * Delete a usertest with id.
   * DELETE usertests/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
    async destroy ({ params, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'delete')) {
            throw new PermissionDeniedException();
        }

        const userTest = await UserTest.findOrFail(params.id);

        //delete test, delete attemptedSections pivot rows, delete answers
        await userTest.delete();

        return response.success(true);
    }
}

module.exports = UserTestController;
