'use strict';

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env');

module.exports = {
    /*
    |--------------------------------------------------------------------------
    | Authenticator
    |--------------------------------------------------------------------------
    |
    | Authentication is a combination of serializer and scheme with extra
    | config to define on how to authenticate a user.
    |
    | Available Schemes - basic, session, jwt, api
    | Available Serializers - lucid, database
    |
    */
    authenticator: 'jwtStudent',
    
    /*
    |--------------------------------------------------------------------------
    | Session
    |--------------------------------------------------------------------------
    |
    | Session authenticator makes use of sessions to authenticate a user.
    | Session authentication is always persistent.
    |
    */
    session: {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'session',
        uid: 'email',
        password: 'password'
    },
    
    /*
    |--------------------------------------------------------------------------
    | Basic Auth
    |--------------------------------------------------------------------------
    |
    | The basic auth authenticator uses basic auth header to authenticate a
    | user.
    |
    | NOTE:
    | This scheme is not persistent and users are supposed to pass
    | login credentials on each request.
    |
    */
    basic: {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'basic',
        uid: 'email',
        password: 'password'
    },
    
    /*
    |--------------------------------------------------------------------------
    | Jwt
    |--------------------------------------------------------------------------
    |
    | The jwt authenticator works by passing a jwt token on each HTTP request
    | via HTTP `Authorization` header.
    |
    */
    jwtStudent: {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'jwt',
        uid: 'username',
        password: 'password',
        options: {
            algorithm : Env.get('JWT_ALGO', 'HS256'),
            expiresIn : Env.get('JWT_EXPIRY', '1d'),
            audience : 'student',
            issuer : Env.get('APP_NAME', 'MockTestIndia'),
            subject : 'login',
            secret: Env.get('APP_KEY'),
        }
    },
    jwtAdmin : {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'jwt',
        uid: 'username',
        password: 'password',
        options: {
            algorithm : Env.get('JWT_ALGO', 'HS256'),
            expiresIn : Env.get('JWT_EXPIRY', '1d'),
            audience : 'admin',
            issuer : Env.get('APP_NAME', 'MockTestIndia'),
            subject : 'login',
            secret: Env.get('APP_KEY'),
        }
    },
    jwtResetPass : {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'jwt',
        uid: 'username',
        password: 'password',
        options: {
            algorithm : Env.get('JWT_ALGO', 'HS256'),
            expiresIn : Env.get('JWT_EXPIRY', '1d'),
            audience : 'student',
            issuer : Env.get('APP_NAME', 'MockTestIndia'),
            subject : 'resetPassword',
            secret: Env.get('APP_KEY'),
        }
    },
    jwtConfirmEmail : {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'jwt',
        uid: 'username',
        password: 'password',
        options: {
            algorithm : Env.get('JWT_ALGO', 'HS256'),
            expiresIn : Env.get('JWT_EXPIRY', '1d'),
            audience : 'student',
            issuer : Env.get('APP_NAME', 'MockTestIndia'),
            subject : 'resetPassword',
            secret: Env.get('APP_KEY'),
        }
    },
    
    /*
    |--------------------------------------------------------------------------
    | Api
    |--------------------------------------------------------------------------
    |
    | The Api scheme makes use of API personal tokens to authenticate a user.
    |
    */
    api: {
        serializer: 'lucid',
        model: 'App/Models/User',
        scheme: 'api',
        uid: 'email',
        password: 'password'
    }
};
