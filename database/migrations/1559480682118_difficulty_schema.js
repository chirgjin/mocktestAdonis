'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class DifficultySchema extends Schema {
    up () {
        this.create('difficulties', (table) => {
            table.string('name', 50).notNullable().primary();
        });
    }
    
    down () {
        this.drop('difficulties');
    }
}

module.exports = DifficultySchema;
