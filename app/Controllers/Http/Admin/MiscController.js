'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

// const Difficulty = use("App/Models/Difficulty");
class MiscController {

    /**
    * Get home stats and stuff
    * GET home
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async home ({ response }) {
        return response.success({
            stats : "to be added",
        });
    }
}

module.exports = MiscController;
