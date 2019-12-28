'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Difficulty = use("App/Models/Difficulty");

const validate = use("App/Helpers/validate");

/**
* Resourceful controller for interacting with difficulties
*/
class DifficultyController {
    /**
     * Show a list of all difficulties.
     * GET difficulties
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async index ({ response }) {

        const difficulties = await Difficulty.all();

        return response.success(difficulties);
    }
    
    /**
     * Create/save a new difficulty.
     * POST difficulties
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async store ({ request, response }) {

        const v = await validate(request.post(), {
            name : 'required|unique:difficulties',
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const {name} = request.post();

        const difficulty = await Difficulty.create({name});

        return response.success(difficulty);
    }
}

module.exports = DifficultyController;
