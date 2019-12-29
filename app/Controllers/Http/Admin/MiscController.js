'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */

const { Test, UserTest, Question, User, Setting } = use("App/Models");

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
        const setting = await Setting.query().first();

        return response.success({
            users : {
                created : await User.query().getCount(),
                max : setting && setting.max_users || null,
            },
            tests : {
                created : await Test.query().getCount(),
                taken : await UserTest.query().getCount(),
            },
            questions : await Question.query().getCount(),
            image : setting && setting.image || null,
            name : setting && setting.name || null,
            active_to : setting && setting.active_to || null
        });
    }
}

module.exports = MiscController;
