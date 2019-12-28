'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserTestSchema extends Schema {
    up () {
        this.create('user_tests', (table) => {
            table.increments();

            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete("CASCADE").onUpdate("NO ACTION");
            table.integer('test_id').unsigned().notNullable().references('id').inTable('tests').onDelete("CASCADE").onUpdate("NO ACTION");
            table.integer('test_section_id').unsigned().references('id').inTable('test_sections').onDelete("CASCADE").onUpdate("NO ACTION");

            table.integer('status').notNullable().defaultTo(0);
            table.float('time_taken', 10, 3).notNullable().defaultTo(0);
            table.float('marks_obtained', 6, 2).defaultTo(null);
            table.timestamp('completed_at').defaultTo(null);
            
            table.timestamps();

            
            table.unique(['user_id', 'test_id']);
        });
    }
    
    down () {
        this.drop('user_tests');
    }
}

module.exports = UserTestSchema;
