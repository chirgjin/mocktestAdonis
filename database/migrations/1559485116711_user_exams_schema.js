'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserExamsSchema extends Schema {
    up () {
        this.create('user_exams', (table) => {
            table.increments();
            
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete("CASCADE").onUpdate("NO ACTION");
            table.integer('exam_id').unsigned().notNullable().references('id').inTable('exams').onDelete("CASCADE").onUpdate("NO ACTION");

            
            table.unique(['user_id', 'exam_id']);
        });
    }
    
    down () {
        this.drop('user_exams');
    }
}

module.exports = UserExamsSchema;
