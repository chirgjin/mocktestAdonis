'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


/** @type {typeof import('../../../Models/Exam')} */
const Exam = use('App/Models/Exam');

/** @type {typeof import('../../../Models/ExamSection')} */
const ExamSection = use('App/Models/ExamSection');


const validate = use("App/Helpers/validate");
const { NotFoundException, FieldException, PermissionDeniedException } = use("App/Exceptions");

/**
* Resourceful controller for interacting with exams
*/
class ExamController {
    /**
    * Show a list of all exams.
    * GET exams
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async index ({ request, response, auth }) {
        const user = auth.user;

        if(!await user.canPerformAction('exam', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = Exam.query();

        if(request.input("name")) {
            q.where("name", "like", `%${request.input("name")}%`);
        }
        if(request.input("code")) {
            q.where("code", "like", `%${request.input("code")}%`);
        }

        const exams = await q.fetch();

        return response.success(exams);
    }
    
    /**
    * Create/save a new exam.
    * POST exams
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response, auth }) {

        if(!await auth.user.canPerformAction('exam', 'create')) {
            throw new PermissionDeniedException();
        }
        

        const v = await validate(request.post(), {
            name : 'required|unique:exams',
            code : 'required|unique:exams',
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const {name,code} = request.post();

        const exam = await Exam.create({name,code});

        return response.success(exam);
    }
    
    /**
    * Display a single exam.
    * GET exams/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async show ({ params, response, auth}) {

        if(!await auth.user.canPerformAction('exam', 'read')) {
            throw new PermissionDeniedException();
        }

        const exam = await Exam.query().where('id', params.id).with('sections').first();

        if(!exam) {
            throw new NotFoundException('Exam');
        }

        return response.success(exam);
    }
    
    /**
    * Update exam details.
    * PUT or PATCH exams/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {

        if(!await auth.user.canPerformAction('exam', 'update')) {
            throw new PermissionDeniedException();
        }

        const exam = await Exam.findOrFail(params.id);

        const {name} = request.post();

        if(name) {
            exam.name = name;
        }

        await exam.save();

        return response.success(exam);
    }
    
    /**
    * Link examSections to exam
    * PUT or PATCH exams/:id/sections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async updateSections({params, request, response, auth}) {

        if(!await auth.user.canPerformAction('exam', 'update')) {
            throw new PermissionDeniedException();
        }

        const v = await validate(request.post(), {
            action : "required|in:link,unlink",
            sections: "required|array",
            "sections.*" : "number",
        });

        if(v.fails()){
            return response.error(v.messages());
        }

        const exam = await Exam.findOrFail(params.id);
        const {action, sections} = request.post();

        
        const count = await ExamSection.query().whereIn('id', sections).getCount();
        if(count != sections.length) {
            throw new FieldException("sections","One or more sections do not exist");
        }

        if(action == 'link') {
            //link new sections
            await exam.load('sections', builder => {
                builder.whereIn('exam_section_id', sections);
            });

            const secs = exam.getRelated("sections").rows;

            await exam.sections().attach(sections.filter(section => {
                let go = 0;
                secs.forEach(sec => go = go || section == sec.id);
                return !go;
            }));
            delete exam.$relations.sections;
        }
        else if(action == 'unlink') {
            await exam.sections().detach(sections);
        }

        await exam.load('sections');
        
        return response.success(exam);
    }
    
    /**
    * Delete a exam with id.
    * DELETE exams/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, response, auth }) {
        
        if(!await auth.user.canPerformAction('exam', 'delete')) {
            throw new PermissionDeniedException();
        }

        const exam = await Exam.findOrFail(params.id);

        await exam.delete();

        return response.success(exam);
    }
}

module.exports = ExamController;
