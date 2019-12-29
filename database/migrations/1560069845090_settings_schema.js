'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class SettingsSchema extends Schema {
    up () {
        this.create('settings', (table) => {
            // table.increments();
            table.enu('id', [1]).primary().defaultTo(1);
            table.string('name', 150);
            table.string('image', 200);
            table.integer('max_users').defaultTo(100);
            table.timestamp('active_from').defaultTo(null);
            table.timestamp('active_to').defaultTo(null);
            table.timestamps();
        });
    }
    
    down () {
        this.drop('settings');
    }
}

module.exports = SettingsSchema;
