'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class QuestionDirectionSchema extends Schema {
    up () {
        this.create('question_directions', (table) => {
            table.increments();
            
            table.text('description').notNullable();

            table.timestamps();
        });
    }
    
    down () {
        this.drop('question_directions');
    }
}

module.exports = QuestionDirectionSchema;
