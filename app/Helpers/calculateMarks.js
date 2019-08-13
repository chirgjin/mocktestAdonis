function calculateOne(test, answer, incorrectStreak) {
    if(answer.answer === null) {
        return {
            marks:0,
            incorrectStreak
        } //no negative marks for unattempted questions
    }
    else if(answer.correct) {
        return {
            marks: test.marks,
            incorrectStreak
        }
    }
    else {
        incorrectStreak++
        return {
            marks:0,
            incorrectStreak
        }
    }
}


module.exports = function (test, answers) {
    let marks = 0;
    let incorrectStreak = 0;

    answers.forEach(answer => {
        const data = calculateOne(test, answer, incorrectStreak);
        marks += data.marks;
        incorrectStreak = data.incorrectStreak;
    })

    if(incorrectStreak < 1 || test.negative_marks < 1) {
        return marks;
    }


    marks -= Math.floor(incorrectStreak/test.negative_marks) * test.marks
    
    marks -= ( (incorrectStreak % test.negative_marks)/test.negative_marks ) * test.marks

    return marks.toFixed(2)

}