'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models/Exam')} */
const Exam = use('App/Models/Exam');



const { NotFoundException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with exams
*/
class ExamController {
    /**
     * Show a list of all exams.
     * GET exams
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async index ({ request, response, auth }) {

        const user = auth.user;
        const q = user.exams();

        
        if(request.input("with_sections", 1) == 1) {
            q.with("sections");
        }

        const exams = await q.fetch();
        
        response.success(exams);

    }
    
    /**
     * Display a single exam.
     * GET exams/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async show ({ params, request, response, auth }) {

        const user = auth.user;
        const q = Exam
        .query()
        .where("id", params.id)
        .whereHas('users', builder => {
            builder.where('user_id', user.id);
        });

        if(request.input("with_sections", 1) == 1) {
            q.with("sections");
        }

        const exam =  await q.first();

        if(!exam) {
            throw new NotFoundException('Exam');
        }

        return response.success(exam);
    }
}

module.exports = ExamController
