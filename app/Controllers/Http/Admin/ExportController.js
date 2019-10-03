'use strict'

const {Test, TestSection, Exam, Difficulty, UserTest} = use("App/Models");
const {NotFoundException, PermissionDeniedException} = use("App/Exceptions");
const xl = require("excel4node");
const User = use("App/Models/User")
const analysis = use("App/Helpers/analysis")

const sendWB = async (wb, fileName, response) => {
    const buff = await wb.writeToBuffer()

    if(!fileName.match(/\.xlsx$/i)) {
        fileName += ".xlsx";
    }
    
    response.header('Content-Disposition', 'attachment; filename="' + encodeURIComponent(fileName) + '"; filename*=utf-8\'\'' + encodeURIComponent(fileName) + ';')
    response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    // response.header('Content-Length', buff)

    response.send(buff)
}


class ExportController {

    async users({ request, response, auth }) {
        // if(!await auth.user.canPerformAction('user', 'read')) {
        //     throw new PermissionDeniedException();
        // }

        //
        const wb = new xl.Workbook({
            // author : "MockTestIndia",
        })

        const ws = wb.addWorksheet("Users")

        // console.log(User)
        // console.log(use("App/Models"))

        const q = User.query();

        if(request.input("user_id")) {
            q.where("id", request.input("user_id"))
        }

        if(request.input('with_tests')) {
            q.with('userTests', builder => {
                // builder
                // .with('test', builder => {
                //     builder
                //     .with('exam')
                //     .with('examSection')
                // })
                // .where('status', UserTest.COMPLETED)
            })
        }

        const users = (await q.fetch()).rows

        const keys = [ 'id', 'firstname', 'lastname', 'email', 'username', 'mobile_number', 'college', 'rollnum', 'branch', 'degree', 'section', 'batch', 'created_at']
        
        keys.forEach( (key, i) => {
            ws
            .cell(1, i+1)
            .string(key)
        })

        let testIndex = {}

        const testKeys = ['name', 'marks_obtained', 'answers.incorrect', 'answers.correct', 'answers.unattempted', 'total_time']

        if(request.input('with_tests')) {
            //get list of tests first
            const tests = await Test.query()
            .whereHas('userTests', builder => {
                builder.whereIn('user_id', users.map(user => user.id))
            })
            .fetch()

            tests.rows.forEach( (test,i) => {
                testIndex[test.id] = {
                    index : i,
                    name : test.name
                }

                testKeys.forEach( (key, j) => {
                    let offset = (i * testKeys.length) + j

                    ws
                    .cell(1, keys.length+1+offset)
                    .string(key)
                });
            })

        }
        for(let i=0;i<users.length;i++) {
            const user = users[i];

            ws.addFromKeys(user, keys, { rowOff: i+1})

            if(request.input('with_tests')) {
                const tests = user.getRelated('userTests').rows;

                for(let j=0;j<tests.length;j++) {
                    const test = tests[j]

                    const stats = await analysis(test)

                    stats.marks_obtained = test.marks_obtained
                    stats.name = testIndex[test.test_id].name
                    
                    const offset = testIndex[test.test_id].index * testKeys.length
                    
                    // ws
                    // .cell(i+2, keys.length + testIndex[test.test_id] + 1)
                    // .number(test.marks_obtained || 0)

                    ws
                    .addFromKeys(stats, testKeys, {
                        rowOff : i+1,
                        colOff : keys.length + offset
                    })
                }

            }
        }

        // const buff = await wb.writeToBuffer()
        // await sendWB(wb, 'users', response)
        await wb.send('users', response) 
    }
}

module.exports = ExportController
