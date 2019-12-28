'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class QuestionOptionSchema extends Schema {
    up () {
        this.create('question_options', (table) => {
            table.increments();
            
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions').onDelete("CASCADE").onUpdate("NO ACTION");

            table.integer('number');
            table.text('description').notNullable();

            table.timestamps();

            
            table.unique(['question_id', 'number']);
        });
    }
    
    down () {
        this.drop('question_options');
    }
}

module.exports = QuestionOptionSchema;
