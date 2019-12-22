'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
/** @type {typeof import('../../../Models/User')} */
const User = use('App/Models/User');
/** @type {typeof import('../../../Models/Exam')} */
const Exam = use('App/Models/Exam');

const Setting = use('App/Models/Setting')

const validate = use("App/Helpers/validate")
const { PermissionDeniedException, IncorrectTypeException, MissingValueException } = use("App/Exceptions");
const randomString = use('App/Helpers/randomString')


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
    async index ({ request, response, auth }) {

        if(!await auth.user.canPerformAction('user', 'read')) {
            throw new PermissionDeniedException();
        }
        
        const q = User.query().setVisible(['id'])
        if(request.input("firstname", null)) {
            q.where('firstname', 'like', `%${request.input("firstname")}%`);
        }
        
        const page = parseInt(request.input("page", 1)) || 1
        const users = await q.paginate(page);

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

        if(!await auth.user.canPerformAction('user', 'create')) {
            throw new PermissionDeniedException();
        }

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
        else {
            const setting = await Setting.query().first()

            if(setting && setting.max_users != -1 && setting.max_users <= await User.query().getCount()) {
                return response.error('Max users achieved', 422)
            }
        }

        const user = await User.create(request.only(['username', 'password', 'firstname', 'email', 'mobile_number', 'lastname', 'college', 'mobile_verified', 'email_verified', 'roles', 'rollnum', 'branch', 'degree', 'section', 'batch',]));

        const exams = request.input("exams");

        if(exams && Array.isArray(exams)) {
            const count = await Exam.query().whereIn('id', exams).getCount();

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
     * PUT users/:id/exams/allow
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async allowExams ({ params, request, response, auth }) {

        if(!await auth.user.canPerformAction('user', 'update')) {
            throw new PermissionDeniedException();
        }

        const user = await User.findOrFail(params.id);

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException();
        }

        let exams = request.input("exams");

        if(!exams || !Array.isArray(exams)) {
            throw new IncorrectTypeException('exams', 'Array', typeof exams);
        }

        const count = await Exam.query().whereIn('id', exams).getCount();

        if(count != exams.length) {
            return response.error({'exams': 'One or more exam(s) do not exist'}, 400)
        }

        await user.load('exams', builder => {
            builder.whereIn('exam_id', exams)
        });
        const userExams = user.getRelated('exams')

        if(userExams && Array.isArray(userExams)) {
            exams = exams.filter(exam => {
                let go = 0;
                userExams.forEach(uexam => go = go || uexam.id == exam)
                return !go
            })
        }
        delete user.$relations.exams;

        await user.load('exams');

        return response.success(user)
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

        if(!await auth.user.canPerformAction('user', 'read')) {
            throw new PermissionDeniedException();
        }

        const user = await User
        .query()
        .setVisible(['id'])
        .where("id", params.id)
        .with('exams')
        .with('permissions')
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

        if(!await auth.user.canPerformAction('user', 'update')) {
            throw new PermissionDeniedException();
        }

        const user = await User.findOrFail(params.id);

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException();
        }

        const editableFields = ['firstname', 'lastname', 'roles', 'email', 'password', 'email_verified', 'mobile_number', 'mobile_verified', 'college', 'rollnum', 'branch', 'degree', 'section', 'batch', ];

        user.merge(request.only(editableFields));

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException('You do not have permission to assign specified role(s) to this user');
        }

        await user.save();

        const exams =  request.input("exams");

        if(exams && Array.isArray(exams)) {
            const count = await Exam.query().whereIn('id', exams).getCount()

            if(count != exams.length) {
                return response.error({field: "exams", message: "One or more exams you've selected do not exist!"});
            }

            await user.exams().sync(exams);
        }

        await user.load('exams');

        return response.success(user);

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

        if(!await auth.user.canPerformAction('user', 'delete')) {
            throw new PermissionDeniedException();
        }

        const user = await User.findOrFail(params.id);

        if(!auth.user.canEditUser(user)) {
            throw new PermissionDeniedException();
        }

        //delete associations too
        await user.delete();

        return response.success(true);
    }



    

    /**
     * Create users via csv
     * POST users/upload
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async uploadCSV ({ request, response, auth }) {
        if(!auth.user.isSuperAdmin) {
            throw new PermissionDeniedException();
        }
        
        const colMapping = {
            'first_name' : 'firstname',
            'firstname' : 'firstname',
            'first name' : 'firstname',
            'name' : 'firstname',
            
            'last_name' : 'lastname',
            'lastname' : 'lastname',
            'last name' : 'lastname',

            'username' : 'username',
            
            'email' : 'email',
            'email id' : 'email',
            'email_id' : 'email',
            'email_address' : 'email',
            'email address' : 'email',

            'password' : 'password',
            'pwd' : 'password',

            'college' : 'college',
            
            'mobile num' : 'mobile_number',
            'mobile number' : 'mobile_number',
            'mobile_num' : 'mobile_number',
            'mobile_number' : 'mobile_number',
            'phone_num' : 'mobile_number',
            'phone_number' : 'mobile_number',
            'phone num' : 'mobile_number',
            'phone number' : 'mobile_number'
        }

        const csv = request.file('file', {
            extnames : ['csv'],
        })
        if(!csv) {
            throw new MissingValueException('file')
        }

        const data = require("fs").readFileSync(csv.tmpPath).toString().split("\n").map(row => row.split(",").map(item => item.trim()))

        const heads = data[0].map(head => colMapping[ (head||'').toString().toLowerCase().trim() ])

        if(heads.indexOf('firstname') == -1) {
            throw new MissingValueException('firstname')
        }

        data.splice(0, 1);

        const users = [];

        data.forEach(row => {
            const obj = {};
            row.forEach((item, i) => {
                if(heads[i]) {
                    obj[heads[i]] = item
                }
            });

            if(!obj.password) {
                obj.password = randomString(6, 'aA1!')
            }
            if(!obj.username) {
                obj.username = obj.firstname + (obj.lastname||'') + randomString(6, 'aAn')
            }

            users.push(obj)
        })


        // users.forEach(user => {
        //     let go = 0;
        //     users.forEach(u => {
        //         if(u != user && user.username == u.username) {
        //             go = 1;
        //         }
        //     })

        //     if(go) {
        //         console.log("Found a match")
        //     }
        // })

        const usersCreated = await User.createMany(users);

        return response.success({
            users,
        })
    }
}

module.exports = UserController
