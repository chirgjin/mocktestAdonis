'use strict';

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */


const {User, Permission} = use("App/Models");
const { PermissionDeniedException } = use("App/Exceptions");
const validate = use("App/Helpers/validate");
const Database = use('Database');

/**
* Resourceful controller for interacting with permissions
*/
class PermissionController {
    
    /**
     * Create/save a new permission.
     * POST permissions
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async manage ({ params, request, response, auth }) {
        const me = auth.user;

        const user = await User.findOrFail(params.user_id);

        if(!me.canEditUser(user) || user.roles.indexOf("admin") == -1) {
            throw new PermissionDeniedException('You cannot assign permissions to this user');
        }

        const v = await validate(request.post(), {
            'permissions.*.model' : 'required|in:user,test,exam,examSection',
            'permissions.*.permission' : 'required|in:create,read,update,delete',
            'permissions.*.action' : 'required|in:add,remove',
            'permissions' : 'required|array',
            // 'permissions.*' : 'r'
        });

        if(v.fails()) {
            return response.error(v.messages());
        }

        const permissions = request.post().permissions;

        const transaction = await Database.beginTransaction();

        try {
            const add = [], del = [];

            await user.load('permissions'); //load existing permissions

            const userPermissions = user.getRelated('permissions').rows;
            const existingPermissions = (await Permission.query().fetch()).rows;

            for(let permission of permissions) {
                    
                const p = existingPermissions.filter(per => per.model_name == permission.model && per.action == permission.permission)[0];
                if(!p) {
                    //permission doesn't exist in db...
                    throw new Error('Permission ' + permission.model + '.' + permission.permission + ' Not found in db');
                }

                const exists = userPermissions.filter(per => per.id == p.id).length > 0;

                if(permission.action == 'add' && !exists) {
                    add.push(p.id);
                }
                else if(permission.action == 'remove' && exists) {
                    del.push(p.id);
                }
            }

            await user.permissions().attach(add, null, transaction);
            await user.permissions().detach(del, null, transaction);

            delete user.$relations.permissions;
            await user.load('permissions');
            
            await transaction.commit();

            return response.success(user);
        }
        catch (e) {
            await transaction.rollback();

            throw e;
        }
    }
    
}

module.exports = PermissionController;
