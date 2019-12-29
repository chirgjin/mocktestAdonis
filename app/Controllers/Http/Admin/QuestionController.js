'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const {TestSection, Difficulty, Question, QuestionDirection, QuestionOption, QuestionSolution} = use("App/Models");
// const MissingValueException = use("App/Exceptions/MissingValueException");
// const NotFoundException = use("App/Exceptions/NotFoundException");
// const FieldException = use("App/Exceptions/FieldException")
const { FieldException, NotFoundException, MissingValueException, PermissionDeniedException } = use("App/Exceptions");
const validate = use("App/Helpers/validate");
const Helpers = use("App/Helpers");
const Database = use('Database');

const WordParser = use("App/Helpers/WordParser");

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
    async index ({ request, response, auth }) {
        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = Question.query();

        if(request.input("test_section_id")) {
            q.whereHas('sections', builder => {
                builder.where('test_section_id', request.input('test_section_id'));
            });
        }

        if(request.input('test_id')) {
            q.whereHas('tests', builder => {
                builder.where('test_id', request.input('test_id'));
            });
        }

        const page = parseInt(request.input("page", 1)) || 1;

        const questions = await q.paginate(page);

        return response.success( questions );
    }
    
    /**
    * Create/save a new question.
    * POST questions
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
            questions : "required|array",
            "questions.*.difficulty" : "required|alphaNumeric",
            "questions.*.description" : "required",
            "questions.*.type" : "required|integer|range:0,3",
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

        let { questions, images, directions } = request.post();
        images = Array.isArray(images) ? images : [];
        directions = Array.isArray(directions) ? directions : [];

        // console.log(questions);

        for(let i=0;i<questions.length;i++) {
            const question = questions[i];

            if(question.type == 1) { //type 1 means mcq
                if(!question.options || !Array.isArray(question.options) || !question.options[0]) {
                    throw new MissingValueException(`questions.${i}.options`);
                }
                else if(!question.options[question.answer]) {
                    // const err = new Error(`questions.${i}.answer is incorrect`);
                    // err.field = `questions.${i}.answer`;
                    // throw err;
                    throw new FieldException(`questions.${i}.answer`, `questions.${i}.answer is incorrect`);
                }

                question.options = question.options.map( (option,i) => {
                    if(typeof option == 'string') {
                        option = {description : option };
                    }

                    if(!option.hasOwnProperty("number")) {
                        option.number = i;
                    }

                    return option;
                });

                question.answer = question.options[question.answer].number;
            }
            else if(question.options && question.options.length > 0) {
                // const err = new Error(`questions.${i} can not have options`);
                // err.field = `questions.${i}.options`;
                // throw err;
                throw new FieldException(`questions.${i}.options`, `questions.${i} can not have options`);
            }

            if(typeof question.direction == 'number' && !directions[question.direction]) {
                throw new FieldException(`questions.${i}.direction`, `questions.${i}.direction doesn't exist in directions array!`);
            }
            else if(question.direction && question.direction.id > 0) {
                const direction = await QuestionDirection.find(question.direction.id);
                if(!direction) {
                    throw new FieldException(`questions.${i}.direction`, `questions.${i}.direction doesn't exist in db`);
                }
            }


            const diff = await Difficulty.find(question.difficulty);

            if(!diff) {
                throw new FieldException(`questions.${i}.difficulty`, `questions.${i}.difficulty doesn't exist in db`);
            }

            if(question.test_section_id) {
                const section = await TestSection.find(question.test_section_id);

                if(!section) {
                    throw new FieldException(`questions.${i}.test_section`, `questions.${i}.test_section doesn't exist in db`);
                }
            }

        }

        
        const transaction = await Database.beginTransaction();

        const solutions = [];
        let options = [];

        try {

            const createdImages = await Helpers.storeImages(images, transaction);
            const createdImageUrls = createdImages.map(img => img.url);

            const createdDirections = await QuestionDirection.createMany(directions.map(direction => {
                return {
                    description : Helpers.parseImages(direction, createdImageUrls),
                };
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
                };
            }), transaction);

            questions.forEach( (question,i) => {
                if(question.options) {
                    
                    options = options.concat(question.options.map(option => {
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

                // console.log(createdQuestion, optionsCreated);


                createdQuestion.answer = options[question.answer].id;

                updateProms.push(createdQuestion.save(transaction));

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
    async show ({ params, response, auth }) {
        if(!await auth.user.canPerformAction('test', 'read')) {
            throw new PermissionDeniedException();
        }

        const q = Question.query()
            .withAll()
            .with('solution')
            .with('images')
            .setHidden([])
            .where('id', params.id);

        const question = await q.first();
        if(!question) {
            throw new NotFoundException('Question');
        }

        return response.success(question);
    }
    
    /**
    * Update question details.
    * PUT or PATCH questions/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {

        if(!await auth.user.canPerformAction('test', 'update')) {
            throw new PermissionDeniedException();
        }

        const question = await Question.findOrFail(params.id);

        const v = await validate(request.post(), {
            "difficulty" : "alphaNumeric",
            "description" : "string",
            "type" : "integer|range:0,3",
            "answer" : "integer",
            "avg_time" : "number",
            "direction" : "integer",
            "options" : "array",
            "options.*.id" : "integer",
            "options.*.number" : "integer",
            "options.*.description" : "string",
            "solution" : "string",
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const editableFields = ['difficulty', 'description', 'type', 'answer', 'avg_time', ];

        question.merge(request.only(editableFields));

        const diff = await Difficulty.find(question.difficulty);

        if(!diff) {
            throw new FieldException(`difficulty`, `difficulty doesn't exist in db`);
        }

        await question.loadMany(['options', 'solution']);

        await Database.transaction(async (transaction) => {
        
            const {options} = request.post();

            if(question.type == Question.ORDER) {
                //delete all the options from db

                await question
                    .options()
                    .transacting(transaction)
                    .delete();
            }
            else if(options && Array.isArray(options)) {

                const existingOptions = question.getRelated('options').rows;

                const deleteOptions = [];
                const tasks = [];

                question.answer = null;

                existingOptions.forEach(eOpt => {
                    let flag = 0;
                    options.forEach( (opt) => {
                        if(opt.id == eOpt.id) {
                            flag = 1;

                            eOpt.number = opt.number;
                            eOpt.description = opt.description;

                            tasks.push(
                                () => eOpt.save(transaction)
                            );

                            if(opt.isAnswer) {
                                question.answer = eOpt.id;
                            }

                            opt.handled = true;
                        }
                    });

                    if(!flag) {
                        deleteOptions.push(eOpt.id);
                    }
                });

                options.forEach((opt, i) => {
                    if(!opt.handled) {
                        //need to create this option in db

                        tasks.push(() => {
                            question
                                .options()
                                .create({
                                    number : opt.hasOwnProperty('number') ? opt.number : i,
                                    description : opt.description,
                                }, transaction)
                                .then(option => {
                                    if(opt.isAnswer) {
                                        question.answer = option.id;
                                    }
                                });
                        });
                    }
                });


                if(deleteOptions.length > 0) {
                    await QuestionOption
                        .query()
                        .transacting(transaction)
                        .whereIn('id', deleteOptions)
                        .delete();
                }

                await Promise.all(tasks.map(task => task()));

                delete question.$relations.options;
            }

            const solution = request.input("solution");

            if(solution !== undefined) {

                if(!solution) {
                    await question
                        .solution()
                        .transacting(transaction)
                        .delete();
                }
                else {
                    const sol = question.getRelated('solution');

                    if(sol) {
                        sol.description = solution;
                        await sol.save(transaction);
                    }
                    else {
                        await question
                            .solution()
                            .create({
                                description : solution
                            }, transaction);
                    }

                    // throw new FieldException("solution", "Dont know shit to do rn");
                }
            }
            
            question.$relations = {}; //delete loaded relations

            question.$relations.solution = await question.solution().transacting(transaction).first();
            question.$relations.direction = await question.direction().transacting(transaction).first();
            question.$relations.options = await question.options().transacting(transaction).fetch();
            

            if(question.getRelated("options").rows.length < 1 && question.type == Question.MCQ) {
                throw new FieldException("options", "MCQ question must have at least 1 option");
            } 
            else if(!question.answer) {
                throw new FieldException("answer", "Question must have at least one answer");
            }
            
            await question.save(transaction);
        });


        question.setHidden([]);
        
        return response.success(question);
        // catch (e) {

        //     console.log(e);

        //     await transaction.rollback();

        //     throw e;
        // }
    }
    
    /**
    * Delete a question with id.
    * DELETE questions/:id
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async destroy ({ params, response, auth }) {
        if(!await auth.user.canPerformAction('test', 'delete')) {
            throw new PermissionDeniedException();
        }

        const question = await Question.findOrFail(params.id);

        await Database.beginTransaction(async (transaction) => {

            // await question
            //     .options()
            //     .transacting(transaction)
            //     .delete();
            
            // await question
            //     .solution()
            //     .transacting(transaction)
            //     .delete();
            
            if(question.direction_id) {
                const ct = await Question.query().transacting(transaction).where('direction_id', question.direction_id).getCount();

                if(ct == 1) {
                    await question
                        .direction()
                        .transacting(transaction)
                        .delete();
                }
            }

            // await question
            //     .images()
            //     .transacting(transaction)
            //     .delete();
            
            await question.delete(transaction);

        });
        
        return response.error(true);
    }



    
    
    /**
    * Upload Questions via Word Zip File
    * POST questions/upload
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async upload ({ request, response, auth }) {
        if(!await auth.user.canPerformAction('test', 'create')) {
            throw new PermissionDeniedException();
        }

        const zipFile = request.file('file', {
            extnames : ['zip'],
        });
        if(!zipFile) {
            throw new MissingValueException('file');
        }

        const parser = new WordParser();

        await parser.extractZip(zipFile.tmpPath);

        const data = await parser.parse();

        await parser.cleanup();

        return response.success(data);
    }
}

module.exports = QuestionController;
