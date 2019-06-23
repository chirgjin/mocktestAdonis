'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

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
    async index ({ request, response, view }) {
    }
    
    /**
    * Create/save a new question.
    * POST questions
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response }) {
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
    async show ({ params, request, response, view }) {
    }
}

module.exports = QuestionController
