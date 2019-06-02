'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserAnswerSchema extends Schema {
    up () {
        this.create('user_answers', (table) => {
            table.increments()

            table.integer('user_test_id').unsigned().notNullable().references('id').inTable('user_tests')
            table.integer('question_id').unsigned().notNullable().references('id').inTable('questions')

            table.integer('answer').defaultTo(null)
            table.float('time_taken').notNullable().defaultTo(0)
            table.boolean('correct').defaultTo(null)
            table.boolean('flagged').notNullable().defaultTo(false)

            table.timestamps()
        })
    }
    
    down () {
        this.drop('user_answers')
    }
}

module.exports = UserAnswerSchema
