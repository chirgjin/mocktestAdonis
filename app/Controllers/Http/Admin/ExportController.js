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

        const q = User.query();

        if(request.input("user_id")) {
            q.where("id", request.input("user_id"))
        }

        if(request.input('with_tests')) {
            q.with('userTests', builder => {

                if(request.input("completed_tests_only")) {
                    builder
                    .where("status", UserTest.COMPLETED)
                }

                if(Array.isArray(request.input("test_id"))) {
                    builder
                    .whereIn("test_id", request.input("test_id"))
                }
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
                // builder.whereIn('user_id', users.map(user => user.id))
                const ids = []
                users.forEach(user => {
                    user.getRelated('userTests').rows.forEach(test => {
                        if(ids.indexOf(test.test_id) == -1) {
                            ids.push(test.test_id)
                        }
                    })
                })

                builder.whereIn('test_id', ids)
            })
            .fetch()

            tests.rows.forEach( (test,i) => {
                testIndex[test.id] = {
                    index : i,
                    name : test.name,
                    test : test
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

                if(request.input("completed_tests_only") || Array.isArray(request.input("test_id"))) {
                    if(tests.length < 1) {
                        continue
                    }
                }

                for(let j=0;j<tests.length;j++) {
                    const test = tests[j]

                    const stats = await analysis(test)

                    stats.marks_obtained = test.marks_obtained
                    stats.name = testIndex[test.test_id].name
                    stats.status = test.status
                    
                    const offset = testIndex[test.test_id].index * testKeys.length
                    
                    const style = testIndex[test.test_id].test.getStyle(test.marks_obtained)

                    if(style) {
                        ws
                        .cell(i+2, keys.length+offset+1, i+2, keys.length+offset+testKeys.length)
                        .style(style)
                    }

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
