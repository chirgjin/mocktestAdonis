'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/**
* Resourceful controller for interacting with usertests
*/
class UserTestController {
    /**
    * Show a list of all usertests.
    * GET usertests
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view }) {
    }
    
    /**
    * Create/save a new usertest.
    * POST usertests
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response }) {
    }
    
    /**
    * Display a single usertest.
    * GET usertests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, view }) {
    }
    
    /**
    * Update usertest details.
    * PUT or PATCH usertests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response }) {
    }
}

module.exports = UserTestController
