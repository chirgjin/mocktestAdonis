'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class QuestionSolutionSchema extends Schema {
    up () {
        this.create('question_solutions', (table) => {
            table.increments();
            
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions').onDelete("CASCADE").onUpdate("NO ACTION");
            
            table.text('description').notNullable();
        });
    }
    
    down () {
        this.drop('question_solutions');
    }
}

module.exports = QuestionSolutionSchema;
