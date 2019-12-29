'use strict';

/*
|--------------------------------------------------------------------------
| PermissionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const Permission = use("App/Models/Permission");

class PermissionSeeder {
    async run () {
        const models = ['exam', 'examSection', 'test', 'user'];
        const actions = ['create', 'read', 'update', 'delete'];

        const permissions = [];

        models.forEach(model => {
            actions.forEach(action => {
                permissions.push({
                    model_name : model,
                    action
                });
            });
        });

        for(let permission of permissions) {
            const ct = await Permission
                .query()
                .where('model_name', permission.model_name)
                .where('action', permission.action)
                .getCount();
            
            if(ct == 0) {
                await Permission.create(permission);
            }
        }

        // await Permission.createMany(permissions);
    }
}

module.exports = PermissionSeeder;
