'use strict'

const User = use("App/Models/User");

class AuthController {

    async login({request, response, auth}) {

        const { username, password } = request.all();
        
        const token = await auth
        .authenticator('jwtStudent')
        .attempt(username, password);

        return token;
    }
}

module.exports = AuthController
