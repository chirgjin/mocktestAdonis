'use strict';

const { Command } = require('@adonisjs/ace');
const Helpers = use("Helpers");
const randomString = use("App/Helpers/randomString");
const path = require("path");
const fs = require("fs");

class EnvGenerate extends Command {
    static get signature () {
        return `
        env:generate
        { dbUser : Username for database }
        { dbName : Name of database }
        { dbPass? : Password for database user}
        { --host?=@value : Hostname.}
        { --app_key?=@value : App Secret key to use. Generates a random key by default }
        { --store : If provided, stores result as .env file }
        `;
    }

    static get description () {
        return 'Generate a new .env file using .env.example';
    }

    async handle (args, options) {
        let env = fs.readFileSync(
            path.join(Helpers.appRoot(), ".env.example")
        ).toString();

        env = env
            .replace(/%HOST%/ig, args.host || '')
            .replace(/%DB_USER%/ig, args.dbUser)
            .replace(/%DB_PASS%/ig, args.dbPass || '')
            .replace(/%DB_NAME%/ig, args.dbName)
            .replace(/%APP_KEY%/ig, options.app_key || randomString(32));
        
        if(options.store) {
            fs.writeFileSync(
                path.join(Helpers.appRoot(), ".env"),
                env
            );
        }

        if(!Helpers.isAceCommand()) {
            return env;
        }
        else {
            console.log(env);
        }
            
    }
}

module.exports = EnvGenerate;
