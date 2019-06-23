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
            return response.error(v.messages());
        }

        try {
            const token = await auth
            .authenticator('jwtStudent')
            .attempt(username, password, true);

            console.log(token)
            const payload = await auth.authenticator('jwtStudent')._verifyToken(token.token);
            const user = payload.data;
            
            if(user.roles.indexOf("student") == -1) {
                return response.error("You are not allowed to login here", 401);
            }

            return response.success({
                token : token.token,
                user : user
            });
        }
        catch(e) {
            return response.error("Invalid credentials", 401);
        }
    }

    async forgotPassword({request, response, auth}) {

        const { email } = request.post();

        const user = await User.findBy('email', email);

        if(!user) {
            return [{field: "email", message : "Cannot find user with provided email"}];
        }

        const token = await auth
        .authenticator('jwtResetPass')
        .generate(user, true);
        
        //todo : mail token to user

        return {success: true};
    }
}

module.exports = AuthController
