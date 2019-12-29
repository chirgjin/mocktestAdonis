'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


/** @type {typeof import('../../../Models/Test')} */
const Test = use('App/Models/Test');


const validate = use("App/Helpers/validate");
const { NotFoundException } = use("App/Exceptions");

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
    * @param {Auth} ctx.auth
    */
    async index ({ request, response, auth, params }) {

        const v = await validate(params, {
            exam_id : "required|integer",
            exam_section_id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const examId = params.exam_id;
        const sectionId = params.exam_section_id;

        const q = auth.user.tests().where('exam_section_id', sectionId).where('user_exams.exam_id', examId).where('enabled', 1);

        

        // const exam = await auth.user.exams().where('exam_id', examId).first();

        // console.log(exam);

        // if(!exam || Array.isArray(exam) && !exam[0]) {
        //     return response.error({field: "exam_id", message : "You can not access this exam"}, 403);
        // }

        // const q = Test
        // .query()
        // .where("exam_id", examId)
        // .where("exam_section_id", sectionId)

        if(request.input("with_sections", 1) == 1) {
            q.with('sections', builder => {
                builder.orderByNum();
            });
        }

        if(request.input("with_exam", 1) == 1) {
            q.with('exam');
        }

        if(request.input('with_exam_section', 1) == 1) {
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

        const q = auth
            .user
            .tests()
            .where('tests.id', params.id);
        
        if(request.input("with_sections", 1) == 1) {
            q.with("sections", (builder) => {
                builder = builder.orderByNum();
                if(request.input("with_questions", 1) == 1) {
                    builder.with('questions', builder => {
                        builder.withAll();
                    });
                }
            });
        }

        if(request.input("with_exam", 1) == 1) {
            q.with('exam');
        }
        if(request.input('with_exam_section', 1) == 1) {
            q.with('examSection');
        }

        q.setHidden(['created_by']);

        const test = await q.first();

        if(!test || !test.enabled) {
            throw new NotFoundException('Test');
        }

        return response.success(test);
    }
}

module.exports = TestController;
