'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
* Resourceful controller for interacting with useranswers
*/
class UserAnswerController {
    /**
    * Show a list of all useranswers.
    * GET useranswers
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view }) {
    }
    
    /**
    * Create/save a new useranswer.
    * POST useranswers
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response }) {
    }
    
    /**
    * Display a single useranswer.
    * GET useranswers/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, view }) {
    }
    
    /**
    * Update useranswer details.
    * PUT or PATCH useranswers/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response }) {
    }
}

module.exports = UserAnswerController
