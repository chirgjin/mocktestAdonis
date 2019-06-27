'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TestSectionQuestionsSchema extends Schema {
    up () {
        this.create('test_section_questions', (table) => {
            table.increments()
            
            
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions').onDelete("CASCADE").onUpdate("NO ACTION")
            table.integer('test_section_id').unsigned().notNullable().references('id').inTable('test_sections').onDelete("CASCADE").onUpdate("NO ACTION")
        
            
            table.unique(['question_id', 'test_section_id']);
        })
    }
    
    down () {
        this.drop('test_section_questions')
    }
}

module.exports = TestSectionQuestionsSchema
