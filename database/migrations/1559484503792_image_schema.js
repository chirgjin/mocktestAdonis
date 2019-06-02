'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ImageSchema extends Schema {
    up () {
        this.create('images', (table) => {
            table.increments()
            
            table.string('file_path').notNullable().unique()
            table.enu('type', ['question', 'questionDirection', 'questionOption', 'questionSolution', 'test']).notNullable()
            table.integer('reference_id').unsigned().notNullable()
            
            table.timestamps()
        })
    }
    
    down () {
        this.drop('images')
    }
}

module.exports = ImageSchema
