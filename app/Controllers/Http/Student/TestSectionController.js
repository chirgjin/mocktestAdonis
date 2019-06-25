'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models/TestSection')} */
const TestSection = use('App/Models/TestSection');


const { validate } = use('Validator')
/**
* Resourceful controller for interacting with testsections
*/
class TestSectionController {
    /**
    * Show a list of all testsections.
    * GET testsections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view }) {
        const v = await validate(request.get(), {
            test_id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const test = await auth
        .user
        .tests()
        .where('id', params.id)
        .with("sections", (builder) => {
            builder.orderByNum();
            if(request.input("with_questions", 1)) {
                builder.with('questions', builder => builder.withAll());
            }
        })
        .fetch();

        return response.success(test);
    }
    
    /**
    * Display a single testsection.
    * GET testsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, auth}) {
    }
}

module.exports = TestSectionController
