'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const {Test, TestSection, Exam, Difficulty, ExamSection} = use("App/Models");
const NotFoundException = use("App/Exceptions/NotFoundException");

/**
* Resourceful controller for interacting with testsections
*/
class TestSectionController {
    /**
    * Show a list of all testsections.
    * GET testsections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view }) {

        const q = TestSection.query();

        if(request.input("name")) {
            q.where("name", "LIKE", `%${request.input("name")}%`);
        }
        if(request.input("test_id")) {
            q.where("test_id", request.input("test_id")).orderByNum();
        }

        if(request.input("with_questions") === '1') {
            q.with('questions', builder => builder.withAll().with('solution'));
        }

        const testSections = await q.fetch();

        return response.success(testSections);
    }
    
    /**
    * Create/save a new testsection.
    * POST testsections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response }) {

        const v = await validate(request.post(), {
            test_id : "required|integer",
            name : "required",
            duration : "integer|min:0|max:36000",
            number : "integer|min:-99999|max:9999",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const test = await Test
            .query()
            .with('sections')
            .where('id', request.input('test_id'))
            .fetch();
        
        if(!test) {
            return response.error({field:"test_id", message: "Test id doesn't exist"});
        }

        const len = test.sections.filter(section => section.duration > 0).length;

        if(len > 0 && request.input('duration') < 1) {
            return response.error({field:"duration", message: "TestSection must have duration"});
        }
        else if(test.sections.length > 0 && len == 0 && request.input('duration') > 0) {
            return response.error({field:"duration", message : "TestSection can not have any duration"});
        }

        let number = request.input("number", null);
        if(number === null || parseInt(number) !== number) {
            number = test.sections.length > 0 ? test.sections.sort((s1, s2) => s2.number-s1.number)[0].number+1 : 0;
        }
        else number = parseInt(number);

        const testSection = await TestSection.create({
            test_id : test.id,
            name : request.input("name"),
            number : number,
            duration : parseInt(request.input("duration")) || 0,
        });

        return response.success(testSection);
    }
    
    /**
    * Display a single testsection.
    * GET testsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async show ({ params, request, response}) {

        const q = TestSection.query();

        q.where('id', params.id);

        if(request.input("with_questions") === '1') {
            q.with('questions', builder => builder.withAll().with('solution'));
        }

        const testSections = await q.fetch();

        if(testSections.length < 1) {
            throw new NotFoundException("TestSection");
        }
        
        return response.success(testSections[0]);
    }
    
    /**
    * Update testsection details.
    * PUT or PATCH testsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response }) {
    }
    
    /**
    * Delete a testsection with id.
    * DELETE testsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, request, response }) {
    }
}

module.exports = TestSectionController
