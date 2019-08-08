'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models/ExamSection')} */
const ExamSection = use('App/Models/ExamSection');

const { validate } = use('Validator')

const { NotFoundException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with examsections
*/
class ExamSectionController {
    
    /**
     * Show a list of all exams.
     * GET exams
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async index ({ params, request, response, auth }) {

        const v = await validate(params, {
            exam_id : 'required|number',
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const user = auth.user;
        const sections = await user.examSections().where('user_exams.exam_id', params.exam_id).fetch();
        
        response.success(sections);

    }

    /**
    * Display a single examsection.
    * GET examsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, auth }) {
        const user = auth.user

        const section = await user.examSections().where('exam_section_id', params.id).first();

        if(!section) {
            throw new NotFoundException("ExamSection");
        }

        response.success(section);
    }
}

module.exports = ExamSectionController
