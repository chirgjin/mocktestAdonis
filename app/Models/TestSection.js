'use strict';

/** @type {typeof import('./Model')} */
const Model = use("Model");

class TestSection extends Model {

    static boot() {
        super.boot();

        this.addHook("beforeDelete", async testSection => {

            // const Question = use("App/Models/Question");

            testSection._deleteQuestions = [];

            const TestSectionQuestion = use("App/Models/TestSectionQuestion");

            // for each question check if it is associated with another section or only this one
            const associatedIds = await TestSectionQuestion
                .query()
                .where('test_section_id', testSection.id)
                .groupBy('question_id')
                .having('associated_sections', '<', 2)
                .select('question_id')
                .count('* as associated_sections');

            for(let {question_id, associated_sections} of associatedIds) {
                if(associated_sections < 2) {
                    testSection._deleteQuestions.push(question_id);
                }
            }

        });

        this.addHook('afterDelete', async testSection => {

            if(Array.isArray(testSection._deleteQuestions)) {
                const Question = use("App/Models/Question");

                await Question.deleteMany(testSection._deleteQuestions);

            }
        });
    }

    static scopeOrderByNum(query) {
        return query.orderBy('number', 'ASC');
    }
    
    static get hidden() {
        return [];
    }

    static get computed() {
        return ['isLocked'];
    }

    test() {
        return this.belongsTo("App/Models/Test");
    }

    exams() {
        return this
            .manyThrough('App/Models/Test', 'exam', 'test_id', 'id');
    }

    questions() {
        return this
            .belongsToMany("App/Models/Question")
            .pivotTable('test_section_questions');
    }

    answers() {
        return this
            .manyThrough('App/Models/TestSectionQuestion', 'answers');
    }

    getIsLocked({duration}) {
        duration = parseFloat(duration);
        return !!(duration && duration > 0);
    }
}

module.exports = TestSection;
