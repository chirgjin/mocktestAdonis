'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const {Test, TestSection, } = use("App/Models");
const {NotFoundException, PermissionDeniedException} = use("App/Exceptions");
const validate = use("App/Helpers/validate");
const Database = use("Database");

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
    async index ({ request, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

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
    async store ({ request, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'create')) {
            throw new PermissionDeniedException();
        }

        const v = await validate(request.post(), {
            test_id : "required|integer",
            name : "required",
            duration : "integer|range:-1,36001",
            number : "integer|range:-999999,99999",
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
    async show ({ params, request, response, auth}) {

        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = TestSection.query();

        q.where('id', params.id);

        if(request.input("with_questions") === '1') {
            q.with('questions', builder => builder.withAll().with('solution'));
        }

        const testSection = await q.first();

        if(!testSection) {
            throw new NotFoundException("TestSection");
        }
        
        return response.success(testSection);
    }
    
    /**
    * Update testsection details.
    * PUT or PATCH testsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'update')) {
            throw new PermissionDeniedException();
        }

        const v = await validate(request.post(), {
            name : "string",
            number : "integer|range:-999999,99999",
            duration : "integer|range:0,36001"
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const testSection = await TestSection.findOrFail(params.id);

        testSection.merge(request.only(['name', 'number', 'duration']));

        await testSection.load('test');

        const test = await testSection.getRelated('test');

        await test.load('sections');

        test.getRelated('sections').rows.forEach(ts => {
            if(ts.id == testSection.id) {
                ts.merge(testSection);
            }
        });

        await Test.checkIntegrity(test);

        await testSection.save();

        return response.success(testSection);
    }
    
    /**
    * Update test details.
    * PUT or PATCH tests/:id/testSections
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async updateMany ({ params, request, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'update')) {
            throw new PermissionDeniedException();
        }

        const test = await Test.findOrFail(params.id);

        
        const v = await validate(request.post(), {
            test_sections : "required|array",
            "test_sections.*.duration" : "integer|range:0,36001",
            "test_sections.*.name" : "required|string",
            "test_sections.*.number" : "integer",
            "duration" : "integer|range:0,36001",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        await test.load("sections");

        const existingTestSections = test.getRelated("sections").rows;
        const testSections = request.input("test_sections");

        const deleteSections = [];
        const tasks = [];
        const proms = [];
        const finalSections = [];

        await Database.beginTransaction( async (txn) => {
            existingTestSections.forEach( (ts) => {
                let found = 0;

                testSections.forEach( (testSection, i) => {

                    if(testSection.id == ts.id) {
                        ts.number = testSection.hasOwnProperty('number') ? testSection.number : i;
                        ts.duration = testSection.duration;
                        ts.name = testSection.name;

                        testSection.handled = true;

                        tasks.push(() => ts.save(txn));
                        found = 1;

                        finalSections.push(ts);
                    }
                });

                if(!found) {
                    deleteSections.push(ts.id);
                }
            });

            testSections.forEach( (testSection, i) => {
                if(!testSection.handled) {
                    if(!testSection.hasOwnProperty("number")) {
                        testSection.number = i;
                    }

                    proms.push(
                        TestSection
                            .create(testSection, txn)
                            .then(ts => {
                                finalSections.push(ts);
                            })
                    );
                }
            });

            await Promise.all(testSections);

            test.$relations.sections.rows = finalSections;

            await test.save(txn);

            await Promise.all(tasks.map(task => task()));
        });

        return response.success(test);
    }
    
    /**
    * Delete a testsection with id.
    * DELETE testsections/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'delete')) {
            throw new PermissionDeniedException();
        }

        const testSection = await TestSection.findOrFail(params.id);

        await testSection.delete();

        return response.success(testSection);
    }
}

module.exports = TestSectionController;
