'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {typeof import('../../../Models')} */
const {Test, TestSection, Exam, Difficulty, ExamSection} = use("App/Models");
const MissingValueException = use("App/Exceptions/MissingValueException");
const NotFoundException = use("App/Exceptions/NotFoundException");
const { validate } = use('Validator')
const Helpers = use("App/Helpers")

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
    async index ({ request, response}) {
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

        if(request.input("with_sections") === '1') {
            q.with("sections", (builder) => {
                builder.orderByNum();
                if(request.input("with_questions") === '1') {
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

        const v = await validate(request.post(), {
            exam_id : "required|integer",
            exam_section_id : "required|integer",
            difficulty : "required",
            description : "required",
            instructions: "required",
            negative_marks : "integer|max:10|min:0",
            duration : "required|integer|min:1|max:36000",
            marks : "required|integer|min:1|max:50",
            options : "required|integer|min:0|max:10",
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
        const testData = request.only(['exam_id', 'exam_section_id', 'difficulty', 'description', 'instructions', 'negative_marks', 'duration', 'enabled', 'review_enabled', 'marks', 'options']);

        const exam = await Exam.findOrFail(testData.exam_id);
        const examSection = await ExamSection.findOrFail(testData.exam_section_id);
        const difficulty = await Difficulty.findOrFail(testData.difficulty);

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
                }
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
    async show ({ params, request, response}) {

        const q = Test.query().where('id', params.id);

        if(request.input('with_sections') == '1') {
            q.with('sections', builder => {
                if(request.input('with_questions') == '1') {
                    builder.with('questions');
                }
            });
        }

        q.with('exam')
        .with('examSection')
        .with('createdBy')


        const test = await q.fetch();

        if(test.length< 1) {
            throw new NotFoundException('Test');
        }

        return response.success(test[0]);
    }
    
    /**
    * Update test details.
    * PUT or PATCH tests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response }) {
    }
    
    /**
    * Delete a test with id.
    * DELETE tests/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, request, response }) {
    }
}

module.exports = TestController
