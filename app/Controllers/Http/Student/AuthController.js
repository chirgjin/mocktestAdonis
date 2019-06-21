'use strict'

const User = use("App/Models/User");
const { validate } = use('Validator')

class AuthController {

    async login({request, response, auth}) {

        const { username, password } = request.post();
        
        const rules = {
            username: 'required',
            password: 'required'
        };
        const v = validate(request.post(), rules);
        if(v.fails()) {
            
        }

        const token = await auth
        .authenticator('jwtStudent')
        .attempt(username, password);

        return token;
    }

    async forgotPassword({request, response, auth}) {

        const { email } = request.post();

        const user = await User.findBy('email', email);

        if(!user) {
            return [{field: "email", message : "Cannot find user with provided email"}];
        }

        const token = await auth
        .authenticator('jwtResetPass')
        .generate(user);
        
        //todo : mail token to user

        return {success: true};
    }
}

module.exports = AuthController
