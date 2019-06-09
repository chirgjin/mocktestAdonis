'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class QuestionSchema extends Schema {
    up () {
        this.create('questions', (table) => {
            table.increments()

            table.integer('direction_id').unsigned().references('id').inTable('question_directions').onDelete("CASCADE").onUpdate("NO ACTION")
            table.string('difficulty').notNullable().references('name').inTable('difficulties').onDelete("CASCADE").onUpdate("NO ACTION")

            table.text('description').notNullable()
            table.integer('type').notNullable()
            table.integer('answer').notNullable()
            table.float('avg_time', 6, 3).defaultTo(null)

            table.timestamps()
        })
    }
    
    down () {
        this.drop('questions')
    }
}

module.exports = QuestionSchema
