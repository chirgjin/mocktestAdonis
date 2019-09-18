'use strict'
/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Setting = use("App/Models/Setting")
class SettingValidator {
  /**
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Function} next
   */
  async handle ({ request, auth, response }, next) {
    //check settings
    const setting = await Setting.query().first();
    if(setting && auth.user && !auth.user.isAdmin && !auth.user.isSuperAdmin) {
        
        if(setting.active_to > new Date || setting.active_from < new Date) {
            return response.error({'setting' : 'Whitelabel node closed'}, 503)
        }
    }
    
    await next()
  }
}

module.exports = SettingValidator
