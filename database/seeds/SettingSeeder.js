'use strict';

/*
|--------------------------------------------------------------------------
| SettingSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
// const Factory = use('Factory');
const Setting = use("App/Models/Setting");
const Config = use("Config");
class SettingSeeder {
    async run () {

        if(await Setting.first()) {
            return console.log("Setting already exists");
        }

        await Setting.create({
            name : Config.get("app.name"),
            image : "images/logo.jpg",
        });
    }
}

module.exports = SettingSeeder;
