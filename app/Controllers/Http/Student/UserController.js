'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

const {User} = use("App/Models")
const Mail = use("Mail")
const { validate } = use('Validator')

const {WaitTimeException, FieldException } = use("App/Exceptions")

const EMAIL_WAIT = 30
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
            return response.error({ field : 'email', message : 'User doesn\'t have email'}, 422)
        }

        const now = Date.now()/1000;
        user.activation_token = parseInt(user.activation_token) || 0
        
        if(user.activation_token && user.activation_token + EMAIL_WAIT > now) {
            throw new WaitTimeException(now - user.activation_token - EMAIL_WAIT)
        }

        const token = await auth
        .authenticator('jwtConfirmEmail')
        .generate(user, true)

        const payload = await auth.authenticator('jwtConfirmEmail')._verifyToken(token.token);

        user.activation_token = payload.iat

        console.log(payload)

        await user.save()

        // console.log(token.token);
        await Mail.raw(`Email Confirmation token = ${token.token}`, message => {
            message
            .from( Env.get('MAIL_USERNAME', `no-reply@${Env.get('HOST', 'localhost')}`), 'no-reply')
            .to(email, user.firstname)
            .subject('Confirm Email')
        })

        return response.success(true)
    }

    /**
     * Confirms email against the mailed token
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
            return response.error({field : 'email', message : 'User doesn\'t have email'}, 422)
        }

        const now = Date.now();
        user.activation_token = parseInt(user.activation_token) || 0

        const payload = await auth.authenticator('jwtConfirmEmail')._verifyToken(request.input("token"));

        if(!payload || payload.iat != user.activation_token || user.email != payload.data.token) {
            throw new FieldException('token', 'Invalid Token')
        }

        user.activation_token = null
        user.email_verified = true

        await user.save()

        return response.success(true)               
    }


    /**
     * Requests activation email
     * PUT /me
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update ({ request, response, auth }) {
        const {email} = request.post();
        const user = auth.user;

        if(!user.email && user.email) {
            const v = await validate({email}, {
                email : "required|email|unique:users,email",
            })

            if(v.fails()) {
                return response.error(v.messages())
            }

            user.email = email;
            user.email_verified = false
        }

        const v = await validate(request.post(), {
            mobile_number : "number|unique:users,mobile_number",
            firstname : 'string',
            lastname : 'string',
            college : 'string',
        })

        if(v.fails()) {
            return response.error(v.messages())
        }

        if(mobile_number) {
            user.mobile_number = mobile_number
            user.mobile_verified = false
        }

        user.merge(request.only(['firstname', 'lastname', 'college']))

        await user.save()

        return response.success(user)
    }

}

module.exports = UserController
