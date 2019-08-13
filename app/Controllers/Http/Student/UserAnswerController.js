'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const {UserTest, Test, TestSection, UserAnswer, Question} = use("App/Models");

const { validate } = use('Validator')

const { PermissionDeniedException, IncorrectTypeException, BadRequestException, NotFoundException } = use("App/Exceptions");
const getTimeTaken = use("App/Helpers/getTimeTaken")
/**
* Resourceful controller for interacting with useranswers
*/
class UserAnswerController {
    /**
    * Show a list of all useranswers.
    * GET userTest/:user_test_id/answers
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async index ({ request, response, params, auth }) {

        const q = UserAnswer
        .query()
        .where('user_test_id', params.user_test_id)
        .has('userTest', builder => {
            builder.where('user_id', auth.user.id)
        })

        const answers = await q.fetch();

        return response.success(answers)

    }
    
    /**
    * Create/save a new useranswer.
    * POST userTest/:user_test_id/question/:question_id/answer
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async store ({ request, response, params, auth }) {
        
        const q = UserAnswer
        .query()
        .where('user_test_id', params.user_test_id)
        .has('userTest', builder => {
            builder.where('user_id', auth.user.id)
        })
        .where('question_id', params.question_id)
        

        const answer = await q.first();

        if(answer) {
            throw new BadRequestException('question_id', `This question has already been answered once.`)
        }

        const _answer = request.post().answer;

        if(_answer !== null && parseInt(_answer) != _answer) { //neither null nor integer
            throw new IncorrectTypeException('answer', 'integer or null', typeof _answer)
        }

        const question = await Question.findOrFail(params.question_id)
        const userTest = await UserTest.findOrFail(params.user_test_id)

        if(userTest.user_id != auth.user.id) {
            throw new PermissionDeniedException()
        }
        else if(userTest.status != UserTest.ONGOING) {
            throw new BadRequestException('user_test', `This test has been marked as paused/completed`)
        }

        const testSection = await TestSection
        .query()
        .where('test_id', userTest.test_id)
        .has('questions', builder => {
            builder.where('question_id', question.id)
        })
        .first()

        await userTest.loadMany(['sectionsAttempted', 'test'])

        const test = userTest.getRelated('test')

        await UserTest.attemptOrFail(userTest, testSection)

        const isCorrect = Question.isCorrectAnswer(question, _answer)
        
        const timeTaken = getTimeTaken(userTest.updated_at)

        userTest.time_taken += timeTaken

        if(userTest.time_taken >= test.duration) {
            userTest.status = UserTest.COMPLETED
        }

        const userAnswer = await UserAnswer.create({
            user_test_id : userTest.id,
            question_id : question.id,
            answer : _answer,
            correct : isCorrect,
            time_taken : timeTaken,
            flagged : !!request.input("flagged", 0),
        })

        await userTest.save();

        return response.success({
            userTest,
            userAnswer
        })
    }
    
    /**
    * Display a single useranswer.
    * GET userTest/:user_test_id/question/:question_id/answer
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    * @param {View} ctx.view
    */
    async show ({ params, request, response, auth }) {

        const answer = await UserAnswer
        .query()
        .where('question_id', params.question_id)
        .has('userTest', builder => {
            builder
            .where('user_id', auth.user.id)
        })
        .where('user_test_id', params.user_test_id)
        .first()

        if(!answer) {
            throw new NotFoundException('UserAnswer')
        }

        response.success(answer)
    }
    
    /**
    * Update useranswer details.
    * PUT or PATCH userTest/:user_test_id/question/:question_id/answer
    *
    * @param {object} ctx
    * @param {Request} ctx.request
    * @param {Response} ctx.response
    */
    async update ({ params, request, response, auth }) {
        const answer = await UserAnswer
        .query()
        .where('question_id', params.question_id)
        .has('userTest', builder => {
            builder
            .where('user_id', auth.user.id)
        })
        .where('user_test_id', params.user_test_id)
        .first()

        if(!answer) {
            throw new NotFoundException('UserAnswer')
        }

        const _answer = request.post().answer;

        if(_answer !== null && parseInt(_answer) != _answer) { //neither null nor integer
            throw new IncorrectTypeException('answer', 'integer or null', typeof _answer)
        }
        
        const question = await Question.findOrFail(params.question_id)
        const userTest = await UserTest.findOrFail(params.user_test_id)

        if(userTest.user_id != auth.user.id) {
            throw new PermissionDeniedException()
        }
        else if(userTest.status != UserTest.ONGOING) {
            throw new BadRequestException('user_test', `This test has been marked as paused/completed`)
        }

        const testSection = await TestSection
        .query()
        .where('test_id', userTest.test_id)
        .has('questions', builder => {
            builder.where('question_id', question.id)
        })
        .first()

        await userTest.loadMany(['sectionsAttempted', 'test'])

        const test = userTest.getRelated('test')

        await UserTest.attemptOrFail(userTest, testSection)

        const isCorrect = Question.isCorrectAnswer(question, _answer)
        
        const timeTaken = getTimeTaken(userTest.updated_at)

        userTest.time_taken += timeTaken

        if(userTest.time_taken >= test.duration) {
            userTest.status = UserTest.COMPLETED
        }

        answer.merge({
            answer : _answer,
            correct : isCorrect,
            time_taken : answer.time_taken + timeTaken,
            flagged : !!request.input("flagged", answer.flagged),
        })

        await answer.save();

        await userTest.save();

        return response.success({
            userTest,
            userAnswer
        })
    }
}

module.exports = UserAnswerController
