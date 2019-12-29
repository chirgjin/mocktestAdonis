'use strict';

const { Command } = require('@adonisjs/ace');
const Database = use('Database');

class Test extends Command {
    static get signature () {
        return 'test';
    }

    static get description () {
        return 'Tell something helpful about this command';
    }

    async handle (args, options) {
        
        console.log("WUT WUT");

        // const txn = await Database.beginTransaction();
        // const txn = 1;
        const {Question, QuestionOption, QuestionSolution, TestSection } = use("App/Models");

        // console.log("WUT");

        // const q = await Question.query().transacting(txn).where('id', 3).first();

        // console.log(q.toJSON());

        // await q.delete(txn);

        // const opts = await QuestionOption.query().transacting(txn).where('question_id', q.id).fetch();
        // const soln = await QuestionSolution.query().transacting(txn).where('question_id', q.id).first();

        // console.log(opts.rows.length);

        const ts = await TestSection.query().with('questions', builder => {
            // builder.transacting(txn);
        }).first();

        // console.log(ts.toJSON());

        await ts.delete();

        // await txn.rollback();

        await Database.close();
    }
}

module.exports = Test;
