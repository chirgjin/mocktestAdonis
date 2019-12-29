'use strict';

const { Command } = require('@adonisjs/ace');
const User = use("App/Models/User");
const Database = use("Database");

class MakeSuperuser extends Command {
    static get signature () {
        return `
        make:superuser
        { --admin : Create admin instead of super admin }
        { --verified : Mark user as email verified. Defaults to no }
        `;
    }

    static get description () {
        return 'Creates a new superuser for the app';
    }

    async handle (args, options) {
        const data = {};

        while(true) {
            data.username = await this.ask("Enter your Username: ");

            if(await User.query().where('username', data.username).getCount() == 0) {
                break;
            }
            else {
                this.error("Username already exists");
            }
        }

        while(true) {
            data.email = await this.ask("Enter your Email: ", `${data.username}@mocktestindia.com`);

            if(await User.query().where('email', data.email).getCount() == 0) {
                break;
            }
            else {
                this.error("Email already exists");
            }
        }

        data.password = await this.secure("Enter your Password: ");

        data.roles = ['student', 'admin'];

        if(!options.admin) {
            data.roles.push('superAdmin');
        }

        data.firstname = data.username;

        if(options.verified) {
            data.email_verified = 1;
        }

        await User.create(data);

        this.completed("create", "Successfully created new superuser");

        Database.close();
    }
}

module.exports = MakeSuperuser;
