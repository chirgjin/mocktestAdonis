'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models')} */
const {Test, TestSection, Exam, Difficulty, ExamSection} = use("App/Models");
// const MissingValueException = use("App/Exceptions/MissingValueException");
// const NotFoundException = use("App/Exceptions/NotFoundException");
const {NotFoundException, MissingValueException, PermissionDeniedException, FieldException } = use("App/Exceptions");
const validate = use("App/Helpers/validate");
const Helpers = use("App/Helpers");

/**
* Resourceful controller for interacting with tests
*/
class TestController {
    /**
    * Show a list of all tests.
    * GET tests
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async index ({ request, response, auth}) {

        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = Test.query();

        if(request.input("name")) {
            q.where("name", "LIKE", `%${request.input("name")}%`);
        }
        if(request.input("description")) {
            q.where("description", "LIKE", `%${request.input("description")}`);
        }
        if(request.input("created_by")) {
            q.where("created_by", parseInt(request.input("created_by")));
        }

        if(request.input("with_sections", 1) == '1') {
            q.with("sections", (builder) => {
                builder.orderByNum();
                if(request.input("with_questions", 1) == '1') {
                    builder.with('questions', builder => builder.withAll().with('solution'));
                }
            });
        }

        const tests = await q.fetch();

        return response.success(tests);
    }
    
    /**
    * Create/save a new test.
    * POST tests
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
            exam_id : "required|integer",
            exam_section_id : "required|integer",
            difficulty : "required",
            description : "required",
            instructions: "required",
            negative_marks : "integer|range:-1,11",
            duration : "required|integer|range:0,36001",
            marks : "required|integer|range:0,51",
            options : "required|integer|range:-1,11",
            slab_good : "number|range:-1,101",
            slab_fail : "number|range:-1,101",

            test_sections : "array",
            "test_sections.*.duration" : "integer|range:0,36001",
            "test_sections.*.name" : "required|string",
            "test_sections.*.number" : "integer"
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        let sections = request.input("test_sections");
        let images = request.input("images");

        if(Array.isArray(sections)) {
            const len = sections.filter((section,i) => {
                if(!section.name) {
                    throw new MissingValueException(`sections.${i}.name`);
                }
                return section.duration != null && section.duration > 0;
            }).length;

            if(len > 0 && len != sections.length) {
                return response.error({field:"sections", message: "Either all sections should have duration or none"});
            }
        }


        //verify exam, examSection & difficulty are valid
        const testData = request.only(['exam_id', 'exam_section_id', 'difficulty', 'description', 'instructions', 'negative_marks', 'duration', 'enabled', 'review_enabled', 'marks', 'options', 'slab_good', 'slab_fail']);

        await Exam.findOrFail(testData.exam_id);
        await ExamSection.findOrFail(testData.exam_section_id);
        await Difficulty.findOrFail(testData.difficulty);

        testData.created_by = auth.user.id;
        

        if(Array.isArray(images)) {
            for(let i=0;i<images.length;i++) {
                images[i] = await Helpers.storeImage({
                    image : new Buffer(images[i], 'base64'),
                    type : 'test'
                });
            }

            testData.instructions = Helpers.parseImages(testData.instructions, images.map(img => img.url));
        }




        const test = await Test.create(testData);


        if(sections && Array.isArray(sections) && sections.length > 0) {
            
            sections = sections.map((section,i) => {
                return {
                    name : section.name,
                    number : section.number || i,
                    duration : section.duration || null,
                    test_id : test.id
                };
            });

            await TestSection.createMany(sections);//create dem sections
        }

        await test.load('sections');

        return response.success(test);
    }
    
    /**
    * Display a single test.
    * GET tests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async show ({ params, request, response, auth}) {

        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = Test.query().where('id', params.id);

        if(request.input('with_sections', 1) == '1') {
            q.with('sections', builder => {
                if(request.input('with_questions', 1) == '1') {
                    builder.with('questions');
                }
            });
        }

        q.with('exam')
            .with('examSection')
            .with('createdBy');


        const test = await q.first();

        if(!test) {
            throw new NotFoundException('Test');
        }

        return response.success(test);
    }
    
    /**
    * Update test details.
    * PUT or PATCH tests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'update')) {
            throw new PermissionDeniedException();
        }

        const test = await Test.findOrFail(params.id);

        
        const v = await validate(request.post(), {
            exam_id : "integer",
            exam_section_id : "integer",
            difficulty : "alphaNumeric",
            description : "string",
            instructions: "string",
            negative_marks : "integer|range:-1,11",
            duration : "integer|range:0,36001",
            marks : "integer|range:0,51",
            options : "integer|range:-1,11",
            slab_good : "number|range:-1,101",
            slab_fail : "number|range:-1,101"
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        
        //verify exam, examSection & difficulty are valid
        const testData = request.only(['exam_id', 'exam_section_id', 'difficulty', 'description', 'instructions', 'negative_marks', 'duration', 'enabled', 'review_enabled', 'marks', 'options', 'slab_good', 'slab_fail']);

        if(!await Exam.find(testData.exam_id)) {
            throw new FieldException('exam_id', "Given exam does not exist in db");
        }
        else if(!await ExamSection.find(testData.exam_section_id)) {
            throw new FieldException("exam_section_id", "Given exam section does not exist in db");
        }
        else if(!await Difficulty.find(testData.difficulty)) {
            throw new FieldException("difficulty", "Given difficulty does not exist in db");
        }

        test.merge(testData);

        await test.save();

        return response.success(test);

    }
    
    /**
    * Delete a test with id.
    * DELETE tests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'delete')) {
            throw new PermissionDeniedException();
        }

        const test = await Test.findOrFail(params.id);

        await test.delete();

        return response.success(true);
    }
    
}

module.exports = TestController;
