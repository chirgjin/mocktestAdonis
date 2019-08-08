'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const { TestSection, Question } = use('App/Models');


const { validate } = use('Validator')
const { NotFoundException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with questions
*/
class QuestionController {
    /**
    * Show a list of all questions.
    * GET questions
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, params, auth }) {
        const v = await validate(params, {
            test_section_id : "required|integer",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const testSection = await TestSection
        .query()
        .where('id', params.test_section_id)
        .with('questions', builder => {
            builder.withAll();
        })
        .first()

        if(!testSection) {
            throw new NotFoundException('TestSection')
        }

        const test = await auth.user.tests().where('tests.id', testSection.test_id).first();

        if(!test) {
            throw new NotFoundException('Test');
        }

        return response.success(testSection.getRelated('questions'));
    }

    
    /**
    * Display a single question.
    * GET questions/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, auth }) {

        const question = await Question.query()
        .whereHas('tests', builder => {
            builder
            .where('test_section_questions.question_id', params.id)
            .innerJoin('user_exams', 'tests.exam_id', 'user_exams.exam_id')
            // .where('tests.exam_id', 'user_exams.exam_id')
            .where('user_exams.user_id', auth.user.id)
        })
        .where('questions.id', params.id)
        .withAll()
        .first();

        if(!question) {
            throw new NotFoundException('Question')
        }

        return response.success(question);
    }
}

module.exports = QuestionController
