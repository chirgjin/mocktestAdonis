'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TestSectionSchema extends Schema {
    up () {
        this.create('test_sections', (table) => {
            table.increments()

            table.integer('test_id').unsigned().notNullable().references('id').inTable('tests')

            table.string('name', 50).notNullable()
            table.integer('number').notNullable()
            table.integer('duration').defaultTo(null)
            
            table.timestamps()
        })
    }
    
    down () {
        this.drop('test_sections')
    }
}

module.exports = TestSectionSchema
