'use strict';

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const User = use("App/Models/User");

class UserSeeder {
    async run () {
        if(await User.query().whereIn('username', ['admin', 'mocktestindia']).getCount() > 0) {
            return console.log("One or more superuser already exists");
        }

        await User
            .createMany([
                {
                    username : "admin",
                    password : "admin123",
                    roles : ['admin', 'student'],
                    firstname : "Admin",
                },
                {
                    username : "mocktestindia",
                    password : "mocktestadmin123",
                    roles : ['admin', 'superAdmin', 'student'],
                    firstname : "SuperAdmin",
                }
            ]);
    }
}

module.exports = UserSeeder;
