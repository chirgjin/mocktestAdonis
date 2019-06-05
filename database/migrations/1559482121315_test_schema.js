'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TestSchema extends Schema {
    up () {
        this.create('tests', (table) => {
            table.increments()

            table.integer('exam_id').unsigned().notNullable().references('id').inTable('exams');
            table.integer('exam_section_id').unsigned().notNullable().references('id').inTable('exam_sections');
            table.string('difficulty').notNullable().references('name').inTable('difficulties')

            table.string('name', 50).notNullable().unique()
            table.string('description', 255).notNullable()
            table.text('instructions').notNullable()
            table.integer('negative_marks').notNullable().defaultTo(0)
            table.integer('duration').notNullable()
            table.boolean('enabled').notNullable().defaultTo(true)
            table.boolean('review_enabled').notNullable().defaultTo(true)
            table.integer('marks').notNullable().defaultTo(1)
            table.integer('options').notNullable().defaultTo(4)
            table.integer('created_by').unsigned().references('id').inTable('users')

            table.timestamps()
        })
    }
    
    down () {
        this.drop('tests')
    }
}

module.exports = TestSchema
