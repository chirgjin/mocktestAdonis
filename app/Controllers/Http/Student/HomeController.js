'use strict';


/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const {Setting} = use("App/Models");

// const {NotFoundException} = use("App/Exceptions");

class HomeController {

    /**
     * Checks if server has been configured properly and returns settings object
     * GET /server_check
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async server_check ({ response }) {

        const s = await Setting.query().setHidden(['max_users', 'created_at', 'updated_at', 'id']).first();

        if(!s) {
            return response.error('Server not configured yet', 503);
        }

        return response.success(s);

    }

    
}

module.exports = HomeController;
