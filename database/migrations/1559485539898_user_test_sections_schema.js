'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserTestSectionsSchema extends Schema {
    up () {
        this.create('user_test_sections', (table) => {
            table.increments()
            
            table.integer('user_test_id').unsigned().notNullable().references('id').inTable('user_tests')
            table.integer('test_section_id').unsigned().notNullable().references('id').inTable('test_sections')
        })
    }
    
    down () {
        this.drop('user_test_sections')
    }
}

module.exports = UserTestSectionsSchema
