'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models')} */
const {UserTest, Test, TestSection, UserAnswer, Question} = use("App/Models");
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
    async index ({ request, response, view }) {
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

        const userTests = await auth.user.userTests().where('test_id', test_id).fetch();

        console.log(userTests);
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
    async show ({ params, request, response, view }) {
    }
    
    /**
    * Update usertest details.
    * PUT or PATCH usertests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response }) {
    }
}

module.exports = UserTestController
