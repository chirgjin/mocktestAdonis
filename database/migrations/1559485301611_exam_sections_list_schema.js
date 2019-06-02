'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ExamSectionsListSchema extends Schema {
    up () {
        this.create('exam_section_list', (table) => {
            table.increments()
            
            table.integer('exam_id').unsigned().notNullable().references('id').inTable('exams')
            table.integer('exam_section_id').unsigned().notNullable().references('id').inTable('exam_sections')
        })
    }
    
    down () {
        this.drop('exam_sections_lists')
    }
}

module.exports = ExamSectionsListSchema
