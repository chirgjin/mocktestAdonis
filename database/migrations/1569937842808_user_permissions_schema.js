'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserPermissionsSchema extends Schema {
    up () {
        this.create('user_permissions', (table) => {
            table.increments()
            // table.timestamps()
            table.integer('user_id').unsigned().notNullable().references('id').inTable('users').onDelete("CASCADE").onUpdate("NO ACTION")
            table.integer('permission_id').unsigned().notNullable().references('id').inTable('permissions').onDelete("CASCADE").onUpdate("NO ACTION")

            table.unique(['user_id', 'permission_id'])
        })
    }
    
    down () {
        this.drop('user_permissions')
    }
}

module.exports = UserPermissionsSchema
