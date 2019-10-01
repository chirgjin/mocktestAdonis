'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
    up () {
        this.table('users', (table) => {
            // alter table

            table.string('rollnum')
            table.string('branch')
            table.string('degree')
            table.string('section')
            table.integer('batch')
        })
    }
    
    down () {
        this.table('users', (table) => {
            // reverse alternations

            table.dropColumns(['rollnum', 'branch', 'degree', 'section', 'batch'])
        })
    }
}

module.exports = UserSchema
