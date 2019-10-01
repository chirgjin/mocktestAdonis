'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


/** @type {typeof import('../../../Models/Exam')} */
const Exam = use('App/Models/Exam');

/** @type {typeof import('../../../Models/ExamSection')} */
const ExamSection = use('App/Models/ExamSection');

const { validate } = use('Validator')
const { NotFoundException, PermissionDeniedException } = use("App/Exceptions");
/**
* Resourceful controller for interacting with examsections
*/
class ExamSectionController {
    /**
    * Show a list of all examsections.
    * GET examsections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view, auth }) {

        if(!await auth.user.canPerformAction('examSection', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = ExamSection.query();

        if(request.input("name")) {
            q.where("name", "like", `%${request.input("name")}%`);
        }
        if(request.input("code")) {
            q.where("code", "like", `%${request.input("code")}%`);
        }

        const examSections = await q.fetch();

        return response.success(examSections);
    }
    
    /**
    * Create/save a new examsection.
    * POST examsections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response, auth }) {
        if(!await auth.user.canPerformAction('examSection', 'create')) {
            throw new PermissionDeniedException();
        }

        const v = await validate(request.post(), {
            name : 'required|unique:exam_sections',
            code : 'required|unique:exam_sections',
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const {name,code} = request.post();

        const examSection = await ExamSection.create({name,code});

        return response.success(examSection);
    }
    
    /**
    * Display a single examsection.
    * GET examsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async show ({ params, request, response, auth }) {
        if(!await auth.user.canPerformAction('examSection', 'read')) {
            throw new PermissionDeniedException();
        }

        const examSection = await ExamSection.query().where('id', params.id).with('exams').first();

        if(!examSection) {
            throw new NotFoundException('ExamSection');
        }

        return response.success(examSection);
    }
    
    /**
    * Update examsection details.
    * PUT or PATCH examsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {
        if(!await auth.user.canPerformAction('examSection', 'update')) {
            throw new PermissionDeniedException();
        }

        const examSection = await ExamSection.findOrFail(params.id);

        const {name} = request.post();

        if(name) {
            examSection.name = name;
        }

        await examSection.save();

        return response.success(examSection);
    }
    /**
    * Link examSections to exam
    * PUT or PATCH examsections/:id/exams
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async updateExams({params, request, response}) {
        return response.error(null, 403);

        const v = await validate(request.post(), {
            action : "required|in:link,unlink",
            exams: "required|array",
        });

        if(v.fails()){
            return response.error(v.messages());
        }

        const examSection = await ExamSection.findOrFail(params.id);
        const {action, exams} = request.post();

        
        const count = (await Exam.query().whereIn('id', exams).count('* as count'))[0].count;
        if(count != exams.length) {
            return response.error({field:"exams", message: "One or more exams do not exist"});
        }

        if(action == 'link') {
            //link new sections
            await examSection.exams().attach(exams);
        }
        else if(action == 'unlink') {
            await examSection.exams().detach(exams);
        }

        await examSection.load('exams');

        return response.success(Object.assign(examSection.toJSON(), {
            exams: examSection.getRelated('exams'),
        }));
    }
    
    /**
    * Delete a examsection with id.
    * DELETE examsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, request, response, auth }) {
        if(!await auth.user.canPerformAction('examSection', 'delete')) {
            throw new PermissionDeniedException();
        }

        const examSection = await ExamSection.findOrFail(params.id);
        await examSection.delete();

        return response.success(true);
    }
}

module.exports = ExamSectionController
