const {User, Permission} = use("App/Models")

module.exports = {
    canEditUser: (sourceUser, targetUser) => {
        if(sourceUser.roles.indexOf("superAdmin") != -1) {
            return true;
        }
        else if(sourceUser.roles.indexOf("admin") != -1) {
            return targetUser.roles.indexOf("superAdmin") == -1;
        }
        else return false;
    },

    canAccessSettings: user => {
        return user.roles.indexOf("superAdmin") != -1;
    },

    canPerformAction : async (user, model, action) => {
        // console.log(this);

        if(user.roles.indexOf('superAdmin') > -1) {
            return true;
        }
        else if(user.roles.indexOf('admin') == -1) {
            return false; //students can't perform actions
        }

        //user is an admin
        const permission = await user
        .permissions()
        // .where('user_id', user.)
        .where('permissions.model_name', model)
        .where('permissions.action', action)
        .getCount()

        // console.log(permission)
        return permission > 0
    }
}