'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const {Setting, User} = use("App/Models")
const Helpers = use("Helpers")
const { PermissionDeniedException, NotFoundException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with settings
*/
class SettingController {
    /**
     * Show a list of all settings.
     * GET settings
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index ({ request, response, view }) {
        const s = await Setting.query().first();

        if(!s) {
            throw new NotFoundException('Setting')
        }

        response.success(s);
    }
    
    /**
     * Update setting details.
     * PUT or PATCH settings/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update ({ params, request, response, auth }) {
        const setting = await Setting.findOrFail(params.id)

        // if(!auth.user.canAccessSettings()) {
        //     throw new PermissionDeniedException()
        // }

        // image will be file

        const image = request.file('image', {
            types : ['image'],
            size : '20mb',
        })

        if(image) {

            await image.move(Helpers.publicPath('images'), {
                name : '/logo.' + image.extname,
                overwrite : true,
            })

            if(!image.moved()) {
                return response.error(image.error())
            }

            setting.image = '/images/logo.' + image.extname;
        }

        const name = request.input('name');

        if(name) {
            setting.name = name;
        }

        const max_users = parseInt(request.input('max_users')) || 0

        if(max_users) {
            if(max_users === -1) {
                setting.max_users = max_users
            }
            else {
                const currentUsers = await User.query().getCount();

                if(currentUsers > max_users) {
                    return response.error({'max_users' : 'Max users must be more than ' + currentUsers}, 400)
                }

                setting.max_users = max_users
            }
        }

        const active_from = request.input("active_from"), active_to = request.input("active_to")

        if(active_from && active_from != 'null') {
            const d = new Date(active_from)
            if(isNaN(d)) {
                return response.error({'active_from' : 'Active from is an invalid date'}, 400)
            }
            setting.active_from = d
        }
        else if(active_from === null || active_from == 'null') {
            setting.active_from = null
        }

        
        if(active_to && active_to != 'null') {
            const d = new Date(active_to)
            if(isNaN(d)) {
                return response.error({'active_to' : 'Active To is an invalid date'}, 400)
            }
            setting.active_to = d
        }
        else if(active_to === null || active_to == 'null') {
            setting.active_to = null
        }


        if(setting.active_from && setting.active_to && setting.active_from > setting.active_to) {
            return response.error({'active_from' : 'Active from can\'t be smaller than active to'}, 400)
        }


        await setting.save();

        return response.success(setting)

    }
}

module.exports = SettingController
