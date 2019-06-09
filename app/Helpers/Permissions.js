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
}