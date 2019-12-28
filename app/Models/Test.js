'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");
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

            const exam = await Exam.findOrFail(test.exam_id);
            const examSection = await ExamSection.findOrFail(test.exam_section_id);

            const prefix = `${exam.code}-${examSection.code}-`;

            const last = (await Test
                .query()
                .where("name", "LIKE", `${prefix}%`)
                .orderBy("id", "DESC")
                .limit(1)
                .fetch()).rows[0];
            
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
            .manyThrough('App/Models/TestSection', 'questions');
    }

    userTests() {
        return this.hasMany('App/Models/UserTest');
    }

    getStyle(marks) {

        if(typeof marks == 'object') {
            return undefined;
        }

        let { slab_good, slab_fail } = this.$attributes;

        marks = parseFloat(marks);

        slab_good = parseFloat(slab_good);
        slab_fail = parseFloat(slab_fail);

        if(slab_fail && marks <= slab_fail) {
            return {
                font : {
                    color : "white"
                },
                fill : {
                    type : "pattern",
                    patternType: 'solid',
                    bgColor : "#ef5350",
                    fgColor : "#ef5350",
                }
            };
        }
        else if(slab_good && marks >= slab_good) {
            return {
                font : {
                    color : "white"
                },
                fill : {
                    type : "pattern",
                    patternType: 'solid',
                    bgColor : "#66bb6a",
                    fgColor : "#66bb6a"
                }
            };
        }
        else if(slab_fail && slab_good) {
            return {
                font : {
                    color : "white"
                },
                // fillColor : "#fb8c00"
                fill : {
                    type : "pattern",
                    patternType: 'solid',
                    bgColor : "#fb8c00",
                    fgColor : "#fb8c00"
                }
            };
        }

        return null;
    }
}

module.exports = Test;
