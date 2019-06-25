'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models/ExamSection')} */
const ExamSection = use('App/Models/ExamSection');

/**
* Resourceful controller for interacting with examsections
*/
class ExamSectionController {
    
    /**
    * Display a single examsection.
    * GET examsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, view }) {
        const examSection = await ExamSection.findOrFail(params.id);

        return response.success(examSection);
    }
}

module.exports = ExamSectionController
