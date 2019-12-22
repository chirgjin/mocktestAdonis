'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TestAddSlabsSchema extends Schema {
    up () {
        this.table('tests', (table) => {
            // alter table

            table.float("slab_good", 7, 3).defaultTo(null)
            table.float("slab_fail", 7, 3).defaultTo(null)

        })
    }
    
    down () {
        this.table('test_add_slabs', (table) => {
            // reverse alternations

            table.dropColumns(['slab_good', 'slab_fail'])
        })
    }
}

module.exports = TestAddSlabsSchema
