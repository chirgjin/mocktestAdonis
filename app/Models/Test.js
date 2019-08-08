'use strict'

/** @type {typeof import('./Model')} */
const Model = use("Model")
/** @type {typeof import('./Exam')} */
const Exam = use("App/Models/Exam");
const ExamSection = use("App/Models/ExamSection");

class Test extends Model {
    static get hidden() {
        return ['options', 'created_by'];
    }

    static boot() {

        super.boot();

        this.addHook("beforeCreate", async test => {

            const exam = await Exam.findOrFail(test.exam_id)
            const examSection = await ExamSection.findOrFail(test.exam_section_id);

            const prefix = `${exam.code}-${examSection.code}-`;

            const last = (await Test
            .query()
            .where("name", "LIKE", `${prefix}%`)
            .orderBy("id", "DESC")
            .limit(1)
            .fetch()).rows[0];

            console.log(last);
            
            let name = prefix;
            if(!last) {
                name += '1';
            }
            else {
                name += parseInt(last.name.replace(prefix, '')) + 1;
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

    questions() {
        return this
        .manyThrough('App/Models/TestSection', 'questions')
    }
}

module.exports = Test
