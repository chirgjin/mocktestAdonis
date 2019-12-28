'use strict';

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
   * Render a form to be used for creating a new usertest.
   * GET usertests/create
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
    async create ({ request, response, view }) {
      
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
   * Render a form to update an existing usertest.
   * GET usertests/:id/edit
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
    async edit ({ params, request, response, view }) {
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

    /**
   * Delete a usertest with id.
   * DELETE usertests/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
    async destroy ({ params, request, response }) {
    }
}

module.exports = UserTestController;
