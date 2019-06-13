'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class Image extends Model {

    static get hidden() {
        return ['id', 'type', 'reference_id'];
    }
    
    static get computed() {
        return ['url'];
    }

    getUrl({id}) {
        return '/image/' + id;
    }
}

module.exports = Image
