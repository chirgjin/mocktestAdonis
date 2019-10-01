'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PermissionsSchema extends Schema {
    up () {
        this.create('permissions', (table) => {
            table.increments()
            table.string('model_name')
            table.string('action') //edit,create,delete,view
            // table.boolean('default_provided')

            table.timestamps()
        })
    }
    
    down () {
        this.drop('permissions')
    }
}

module.exports = PermissionsSchema
