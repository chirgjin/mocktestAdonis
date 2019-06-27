'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


/** @type {typeof import('../../../Models/Test')} */
const Test = use('App/Models/Test');


const { validate } = use('Validator')

/**
* Resourceful controller for interacting with tests
*/
class TestController {
    /**
    * Show a list of all tests.
    * GET tests
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view }) {

        const v = await validate(request.get(), {
            exam_id : "required|integer",
            section_id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const examId = request.input('exam_id');
        const sectionId = request.input('section_id');

        const exam = await auth.user.exams().where('exam_id', examId).fetch();

        console.log(exam);

        if(!exam || Array.isArray(exam) && !exam[0]) {
            return response.error({field: "exam_id", message : "You can not access this exam"}, 403);
        }

        const q = Test
        .query()
        .where("exam_id", examId)
        .where("exam_section_id", sectionId)

        if(request.input("with_sections", 1)) {
            q.with('sections', builder => {
                builder.orderByNum();
            });
        }
        if(request.input("with_exam", 1)) {
            q.with('exam');
        }
        if(request.input('with_exam_section')) {
            q.with('examSection');
        }

        q.setHidden(['created_by']);

        const tests = await q.fetch();

        return response.success(tests);
    }
    
    /**
    * Display a single test.
    * GET tests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async show ({ params, request, response, auth }) {

        const q = await auth
        .user
        .tests()
        .where('id', params.id)
        
        if(request.input("with_sections", 1)) {
            q.with("sections", (builder) => {
                builder.orderByNum();
                if(request.input("with_questions", 1)) {
                    builder.with('questions', builder => builder.withAll());
                }
            });
        }
        if(request.input("with_exam", 1)) {
            q.with('exam');
        }
        if(request.input('with_exam_section', 1)) {
            q.with('examSection');
        }

        q.setHidden(['created_by']);

        const tests = await q.fetch();

        return response.success(tests);
    }
}

module.exports = TestController
