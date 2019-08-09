'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('../../../Models/User')} */
const User = use('App/Models/User');
/** @type {typeof import('../../../Models/Exam')} */
const Exam = use('App/Models/Exam');

const { validate } = use('Validator')
const { PermissionDeniedException, IncorrectTypeException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with users
*/
class UserController {
    /**
    * Show a list of all users.
    * GET users
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response }) {
        
        const q = User.query();
        if(request.input("firstname", null)) {
            q.where('firstname', 'like', `%${request.input("firstname")}%`);
        }
        
        const users = await q.fetch();

        return response.success(users);
    }
    
    /**
    * Create/save a new user.
    * POST users
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response, auth }) {

        //required data - firstname, username, password

        const v = await validate(request.post(), {
            username : 'required',
            password : 'required',
            firstname : 'required',
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const roles = request.input('roles');

        if(roles && Array.isArray(roles)) {
            if(roles.indexOf("superAdmin") != -1 && auth.user.roles.indexOf("superAdmin") == -1) {
                throw new PermissionDeniedException();
            }
        }
        else if(roles){
            throw new IncorrectTypeException('roles', 'Array', typeof roles);
        }

        const user = await User.create(request.only(['username', 'password', 'firstname', 'email', 'mobile_number', 'lastname', 'college', 'mobile_verified', 'email_verified', 'roles']));

        const exams = request.input("exams");

        if(exams && Array.isArray(exams)) {
            const count = (await Exam.query().whereIn('id', exams).count('* as count'))[0].count;

            if(count != exams.length) {
                return response.error({field: "exams", message: "One or more exams you've selected do not exist!"});
            }

            await user.exams().attach(exams);
        }

        await user.load('exams');

        return response.success(Object.assign(user.toJSON(), {
            exams : user.getRelated("exams")
        }));
    }

    /**
     * Allow user to access given exams
     * PUT users/:id/allowExams
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async allowExams ({ params, request, response, auth }) {

    }

    /**
     * Change user's password
     * PUT users/:id/changePassword
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async changePassword ({ params, request, response, auth }) {

    }
    
    /**
    * Display a single user.
    * GET users/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async show ({ params, request, response, auth }) {

        const user = await User
        .query()
        .where("id", params.id)
        .with('exams')
        .first();

        if(!user) {
            throw new Error("Not found");
        }

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException();
        }

        return response.success(user);
    }
    
    /**
    * Update user details.
    * PUT or PATCH users/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {

        const user = await User.findOrFail(params.id);

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException();
        }

        const editableFields = ['firstname', 'lastname', 'roles', 'email', 'password', 'email_verified', 'mobile_number', 'mobile_verified', 'college'];

        user.merge(request.only(editableFields));

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException('You do not have permission to assign specified role(s) to this user');
        }

        await user.save();

        const exams =  request.input("exams");

        if(exams && Array.isArray(exams)) {
            const count = (await Exam.query().whereIn('id', exams).count('* as count'))[0].count;

            if(count != exams.length) {
                return response.error({field: "exams", message: "One or more exams you've selected do not exist!"});
            }

            await user.exams().sync(exams);
        }

        await user.load('exams');

        return response.success(Object.assign(user.toJSON(), {
            exams : user.getRelated("exams")
        }));

    }
    
    /**
    * Delete a user with id.
    * DELETE users/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, request, response, auth}) {
        const user = await User.findOrFail(params.id);

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException();
        }

        //delete associations too
        await user.delete();

        return response.success(true);
    }
}

module.exports = UserController
