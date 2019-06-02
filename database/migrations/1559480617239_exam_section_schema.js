'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ExamSectionSchema extends Schema {
    up () {
        this.create('exam_sections', (table) => {
            table.increments()

            table.string('name', 50).notNullable().unique()
            table.string('code', 25).notNullable().unique()
            
            table.timestamps()
        })
    }
    
    down () {
        this.drop('exam_sections')
    }
}

module.exports = ExamSectionSchema
