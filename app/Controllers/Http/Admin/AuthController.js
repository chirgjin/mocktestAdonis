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
        
        const v = await validate(request.post(), rules);
        if(v.fails()) {
            return response.error(v.messages());
        }

        try {
            const token = await auth
            .authenticator('jwtAdmin')
            .attempt(username, password, true);

            console.log(token)
            const payload = await auth.authenticator('jwtAdmin')._verifyToken(token.token);
            const user = payload.data;
            
            if(user.roles.indexOf("admin") == -1 && user.roles.indexOf("superAdmin") == -1) {
                return response.error("Invalid Credentials", 401);
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
}

module.exports = AuthController
