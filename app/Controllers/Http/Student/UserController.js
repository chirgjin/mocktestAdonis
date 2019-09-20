'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */


const {User} = use("App/Models")

const {NotFoundException} = use("App/Exceptions")

const EMAIL_TIMER = 1000 * 30
class UserController {

    /**
     * Requests activation email
     * GET /me/send_verification_mail
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async sendActivation ({ params, request, response, auth }) {

        const user = auth.user;

        if(user.email_verified) {
            return response.error('Email already verified', 410)
        }
        else if(!user.email) {
            return response.error({'email' : 'User doesn\'t have email'}, 422)
        }

        const now = Date.now()/1000;
        user.activation_token = parseInt(user.activation_token) || 0
        
        if(user.activation_token && user.activation_token + EMAIL_TIMER > now) {
            return response.error({'wait_time' : now - user.activation_token - EMAIL_TIMER}, 400)
        }

        const token = await auth
        .authenticator('jwtConfirmEmail')
        .generate(user, true)

        const payload = await auth.authenticator('jwtConfirmEmail')._verifyToken(token.token);

        user.activation_token = payload.iat

        console.log(payload)

        await user.save()

        console.log(token.token);
        //todo: mail token to user

        return response.success(true)
    }

    /**
     * Requests activation email
     * GET /me/confirm_email
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async confirmEmail ({ params, request, response, auth }) {
        const user = auth.user;

        if(user.email_verified) {
            return response.error('Email already verified', 410)
        }
        else if(!user.email) {
            return response.error({'email' : 'User doesn\'t have email'}, 422)
        }

        const now = Date.now();
        user.activation_token = parseInt(user.activation_token) || 0

        const payload = await auth.authenticator('jwtConfirmEmail')._verifyToken(request.input("token"));

        if(payload.iat != user.activation_token || user.email != payload.data.token) {
            return response.error('Invalid Token', 400)
        }

        user.activation_token = null
        user.email_verified = true

        await user.save()

        return response.success(true)               
    }

}

module.exports = UserController
