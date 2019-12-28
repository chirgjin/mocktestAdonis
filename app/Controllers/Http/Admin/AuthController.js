'use strict';

const User = use("App/Models/User");
const validate = use("App/Helpers/validate");

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

            const payload = await auth.authenticator('jwtAdmin')._verifyToken(token.token);

            // console.log(payload)

            const user = await User.find(payload.uid);
            
            if(user.roles.indexOf("admin") == -1 && user.roles.indexOf("superAdmin") == -1) {
                return response.error("Invalid Credentials", 401);
            }

            await user.load('permissions');

            return response.success({
                token : token.token,
                user : user
            });
        }
        catch(e) {
            // console.error(e);
            return response.error("Invalid credentials", 401);
        }
    }
}

module.exports = AuthController;
