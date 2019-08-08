'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models/TestSection')} */
const TestSection = use('App/Models/TestSection');


const { validate } = use('Validator')
const { NotFoundException } = use("App/Exceptions");
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
    async index ({ request, response, params, auth }) {
        const v = await validate(params, {
            test_id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const test = await auth
        .user
        .tests()
        .where('tests.id', params.test_id)
        .with("sections", (builder) => {
            builder.orderByNum();
            if(request.input("with_questions", 1) == 1) {
                builder.with('questions', builder => builder.withAll());
            }
        })
        .first();

        if(!test) {
            throw new NotFoundException("TestSection")
        }

        return response.success(test.getRelated('sections'));
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
        const v = await validate(params, {
            id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const q = TestSection
        .query()
        .where('id', params.id)
        
        if(request.input('with_questions', 1) == 1) {
            q.with('questions', builder => {
                builder.withAll();
            })
        }

        const testSection = await q.first();

        if(!testSection) {
            throw new NotFoundException('TestSection')
        }

        const test = await auth.user.tests().where('tests.id', testSection.test_id).first();

        if(!test) {
            throw new NotFoundException('Test');
        }

        await testSection.load('exams');
        
        return response.success(testSection);
    }
}

module.exports = TestSectionController
