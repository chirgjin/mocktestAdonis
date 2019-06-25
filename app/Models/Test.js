'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")

class Test extends Model {
    static get hidden() {
        return ['options', 'created_by'];
    }

    static boot() {

        super.boot();

        this.addHook("beforeCreate", async test => {

            await test.loadMany(['exam', 'examSection']);

            const exam = test.getRelated('exam');
            const examSection = test.getRelated('examSection');

            const prefix = `${exam.code}-${examSection.code}-`;

            const last = (await Test
            .query()
            .where("name", "LIKE", `${prefix}%`)
            .orderBy("id", "DESC")
            .limit(1)
            .fetch())[0];
            
            let name = prefix;
            if(!last) {
                name += '1';
            }
            else {
                name += parseInt(last.name.replace(prefix, ''));
            }

            test.name = name;
        });
    }

    exam() {
        return this.belongsTo('App/Models/Exam');
    }

    examSection() {
        return this.belongsTo('App/Models/ExamSection');
    }


    createdBy() {
        return this.belongsTo('App/Models/User', 'created_by');
    }

    sections() {
        return this.hasMany('App/Models/TestSection');
    }
}

module.exports = Test
