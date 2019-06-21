'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const {Test, TestSection, Difficulty, Question, QuestionDirection, QuestionOption, QuestionSolution} = use("App/Models");
const MissingValueException = use("App/Exceptions/MissingValueException");
const NotFoundException = use("App/Exceptions/NotFoundException");
const { validate } = use('Validator')
const Helpers = use("App/Helpers")
const Database = use('Database')

/**
* Resourceful controller for interacting with questions
*/
class QuestionController {
    /**
    * Show a list of all questions.
    * GET questions
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, view }) {
    }
    
    /**
    * Create/save a new question.
    * POST questions
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response }) {
        const v = await validate(request.post(), {
            questions : "required|array",
            "questions.*.difficulty" : "required|alphaNumeric",
            "questions.*.description" : "required",
            "questions.*.type" : "required|integer|min:1|max:2",
            "questions.*.answer" : "required|integer",
            "questions.*.avg_time" : "number",
            "questions.*.direction" : "integer",
            "questions.*.options" : "array",
            "questions.*.options.*.number" : "integer",
            "questions.*.options.*.description" : "required|string",
            "questions.*.solution" : "string",
            images : "array",
            "images.*.type" : "required|in:question,questionDirection,questionOption,questionSolution",
            "images.*.base64" : "required|string",
            directions : "array",
            "directions.*" : "string",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const { questions, images, directions } = request.post();
        

        for(let i=0;i<questions.length;i++) {
            const question = questions[i];

            if(question.type == 1) { //type 1 means mcq
                if(!question.options || !Array.isArray(question.options) || !question.options[0]) {
                    throw new MissingValueException(`questions.${i}.options`);
                }
                else if(!question.options[question.answer]) {
                    const err = new Error(`questions.${i}.answer is incorrect`);
                    err.field = `questions.${i}.answer`;
                    throw err;
                }

                question.options = question.options.map( (option,i) => {
                    if(typeof option == 'string') {
                        option = {description : option };
                    }

                    if(!option.hasOwnProperty("number")) {
                        option.number = i;
                    }
                });
            }
            else if(question.options && question.options.length > 0) {
                const err = new Error(`questions.${i} can not have options`);
                err.field = `questions.${i}.options`;
                throw err;
            }

            if(typeof question.direction == 'number' && !directions[question.direction]) {
                throw new Error(`questions.${i}.direction doesn't exist in directions array!`)
            }
            else if(question.direction && question.direction.id > 0) {
                const direction = await QuestionDirection.find(question.direction.id);
                if(!direction) {
                    throw new Error(`questions.${i}.direction doesn't exist in db`);
                }
            }


            const diff = await Difficulty.find(question.difficulty);

            if(!diff) {
                throw new Error(`questions.${i}.difficulty doesn't exist in db`);
            }

            if(question.test_section_id) {
                const section = await TestSection.find(question.test_section_id);

                if(!section) {
                    throw new Error(`questions.${i}.test_section doesn't exist in db`);
                }
            }

        }

        
        const transaction = await Database.beginTransaction()

        const solutions = [];
        const options = [];

        try {

            const createdImages = await Helpers.storeImages(images, transaction);
            const createdImageUrls = createdImages.map(img => img.url);

            const createdDirections = await QuestionDirection.createMany(directions.map(direction => {
                return {
                    description : Helpers.parseImages(direction, createdImageUrls),
                }
            }), transaction);
            const createdQuestions = await Question.createMany(questions.map(question => {
                let dirId;
                if(question.direction && question.direction.id) {
                    dirId = question.direction.id;
                }
                else if(typeof question.direction == 'number' && createdDirections[question.direction]) {
                    dirId = createdDirections[question.direction].id;
                }

                return {
                    direction_id : dirId,
                    difficulty : question.difficulty,
                    description : Helpers.parseImages(question.description, createdImageUrls),
                    type : question.type,
                    avg_time : question.avg_time,
                    answer : question.answer,
                }
            }), transaction);

            questions.forEach( (question,i) => {
                if(question.options) {
                    options.concat(question.options.map(option => {
                        option.description = Helpers.parseImages(option.description, createdImageUrls);
                        option.question_id = createdQuestions[i].id;
                        return option;
                    }));
                }

                if(question.solution) {
                    solutions.push({
                        question_id : createdQuestions[i].id,
                        description : Helpers.parseImages(question.solution, createdImageUrls),
                    });
                }
            });


            const solutionsCreated = await QuestionSolution.createMany(solutions, transaction);

            const optionsCreated = await QuestionOption.createMany(options, transaction);


            const updateProms = [];

            createdQuestions.forEach( (createdQuestion,i) => {
                const question = questions[i];

                if(question.type != 1) {
                    return ;
                }

                const options = question.options.map(option => {
                    return optionsCreated.filter(opt => {
                        return opt.question_id == createdQuestion.id && opt.description == option.description;
                    })[0];
                });

                question.answer = options[questions.answer].id;

                updateProms.push(question.save(transaction));

                if(question.test_section_id) {
                    updateProms.push(question.sections().attach([question.test_section_id]));
                }
            });

            //questions done, directions done, images done, solutions done, options done, attach questions to section done.. everything done ig
            await Promise.all(updateProms);

            await Promise.all(createdImages.map(image => {
                let arr;
                if(image.type == 'question') {
                    arr = createdQuestions;
                }
                else if(image.type == 'questionDirection') {
                    arr = createdDirections;
                }
                else if(image.type == 'questionOption') {
                    arr = optionsCreated;
                }
                else if(image.type == 'questionSolution') {
                    arr = solutionsCreated;
                }

                image.reference_id = arr.filter(obj => obj.description.indexOf(image.url) > -1)[0].id;

                return image.save();
            }));

            await transaction.commit();

            return response.success({
                questions : createdQuestions,
                directions : createdDirections,
                options : optionsCreated,
                solutions : solutionsCreated,
            });
        }
        catch (e) {
            await transaction.rollback();

            throw e;
        }
    }
    
    /**
    * Display a single question.
    * GET questions/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, view }) {

        const q = Question.query()
        .withAll()
        .with('solution')
        .where('id', params.id);

        const question = await q.fetch();
        if(question.length < 1) {
            throw new NotFoundException('Question');
        }

        return response.success(question[0]);
    }
    
    /**
    * Update question details.
    * PUT or PATCH questions/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response }) {
    }
    
    /**
    * Delete a question with id.
    * DELETE questions/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, request, response }) {
    }
}

module.exports = QuestionController
