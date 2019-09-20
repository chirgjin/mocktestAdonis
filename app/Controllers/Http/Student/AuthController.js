'use strict'

const User = use("App/Models/User");
const { validate } = use('Validator')
const RESET_TIME = 3600

class AuthController {

    async login({request, response, auth}) {

        const { username, password } = request.post();
        
        const rules = {
            username: 'required',
            password: 'required'
        };
        const v = await validate(request.post(), rules);
        if(v.fails()) {
            return response.error(v.messages());
        }

        try {
            const token = await auth
            .authenticator('jwtStudent')
            .attempt(username, password, true);

            // console.log(token)
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
            console.log(e);
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

        const payload = await auth.authenticator('jwtResetPass')._verifyToken(token.token);
        
        user.reset_token = payload.iat;
        await user.save()
        
        console.log(token.token);
        //todo : mail token to user

        return response.success(true);
    }

    async resetPassword({request, response, auth}) {

        try {
            const user = await auth
            .authenticator('jwtResetPass')
            .getUser();

            const payload = auth.authenticator('jwtResetPass').jwtPayload;

            if(user.reset_token != payload.iat) {
                return response.error("Invalid or expired reset token");
            }
            
            const now = Date.now()/1000;

            if(now > payload.iat + RESET_TIME) {
                return response.error("Expired reset token");
            }

            const { password } = request.post();

            const v = await validate(request.post(), {
                password : "required|min:6|max:100",
                confirm_password : "required|same:password",
            });

            if(v.fails()) {
                return response.error(v.messages());
            }

            user.password = password;
            user.reset_token = null;
            await user.save();


            return response.success(true);
        }
        catch(e) {
            console.error(e);
            return response.error("Invalid credentials", 401);
        }
    }
}

module.exports = AuthController
