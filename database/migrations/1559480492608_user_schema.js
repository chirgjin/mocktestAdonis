'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserSchema extends Schema {
    up () {
        this.create('users', (table) => {
            table.increments();

            table.string('username', 80).notNullable().unique();
            table.string('email', 254).unique();
            table.string('mobile_number', 15).unique();
            
            table.string('password', 60).notNullable();
            table.string('roles', 50).notNullable().defaultTo('student');
            table.string('firstname', 50).notNullable();
            table.string('lastname', 50);
            table.string('college', 255);
            
            table.boolean('email_verified').defaultTo(false);
            table.boolean('mobile_verified').defaultTo(false);
            
            table.integer('activation_token');
            table.integer('reset_token');
            table.integer('login_token');

            table.timestamps();

        });
    }
    
    down () {
        this.drop('users');
    }
}

module.exports = UserSchema;
