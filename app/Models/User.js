'use strict'

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

/** @type {typeof import('./Model')} */
const Model = use("Model")

/** @type {typeof import('../Helpers/Permissions')} */
const Permissions = use("App/Helpers/Permissions");

class User extends Model {
    static boot () {
        super.boot()
        
        /**
        * A hook to hash the user password before saving
        * it to the database.
        */

        this.addHook('beforeSave', async (userInstance) => {

            if (userInstance.dirty.password) {
                
                userInstance.password = await Hash.make(userInstance.password)
            }
        })
    }

    static get hidden() {
        return ['active', 'isAdmin', 'isSuperAdmin', 'id', 'password', 'activation_token', 'reset_token', 'login_token'];
    }
    
    static get computed() {
        return ['active', 'isAdmin', 'isSuperAdmin', 'name'];
    }

    static get getters() {
        return ['roles'];
    }

    getActive({ email_verified }) {
        return !!email_verified;
    }

    getRoles(roles) {
        return roles.split(",");
    }

    getRole(roles=null) {
        
        return roles.split(",");
    }

    setRoles(roles) {
        return Array.isArray(roles) ? roles.filter(role => role == 'student' || role == 'admin' || role == 'superAdmin').join(",") : roles && roles.toString() || 'student';
    }

    addRole(role) {
        this.roles = this.rolelist.push(role);
    }

    removeRole(role) {
        this.roles = this.rolelist.filter(r => role == r);
    }

    getIsAdmin({roles}) {
        return roles.indexOf("admin") > -1;
    }

    getIsSuperAdmin({roles}) {
        return roles.indexOf("superAdmin") > -1;
    }

    getName({ firstname, lastname }) {
        return `${firstname||''} ${lastname||''}`.trim();
    }
    /*
    get name() {
        return this.getName(this.$attributes);
    }

    get isAdmin() {
        return this.getIsAdmin(this.$attributes);
    }

    get isSuperAdmin() {
        return this.getIsSuperAdmin(this.$attributes);
    }

    get rolelist() {
        // console.log(this, this.roles);
        return this.getRoles(this.$attributes.roles);
    }*/


    

    exams() {
        return this
        .belongsToMany('App/Models/Exam')
        // .pivotTable('user_exams')
        .pivotModel('App/Models/UserExam')
        // .pivotAttribute(false)
    }

    examSections() {
        return this
        .manyThrough('App/Models/UserExam', 'sections')
    }

    tests() {
        return this
        .manyThrough('App/Models/UserExam', 'tests');
    }

    userTests() {
        return this.hasMany('App/Models/UserTest')
    }

    examAnalysis() {
        return this.hasMany('App/Models/UserExamAnalysis')
    }

    answers() {
        //return this.manyThrough()
    }

    canEditUser(user) {
        return Permissions.canEditUser(this, user);
    }

    canAccessSettings() {
        return Permissions.canAccessSettings(this);
    }

}

module.exports = User
