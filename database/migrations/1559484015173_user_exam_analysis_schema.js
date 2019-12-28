'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class UserExamAnalysisSchema extends Schema {
    up () {
        this.create('user_exam_analyses', (table) => {
            table.increments();

            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete("CASCADE").onUpdate("NO ACTION");
            table.integer('exam_id').unsigned().notNullable().references('id').inTable('exams').onDelete("CASCADE").onUpdate("NO ACTION");
            
            //Answers related
            table.integer('incorrect_answers').notNullable().defaultTo(0);
            table.integer('correct_answers').notNullable().defaultTo(0);
            table.integer('unattempted_answers').notNullable().defaultTo(0);
            table.float('incorrect_time').notNullable().defaultTo(0);
            table.float('correct_time').notNullable().defaultTo(0);
            table.float('unattempted_time').notNullable().defaultTo(0);
            //test related
            table.integer('tests_attempted').notNullable().defaultTo(0);
            table.integer('test_sections_attempted').notNullable().defaultTo(0);
            //marks related
            table.float('marks_obtained').notNullable().defaultTo(0);
            table.float('avg_percentage').notNullable().defaultTo(0);
            table.float('total_percentage').notNullable().defaultTo(0);
            
            table.timestamps();
            
            table.unique(['user_id', 'exam_id']);
        });
    }
    
    down () {
        this.drop('user_exam_analyses');
    }
}

module.exports = UserExamAnalysisSchema;
